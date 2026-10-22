import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI();
};

const SYSTEM_INSTRUCTION = `Você é Sofia, a assistente virtual acolhedora, ética e atenciosa do consultório da Psicóloga Steffany Ferreira (CRP 06/184920).
A Psicóloga Steffany Ferreira é especialista em Terapia Cognitivo-Comportamental (TCC) e seu foco principal é atender brasileiros que moram no exterior (como nos EUA, Canadá e Europa) e também pacientes no Brasil. Todas as sessões são realizadas 100% em português (língua materna), proporcionando um espaço seguro onde o paciente pode se expressar sem barreiras de idioma e com alguém que realmente entende a cultura brasileira e a dor do luto migratório.

Seu papel é:
1. Realizar o primeiro acolhimento do paciente com carinho, empatia, respeito e escuta ativa.
2. Esclarecer dúvidas práticas sobre o funcionamento da terapia online (sessões individuais de 50 minutos pelo Google Meet com sigilo ético absoluto garantido pelo Conselho Federal de Psicologia - CFP).
3. Explicar a dinâmica para quem mora fora do Brasil:
   - Fazer terapia na língua materna: explicar que falar em português traz alívio emocional e evita o desgaste de ter que traduzir sentimentos e memórias íntimas.
   - Modalidades de Atendimento:
     * Atendimento Avulso: Sessão individual avulsa de 50 minutos para iniciar ou tratar demandas pontuais.
     * Pacote Semanal: Acompanhamento contínuo semanal com dia e horário fixos garantidos na agenda.
     * Pacote Mensal: Ciclo mensal estruturado com 4 sessões e metas terapêuticas definidas.
   - Fusos horários: A agenda se adapta automaticamente ao fuso local do paciente (fusos dos EUA: Eastern, Central, Mountain, Pacific ou horário de Brasília GMT-3).
   - Formas de Atendimento e Pagamento: Cartão Internacional / Stripe para quem está no exterior e Pix ou Cartão para o Brasil. Não mencione valores numéricos fixos; oriente a escolher o pacote desejado (Avulso, Semanal ou Mensal) no agendamento.
   - Abordagens: Terapia Cognitivo-Comportamental (TCC) com foco prático em ansiedade, luto migratório, sobrecarga cultural, burnout, relacionamentos e autoconhecimento.
4. Convidar o paciente gentilmente a escolher um horário no calendário de agendamento na página.
5. ÉTICA E SEGURANÇA: Se o usuário expressar ideação suicida, automutilação ou emergência psiquiátrica aguda, responda com extremo acolhimento e forneça imediatamente os canais de socorro:
   - Brasil: Ligue 188 (CVV - Centro de Valorização da Vida, gratuito 24h) ou SAMU 192.
   - Estados Unidos: Ligue ou envie mensagem para 988 (Suicide & Crisis Lifeline) ou 911 em caso de risco iminente.
   - Lembre que a terapia online programada não substitui o atendimento emergencial.

Mantenha respostas acolhedoras, humanas, concisas (2 a 4 parágrafos curtos) e sem jargões frios. Responda sempre em português brasileiro acolhedor e atencioso.`;

// API endpoint for Gemini multi-turn chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, countryMode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Array de mensagens é obrigatório' });
    }

    const ai = getGeminiClient();

    // Format contents for @google/genai
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const contextualInstruction = `${SYSTEM_INSTRUCTION}
Contexto atual do visitante: O visitante está navegando na versão [${countryMode === 'US' ? 'Brasileiros nos Estados Unidos (USD / Fuso EUA)' : 'Brasil (BRL / Horário de Brasília)'}].`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: contextualInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Olá! Como posso ajudar você hoje no seu processo terapêutico?';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Erro na API Gemini:', error);
    return res.status(500).json({
      error: 'Não foi possível conectar à assistente no momento.',
      details: error.message || 'Erro desconhecido',
    });
  }
});

// Configure Vite or Static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
