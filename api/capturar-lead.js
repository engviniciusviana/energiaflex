/*
 * API/Backend para Captura de Leads - Energia Flex (MVP)
 * Versão Corrigida
 */

// Importa a biblioteca para interagir com o Google Sheets
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Função principal da API
export default async function handler(req, res) {
    // Permite que apenas o método POST seja usado
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
    }

    try {
        // --- CORREÇÃO INICIA AQUI ---

        // 1. Carrega as credenciais e o ID da planilha a partir das Variáveis de Ambiente da Vercel.
        // Isso garante que suas chaves secretas não fiquem expostas no código.
        const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
        const GOOGLE_CREDENTIALS_JSON = process.env.GOOGLE_CREDENTIALS;

        // Verificação para garantir que as variáveis de ambiente foram configuradas na Vercel
        if (!SPREADSHEET_ID || !GOOGLE_CREDENTIALS_JSON) {
            console.error('Variáveis de ambiente SPREADSHEET_ID ou GOOGLE_CREDENTIALS não foram definidas na Vercel.');
            return res.status(500).json({ message: 'Erro de configuração no servidor.' });
        }
        
        const creds = JSON.parse(GOOGLE_CREDENTIALS_JSON);

        // --- FIM DA CORREÇÃO ---


        // 2. Pega os dados enviados do formulário no frontend
        const { cep, consumo, tipo_cliente, email } = req.body;

        // Validação simples dos dados
        if (!cep || !consumo || !tipo_cliente || !email) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // 3. Conecta com a Planilha Google
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // Carrega as informações da planilha

        // Pega a primeira aba/página da planilha
        const sheet = doc.sheetsByIndex[0];

        // 4. Adiciona uma nova linha com os dados do lead
        await sheet.addRow({
            'Data': new Date().toLocaleString('pt-BR'),
            'Email': email,
            'CEP': cep,
            'Consumo (kWh)': consumo,
            'Tipo de Cliente': tipo_cliente,
            'Status': 'Novo'
        });

        // 5. Retorna uma resposta de sucesso para o frontend
        return res.status(200).json({ message: 'Lead cadastrado com sucesso!' });

    } catch (error) {
        // Em caso de erro, loga no console e retorna uma mensagem de erro
        console.error('ERRO DETALHADO:', error);
        return res.status(500).json({ message: 'Ocorreu um erro ao processar sua solicitação.' });
    }
}
