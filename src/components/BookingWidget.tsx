import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, type Variants } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe2,
  Video,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Check,
  X,
  ThumbsUp,
  Star,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  CountryMode,
  Appointment,
  SessionPlan,
  TimezoneOption,
} from '../types';
import {
  TIMEZONE_OPTIONS,
  SESSION_PLANS,
  BASE_THERAPIST_SLOTS,
  convertSlotTime,
} from '../data/mockData';
import { generatePatientGoogleCalendarLink } from '../services/googleCalendar';

interface BookingWidgetProps {
  countryMode: CountryMode;
  onAppointmentBooked: (app: Appointment) => void;
  onOpenChat: () => void;
  existingAppointments?: Appointment[];
}

// Framer Motion Animation Variants for Staggered Fade-in with Vertical Displacement
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const cardFadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // Smooth cubic out
    },
  },
};

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  countryMode,
  onAppointmentBooked,
  onOpenChat,
  existingAppointments = [],
}) => {
  // Category selection (Avulso, Pacote Semanal, Pacote Mensal)
  const [selectedPlan, setSelectedPlan] = useState<SessionPlan>(SESSION_PLANS[1]); // default Pacote Semanal

  // Timezone selection
  const [selectedTimezone, setSelectedTimezone] = useState<TimezoneOption>(
    countryMode === 'US' ? TIMEZONE_OPTIONS[1] : TIMEZONE_OPTIONS[0]
  );

  // Date selection (10 available weekdays)
  const today = new Date();
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // skip Sunday
    return {
      isoString: d.toISOString().split('T')[0],
      dayOfWeek: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      fullDate: d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  })
    .filter((v, i, a) => a.findIndex((t) => t.isoString === v.isoString) === i)
    .slice(0, 10);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].isoString);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingSlotBrt, setBookingSlotBrt] = useState<string>(BASE_THERAPIST_SLOTS[2]);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Form Fields
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [inquiryReason, setInquiryReason] = useState('Ansiedade e estresse');
  const [notes, setNotes] = useState('');
  const [preferredPayment, setPreferredPayment] = useState<'pix' | 'credit_card' | 'stripe'>(
    countryMode === 'US' ? 'stripe' : 'pix'
  );

  // Convert slot time
  const currentConvertedSlot = convertSlotTime(bookingSlotBrt, selectedTimezone.id);

  const handleOpenSlotModal = (brtSlot: string) => {
    setBookingSlotBrt(brtSlot);
    setIsModalOpen(true);
  };

  const handleSelectPlan = (plan: SessionPlan) => {
    setSelectedPlan(plan);
  };

  const handleFinalizeBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientEmail || !patientPhone) return;

    const randomCode =
      Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    const meetLink = `https://meet.google.com/${randomCode}`;

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      patientName,
      patientEmail,
      patientPhone: patientPhone.startsWith('+')
        ? patientPhone
        : countryMode === 'US'
        ? `+1 ${patientPhone}`
        : `+55 ${patientPhone}`,
      country: countryMode,
      timezone: selectedTimezone.label,
      date: selectedDate,
      timeSlot: currentConvertedSlot.patientTime,
      therapistTimeSlot: bookingSlotBrt,
      sessionType: selectedPlan.title,
      packageType: selectedPlan.packageType,
      status: 'confirmado',
      preferredPayment,
      meetLink,
      notes: `${inquiryReason}. ${notes}`.trim(),
      createdAt: new Date().toISOString(),
    };

    setConfirmedAppointment(newAppointment);
    onAppointmentBooked(newAppointment);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#65864d', '#26331e', '#acca94', '#d8e3cf'],
    });
  };

  const selectedDateObject = availableDates.find((d) => d.isoString === selectedDate) || availableDates[0];

  return (
    <section id="agendamento" className="py-20 sm:py-28 bg-[#f6f6f3] border-b border-[#e6e6e6] scroll-mt-10">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-8 space-y-16">
        {/* Section 1: Formatos de Atendimento (Minimalist Dark Presentation Cards with Top Ambient Glow) */}
        <div
          id="categorias"
          className="relative rounded-3xl bg-[#0d1210] border border-[#212923] p-7 sm:p-12 md:p-14 overflow-hidden text-left shadow-2xl"
        >
          {/* Subtle top ambient glowing halo matching design reference */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] pointer-events-none rounded-full opacity-60"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(163, 191, 115, 0.35) 0%, rgba(101, 134, 77, 0.12) 50%, transparent 75%)',
            }}
          />

          <div className="relative z-10 space-y-10">
            {/* Header: Minimal & refined */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#212923]">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-[#a3bf73] font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a3bf73] inline-block animate-pulse" />
                  Formatos de Atendimento
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.03em] text-white mt-1">
                  Planos de Psicoterapia
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
                Sessões individuais de 50 minutos via Google Meet. Escolha a frequência ideal para seu momento.
              </p>
            </div>

            {/* 3 Minimal Dark Cards with Framer Motion Staggered Fade-In */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  plan: SESSION_PLANS[0],
                  icon: <ThumbsUp className="w-4 h-4 text-white" />,
                  badge: null,
                  bigHeading: 'Avulso',
                  bigSub: 'Sessão individual (50 min)',
                  desc: 'Atendimento pontual no seu próprio ritmo, sem fidelidade ou compromisso contínuo.',
                  features: [
                    'Sessão individual de 50 min',
                    'Google Meet privativo',
                    'Sem vínculo fixo',
                  ],
                },
                {
                  plan: SESSION_PLANS[1],
                  icon: <Star className="w-4 h-4 text-white fill-white/20" />,
                  badge: 'Mais procurado',
                  bigHeading: 'Semanal',
                  bigSub: '1 atendimento por semana',
                  desc: 'Acompanhamento contínuo com dia e horário fixos garantidos na agenda clínica.',
                  features: [
                    'Horário fixo semanal reservado',
                    'Evolução contínua em TCC',
                    'Flexibilidade para reagendamentos',
                  ],
                },
                {
                  plan: SESSION_PLANS[2],
                  icon: <Sparkles className="w-4 h-4 text-white" />,
                  badge: null,
                  bigHeading: 'Mensal',
                  bigSub: 'Ciclo completo de 4 sessões',
                  desc: 'Processo estruturado com metas terapêuticas definidas e suporte regular.',
                  features: [
                    'Ciclo de 4 atendimentos',
                    'Plano terapêutico estruturado',
                    'Atendimento para brasileiros no exterior',
                  ],
                },
              ].map((card) => {
                const isSelected = selectedPlan.id === card.plan.id;

                return (
                  <motion.div
                    key={card.plan.id}
                    variants={cardFadeInVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleSelectPlan(card.plan);
                      const target = document.getElementById('calendario-agendamento');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between cursor-pointer relative border transition-colors duration-200 ${
                      isSelected
                        ? 'bg-[#151b17] border-[#65864d] shadow-[0_0_30px_rgba(101,134,77,0.2)] ring-1 ring-[#65864d]'
                        : 'bg-[#121614] border-[#222924] hover:border-[#354038] hover:bg-[#141916]'
                    }`}
                  >
                    <div className="space-y-5">
                      {/* Top Row: Icon + Title + (Optional Badge) */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1e2521] border border-white/10 flex items-center justify-center text-white shrink-0">
                            {card.icon}
                          </div>
                          <span className="font-semibold text-base text-white tracking-tight">
                            {card.plan.title}
                          </span>
                        </div>

                        {card.badge && (
                          <span className="text-[11px] font-medium text-[#facc15] bg-[#854d0e]/25 border border-[#ca8a04]/40 px-2.5 py-0.5 rounded-full tracking-wide">
                            {card.badge}
                          </span>
                        )}
                      </div>

                      {/* Big Heading Highlight */}
                      <div className="space-y-1">
                        <div className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                          {card.bigHeading}
                        </div>
                        <div className="text-xs text-stone-400">
                          {card.bigSub}
                        </div>
                      </div>

                      {/* Clean Minimal Description */}
                      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed min-h-[40px]">
                        {card.desc}
                      </p>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPlan(card.plan);
                          const target = document.getElementById('calendario-agendamento');
                          if (target) {
                            target.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                          isSelected
                            ? 'bg-white text-[#121614] font-semibold hover:bg-stone-100 shadow-sm'
                            : 'bg-[#2b312d] hover:bg-[#363e38] text-white border border-white/5'
                        }`}
                      >
                        {isSelected ? 'Formato Selecionado ✓' : 'Escolher este formato'}
                      </button>

                      {/* Minimal Checklist */}
                      <div className="pt-2 space-y-2.5">
                        {card.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-stone-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-stone-400 shrink-0 stroke-[1.8]" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Section 2: Modern Card-Based Booking Interface */}
        <div
          id="calendario-agendamento"
          className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 border border-[#e6e6e6] shadow-sm text-left space-y-10 scroll-mt-20"
        >
          {/* Header with clear typography and minimal text */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#65864d] font-semibold flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-[#65864d]" />
                Agendamento Direto
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-[#191c18] mt-1">
                Reserve sua Consulta
              </h3>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs sm:text-sm text-stone-500 max-w-md leading-relaxed">
                Atendimento seguro via Google Meet com link automático emitido na confirmação.
              </p>
              <div className="inline-flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">Sincronizado com Google Agenda em tempo real</span>
              </div>
            </div>
          </div>

          {/* STEP 1: Elegant, Touch-Friendly Package Selection Blocks with Framer Motion Staggered Fade-In */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                1. Escolha o Formato do Atendimento
              </span>
              <span className="text-xs text-stone-400">
                Selecionado: <strong className="text-[#191c18] font-semibold">{selectedPlan.title}</strong>
              </span>
            </div>

            {/* Framer-Motion Stagger Container for Modality Cards */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3.5"
            >
              {[
                {
                  plan: SESSION_PLANS[0],
                  title: 'Avulso',
                  subtitle: 'Sessão individual pontual',
                  badge: 'Flexível',
                  duration: '50 minutos • No seu ritmo',
                },
                {
                  plan: SESSION_PLANS[1],
                  title: 'Pacote Semanal',
                  subtitle: '1 sessão por semana com horário fixo',
                  badge: 'Mais procurado',
                  duration: '50 min/sessão • Acompanhamento contínuo',
                },
                {
                  plan: SESSION_PLANS[2],
                  title: 'Pacote Mensal',
                  subtitle: 'Ciclo completo de 4 atendimentos',
                  badge: 'Completo',
                  duration: '4 sessões • Metas estruturadas',
                },
              ].map((item) => {
                const isSelected = selectedPlan.id === item.plan.id;

                return (
                  <motion.button
                    key={item.plan.id}
                    variants={cardFadeInVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleSelectPlan(item.plan)}
                    className={`group text-left p-4 sm:p-5 rounded-2xl border transition-colors duration-150 flex flex-col justify-between gap-3 relative ${
                      isSelected
                        ? 'border-[#191c18] bg-[#191c18] text-white shadow-md ring-2 ring-[#65864d]/30'
                        : 'border-[#e6e6e6] bg-[#f9faf7] hover:border-stone-400 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base sm:text-lg tracking-tight">
                          {item.title}
                        </span>

                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-[#acca94]/20 text-[#acca94] border border-[#acca94]/30'
                              : 'bg-stone-200/80 text-stone-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 w-full text-[11px]">
                      <span className={isSelected ? 'text-stone-300' : 'text-stone-500'}>
                        {item.duration}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#acca94] text-[#191c18]'
                            : 'border border-stone-300 group-hover:border-stone-500'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* STEP 2: Timezone & Date Selector in Clean Modern Cards */}
          <div className="space-y-6 pt-2">
            {/* Timezone Selector */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-[#65864d]" />
                  2. Fuso Horário Local
                </span>
                <span className="text-[11px] text-stone-400">
                  Sincronizado automaticamente com Brasília (GMT-3)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {TIMEZONE_OPTIONS.map((tz) => {
                  const isSelected = selectedTimezone.id === tz.id;
                  const isBrazil = tz.id === 'brt';

                  return (
                    <button
                      key={tz.id}
                      type="button"
                      onClick={() => setSelectedTimezone(tz)}
                      className={`px-3 py-2.5 rounded-xl text-left border text-xs transition-all ${
                        isSelected
                          ? 'border-[#191c18] bg-[#191c18] text-white shadow-xs'
                          : 'border-[#e6e6e6] bg-[#f9faf7] hover:border-stone-400 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {isBrazil ? '🇧🇷 BRT' : `🇺🇸 ${tz.offset}`}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {tz.offset}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] truncate mt-0.5 ${
                          isSelected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {tz.label.split('(')[0].trim()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Selector Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                  3. Escolha o Dia
                </span>
                <span className="text-xs text-stone-500 font-medium capitalize">
                  {selectedDateObject.fullDate}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((item) => {
                  const isSelected = selectedDate === item.isoString;
                  return (
                    <button
                      key={item.isoString}
                      type="button"
                      onClick={() => setSelectedDate(item.isoString)}
                      className={`shrink-0 w-[76px] py-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#191c18] bg-[#191c18] text-white shadow-sm'
                          : 'border-[#e6e6e6] bg-[#f9faf7] hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                        {item.dayOfWeek}
                      </div>
                      <div className="text-xl font-bold mt-0.5 leading-none">{item.dayNumber}</div>
                      <div className="text-[10px] opacity-70 mt-1 capitalize">{item.month}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 3: Available Time Slots Grid with Framer Motion Staggered Fade-In */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                4. Horários Disponíveis para {selectedDateObject.dayOfWeek}, {selectedDateObject.dayNumber} de {selectedDateObject.month}
              </span>
              <span className="text-xs text-stone-400">
                Sessão com <strong className="text-stone-700">{selectedPlan.title}</strong>
              </span>
            </div>

            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {BASE_THERAPIST_SLOTS.map((brtSlot) => {
                const converted = convertSlotTime(brtSlot, selectedTimezone.id);
                const isBooked = existingAppointments.some(
                  (app) =>
                    app.date === selectedDate &&
                    app.therapistTimeSlot === brtSlot &&
                    app.status !== 'cancelado'
                );

                if (isBooked) {
                  return (
                    <div
                      key={brtSlot}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-100/80 text-left flex flex-col justify-between gap-3 opacity-60 cursor-not-allowed select-none"
                    >
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-lg font-bold text-stone-400 tracking-tight line-through">
                            {converted.patientTime}
                          </span>
                          <span className="text-[9px] bg-stone-300 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                            Ocupado
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {selectedTimezone.id !== 'brt' ? `${brtSlot} Brasília • ` : ''}Google Agenda
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-[11px] text-stone-400">
                        <span className="flex items-center gap-1 text-[10px]">
                          <CalendarIcon className="w-3 h-3 text-stone-400" />
                          Reservado
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">Indisponível</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <motion.button
                    key={brtSlot}
                    variants={cardFadeInVariants}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleOpenSlotModal(brtSlot)}
                    className="group p-4 rounded-2xl border border-[#e6e6e6] bg-[#f9faf7] hover:bg-white hover:border-[#65864d] hover:shadow-md transition-colors text-left flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-[#191c18] tracking-tight group-hover:text-[#65864d] transition-colors">
                          {converted.patientTime}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {selectedTimezone.offset}
                        </span>
                      </div>

                      {selectedTimezone.id !== 'brt' && (
                        <div className="text-[11px] text-stone-400">
                          {brtSlot} Brasília
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 text-xs">
                      <span className="text-[11px] text-stone-500 flex items-center gap-1">
                        <Video className="w-3 h-3 text-[#65864d]" />
                        Meet
                      </span>
                      <span className="text-xs font-medium text-[#191c18] group-hover:underline flex items-center gap-0.5">
                        Reservar
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Patient Reservation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="p-6 bg-[#f6f6f3] border-b border-[#e6e6e6] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#65864d]">
                    Confirmação de Reserva
                  </span>
                  <h3 className="font-serif text-xl font-normal text-[#191c18] mt-0.5">
                    {selectedPlan.title} (50 min)
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setConfirmedAppointment(null);
                  }}
                  type="button"
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!confirmedAppointment ? (
                <form onSubmit={handleFinalizeBooking} className="p-6 space-y-4">
                  {/* Slot Details Summary Box */}
                  <div className="bg-[#f6f6f3] p-4 rounded-2xl border border-[#e6e6e6] text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Data da Consulta:</span>
                      <strong className="text-stone-800">{selectedDateObject.fullDate}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Seu Horário Local:</span>
                      <strong className="text-[#191c18]">
                        {currentConvertedSlot.patientTime} ({selectedTimezone.label})
                      </strong>
                    </div>
                    {selectedTimezone.id !== 'brt' && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Horário em Brasília:</span>
                        <strong className="text-stone-800">{bookingSlotBrt} (GMT-3)</strong>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-stone-200/80">
                      <span className="text-stone-500">Modalidade:</span>
                      <strong className="text-[#26331e] font-semibold">{selectedPlan.title}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Silva"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6e6] focus:border-[#191c18] outline-none text-xs sm:text-sm text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        E-mail (convite Google Meet) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="seu.email@exemplo.com"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6e6] focus:border-[#191c18] outline-none text-xs sm:text-sm text-stone-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        WhatsApp (com código de país) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={countryMode === 'US' ? '+1 (555) 000-0000' : '+55 (11) 90000-0000'}
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6e6] focus:border-[#191c18] outline-none text-xs sm:text-sm text-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Principal Motivo da Busca
                    </label>
                    <select
                      value={inquiryReason}
                      onChange={(e) => setInquiryReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e6e6e6] focus:border-[#191c18] outline-none text-xs sm:text-sm text-stone-800 bg-white"
                    >
                      <option value="Ansiedade e estresse">Ansiedade e estresse</option>
                      <option value="Luto migratório e adaptação nos EUA">
                        Luto migratório e adaptação nos EUA
                      </option>
                      <option value="Burnout e pressão profissional">
                        Burnout e pressão profissional
                      </option>
                      <option value="Relacionamento amoroso ou familiar">
                        Relacionamento amoroso ou familiar
                      </option>
                      <option value="Autoestima e autoconhecimento">
                        Autoestima e autoconhecimento
                      </option>
                      <option value="Transição de carreira ou vida">Transição de carreira ou vida</option>
                    </select>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#191c18] hover:bg-[#26331e] text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#acca94]" />
                      <span>Confirmar e Gerar Sala Meet</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Success View in Modal */
                <div className="p-6 space-y-5 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#e2e9d2] text-[#26331e] flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>

                  <div>
                    <h4 className="font-serif text-2xl font-normal text-[#191c18]">
                      Sessão Agendada com Sucesso!
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Enviamos a confirmação para <strong>{confirmedAppointment.patientEmail}</strong>.
                    </p>
                  </div>

                  <div className="bg-[#f6f6f3] p-4 rounded-2xl border border-[#e6e6e6] text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Categoria:</span>
                      <strong className="text-[#191c18]">{confirmedAppointment.sessionType}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Data:</span>
                      <strong className="text-stone-800">{confirmedAppointment.date}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Horário:</span>
                      <strong className="text-stone-800">
                        {confirmedAppointment.timeSlot} ({confirmedAppointment.timezone})
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-stone-200">
                      <span className="text-stone-500 block mb-1">Sala do Google Meet:</span>
                      <a
                        href={confirmedAppointment.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#26331e] font-mono font-medium underline flex items-center gap-1"
                      >
                        <span>{confirmedAppointment.meetLink}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <a
                      href={generatePatientGoogleCalendarLink(confirmedAppointment)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-full bg-[#191c18] text-white text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#acca94]" />
                      <span>Adicionar à Google Agenda</span>
                    </a>
                    <a
                      href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                        `Olá Steffany! Reservei a categoria ${confirmedAppointment.sessionType} para ${confirmedAppointment.date} às ${confirmedAppointment.timeSlot}. Meu nome é ${confirmedAppointment.patientName}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 rounded-full bg-[#e8ecdf] hover:bg-[#d8e3cf] text-[#191c18] text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#65864d]" />
                      <span>Falar no WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
