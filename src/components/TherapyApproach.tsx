import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  Video,
  Clock,
  Sparkles,
  Award,
  ChevronDown,
  Globe2,
  ArrowRight,
} from 'lucide-react';
import { CountryMode } from '../types';

interface TherapyApproachProps {
  countryMode: CountryMode;
  onOpenBooking: () => void;
  onOpenChat: () => void;
}

export const TherapyApproach: React.FC<TherapyApproachProps> = ({
  countryMode,
  onOpenBooking,
  onOpenChat,
}) => {
  const isUS = countryMode === 'US';
  const [openDetail, setOpenDetail] = useState<number | null>(0);

  const beforeSessionDetails = [
    {
      title: 'Acesso privativo e imediato pelo Google Meet',
      content:
        'Não é necessário instalar nenhum programa no computador: a sala virtual exclusiva é gerada automaticamente na confirmação do agendamento e enviada diretamente para o seu e-mail e WhatsApp com link clicável.',
    },
    {
      title: 'Duração e estrutura de cada sessão (50 minutos)',
      content:
        'As sessões têm duração pontual de 50 minutos. Na abordagem TCC, trabalhamos colaborativamente com identificação de gatilhos emocionais, reestruturação de pensamentos automáticos e elaboração de exercícios práticos.',
    },
    {
      title: 'Adaptação de fuso horário em tempo real',
      content:
        'Para quem está nos Estados Unidos ou no Brasil, a grade é exibida no seu horário local exato (Eastern, Central, Mountain, Pacific ou Horário de Brasília GMT-3). O convite sincronizado com a Google Agenda assegura que nenhum horário seja desencontrado.',
    },
    {
      title: 'Formatos de atendimento: Avulso, Pacote Semanal e Mensal',
      content:
        'Você escolhe o formato mais adequado: Atendimento Avulso para demandas pontuais e primeiro contato, Pacote Semanal com dia e horário fixos para evolução contínua, ou Pacote Mensal com ciclo de 4 atendimentos estruturados.',
    },
    {
      title: 'Expressar sentimentos na sua língua materna',
      content:
        'Falar sobre dores emocionais, medos e angústias na língua nativa faz toda a diferença. Não há o cansaço de traduzir expressões íntimas, e você conta com uma profissional que compreende as referências culturais brasileiras e a realidade de viver fora do país.',
    },
    {
      title: 'Sigilo profissional absoluto (CFP e e-Psi)',
      content:
        'Todas as conversas e registros são protegidos sob sigilo ético absoluto garantido pelo Código de Ética Profissional do Psicólogo e cadastro regular no e-Psi para atendimento por TICs (CRP 06/184920).',
    },
  ];

  return (
    <section id="abordagem" className="py-20 sm:py-28 bg-white border-b border-[#e6e6e6] text-left">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-20">
        {/* Section: "Before your first session." (Forma exact layout) */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <div className="text-[11px] uppercase tracking-widest text-[#65864d] font-semibold">
              Preparação & Orientações
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.03em] text-[#191c18] leading-tight">
              Antes da sua <br />
              primeira sessão.
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm">
              Tudo o que você precisa saber para se conectar com tranquilidade, sem ruídos técnicos ou
              dúvidas burocráticas.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onOpenBooking}
                className="px-5 py-2.5 rounded-full bg-[#191c18] hover:bg-[#26331e] text-white text-xs font-medium transition-colors"
              >
                Agendar Horário
              </button>
              <button
                type="button"
                onClick={onOpenChat}
                className="px-5 py-2.5 rounded-full bg-[#e8ecdf] hover:bg-[#d8e3cf] text-[#191c18] text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#65864d]" />
                <span>Tirar Dúvidas com Sofia (IA)</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3">
            {beforeSessionDetails.map((item, idx) => {
              const isOpen = openDetail === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#e6e6e6] bg-[#f6f6f3] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenDetail(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif text-lg sm:text-xl font-normal text-[#191c18] hover:text-[#65864d]"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#65864d]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 bg-white">
                      <p className="pt-3">{item.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bio & Approach section in Forma layout */}
        <div className="bg-[#f6f6f3] rounded-3xl p-8 sm:p-12 border border-[#e6e6e6] grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 space-y-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img
                src="/assets/aistudio/image.png_20261021094756_c6f4fa89.jpg"
                alt="Psicóloga Steffany Ferreira"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-normal text-[#191c18]">
                Steffany Ferreira
              </h3>
              <p className="text-xs font-medium text-[#65864d]">CRP 06/184920 • e-Psi Regular</p>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Graduada em Psicologia, pós-graduanda em Terapia Cognitivo-Comportamental (TCC) e
              Neuropsicologia. Atendimento clínico dedicado a brasileiros residentes no exterior e no
              Brasil, com escuta atenta aos desafios da distância, luto migratório e rotina fora do país.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-4 border-t lg:border-t-0 lg:border-l border-stone-200 lg:pl-8 pt-6 lg:pt-0">
            <div className="text-[11px] uppercase tracking-widest text-[#65864d] font-semibold">
              Abordagem TCC
            </div>
            <h4 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-[#191c18]">
              Ciência e empatia a serviço da sua autonomia.
            </h4>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A Terapia Cognitivo-Comportamental é a abordagem padrão ouro no mundo para manejo de
              ansiedade, estresse crônico, burnout e transições de vida. O objetivo não é criar dependência
              do consultório, mas equipar você com clareza, pensamento crítico e autocompaixão para que
              você se sinta seguro(a) e fortalecido(a) no seu dia a dia.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#e6e6e6]">
                <strong className="block text-[#191c18] font-semibold mb-0.5">Metas Claras</strong>
                <span className="text-stone-500">Objetivos bem delineados em conjunto desde a primeira sessão.</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#e6e6e6]">
                <strong className="block text-[#191c18] font-semibold mb-0.5">Sessões Práticas</strong>
                <span className="text-stone-500">Técnicas aplicadas diretamente à sua realidade no exterior.</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#e6e6e6]">
                <strong className="block text-[#191c18] font-semibold mb-0.5">Língua Materna</strong>
                <span className="text-stone-500">Liberdade total de expressar sentimentos em português.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
