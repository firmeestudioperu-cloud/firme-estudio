import React, { useState } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  Sparkles,
  QrCode,
  Shield,
  HeartPulse,
  LogOut,
  MapPin,
  Layers,
  ArrowRight,
  Edit3,
  LayoutDashboard,
} from 'lucide-react';
import { AuthUser, BookingRecord } from '../types';

interface ClientCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  userBookings: BookingRecord[];
  allBookings?: BookingRecord[];
  scannedDni?: string | null;
  scannedName?: string | null;
  onOpenGoogleAuth: () => void;
  onLogout: () => void;
  onPerformCheckIn: (bookingId: string) => void;
  onOpenEditProfile?: () => void;
  onGoToAdminPanel?: () => void;
  onGoToStaffHub?: () => void;
}

export const ClientCheckInModal: React.FC<ClientCheckInModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userBookings,
  allBookings = [],
  scannedDni = null,
  scannedName = null,
  onOpenGoogleAuth,
  onLogout,
  onPerformCheckIn,
  onOpenEditProfile,
  onGoToAdminPanel,
  onGoToStaffHub,
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'perfil' | 'salud'>('checkin');
  const [checkInSuccessId, setCheckInSuccessId] = useState<string | null>(null);
  const [assignedBed, setAssignedBed] = useState<number | null>(null);

  const relevantBookings = React.useMemo(() => {
    const pool = allBookings && allBookings.length > 0 ? allBookings : userBookings;
    if (scannedDni) {
      const matchByDni = pool.filter(
        (b) => b && b.clientDni === scannedDni && b.status !== 'cancelada'
      );
      if (matchByDni.length > 0) return matchByDni;
    }
    if (currentUser) {
      const userDni = currentUser.dni?.trim();
      const userEmail = currentUser.email?.trim().toLowerCase();
      const userFirstName = (currentUser.name || '').trim().toLowerCase().split(' ')[0];

      const matched = pool.filter((b) => {
        if (!b || b.status === 'cancelada') return false;
        if (userDni && b.clientDni && b.clientDni === userDni) return true;
        if (userEmail && b.clientEmail && b.clientEmail.toLowerCase() === userEmail) return true;
        if (userFirstName && b.clientName && b.clientName.toLowerCase().includes(userFirstName)) return true;
        return false;
      });
      if (matched.length > 0) return matched;
      return userBookings;
    }
    return [];
  }, [currentUser, userBookings, allBookings, scannedDni]);

  if (!isOpen) return null;

  const handleCheckInClick = (booking: BookingRecord) => {
    // Asignar una cama aleatoria del 1 al 8 si no tiene
    const bed = booking.bedNumber || Math.floor(Math.random() * 8) + 1;
    setAssignedBed(bed);
    setCheckInSuccessId(booking.id);
    onPerformCheckIn(booking.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-[#1A1815]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors"
          aria-label="Cerrar modal de check-in"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-wider uppercase text-[#B5654A] bg-[#F1ECE5] px-2.5 py-1 rounded border border-[#E4DED4] mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Kiosco & Check-in Alumno</span>
          </div>
          <h2 className="font-fraunces text-2xl sm:text-3xl text-[#1A1815]">
            {currentUser ? `Hola, ${(currentUser.name || 'Alumna').split(' ')[0]}` : 'Check-in y Mi Cuenta'}
          </h2>
          <p className="text-xs sm:text-sm text-[#6B655C] mt-1">
            {currentUser
              ? 'Confirma tu llegada a sala y consulta tu cama de Reformer asignada.'
              : 'Accede con tu cuenta de Gmail o DNI para gestionar tus clases y marcar tu asistencia.'}
          </p>
        </div>

        {/* Success Banner (Global para Alumnas Logueadas o Invitadas con QR) */}
        {checkInSuccessId && assignedBed ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 block">
                ¡Check-in Confirmado!
              </span>
              <h3 className="font-fraunces text-3xl sm:text-4xl text-emerald-900 mt-1">
                CAMA REFORMER #{assignedBed}
              </h3>
            </div>
            <p className="text-xs text-emerald-700 max-w-xs mx-auto leading-relaxed">
              Tu plaza en la sala está confirmada. Recoge tu toalla en recepción y recuerda calzar tus calcetines antideslizantes.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Entendido, ingresar a sala
              </button>
            </div>
          </div>
        ) : !currentUser ? (
          /* Case 1: Not Logged In */
          <div className="space-y-4">
            {/* Scanned QR Detected Section */}
            {scannedDni && (
              <div className="bg-[#FAF2E8] border border-[#B5654A]/30 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#B5654A] font-bold">
                    <QrCode className="w-4 h-4" />
                    <span>Pase FIRME PASS Detectado</span>
                  </div>
                  <span className="text-[10px] bg-[#B5654A] text-white px-2 py-0.5 rounded-full font-semibold">
                    DNI: {scannedDni}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-[#E4DED4] space-y-1">
                  <div className="font-semibold text-[#1A1815] text-sm">
                    {scannedName || 'Alumna FIRME'}
                  </div>
                  <div className="text-[11px] text-[#6B655C]">
                    Check-in express habilitado por escaneo de código QR.
                  </div>
                </div>

                {relevantBookings.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#1A1815] block">
                      Tus sesiones agendadas para hoy:
                    </span>
                    {relevantBookings.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white border border-[#E4DED4] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="font-fraunces text-sm text-[#1A1815] font-medium">
                            {b.className}
                          </div>
                          <div className="text-[11px] text-[#6B655C] flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#B5654A]" />
                              {b.classTime} h ({b.classDay.toUpperCase()})
                            </span>
                            <span>•</span>
                            <span>{b.instructor}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCheckInClick(b)}
                          className="px-3.5 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>¡Marcar Check-in!</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    No encontramos una reserva activa para hoy con el DNI {scannedDni}. Si reservaste con otro correo, puedes iniciar sesión abajo o solicitar tu cama en el mostrador.
                  </div>
                )}
              </div>
            )}

            {/* Google Sign-in Card */}
            <div className="bg-white border border-[#E4DED4] rounded-xl p-5 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 bg-white rounded-full border border-gray-200 shadow-xs flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              </div>

              <div>
                <h3 className="font-fraunces text-lg text-[#1A1815] font-medium">
                  Crear cuenta o Iniciar Sesión
                </h3>
                <p className="text-xs text-[#6B655C] max-w-xs mx-auto mt-0.5">
                  Acceso rápido con Google, correo o tu cuenta de alumna.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenGoogleAuth}
                className="w-full bg-[#B5654A] hover:bg-[#9A5340] text-white py-3 px-4 rounded-xl font-medium text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Crear Cuenta o Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="bg-[#F1ECE5] border border-[#E4DED4] rounded-lg p-3.5 text-xs text-[#6B655C] flex items-center space-x-2.5">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                El check-in en sala confirma tu presencia ante el instructor y te asigna automáticamente tu cama Reformer (1 a 8).
              </span>
            </div>
          </div>
        ) : (
          /* Case 2: User is Logged In */
          <div className="space-y-4">
            {/* User Profile Snippet */}
            <div className="bg-white border border-[#E4DED4] rounded-xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name || 'Alumna'}
                    className="w-12 h-12 rounded-full object-cover border border-[#E4DED4]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#B5654A] text-white flex items-center justify-center font-fraunces text-lg">
                    {(currentUser.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm text-[#1A1815] flex items-center gap-1.5 flex-wrap">
                    <span>{currentUser.name || 'Alumna'}</span>
                    <span
                      className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full ${
                        currentUser.role === 'owner_dev'
                          ? 'bg-[#B5654A] text-white'
                          : currentUser.role === 'admin'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#E4DED4] text-[#1A1815]'
                      }`}
                    >
                      {currentUser.role === 'owner_dev'
                        ? 'Owner Dev'
                        : currentUser.role === 'admin'
                        ? 'Admin'
                        : 'Alumna'}
                    </span>
                  </div>
                  <div className="text-xs text-[#6B655C]">{currentUser.email}</div>
                  <div className="text-[11px] text-[#B5654A] font-medium mt-0.5">
                    {currentUser.planName || (currentUser.role === 'client' ? 'Pase Regular' : currentUser.roleTitle)} · {currentUser.creditsLeft ?? 0} clases disponibles
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onOpenEditProfile && (
                  <button
                    type="button"
                    onClick={onOpenEditProfile}
                    className="px-2.5 py-1.5 text-[#B5654A] hover:text-[#9A5340] bg-[#FAF2E8] hover:bg-[#F5E6D3] rounded-lg transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer border border-[#B5654A]/30"
                    title="Editar datos personales, contacto y ficha de salud"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Perfil</span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="p-1.5 text-[#6B655C] hover:text-[#9A5340] hover:bg-[#F1ECE5] rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>

            {/* Accesos exclusivos para Trabajadores (Owner / Admin) */}
            {(currentUser.role === 'owner_dev' || currentUser.role === 'admin') && (
              <div className="bg-[#FAF2E8] border border-[#B5654A]/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#B5654A]">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Espacios de Trabajo Staff</span>
                  </span>
                  <span className="text-[10px] uppercase bg-[#B5654A] text-white px-2 py-0.2 rounded-full">
                    Autorizado
                  </span>
                </div>
                {onGoToAdminPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onGoToAdminPanel();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-[#1A1815] hover:bg-[#322C27] text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>Ingresar al Panel de Administración</span>
                  </button>
                )}
              </div>
            )}

            {/* Subtabs: Check-in express vs Ficha médica */}
            <div className="flex border-b border-[#E4DED4] text-xs font-medium">
              <button
                onClick={() => setActiveTab('checkin')}
                className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'checkin'
                    ? 'border-[#B5654A] text-[#B5654A]'
                    : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
                }`}
              >
                Check-in de Llegada ({userBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('salud')}
                className={`py-2 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'salud'
                    ? 'border-[#B5654A] text-[#B5654A]'
                    : 'border-transparent text-[#6B655C] hover:text-[#1A1815]'
                }`}
              >
                Ficha Biomecánica & Salud
              </button>
            </div>

            {activeTab === 'checkin' && (
              <div className="space-y-3">
                {userBookings.length > 0 ? (
                  <div>
                    <span className="text-xs text-[#6B655C] block mb-2 font-medium">
                      Tus próximas sesiones agendadas:
                    </span>
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {userBookings.map((b) => (
                        <div
                          key={b.id}
                          className="bg-white border border-[#E4DED4] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div>
                            <div className="font-fraunces text-base text-[#1A1815] font-medium">
                              {b.className}
                            </div>
                            <div className="text-xs text-[#6B655C] flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#B5654A]" />
                                {b.classTime} h ({b.classDay.toUpperCase()})
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-[#B5654A]" />
                                {b.instructor}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCheckInClick(b)}
                            className="bg-[#B5654A] hover:bg-[#9A5340] text-white px-4 py-2 rounded-md text-xs font-medium shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>¡Marcar Check-in!</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white border border-[#E4DED4] rounded-xl">
                    <p className="text-sm text-[#6B655C]">No tienes clases reservadas para hoy.</p>
                    <button
                      onClick={onClose}
                      className="mt-3 text-xs font-medium text-[#B5654A] underline"
                    >
                      Explorar horarios y reservar
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'salud' && (
              <div className="bg-white border border-[#E4DED4] rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-[#B5654A] font-semibold text-sm">
                  <HeartPulse className="w-4 h-4" />
                  <span>Historial Postural & Ficha Preventiva</span>
                </div>
                <p className="text-[#6B655C] leading-relaxed">
                  Información registrada para que los instructores ajusten los muelles y la barra de pies en cada sesión:
                </p>

                <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E4DED4] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6B655C]">Nivel en Reformer:</span>
                    <span className="font-medium text-[#1A1815]">{currentUser.experienceLevel || 'Principiante'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B655C]">DNI / Documento:</span>
                    <span className="font-medium text-[#1A1815]">{currentUser.dni || '74829103'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B655C]">Condiciones posturales:</span>
                    <span className="font-medium text-emerald-700">
                      {Array.isArray(currentUser.healthConditions)
                        ? currentUser.healthConditions.join(', ')
                        : typeof currentUser.healthConditions === 'string' && currentUser.healthConditions
                        ? currentUser.healthConditions
                        : 'Apto sin lesiones reportadas'}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                  ¿Presentas dolor lumbar, cervical o alguna recomendación médica reciente? Notifícalo al instructor al ingresar a la sala.
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E4DED4] flex items-center justify-between text-xs text-[#6B655C]">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>FIRME STUDIO · San Juan de Lurigancho</span>
          </div>
          <span>Capacidad: 8 Reformers</span>
        </div>
      </div>
    </div>
  );
};
