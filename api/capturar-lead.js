/*
 * API/Backend de Teste de Configuração - Energia Flex
 * Objetivo: Verificar se as variáveis de ambiente estão sendo lidas corretamente.
 */

// Usamos o formato CommonJS para máxima compatibilidade.
module.exports = async (req, res) => {
    // Garante que a resposta sempre será JSON.
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
    }

    try {
        const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
        const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS;

        // Monta um objeto de diagnóstico
        const diagnostics = {
            spreadsheetIdExists: !!SPREADSHEET_ID,
            spreadsheetIdLength: SPREADSHEET_ID ? SPREADSHEET_ID.length : 0,
            credentialsExist: !!GOOGLE_CREDENTIALS_JSON,
            credentialsAreValidJSON: false,
            serviceAccountEmail: null
        };

        // Tenta verificar se as credenciais são um JSON válido
        if (diagnostics.credentialsExist) {
            try {
                const creds = JSON.parse(GOOGLE_CREDENTIALS_JSON);
                diagnostics.credentialsAreValidJSON = true;
                diagnostics.serviceAccountEmail = creds.client_email || 'Email não encontrado no JSON';
            } catch (e) {
                diagnostics.credentialsAreValidJSON = false;
            }
        }
        
        // Retorna o diagnóstico com sucesso.
        // Se chegarmos aqui, o servidor não está mais crashando.
        return res.status(200).json({
            message: 'Teste de diagnóstico concluído.',
            diagnostics: diagnostics
        });

    } catch (error) {
        // Se mesmo este código simples falhar, o erro é muito fundamental.
        console.error('ERRO NO TESTE DE DIAGNÓSTICO:', error);
        return res.status(500).json({ 
            message: 'Ocorreu um erro grave durante o diagnóstico.',
            error: error.message 
        });
    }
};
