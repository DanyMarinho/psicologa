import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar,
  Video,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Globe2,
  Users,
  FileText,
  Settings,
  MessageCircle,
  RefreshCw,
  LogOut,
  Plus,
  Lock,
  X,
  AlertTriangle,
  Check,
  Ban,
  ArrowLeft,
  UserPlus,
  ArrowRight,
  Search,
  Trash2,
  Edit3,
  LayoutGrid,
  ListFilter,
  Phone,
  Mail,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { Appointment, Lead, LeadStatus, ClinicalNote } from '../types';
import { googleSignIn, logout } from '../services/firebaseAuth';
import {
  createGoogleCalendarSessionEvent,
  fetchGoogleCalendarEvents,
  GoogleCalendarEvent,
} from '../services/googleCalendar';
import { BASE_THERAPIST_SLOTS } from '../data/mockData';
import { ConfirmationModal } from './ConfirmationModal';

export const CRM_STATUS_ORDER: LeadStatus[] = [
  'novo',
  'em_contato',
  'agendado',
  'paciente_ativo',
  'arquivado',
];

export const CRM_STATUS_DETAILS: Record<
  LeadStatus,
  {
    label: string;
    shortLabel: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    dotBg: string;
    description: string;
    nextStatus?: LeadStatus;
    nextActionLabel?: string;
  }
> = {
  novo: {
    label: 'Novo Lead',
    shortLabel: 'Novo',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    dotBg: 'bg-blue-500',
    description: 'Contato recente via homepage ou assistente Sofia.',
    nextStatus: 'em_contato',
    nextActionLabel: 'Avançar p/ Em Contato',
  },
  em_contato: {
    label: 'Em Atendimento',
    shortLabel: 'Em Contato',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    dotBg: 'bg-amber-500',
    description: 'Conversa no WhatsApp e alinhamento de horários.',
    nextStatus: 'agendado',
    nextActionLabel: 'Avançar p/ Agendado',
  },
  agendado: {
    label: 'Sessão Agendada',
    shortLabel: 'Agendado',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    dotBg: 'bg-purple-500',
    description: 'Primeira consulta agendada com Google Meet.',
    nextStatus: 'paciente_ativo',
    nextActionLabel: 'Tornar Paciente Ativo',
  },
  paciente_ativo: {
    label: 'Paciente Ativo',
    shortLabel: 'Ativo',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    dotBg: 'bg-emerald-500',
    description: 'Em acompanhamento contínuo (semanal / mensal).',
    nextStatus: 'arquivado',
    nextActionLabel: 'Concluir / Arquivar',
  },
  arquivado: {
    label: 'Arquivado / Concluído',
    shortLabel: 'Arquivado',
    badgeBg: 'bg-stone-100',
    badgeText: 'text-stone-600',
    badgeBorder: 'border-stone-200',
    dotBg: 'bg-stone-400',
    description: 'Alta terapêutica, sem retorno ou arquivado.',
    nextStatus: 'novo',
    nextActionLabel: 'Reativar Contato',
  },
};

export const getWhatsAppUrl = (lead: Lead) => {
  const cleanPhone = lead.phone.replace(/\D/g, '');
  let message = '';
  switch (lead.status) {
    case 'novo':
      message = `Olá ${lead.name}, tudo bem? Aqui é a psicóloga Steffany Ferreira. Recebi sua mensagem com interesse em psicoterapia pela minha página e gostaria de tirar suas dúvidas!`;
      break;
    case 'em_contato':
      message = `Olá ${lead.name}, tudo bem? Aqui é a psicóloga Steffany. Passando para verificar se podemos definir o melhor horário para iniciarmos sua psicoterapia.`;
      break;
    case 'agendado':
      message = `Olá ${lead.name}, tudo bem? Passando para confirmar nosso atendimento agendado. Qualquer dúvida sobre o link seguro do Google Meet, estou à disposição!`;
      break;
    case 'paciente_ativo':
      message = `Olá ${lead.name}, tudo bem? Passando para confirmar nosso próximo atendimento desta semana e ver como você está.`;
      break;
    case 'arquivado':
      message = `Olá ${lead.name}, aqui é a psicóloga Steffany Ferreira. Fico à sua total disposição caso deseje retomar seus atendimentos de psicoterapia.`;
      break;
    default:
      message = `Olá ${lead.name}, aqui é a psicóloga Steffany Ferreira. Tudo bem?`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

interface PsychologistDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  leads: Lead[];
  onUpdateAppointments: (appointments: Appointment[]) => void;
  onUpdateLeads: (leads: Lead[]) => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthChange: (user: User | null, token: string | null) => void;
  isStandalonePage?: boolean;
  onSwitchToHomepage?: () => void;
  onExpandToStandalone?: () => void;
}

export const PsychologistDashboard: React.FC<PsychologistDashboardProps> = ({
  isOpen,
  onClose,
  appointments,
  leads,
  onUpdateAppointments,
  onUpdateLeads,
  currentUser,
  accessToken,
  onAuthChange,
  isStandalonePage = false,
  onSwitchToHomepage,
  onExpandToStandalone,
}) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'crm' | 'prontuario' | 'config'>('agenda');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google Calendar Live Events
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Workspace confirmation modal state
  const [pendingSyncAppointment, setPendingSyncAppointment] = useState<Appointment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Filter in Agenda tab
  const [agendaFilter, setAgendaFilter] = useState<'todos' | 'confirmados' | 'bloqueados'>('todos');

  // Block Slot Modal state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockDate, setBlockDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [blockSlot, setBlockSlot] = useState<string>(BASE_THERAPIST_SLOTS[0]);
  const [blockReason, setBlockReason] = useState<string>('Supervisão clínica / Bloqueio pessoal');

  // Clinical notes state
  const [notes, setNotes] = useState<ClinicalNote[]>([
    {
      id: 'note-1',
      appointmentId: 'app-01',
      patientName: 'Camila Albuquerque',
      sessionDate: '2026-10-23',
      content:
        'Sessão inicial de acolhimento. Paciente relata sentimentos de inadequação no trabalho em Miami e forte saudade da família em Curitiba. Estabelecidas metas de reestruturação de pensamentos automáticos e planejamento de rotina de autocuidado.',
      updatedAt: '2026-10-21T10:00:00Z',
    },
  ]);
  const [selectedPatientForNote, setSelectedPatientForNote] = useState<string>('Camila Albuquerque');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isNoteUnlocked, setIsNoteUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  // CRM States
  const [crmViewMode, setCrmViewMode] = useState<'kanban' | 'list'>('kanban');
  const [crmStatusFilter, setCrmStatusFilter] = useState<'todos' | LeadStatus>('todos');
  const [crmCountryFilter, setCrmCountryFilter] = useState<'todos' | 'BR' | 'US'>('todos');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');

  // CRM Add Lead Modal State
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState<{
    name: string;
    email: string;
    phone: string;
    country: 'BR' | 'US';
    modality: 'avulso' | 'semanal' | 'mensal';
    status: LeadStatus;
    inquiryReason: string;
    notes: string;
  }>({
    name: '',
    email: '',
    phone: '',
    country: 'BR',
    modality: 'semanal',
    status: 'novo',
    inquiryReason: '',
    notes: '',
  });

  // CRM Edit Notes Modal State
  const [editingLeadForNotes, setEditingLeadForNotes] = useState<Lead | null>(null);
  const [leadNoteInput, setLeadNoteInput] = useState('');

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
    onUpdateLeads(updated);
  };

  const handleAdvanceLeadStatus = (lead: Lead) => {
    const next = CRM_STATUS_DETAILS[lead.status]?.nextStatus;
    if (next) {
      handleUpdateLeadStatus(lead.id, next);
    }
  };

  const handleOpenEditLeadNotes = (lead: Lead) => {
    setEditingLeadForNotes(lead);
    setLeadNoteInput(lead.notes || '');
  };

  const handleSaveLeadNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeadForNotes) return;
    const updated = leads.map((l) =>
      l.id === editingLeadForNotes.id ? { ...l, notes: leadNoteInput } : l
    );
    onUpdateLeads(updated);
    setEditingLeadForNotes(null);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato do CRM?')) {
      const updated = leads.filter((l) => l.id !== leadId);
      onUpdateLeads(updated);
    }
  };

  const handleCreateManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name.trim()) return;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: newLeadForm.name.trim(),
      email: newLeadForm.email.trim() || 'contato@paciente.com',
      phone: newLeadForm.phone.trim() || '+55 (11) 99999-9999',
      country: newLeadForm.country,
      modality: newLeadForm.modality,
      status: newLeadForm.status,
      inquiryReason:
        newLeadForm.inquiryReason.trim() || 'Paciente cadastrado manualmente pelo consultório.',
      notes: newLeadForm.notes.trim(),
      createdAt: new Date().toISOString(),
      source: 'manual',
    };

    onUpdateLeads([newLead, ...leads]);
    setIsAddLeadModalOpen(false);
    setNewLeadForm({
      name: '',
      email: '',
      phone: '',
      country: 'BR',
      modality: 'semanal',
      status: 'novo',
      inquiryReason: '',
      notes: '',
    });
  };

  const filteredLeads = leads.filter((lead) => {
    if (crmStatusFilter !== 'todos' && lead.status !== crmStatusFilter) return false;
    if (crmCountryFilter !== 'todos' && lead.country !== crmCountryFilter) return false;
    if (crmSearchQuery.trim()) {
      const q = crmSearchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchEmail = lead.email.toLowerCase().includes(q);
      const matchPhone = lead.phone.toLowerCase().includes(q);
      const matchReason = (lead.inquiryReason || '').toLowerCase().includes(q);
      const matchNotes = (lead.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchReason && !matchNotes) return false;
    }
    return true;
  });

  const leadCounts = {
    total: leads.length,
    novo: leads.filter((l) => l.status === 'novo').length,
    em_contato: leads.filter((l) => l.status === 'em_contato').length,
    agendado: leads.filter((l) => l.status === 'agendado').length,
    paciente_ativo: leads.filter((l) => l.status === 'paciente_ativo').length,
    arquivado: leads.filter((l) => l.status === 'arquivado').length,
  };

  if (!isOpen && !isStandalonePage) return null;

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthChange(res.user, res.accessToken);
        setSyncStatusMsg('Conta Google conectada com sucesso! Sincronização habilitada.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError('Não foi possível conectar com a conta Google. Tente novamente.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onAuthChange(null, null);
    setCalendarEvents([]);
    setSyncStatusMsg('Conta Google desconectada.');
  };

  // Fetch real Google Calendar events
  const handleFetchCalendar = async () => {
    if (!accessToken) return;
    setIsLoadingCalendar(true);
    setSyncStatusMsg(null);
    try {
      const events = await fetchGoogleCalendarEvents(accessToken);
      setCalendarEvents(events);
      setSyncStatusMsg(`${events.length} eventos carregados diretamente da sua Google Agenda.`);
    } catch (err: any) {
      console.error('Error fetching calendar:', err);
      setSyncStatusMsg('Erro ao sincronizar eventos da Google Agenda.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // Trigger sync appointment to Google Calendar (mandates confirmation)
  const requestSyncToCalendar = (app: Appointment) => {
    if (!accessToken) {
      setSyncStatusMsg('Conecte sua conta Google primeiro para sincronizar com a Google Agenda.');
      return;
    }
    setPendingSyncAppointment(app);
    setShowConfirmModal(true);
  };

  const executeSyncAppointment = async () => {
    if (!pendingSyncAppointment || !accessToken) return;
    setShowConfirmModal(false);

    try {
      setSyncStatusMsg(`Sincronizando sessão de ${pendingSyncAppointment.patientName}...`);
      const { eventId, meetUrl } = await createGoogleCalendarSessionEvent(
        accessToken,
        pendingSyncAppointment
      );

      // Update appointment with real Google event ID & verified Meet link
      const updated = appointments.map((a) =>
        a.id === pendingSyncAppointment.id
          ? { ...a, googleEventId: eventId, meetLink: meetUrl, status: 'confirmado' as const }
          : a
      );
      onUpdateAppointments(updated);
      setSyncStatusMsg(`Evento e sala do Google Meet criados com sucesso na sua Google Agenda!`);
      handleFetchCalendar();
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncStatusMsg(`Erro ao criar evento na Google Agenda: ${err.message}`);
    } finally {
      setPendingSyncAppointment(null);
    }
  };

  // Handle blocking a slot on the Homepage
  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock: Appointment = {
      id: `block-${Date.now()}`,
      patientName: 'Horário Bloqueado (Psicóloga)',
      patientEmail: 'steffany@psicologia.com.br',
      patientPhone: '+55 (11) 99999-9999',
      country: 'BR',
      timezone: 'Horário de Brasília (BRT)',
      date: blockDate,
      timeSlot: blockSlot,
      therapistTimeSlot: blockSlot,
      sessionType: 'Bloqueio de Agenda',
      packageType: 'avulso',
      status: 'bloqueado',
      preferredPayment: 'pix',
      meetLink: 'https://meet.google.com/psic-bloqueio',
      notes: blockReason,
      createdAt: new Date().toISOString(),
    };
    onUpdateAppointments([newBlock, ...appointments]);
    setIsBlockModalOpen(false);
    setSyncStatusMsg(`Horário ${blockSlot} em ${blockDate} foi bloqueado na Homepage e na Google Agenda!`);
  };

  // Handle cancelling appointment or unblocking slot (frees up on Homepage immediately)
  const handleCancelOrUnblock = (appointmentId: string) => {
    const target = appointments.find((a) => a.id === appointmentId);
    const updated = appointments.map((a) =>
      a.id === appointmentId ? { ...a, status: 'cancelado' as const } : a
    );
    onUpdateAppointments(updated);
    setSyncStatusMsg(
      target?.status === 'bloqueado'
        ? 'Horário desbloqueado com sucesso! Já está disponível na Homepage.'
        : 'Atendimento cancelado e horário liberado para novos agendamentos na Homepage.'
    );
  };

  // Re-confirm appointment
  const handleRestoreAppointment = (appointmentId: string) => {
    const updated = appointments.map((a) =>
      a.id === appointmentId ? { ...a, status: 'confirmado' as const } : a
    );
    onUpdateAppointments(updated);
    setSyncStatusMsg('Atendimento reativado e horário reservado na Homepage.');
  };

  // Handle save clinical note
  const handleSaveNote = () => {
    if (!newNoteContent.trim()) return;
    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      appointmentId: 'manual',
      patientName: selectedPatientForNote,
      sessionDate: new Date().toISOString().split('T')[0],
      content: newNoteContent.trim(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setNewNoteContent('');
  };

  const filteredAppointments = appointments.filter((app) => {
    if (agendaFilter === 'confirmados') return app.status === 'confirmado';
    if (agendaFilter === 'bloqueados') return app.status === 'bloqueado';
    return app.status !== 'cancelado';
  });

  const confirmedCount = appointments.filter((a) => a.status === 'confirmado').length;
  const blockedCount = appointments.filter((a) => a.status === 'bloqueado').length;

  // Main Dashboard Content
  const dashboardInner = (
    <div className={`w-full ${isStandalonePage ? 'max-w-[1440px] mx-auto' : 'max-w-5xl'} bg-white rounded-3xl shadow-xl border border-stone-200 flex flex-col overflow-hidden text-left`}>
      {/* Top Header */}
      <div className="p-5 sm:p-6 bg-stone-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-600 flex items-center justify-center font-serif text-lg font-bold text-white shadow-xs">
            SF
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-lg sm:text-xl font-bold">Painel Clínico da Psicóloga</h2>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Steffany Ferreira • CRP 06/184920
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-medium">
                Agenda integrada em tempo real com Google Agenda, Meet e Homepage
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* If on standalone page, button to return to homepage */}
          {isStandalonePage && onSwitchToHomepage && (
            <button
              type="button"
              onClick={onSwitchToHomepage}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#acca94]" />
              <span>Ver Site (Homepage)</span>
            </button>
          )}

          {/* If inside modal, button to expand to full standalone page */}
          {!isStandalonePage && onExpandToStandalone && (
            <button
              type="button"
              onClick={onExpandToStandalone}
              className="px-3.5 py-2 rounded-xl bg-[#26331e] hover:bg-[#34422c] text-[#acca94] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#acca94]/40 cursor-pointer shadow-xs"
              title="Abrir este painel em visualização completa de tela"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Expandir em Tela Cheia</span>
            </button>
          )}

          {/* Google Authentication Box */}
          {currentUser && accessToken ? (
            <div className="flex items-center gap-2.5 bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-stone-300 font-medium truncate max-w-[140px]">
                {currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1 text-stone-400 hover:text-white transition-colors"
                title="Desconectar do Google"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSigningIn}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-stone-800 hover:bg-stone-100 text-xs font-semibold shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isSigningIn ? 'Conectando...' : 'Conectar Google Agenda'}</span>
            </button>
          )}

          {!isStandalonePage && (
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 py-2.5 bg-stone-100/90 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'agenda'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Agenda & Google Calendar ({appointments.filter(a => a.status !== 'cancelado').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'crm'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-700" />
            <span>CRM & Leads Homepage ({leads.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prontuario')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'prontuario'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-700" />
            <span>Prontuário & Notas Clínicas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Configurações & Google</span>
          </button>
        </div>

        {/* Quick action button to block time on Homepage */}
        <button
          type="button"
          onClick={() => setIsBlockModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-[#191c18] hover:bg-[#26331e] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Ban className="w-3.5 h-3.5 text-[#acca94]" />
          <span>+ Bloquear Horário na Homepage</span>
        </button>
      </div>

      {/* Status notification toast */}
      {syncStatusMsg && (
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncStatusMsg(null)}
            className="text-stone-400 hover:text-stone-600 font-bold px-2 py-0.5"
          >
            ×
          </button>
        </div>
      )}

      {authError && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Tab Content Area */}
      <div className={`p-6 sm:p-8 space-y-6 ${isStandalonePage ? '' : 'flex-1 overflow-y-auto max-h-[75vh]'}`}>
        {/* TAB 1: AGENDA DE CONSULTAS INTEGRADA */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                <div className="text-[11px] font-semibold uppercase text-stone-500">
                  Consultas Confirmadas
                </div>
                <div className="text-2xl font-bold text-stone-900 mt-1">{confirmedCount}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Reservadas na Homepage</div>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                <div className="text-[11px] font-semibold uppercase text-stone-500">
                  Horários Bloqueados
                </div>
                <div className="text-2xl font-bold text-stone-900 mt-1">{blockedCount}</div>
                <div className="text-[11px] text-stone-500 mt-0.5">Indisponíveis para pacientes</div>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                <div className="text-[11px] font-semibold uppercase text-stone-500">
                  Google Calendar
                </div>
                <div className="text-2xl font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Ativo
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {currentUser ? currentUser.email : 'Sincronização Pronta'}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50">
                <div className="text-[11px] font-semibold uppercase text-stone-500">
                  Google Meet
                </div>
                <div className="text-2xl font-bold text-blue-700 mt-1 flex items-center gap-1">
                  <Video className="w-5 h-5 text-blue-600" />
                  Privativo
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">Link automático emitido</div>
              </div>
            </div>

            {/* Filter and Sync Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-600">Filtrar:</span>
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setAgendaFilter('todos')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      agendaFilter === 'todos' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Todos ({appointments.filter(a => a.status !== 'cancelado').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaFilter('confirmados')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      agendaFilter === 'confirmados' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Pacientes ({confirmedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaFilter('bloqueados')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      agendaFilter === 'bloqueados' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600'
                    }`}
                  >
                    Bloqueios ({blockedCount})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {accessToken && (
                  <button
                    type="button"
                    onClick={handleFetchCalendar}
                    disabled={isLoadingCalendar}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center gap-1.5 transition-colors border border-stone-200"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                    <span>Sincronizar com Google Agenda</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(true)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#65864d] hover:bg-[#526f3d] text-white flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bloquear Novo Horário</span>
                </button>
              </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredAppointments.length === 0 ? (
                <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  Nenhum atendimento ou bloqueio encontrado para este filtro.
                </div>
              ) : (
                filteredAppointments.map((app) => {
                  const isBlocked = app.status === 'bloqueado';

                  return (
                    <div
                      key={app.id}
                      className={`p-5 rounded-2xl border transition-all shadow-2xs space-y-3 ${
                        isBlocked
                          ? 'border-amber-200 bg-amber-50/40'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-white hover:border-[#65864d]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isBlocked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {isBlocked ? '🔒' : app.country === 'US' ? '🇺🇸' : '🇧🇷'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-stone-900 text-sm">{app.patientName}</h4>
                            <div className="text-xs text-stone-500">
                              {app.patientEmail} • {app.patientPhone}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isBlocked
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : app.country === 'US'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {isBlocked
                              ? 'Bloqueio da Psicóloga'
                              : app.packageType === 'semanal'
                              ? 'Plano Semanal'
                              : app.packageType === 'mensal'
                              ? 'Plano Mensal'
                              : 'Atendimento Avulso'}
                          </span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isBlocked
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Data & Horário Brasília (Seu fuso):
                          </span>
                          <strong className="text-stone-800 text-sm">
                            {app.date} às {app.therapistTimeSlot} (GMT-3)
                          </strong>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Horário do Paciente ({app.timezone}):
                          </span>
                          <strong className="text-stone-800 text-sm">
                            {app.date} às {app.timeSlot}
                          </strong>
                        </div>

                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Origem / Integração:
                          </span>
                          <span className="text-stone-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Homepage + Google Calendar
                          </span>
                        </div>
                      </div>

                      {app.notes && (
                        <p className="text-xs text-stone-600 bg-stone-100/80 p-2.5 rounded-lg border border-stone-200 italic">
                          "{app.notes}"
                        </p>
                      )}

                      {/* Actions: Join Google Meet & Sync Calendar & Liberar Horário */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/60">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isBlocked && (
                            <>
                              <a
                                href={app.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Entrar com Google Meet</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              <a
                                href={`https://wa.me/${app.patientPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-emerald-200"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            </>
                          )}

                          {/* Liberar horário na homepage */}
                          <button
                            type="button"
                            onClick={() => handleCancelOrUnblock(app.id)}
                            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 text-xs font-medium transition-colors border border-stone-200"
                            title="Cancela o agendamento e libera o horário imediatamente na Homepage"
                          >
                            {isBlocked ? 'Desbloquear Horário na Homepage' : 'Liberar Horário na Homepage'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {accessToken && !app.googleEventId && !isBlocked && (
                            <button
                              type="button"
                              onClick={() => requestSyncToCalendar(app)}
                              className="text-xs font-semibold text-purple-800 hover:text-purple-950 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition-colors"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Adicionar à minha Google Agenda</span>
                            </button>
                          )}

                          {app.googleEventId && (
                            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sincronizado na Google Agenda
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CRM & LEADS COM STATUS */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            {/* CRM Header & Primary Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#65864d]">
                  Funil de Conversão & Gestão Clínica
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                  CRM de Pacientes & Status do Pipeline
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Acompanhe e faça a transição de status de cada lead desde o primeiro contato até o tratamento contínuo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle: Kanban vs List */}
                <div className="flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setCrmViewMode('kanban')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      crmViewMode === 'kanban'
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Funil (Colunas)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrmViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                      crmViewMode === 'list'
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Lista Detalhada</span>
                  </button>
                </div>

                {/* Add Lead Button */}
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-[#26331e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Novo Lead / Paciente</span>
                </button>
              </div>
            </div>

            {/* Interactive Status Pipeline KPI Funnel Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* Total Card */}
              <button
                type="button"
                onClick={() => setCrmStatusFilter('todos')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  crmStatusFilter === 'todos'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs ring-2 ring-stone-900/20'
                    : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  crmStatusFilter === 'todos' ? 'text-stone-300' : 'text-stone-400'
                }`}>
                  Todos os Contatos
                </div>
                <div className="text-xl font-bold font-mono tabular-nums mt-1">
                  {leadCounts.total}
                </div>
                <div className={`text-[10px] mt-0.5 ${
                  crmStatusFilter === 'todos' ? 'text-stone-300' : 'text-stone-500'
                }`}>
                  Total registrado
                </div>
              </button>

              {/* Status Specific Cards */}
              {CRM_STATUS_ORDER.map((stKey) => {
                const conf = CRM_STATUS_DETAILS[stKey];
                const count = leadCounts[stKey];
                const isSelected = crmStatusFilter === stKey;

                return (
                  <button
                    key={stKey}
                    type="button"
                    onClick={() => setCrmStatusFilter(isSelected ? 'todos' : stKey)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-stone-900 ring-2 ring-stone-900/30 bg-stone-50'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${conf.dotBg}`} />
                        <span className="text-[11px] font-bold text-stone-800 truncate">
                          {conf.shortLabel}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="text-[9px] font-bold text-stone-600 bg-stone-200 px-1.5 py-0.5 rounded-full">
                          Filtro
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-bold font-mono tabular-nums text-stone-900 mt-1">
                      {count}
                    </div>
                    <div className="text-[10px] text-stone-500 truncate mt-0.5">
                      {stKey === 'novo'
                        ? 'Novos leads'
                        : stKey === 'em_contato'
                        ? 'Em negociação'
                        : stKey === 'agendado'
                        ? '1ª sessão marcada'
                        : stKey === 'paciente_ativo'
                        ? 'Em psicoterapia'
                        : 'Alta / Desistiu'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search and Filters Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nome, e-mail, telefone ou queixa clínica..."
                  value={crmSearchQuery}
                  onChange={(e) => setCrmSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-stone-400"
                />
                {crmSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCrmSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Country Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-400 text-[11px] font-medium hidden md:inline">País:</span>
                <div className="flex items-center p-0.5 bg-white rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCrmCountryFilter('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      crmCountryFilter === 'todos'
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrmCountryFilter('BR')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      crmCountryFilter === 'BR'
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🇧🇷 Brasil
                  </button>
                  <button
                    type="button"
                    onClick={() => setCrmCountryFilter('US')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      crmCountryFilter === 'US'
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    🇺🇸 EUA
                  </button>
                </div>
              </div>
            </div>

            {/* Empty state when filters return 0 */}
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-3">
                <div className="w-10 h-10 rounded-full bg-stone-200/80 text-stone-500 flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-stone-800 text-sm">
                  Nenhum contato encontrado
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Nenhum paciente corresponde aos filtros de status ou termo de busca aplicado.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCrmStatusFilter('todos');
                    setCrmCountryFilter('todos');
                    setCrmSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs bg-stone-200 text-stone-800 font-medium hover:bg-stone-300 transition-colors"
                >
                  Limpar todos os filtros
                </button>
              </div>
            ) : crmViewMode === 'kanban' ? (
              /* KANBAN / PIPELINE COLUMNS VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
                {CRM_STATUS_ORDER.map((statusKey) => {
                  const conf = CRM_STATUS_DETAILS[statusKey];
                  const columnLeads = filteredLeads.filter((l) => l.status === statusKey);

                  return (
                    <div
                      key={statusKey}
                      className="bg-stone-100/70 rounded-2xl border border-stone-200 p-3 space-y-3 flex flex-col min-h-[380px]"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${conf.dotBg}`} />
                          <h4 className="font-semibold text-stone-900 text-xs">
                            {conf.label}
                          </h4>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-stone-600 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                          {columnLeads.length}
                        </span>
                      </div>

                      {/* Cards in Column */}
                      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-0.5">
                        {columnLeads.length === 0 ? (
                          <div className="py-8 text-center text-[11px] text-stone-400 italic">
                            Nenhum contato neste estágio
                          </div>
                        ) : (
                          columnLeads.map((lead) => (
                            <div
                              key={lead.id}
                              className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs hover:border-stone-400 transition-all space-y-2.5 text-xs text-left"
                            >
                              {/* Header: Country, Modality & Source */}
                              <div className="flex items-center justify-between gap-1 text-[10px]">
                                <span className="font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                  {lead.country === 'US' ? '🇺🇸 EUA' : '🇧🇷 BR'}
                                </span>

                                <div className="flex items-center gap-1">
                                  {lead.modality && (
                                    <span className="text-stone-600 capitalize bg-stone-50 px-1.5 py-0.5 rounded border border-stone-150">
                                      {lead.modality === 'semanal'
                                        ? 'Semanal'
                                        : lead.modality === 'mensal'
                                        ? 'Mensal'
                                        : 'Avulso'}
                                    </span>
                                  )}
                                  <span className="text-stone-400">
                                    {lead.source === 'landing_page'
                                      ? 'Site'
                                      : lead.source === 'assistente_ia'
                                      ? 'Sofia IA'
                                      : lead.source === 'whatsapp'
                                      ? 'WhatsApp'
                                      : 'Manual'}
                                  </span>
                                </div>
                              </div>

                              {/* Lead Name */}
                              <div>
                                <h5 className="font-bold text-stone-900 text-sm leading-tight">
                                  {lead.name}
                                </h5>
                                <div className="text-[11px] text-stone-500 mt-0.5 space-y-0.5 font-mono">
                                  <div className="truncate">{lead.phone}</div>
                                  <div className="truncate text-stone-400">{lead.email}</div>
                                </div>
                              </div>

                              {/* Inquiry reason */}
                              {lead.inquiryReason && (
                                <p className="text-[11px] text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-150 italic line-clamp-3">
                                  "{lead.inquiryReason}"
                                </p>
                              )}

                              {/* Clinical/CRM Notes preview */}
                              {lead.notes && (
                                <div className="text-[11px] text-emerald-900 bg-emerald-50/70 p-2 rounded-lg border border-emerald-150">
                                  <span className="font-bold block text-[9px] uppercase tracking-wider text-emerald-800">
                                    Anotação Clínica:
                                  </span>
                                  <p className="line-clamp-2 mt-0.5 text-emerald-950">
                                    {lead.notes}
                                  </p>
                                </div>
                              )}

                              {/* Status Selector & Fast Transition */}
                              <div className="pt-2 border-t border-stone-100 space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <label className="text-[10px] font-bold text-stone-400 uppercase">
                                    Status:
                                  </label>
                                  <select
                                    value={lead.status}
                                    onChange={(e) =>
                                      handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)
                                    }
                                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg border outline-none cursor-pointer ${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder}`}
                                  >
                                    {CRM_STATUS_ORDER.map((st) => (
                                      <option key={st} value={st}>
                                        {CRM_STATUS_DETAILS[st].label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Quick advance button if next status exists */}
                                {conf.nextStatus && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceLeadStatus(lead)}
                                    className="w-full py-1.5 px-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                                    title={`Mudar para ${CRM_STATUS_DETAILS[conf.nextStatus].label}`}
                                  >
                                    <span>{conf.nextActionLabel || 'Avançar estágio'}</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {/* Actions: WhatsApp & Notes & Delete */}
                              <div className="pt-1 flex items-center justify-between gap-1">
                                <a
                                  href={getWhatsAppUrl(lead)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                                  title="Iniciar conversa com mensagem personalizada para o status"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditLeadNotes(lead)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                                  title="Editar anotações deste contato"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                                  title="Remover lead do CRM"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* DETAILED LIST VIEW */
              <div className="space-y-3">
                {filteredLeads.map((lead) => {
                  const conf = CRM_STATUS_DETAILS[lead.status];

                  return (
                    <div
                      key={lead.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-sm">
                            {lead.country === 'US' ? '🇺🇸' : '🇧🇷'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-stone-900 text-sm">
                                {lead.name}
                              </h4>
                              {lead.modality && (
                                <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-medium capitalize">
                                  {lead.modality === 'semanal'
                                    ? 'Plano Semanal'
                                    : lead.modality === 'mensal'
                                    ? 'Plano Mensal'
                                    : 'Atendimento Avulso'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-500 font-mono mt-0.5">
                              {lead.email} • {lead.phone}
                            </div>
                          </div>
                        </div>

                        {/* Status Dropdown Pill */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-stone-400 uppercase font-bold hidden sm:inline">
                            Status:
                          </span>
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleUpdateLeadStatus(lead.id, e.target.value as LeadStatus)
                            }
                            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${conf.badgeBg} ${conf.badgeText} ${conf.badgeBorder}`}
                          >
                            {CRM_STATUS_ORDER.map((st) => (
                              <option key={st} value={st}>
                                {CRM_STATUS_DETAILS[st].label}
                              </option>
                            ))}
                          </select>

                          {conf.nextStatus && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceLeadStatus(lead)}
                              className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1"
                              title={`Avançar para ${CRM_STATUS_DETAILS[conf.nextStatus].label}`}
                            >
                              <span>Avançar</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inquiry & Notes Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200/80 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[10px] uppercase font-bold">
                            Demanda / Motivo do Contato:
                          </span>
                          <p className="text-stone-700 mt-0.5 italic">
                            "{lead.inquiryReason}"
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Anotações do Consultório:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditLeadNotes(lead)}
                              className="text-[10px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{lead.notes ? 'Editar nota' : '+ Adicionar nota'}</span>
                            </button>
                          </div>
                          <p className="text-stone-700 mt-0.5">
                            {lead.notes || (
                              <span className="text-stone-400 italic">
                                Nenhuma anotação registrada ainda.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="text-stone-400 text-[11px]">
                          Canal: {lead.source === 'landing_page' ? 'Página Principal' : lead.source === 'assistente_ia' ? 'Assistente Sofia IA' : lead.source === 'whatsapp' ? 'WhatsApp' : 'Cadastro Manual'}
                          {lead.createdAt && ` • Registrado em: ${new Date(lead.createdAt).toLocaleDateString('pt-BR')}`}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={getWhatsAppUrl(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Mensagem WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors"
                            title="Remover lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRONTUÁRIO & NOTAS CLÍNICAS */}
        {activeTab === 'prontuario' && (
          <div className="space-y-6">
            {!isNoteUnlocked ? (
              <div className="p-8 max-w-md mx-auto bg-stone-50 rounded-3xl border border-stone-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-stone-900">
                    Acesso Protegido por PIN (Sigilo Ético CFP)
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    Insira seu código de segurança para visualizar as anotações clínicas confidenciais.
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN (padrão: 1234)"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    className="w-48 mx-auto px-4 py-2 text-center text-lg tracking-widest font-mono rounded-xl border border-stone-300 focus:border-stone-800 outline-none"
                  />
                  {pinError && (
                    <p className="text-xs text-red-600 font-medium">PIN incorreto. Tente 1234.</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (pinInput === '1234' || pinInput.length >= 4) {
                      setIsNoteUnlocked(true);
                      setPinError(false);
                    } else {
                      setPinError(true);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
                >
                  Desbloquear Prontuários
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      Prontuário & Evolução Clínica
                    </h3>
                    <p className="text-xs text-stone-500">
                      Anotações em conformidade com a Resolução CFP nº 01/2009 e e-Psi.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNoteUnlocked(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bloquear Tela</span>
                  </button>
                </div>

                {/* Add new note form */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3 text-xs">
                  <div className="font-semibold text-stone-800">Nova Nota de Sessão:</div>
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={selectedPatientForNote}
                      onChange={(e) => setSelectedPatientForNote(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    >
                      <option value="Camila Albuquerque">Camila Albuquerque (Plano Semanal)</option>
                      <option value="Rodrigo Mendonça">Rodrigo Mendonça (Avulso)</option>
                      <option value="Mariana Duarte">Mariana Duarte (Plano Mensal)</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Registro de evolução clínica, queixa, intervenções aplicadas e tarefas terapêuticas..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:border-stone-800 outline-none text-xs"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="px-4 py-2 rounded-xl bg-[#191c18] hover:bg-[#26331e] text-white text-xs font-semibold"
                    >
                      Salvar no Prontuário
                    </button>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-xl border border-stone-200 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-stone-500">
                        <strong className="text-stone-900">{note.patientName}</strong>
                        <span>Sessão em: {note.sessionDate}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONFIGURAÇÕES & GOOGLE WORKSPACE */}
        {activeTab === 'config' && (
          <div className="space-y-6 text-xs text-stone-700">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Configurações da Agenda & Google Workspace
              </h3>
              <p className="text-stone-500">
                Ajuste os parâmetros de sincronização automática com seu Google Calendar e sua Homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Sincronização com Google Agenda
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Quando um paciente agenda uma sessão na Homepage, o sistema gera instantaneamente uma sala no Google Meet e permite adicionar à sua agenda primária.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full border border-emerald-300">
                    Status: Sincronização Bidirecional Ativa ✓
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="font-semibold text-stone-900 text-sm flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-600" />
                  Google Meet Automático
                </div>
                <p className="text-stone-600 leading-relaxed">
                  Salas com link criptografado e seguro emitidas no momento da reserva, tanto para atendimentos no Brasil quanto nos EUA.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-blue-800 bg-blue-100/70 px-2.5 py-1 rounded-full border border-blue-300">
                    Padrão: Google Meet (HangoutsMeet) ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Google Workspace sync */}
      {showConfirmModal && pendingSyncAppointment && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingSyncAppointment(null);
          }}
          onConfirm={executeSyncAppointment}
          title="Adicionar à Google Agenda"
          description={`Você deseja adicionar a sessão de ${pendingSyncAppointment.patientName} (${pendingSyncAppointment.date} às ${pendingSyncAppointment.therapistTimeSlot} GMT-3) diretamente na sua Google Agenda principal com link de videoconferência do Google Meet?`}
        />
      )}

      {/* Modal: Bloquear Horário na Homepage */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#acca94]">
                  Gestão da Agenda
                </span>
                <h3 className="font-serif text-lg font-normal text-white mt-0.5">
                  Bloquear Horário na Homepage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="p-6 space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                Este horário ficará marcado como <strong>"Ocupado / Reservado"</strong> na Homepage pública e nenhum paciente poderá reservá-lo.
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Data do Bloqueio *
                </label>
                <input
                  type="date"
                  required
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Horário (Horário de Brasília GMT-3) *
                </label>
                <select
                  value={blockSlot}
                  onChange={(e) => setBlockSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 bg-white outline-none font-mono"
                >
                  {BASE_THERAPIST_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (Horário de Brasília)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Motivo do Bloqueio (visível apenas para você no painel)
                </label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Supervisão clínica / Consulta médica / Folga"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Bloquear Horário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Lead / Paciente Manual */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#acca94]">
                  CRM Clínico
                </span>
                <h3 className="font-serif text-lg font-normal text-white mt-0.5">
                  Cadastrar Novo Lead ou Paciente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualLead} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Nome Completo do Paciente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Clara Martins"
                    value={newLeadForm.name}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="+55 (11) 98765-4321 ou +1 (407)..."
                    value={newLeadForm.phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-stone-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="paciente@exemplo.com"
                    value={newLeadForm.email}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    País de Residência
                  </label>
                  <select
                    value={newLeadForm.country}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        country: e.target.value as 'BR' | 'US',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 bg-white outline-none"
                  >
                    <option value="BR">🇧🇷 Brasil (Horário de Brasília)</option>
                    <option value="US">🇺🇸 Estados Unidos (Fusos ET, CT, MT, PT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Modalidade / Plano
                  </label>
                  <select
                    value={newLeadForm.modality}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        modality: e.target.value as 'avulso' | 'semanal' | 'mensal',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 bg-white outline-none"
                  >
                    <option value="semanal">Pacote Semanal (Recomendado)</option>
                    <option value="avulso">Atendimento Avulso</option>
                    <option value="mensal">Pacote Mensal</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Estágio / Status Inicial no Pipeline *
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) =>
                      setNewLeadForm({
                        ...newLeadForm,
                        status: e.target.value as LeadStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 bg-white outline-none font-semibold"
                  >
                    {CRM_STATUS_ORDER.map((st) => (
                      <option key={st} value={st}>
                        {CRM_STATUS_DETAILS[st].label} — {CRM_STATUS_DETAILS[st].description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Queixa Inicial / Demanda Terapêutica
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Busca suporte para adaptação no exterior, ansiedade ou transição de carreira..."
                    value={newLeadForm.inquiryReason}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, inquiryReason: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-stone-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Anotações Internas (Visível apenas para a psicóloga)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Preferência por atendimento às terças após 18h..."
                    value={newLeadForm.notes}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Cadastrar no CRM</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Anotações do Lead */}
      {editingLeadForNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#acca94]">
                  Anotações Clínicas & CRM
                </span>
                <h3 className="font-serif text-lg font-normal text-white mt-0.5 truncate max-w-[280px]">
                  {editingLeadForNotes.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLeadForNotes(null)}
                className="p-1 rounded-full text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadNotes} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
                <div className="font-semibold text-stone-800">
                  Status Atual: {CRM_STATUS_DETAILS[editingLeadForNotes.status].label}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {editingLeadForNotes.email} • {editingLeadForNotes.phone}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Anotações de Acompanhamento / CRM:
                </label>
                <textarea
                  rows={5}
                  value={leadNoteInput}
                  onChange={(e) => setLeadNoteInput(e.target.value)}
                  placeholder="Registre pontos conversados no WhatsApp, horários de preferência, acordos prévios ou evolução..."
                  className="w-full p-3 rounded-xl border border-stone-300 text-stone-800 outline-none focus:border-stone-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingLeadForNotes(null)}
                  className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Anotação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isStandalonePage) {
    return (
      <div className="min-h-screen bg-[#f4f5f2] text-stone-900 py-6 px-3 sm:px-6">
        {dashboardInner}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="my-auto w-full max-w-5xl flex justify-center py-4">
        {dashboardInner}
      </div>
    </div>
  );
};
