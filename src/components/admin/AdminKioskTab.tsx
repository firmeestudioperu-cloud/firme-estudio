import React, { useState, useMemo, useEffect } from 'react';
import {
  Camera,
  CheckCircle2,
  Search,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  QrCode,
  Printer,
  X,
  AlertCircle,
  HelpCircle,
  Hash,
  ChevronRight,
  ShieldAlert,
  Building,
  User,
  Coffee,
  Calendar,
  CreditCard,
  HeartPulse,
  History,
  Activity,
  Award,
  RefreshCw,
  Plus,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  DayOfWeek,
  StudioRoom,
  DEFAULT_STUDIO_ROOMS,
} from '../../types';
import { DAYS_OF_WEEK, MOCK_CLASSES } from '../../data/mockData';
import { studioApi } from '../../services/api';
import { supabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { CameraQrScannerModal } from '../CameraQrScannerModal';
import { HealthyBarSection } from './HealthyBarSection';
import { AdminStudent360Section } from './AdminStudent360Section';

interface AdminKioskTabProps {
  classes?: ClassSession[];
  bookings?: BookingRecord[];
  clients?: ClientProfile[];
  onCheckInSuccess?: (updatedBooking: BookingRecord) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
  onOpenQrModal?: () => void;
  initialSubView?: 'sala' | 'alumna' | 'cafe';
  onUpdateClientCredits?: (clientId: string, credits: number) => void;
}

export const AdminKioskTab: React.FC<AdminKioskTabProps> = ({
  classes = [],
  bookings = [],
  clients = [],
  onCheckInSuccess,
  onAssignBed,
  onOpenQrModal,
  initialSubView = 'sala',
  onUpdateClientCredits,
}) => {
  const [activeSubView, setActiveSubView] = useState<'sala' | 'alumna' | 'cafe'>(initialSubView);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<ClientProfile | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [renewalSuccessMsg, setRenewalSuccessMsg] = useState<string | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('sala-1');
  const [crossRoomAlert, setCrossRoomAlert] = useState<{
    booking: BookingRecord;
    targetRoom: StudioRoom;
  } | null>(null);
  const [isFullscreenKiosk, setIsFullscreenKiosk] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('lun');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('lun-1');
  const [selectedBedForAssignment, setSelectedBedForAssignment] = useState<number | null>(null);
  const [selectedBookingToAssign, setSelectedBookingToAssign] = useState<BookingRecord | null>(null);
  const [activeCheckInPass, setActiveCheckInPass] = useState<BookingRecord | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInClientDni, setWalkInClientDni] = useState('');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [noClassWarningAlert, setNoClassWarningAlert] = useState<{
    client?: ClientProfile;
    query: string;
    rawName?: string;
  } | null>(null);

  // Fallbacks seguros para evitar pantallas blancas o fallos de renderizado
  const safeClasses = useMemo(() => {
    return Array.isArray(classes) && classes.length > 0 ? classes : MOCK_CLASSES;
  }, [classes]);

  const safeBookings = useMemo(() => {
    return Array.isArray(bookings) ? bookings.filter(Boolean) : [];
  }, [bookings]);

  const safeClients = useMemo(() => {
    return Array.isArray(clients) ? clients.filter(Boolean) : [];
  }, [clients]);

  // Estabilizar el callback de onCheckInSuccess para evitar re-suscripciones WebSocket innecesarias
  const onCheckInSuccessRef = React.useRef(onCheckInSuccess);
  onCheckInSuccessRef.current = onCheckInSuccess;

  // Suscripción en tiempo real a Supabase (WebSockets)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    try {
      const unsubscribe = supabaseService.subscribeToBookings(({ newRecord }) => {
        if (newRecord) {
          if (onCheckInSuccessRef.current) {
            onCheckInSuccessRef.current(newRecord);
          }
          if (newRecord.status === 'asistio') {
            setFeedbackMessage(`⚡ Supabase Live: ${newRecord.clientName} marcó check-in en Cama #${newRecord.bedNumber || 'Asignada'}`);
          }
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (err) {
      console.warn('Realtime subscription error in AdminKioskTab:', err);
    }
  }, []);

  const studioRooms = DEFAULT_STUDIO_ROOMS;
  const currentRoom = studioRooms.find((r) => r.id === selectedRoomId) || studioRooms[0];

  // Helper to determine the room of a class
  const getClassRoomId = (c: ClassSession): string => {
    if (c.roomId) return c.roomId;
    return c.classType === 'Reformer' ? 'sala-1' : 'sala-2';
  };

  // Classes for the active room
  const roomClasses = useMemo(() => {
    return safeClasses.filter((c) => c && getClassRoomId(c) === selectedRoomId);
  }, [safeClasses, selectedRoomId]);

  // Classes for the active day in this room
  const dayClasses = useMemo(() => {
    return roomClasses.filter((c) => c && c.day === selectedDay);
  }, [roomClasses, selectedDay]);

  // Active class session
  const activeClass = useMemo(() => {
    const found = roomClasses.find((c) => c && c.id === selectedClassId && c.day === selectedDay);
    return found || dayClasses[0] || roomClasses[0] || null;
  }, [roomClasses, selectedClassId, dayClasses, selectedDay]);

  // Bookings belonging to the selected class
  const classBookings = useMemo(() => {
    if (!activeClass) return [];
    return safeBookings.filter((b) => b && b.classId === activeClass.id && b.status !== 'cancelada');
  }, [safeBookings, activeClass]);

  // Search filtered results (by DNI or client name)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return safeBookings.filter(
      (b) =>
        b &&
        b.status !== 'cancelada' &&
        ((b.clientName?.toLowerCase() || '').includes(q) ||
          (b.clientDni && b.clientDni.includes(q)) ||
          (b.clientPhone && b.clientPhone.includes(q)))
    );
  }, [safeBookings, searchQuery]);

  // Map of Bed 1..8 with assigned booking
  const bedMap = useMemo(() => {
    const map: { [bedNum: number]: BookingRecord | undefined } = {};
    for (let i = 1; i <= 8; i++) {
      map[i] = classBookings.find((b) => b && b.bedNumber === i);
    }
    return map;
  }, [classBookings]);

  // Bookings without a bed yet
  const unassignedBookings = useMemo(() => {
    return classBookings.filter((b) => b && !b.bedNumber);
  }, [classBookings]);

  const handleSelectBed = (bedNum: number) => {
    const occupant = bedMap[bedNum];
    if (occupant) {
      // If bed is already occupied, select it to view details or check in
      setSelectedBookingToAssign(occupant);
    } else {
      // Bed is free!
      setSelectedBedForAssignment(bedNum);
    }
  };

  const handlePerformCheckIn = async (booking: BookingRecord, bedNumber?: number) => {
    try {
      const chosenBed = bedNumber || booking.bedNumber || (selectedBedForAssignment ?? undefined);
      
      // 1. Sincronizar con Supabase si está disponible
      if (chosenBed) {
        supabaseService.assignBed(booking.id, chosenBed).catch(() => {});
      }
      supabaseService.updateBookingStatus(booking.id, 'asistio').catch(() => {});

      // 2. Probar backend REST
      try {
        const res = await studioApi.checkInBooking(booking.id, chosenBed);
        if (res.data) {
          booking = res.data;
        }
      } catch {
        // Fallback local update
        booking.status = 'asistio';
        booking.checkInTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
        if (chosenBed) {
          booking.bedNumber = chosenBed;
        }
      }

      if (onCheckInSuccess) {
        onCheckInSuccess(booking);
      }

      setActiveCheckInPass(booking);
      setFeedbackMessage(`¡Check-in exitoso para ${booking.clientName}! Cama #${booking.bedNumber || 'Asignada'}.`);
      setSelectedBedForAssignment(null);
      setSelectedBookingToAssign(null);
      setSearchQuery('');
    } catch {
      setFeedbackMessage('Ocurrió un error al registrar el check-in. Intenta nuevamente.');
    }
  };

  const handleAssignBedToBooking = async (bookingId: string, bedNumber: number) => {
    try {
      // 1. Sincronizar con Supabase
      supabaseService.assignBed(bookingId, bedNumber).catch(() => {});

      // 2. Sincronizar con backend REST
      try {
        await studioApi.assignBed(bookingId, bedNumber);
      } catch {
        // local fallback
      }
      if (onAssignBed) {
        onAssignBed(bookingId, bedNumber);
      }
      setFeedbackMessage(`Cama Reformer #${bedNumber} asignada correctamente.`);
      setSelectedBedForAssignment(null);
      setSelectedBookingToAssign(null);
    } catch {
      setFeedbackMessage('No se pudo asignar la cama.');
    }
  };

  const executeWalkInForClient = (client: ClientProfile) => {
    if (!activeClass) {
      setFeedbackMessage('No hay ninguna sesión de clase disponible en este horario.');
      return;
    }

    // Find first empty bed
    let emptyBed = 1;
    for (let i = 1; i <= 8; i++) {
      if (!bedMap[i]) {
        emptyBed = i;
        break;
      }
    }

    const now = new Date();
    const newBooking: BookingRecord = {
      id: `walkin-${Date.now()}`,
      classId: activeClass.id,
      className: activeClass.name,
      classTime: activeClass.time,
      classDay: activeClass.day,
      instructor: activeClass.instructor,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientDni: client.dni,
      status: 'asistio',
      bookedAt: `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
      bedNumber: emptyBed,
      checkInTime: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      medicalAlert: client.medicalNotes,
    };

    if (onCheckInSuccess) {
      onCheckInSuccess(newBooking);
    }
    setActiveCheckInPass(newBooking);
    setIsWalkInOpen(false);
    setWalkInClientDni('');
    setFeedbackMessage(`Check-in express completado para ${client.name} en Cama #${emptyBed}.`);
  };

  const handleWalkInCheckIn = () => {
    const client = clients.find((c) => c.dni === walkInClientDni.trim());
    if (!client) {
      setFeedbackMessage('No se encontró ninguna alumna con ese DNI en la base del estudio.');
      return;
    }
    executeWalkInForClient(client);
  };

  const handleQrScanSuccess = (data: { dni?: string; name?: string; memId?: string; phone?: string; email?: string; raw: string }) => {
    let searchDoc = (data.dni || data.phone || data.email || data.memId || '').trim();
    if (!searchDoc && data.raw) {
      const match = data.raw.match(/[?&#](?:dni|doc|documento|ce|pasaporte)=([^&#]+)/i);
      if (match) searchDoc = decodeURIComponent(match[1]).trim();
    }
    const cleanDigits = (data.dni || data.phone || searchDoc).replace(/\D/g, '');

    if (!searchDoc && !cleanDigits && !data.name) {
      setFeedbackMessage('No se pudo identificar un DNI o código válido en el QR escaneado.');
      return;
    }

    // Buscar perfil de clienta en la base para cruce inteligente
    const matchedClient = safeClients.find(
      (c) =>
        c &&
        ((searchDoc && (c.dni === searchDoc || c.alternateDni === searchDoc)) ||
          (cleanDigits.length >= 8 && c.phone?.replace(/\D/g, '').endsWith(cleanDigits.slice(-8))) ||
          (data.email && c.email?.toLowerCase() === data.email.toLowerCase()) ||
          (data.name && c.name?.toLowerCase().includes(data.name.toLowerCase())))
    );

    const matchesBooking = (b: BookingRecord) => {
      if (!b || b.status === 'cancelada') return false;
      if (searchDoc && (b.clientDni === searchDoc || b.id === searchDoc)) return true;
      if (cleanDigits.length >= 8 && b.clientPhone && b.clientPhone.replace(/\D/g, '').endsWith(cleanDigits.slice(-8))) return true;
      if (data.email && b.clientEmail && b.clientEmail.toLowerCase() === data.email.toLowerCase()) return true;
      if (data.name && b.clientName && b.clientName.toLowerCase().includes(data.name.toLowerCase())) return true;
      if (matchedClient) {
        if (matchedClient.dni && b.clientDni === matchedClient.dni) return true;
        if (matchedClient.alternateDni && b.clientDni === matchedClient.alternateDni) return true;
        if (matchedClient.email && b.clientEmail && b.clientEmail.toLowerCase() === matchedClient.email.toLowerCase()) return true;
        const mcPhone = (matchedClient.phone || '').replace(/\D/g, '');
        if (mcPhone.length >= 8 && b.clientPhone && b.clientPhone.replace(/\D/g, '').endsWith(mcPhone.slice(-8))) return true;
      }
      return false;
    };

    // 1. Buscar si tiene reserva en la clase activa de esta sala
    const inCurrentClass = classBookings.find(matchesBooking);

    if (inCurrentClass) {
      handlePerformCheckIn(inCurrentClass);
      setCrossRoomAlert(null);
      setFeedbackMessage(`📱 QR Escaneado con éxito en ${currentRoom.shortName}: Check-in confirmado para ${inCurrentClass.clientName}.`);
      return;
    }

    // 2. Buscar si tiene reserva en otra clase de ESTA MISMA SALA
    const inThisRoomBooking = safeBookings.find((b) => {
      if (!matchesBooking(b)) return false;
      const cls = safeClasses.find((c) => c.id === b.classId);
      return cls && getClassRoomId(cls) === selectedRoomId;
    });

    if (inThisRoomBooking) {
      setSelectedClassId(inThisRoomBooking.classId);
      handlePerformCheckIn(inThisRoomBooking);
      setCrossRoomAlert(null);
      setFeedbackMessage(`📱 QR Escaneado: Se encontró reserva en clase ${inThisRoomBooking.className} (${inThisRoomBooking.classTime} h) en ${currentRoom.shortName}. Check-in confirmado.`);
      return;
    }

    // 3. ¡VALIDACIÓN CRUZADA DE SALAS! ¿Tiene reserva en OTRA sala?
    const inOtherRoomBooking = safeBookings.find(matchesBooking);

    if (inOtherRoomBooking) {
      const otherCls = safeClasses.find((c) => c.id === inOtherRoomBooking.classId);
      const otherRoomId = otherCls ? getClassRoomId(otherCls) : (selectedRoomId === 'sala-1' ? 'sala-2' : 'sala-1');
      const otherRoom = studioRooms.find((r) => r.id === otherRoomId) || studioRooms[0];

      setCrossRoomAlert({
        booking: inOtherRoomBooking,
        targetRoom: otherRoom,
      });
      setFeedbackMessage(`⚠️ ATENCIÓN: ${inOtherRoomBooking.clientName} tiene reserva en ${otherRoom.name} (${inOtherRoomBooking.className} - ${inOtherRoomBooking.classTime}h).`);
      return;
    }

    // 4. Si no tiene reserva activa en ninguna clase ni sala para hoy: Mostrar AVISO de sin clase
    const matchingClient =
      matchedClient ||
      safeClients.find(
        (c) => c && (c.dni === searchDoc || (data.name && c.name?.toLowerCase() === data.name.toLowerCase()))
      );

    setCrossRoomAlert(null);
    setNoClassWarningAlert({
      client: matchingClient,
      query: searchDoc || cleanDigits,
      rawName: data.name,
    });
    setFeedbackMessage(
      matchingClient
        ? `⚠️ Alumna sin clase registrada: ${matchingClient.name} (DNI ${matchingClient.dni}) tiene ${matchingClient.creditsLeft} créditos pero no tiene reserva activa.`
        : `⚠️ Código o DNI sin reserva registrada: ${searchDni}`
    );
  };

  return (
    <div className={`space-y-6 ${isFullscreenKiosk ? 'fixed inset-0 z-50 bg-[#FAF8F5] p-6 overflow-y-auto' : ''}`}>
      {/* 0. Cabecera Principal del Panel Alumno/Sala & Selector de Sub-vistas */}
      <div className="bg-white border border-[#E4DED4] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shadow-xs">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-fraunces text-xl sm:text-2xl font-bold text-[#1A1815]">
                Panel Alumno/Sala
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#B5654A] text-white">
                Sede SJL
              </span>
            </div>
            <p className="text-xs text-[#6B655C] mt-0.5">
              Control de salas Reformer, fichas 360° de alumnas y barra Café & Bienestar.
            </p>
          </div>
        </div>

        {/* Selector de Sub-vistas */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubView('sala')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubView === 'sala'
                ? 'bg-[#B5654A] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5]'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Control Sala & Camas</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubView('alumna');
              if (!selectedStudentForDetail && safeClients.length > 0) {
                setSelectedStudentForDetail(safeClients[0]);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubView === 'alumna'
                ? 'bg-[#B5654A] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Ficha 360° Alumna ({safeClients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubView('cafe')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubView === 'cafe'
                ? 'bg-[#B5654A] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Café & Bienestar</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
              Healthy
            </span>
          </button>
        </div>
      </div>

      {activeSubView === 'cafe' && (
        <HealthyBarSection
          clients={safeClients}
          selectedRoomId={selectedRoomId}
          selectedClient={selectedStudentForDetail}
        />
      )}

      {activeSubView === 'alumna' && (
        <AdminStudent360Section
          clients={safeClients}
          bookings={safeBookings}
          classes={safeClasses}
          onGoToHealthyBar={(client) => {
            setSelectedStudentForDetail(client);
            setActiveSubView('cafe');
          }}
          onUpdateClientCredits={onUpdateClientCredits}
        />
      )}

      {activeSubView === 'sala' && (
        <div className="space-y-6">
          {/* 1. Selector de Salas & Módulo de Recepción */}
          <div className="bg-white border border-[#E4DED4] rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] flex items-center gap-1.5">
              <span>Módulo de Salas & Recepción</span>
              <span className="text-[#DDD5C9]">·</span>
              <span className="text-[#6B655C] font-normal">Sede San Juan de Lurigancho</span>
            </div>
            <div className="font-fraunces text-base font-bold text-[#1A1815]">
              Estación Activa: {currentRoom.name}
            </div>
          </div>
        </div>

        {/* Botones de Selección de Sala */}
        <div className="flex items-center gap-2 overflow-x-auto p-1 bg-[#FAF8F5] rounded-xl border border-[#E4DED4]">
          {studioRooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            const roomDayClasses = safeClasses.filter((c) => getClassRoomId(c) === room.id && c.day === selectedDay);
            const classIds = roomDayClasses.map((c) => c.id);
            const totalBookingsToday = safeBookings.filter((b) => classIds.includes(b.classId) && b.status !== 'cancelada').length;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setCrossRoomAlert(null);
                  const firstCls = safeClasses.find((c) => c.day === selectedDay && getClassRoomId(c) === room.id);
                  if (firstCls) setSelectedClassId(firstCls.id);
                  setFeedbackMessage(`Cambiando a estación: ${room.name}`);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#1A1815] text-[#FAF8F5] shadow-xs'
                    : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
                <span>{room.shortName}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-[#B5654A] text-white' : 'bg-[#E4DED4] text-[#1A1815]'
                  }`}
                >
                  {totalBookingsToday} reservadas
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Alerta de Alumna en Sala Incorrecta */}
      {crossRoomAlert && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="font-bold text-sm text-amber-950">
                ¡Alumna con Reserva en Otra Sala! ({crossRoomAlert.booking.clientName})
              </div>
              <p className="text-amber-800 text-xs mt-0.5">
                Esta alumna tiene reserva en <strong>{crossRoomAlert.targetRoom.name}</strong> para la clase{' '}
                <strong>{crossRoomAlert.booking.className} ({crossRoomAlert.booking.classTime}h)</strong>. Estás en la estación de {currentRoom.shortName}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedRoomId(crossRoomAlert.targetRoom.id);
                setSelectedClassId(crossRoomAlert.booking.classId);
                handlePerformCheckIn(crossRoomAlert.booking);
                setCrossRoomAlert(null);
              }}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Cambiar a {crossRoomAlert.targetRoom.shortName} y Registrar
            </button>
            <button
              type="button"
              onClick={() => setCrossRoomAlert(null)}
              className="p-2 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-xl cursor-pointer"
              title="Cerrar alerta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Controls */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B5654A]/10 text-[#B5654A] uppercase tracking-wider">
              {currentRoom.shortName} • Check-in
            </span>
            <span className="text-xs text-[#8C8479]">• Sede San Juan de Lurigancho</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Supabase Realtime Activo</span>
            </span>
          </div>
          <h2 className="font-fraunces text-2xl font-medium text-[#1A1815]">
            Kiosco de Check-in · {currentRoom.name}
          </h2>
          <p className="text-xs text-[#6B655C] mt-1">
            Validación de ingreso para alumnas por DNI, selección táctil de Reformer y emisión de pase de sala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCameraScannerOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm hover:scale-102"
            title={`Escanear el código QR para ${currentRoom.shortName}`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Escanear Pase QR ({currentRoom.shortName})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWalkInOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] border border-[#DDD5C9] text-xs font-semibold text-[#1A1815] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Walk-in / Asistencia Express</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreenKiosk(!isFullscreenKiosk)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              isFullscreenKiosk
                ? 'bg-[#1A1815] text-[#FAF8F5] hover:bg-black'
                : 'bg-[#B5654A] text-white hover:bg-[#9A5340] shadow-sm'
            }`}
          >
            {isFullscreenKiosk ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreenKiosk ? 'Salir de Modo Kiosco' : `Tótem Tablet (${currentRoom.shortName})`}</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Kiosk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search & Class Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick DNI / Name Search Box */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#B5654A]" />
              <span>Búsqueda Rápida de Alumna</span>
            </h3>
            <p className="text-[11px] text-[#8C8479] mb-3">
              Ingresa el número de DNI (8 dígitos) o el nombre para check-in inmediato.
            </p>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. 72849102 o María Fernanda..."
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl text-sm font-medium text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A] placeholder:text-zinc-400"
              />
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8479]" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick demo DNI pills for easy testing in reception */}
            <div className="mt-3 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-[#8C8479]">DNIs registrados:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('72849102')}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
              >
                72849102 (María)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('45912830')}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
              >
                45912830 (Rodrigo)
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('74820193')}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] transition-colors cursor-pointer"
              >
                74820193 (Camila)
              </button>
            </div>

            {/* Search Dropdown / Instant Results */}
            {searchQuery.trim() && (
              <div className="mt-4 pt-4 border-t border-[#E4DED4] space-y-2">
                <div className="text-[11px] font-semibold text-[#6B655C]">
                  {searchResults.length === 0
                    ? 'No se encontraron reservas con ese criterio'
                    : `Resultados encontrados (${searchResults.length})`}
                </div>

                {searchResults.map((result) => {
                  const isChecked = result.status === 'asistio';
                  return (
                    <div
                      key={result.id}
                      className="p-3 rounded-xl border border-[#E4DED4] bg-[#FAF8F5] hover:border-[#B5654A] transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#1A1815] truncate">
                            {result.clientName}
                          </span>
                          {result.clientDni && (
                            <span className="text-[10px] font-mono bg-[#EFE9DF] px-1.5 py-0.5 rounded-sm text-[#6B655C]">
                              DNI: {result.clientDni}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6B655C] mt-0.5 flex items-center gap-2">
                          <span>{result.className}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#1A1815]">{result.classTime}</span>
                          <span>•</span>
                          <span className="text-[#B5654A] font-medium">
                            {result.bedNumber ? `Cama #${result.bedNumber}` : 'Sin cama'}
                          </span>
                        </div>
                        {result.medicalAlert && (
                          <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{result.medicalAlert}</span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        {isChecked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Presente ({result.checkInTime || 'Ingresó'})</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePerformCheckIn(result)}
                            className="px-3 py-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Check-In</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Day & Class Session Selector */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2">
                1. Selecciona el Día de Operación
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedDay === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => {
                        setSelectedDay(d.key);
                        const firstClass = roomClasses.find((c) => c && c.day === d.key);
                        if (firstClass) setSelectedClassId(firstClass.id);
                      }}
                      className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#B5654A] text-white font-bold shadow-xs'
                          : 'bg-[#ECE5DD] hover:bg-[#DDD5C9] text-[#1A1815] text-xs'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">{d.shortLabel}</div>
                      <div className="text-[11px] font-semibold mt-0.5">
                        {d.dateLabel ? d.dateLabel.split(' ')[0] : d.shortLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B655C] mb-2">
                2. Selecciona la Clase en Turno
              </label>
              <div className="space-y-2">
                {dayClasses.map((cls) => {
                  const isSelected = activeClass?.id === cls.id;
                  const confirmedCount = safeBookings.filter((b) => b && b.classId === cls.id && b.status !== 'cancelada').length;
                  const attendedCount = safeBookings.filter((b) => b && b.classId === cls.id && b.status === 'asistio').length;

                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#B5654A] bg-[#FAF8F5] ring-2 ring-[#B5654A]/20 shadow-xs'
                          : 'border-[#E4DED4] bg-[#FAF8F5] hover:border-[#DDD5C9]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#1A1815] bg-[#ECE5DD] px-2 py-0.5 rounded-md">
                            {cls.time}
                          </span>
                          <span className="text-xs font-semibold text-[#1A1815]">{cls.name}</span>
                        </div>
                        <div className="text-[11px] text-[#6B655C] mt-1 flex items-center gap-2">
                          <span>Prof. {cls.instructor}</span>
                          <span>•</span>
                          <span>{cls.classType}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-[#1A1815]">
                          {attendedCount} / {confirmedCount} Presentes
                        </div>
                        <span className="text-[10px] text-[#8C8479]">
                          Capacidad: {cls.totalSpots} camas
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Unassigned Students Alert */}
            {unassignedBookings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{unassignedBookings.length} alumna(s) sin cama seleccionada</span>
                </div>
                <div className="text-[11px] text-amber-800 space-y-1">
                  {unassignedBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between">
                      <span className="font-medium">{b.clientName}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBookingToAssign(b)}
                        className="text-[10px] font-semibold text-[#B5654A] underline hover:text-[#9A5340] cursor-pointer"
                      >
                        Asignar cama ahora
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual 8 Allegro Reformer Bed Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-fraunces text-lg font-medium text-[#1A1815] flex items-center gap-2">
                  <span>{currentRoom.name}</span>
                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-[#1A1815] text-[#FAF8F5] font-semibold">
                    {currentRoom.capacity} Camas / Puestos
                  </span>
                </h3>
                <p className="text-xs text-[#6B655C]">
                  {activeClass ? (
                    <>
                      {activeClass.name} • {activeClass.time} • Instructora: <strong>{activeClass.instructor}</strong>
                    </>
                  ) : (
                    `Sin clases programadas para hoy en ${currentRoom.shortName}`
                  )}
                </p>
              </div>

              {/* Status legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
                  <span className="text-[#6B655C]">Presente</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#B5654A] border border-[#9A5340]" />
                  <span className="text-[#6B655C]">Reservada</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ECE5DD] border border-[#DDD5C9]" />
                  <span className="text-[#6B655C]">Libre</span>
                </div>
              </div>
            </div>

            {/* Instruction banner if selecting bed */}
            {selectedBookingToAssign && (
              <div className="mb-4 p-3 bg-[#B5654A]/10 border border-[#B5654A]/30 rounded-xl flex items-center justify-between">
                <div className="text-xs text-[#1A1815]">
                  Seleccionando cama para: <strong>{selectedBookingToAssign.clientName}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookingToAssign(null)}
                  className="text-xs text-[#B5654A] hover:underline font-medium"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Visual Studio Layout (Mirroring the 8 reformer machines) */}
            <div className="p-4 bg-[#F1ECE5] rounded-xl border border-[#E4DED4]">
              <div className="text-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8479] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E4DED4]">
                  {currentRoom.shortName} • Frente de Sala (Espejos & Atrio)
                </span>
              </div>

              {/* The 8 beds in a 2x4 layout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bedNum) => {
                  const booking = bedMap[bedNum];
                  const isOccupied = !!booking;
                  const isPresent = booking?.status === 'asistio';
                  const isTargeting = selectedBedForAssignment === bedNum;

                  return (
                    <div
                      key={bedNum}
                      onClick={() => {
                        if (selectedBookingToAssign && !isOccupied) {
                          handleAssignBedToBooking(selectedBookingToAssign.id, bedNum);
                        } else {
                          handleSelectBed(bedNum);
                        }
                      }}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] select-none ${
                        isOccupied
                          ? isPresent
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-500/10'
                          : isTargeting
                          ? 'bg-[#FAF8F5] border-[#B5654A] ring-2 ring-[#B5654A] shadow-md'
                          : 'bg-[#FAF8F5] border-[#DDD5C9] hover:border-[#B5654A] hover:bg-white shadow-xs'
                      }`}
                    >
                      {/* Bed header */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#1A1815] bg-[#ECE5DD] px-2 py-0.5 rounded-md">
                          Cama #{bedNum}
                        </span>
                        {isOccupied ? (
                          isPresent ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{booking.checkInTime || 'Ingresó'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Por llegar
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        )}
                      </div>

                      {/* Reformer Machine Stylized Representation */}
                      <div className="my-2 py-1.5 px-2 bg-black/5 rounded-lg text-center">
                        <div className="h-1.5 w-full bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-400 rounded-full mb-1" />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">
                          {currentRoom.shortName} • Cama
                        </span>
                      </div>

                      {/* Bed occupant info or prompt */}
                      <div className="mt-auto">
                        {isOccupied ? (
                          <div>
                            <div className="text-xs font-bold text-[#1A1815] leading-tight truncate">
                              {booking.clientName}
                            </div>
                            {booking.medicalAlert && (
                              <div className="mt-1 text-[9px] text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-sm truncate flex items-center gap-1">
                                <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{booking.medicalAlert}</span>
                              </div>
                            )}

                            {!isPresent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePerformCheckIn(booking);
                                }}
                                className="mt-2 w-full py-1 bg-[#B5654A] hover:bg-[#9A5340] text-white text-[10px] font-bold rounded-md transition-colors shadow-2xs"
                              >
                                Marcar Ingreso
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-1">
                            <span className="text-[11px] font-medium text-[#B5654A] hover:underline">
                              + Asignar a Alumna
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom summary bar */}
            <div className="mt-4 pt-4 border-t border-[#E4DED4] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6B655C] gap-2">
              <div className="flex items-center gap-3">
                <span>
                  Ocupadas: <strong>{classBookings.length} de 8</strong>
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">
                  Asistieron: {classBookings.filter((b) => b.status === 'asistio').length}
                </span>
                <span>•</span>
                <span>
                  Disponibles: <strong>{8 - classBookings.length}</strong>
                </span>
              </div>

              <div className="text-[11px] text-[#8C8479]">
                💡 Toca una cama libre para asignarla a una alumna que llegue a recepción.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL: PASE DIGITAL DE SALA FIRME (CHECK-IN SUCCESS)
          ========================================================= */}
      {activeCheckInPass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#B5654A] via-[#D49581] to-[#B5654A]" />

            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Check-in Confirmado</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCheckInPass(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Boarding Pass Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#DDD5C9]">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#DDD5C9] mb-2 p-1">
                <img
                  src="/firme-studio-logo.svg"
                  alt="FIRME STUDIO"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="font-fraunces text-xl font-bold text-[#1A1815]">FIRME STUDIO</h3>
              <p className="text-[11px] text-[#6B655C] tracking-wide uppercase font-semibold">
                Pase de Entrada a Sala • SJL Lima
              </p>
            </div>

            {/* Boarding Pass Body */}
            <div className="py-4 space-y-3">
              <div className="text-center">
                <span className="text-[10px] text-[#8C8479] uppercase tracking-wider">Alumna</span>
                <div className="text-lg font-bold text-[#1A1815]">{activeCheckInPass.clientName}</div>
                {activeCheckInPass.clientDni && (
                  <span className="text-xs font-mono text-[#6B655C]">DNI: {activeCheckInPass.clientDni}</span>
                )}
              </div>

              {/* Big Bed Announcement */}
              <div className="bg-[#FAF8F5] border-2 border-[#B5654A] rounded-2xl p-4 text-center shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A]">
                  Tu Cama Asignada
                </span>
                <div className="font-fraunces text-3xl font-bold text-[#1A1815] my-1">
                  REFORMER #{activeCheckInPass.bedNumber || '1'}
                </div>
                <p className="text-[11px] text-[#6B655C]">Balanced Body Allegro 2 con cabecero regulable</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#F1ECE5] p-3 rounded-xl">
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Clase</span>
                  <span className="font-semibold text-[#1A1815]">{activeCheckInPass.className}</span>
                </div>
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Horario</span>
                  <span className="font-semibold text-[#1A1815]">{activeCheckInPass.classTime}</span>
                </div>
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Instructora</span>
                  <span className="font-semibold text-[#1A1815]">{activeCheckInPass.instructor}</span>
                </div>
                <div>
                  <span className="text-[#8C8479] block text-[10px] uppercase font-semibold">Hora de Ingreso</span>
                  <span className="font-semibold text-emerald-700">
                    {activeCheckInPass.checkInTime || '07:25'}
                  </span>
                </div>
              </div>

              {/* Safety Protocol */}
              <div className="p-3 bg-white/60 rounded-xl border border-[#DDD5C9] text-[11px] text-[#6B655C] space-y-1">
                <div className="font-semibold text-[#1A1815] flex items-center gap-1">
                  <span>Recordatorios de Sala:</span>
                </div>
                <p>• Uso obligatorio de calcetines antideslizantes grip en el reformer.</p>
                <p>• Por favor guardar teléfono celular en los casilleros del vestidor.</p>
              </div>

              {/* Aesthetic QR code */}
              <div className="flex items-center justify-center pt-2">
                <div className="p-2 bg-white rounded-xl border border-[#DDD5C9] text-center shadow-xs">
                  <QrCode className="w-16 h-16 text-[#1A1815] mx-auto" />
                  <span className="text-[9px] font-mono text-[#8C8479] block mt-1">
                    FS-{activeCheckInPass.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#DDD5C9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-[#DDD5C9] hover:bg-white text-xs font-semibold text-[#1A1815] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#6B655C]" />
                <span>Imprimir Ticket</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCheckInPass(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
              >
                Listo, Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: WALK-IN / ASISTENCIA EXPRESS
          ========================================================= */}
      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                Asistencia Express / Walk-in
              </h3>
              <button
                type="button"
                onClick={() => setIsWalkInOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6B655C] mb-4">
              Para alumnas registradas con membresía o pack que se presentan sin reserva previa y desean ingresar a la clase activa {activeClass ? (
                <strong>de {activeClass.name} ({activeClass.time})</strong>
              ) : (
                'en turno'
              )}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1A1815] mb-1">
                  DNI de la Alumna
                </label>
                <input
                  type="text"
                  value={walkInClientDni}
                  onChange={(e) => setWalkInClientDni(e.target.value)}
                  placeholder="Introduce 8 dígitos del DNI..."
                  className="w-full px-3 py-2.5 bg-white border border-[#DDD5C9] rounded-xl text-sm font-medium text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                />
              </div>

              {/* Client quick list */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-[#8C8479] uppercase tracking-wider block mb-1">
                  O selecciona una alumna con créditos activos:
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {safeClients
                    .filter((c) => c && c.status === 'activo')
                    .slice(0, 5)
                    .map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => setWalkInClientDni(client.dni)}
                        className={`w-full p-2 rounded-lg text-left text-xs border transition-all cursor-pointer flex items-center justify-between ${
                          walkInClientDni === client.dni
                            ? 'bg-[#B5654A]/10 border-[#B5654A] font-semibold text-[#B5654A]'
                            : 'bg-white border-[#DDD5C9] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-[#1A1815]">{client.name}</div>
                          <span className="text-[10px] text-[#6B655C]">DNI: {client.dni} • Plan: {client.currentPlan}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          {client.creditsLeft} créditos
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDD5C9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWalkInOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DDD5C9] text-xs font-semibold text-[#1A1815] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleWalkInCheckIn}
                  disabled={!walkInClientDni.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] disabled:opacity-50 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirmar Asistencia & Asignar Cama
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Modal de Escáner por Cámara */}
      <CameraQrScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      {/* Modal: AVISO NO TIENE CLASES REGISTRADAS EN RECEPCIÓN */}
      {noClassWarningAlert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setNoClassWarningAlert(null)}
        >
          <div
            className="bg-white rounded-3xl border-2 border-amber-500 max-w-md w-full shadow-2xl relative text-[#1A1815] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500" />
            
            <button
              onClick={() => setNoClassWarningAlert(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-amber-600 mx-auto mb-3 shadow-xs">
                <AlertCircle className="w-9 h-9" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                Aviso de Mostrador
              </span>

              <h3 className="font-fraunces text-2xl font-bold text-[#1A1815] leading-tight">
                NO TIENE CLASES REGISTRADAS
              </h3>

              <p className="text-xs text-[#6B655C] mt-1.5 leading-relaxed">
                {noClassWarningAlert.client
                  ? `La alumna está registrada en el sistema, pero NO tiene ninguna clase reservada para hoy.`
                  : `El código QR o número de DNI ingresado no figura con ninguna clase reservada en el sistema.`}
              </p>

              {noClassWarningAlert.client ? (
                <div className="my-4 p-3.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1A1815]">{noClassWarningAlert.client.name}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {noClassWarningAlert.client.creditsLeft} créditos disponibles
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B655C]">
                    DNI: <strong className="font-mono text-[#1A1815]">{noClassWarningAlert.client.dni}</strong> • Plan: {noClassWarningAlert.client.currentPlan}
                  </div>
                </div>
              ) : (
                <div className="my-4 p-3.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-xs font-mono text-[#1A1815]">
                  DNI / Código: <strong>{noClassWarningAlert.query}</strong>
                </div>
              )}

              <div className="space-y-2 pt-1">
                {noClassWarningAlert.client && (
                  <button
                    type="button"
                    onClick={() => {
                      if (noClassWarningAlert.client) {
                        executeWalkInForClient(noClassWarningAlert.client);
                      }
                      setNoClassWarningAlert(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <span>Asignar Cama Walk-in ({currentRoom.shortName})</span>
                  </button>
                )}

                {noClassWarningAlert.client && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentForDetail(noClassWarningAlert.client || null);
                      setActiveSubView('alumna');
                      setNoClassWarningAlert(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#DDD5C9] text-[#1A1815] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>Ver Ficha 360° de la Alumna</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setNoClassWarningAlert(null)}
                  className="w-full py-2 px-4 rounded-xl bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#6B655C] font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cerrar Aviso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
