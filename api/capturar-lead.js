/*
 * API/Backend de Teste Final - Energia Flex
 * Objetivo: Isolar o problema tentando apenas ler o título da planilha.
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
    }

    console.log('Iniciando teste de conexão com Google Sheets...');

    try {
        const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
        const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS;

        if (!SPREADSHEET_ID || !GOOGLE_CREDENTIALS_JSON) {
            console.error('ERRO: Variáveis de ambiente não encontradas.');
            return res.status(500).json({ message: 'Erro de configuração no servidor.' });
        }
        
        const creds = JSON.parse(GOOGLE_CREDENTIALS_JSON);
        console.log('Credenciais carregadas. Email da conta de serviço:', creds.client_email);

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        
        console.log('Autenticando...');
        await doc.useServiceAccountAuth(creds);
        
        console.log('Carregando informações do documento...');
        await doc.loadInfo(); 
        console.log('Informações carregadas com sucesso!');

        // Se chegarmos até aqui, a conexão FUNCIONOU.
        const sheetTitle = doc.title;
        console.log('SUCESSO! Título da planilha:', sheetTitle);

        // Retorna o título para o frontend.
        return res.status(200).json({ 
            message: 'Conexão com a planilha bem-sucedida!',
            title: sheetTitle 
        });

    } catch (error) {
        // Se houver um erro, esta é a nossa resposta definitiva.
        console.error('### ERRO DEFINITIVO NA CONEXÃO ###');
        console.error(error);
        return res.status(500).json({ 
            message: 'Falha ao conectar com a API do Google.',
            errorCode: error.code,
            errorMessage: error.message
        });
    }
};
