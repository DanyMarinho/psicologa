import React from 'react';
import { CountryMode } from '../types';

interface CountryTargetBannerProps {
  countryMode: CountryMode;
  onSelectCountry: (mode: CountryMode) => void;
  onOpenBooking: () => void;
}

export const CountryTargetBanner: React.FC<CountryTargetBannerProps> = ({
  countryMode,
  onSelectCountry,
  onOpenBooking,
}) => {
  const isUS = countryMode === 'US';

  return (
    <section id="como-funciona" className="py-12 sm:py-16 bg-white border-b border-[#e6e6e6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 text-left">
        {/* Dynamic Context Box */}
        <div className="bg-[#f6f6f3] rounded-3xl p-7 sm:p-9 border border-[#e6e6e6] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#65864d]" />
              <span className="text-xs uppercase font-semibold text-[#65864d] tracking-wider">
                Fuso & Atendimento: {isUS ? 'Brasileiros no Exterior (EUA)' : 'Brasil (Horário de Brasília)'}
              </span>
            </div>
            <h4 className="font-serif text-xl sm:text-2xl font-normal text-[#191c18]">
              {isUS
                ? 'Acolhimento clínico na sua língua materna para quem vive longe de casa.'
                : 'Psicoterapia online estruturada com acolhimento e escuta qualificada.'}
            </h4>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              {isUS
                ? 'Sessões 100% em português com horários adaptados ao seu fuso local nos EUA (Eastern, Central, Mountain ou Pacific). Sem barreiras de idioma, sem precisar traduzir suas dores e com total compreensão da experiência de imigrar.'
                : 'Horários no fuso de Brasília (GMT-3) com flexibilidade matutina, vespertina e noturna para equilibrar sua saúde emocional com sua rotina.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onSelectCountry(isUS ? 'BR' : 'US')}
              className="px-4 py-2.5 rounded-full text-xs font-medium border border-stone-300 hover:bg-white transition-colors text-stone-800"
            >
              Alternar para {isUS ? '🇧🇷 Brasil' : '🇺🇸 EUA'}
            </button>
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-5 py-2.5 rounded-full text-xs font-medium bg-[#191c18] hover:bg-[#26331e] text-white transition-colors"
            >
              Ver Grade de Horários
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
