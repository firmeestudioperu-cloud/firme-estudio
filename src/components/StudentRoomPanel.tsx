import React from 'react';
import {
  Building,
  ArrowLeft,
  LayoutDashboard,
  Globe,
  LogOut,
} from 'lucide-react';
import {
  AuthUser,
  ClassSession,
  BookingRecord,
  ClientProfile,
} from '../types';
import { AdminKioskTab } from './admin/AdminKioskTab';

interface StudentRoomPanelProps {
  currentUser: AuthUser | null;
  classes?: ClassSession[];
  bookings?: BookingRecord[];
  clients?: ClientProfile[];
  onCheckInBooking?: (booking: BookingRecord) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
  onUpdateClientCredits?: (clientId: string, credits: number) => void;
  onGoToStaffHub: () => void;
  onGoToAdminPanel?: () => void;
  onExitToPublic: () => void;
  onLogout: () => void;
}

export const StudentRoomPanel: React.FC<StudentRoomPanelProps> = ({
  currentUser,
  classes = [],
  bookings = [],
  clients = [],
  onCheckInBooking,
  onAssignBed,
  onUpdateClientCredits,
  onGoToStaffHub,
  onGoToAdminPanel,
  onExitToPublic,
  onLogout,
}) => {
  const canAccessAdmin =
    currentUser?.role === 'owner_dev' ||
    currentUser?.role === 'admin' ||
    sessionStorage.getItem('firme_real_owner') === 'true';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] flex flex-col font-sans selection:bg-[#B5654A] selection:text-[#FAF8F5]">
      {/* Barra Superior Dedicada: Panel Alumno / Sala (Completamente Separado del Admin) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E4DED4] px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Identidad y Título */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoToStaffHub}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD5C9] text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Volver al Hub de Staff"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Hub</span>
            </button>

            <div className="h-6 w-px bg-[#E4DED4] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#B5654A] text-white flex items-center justify-center shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-fraunces text-lg sm:text-xl font-bold text-[#1A1815] leading-tight">
                    Panel Alumno & Sala
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF2E8] border border-[#B5654A]/30 text-[#B5654A]">
                    Recepción Presencial
                  </span>
                </div>
                <p className="text-[11px] text-[#6B655C] hidden sm:block">
                  Sede San Juan de Lurigancho · Mostrador, Salas Reformer, Ficha 360° y Café & Bienestar
                </p>
              </div>
            </div>
          </div>

          {/* Acciones de Navegación del Operador */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Usuario operador */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-[#1A1815]">
                {currentUser?.name || 'Personal'}
              </span>
              <span className="text-[#AFA79C]">·</span>
              <span className="text-[#6B655C] text-[11px]">
                {currentUser?.role === 'receptionist'
                  ? 'Recepción'
                  : currentUser?.role === 'instructor'
                  ? 'Instructora'
                  : 'Administrador'}
              </span>
            </div>

            {/* Si tiene permiso de admin, enlace para alternar al Panel Admin */}
            {canAccessAdmin && onGoToAdminPanel && (
              <button
                type="button"
                onClick={onGoToAdminPanel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1815] hover:bg-[#33302C] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title="Ir al Panel Administrativo General (Back-Office)"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Panel Admin General →</span>
              </button>
            )}

            {/* Ver Web Pública */}
            <button
              type="button"
              onClick={onExitToPublic}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E4DED4] hover:bg-[#FAF8F5] text-[#1A1815] text-xs font-medium transition-colors cursor-pointer"
              title="Ver sitio web público en modo alumna"
            >
              <Globe className="w-3.5 h-3.5 text-[#B5654A]" />
              <span className="hidden sm:inline">Ver Web</span>
            </button>

            {/* Cerrar Sesión */}
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-rose-50 hover:text-rose-700 text-[#6B655C] text-xs font-medium transition-colors cursor-pointer"
              title="Cerrar sesión de trabajador"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline ml-1.5">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido Principal Autónomo */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AdminKioskTab
          classes={classes}
          bookings={bookings}
          clients={clients}
          onCheckInSuccess={onCheckInBooking}
          onAssignBed={onAssignBed}
          onUpdateClientCredits={onUpdateClientCredits}
        />
      </main>

      {/* Pie de Página */}
      <footer className="border-t border-[#E4DED4] py-3 text-center text-xs text-[#AFA79C] bg-white">
        FIRME STUDIO · Sede San Juan de Lurigancho (Jr. Akapana 1261) · Control Presencial de Alumnas & Salas
      </footer>
    </div>
  );
};
