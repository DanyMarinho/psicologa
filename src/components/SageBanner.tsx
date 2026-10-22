import React from 'react';
import { ArrowRight, Video, Calendar } from 'lucide-react';

interface SageBannerProps {
  onOpenBooking: () => void;
}

export const SageBanner: React.FC<SageBannerProps> = ({ onOpenBooking }) => {
  return (
    <section className="bg-[#d8e3cf] text-[#191c18] py-16 sm:py-20 border-b border-[#cca94]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left">
          <div className="space-y-4 max-w-2xl">
            <div className="text-[11px] uppercase tracking-widest text-[#26331e] font-semibold">
              Comece seu acompanhamento
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.03em] leading-tight">
              Cuidar de você longe de casa <br />
              é o seu maior investimento.
            </h2>
            <p className="text-sm sm:text-base text-[#343b30] leading-relaxed">
              Sinta o acolhimento do Brasil onde quer que você esteja. Sessões online privativas via Google Meet
              em formatos flexíveis (Avulso, Semanal ou Mensal), perfeitamente adaptadas ao seu fuso horário local.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <button
              onClick={onOpenBooking}
              type="button"
              className="px-7 py-3.5 rounded-full bg-[#191c18] hover:bg-[#26331e] text-white text-sm font-medium flex items-center gap-2 transition-all shadow-sm group"
            >
              <span>Escolher Formato & Horário</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-[#26331e] font-medium flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" /> Google Meet privativo e seguro
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
