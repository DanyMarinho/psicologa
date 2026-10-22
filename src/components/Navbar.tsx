import React from 'react';
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  Video,
  UserCheck,
  Globe2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { CountryMode } from '../types';

interface NavbarProps {
  countryMode: CountryMode;
  onCountryChange: (mode: CountryMode) => void;
  onOpenBooking: () => void;
  onOpenChat: () => void;
  onOpenDashboard: () => void;
  isTherapistLoggedIn: boolean;
  onSwitchToAdminTab?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  countryMode,
  onCountryChange,
  onOpenBooking,
  onOpenChat,
  onOpenDashboard,
  isTherapistLoggedIn,
  onSwitchToAdminTab,
}) => {
  const handleOpenAdmin = () => {
    if (onSwitchToAdminTab) {
      onSwitchToAdminTab();
    } else {
      onOpenDashboard();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f6f6f3]/95 backdrop-blur-md border-b border-[#e6e6e6] transition-all">
      {/* Top minimal micro bar */}
      <div className="bg-[#191c18] text-[#e8ecdf] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-[#acca94] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#acca94] animate-pulse" />
              CRP 06/184920 • Cadastro e-Psi Ativo
            </span>
            <span className="hidden md:inline text-stone-500">•</span>
            <span className="hidden md:flex items-center gap-1.5 text-stone-300">
              <Video className="w-3.5 h-3.5 text-[#acca94]" />
              Sessões online via Google Meet • Brasileiros no Exterior & Brasil
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            {/* Country Selector */}
            <div className="flex items-center bg-[#262c23] rounded-full p-0.5 border border-stone-700/80">
              <button
                type="button"
                onClick={() => onCountryChange('BR')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  countryMode === 'BR'
                    ? 'bg-[#e2e9d2] text-[#191c18] font-semibold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Página adaptada para o Brasil (horário de Brasília GMT-3)"
              >
                <span>🇧🇷</span>
                <span className="hidden sm:inline">Brasil</span>
              </button>
              <button
                type="button"
                onClick={() => onCountryChange('US')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  countryMode === 'US'
                    ? 'bg-[#e2e9d2] text-[#191c18] font-semibold shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Página adaptada para Brasileiros nos EUA (fusos americanos ET, CT, MT, PT)"
              >
                <span>🇺🇸</span>
                <span className="hidden sm:inline">EUA</span>
              </button>
            </div>

            {/* Painel ADM Button - Fast & Reliable In-App Switch */}
            <button
              type="button"
              onClick={handleOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26331e] hover:bg-[#34422c] text-[#acca94] border border-[#acca94]/40 text-[11px] sm:text-xs font-semibold transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Abrir o Painel Administrativo da Psicóloga Steffany Ferreira"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#acca94]" />
              <span>Painel ADM</span>
              {isTherapistLoggedIn ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              ) : (
                <span className="hidden md:inline text-[10px] text-[#acca94]/80 font-normal ml-0.5">• Google & CRM</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar in Forma style */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-[#191c18] text-[#f6f6f3] flex items-center justify-center font-serif text-sm font-semibold tracking-tighter">
            sf
          </div>
          <div>
            <div className="font-serif text-lg sm:text-xl font-normal tracking-tight text-[#191c18]">
              Steffany Ferreira
            </div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-stone-500 font-medium">
              Psicoterapia Clínica • TCC
            </div>
          </div>
        </a>

        {/* Center menu links */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-stone-600">
          <a href="#como-funciona" className="hover:text-[#191c18] transition-colors">
            Como Funciona
          </a>
          <a href="#categorias" className="hover:text-[#191c18] transition-colors">
            Categorias de Atendimento
          </a>
          <a href="#especialidades" className="hover:text-[#191c18] transition-colors">
            Especialidades
          </a>
          <a href="#agendamento" className="hover:text-[#191c18] transition-colors flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#65864d]" />
            Grade de Horários
          </a>
          <a href="#perguntas-frequentes" className="hover:text-[#191c18] transition-colors">
            Dúvidas
          </a>
          <button
            type="button"
            onClick={handleOpenAdmin}
            className="hover:text-[#191c18] transition-colors flex items-center gap-1.5 text-stone-700 font-semibold cursor-pointer"
            title="Acessar painel de gestão da psicóloga"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#65864d]" />
            <span>Painel ADM</span>
          </button>
        </nav>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenChat}
            type="button"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#191c18] bg-[#e8ecdf] hover:bg-[#d8e3cf] rounded-full transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#65864d]" />
            <span>Acolhimento com IA</span>
          </button>

          <button
            onClick={onOpenBooking}
            type="button"
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-[13px] font-medium text-white bg-[#191c18] hover:bg-[#26331e] rounded-full transition-all shadow-xs group"
          >
            <span>Agendar Sessão</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
