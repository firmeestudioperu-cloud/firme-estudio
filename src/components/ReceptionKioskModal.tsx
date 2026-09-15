import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  MapPin,
  Delete,
  AlertCircle,
  QrCode,
  UserCheck,
  Camera,
} from 'lucide-react';
import { BookingRecord, ClientProfile } from '../types';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { CameraQrScannerModal } from './CameraQrScannerModal';

interface ReceptionKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRecord[];
  clients: ClientProfile[];
  onCheckInSuccess?: (booking: BookingRecord) => void;
  onGainExp?: (amount: number, reason: string) => void;
  onOpenQrModal?: () => void;
  onOpenAuthModal?: (modality?: 'qr' | 'manual' | 'whatsapp' | 'receptionist') => void;
}

export const ReceptionKioskModal: React.FC<ReceptionKioskModalProps> = ({
  isOpen,
  onClose,
  bookings,
  clients,
  onCheckInSuccess,
  onGainExp,
  onOpenQrModal,
  onOpenAuthModal,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [dniInput, setDniInput] = useState<string>('');
  const [checkedInBooking, setCheckedInBooking] = useState<{
    clientName: string;
    dni: string;
    className: string;
    instructor: string;
    time: string;
    bedNumber: number;
    expGained: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoResetTimer, setAutoResetTimer] = useState<number>(0);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (checkedInBooking && autoResetTimer > 0) {
      timer = setTimeout(() => {
        setAutoResetTimer((prev) => prev - 1);
      }, 1000);
    } else if (checkedInBooking && autoResetTimer === 0) {
      setCheckedInBooking(null);
      setDniInput('');
    }
    return () => clearTimeout(timer);
  }, [checkedInBooking, autoResetTimer]);

  if (!isOpen) return null;

  const playStudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, ctx.currentTime);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 1.2);

      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(880, ctx.currentTime);
          gain2.gain.setValueAtTime(0.18, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 1.4);
        } catch (e) {
          // ignore
        }
      }, 120);
    } catch (e) {
      console.log('AudioContext error:', e);
    }
  };

  const handleKeypadPress = (val: string) => {
    setErrorMessage(null);
    if (dniInput.length < 8) {
      setDniInput((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setErrorMessage(null);
    setDniInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMessage(null);
    setDniInput('');
  };

  const handlePerformCheckInByDni = async (overrideDni?: string) => {
    const trimmedDni = (overrideDni || dniInput).trim();
    if (!trimmedDni || trimmedDni.length < 6) {
      setErrorMessage('Por favor ingresa un número de DNI válido (mínimo 6-8 dígitos).');
      return;
    }

    if (overrideDni) {
      setDniInput(overrideDni);
    }

    // 1. Intentar check-in en Supabase Cloud
    try {
      const result = await supabaseService.performTotemCheckIn(trimmedDni);
      if (result.success && result.booking) {
        const b = result.booking;
        playStudioChime();
        onGainExp?.(150, `Asistencia puntual en Sala Reformer (Cama #${b.bedNumber || 1})`);
        onCheckInSuccess?.(b);

        setCheckedInBooking({
          clientName: b.clientName,
          dni: trimmedDni,
          className: b.className,
          instructor: b.instructor,
          time: b.classTime,
          bedNumber: b.bedNumber || 1,
          expGained: 150,
        });

        setAutoResetTimer(8);
        return;
      }
    } catch {
      // Continuar al fallback local
    }

    // 2. Fallback local en memoria con búsqueda inteligente y cruce de datos
    const cleanDigits = trimmedDni.replace(/\D/g, '');

    const matchingClient = clients.find(
      (c) =>
        c &&
        (c.dni === trimmedDni ||
          c.alternateDni === trimmedDni ||
          (cleanDigits.length >= 8 && c.phone?.replace(/\D/g, '').endsWith(cleanDigits.slice(-8))) ||
          (trimmedDni.includes('@') && c.email?.toLowerCase() === trimmedDni.toLowerCase()) ||
          c.name?.toLowerCase().includes(trimmedDni.toLowerCase()))
    );

    const matchingBooking = bookings.find((b) => {
      if (!b || b.status === 'cancelada') return false;
      const bPhone = (b.clientPhone || '').replace(/\D/g, '');
      if (b.clientDni === trimmedDni) return true;
      if (cleanDigits.length >= 8 && bPhone.endsWith(cleanDigits.slice(-8))) return true;
      if (trimmedDni.includes('@') && b.clientEmail?.toLowerCase() === trimmedDni.toLowerCase()) return true;
      if (matchingClient) {
        if (matchingClient.dni && b.clientDni === matchingClient.dni) return true;
        if (matchingClient.alternateDni && b.clientDni === matchingClient.alternateDni) return true;
        if (matchingClient.email && b.clientEmail?.toLowerCase() === matchingClient.email.toLowerCase()) return true;
        const mcPhone = (matchingClient.phone || '').replace(/\D/g, '');
        if (mcPhone.length >= 8 && bPhone.endsWith(mcPhone.slice(-8))) return true;
      }
      return false;
    });

    if (!matchingBooking && !matchingClient) {
      setErrorMessage(
        'No encontramos reserva ni alumna con ' + trimmedDni + '. Acércate al counter de recepción para asistencia.'
      );
      return;
    }

    const clientName = matchingBooking?.clientName || matchingClient?.name || 'Alumna FIRME';
    const assignedBed = matchingBooking?.bedNumber || Math.floor(Math.random() * 8) + 1;
    const className = matchingBooking?.className || 'Reformer Flow & Form';
    const instructor = matchingBooking?.instructor || 'Camila Morales';
    const classTime = matchingBooking?.classTime || 'Sesión Actual';

    if (matchingBooking) {
      matchingBooking.status = 'asistio';
      matchingBooking.bedNumber = assignedBed;
      matchingBooking.checkInTime = new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });
      onCheckInSuccess?.(matchingBooking);
    }

    playStudioChime();
    onGainExp?.(150, 'Asistencia puntual en Sala Reformer (Cama #' + assignedBed + ')');

    setCheckedInBooking({
      clientName,
      dni: trimmedDni,
      className,
      instructor,
      time: classTime,
      bedNumber: assignedBed,
      expGained: 150,
    });

    setAutoResetTimer(8);
  };

  const handleCameraScanSuccess = (data: { dni?: string; name?: string; memId?: string; phone?: string; email?: string; raw: string }) => {
    let searchDoc = (data.dni || data.phone || data.email || data.memId || '').trim();
    if (!searchDoc && data.raw) {
      const match = data.raw.match(/[?&#](?:dni|doc|documento|ce|pasaporte)=([^&#]+)/i);
      if (match) searchDoc = decodeURIComponent(match[1]).trim();
    }
    if (searchDoc) {
      setIsCameraScannerOpen(false);
      handlePerformCheckInByDni(searchDoc);
    } else {
      setErrorMessage('No pudimos detectar un documento o código válido en el código escaneado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1815] text-[#FAF8F5] flex flex-col justify-between select-none animate-in fade-in duration-200">
      {/* Top Reception Bar */}
      <div className="bg-[#1A1815] border-b border-[#E4DED4]/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B5654A] flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-fraunces text-lg tracking-wider text-[#FAF8F5]">
                FIRME STUDIO
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tótem SJL · Supabase Cloud</span>
              </span>
            </div>
            <p className="text-xs text-[#E4DED4]/70 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#B5654A]" />
              <span>Sede Jr. Akapana 1261, Lima - SJL</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="font-mono text-xl font-bold tracking-widest text-[#FAF8F5]">
              {currentTime}
            </span>
            <span className="text-[11px] text-[#E4DED4]/60 block capitalize">
              {currentDate}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition-colors cursor-pointer"
            title="Salir del Modo Kiosco"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Kiosk Body */}
      <div className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {!checkedInBooking ? (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Instructions */}
            <div className="md:col-span-6 space-y-5 text-left">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                  Bienvenida a tu clase
                </span>
                <h1 className="font-fraunces text-3xl sm:text-4xl text-white leading-tight">
                  Digita tu DNI para ingresar a sala
                </h1>
                <p className="text-xs sm:text-sm text-[#E4DED4]/80 mt-2 leading-relaxed">
                  Confirma tu asistencia, descubre el número de tu <strong>Reformer Allegro 2</strong> asignado y suma <strong>+150 EXP</strong> a tu nivel de alumna.
                </p>
              </div>

              {/* DNI Display Box */}
              <div className="bg-[#262320] border-2 border-[#B5654A]/60 rounded-2xl p-4 shadow-inner">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#B5654A] block mb-1">
                  Documento de Identidad (DNI):
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl sm:text-4xl tracking-widest text-white font-bold min-h-[44px] flex items-center">
                    {dniInput ? dniInput : <span className="text-white/30 text-2xl font-sans">_ _ _ _ _ _ _ _</span>}
                  </span>
                  {dniInput && (
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick info note */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-white/70 space-y-1">
                <p>• Recuerda ingresar a sala con tus <strong>calcetines grip antideslizantes</strong>.</p>
                <p>• ¿Primera vez o sin reserva previa? Consulta en el counter con recepción.</p>
              </div>
            </div>

            {/* Right Touch Keypad */}
            <div className="md:col-span-6 bg-[#262320] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-16 rounded-2xl bg-[#332F2A] hover:bg-[#B5654A] active:scale-95 text-white font-mono text-2xl font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-16 rounded-2xl bg-[#332F2A]/60 hover:bg-[#332F2A] active:scale-95 text-white/70 text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center cursor-pointer"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-16 rounded-2xl bg-[#332F2A] hover:bg-[#B5654A] active:scale-95 text-white font-mono text-2xl font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-16 rounded-2xl bg-[#332F2A]/60 hover:bg-[#332F2A] active:scale-95 text-white/70 transition-all flex items-center justify-center cursor-pointer"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePerformCheckInByDni}
                disabled={dniInput.length < 6}
                className="w-full py-4 rounded-2xl bg-[#B5654A] hover:bg-[#9A5340] disabled:opacity-40 disabled:cursor-not-allowed text-white font-fraunces text-lg tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Validar Ingreso a Sala</span>
              </button>

              {/* Opciones para alumnas nuevas sin cuenta previa o con Pase QR */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors py-2 px-3.5 rounded-xl border border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Escanear Pase QR con Cámara</span>
                </button>

                {(onOpenQrModal || onOpenAuthModal) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal('qr');
                      else onOpenQrModal?.();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-white transition-colors py-2 px-3.5 rounded-xl border border-amber-500/30 hover:border-amber-400 bg-[#332F2A]/60 cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>Ver QR para tu Celular</span>
                  </button>
                )}

                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal('receptionist')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white transition-colors py-2 px-3.5 rounded-xl border border-emerald-500/30 hover:border-emerald-400 bg-[#332F2A]/60 cursor-pointer shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Registro en Counter con Recepcionista</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Check-in Success Welcome Screen */
          <div className="w-full max-w-xl bg-[#262320] border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#B5654A] block">
                ¡Check-in Confirmado!
              </span>
              <h2 className="font-fraunces text-3xl sm:text-4xl text-white mt-1">
                Bienvenida, {checkedInBooking.clientName}
              </h2>
              <p className="text-xs sm:text-sm text-[#E4DED4]/70 mt-1">
                Tu ingreso a sala ha quedado registrado con éxito en recepción.
              </p>
            </div>

            {/* Assigned Bed Highlight Card */}
            <div className="bg-[#1A1815] border-2 border-[#B5654A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5654A]/20 rounded-full blur-2xl pointer-events-none" />

              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B5654A] block mb-1">
                Tu cama reservada para esta sesión
              </span>
              <div className="flex items-center justify-center gap-3 my-2">
                <span className="font-fraunces text-5xl sm:text-6xl font-extrabold text-amber-300">
                  Cama #{checkedInBooking.bedNumber}
                </span>
              </div>
              <p className="text-xs text-white/80">
                Reformer Allegro 2 · {checkedInBooking.bedNumber <= 4 ? 'Fila A (Lado Ventanal)' : 'Fila B (Lado Espejo)'}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-xs text-left">
                <div>
                  <span className="text-[10px] text-white/50 block">Sesión / Clase:</span>
                  <span className="font-semibold text-white">{checkedInBooking.className}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/50 block">Instructor(a):</span>
                  <span className="font-semibold text-white">{checkedInBooking.instructor}</span>
                </div>
              </div>
            </div>

            {/* EXP Bonus Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-full text-xs font-semibold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+{checkedInBooking.expGained} EXP sumados por asistencia puntual</span>
            </div>

            {/* Auto-reset prompt */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setCheckedInBooking(null);
                  setDniInput('');
                }}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Siguiente Alumno (Reiniciando en {autoResetTimer}s)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Information */}
      <div className="bg-[#1A1815] border-t border-[#E4DED4]/20 px-6 py-3 flex items-center justify-between text-[11px] text-[#E4DED4]/60">
        <span>FIRME STUDIO · Pilates Reformer & Boutique · 8 Reformers Allegro 2</span>
        <span>Atención en Recepción: Jr. Akapana 1261, Lima - SJL</span>
      </div>

      {/* Modal de Escáner de QR por Cámara */}
      <CameraQrScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleCameraScanSuccess}
      />
    </div>
  );
};
