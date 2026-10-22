import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { CountryMode } from '../types';

interface FAQProps {
  countryMode: CountryMode;
  onOpenBooking: () => void;
  onOpenChat: () => void;
}

export const FAQ: React.FC<FAQProps> = ({ countryMode, onOpenBooking, onOpenChat }) => {
  const isUS = countryMode === 'US';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Por que fazer terapia em português sendo brasileiro(a) no exterior?',
      a: 'Processar emoções na língua materna é muito mais profundo e libertador. Falar em português elimina o cansaço mental de traduzir sentimentos na cabeça e permite que você use suas próprias palavras, expressões e referências culturais, com uma psicóloga brasileira que compreende exatamente a realidade do luto migratório e da vida fora do país.',
    },
    {
      q: 'Quais são os formatos de atendimento disponíveis (Avulso, Semanal e Mensal)?',
      a: 'Oferecemos três opções flexíveis: Atendimento Avulso (sessão individual de 50 minutos para quem busca um acolhimento inicial ou tem demandas pontuais), Pacote Semanal (acompanhamento semanal contínuo com dia e horário fixos garantidos na agenda) e Pacote Mensal (ciclo completo de 4 sessões estruturadas com foco em metas clínicas).',
    },
    {
      q: 'Como funciona a adaptação com o meu fuso horário local?',
      a: 'A plataforma calcula a diferença horária automaticamente em tempo real! Seja você morador dos EUA (fusos Eastern, Central, Mountain, Pacific) ou do Brasil (horário de Brasília), a grade de horários se adapta à sua rotina local e o convite sincronizado da Google Agenda garante que não ocorra nenhum desencontro.',
    },
    {
      q: 'Como acesso a sessão no Google Meet? Preciso instalar algum programa?',
      a: 'Não é obrigatório instalar nada no computador: basta clicar no link exclusivo do Google Meet gerado na confirmação e recebido no seu e-mail e WhatsApp. Caso prefira entrar pelo celular ou tablet, basta ter o aplicativo gratuito do Google Meet instalado.',
    },
    {
      q: 'A Psicóloga Steffany Ferreira é autorizada pelo Conselho Federal de Psicologia (CFP)?',
      a: 'Sim! Steffany Ferreira é graduada em Psicologia, inscrita no Conselho Regional de Psicologia sob o CRP 06/184920, e possui cadastro ativo e regular no e-Psi — o Cadastro Nacional de Profissionais de Psicologia para Prestação de Serviços Psicológicos por Meio de TICs.',
    },
    {
      q: isUS
        ? 'Posso solicitar recibo profissional para reembolso no meu seguro de saúde no exterior?'
        : 'Posso usar o recibo para dedução no Imposto de Renda no Brasil?',
      a: isUS
        ? 'Sim! Emitimos recibo profissional oficial com todos os dados regulamentares do CRP. Muitos seguros de saúde no exterior possuem cláusula de cobertura para atendimentos psicológicos internacionais (out-of-network reimbursement).'
        : 'Sim! É emitido recibo psicológico oficial com o número do CRP da psicóloga Steffany Ferreira, válido para dedução de despesas de saúde na Declaração Anual do IRPF.',
    },
    {
      q: 'Qual é a política de cancelamento ou reagendamento de consultas?',
      a: 'Solicitamos um aviso prévio mínimo de 24 horas para reagendamentos sem custo adicional, permitindo que o horário seja disponibilizado a outro paciente. Avisos com menos de 24 horas são considerados como sessão realizada, ressalvadas urgências médicas comprovadas.',
    },
  ];

  return (
    <section id="perguntas-frequentes" className="py-20 sm:py-28 bg-white border-b border-[#e6e6e6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-left">
        <div className="max-w-2xl mb-12 space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-[#65864d] font-semibold">
            Tire Suas Dúvidas
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#191c18]">
            Perguntas Frequentes
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Tudo o que você precisa saber sobre o atendimento online, fusos horários e funcionamento prático.
          </p>
        </div>

        <div className="max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-[#e6e6e6] bg-[#f6f6f3] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-lg font-normal text-[#191c18] hover:text-[#65864d]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#65864d]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 bg-white">
                    <p className="pt-2">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom card in sage tone */}
        <div className="mt-12 p-6 sm:p-8 bg-[#e2e9d2] rounded-3xl border border-[#cca94] max-w-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif text-xl font-normal text-[#191c18]">
              Precisa de um acolhimento imediato?
            </h4>
            <p className="text-xs text-[#26331e]">
              Converse agora com a Sofia (nossa inteligência artificial de triagem) ou escolha um horário.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenChat}
              className="px-4 py-2 rounded-full bg-white text-[#191c18] text-xs font-medium hover:bg-stone-50 transition-colors"
            >
              Falar com Sofia
            </button>
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-4 py-2 rounded-full bg-[#191c18] text-white text-xs font-medium hover:bg-[#26331e] transition-colors"
            >
              Ver Grade
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
