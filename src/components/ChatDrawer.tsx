import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Calendar,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Globe2,
} from 'lucide-react';
import { ChatMessage, CountryMode } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  countryMode: CountryMode;
  onOpenBooking: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  countryMode,
  onOpenBooking,
}) => {
  const isUS = countryMode === 'US';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: isUS
        ? 'Olá! Seja muito bem-vindo(a). Eu sou a Sofia, assistente de acolhimento da Psicóloga Steffany Ferreira (CRP 06/184920).\n\nSe você é brasileiro(a) e está vivendo no exterior, sei o quanto a distância da família, a cobrança no trabalho e o luto migratório podem pesar. Aqui você pode falar livremente em português, na sua língua materna e sem filtros. Como posso te apoiar hoje? Tire suas dúvidas sobre os formatos de atendimento (avulso, semanal ou mensal), fusos horários ou me conte o que você está sentindo.'
        : 'Olá! Seja muito bem-vindo(a). Eu sou a Sofia, assistente de acolhimento da Psicóloga Steffany Ferreira (CRP 06/184920).\n\nEstou aqui para te ouvir com empatia, tirar dúvidas sobre como funciona a psicoterapia online (TCC), os formatos de atendimento (avulso, semanal e mensal) e te ajudar a encontrar o melhor caminho para cuidar da sua saúde emocional. O que te trouxe até aqui hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickQuestions = isUS
    ? [
        'Por que fazer terapia em português morando no exterior?',
        'Como funciona a sincronização com meu fuso horário?',
        'Como funcionam os formatos avulso, semanal e mensal?',
        'O que é o luto migratório e como a TCC ajuda?',
      ]
    : [
        'Como funciona a psicoterapia online pelo Google Meet?',
        'Como funcionam os formatos avulso, semanal e mensal?',
        'O que é a abordagem TCC e como ela funciona?',
        'Quero agendar meu primeiro horário!',
      ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          countryMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao obter resposta da assistente.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Estou aqui para te ouvir. Como posso ajudar ainda mais?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg('Não foi possível obter resposta no momento. Você também pode falar no WhatsApp ou agendar diretamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FBF9F5] h-full shadow-2xl flex flex-col border-l border-stone-200 text-left">
        {/* Chat Drawer Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                S
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 text-base leading-none">
                  Sofia • Acolhimento & Triagem
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  IA Gemini
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Assistente Virtual da Psicóloga Steffany Ferreira (CRP 06/184920)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency disclaimer banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200/70 text-[11px] text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            {isUS
              ? 'Em crises agudas de saúde mental nos EUA: ligue ou envie SMS para 988.'
              : 'Em emergências ou crises agudas no Brasil: ligue 188 (CVV gratuito 24h).'}
          </span>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.role === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0 text-xs font-serif font-bold mt-1 shadow-2xs">
                    S
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                    isBot
                      ? 'bg-white border border-stone-200/80 text-stone-800'
                      : 'bg-amber-800 text-white font-medium'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isBot ? 'text-stone-400' : 'text-amber-200'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-xl bg-stone-700 text-white flex items-center justify-center shrink-0 text-xs mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0 text-xs font-serif font-bold mt-1">
                S
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs text-stone-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                <span>Sofia está digitando com carinho...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="p-3 bg-stone-100/70 border-t border-stone-200 overflow-x-auto">
          <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-700" />
            Sugestões de perguntas rápidas:
          </div>
          <div className="flex gap-1.5 flex-nowrap overflow-x-auto pb-1">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="shrink-0 text-[11px] font-medium bg-white hover:bg-stone-50 text-stone-700 px-3 py-1.5 rounded-full border border-stone-200/90 shadow-2xs hover:border-amber-400 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Shortcut inside Chat */}
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200/70 flex items-center justify-between text-xs">
          <span className="text-amber-900 font-medium">Pronto(a) para começar seu processo?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenBooking();
            }}
            className="font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 underline underline-offset-2"
          >
            <span>Ir para Agendamento</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua dúvida ou como está se sentindo..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none text-xs sm:text-sm text-stone-800 bg-[#FBF9F5]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
