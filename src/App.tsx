import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Sparkles, ShieldCheck, ExternalLink } from 'lucide-react';
import { CountryMode, Appointment, Lead } from './types';
import { INITIAL_APPOINTMENTS, INITIAL_LEADS } from './data/mockData';
import { initAuth } from './services/firebaseAuth';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CountryTargetBanner } from './components/CountryTargetBanner';
import { Specialties } from './components/Specialties';
import { ClientQuotes } from './components/ClientQuotes';
import { TherapyApproach } from './components/TherapyApproach';
import { BookingWidget } from './components/BookingWidget';
import { SageBanner } from './components/SageBanner';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { ChatDrawer } from './components/ChatDrawer';
import { PsychologistDashboard } from './components/PsychologistDashboard';

const STORAGE_KEY_APPOINTMENTS = 'sf_appointments_v3';
const STORAGE_KEY_LEADS = 'sf_leads_v3';

// Helper to load persisted appointments
const loadStoredAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading stored appointments:', err);
  }
  return INITIAL_APPOINTMENTS;
};

// Helper to load persisted leads
const loadStoredLeads = (): Lead[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading stored leads:', err);
  }
  return INITIAL_LEADS;
};

export default function App() {
  const [countryMode, setCountryMode] = useState<CountryMode>('BR');

  // Appointments & Leads with cross-tab persistence
  const [appointments, setAppointments] = useState<Appointment[]>(loadStoredAppointments);
  const [leads, setLeads] = useState<Lead[]>(loadStoredLeads);

  // Tab / View navigation: 'homepage' or 'admin'
  const [viewMode, setViewMode] = useState<'homepage' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('tab=admin') || search.includes('view=admin') || hash === '#admin') {
        return 'admin';
      }
    }
    return 'homepage';
  });

  const openAdminView = () => {
    setViewMode('admin');
    setIsDashboardOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState(null, '', '#admin');
    }
  };

  const openHomepageView = () => {
    setViewMode('homepage');
    setIsDashboardOpen(false);
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  // Listen to hash / URL history changes
  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window === 'undefined') return;
      const search = window.location.search;
      const hash = window.location.hash;
      if (search.includes('tab=admin') || search.includes('view=admin') || hash === '#admin') {
        setViewMode('admin');
      } else {
        setViewMode('homepage');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Modals & Drawers for Homepage
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Google Workspace Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize Auth state listener on app load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to cross-browser tab changes via storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_APPOINTMENTS && e.newValue) {
        try {
          setAppointments(JSON.parse(e.newValue));
        } catch (err) {
          console.warn('Failed parsing synced appointments:', err);
        }
      }
      if (e.key === STORAGE_KEY_LEADS && e.newValue) {
        try {
          setLeads(JSON.parse(e.newValue));
        } catch (err) {
          console.warn('Failed parsing synced leads:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync state changes to localStorage
  const handleUpdateAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    try {
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(newAppointments));
    } catch (err) {
      console.warn('Failed to persist appointments:', err);
    }
  };

  const handleUpdateLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    try {
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(newLeads));
    } catch (err) {
      console.warn('Failed to persist leads:', err);
    }
  };

  // When patient completes an appointment booking on the Homepage
  const handleAppointmentBooked = (newAppointment: Appointment) => {
    const updated = [newAppointment, ...appointments];
    handleUpdateAppointments(updated);

    // Automatically create or update lead in CRM
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: newAppointment.patientName,
      email: newAppointment.patientEmail,
      phone: newAppointment.patientPhone,
      country: newAppointment.country,
      inquiryReason: `${newAppointment.sessionType} agendada para ${newAppointment.date} às ${newAppointment.timeSlot}`,
      status: 'agendado',
      modality: newAppointment.packageType,
      notes: newAppointment.notes || 'Agendamento direto pela homepage.',
      createdAt: new Date().toISOString(),
      source: 'landing_page',
    };
    handleUpdateLeads([newLead, ...leads]);
  };

  const scrollToBooking = () => {
    const el = document.getElementById('agendamento');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If URL/View is currently in Admin mode (opened in another tab or toggled)
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-[#f4f5f2] text-[#191c18] font-sans selection:bg-[#d8e3cf] selection:text-[#26331e]">
        {/* Top View Switcher Bar */}
        <div className="bg-[#111410] border-b border-[#2b3524] text-xs py-2 px-4 sm:px-8 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold hidden sm:inline">
                Visualização:
              </span>
              <div className="inline-flex rounded-full bg-black/40 p-0.5 border border-stone-800">
                <button
                  type="button"
                  onClick={openHomepageView}
                  className="px-3.5 py-1 rounded-full text-xs font-medium text-stone-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🌐 Site dos Pacientes</span>
                </button>
                <button
                  type="button"
                  onClick={openAdminView}
                  className="px-3.5 py-1 rounded-full text-xs bg-[#acca94] text-[#191c18] shadow-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#191c18]" />
                  <span>🔒 Painel ADM (Ativo)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-400 font-medium hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Steffany Ferreira • Gestão Integrada com Google Agenda & CRM</span>
              </span>
              <button
                type="button"
                onClick={openHomepageView}
                className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors border border-stone-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Voltar ao Site</span>
              </button>
            </div>
          </div>
        </div>

        <PsychologistDashboard
          isOpen={true}
          isStandalonePage={true}
          onClose={openHomepageView}
          onSwitchToHomepage={openHomepageView}
          appointments={appointments}
          leads={leads}
          onUpdateAppointments={handleUpdateAppointments}
          onUpdateLeads={handleUpdateLeads}
          currentUser={currentUser}
          accessToken={accessToken}
          onAuthChange={(user, token) => {
            setCurrentUser(user);
            setAccessToken(token);
          }}
        />
      </div>
    );
  }

  // Otherwise, render full public Homepage with Google Agenda integration
  return (
    <div className="min-h-screen bg-[#f6f6f3] text-[#191c18] flex flex-col font-sans selection:bg-[#d8e3cf] selection:text-[#26331e]">
      {/* Top View Switcher Bar */}
      <div className="bg-[#111410] border-b border-[#2b3524] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium hidden sm:inline">
              Visualização:
            </span>
            <div className="inline-flex rounded-full bg-black/40 p-0.5 border border-stone-800">
              <button
                type="button"
                onClick={openHomepageView}
                className="px-3.5 py-1 rounded-full text-xs bg-[#26331e] text-[#acca94] font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>🌐 Site dos Pacientes (Ativo)</span>
              </button>
              <button
                type="button"
                onClick={openAdminView}
                className="px-3.5 py-1 rounded-full text-xs text-stone-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                title="Abrir o Painel Administrativo da Psicóloga"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#acca94]" />
                <span>🔒 Painel ADM (Psicóloga)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <button
              type="button"
              onClick={openAdminView}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26331e] hover:bg-[#34422c] text-[#acca94] border border-[#acca94]/40 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98]"
              title="Abrir o Painel Administrativo da Psicóloga"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#acca94]" />
              <span>Abrir Painel ADM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Header with direct link to open Admin Panel */}
      <Navbar
        countryMode={countryMode}
        onCountryChange={setCountryMode}
        onOpenBooking={scrollToBooking}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenDashboard={openAdminView}
        isTherapistLoggedIn={!!currentUser && !!accessToken}
        onSwitchToAdminTab={openAdminView}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          countryMode={countryMode}
          onOpenBooking={scrollToBooking}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* The Difference Section */}
        <CountryTargetBanner
          countryMode={countryMode}
          onSelectCountry={setCountryMode}
          onOpenBooking={scrollToBooking}
        />

        {/* 3 Categories: Avulso, Pacote Semanal, Pacote Mensal & Upcoming Sessions Schedule with Framer Motion and Google Agenda live integration */}
        <BookingWidget
          countryMode={countryMode}
          onAppointmentBooked={handleAppointmentBooked}
          onOpenChat={() => setIsChatOpen(true)}
          existingAppointments={appointments}
        />

        {/* Specialties / Áreas de Atuação */}
        <Specialties
          countryMode={countryMode}
          onOpenBooking={scrollToBooking}
        />

        {/* Quotes Figure Section */}
        <ClientQuotes />

        {/* Clinical CBT Approach */}
        <TherapyApproach
          countryMode={countryMode}
          onOpenBooking={scrollToBooking}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Iconic Sage Banner */}
        <SageBanner onOpenBooking={scrollToBooking} />

        {/* FAQ */}
        <FAQ
          countryMode={countryMode}
          onOpenBooking={scrollToBooking}
          onOpenChat={() => setIsChatOpen(true)}
        />
      </main>

      {/* Footer with Studio hours, Google Meet, CFP compliance, emergency lines 188 / 988 */}
      <Footer
        countryMode={countryMode}
        onOpenBooking={scrollToBooking}
        onOpenDashboard={openAdminView}
        onSwitchToAdminTab={openAdminView}
      />

      {/* Floating Gemini AI Intake Trigger */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-[#191c18] hover:bg-[#26331e] text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group"
          title="Falar com Sofia, assistente virtual de acolhimento"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-[#acca94]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#acca94] absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
          <span className="text-xs sm:text-[13px] font-medium pr-1">
            Falar com Sofia (IA)
          </span>
        </button>
      </div>

      {/* Gemini AI Multi-turn Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        countryMode={countryMode}
        onOpenBooking={scrollToBooking}
      />

      {/* Psychologist Management & Google Workspace Admin Modal */}
      <PsychologistDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        appointments={appointments}
        leads={leads}
        onUpdateAppointments={handleUpdateAppointments}
        onUpdateLeads={handleUpdateLeads}
        currentUser={currentUser}
        accessToken={accessToken}
        onAuthChange={(user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        }}
        isStandalonePage={false}
        onSwitchToHomepage={openHomepageView}
        onExpandToStandalone={openAdminView}
      />
    </div>
  );
}
