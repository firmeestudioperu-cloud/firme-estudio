import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Sparkles,
  Shield,
  HeartPulse,
  Phone,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { BookingModalData, AuthUser, ClientBookingFormData } from '../types';

interface BookingModalProps {
  data: BookingModalData | null;
  onClose: () => void;
  onConfirmBooking: (
    classId: string,
    isWaitlist: boolean,
    clientData?: ClientBookingFormData
  ) => void;
  currentUser?: AuthUser | null;
  onOpenGoogleAuth?: () => void;
  onViewMyClasses?: () => void;
}

const HEALTH_CONDITIONS_OPTIONS = [
  'Ninguna (Apto al 100%)',
  'Dolor lumbar / Ciática',
  'Cervicales / Cuello',
  'Escoliosis / Hernia discal',
  'Embarazo / Postparto',
  'Molestia en rodillas / tobillos',
  'Molestia en hombros / muñecas',
  'Otra condición médica',
];

const FITNESS_GOALS = [
  'Reeducación postural y alivio de dolores',
  'Fuerza, tono muscular y core profundo',
  'Flexibilidad, respiración y anti-estrés',
  'Complemento deportivo y potencia funcional',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  data,
  onClose,
  onConfirmBooking,
  currentUser,
  onOpenGoogleAuth,
  onViewMyClasses,
}) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userDni, setUserDni] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Principiante');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Ninguna (Apto al 100%)']);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState(FITNESS_GOALS[0]);
  const [gripSocksOption, setGripSocksOption] = useState<'has_socks' | 'need_purchase'>('has_socks');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Derive occupied beds deterministically from classSession occupied spots
  const occupiedBedNumbers = React.useMemo(() => {
    const occupied = new Set<number>();
    if (!data) return occupied;
    const count = Math.min(8, data.classSession.occupiedSpots || 0);
    const seedOrder = [1, 5, 2, 7, 4, 8, 6, 3];
    for (let i = 0; i < count; i++) {
      occupied.add(seedOrder[i]);
    }
    return occupied;
  }, [data?.classSession.id, data?.classSession.occupiedSpots]);

  const [selectedBed, setSelectedBed] = useState<number>(3);

  const [activeStep, setActiveStep] = useState<1 | 2>(1); // Paso 1: Datos & Nivel, Paso 2: Cama & Ficha de Salud
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const lastSessionIdRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | undefined>(currentUser?.id);

  // Prefill when modal opens for a new session, or when user logs in with Google while open
  useEffect(() => {
    if (!data) {
      lastSessionIdRef.current = null;
      document.body.style.overflow = '';
      return;
    }

    const isNewSession = lastSessionIdRef.current !== data.classSession.id;

    if (isNewSession) {
      lastSessionIdRef.current = data.classSession.id;
      setIsSuccess(false);
      setErrorMsg('');
      setActiveStep(1);

      if (currentUser) {
        setUserName(currentUser.name || '');
        setUserEmail(currentUser.email || '');
        setUserPhone(currentUser.phone || '');
        setUserDni(currentUser.dni || '');
        if (currentUser.experienceLevel) {
          setExperienceLevel(currentUser.experienceLevel);
        }
        if (currentUser.healthConditions && currentUser.healthConditions.length > 0) {
          setSelectedConditions(currentUser.healthConditions);
        }
        if (currentUser.medicalNotes) {
          setMedicalNotes(currentUser.medicalNotes);
        }
        if (currentUser.emergencyContact) {
          setEmergencyContact(currentUser.emergencyContact);
        }
        if (currentUser.emergencyPhone) {
          setEmergencyPhone(currentUser.emergencyPhone);
        }
      } else {
        setUserName('');
        setUserEmail('');
        setUserPhone('');
        setUserDni('');
        setExperienceLevel('Principiante');
        setSelectedConditions(['Ninguna (Apto al 100%)']);
        setMedicalNotes('');
        setEmergencyContact('');
        setEmergencyPhone('');
      }

      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    } else {
      // If user logs in via Google/One-Tap while modal is already open
      if (!prevUserIdRef.current && currentUser?.id) {
        if (!userName && currentUser.name) setUserName(currentUser.name);
        if (!userEmail && currentUser.email) setUserEmail(currentUser.email);
        if (!userPhone && currentUser.phone) setUserPhone(currentUser.phone);
        if (!userDni && currentUser.dni) setUserDni(currentUser.dni);
        if (currentUser.experienceLevel) setExperienceLevel(currentUser.experienceLevel);
        if (currentUser.healthConditions && currentUser.healthConditions.length > 0) {
          setSelectedConditions(currentUser.healthConditions);
        }
        if (currentUser.medicalNotes && !medicalNotes) setMedicalNotes(currentUser.medicalNotes);
        if (currentUser.emergencyContact && !emergencyContact) setEmergencyContact(currentUser.emergencyContact);
        if (currentUser.emergencyPhone && !emergencyPhone) setEmergencyPhone(currentUser.emergencyPhone);
      }
    }

    prevUserIdRef.current = currentUser?.id;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [data, currentUser]);

  // Keyboard navigation (Escape key & Focus trap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!data) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, onClose]);

  if (!data) return null;

  const { classSession, type, waitlistPosition = 1 } = data;
  const isWaitlist = type === 'waitlist';

  const toggleCondition = (condition: string) => {
    if (condition === 'Ninguna (Apto al 100%)') {
      setSelectedConditions(['Ninguna (Apto al 100%)']);
      return;
    }

    setSelectedConditions((prev) => {
      const filtered = prev.filter((c) => c !== 'Ninguna (Apto al 100%)');
      if (filtered.includes(condition)) {
        const next = filtered.filter((c) => c !== condition);
        return next.length === 0 ? ['Ninguna (Apto al 100%)'] : next;
      } else {
        return [...filtered, condition];
      }
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre y apellido');
      return;
    }
    if (!userEmail.trim() || !userEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido');
      return;
    }
    if (!userPhone.trim()) {
      setErrorMsg('Por favor ingresa un número de teléfono/WhatsApp para las confirmaciones');
      return;
    }
    if (!userDni.trim()) {
      setErrorMsg('Por favor ingresa tu DNI o Documento de Identidad');
      return;
    }

    setErrorMsg('');
    setActiveStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('Debes aceptar las políticas del estudio y la declaración de aptitud física.');
      return;
    }

    setErrorMsg('');
    setIsSuccess(true);

    const formData: ClientBookingFormData = {
      name: userName.trim(),
      email: userEmail.trim(),
      phone: userPhone.trim(),
      dni: userDni.trim(),
      experienceLevel,
      healthConditions: selectedConditions,
      medicalNotes: medicalNotes.trim(),
      fitnessGoal,
      gripSocksOption,
      emergencyContact: emergencyContact.trim(),
      emergencyPhone: emergencyPhone.trim(),
      acceptedTerms,
      googleAvatar: currentUser?.avatar,
      authProvider: currentUser?.provider || 'manual',
      selectedBed: isWaitlist ? undefined : selectedBed,
    };

    onConfirmBooking(classSession.id, isWaitlist, formData);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] p-6 sm:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden text-[#1A1815] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors focus:outline-hidden"
          aria-label="Cerrar ventana de reserva"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <div className="overflow-y-auto pr-1 flex-1">
            {/* Modal Header */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-[#B5654A] bg-[#F1ECE5] px-2.5 py-0.5 rounded border border-[#E4DED4]">
                  {isWaitlist ? 'Lista de Espera' : 'Reserva de Reformer'}
                </span>
                <span className="text-xs text-[#6B655C]">Paso {activeStep} de 2</span>
              </div>
              <h3 id="booking-modal-title" className="font-fraunces text-2xl sm:text-3xl text-[#1A1815]">
                {classSession.name}
              </h3>
            </div>

            {/* Quick Session Details Bar */}
            <div className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-3.5 mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#1A1815]">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B5654A]" />
                <span className="font-medium">{classSession.instructor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>{classSession.time} h ({classSession.duration})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>Cupos: {classSession.totalSpots - classSession.occupiedSpots} de {classSession.totalSpots}</span>
              </div>
            </div>

            {/* Google One-Tap Connect Banner */}
            {!currentUser && onOpenGoogleAuth && (
              <button
                type="button"
                onClick={onOpenGoogleAuth}
                className="w-full mb-5 bg-white hover:bg-[#F1ECE5] border border-[#DDD5C9] hover:border-[#B5654A] p-2.5 rounded-lg flex items-center justify-center space-x-2.5 text-xs font-medium text-[#1A1815] shadow-xs transition-all cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Autocompletar o crear cuenta con Gmail</span>
                <Sparkles className="w-3 h-3 text-[#B5654A] ml-1" />
              </button>
            )}

            {currentUser && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center space-x-2">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span>Conectado como <strong>{currentUser.name}</strong> ({currentUser.email})</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">
                  Gmail ✓
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 flex items-center text-xs text-[#9A5340] bg-[#9A5340]/10 border border-[#9A5340]/20 p-2.5 rounded-md">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Personal Data & Experience Level */}
            {activeStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1">
                      Nombre y Apellidos *
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ej. María Fernanda Ruiz"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3.5 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1">
                      DNI / Documento *
                    </label>
                    <input
                      type="text"
                      required
                      value={userDni}
                      onChange={(e) => setUserDni(e.target.value)}
                      placeholder="Ej. 74839201"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3.5 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="maria@gmail.com"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3.5 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+51 984 123 456"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-3.5 py-2 text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>

                {/* Level Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1.5">
                    Tu nivel de experiencia en Pilates Reformer *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'Principiante', desc: 'Primera vez / Fundamentos' },
                      { key: 'Intermedio', desc: 'Conozco muelles y barra' },
                      { key: 'Avanzado', desc: '+1 año regular' },
                    ].map((lvl) => (
                      <button
                        key={lvl.key}
                        type="button"
                        onClick={() => setExperienceLevel(lvl.key as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          experienceLevel === lvl.key
                            ? 'bg-[#FAF8F5] border-[#B5654A] ring-1 ring-[#B5654A] shadow-xs'
                            : 'bg-white border-[#E4DED4] hover:bg-[#F1ECE5]'
                        }`}
                      >
                        <div className="font-medium text-xs text-[#1A1815]">{lvl.key}</div>
                        <div className="text-[10px] text-[#6B655C] mt-0.5 leading-tight">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-[#B5654A] hover:bg-[#9A5340] text-white py-3 px-4 rounded-md font-medium text-sm transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Continuar a Ficha de Salud</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Bed Selection, Health Conditions & Confirmation */}
            {activeStep === 2 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                {/* 1. SELECCIÓN DE CAMA REFORMER (MAPA DE SALA) */}
                {!isWaitlist && (
                  <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-[#B5654A]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1A1815]">
                          Elige tu Cama Reformer (Sala Jr. Akapana)
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-[#B5654A] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        Cama #{selectedBed} seleccionada
                      </span>
                    </div>

                    <p className="text-[11px] text-[#6B655C] mb-3">
                      Selecciona tu reformer favorito en sala. Capacidad máxima: 8 personas.
                    </p>

                    <div className="bg-white border border-[#E4DED4] rounded-xl p-3 space-y-2.5">
                      {/* Fila A - Lado Ventanal */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#6B655C] mb-1">
                          <span>🪟 LADO VENTANAL (Luz natural & ventilación)</span>
                          <span className="text-[#B5654A]">Fila A</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((bedNum) => {
                            const isOccupied = occupiedBedNumbers.has(bedNum);
                            const isSelected = selectedBed === bedNum;
                            return (
                              <button
                                key={bedNum}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setSelectedBed(bedNum)}
                                className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                  isOccupied
                                    ? 'bg-[#F1ECE5]/60 border-[#E4DED4] text-[#6B655C]/60 cursor-not-allowed opacity-60'
                                    : isSelected
                                    ? 'bg-[#B5654A] text-white border-[#B5654A] shadow-xs font-bold scale-[1.02]'
                                    : 'bg-[#FAF8F5] border-[#E4DED4] text-[#1A1815] hover:border-[#B5654A] hover:bg-[#FAF2E8]'
                                }`}
                              >
                                <span className="text-xs font-mono font-bold">Cama #{bedNum}</span>
                                <span className="text-[9px] block">
                                  {isOccupied ? 'Ocupada' : isSelected ? '✓ Tu Cama' : 'Libre'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Instructor Central Runway */}
                      <div className="py-1 px-3 bg-[#FAF2E8] rounded-md border border-[#ECD1B0] text-center text-[10px] font-semibold text-[#8C5511] flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#B5654A]" />
                        <span>Pasillo Central · Asistencia Personalizada del Instructor</span>
                      </div>

                      {/* Fila B - Lado Espejo */}
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#6B655C] mb-1">
                          <span>🪞 LADO ESPEJO (Alineación & corrección frontal)</span>
                          <span className="text-[#B5654A]">Fila B</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[5, 6, 7, 8].map((bedNum) => {
                            const isOccupied = occupiedBedNumbers.has(bedNum);
                            const isSelected = selectedBed === bedNum;
                            return (
                              <button
                                key={bedNum}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => setSelectedBed(bedNum)}
                                className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                                  isOccupied
                                    ? 'bg-[#F1ECE5]/60 border-[#E4DED4] text-[#6B655C]/60 cursor-not-allowed opacity-60'
                                    : isSelected
                                    ? 'bg-[#B5654A] text-white border-[#B5654A] shadow-xs font-bold scale-[1.02]'
                                    : 'bg-[#FAF8F5] border-[#E4DED4] text-[#1A1815] hover:border-[#B5654A] hover:bg-[#FAF2E8]'
                                }`}
                              >
                                <span className="text-xs font-mono font-bold">Cama #{bedNum}</span>
                                <span className="text-[9px] block">
                                  {isOccupied ? 'Ocupada' : isSelected ? '✓ Tu Cama' : 'Libre'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Health Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#6B655C] flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-[#B5654A]" />
                      <span>Ficha Biomecánica: ¿Presentas alguna condición o lesión?</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {HEALTH_CONDITIONS_OPTIONS.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`px-2.5 py-1.5 rounded-md border text-[11px] text-left transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#B5654A]/10 border-[#B5654A] text-[#B5654A] font-medium'
                              : 'bg-white border-[#E4DED4] text-[#6B655C] hover:bg-[#F1ECE5]'
                          }`}
                        >
                          <span>{cond}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#B5654A] shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Medical Notes */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1">
                    Indicaciones específicas para el instructor <span className="normal-case text-[11px] font-normal text-[#6B655C]/80">(opcional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={medicalNotes}
                    onChange={(e) => setMedicalNotes(e.target.value)}
                    placeholder="Ej. Evitar flexiones cervicales profundas por recomendación del traumatólogo..."
                    className="w-full bg-white border border-[#E4DED4] rounded-md px-3 py-2 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                  />
                </div>

                {/* Grip Socks Selection */}
                <div className="bg-white border border-[#E4DED4] rounded-lg p-3">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1.5">
                    Calcetines Antideslizantes (Grip Socks) *
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="socks"
                        checked={gripSocksOption === 'has_socks'}
                        onChange={() => setGripSocksOption('has_socks')}
                        className="text-[#B5654A] focus:ring-[#B5654A]"
                      />
                      <span>Llevaré mis propios calcetines antideslizantes</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="socks"
                        checked={gripSocksOption === 'need_purchase'}
                        onChange={() => setGripSocksOption('need_purchase')}
                        className="text-[#B5654A] focus:ring-[#B5654A]"
                      />
                      <span>
                        Deseo adquirir un par en recepción <strong className="text-[#B5654A]">(S/. 45)</strong>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                      Contacto de Emergencia
                    </label>
                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Nombre y Parentesco"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-2.5 py-1.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                      Teléfono de Emergencia
                    </label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+51 900 000 000"
                      className="w-full bg-white border border-[#E4DED4] rounded-md px-2.5 py-1.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>

                {/* Terms and Cancellation Policy */}
                <div className="pt-1">
                  <label className="flex items-start space-x-2 cursor-pointer text-[11px] text-[#6B655C]">
                    <input
                      type="checkbox"
                      required
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 text-[#B5654A] focus:ring-[#B5654A] rounded"
                    />
                    <span>
                      Acepto la política de cancelación (gratuita hasta 12h antes) y declaro no presentar contraindicaciones médicas para la práctica en Reformer.
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="w-1/3 py-2.5 px-3 rounded-md border border-[#E4DED4] text-xs font-medium text-[#6B655C] hover:bg-[#F1ECE5] transition-colors"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    className={`w-2/3 py-2.5 px-4 rounded-md text-xs font-medium text-white shadow-xs transition-colors cursor-pointer ${
                      isWaitlist ? 'bg-[#1A1815] hover:bg-black' : 'bg-[#B5654A] hover:bg-[#9A5340]'
                    }`}
                  >
                    {isWaitlist ? 'Confirmar en Lista de Espera' : 'Finalizar y Confirmar Reserva'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center py-5 space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A] block mb-1">
                {isWaitlist ? 'Inscripción Exitosa' : '¡Plaza Confirmada!'}
              </span>
              <h3 className="font-fraunces text-2xl text-[#1A1815]">
                {isWaitlist
                  ? `Posición #${waitlistPosition} en lista de espera`
                  : `Te esperamos en ${classSession.name}`}
              </h3>
            </div>

            <p className="text-xs text-[#6B655C] max-w-sm mx-auto leading-relaxed">
              Hemos registrado tu ficha biomecánica ({experienceLevel}, {selectedConditions.length} notas de salud). Recibirás el recordatorio por WhatsApp a {userPhone}.
            </p>

            <div className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-3 text-xs text-[#1A1815] text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Alumno / DNI:</span>
                <span className="font-medium">{userName} ({userDni})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Horario:</span>
                <span className="font-medium">{classSession.time} h · {classSession.day.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Instructor:</span>
                <span className="font-medium">{classSession.instructor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B655C]">Calcetines:</span>
                <span className="font-medium">
                  {gripSocksOption === 'has_socks' ? 'Lleva los suyos' : 'Adquiere en recepción (S/. 45)'}
                </span>
              </div>
              {!isWaitlist && (
                <div className="flex justify-between bg-[#B5654A]/15 text-[#B5654A] px-2 py-1 rounded font-bold mt-1">
                  <span>Cama Asignada:</span>
                  <span>Cama #{selectedBed} (Jr. Akapana 1261)</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewMyClasses?.();
                }}
                className="w-full bg-[#1A1815] hover:bg-black text-[#FAF8F5] py-2.5 px-4 rounded-md text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                Cerrar y ver en Mis Clases
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
