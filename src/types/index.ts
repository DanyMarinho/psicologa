export type CountryMode = 'BR' | 'US';

export interface TimezoneOption {
  id: string;
  label: string;
  city: string;
  offset: string; // e.g. "GMT-3", "GMT-4"
  iana: string; // e.g. "America/Sao_Paulo", "America/New_York"
}

export interface SessionPlan {
  id: string;
  title: string;
  packageType: 'avulso' | 'semanal' | 'mensal';
  durationMinutes: number;
  description: string;
  benefits: string[];
  popular?: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  country: CountryMode;
  timezone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm (in patient's timezone)
  therapistTimeSlot: string; // HH:mm (in Brasília time GMT-3)
  sessionType: string;
  packageType: 'avulso' | 'semanal' | 'mensal';
  status: 'confirmado' | 'pendente' | 'bloqueado' | 'cancelado';
  preferredPayment: 'pix' | 'credit_card' | 'stripe';
  meetLink: string;
  googleEventId?: string;
  notes?: string;
  createdAt: string;
}

export type LeadStatus = 'novo' | 'em_contato' | 'agendado' | 'paciente_ativo' | 'arquivado';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: CountryMode;
  inquiryReason: string;
  status: LeadStatus;
  createdAt: string;
  source: 'landing_page' | 'assistente_ia' | 'whatsapp' | 'manual';
  notes?: string;
  modality?: 'avulso' | 'semanal' | 'mensal';
  lastContactDate?: string;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  patientName: string;
  sessionDate: string;
  content: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
