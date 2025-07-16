/*
 * API/Backend para Captura de Leads - Energia Flex (MVP)
 * ---------------------------------------------------------
 * Instruções:
 * 1. Este código é uma "serverless function", ideal para hospedar em plataformas como Vercel ou Netlify.
 * 2. Ele cria um endpoint (ex: /api/capturar-lead) que recebe os dados do formulário da landing page.
 * 3. Para este MVP, a sugestão é salvar os leads em uma Planilha Google. É rápido, visual e sem custo.
 * 4. Você precisará configurar a API do Google Sheets e obter as credenciais.
 *
 * Pré-requisitos:
 * - Instalar a biblioteca do Google Sheets: `npm install google-spreadsheet`
 * - Ter um arquivo `credentials.json` do seu projeto Google Cloud.
 * - Compartilhar sua planilha com o e-mail de serviço criado no Google Cloud.
 */

// Importa a biblioteca para interagir com o Google Sheets
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Carrega as credenciais de forma segura (não exponha no código)
// Em produção, use variáveis de ambiente (process.env)
//const creds = require('./credentials.json'); // Arquivo de credenciais do Google
//const SPREADSHEET_ID = '1qoJdK_kMKx6b23EtKt8q5Dhum-pgZMfQaiSJHuErC4I'; // Coloque o ID da sua planilha aqui
const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Função principal da API
// Em um ambiente serverless (Vercel/Netlify), este handler processa a requisição.
export default async function handler(req, res) {
    // Permite que apenas o método POST seja usado
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Apenas o método POST é permitido.' });
    }

    try {
        // 1. Pega os dados enviados do formulário no frontend
        const { cep, consumo, tipo_cliente, email } = req.body;

        // Validação simples dos dados
        if (!cep || !consumo || !tipo_cliente || !email) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        // 2. Conecta com a Planilha Google
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // Carrega as informações da planilha

        // Pega a primeira aba/página da planilha
        const sheet = doc.sheetsByIndex[0]; 

        // 3. Adiciona uma nova linha com os dados do lead
        await sheet.addRow({
            'Data': new Date().toLocaleString('pt-BR'),
            'Email': email,
            'CEP': cep,
            'Consumo (kWh)': consumo,
            'Tipo de Cliente': tipo_cliente,
            'Status': 'Novo'
        });

        // 4. Retorna uma resposta de sucesso para o frontend
        return res.status(200).json({ message: 'Lead cadastrado com sucesso!' });

    } catch (error) {
        // Em caso de erro, loga no console e retorna uma mensagem de erro
        console.error('Erro ao salvar na planilha:', error);
        return res.status(500).json({ message: 'Ocorreu um erro ao processar sua solicitação.' });
    }
}

/*
 * Como conectar com o Frontend (a landing page):
 * -----------------------------------------------
 * No script da sua landing page, modifique o evento de 'submit' do formulário:
 * * simulationForm.addEventListener('submit', async (e) => {
 * e.preventDefault();
 * * const formData = new FormData(simulationForm);
 * const data = Object.fromEntries(formData.entries());
 * * try {
 * const response = await fetch('/api/capturar-lead', { // URL da sua API
 * method: 'POST',
 * headers: { 'Content-Type': 'application/json' },
 * body: JSON.stringify(data)
 * });
 * * if (response.ok) {
 * // Se a API retornou sucesso, mostra a mensagem de confirmação
 * formContainer.classList.add('hidden');
 * confirmationMessage.classList.remove('hidden');
 * } else {
 * // Trata possíveis erros da API
 * alert('Houve um erro ao enviar seus dados. Tente novamente.');
 * }
 * } catch (error) {
 * console.error('Erro de conexão:', error);
 * alert('Não foi possível conectar ao servidor. Verifique sua internet.');
 * }
 * });
 */
