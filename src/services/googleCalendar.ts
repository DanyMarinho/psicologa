import { Appointment } from '../types';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
}

/**
 * Fetch upcoming events from the authenticated psychologist's Google Calendar
 */
export async function fetchGoogleCalendarEvents(accessToken: string): Promise<GoogleCalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&maxResults=20&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Falha ao carregar eventos da Google Agenda: ${errorText}`);
  }

  const data = await res.json();
  return data.items || [];
}

/**
 * Create a therapy session in Google Calendar with an automated Google Meet conference link
 */
export async function createGoogleCalendarSessionEvent(
  accessToken: string,
  appointment: Appointment
): Promise<{ eventId: string; meetUrl: string }> {
  const startTime = new Date(`${appointment.date}T${appointment.therapistTimeSlot}:00-03:00`);
  const endTime = new Date(startTime.getTime() + 50 * 60 * 1000); // 50-minute session

  const requestId = `sessao-${appointment.id}-${Date.now()}`;

  const eventPayload = {
    summary: `Sessão de Psicoterapia - ${appointment.patientName} & Psic. Steffany Ferreira`,
    description: `Atendimento Psicológico Online (50 minutos)
Paciente: ${appointment.patientName}
E-mail: ${appointment.patientEmail}
WhatsApp: ${appointment.patientPhone}
País/Modalidade: ${appointment.country === 'US' ? 'EUA (Atendimento a Expatriados)' : 'Brasil'}
Fuso do Paciente: ${appointment.timezone} (${appointment.timeSlot})
Fuso da Psicóloga: Horário de Brasília GMT-3 (${appointment.therapistTimeSlot})
Modalidade: ${appointment.sessionType} (${appointment.packageType === 'semanal' ? 'Plano Semanal' : appointment.packageType === 'mensal' ? 'Plano Mensal' : 'Atendimento Avulso'})

Link da Videochamada: Google Meet gerado automaticamente.
Código de Ética do Psicólogo (CFP): Sigilo profissional e confidencialidade garantidos.`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'America/Sao_Paulo',
    },
    attendees: [
      {
        email: appointment.patientEmail,
        displayName: appointment.patientName,
      },
    ],
    conferenceData: {
      createRequest: {
        requestId,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Erro ao criar evento na Google Agenda:', errorBody);
    throw new Error(`Erro ao criar evento: ${response.statusText}`);
  }

  const result = await response.json();
  const meetUrl =
    result.hangoutLink ||
    result.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri ||
    `https://meet.google.com/new`;

  return {
    eventId: result.id,
    meetUrl,
  };
}

/**
 * Generate a quick Google Calendar web direct link for patients to add to their calendar
 */
export function generatePatientGoogleCalendarLink(appointment: Appointment): string {
  // Use ISO format without colons or dashes
  const startTime = new Date(`${appointment.date}T${appointment.timeSlot}:00`);
  const endTime = new Date(startTime.getTime() + 50 * 60 * 1000);

  const formatCalDate = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const title = encodeURIComponent(`Sessão de Psicoterapia - Psic. Steffany Ferreira`);
  const details = encodeURIComponent(
    `Sessão de Psicoterapia Online com a Psicóloga Steffany Ferreira (CRP 06/184920).\n\nLink da Videochamada: ${appointment.meetLink}\nDuração: 50 minutos\nEm caso de dúvidas, envie mensagem pelo WhatsApp.`
  );
  const location = encodeURIComponent(appointment.meetLink);
  const dates = `${formatCalDate(startTime)}/${formatCalDate(endTime)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}
