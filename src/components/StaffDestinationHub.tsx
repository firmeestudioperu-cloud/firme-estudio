import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  ArrowRight,
  LogOut,
  Globe,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  CreditCard,
  QrCode,
  Users,
  Camera,
  Search,
  Check,
  X,
  AlertCircle,
  Clock,
  MapPin,
  RefreshCw,
  Building,
  Coffee,
} from 'lucide-react';
import { AuthUser, MainTabType, BookingRecord, ClassSession, ClientProfile, getRoleDefinition } from '../types';
import { CameraQrScannerModal } from './CameraQrScannerModal';
import { supabaseService, mapDbBookingToRecord, mapDbClientToProfile } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface StaffDestinationHubProps {
  currentUser: AuthUser | null;
  onSelectDestination: (tab: MainTabType) => void;
  onLogout: () => void;
  bookings?: BookingRecord[];
  classes?: ClassSession[];
  clients?: ClientProfile[];
  onCheckInBooking?: (booking: BookingRecord) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
  onGainExp?: (amount: number, reason: string) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialTotemMode?: boolean;
}

interface VerifiedBookingInfo {
  clientName: string;
  dni: string;
  avatar?: string;
  level?: string;
  roomName: string;
  roomId: string;
  bedNumber: number;
  className: string;
  classNumberInfo: string;
  classTime: string;
  instructor: string;
  scanTime: string;
  status: string;
  isExistingCheckin?: boolean;
}

interface NoClassWarningInfo {
  query: string;
  clientName?: string;
  dni?: string;
  avatar?: string;
  creditsLeft?: number;
  currentPlan?: string;
  status: 'client_without_booking' | 'unregistered_code';
  message: string;
}

export const StaffDestinationHub: React.FC<StaffDestinationHubProps> = ({
  currentUser,
  onSelectDestination,
  onLogout,
  bookings = [],
  classes = [],
  clients = [],
  onCheckInBooking,
  onAssignBed,
  onGainExp,
  showToast,
  initialTotemMode = false,
}) => {
  const isOwnerDev = currentUser?.role === 'owner_dev';
  const isAdmin = currentUser?.role === 'admin';
  const firstName = currentUser?.name?.split(' ')[0] || 'Personal';

  // Estados de escáner y verificación rápida
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [isManualDniOpen, setIsManualDniOpen] = useState(false);
  const [manualDniInput, setManualDniInput] = useState('');
  const [verifiedBookingResult, setVerifiedBookingResult] = useState<VerifiedBookingInfo | null>(null);
  const [noClassWarningResult, setNoClassWarningResult] = useState<NoClassWarningInfo | null>(null);
  const [feedbackAlert, setFeedbackAlert] = useState<{ type: 'error' | 'warning'; message: string } | null>(null);
  
  // Soporte directo para enlace único firme-estudio.vercel.app/#totem
  const [isTotemKioskMode, setIsTotemKioskMode] = useState<boolean>(() => {
    if (initialTotemMode) return true;
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();
      return hash === 'totem' || hash === 'totem-qr' || hash === 'kiosko' || path === '/totem';
    }
    return false;
  });

  const [countdown, setCountdown] = useState<number>(6);
  const [warningCountdown, setWarningCountdown] = useState<number>(6);

  // Sincronizar estado con cambios en URL hash (#totem)
  useEffect(() => {
    if (initialTotemMode) {
      setIsTotemKioskMode(true);
    }
  }, [initialTotemMode]);

  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === 'totem' || hash === 'totem-qr' || path === '/totem') {
        setIsTotemKioskMode(true);
      }
    };
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  const handleEnterTotemMode = () => {
    setFeedbackAlert(null);
    setIsTotemKioskMode(true);
    window.location.hash = 'totem';
  };

  const handleExitTotemMode = () => {
    setIsTotemKioskMode(false);
    if (window.location.hash === '#totem' || window.location.hash === '#totem-qr') {
      window.location.hash = 'staff-hub';
    }
  };

  // Auto-reseteo de 6 segundos para la pantalla de orientación tras validar a la alumna
  useEffect(() => {
    if (!verifiedBookingResult) {
      setCountdown(6);
      return;
    }

    setCountdown(6);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setVerifiedBookingResult(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [verifiedBookingResult]);

  // Auto-reseteo de 6 segundos para el aviso de NO TIENE CLASES REGISTRADAS
  useEffect(() => {
    if (!noClassWarningResult) {
      setWarningCountdown(6);
      return;
    }

    setWarningCountdown(6);
    const interval = setInterval(() => {
      setWarningCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setNoClassWarningResult(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [noClassWarningResult]);

  const playStudioChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable
    }
  };

  const playWarningChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // AudioContext unavailable
    }
  };

  const handleAdminClick = () => {
    sessionStorage.removeItem('firme_admin_subtab');
    onSelectDestination('admin');
  };

  const handleOpenStudentRoomPanel = () => {
    onSelectDestination('kiosco');
  };

  // Función núcleo de verificación de clase por DNI, CE, Pasaporte, Celular, Email o Nombre
  const processCheckInVerification = async (
    queryInput: string | { dni?: string; name?: string; memId?: string; phone?: string; email?: string; raw?: string }
  ) => {
    setFeedbackAlert(null);
    let targetDni = '';
    let targetName = '';
    let targetMemId = '';
    let targetPhone = '';
    let targetEmail = '';
    let rawQuery = '';

    if (typeof queryInput === 'object' && queryInput !== null) {
      targetDni = (queryInput.dni || '').trim();
      targetName = (queryInput.name || '').trim();
      targetMemId = (queryInput.memId || '').trim();
      targetPhone = ((queryInput as any).phone || '').trim();
      targetEmail = ((queryInput as any).email || '').trim();
      rawQuery = (queryInput.raw || '').trim();
    } else {
      rawQuery = String(queryInput || '').trim();
    }

    // Si aún no tenemos targetDni, intentar extraerlo con seguridad de rawQuery sin concatenar puertos ni URLs
    if (!targetDni && rawQuery) {
      const dniParamMatch =
        rawQuery.match(/[?&#](?:dni|doc|documento|ce|pasaporte)=([^&#]+)/i) ||
        rawQuery.match(/(?:dni|doc|documento|ce|pasaporte)[=:\s]+([A-Za-z0-9_-]{6,15})/i);
      if (dniParamMatch) {
        targetDni = decodeURIComponent(dniParamMatch[1]).trim();
      } else if (!rawQuery.includes('http') && !rawQuery.includes('/') && !rawQuery.includes('?')) {
        const digits = rawQuery.replace(/\D/g, '');
        if (digits.length >= 6 && digits.length <= 12) {
          targetDni = digits;
        }
      } else {
        const isolated = rawQuery.match(/(?:dni|doc)[=:\s/]+([0-9]{7,10})/i);
        if (isolated) {
          targetDni = isolated[1];
        }
      }
    }

    if (!targetEmail && rawQuery.includes('@')) {
      const emailMatch = rawQuery.match(/[?&#](?:email|correo)=([^&#]+)/i);
      if (emailMatch) {
        targetEmail = decodeURIComponent(emailMatch[1]).trim();
      } else {
        targetEmail = rawQuery.trim();
      }
    }

    if (!targetPhone) {
      const phoneParamMatch = rawQuery.match(/[?&#](?:phone|tel|cel|celular|telefono)=([^&#]+)/i);
      if (phoneParamMatch) {
        targetPhone = decodeURIComponent(phoneParamMatch[1]).trim();
      } else {
        const rawDigits = rawQuery.replace(/\D/g, '');
        if (rawDigits.length === 9 && rawDigits.startsWith('9')) {
          targetPhone = rawDigits;
        }
      }
    }

    if (!targetName && rawQuery) {
      const nameMatch = rawQuery.match(/[?&#]name=([^&#]+)/i);
      if (nameMatch) {
        targetName = decodeURIComponent(nameMatch[1]).replace(/\+/g, ' ').trim();
      }
    }

    if (!targetMemId && rawQuery) {
      const memMatch = rawQuery.match(/[?&#]memId=([^&#]+)/i);
      if (memMatch) {
        targetMemId = decodeURIComponent(memMatch[1]).trim();
      }
    }

    const cleaned = (targetDni || targetPhone || targetEmail || targetMemId || targetName || rawQuery).trim();
    if (!cleaned) {
      setFeedbackAlert({ type: 'error', message: 'Por favor ingresa o escanea un DNI, documento, celular o código válido.' });
      return;
    }

    const cleanDigits = (targetDni || targetPhone || cleaned).replace(/\D/g, '');

    // CRUCE INTELIGENTE PREVIO:
    // Buscar si existe un perfil de alumna en memoria que coincida con alguno de los datos ingresados
    // (DNI principal, DNI alternativo, CE, Pasaporte, Celular, Email o Nombre)
    const matchedProfile = clients.find((c) => {
      if (!c) return false;
      const cPhoneDigits = (c.phone || '').replace(/\D/g, '');
      
      // Coincidencia por DNI principal o alternativo
      if (targetDni && (c.dni === targetDni || c.alternateDni === targetDni)) return true;
      if (cleaned && (c.dni === cleaned || c.alternateDni === cleaned)) return true;
      
      // Coincidencia por Celular (últimos 8 o 9 dígitos)
      if (cleanDigits.length >= 8 && cPhoneDigits.endsWith(cleanDigits.slice(-8))) return true;
      if (targetPhone && cPhoneDigits.includes(targetPhone)) return true;
      
      // Coincidencia por Correo Electrónico
      if (targetEmail && c.email && c.email.toLowerCase() === targetEmail.toLowerCase()) return true;
      if (cleaned.includes('@') && c.email && c.email.toLowerCase() === cleaned.toLowerCase()) return true;
      
      // Coincidencia por Nombre
      if (targetName && c.name && c.name.toLowerCase().includes(targetName.toLowerCase())) return true;
      if (cleaned.length >= 4 && c.name && c.name.toLowerCase().includes(cleaned.toLowerCase())) return true;

      return false;
    });

    // 1. Buscar en reservas activas (no canceladas) en memoria local
    let matchingBooking = bookings.find((b) => {
      if (!b || b.status === 'cancelada') return false;
      const bPhoneDigits = (b.clientPhone || '').replace(/\D/g, '');

      // 1.1 Coincidencia directa por DNI o Código
      if (targetDni && b.clientDni === targetDni) return true;
      if (cleaned && (b.clientDni === cleaned || b.id === cleaned)) return true;

      // 1.2 Coincidencia por Celular
      if (cleanDigits.length >= 8 && bPhoneDigits.endsWith(cleanDigits.slice(-8))) return true;
      if (targetPhone && bPhoneDigits.includes(targetPhone)) return true;

      // 1.3 Coincidencia por Email
      if (targetEmail && b.clientEmail && b.clientEmail.toLowerCase() === targetEmail.toLowerCase()) return true;
      if (cleaned.includes('@') && b.clientEmail && b.clientEmail.toLowerCase() === cleaned.toLowerCase()) return true;

      // 1.4 Coincidencia por Nombre
      if (targetName && b.clientName && b.clientName.toLowerCase().includes(targetName.toLowerCase())) return true;
      if (cleaned.length >= 4 && b.clientName && b.clientName.toLowerCase().includes(cleaned.toLowerCase())) return true;

      // 1.5 Coincidencia por Member ID
      if (targetMemId && (b.id === targetMemId || b.clientDni?.includes(targetMemId))) return true;

      // 1.6 CRUCE DE PERFIL: Si la alumna fue identificada en la base del estudio, validar con sus identificadores
      if (matchedProfile) {
        if (matchedProfile.dni && b.clientDni === matchedProfile.dni) return true;
        if (matchedProfile.alternateDni && b.clientDni === matchedProfile.alternateDni) return true;
        if (matchedProfile.email && b.clientEmail && b.clientEmail.toLowerCase() === matchedProfile.email.toLowerCase()) return true;
        const mpPhone = (matchedProfile.phone || '').replace(/\D/g, '');
        if (mpPhone.length >= 8 && bPhoneDigits.endsWith(mpPhone.slice(-8))) return true;
        if (matchedProfile.name && b.clientName && b.clientName.toLowerCase().includes(matchedProfile.name.toLowerCase().split(' ')[0])) return true;
      }

      return false;
    });

    // 1.1 Si no se encuentra en memoria local, consultar Supabase Cloud en tiempo real
    if (!matchingBooking && isSupabaseConfigured() && supabase) {
      try {
        let sbQuery = supabase.from('bookings').select('*').neq('status', 'cancelada');
        if (targetEmail || cleaned.includes('@')) {
          sbQuery = sbQuery.ilike('client_email', targetEmail || cleaned);
        } else if (targetPhone || cleanDigits.length >= 8) {
          const digits = targetPhone || cleanDigits;
          sbQuery = sbQuery.or(`client_dni.eq.${digits},client_phone.ilike.%${digits.slice(-8)}%`);
        } else if (targetDni) {
          sbQuery = sbQuery.or(`client_dni.eq.${targetDni},client_dni.ilike.%${targetDni}%`);
        } else {
          sbQuery = sbQuery.or(`client_name.ilike.%${cleaned}%,id.eq.${cleaned}`);
        }
        const { data: remoteBookings, error: sbErr } = await sbQuery.order('created_at', { ascending: false }).limit(1);
        if (!sbErr && remoteBookings && remoteBookings.length > 0) {
          matchingBooking = mapDbBookingToRecord(remoteBookings[0]);
        } else if (matchedProfile) {
          const { data: crossRemote } = await supabase
            .from('bookings')
            .select('*')
            .neq('status', 'cancelada')
            .or(`client_dni.eq.${matchedProfile.dni}${matchedProfile.email ? `,client_email.ilike.${matchedProfile.email}` : ''}`)
            .order('created_at', { ascending: false })
            .limit(1);
          if (crossRemote && crossRemote.length > 0) {
            matchingBooking = mapDbBookingToRecord(crossRemote[0]);
          }
        }
      } catch (err) {
        console.warn('Error consultando Supabase para check-in:', err);
      }
    }

    if (matchingBooking) {
      const scanTimeStr = new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const cls = classes.find((c) => c.id === matchingBooking.classId);
      const roomName =
        matchingBooking.roomName ||
        cls?.roomName ||
        (cls?.classType === 'Reformer' ? 'Sala 1 Reformer' : 'Sala 2 (Torre)');
      const roomId = cls?.roomId || (cls?.classType === 'Reformer' ? 'sala-1' : 'sala-2');
      let matchedClient = clients.find((c) => c && (c.dni === matchingBooking.clientDni || (targetDni && c.dni === targetDni)));

      // Si no está el cliente en memoria local, buscar en Supabase
      if (!matchedClient && isSupabaseConfigured() && supabase && (matchingBooking.clientDni || targetDni)) {
        try {
          const { data: dbClients } = await supabase
            .from('clients')
            .select('*')
            .eq('dni', matchingBooking.clientDni || targetDni)
            .limit(1);
          if (dbClients && dbClients.length > 0) {
            matchedClient = mapDbClientToProfile(dbClients[0]);
          }
        } catch {
          // ignore
        }
      }

      // Si ya estaba registrada previamente
      if (matchingBooking.status === 'asistio') {
        playStudioChime();
        setVerifiedBookingResult({
          clientName: matchingBooking.clientName,
          dni: matchingBooking.clientDni || targetDni || cleaned,
          avatar: matchedClient?.avatar,
          level: matchedClient?.planType === 'ilimitado' ? 'Avanzada · VIP' : 'Intermedio',
          roomName,
          roomId,
          bedNumber: matchingBooking.bedNumber || 1,
          className: matchingBooking.className,
          classNumberInfo: `Sesión de ${matchingBooking.className}`,
          classTime: matchingBooking.classTime,
          instructor: matchingBooking.instructor || 'Camila Morales',
          scanTime: scanTimeStr,
          status: 'Asistencia ya registrada previamente',
          isExistingCheckin: true,
        });
        setIsManualDniOpen(false);
        setIsCameraScannerOpen(false);
        return;
      }

      // Asignar cama si no tiene (1 al 8)
      const assignedBed = matchingBooking.bedNumber || Math.floor(Math.random() * 8) + 1;
      const updatedBooking: BookingRecord = {
        ...matchingBooking,
        status: 'asistio',
        bedNumber: assignedBed,
        checkInTime: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };

      // Notificar a los handlers
      onCheckInBooking?.(updatedBooking);
      onAssignBed?.(matchingBooking.id, assignedBed);
      onGainExp?.(150, `Asistencia puntual en Sala Reformer (Cama #${assignedBed})`);
      playStudioChime();

      // Sincronizar en background con Supabase si está disponible
      const syncDni = targetDni || matchingBooking.clientDni;
      if (syncDni) {
        supabaseService.performTotemCheckIn(syncDni).catch(() => {});
      }

      setVerifiedBookingResult({
        clientName: matchingBooking.clientName,
        dni: matchingBooking.clientDni || targetDni || cleaned,
        avatar: matchedClient?.avatar,
        level: matchedClient?.planType === 'ilimitado' ? 'Avanzada · VIP' : 'Intermedio',
        roomName,
        roomId,
        bedNumber: assignedBed,
        className: matchingBooking.className,
        classNumberInfo: `Sesión de ${matchingBooking.className}`,
        classTime: matchingBooking.classTime,
        instructor: matchingBooking.instructor || 'Camila Morales',
        scanTime: scanTimeStr,
        status: '¡Acceso Confirmado!',
        isExistingCheckin: false,
      });

      showToast?.(`¡Clase Verificada! ${matchingBooking.clientName} en Cama #${assignedBed}`, 'success');
      setNoClassWarningResult(null);
      setIsManualDniOpen(false);
      setIsCameraScannerOpen(false);
      return;
    }

    // SI NO TIENE RESERVA ACTIVA: Cerrar modales de captura, emitir sonido y mostrar AVISO PROMINENTE
    setVerifiedBookingResult(null);
    setIsCameraScannerOpen(false);
    setIsManualDniOpen(false);
    playWarningChime();

    // 2. Buscar si la persona existe como clienta registrada en el estudio (local o Supabase)
    let matchingClient =
      matchedProfile ||
      clients.find(
        (c) =>
          c &&
          ((targetDni && (c.dni === targetDni || c.alternateDni === targetDni)) ||
            (targetPhone && c.phone?.replace(/\D/g, '').endsWith(targetPhone.slice(-8))) ||
            (targetEmail && c.email?.toLowerCase() === targetEmail.toLowerCase()) ||
            (targetName && c.name?.toLowerCase().includes(targetName.toLowerCase())) ||
            (cleaned &&
              (c.dni === cleaned ||
                c.alternateDni === cleaned ||
                c.name?.toLowerCase().includes(cleaned.toLowerCase()))))
      );

    if (!matchingClient && isSupabaseConfigured() && supabase && (targetDni || cleaned || targetPhone || targetEmail)) {
      try {
        let clientSbQuery = supabase.from('clients').select('*');
        if (targetEmail || cleaned.includes('@')) {
          clientSbQuery = clientSbQuery.ilike('email', targetEmail || cleaned);
        } else if (targetPhone || cleanDigits.length >= 8) {
          const digits = targetPhone || cleanDigits;
          clientSbQuery = clientSbQuery.or(`dni.eq.${digits},phone.ilike.%${digits.slice(-8)}%`);
        } else {
          clientSbQuery = clientSbQuery.or(`dni.eq.${targetDni || cleaned},name.ilike.%${cleaned}%`);
        }

        const { data: dbClients } = await clientSbQuery.limit(1);
        if (dbClients && dbClients.length > 0) {
          matchingClient = mapDbClientToProfile(dbClients[0]);
        }
      } catch {
        // ignore
      }
    }

    if (matchingClient) {
      setNoClassWarningResult({
        query: targetDni || cleaned,
        clientName: matchingClient.name,
        dni: matchingClient.dni,
        avatar: matchingClient.avatar,
        creditsLeft: matchingClient.creditsLeft ?? 0,
        currentPlan: matchingClient.currentPlan || 'Plan Activo',
        status: 'client_without_booking',
        message: 'No tienes una reserva programada para este horario o sesión.',
      });
      setFeedbackAlert({
        type: 'warning',
        message: `La alumna ${matchingClient.name} (DNI: ${matchingClient.dni}) tiene ${matchingClient.creditsLeft} créditos, pero NO tiene una reserva activa para esta hora.`,
      });
      showToast?.(`⚠️ ${matchingClient.name} no tiene clase registrada para hoy`, 'error');
      return;
    }

    // 3. No encontrada en reservas ni clientes
    setNoClassWarningResult({
      query: cleaned,
      dni: targetDni || cleaned,
      status: 'unregistered_code',
      message: 'El código QR o DNI ingresado no figura con ninguna clase reservada para hoy.',
    });
    setFeedbackAlert({
      type: 'error',
      message: `No se encontró ninguna reserva ni alumna con el documento o código "${cleaned}". Verifica los datos o regístrala en el panel.`,
    });
    showToast?.('⚠️ No tiene clases registradas', 'error');
  };

  const handleQrScanSuccess = (data: { dni?: string; name?: string; memId?: string; raw: string }) => {
    processCheckInVerification(data);
  };

  const handleManualDniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCheckInVerification(manualDniInput);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] flex flex-col justify-between selection:bg-[#B5654A] selection:text-[#FAF8F5]">
      {/* Barra Superior con Identidad de Marca y Usuario */}
      <header className="border-b border-[#E4DED4] bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/firme-studio-logo.svg"
              alt="FIRME STUDIO"
              className="w-10 h-10 rounded-full object-contain border border-[#DDD5C9]"
            />
            <div>
              <div className="font-fraunces text-base font-bold text-[#1A1815] tracking-wide leading-tight">
                FIRME STUDIO
              </div>
              <div className="text-[10px] text-[#B5654A] font-semibold tracking-wider uppercase">
                {isTotemKioskMode ? 'Tótem de Acceso a Sala · Sede SJL' : 'Portal de Trabajador · Sede SJL'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isTotemKioskMode ? (
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>PANTALLA 1 · TÓTEM ACTIVO</span>
                </span>
                <button
                  type="button"
                  onClick={handleExitTotemMode}
                  className="text-xs text-[#6B655C] hover:text-[#1A1815] px-3 py-1.5 rounded-xl hover:bg-[#F1ECE5] border border-[#DDD5C9] transition-colors cursor-pointer flex items-center gap-1 font-medium"
                  title="Volver a la selección de pantallas"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir de Tótem</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#E4DED4] px-3 py-1.5 rounded-full">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#DDD5C9]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#1A1815] text-[#FAF8F5] font-fraunces text-xs flex items-center justify-center font-bold">
                      {currentUser?.name?.charAt(0) || 'S'}
                    </div>
                  )}
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="text-xs font-semibold text-[#1A1815] block">
                      {currentUser?.name || 'Trabajador'}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full inline-block ${
                        isOwnerDev
                          ? 'bg-[#B5654A] text-white'
                          : isAdmin
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {isOwnerDev ? 'Owner / Dev' : isAdmin ? 'Administración' : 'Recepción SJL'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-full text-[#6B655C] hover:text-[#9A5340] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                  title="Cerrar sesión de trabajador"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Contenido Central: Selección de Espacio de Trabajo O Modo Tótem */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 sm:py-12 my-auto">
        {isTotemKioskMode ? (
          <div className="max-w-3xl mx-auto w-full text-center animate-in fade-in duration-300">
            <div className="bg-white border-2 border-[#B5654A] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#B5654A] via-[#C97B62] to-[#B5654A]" />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>PANTALLA 1 · TÓTEM ACTIVO</span>
                </span>

                {/* Enlace único oficial del tótem */}
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#6B655C] bg-[#FAF8F5] border border-[#E4DED4] px-3 py-1 rounded-full shadow-2xs">
                  <QrCode className="w-3.5 h-3.5 text-[#B5654A]" />
                  <span>Enlace directo: <strong className="font-mono text-[#B5654A]">firme-estudio.vercel.app/#totem</strong></span>
                </span>

                <button
                  type="button"
                  onClick={handleExitTotemMode}
                  className="text-xs text-[#6B655C] hover:text-[#1A1815] px-3 py-1.5 rounded-xl hover:bg-[#F1ECE5] border border-[#DDD5C9] transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
                  title="Volver a la selección de pantallas"
                >
                  <X className="w-4 h-4" />
                  <span>Salir de Tótem</span>
                </button>
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FAF2E8] border-2 border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] mx-auto mb-5 shadow-sm">
                <QrCode className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <h1 className="font-fraunces text-3xl sm:text-5xl font-bold text-[#1A1815] leading-tight">
                ¡Hola! Bienvenida a FIRME
              </h1>
              <p className="text-sm sm:text-base text-[#6B655C] mt-2.5 max-w-md mx-auto leading-relaxed">
                Acerca tu código QR de <strong>FIRME PASS</strong> a la cámara o ingresa tu DNI para validar tu llegada y ver tu <strong>Cama Reformer</strong> asignada.
              </p>

              {/* Opciones directas en la pantalla del tótem */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackAlert(null);
                    setIsCameraScannerOpen(true);
                  }}
                  className="p-5 rounded-2xl bg-[#B5654A] hover:bg-[#9A5340] text-white flex flex-col items-center justify-center gap-2 shadow-md hover:shadow-xl transition-all cursor-pointer group"
                >
                  <Camera className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm tracking-wide">Escanear Código QR</span>
                  <span className="text-[11px] text-[#FAF2E8]/80">Con la cámara del dispositivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFeedbackAlert(null);
                    setManualDniInput('');
                    setIsManualDniOpen(true);
                  }}
                  className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#DDD5C9] hover:border-[#1A1815] text-[#1A1815] flex flex-col items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <Search className="w-8 h-8 text-[#B5654A] group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-sm tracking-wide">Digitar mi DNI</span>
                  <span className="text-[11px] text-[#6B655C]">Ingreso manual táctil</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#B5654A] bg-[#F1ECE5] px-3 py-1 rounded-full border border-[#E4DED4] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lanzador de Pantallas & Mostrador</span>
            </div>
            <h1 className="font-fraunces text-3xl sm:text-4xl text-[#1A1815] font-semibold leading-tight">
              ¡Hola, {firstName}! Estaciones de Recepción & Sala
            </h1>
            <p className="text-sm text-[#6B655C] mt-2 leading-relaxed">
              Inicia la estación correspondiente para cada una de las 2 pantallas de tu recepción: el Tótem QR para las alumnas o el Panel Alumno/Sala para el mostrador.
            </p>
          </div>

          {/* Alerta de Feedback Rápido */}
          {feedbackAlert && (
            <div
              className={`max-w-4xl mx-auto mb-6 p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                feedbackAlert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm flex-1 leading-relaxed">
                {feedbackAlert.message}
              </div>
              <button
                onClick={() => setFeedbackAlert(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cuadrícula de 3 Módulos: Pantalla 1 Tótem + Pantalla 2 Mostrador + Gerencia */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            
            {/* MÓDULO 1: Tótem QR de Entrada (Para Pantalla 1 · Cara a la Alumna) */}
            <div className="bg-white rounded-3xl border-2 border-[#B5654A] p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5654A]/10 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-300" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-13 h-13 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shadow-xs group-hover:scale-105 transition-transform">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#B5654A] text-white shadow-xs">
                    Pantalla 1 · Cara a la Alumna
                  </span>
                </div>

                <h2 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] font-bold group-hover:text-[#B5654A] transition-colors">
                  Tótem QR de Entrada
                </h2>
                <p className="text-xs text-[#6B655C] mt-2 leading-relaxed">
                  Estación de auto-check-in para la clienta. Lee el pase FIRME PASS, reproduce el timbre sonoro y muestra en pantalla grande su sala, cama y docente (se limpia en 6 seg).
                </p>

                {/* Módulos destacados */}
                <div className="mt-5 space-y-2 pt-4 border-t border-[#F1ECE5]">
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Camera className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span><strong>Lector QR Ultrarrápido:</strong> Escaneo continuo por cámara</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Orientación Inmediata:</strong> Sala y Cama Reformer</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Clock className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span><strong>Auto-reseteo en 6 seg:</strong> Se limpia sola</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Search className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span><strong>Ingreso por DNI:</strong> Alternativa táctil manual</span>
                  </div>
                </div>
              </div>

              {/* Acciones del Módulo Escáner */}
              <div className="mt-6 pt-4 border-t border-[#F1ECE5] space-y-2.5">
                <button
                  type="button"
                  onClick={handleEnterTotemMode}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer group/btn"
                >
                  <Sparkles className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  <span className="tracking-wide">Iniciar Pantalla Tótem</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-between text-xs text-[#6B655C] px-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackAlert(null);
                      setIsCameraScannerOpen(true);
                    }}
                    className="hover:text-[#B5654A] hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Escanear QR rápido</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackAlert(null);
                      setManualDniInput('');
                      setIsManualDniOpen(true);
                    }}
                    className="hover:text-[#B5654A] hover:underline cursor-pointer flex items-center gap-1 font-medium"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Buscar por DNI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MÓDULO 2: Panel Alumno/Sala (Para Pantalla 2 · Mostrador Recepción) */}
            <div
              onClick={handleOpenStudentRoomPanel}
              className="group relative bg-white rounded-3xl border-2 border-[#E4DED4] hover:border-[#1A1815] p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5654A]/5 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-300" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-13 h-13 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C9] flex items-center justify-center text-[#1A1815] shadow-xs group-hover:scale-105 transition-transform">
                    <Building className="w-7 h-7 text-[#B5654A]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#1A1815] text-[#FAF8F5] shadow-xs">
                    Pantalla 2 · Mostrador Recepción
                  </span>
                </div>

                <h2 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] font-bold group-hover:text-[#B5654A] transition-colors">
                  Panel Alumno / Sala
                </h2>
                <p className="text-xs text-[#6B655C] mt-2 leading-relaxed">
                  Estación de trabajo de la recepcionista. Visualiza en vivo las 8 camas Reformer (se iluminan en verde en tiempo real), consulta la Ficha 360° y gestiona pedidos en Café & Bienestar.
                </p>

                {/* Módulos destacados */}
                <div className="mt-5 space-y-2 pt-4 border-t border-[#F1ECE5]">
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Building className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span><strong>Control en Vivo 8 Camas:</strong> Sincronizado con Tótem</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Users className="w-4 h-4 text-[#1A1815] shrink-0" />
                    <span><strong>Ficha 360° Alumna:</strong> Membresía, plan y salud</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Coffee className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><strong>Café & Bienestar:</strong> Healthy Bar & batidos</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Zap className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span><strong>Renovación en 1 Clic:</strong> Recarga de créditos</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1ECE5]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStudentRoomPanel();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#1A1815] group-hover:bg-[#33302C] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
                >
                  <span>Abrir Mostrador & Sala</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* MÓDULO 3: Panel de Gestión Integral (Back-Office · Gerencia) */}
            <div
              onClick={handleAdminClick}
              className="group relative bg-white rounded-3xl border-2 border-[#E4DED4] hover:border-[#1A1815] p-6 sm:p-7 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A1815]/5 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-300" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-13 h-13 rounded-2xl bg-[#F1ECE5] border border-[#DDD5C9] flex items-center justify-center text-[#1A1815] shadow-xs group-hover:scale-105 transition-transform">
                    <LayoutDashboard className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#6B655C] text-white shadow-xs">
                    Back-Office · Gerencia
                  </span>
                </div>

                <h2 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] font-bold group-hover:text-[#B5654A] transition-colors">
                  Panel de Control General
                </h2>
                <p className="text-xs text-[#6B655C] mt-2 leading-relaxed">
                  Consola general de administración: agenda semanal de clases, caja diaria POS, ventas, balance contable, leads y configuración del estudio.
                </p>

                {/* Módulos destacados */}
                <div className="mt-5 space-y-2 pt-4 border-t border-[#F1ECE5]">
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Calendar className="w-4 h-4 text-[#1A1815] shrink-0" />
                    <span><strong>Agenda Semanal:</strong> Horarios y profesores</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <CreditCard className="w-4 h-4 text-[#1A1815] shrink-0" />
                    <span><strong>Caja Diaria POS:</strong> Ventas y balances</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <Users className="w-4 h-4 text-[#1A1815] shrink-0" />
                    <span><strong>CRM & Leads:</strong> Conversión y seguimiento</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#1A1815]">
                    <ShieldCheck className="w-4 h-4 text-[#1A1815] shrink-0" />
                    <span><strong>Configuración:</strong> Sedes, roles y seguridad</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1ECE5]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdminClick();
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#1A1815] text-[#1A1815] group-hover:bg-[#1A1815] group-hover:text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>Abrir Panel Admin</span>
                  <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

        {/* Acciones Secundarias de Navegación */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-[#6B655C]">
          <button
            type="button"
            onClick={() => onSelectDestination('inicio')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E4DED4] hover:bg-[#F1ECE5] hover:text-[#1A1815] transition-colors cursor-pointer shadow-xs"
          >
            <Globe className="w-4 h-4 text-[#B5654A]" />
            <span>Ver sitio web público (modo alumna)</span>
          </button>

          <span className="hidden sm:inline text-[#DDD5C9]">·</span>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión de trabajador</span>
          </button>
        </div>
      </main>

      {/* Modal de Escaneo con Cámara QR */}
      <CameraQrScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
        title="Verificar Clase de Alumna"
        subtitle="Apunta la cámara al código QR del FIRME PASS en el celular de la alumna para validar su reserva y asignar cama Reformer."
      />

      {/* Modal de Ingreso Manual por DNI */}
      {isManualDniOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsManualDniOpen(false)}
        >
          <div
            className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-[#1A1815]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsManualDniOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A]">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-fraunces text-xl font-bold text-[#1A1815]">
                  Identificación de Alumna
                </h3>
                <p className="text-xs text-[#6B655C]">
                  DNI, Carné de Extranjería, Pasaporte o Celular
                </p>
              </div>
            </div>

            <form onSubmit={handleManualDniSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B655C] uppercase tracking-wider mb-1.5">
                  Documento, Celular o Correo
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ej. 70112233 / 987654321 / CE / Pasaporte"
                  value={manualDniInput}
                  onChange={(e) => setManualDniInput(e.target.value)}
                  className="w-full px-4 py-3 text-base font-mono tracking-wide rounded-xl border border-[#DDD5C9] bg-white text-[#1A1815] focus:outline-none focus:ring-2 focus:ring-[#B5654A]"
                />
                <p className="text-[11px] text-[#8C827A] mt-1.5 leading-tight">
                  Búsqueda universal: El sistema reconoce automáticamente DNI, Carné de Extranjería, Pasaporte, Celular registrado (9 dígitos) o nombre.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>VERIFICAR CLASE</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualDniOpen(false)}
                  className="py-3 px-4 rounded-xl bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#6B655C] font-semibold text-sm cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Pantalla de Orientación y Pase de Clase de la Alumna */}
      {verifiedBookingResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0F0E0C]/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
          onClick={() => setVerifiedBookingResult(null)}
        >
          {/* Luces ambientales cálidas de fondo */}
          <div className="absolute w-96 h-96 bg-[#B5654A]/20 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
          <div className="absolute w-96 h-96 bg-[#C97B62]/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

          <div
            className="bg-white rounded-3xl sm:rounded-[2rem] border border-[#E8DFD5] max-w-xl w-full shadow-[0_25px_70px_rgba(26,24,21,0.28)] relative text-[#1A1815] overflow-hidden my-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior animada de cuenta regresiva */}
            <div className="h-1.5 w-full bg-[#FAF2E8] relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B5654A] via-[#C97B62] to-[#8C3F27] transition-all duration-1000 ease-linear rounded-r-full"
                style={{ width: `${Math.max(0, (countdown / 6) * 100)}%` }}
              />
            </div>

            {/* Cabecera de Marca FIRME STUDIO & Estado */}
            <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-[#F1ECE5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-[#B5654A]">
                    FIRME STUDIO · PILATES
                  </div>
                  <div className="text-xs font-semibold text-[#6B655C]">
                    Pase de Acceso a Sala
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{verifiedBookingResult.status || 'Acceso Confirmado'}</span>
                </div>

                <button
                  onClick={() => setVerifiedBookingResult(null)}
                  className="p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                  aria-label="Cerrar confirmación"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 pt-4">
              {/* Saludo Personalizado a la Alumna */}
              <div className="text-center mb-4">
                <h3 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#1A1815] tracking-tight">
                  ¡Bienvenida, {verifiedBookingResult.clientName.split(' ')[0]}!
                </h3>
                <p className="text-xs text-[#6B655C] mt-0.5">
                  Tu asistencia fue registrada exitosamente. Dirígete a tu reformer asignado:
                </p>
              </div>

              {/* HERO BOARDING PASS: CAMA REFORMER ASIGNADA */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#8C3F27]/30 bg-gradient-to-br from-[#8C3F27] via-[#A8533B] to-[#6E2C19] text-white p-5 sm:p-6 mb-4">
                {/* Marca de agua elegante y resplandor */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-2 right-4 font-fraunces text-7xl sm:text-8xl font-black text-white/5 select-none pointer-events-none leading-none">
                  0{verifiedBookingResult.bedNumber}
                </div>

                {/* Encabezado del pase: Sala y Máquina */}
                <div className="relative z-10 flex items-center justify-between text-xs border-b border-white/20 pb-3 mb-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="font-bold tracking-wider uppercase text-white/95 text-[11px]">
                      {verifiedBookingResult.roomName || 'SALA 1 REFORMER'}
                    </span>
                    <span className="text-white/60">·</span>
                    <span className="text-white/80 text-[10px] font-medium tracking-wide">SEDE SJL</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs text-[10px] font-semibold text-white/90 border border-white/20">
                    BALANCED BODY®
                  </div>
                </div>

                {/* Tipografía Principal de la Cama */}
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-[#F5D8CE]">
                      TU REFORMER ASIGNADO
                    </div>
                    <div className="mt-1 font-fraunces text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-sm flex items-baseline gap-2">
                      <span>CAMA</span>
                      <span className="text-[#FFD9A0] font-sans">#{verifiedBookingResult.bedNumber}</span>
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-white/90 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      <span>Limpio, desinfectado y calibrado</span>
                    </div>
                  </div>

                  {/* Insignia visual del Reformer */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center p-2 text-center shadow-inner shrink-0">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-white/70">Equipo</span>
                    <span className="font-fraunces font-black text-2xl sm:text-3xl text-[#FFD9A0]">
                      0{verifiedBookingResult.bedNumber}
                    </span>
                    <span className="text-[9px] font-semibold text-white/80">Reformer</span>
                  </div>
                </div>

                {/* Separador tipo boleto perforado */}
                <div className="relative my-3.5">
                  <div className="border-t border-dashed border-white/25" />
                  <div className="absolute -left-8 -top-2 w-4 h-4 rounded-full bg-white" />
                  <div className="absolute -right-8 -top-2 w-4 h-4 rounded-full bg-white" />
                </div>

                {/* Pie del ticket: Hora de escaneo y sello digital */}
                <div className="relative z-10 flex items-center justify-between text-[10px] text-white/80 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#FFD9A0]" />
                    <span>Validado: <strong>{verifiedBookingResult.scanTime}</strong></span>
                  </div>
                  <div className="tracking-widest uppercase text-[9px] font-sans bg-black/25 px-2 py-0.5 rounded border border-white/15 text-white/90 font-medium">
                    FIRME PASS · QR VERIFICADO
                  </div>
                </div>
              </div>

              {/* FICHA VIP DE LA ALUMNA & RECOMPENSA EXP */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {verifiedBookingResult.avatar ? (
                    <img
                      src={verifiedBookingResult.avatar}
                      alt={verifiedBookingResult.clientName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#B5654A]/30 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FAF2E8] to-[#F1ECE5] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] font-bold font-fraunces text-xl shrink-0 shadow-2xs">
                      {verifiedBookingResult.clientName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#8C4A34] font-bold uppercase tracking-wider">
                      Alumna Titular
                    </div>
                    <h4 className="font-fraunces text-base sm:text-lg font-bold text-[#1A1815] truncate leading-tight">
                      {verifiedBookingResult.clientName}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#6B655C]">
                      <span>DNI: <strong className="font-mono text-[#1A1815]">{verifiedBookingResult.dni}</strong></span>
                      <span className="text-[#DDD5C9]">·</span>
                      <span className="text-[10px] font-semibold text-[#B5654A] bg-[#FAF2E8] px-2 py-0.2 rounded-md">
                        {verifiedBookingResult.level || 'Intermedio'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Insignia de gamificación */}
                <div className="shrink-0 text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>+150 EXP</span>
                  </div>
                  <div className="text-[9px] text-[#6B655C] mt-1 font-medium">
                    Asistencia Puntual
                  </div>
                </div>
              </div>

              {/* DETALLE COMPLETO DE CLASE & DOCENTE (SIN TEXTO TRUNCADO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                {/* Clase y Horario */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4DED4]">
                  <div className="text-[10px] uppercase font-bold text-[#8C4A34] tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>Clase Programada</span>
                  </div>
                  <div className="font-bold text-[#1A1815] text-sm leading-snug">
                    {verifiedBookingResult.className}
                  </div>
                  <div className="text-xs text-[#6B655C] mt-1 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>Horario: <strong className="text-[#1A1815]">{verifiedBookingResult.classTime}</strong></span>
                  </div>
                </div>

                {/* Docente Asignado */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E4DED4]">
                  <div className="text-[10px] uppercase font-bold text-[#8C4A34] tracking-wider mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>Instructor a Cargo</span>
                  </div>
                  <div className="font-bold text-[#1A1815] text-sm leading-snug">
                    {verifiedBookingResult.instructor}
                  </div>
                  <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Docente Confirmado</span>
                  </div>
                </div>
              </div>

              {/* Recordatorios de Estudio & Bienestar */}
              <div className="py-2 px-3 rounded-xl bg-[#FAF2E8]/60 border border-[#B5654A]/20 flex items-center justify-around text-[11px] text-[#6B655C] mb-4">
                <div className="flex items-center gap-1.5">
                  <span>🧦</span>
                  <span>Medias antideslizantes</span>
                </div>
                <span className="text-[#DDD5C9]">·</span>
                <div className="flex items-center gap-1.5">
                  <span>💧</span>
                  <span>Agua purificada</span>
                </div>
                <span className="text-[#DDD5C9]">·</span>
                <div className="flex items-center gap-1.5">
                  <span>🎒</span>
                  <span>Lockers disponibles</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackAlert(null);
                    setVerifiedBookingResult(null);
                    setIsCameraScannerOpen(true);
                  }}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Escanear Siguiente Alumna</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifiedBookingResult(null)}
                  className="py-3.5 px-6 rounded-xl bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] font-semibold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#B5654A]" />
                  <span>Listo ({countdown}s)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Pantalla de AVISO: NO TIENE CLASES REGISTRADAS */}
      {noClassWarningResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1A1815]/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setNoClassWarningResult(null)}
        >
          <div
            className="bg-white rounded-3xl border-2 border-amber-500 max-w-lg w-full shadow-2xl relative text-[#1A1815] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior de acento de advertencia */}
            <div className="h-2.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500" />

            <button
              onClick={() => setNoClassWarningResult(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer z-10"
              aria-label="Cerrar aviso"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 text-center">
              {/* Icono de Advertencia Prominente */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-600 mx-auto mb-4 shadow-sm">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              {/* Tag de Estado */}
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 mb-2">
                <span>⚠️ SIN RESERVA ACTIVA</span>
              </div>

              {/* TÍTULO PRINCIPAL SOLICITADO */}
              <h2 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#1A1815] leading-tight">
                NO TIENE CLASES REGISTRADAS
              </h2>

              <p className="text-xs sm:text-sm text-[#6B655C] mt-2 max-w-sm mx-auto leading-relaxed">
                {noClassWarningResult.status === 'client_without_booking'
                  ? 'Tu identificación fue reconocida, pero no registras una reserva programada para este horario.'
                  : 'El código QR o número de DNI ingresado no tiene ninguna reserva activa en el estudio.'}
              </p>

              {/* Ficha de Información de la Alumna / Documento */}
              <div className="my-5 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-4 text-left">
                {noClassWarningResult.status === 'client_without_booking' ? (
                  <div className="flex items-center gap-3.5">
                    {noClassWarningResult.avatar ? (
                      <img
                        src={noClassWarningResult.avatar}
                        alt={noClassWarningResult.clientName || ''}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800 font-bold font-fraunces text-lg shrink-0">
                        {noClassWarningResult.clientName?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-[#6B655C] font-semibold uppercase tracking-wider">
                        Alumna Registrada
                      </div>
                      <h4 className="font-fraunces text-base sm:text-lg font-bold text-[#1A1815] truncate">
                        {noClassWarningResult.clientName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#6B655C]">
                        <span>DNI: <strong className="font-mono text-[#1A1815]">{noClassWarningResult.dni}</strong></span>
                        <span>•</span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {noClassWarningResult.creditsLeft} créditos disponibles
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[#6B655C] font-semibold uppercase tracking-wider">
                        Documento o Código Escaneado
                      </div>
                      <div className="font-mono font-bold text-[#1A1815] text-sm sm:text-base">
                        {noClassWarningResult.query}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explicación orientadora */}
                <div className="mt-3 pt-3 border-t border-[#E4DED4] text-xs text-[#6B655C] flex items-start gap-2">
                  <span className="text-amber-600 font-bold text-base leading-none">👉</span>
                  <div className="leading-snug">
                    {noClassWarningResult.status === 'client_without_booking' ? (
                      <span>
                        Tienes créditos en tu cuenta. Acércate a la <strong>Recepción</strong> para que el personal verifique cupo libre y te asigne una cama Reformer en esta sesión.
                      </span>
                    ) : (
                      <span>
                        Por favor acércate al mostrador de <strong>Recepción</strong> para validar tus datos, comprar una membresía o agendar tu clase.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones de Acción y Cuenta Regresiva */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNoClassWarningResult(null);
                      setIsCameraScannerOpen(true);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Volver a Escanear QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNoClassWarningResult(null);
                      setManualDniInput('');
                      setIsManualDniOpen(true);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F1ECE5] border border-[#DDD5C9] text-[#1A1815] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Search className="w-4 h-4 text-[#B5654A]" />
                    <span>Digitar DNI Manual</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B655C]">
                    <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>Auto-cierre en <strong className="font-mono text-amber-700 font-bold">{warningCountdown}s</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNoClassWarningResult(null)}
                    className="text-xs font-semibold text-[#6B655C] hover:text-[#1A1815] underline cursor-pointer"
                  >
                    Cerrar aviso ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pie de Página Minimalista */}
      <footer className="border-t border-[#E4DED4] py-4 text-center text-xs text-[#AFA79C]">
        FIRME STUDIO · Sede San Juan de Lurigancho (Jr. Akapana 1261) · Control de Acceso Autorizado
      </footer>
    </div>
  );
};
