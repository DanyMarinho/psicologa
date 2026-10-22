import React from 'react';
import {
  Compass,
  Plane,
  Briefcase,
  HeartHandshake,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { CountryMode } from '../types';

interface SpecialtiesProps {
  countryMode: CountryMode;
  onOpenBooking: () => void;
}

export const Specialties: React.FC<SpecialtiesProps> = ({ countryMode, onOpenBooking }) => {
  const isUS = countryMode === 'US';

  const specialtiesList = [
    {
      icon: <Plane className="w-5 h-5 text-[#65864d]" />,
      title: 'Luto Migratório & Vida no Exterior',
      highlight: 'Foco em Imigração',
      description: 'A saudade da família, a sensação de não pertencer 100% a lugar nenhum e o peso invisível de reconstruir a própria vida longe do Brasil.',
      topics: ['Solidão no exterior', 'Luto migratório', 'Distância da família'],
    },
    {
      icon: <Compass className="w-5 h-5 text-[#65864d]" />,
      title: 'Ansiedade & Sobrecarga Emocional',
      highlight: 'TCC com Evidências',
      description: 'Manejo de pensamentos acelerados, crises de ansiedade, aperto no peito e o medo constante do futuro, de vistos ou da instabilidade.',
      topics: ['Regulação emocional', 'Acalmar pensamentos', 'Manejo do estresse'],
    },
    {
      icon: <Briefcase className="w-5 h-5 text-[#65864d]" />,
      title: 'Carreira, Burnout & Síndrome do Impostor',
      highlight: 'Desempenho Sem Exaustão',
      description: 'A cobrança implacável para "dar certo", a pressão no ambiente de trabalho fora do país e a sensação constante de ter que provar seu valor.',
      topics: ['Sobrecarga no trabalho', 'Síndrome do impostor', 'Limites saudáveis'],
    },
    {
      icon: <HeartHandshake className="w-5 h-5 text-[#65864d]" />,
      title: 'Vínculos, Família & Relações à Distância',
      highlight: 'Maturidade Afetiva',
      description: 'A culpa de estar longe dos pais que envelhecem no Brasil, relacionamentos biculturais, criação de filhos e comunicação sem mágoas.',
      topics: ['Família no Brasil', 'Culpa da ausência', 'Relações afetivas'],
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#65864d]" />,
      title: 'Autoestima & Cobrança Excessiva',
      highlight: 'Autocompaixão',
      description: 'Desconstrução do perfeccionismo paralisante, acolhimento das próprias vulnerabilidades e fortalecimento da sua segurança interna.',
      topics: ['Menos autocrítica', 'Segurança pessoal', 'Autocompaixão'],
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#65864d]" />,
      title: 'Transições, Mudanças & Recomeços',
      highlight: 'Clareza em Decisões',
      description: 'Apoio psicológico para mudanças de cidade ou país, períodos de transição profissional, separações e novos ciclos de vida.',
      topics: ['Recomeços no exterior', 'Adaptação a mudanças', 'Tomada de decisão'],
    },
  ];

  return (
    <section id="especialidades" className="py-20 sm:py-28 bg-[#f6f6f3] border-b border-[#e6e6e6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-left space-y-14">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e6e6]">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-[#65864d] font-semibold">
              Áreas de Atuação
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.03em] text-[#191c18] mt-1">
              Demandas atendidas com frequência na clínica.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md leading-relaxed">
            Cada processo é único e respeita o seu tempo, combinando rigor ético e acolhimento
            humanizado em sessões individuais de 50 minutos.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialtiesList.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-7 border border-[#e6e6e6] hover:border-stone-400 transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#f6f6f3] border border-stone-200/80 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-[#26331e] bg-[#e2e9d2] px-2.5 py-0.5 rounded-full">
                    {item.highlight}
                  </span>
                </div>

                <h3 className="font-serif text-2xl font-normal tracking-tight text-[#191c18]">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {item.topics.map((t, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium text-stone-600 bg-[#f6f6f3] px-2 py-0.5 rounded-md"
                    >
                      • {t}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="w-full text-xs font-medium text-[#191c18] hover:text-[#65864d] pt-1 flex items-center justify-between transition-colors"
                >
                  <span>Agendar sessão sobre esta demanda</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
