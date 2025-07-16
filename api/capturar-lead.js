/*
 * API/Backend para Captura de Leads - Energia Flex (MVP)
 * Versão Final e Funcional com Autenticação JWT
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
    }

    try {
        const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
        const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS;

        if (!SPREADSHEET_ID || !GOOGLE_CREDENTIALS_JSON) {
            console.error('ERRO: Variáveis de ambiente não encontradas.');
            return res.status(500).json({ message: 'Erro de configuração no servidor.' });
        }
        
        const creds = JSON.parse(GOOGLE_CREDENTIALS_JSON);
        
        // Configura a autenticação usando o método JWT moderno
        const serviceAccountAuth = new JWT({
          email: creds.client_email,
          key: creds.private_key.replace(/\\n/g, '\n'), // Corrige as quebras de linha da chave
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // Passa o objeto de autenticação diretamente ao criar a instância da planilha
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        
        // Carrega as informações do documento (autentica e busca metadados)
        await doc.loadInfo(); 
        const sheet = doc.sheetsByIndex[0]; // Pega a primeira aba

        // Pega os dados do formulário
        const { cep, consumo, tipo_cliente, email } = req.body;

        if (!cep || !consumo || !tipo_cliente || !email) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // Adiciona a nova linha na planilha
        await sheet.addRow({
            'Data': new Date().toLocaleString('pt-BR'),
            'Email': email,
            'CEP': cep,
            'Consumo (kWh)': consumo,
            'Tipo de Cliente': tipo_cliente,
            'Status': 'Novo'
        });

        // Retorna sucesso
        return res.status(200).json({ message: 'Lead cadastrado com sucesso!' });

    } catch (error) {
        // Captura qualquer erro que acontecer durante o processo
        console.error('### ERRO DEFINITIVO ###');
        console.error(error);
        return res.status(500).json({ 
            message: 'Falha ao processar a solicitação.',
            errorDetails: error.toString()
        });
    }
};
