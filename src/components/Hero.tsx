import React from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { CountryMode } from '../types';

interface HeroProps {
  countryMode: CountryMode;
  onOpenBooking: () => void;
  onOpenChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ countryMode, onOpenBooking, onOpenChat }) => {
  const isUS = countryMode === 'US';

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-[#e6e6e6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Big Bold Minimalist Typography like Forma */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8ecdf] text-[#26331e] text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#65864d] animate-ping" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#65864d]" />
              <span>Psicoterapia online para brasileiros no exterior e no Brasil</span>
            </div>

            {/* Main Headline (Forma "Pilates, redefined" style) */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[72px] leading-[1.06] font-normal tracking-[-0.035em] text-[#191c18]">
              Terapia em português, <br />
              <span className="italic text-[#4a5840]">onde quer que você viva.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal max-w-xl">
              Viver fora do Brasil exige coragem, mas muitas vezes traz a solidão do luto migratório,
              a saudade da família e a cobrança constante por estabilidade. Tenha um espaço seguro e
              estruturado para desabafar e se fortalecer na sua língua materna, adaptado ao seu fuso horário.
            </p>

            {/* 3 Categories Pill Indicators */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
              <span className="text-stone-400 font-medium">Formatos de atendimento:</span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#e6e6e6] text-stone-800 font-medium shadow-xs">
                Atendimento Avulso
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#e2e9d2] text-[#26331e] font-semibold border border-[#d8e3cf] shadow-xs">
                Pacote Semanal (Mais procurado)
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#e6e6e6] text-stone-800 font-medium shadow-xs">
                Pacote Mensal
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenBooking}
                type="button"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-white bg-[#191c18] hover:bg-[#26331e] active:scale-98 transition-all shadow-sm group"
              >
                <Calendar className="w-4 h-4" />
                <span>Escolher Categoria & Horário</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenChat}
                type="button"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-medium text-[#191c18] bg-[#e8ecdf] hover:bg-[#d8e3cf] transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#65864d]" />
                <span>Falar com Sofia (Triagem Virtual)</span>
              </button>
            </div>

            {/* Ethics badge */}
            <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                Atendimento estritamente confidencial regulamentado pelo Conselho Federal de Psicologia (CFP).
              </span>
            </div>
          </div>

          {/* Right Column: Steffany Ferreira's Portrait Photo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md group">
              {/* Subtle background decorative aura in sage */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#65864d]/15 to-[#a3bf73]/10 rounded-[36px] blur-xl -z-10" />

              {/* Card / Image Container */}
              <div className="relative rounded-[32px] overflow-hidden border border-[#e6e6e6] bg-white shadow-md transition-all duration-300 group-hover:shadow-xl">
                <img
                  src="/assets/aistudio/image.png_20261021094756_c6f4fa89.jpg"
                  alt="Psicóloga Steffany Ferreira (CRP 06/184920)"
                  className="w-full h-[440px] sm:h-[480px] lg:h-[500px] object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />

                {/* Top Google Meet pill */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md text-white font-medium text-xs shadow-sm border border-white/15">
                    <Video className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Google Meet</span>
                  </span>
                </div>

                {/* Floating identity pill overlay at bottom */}
                <div className="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/80 shadow-lg text-left flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#65864d] uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#65864d] animate-pulse" />
                      Psicóloga Clínica
                    </div>
                    <h3 className="font-serif text-lg font-normal text-[#191c18] leading-tight mt-0.5">
                      Steffany Ferreira
                    </h3>
                    <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                      CRP 06/184920 • TCC
                    </p>
                  </div>

                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-[#edf1e8] text-[#26331e] font-semibold text-[11px] border border-[#d8e3cf] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#65864d]" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


