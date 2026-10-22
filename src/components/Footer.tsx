import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Video,
  Globe2,
  Calendar,
  Phone,
} from 'lucide-react';
import { CountryMode } from '../types';

interface FooterProps {
  countryMode: CountryMode;
  onOpenBooking: () => void;
  onOpenDashboard: () => void;
  onSwitchToAdminTab?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  countryMode,
  onOpenBooking,
  onOpenDashboard,
  onSwitchToAdminTab,
}) => {
  return (
    <footer className="bg-[#191c18] text-[#e8ecdf] pt-16 pb-12 border-t border-stone-800 text-left">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 space-y-12">
        {/* MANDATORY CFP EMERGENCY CRISIS NOTICE */}
        <div className="bg-[#242b20] border border-[#3e4c36] rounded-2xl p-5 sm:p-6 text-[#d8e3cf] space-y-3">
          <div className="flex items-center gap-2 font-semibold text-[#acca94] text-sm">
            <ShieldAlert className="w-4 h-4 text-[#acca94] shrink-0" />
            <span>Aviso Ético Obrigatório sobre Emergências Psiquiátricas (CFP)</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Este site e os atendimentos online programados <strong>não prestam serviços de urgência ou emergência imediata</strong>.
            Em caso de crise severa, sofrimento agudo ou ideação suicida, acione imediatamente os serviços de apoio:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-[#191c18] p-3 rounded-xl border border-stone-700/80 space-y-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#acca94]" /> 🇧🇷 No Brasil:
              </span>
              <p className="text-stone-300">
                Ligue <strong>188</strong> (CVV - Centro de Valorização da Vida, gratuito 24h) ou <strong>192 (SAMU)</strong>. Acesse também{' '}
                <a
                  href="https://cvv.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  cvv.org.br
                </a>.
              </p>
            </div>

            <div className="bg-[#191c18] p-3 rounded-xl border border-stone-700/80 space-y-1">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#acca94]" /> 🇺🇸 Nos Estados Unidos:
              </span>
              <p className="text-stone-300">
                Ligue ou envie SMS para <strong>988</strong> (Suicide & Crisis Lifeline, gratuito 24/7 em inglês e espanhol) ou ligue <strong>911</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Forma Minimal 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-8 border-b border-stone-800 text-xs sm:text-sm">
          {/* Brand & Studio Hours */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f6f6f3] text-[#191c18] flex items-center justify-center font-serif text-sm font-semibold">
                sf
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-white">Steffany Ferreira</h3>
                <p className="text-xs text-[#acca94]">CRP 06/184920 • Cadastro e-Psi Ativo</p>
              </div>
            </div>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Psicoterapia online baseada em evidências (TCC) dedicada a brasileiros no exterior e no
              Brasil. Acolhimento na sua língua materna com sessões confidenciais via Google Meet.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onSwitchToAdminTab) {
                    onSwitchToAdminTab();
                  } else {
                    onOpenDashboard();
                  }
                }}
                className="text-xs text-[#acca94] hover:underline flex items-center gap-1.5 font-medium cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#acca94]" />
                <span>Acessar Painel Clínico da Psicóloga (ADM)</span>
              </button>
            </div>
          </div>

          {/* Horários de Atendimento (Forma Studio hours style) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#acca94] font-semibold">
              Horários de Atendimento
            </h4>
            <div className="space-y-1.5 text-xs text-stone-300">
              <div className="flex justify-between border-b border-stone-800/80 pb-1">
                <span>Segunda a Sexta</span>
                <span className="font-medium text-white">08:00 – 20:00 (Brasília)</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/80 pb-1">
                <span>EUA Eastern (ET)</span>
                <span className="font-medium text-white">07:00 – 19:00</span>
              </div>
              <div className="flex justify-between border-b border-stone-800/80 pb-1">
                <span>EUA Pacific (PT)</span>
                <span className="font-medium text-white">05:00 – 17:00</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Plataforma</span>
                <span className="font-medium text-[#acca94]">Google Meet Privativo</span>
              </div>
            </div>
          </div>

          {/* Categorias & Navegação */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-[#acca94] font-semibold">
              Formatos de Atendimento
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-300">
              <li>
                <a href="#categorias" className="hover:text-white transition-colors">
                  • Atendimento Avulso
                </a>
              </li>
              <li>
                <a href="#categorias" className="hover:text-white transition-colors">
                  • Pacote Semanal
                </a>
              </li>
              <li>
                <a href="#categorias" className="hover:text-white transition-colors">
                  • Pacote Mensal
                </a>
              </li>
              <li>
                <a href="#agendamento" className="hover:text-white transition-colors">
                  • Grade de Horários
                </a>
              </li>
              <li>
                <a href="#perguntas-frequentes" className="hover:text-white transition-colors">
                  • Dúvidas Frequentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & resolution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Psicóloga Steffany Ferreira (CRP 06/184920). Resolução CFP nº 11/2018.
          </div>
          <div className="text-[11px] text-stone-400">
            Design boutique inspirado no modelo Forma • Psicoterapia Redefinida
          </div>
        </div>
      </div>
    </footer>
  );
};
