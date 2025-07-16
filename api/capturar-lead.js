/*
 * API/Backend de Teste Final - Energia Flex
 * Objetivo: Isolar o problema tentando apenas ler o título da planilha.
 * Versão com nova autenticação (JWT)
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library'); // Importa a nova biblioteca de autenticação

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
    }

    console.log('Iniciando teste de conexão com Google Sheets (v2)...');

    try {
        const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
        const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS;

        if (!SPREADSHEET_ID || !GOOGLE_CREDENTIALS_JSON) {
            console.error('ERRO: Variáveis de ambiente não encontradas.');
            return res.status(500).json({ message: 'Erro de configuração no servidor.' });
        }
        
        const creds = JSON.parse(GOOGLE_CREDENTIALS_JSON);
        
        // --- CORREÇÃO PRINCIPAL: Configura a autenticação usando JWT ---
        const serviceAccountAuth = new JWT({
          email: creds.client_email,
          // A chave privada precisa ter as quebras de linha corrigidas
          key: creds.private_key.replace(/\\n/g, '\n'), 
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // Passa o objeto de autenticação diretamente ao criar a instância da planilha
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        
        console.log('Carregando informações do documento...');
        await doc.loadInfo(); 
        console.log('Informações carregadas com sucesso!');

        const sheetTitle = doc.title;
        console.log('SUCESSO! Título da planilha:', sheetTitle);

        return res.status(200).json({ 
            message: 'Conexão com a planilha bem-sucedida!',
            title: sheetTitle 
        });

    } catch (error) {
        console.error('### ERRO DEFINITIVO NA CONEXÃO ###');
        console.error(error);
        return res.status(500).json({ 
            message: 'Falha ao conectar com a API do Google.',
            errorCode: error.code,
            errorMessage: error.message,
            errorDetails: error.toString()
        });
    }
};
