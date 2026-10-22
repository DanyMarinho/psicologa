import { TimezoneOption, SessionPlan, Appointment, Lead } from '../types';

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  {
    id: 'brt',
    label: 'Horário de Brasília (BRT)',
    city: 'São Paulo, Rio de Janeiro, Brasília',
    offset: 'GMT-3',
    iana: 'America/Sao_Paulo',
  },
  {
    id: 'eastern',
    label: 'EUA Eastern Time (ET)',
    city: 'New York, Miami, Orlando, Boston, Atlanta',
    offset: 'GMT-4',
    iana: 'America/New_York',
  },
  {
    id: 'central',
    label: 'EUA Central Time (CT)',
    city: 'Chicago, Dallas, Houston, Austin',
    offset: 'GMT-5',
    iana: 'America/Chicago',
  },
  {
    id: 'mountain',
    label: 'EUA Mountain Time (MT)',
    city: 'Denver, Phoenix, Salt Lake City',
    offset: 'GMT-6',
    iana: 'America/Denver',
  },
  {
    id: 'pacific',
    label: 'EUA Pacific Time (PT)',
    city: 'Los Angeles, San Francisco, Seattle, San Diego',
    offset: 'GMT-7',
    iana: 'America/Los_Angeles',
  },
];

export const SESSION_PLANS: SessionPlan[] = [
  {
    id: 'pacote-avulso',
    title: 'Avulso',
    packageType: 'avulso',
    durationMinutes: 50,
    description: 'Sessão individual no seu ritmo. Ideal para iniciar, tirar dúvidas ou trabalhar uma demanda urgente e pontual.',
    benefits: [
      'Sessão individual de 50 minutos',
      'Sala privativa no Google Meet',
      'Liberdade total, sem mensalidade',
    ],
  },
  {
    id: 'pacote-semanal',
    title: 'Pacote Semanal',
    packageType: 'semanal',
    durationMinutes: 50,
    description: 'Acompanhamento contínuo semanal. Seu dia e horário fixos garantidos na agenda com foco em evolução constante.',
    benefits: [
      'Horário fixo reservado no seu fuso',
      'Consistência e evolução terapêutica',
      'Apoio constante para momentos de sobrecarga',
    ],
    popular: true,
  },
  {
    id: 'pacote-mensal',
    title: 'Pacote Mensal',
    packageType: 'mensal',
    durationMinutes: 50,
    description: 'Ciclo completo de 4 sessões mensais. Estrutura sólida para metas clínicas, autoconhecimento e regulação emocional.',
    benefits: [
      'Ciclo estruturado de 4 atendimentos',
      'Metas clínicas personalizadas',
      'Flexibilidade para reagendamentos com aviso prévio',
    ],
  },
];

// Therapist base available slots (in Brasília Time GMT-3)
export const BASE_THERAPIST_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

/**
 * Calculates what time a Brasília slot corresponds to in the patient's selected timezone
 */
export function convertSlotTime(
  slotBrt: string,
  targetTimezoneId: string
): { patientTime: string; diffHours: number } {
  const [hStr, mStr] = slotBrt.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  let diff = 0;
  if (targetTimezoneId === 'eastern') diff = -1;
  else if (targetTimezoneId === 'central') diff = -2;
  else if (targetTimezoneId === 'mountain') diff = -3;
  else if (targetTimezoneId === 'pacific') diff = -4;

  let patientH = h + diff;
  if (patientH < 0) patientH += 24;
  if (patientH >= 24) patientH -= 24;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    patientTime: `${pad(patientH)}:${pad(m)}`,
    diffHours: diff,
  };
}

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-01',
    patientName: 'Camila Albuquerque',
    patientEmail: 'camila.alb@exemplo.com',
    patientPhone: '+1 (786) 554-9210',
    country: 'US',
    timezone: 'EUA Eastern Time (ET)',
    date: '2026-10-23',
    timeSlot: '13:00',
    therapistTimeSlot: '14:00',
    sessionType: 'Plano Semanal',
    packageType: 'semanal',
    status: 'confirmado',
    preferredPayment: 'stripe',
    meetLink: 'https://meet.google.com/qmv-xkzw-gny',
    notes: 'Expatriada em Miami. Foco em luto migratório e adaptação profissional.',
    createdAt: '2026-10-20T14:32:00Z',
  },
  {
    id: 'app-02',
    patientName: 'Rodrigo Mendonça',
    patientEmail: 'rodrigo.m@exemplo.com.br',
    patientPhone: '+55 (11) 98765-4321',
    country: 'BR',
    timezone: 'Horário de Brasília (BRT)',
    date: '2026-10-23',
    timeSlot: '16:00',
    therapistTimeSlot: '16:00',
    sessionType: 'Atendimento Avulso',
    packageType: 'avulso',
    status: 'confirmado',
    preferredPayment: 'pix',
    meetLink: 'https://meet.google.com/btr-mwnp-pqs',
    notes: 'Paciente em São Paulo. Foco em manejo de ansiedade generalizada.',
    createdAt: '2026-10-21T09:15:00Z',
  },
  {
    id: 'app-03',
    patientName: 'Mariana Duarte',
    patientEmail: 'marianad@exemplo.com',
    patientPhone: '+1 (415) 883-2941',
    country: 'US',
    timezone: 'EUA Pacific Time (PT)',
    date: '2026-10-24',
    timeSlot: '11:00',
    therapistTimeSlot: '15:00',
    sessionType: 'Plano Mensal',
    packageType: 'mensal',
    status: 'confirmado',
    preferredPayment: 'stripe',
    meetLink: 'https://meet.google.com/hza-cydv-zwt',
    notes: 'Engenheira no Vale do Silício. Foco em síndrome do impostor e rotina.',
    createdAt: '2026-10-21T11:40:00Z',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Juliana Castro',
    email: 'juliana.c@gmail.com',
    phone: '+1 (407) 991-8822',
    country: 'US',
    inquiryReason: 'Interesse no Plano Semanal para luto migratório nos EUA e adaptação em Orlando.',
    status: 'novo',
    createdAt: '2026-10-21T08:12:00Z',
    source: 'landing_page',
    modality: 'semanal',
    notes: 'Solicitou contato preferencialmente no final da tarde (fuso ET).',
  },
  {
    id: 'lead-2',
    name: 'Felipe Santana',
    email: 'felipe.s@outlook.com',
    phone: '+55 (21) 99881-2233',
    country: 'BR',
    inquiryReason: 'Interesse no Atendimento Avulso para transição de carreira e burnout corporativo.',
    status: 'em_contato',
    createdAt: '2026-10-20T19:25:00Z',
    source: 'assistente_ia',
    modality: 'avulso',
    notes: 'Conversando pelo WhatsApp. Avaliando disponibilidade para quartas-feiras às 19h.',
  },
  {
    id: 'lead-3',
    name: 'Beatriz Vasconcelos',
    email: 'b.vasconcelos@yahoo.com',
    phone: '+1 (617) 443-1290',
    country: 'US',
    inquiryReason: 'Plano Mensal agendado via Google Meet para foco em ansiedade acadêmica.',
    status: 'agendado',
    createdAt: '2026-10-19T15:04:00Z',
    source: 'landing_page',
    modality: 'mensal',
    notes: 'Primeira sessão agendada para 24/10 às 11h ET. Link do Meet já enviado.',
  },
  {
    id: 'lead-4',
    name: 'Camila Albuquerque',
    email: 'camila.albuquerque@gmail.com',
    phone: '+1 (305) 902-4411',
    country: 'US',
    inquiryReason: 'Expatriada em Miami. Plano Semanal com sessões fixas às quintas.',
    status: 'paciente_ativo',
    createdAt: '2026-10-15T11:00:00Z',
    source: 'landing_page',
    modality: 'semanal',
    notes: 'Paciente regular. Realizando 3ª sessão; evolução favorável em regulação emocional.',
  },
  {
    id: 'lead-5',
    name: 'Rodrigo Mendonça',
    email: 'rodrigo.m@exemplo.com.br',
    phone: '+55 (11) 98765-4321',
    country: 'BR',
    inquiryReason: 'Manejo de ansiedade generalizada e estresse ocupacional.',
    status: 'paciente_ativo',
    createdAt: '2026-10-10T14:30:00Z',
    source: 'whatsapp',
    modality: 'avulso',
    notes: 'Retornos quinzenais conforme demanda pontual de trabalho.',
  },
  {
    id: 'lead-6',
    name: 'Lucas Pinho',
    email: 'lucas.pinho@empresa.com',
    phone: '+55 (31) 99123-5566',
    country: 'BR',
    inquiryReason: 'Dúvidas sobre atendimento para casal (não realizamos no momento).',
    status: 'arquivado',
    createdAt: '2026-10-12T09:20:00Z',
    source: 'landing_page',
    modality: 'avulso',
    notes: 'Orientado que o atendimento clínico é estritamente individual. Contato arquivado.',
  },
];
