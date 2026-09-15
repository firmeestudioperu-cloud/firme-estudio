import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Wallet,
  Shield,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Camera,
  QrCode,
  Eye,
  Building2,
  Smartphone,
  Users,
} from 'lucide-react';
import {
  AdminSubTab,
  AuthUser,
  CashRegisterState,
  PREDEFINED_STAFF,
  StaffAccount,
  BuiltInRole,
  UserRole,
} from '../../types';

interface RolePreviewItem {
  id: BuiltInRole;
  title: string;
  badge: string;
  badgeClass: string;
  desc: string;
  scope: string;
  icon: React.ElementType;
}

const ROLE_PREVIEWS: RolePreviewItem[] = [
  {
    id: 'owner_dev',
    title: 'Owner & Lead Dev',
    badge: 'OWNER',
    badgeClass: 'bg-[#B5654A] text-white',
    desc: 'Vista nativa. Control total: infraestructura, IA APIs, seguridad, finanzas y código.',
    scope: 'Control Total',
    icon: Shield,
  },
  {
    id: 'admin',
    title: 'Administración de Sede',
    badge: 'ADMIN',
    badgeClass: 'bg-emerald-600 text-white',
    desc: 'Gestión operativa: agenda semanal, caja diaria, gastos, captación de leads y reportes.',
    scope: 'Operación & Finanzas',
    icon: Building2,
  },
  {
    id: 'receptionist',
    title: 'Recepcionista Mostrador',
    badge: 'RECEPCIÓN',
    badgeClass: 'bg-amber-600 text-white',
    desc: 'Mostrador: Salas 1 & 2, Kiosco QR, escáner, CRM de alumnas y POS (sin gastos confidenciales).',
    scope: 'Salas & Mostrador',
    icon: QrCode,
  },
  {
    id: 'instructor',
    title: 'Instructora Reformer',
    badge: 'INSTRUCTORA',
    badgeClass: 'bg-purple-600 text-white',
    desc: 'Sala de clases: distribución de 8 camas, alumnas asignadas, alertas médicas y asistencia.',
    scope: 'Sala Reformer',
    icon: Users,
  },
  {
    id: 'client',
    title: 'Alumna / Estudiante',
    badge: 'ALUMNA',
    badgeClass: 'bg-sky-600 text-white',
    desc: 'Portal web público: reserva de clases reformer, créditos de packs, FIRME PASS QR y niveles.',
    scope: 'Web Alumnas',
    icon: Smartphone,
  },
];

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
  currentGroupTitle: string;
  currentNavLabel: string;
  cashRegister: CashRegisterState;
  onSelectSubTab: (tab: AdminSubTab) => void;
  isOwnerDev: boolean;
  currentUser?: AuthUser | null;
  onSelectStaffQuickLogin: (staff: StaffAccount) => void;
  onOpenQrModal?: () => void;
  onOpenScannerModal?: () => void;
  onExitToPublic: () => void;
  onGoToStaffHub?: () => void;
  isRealOwner?: boolean;
  simulatedRole?: UserRole | null;
  onSelectSimulatedRole?: (role: UserRole | null) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobileSidebar,
  currentGroupTitle,
  currentNavLabel,
  cashRegister,
  onSelectSubTab,
  isOwnerDev,
  currentUser,
  onSelectStaffQuickLogin,
  onOpenQrModal,
  onOpenScannerModal,
  onExitToPublic,
  onGoToStaffHub,
  isRealOwner,
  simulatedRole,
  onSelectSimulatedRole,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);

  const isOwner = isRealOwner ?? isOwnerDev;
  const activePreview =
    ROLE_PREVIEWS.find((r) => r.id === (simulatedRole || 'owner_dev')) || ROLE_PREVIEWS[0];
  const isSimulating = Boolean(simulatedRole && simulatedRole !== 'owner_dev');

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E4DED4] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger button for mobile */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-[#F1ECE5] text-[#1A1815] border border-[#DDD5C9] cursor-pointer hover:bg-[#E4DED4] transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5654A]">
              FIRME STUDIO ADMIN
            </span>
            <span className="text-[#6B655C] text-xs">/</span>
            <span className="text-xs text-[#6B655C] font-medium hidden sm:inline">
              {currentGroupTitle}
            </span>
          </div>
          <h1 className="font-fraunces text-lg sm:text-xl font-semibold text-[#1A1815] tracking-tight flex items-center gap-2">
            {currentNavLabel}
          </h1>
        </div>
      </div>

      {/* Top Bar Contextual Badges & Shortcuts */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Hub Selector */}
        {onGoToStaffHub && (
          <button
            type="button"
            onClick={onGoToStaffHub}
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-[#DDD5C9] text-xs font-semibold text-[#6B655C] hover:text-[#1A1815] transition-colors cursor-pointer"
            title="Volver a la pantalla de selección de espacios de trabajo"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Hub</span>
          </button>
        )}

        {/* Cash register quick status */}
        <button
          type="button"
          onClick={() => onSelectSubTab('caja')}
          className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            cashRegister.isOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Caja: {cashRegister.isOpen ? 'Abierta' : 'Cerrada'}</span>
        </button>

        {/* Selector de Vista de Rol (Exclusivo para el Owner) */}
        {isOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setStaffDropdownOpen(false);
              }}
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-xs cursor-pointer transition-all active:scale-95 ${
                isSimulating
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950 ring-2 ring-amber-400/40'
                  : 'bg-white hover:bg-[#FAF8F5] border-[#DDD5C9] hover:border-[#B5654A] text-[#1A1815]'
              }`}
              title="Previsualizar la plataforma desde cada rol (Exclusivo Owner Dev)"
            >
              <Eye className={`w-3.5 h-3.5 ${isSimulating ? 'text-amber-700 animate-pulse' : 'text-[#B5654A]'}`} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-none">
                  {isSimulating ? `Vista: ${activePreview.title.split(' ')[0]}` : 'Vista de Rol'}
                </span>
                <span className={`text-[10px] leading-tight ${isSimulating ? 'text-amber-700 font-semibold' : 'text-[#6B655C]'}`}>
                  {isSimulating ? 'Simulando Rol' : 'Owner Dev'}
                </span>
              </div>
              <span
                className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs ml-0.5 ${
                  isSimulating ? 'bg-amber-600 text-white' : 'bg-[#B5654A] text-white'
                }`}
              >
                {isSimulating ? activePreview.badge : '5 ROLES'}
              </span>
              <ChevronDown className="w-3 h-3 text-[#6B655C]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DDD5C9] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B655C] border-b border-[#E4DED4] mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#B5654A]" />
                    <span>Vista de Rol (Exclusivo Owner)</span>
                  </div>
                  <span className="text-[9px] text-[#B5654A] font-semibold">5 Vistas</span>
                </div>
                <div className="space-y-1">
                  {ROLE_PREVIEWS.map((rp) => {
                    const Icon = rp.icon;
                    const isCurrent = (simulatedRole || 'owner_dev') === rp.id;
                    return (
                      <button
                        key={rp.id}
                        type="button"
                        onClick={() => {
                          onSelectSimulatedRole?.(rp.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer text-xs ${
                          isCurrent
                            ? 'bg-[#FAF2E8] border border-[#B5654A]/40 shadow-2xs font-semibold text-[#1A1815]'
                            : 'hover:bg-[#FAF8F5] border border-transparent text-[#6B655C] hover:text-[#1A1815]'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isCurrent ? 'bg-[#B5654A] text-white' : 'bg-[#F1ECE5] text-[#6B655C]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-[#1A1815] leading-tight truncate">
                              {rp.title}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-xs shrink-0 ${rp.badgeClass}`}
                            >
                              {rp.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#787168] leading-tight mt-0.5">
                            {rp.desc}
                          </p>
                        </div>
                        {isCurrent && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-2.5 pt-2 border-t border-[#E4DED4] text-[10px] text-[#8C8479] flex items-center justify-between px-1">
                  <span>💡 Cambia vistas instantáneamente</span>
                  {isSimulating && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSimulatedRole?.('owner_dev');
                        setRoleDropdownOpen(false);
                      }}
                      className="text-[#B5654A] hover:underline font-bold cursor-pointer"
                    >
                      Restaurar Owner
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Staff Identity & 1-Click Switcher in Topbar */}
        <div className="relative">
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setStaffDropdownOpen(!staffDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white hover:bg-[#FAF8F5] border-[#DDD5C9] hover:border-[#B5654A] shadow-xs cursor-pointer transition-all"
                title="Alternar usuario activo (Exclusivo Owner Dev)"
              >
                <Shield className="w-3.5 h-3.5 text-[#B5654A]" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#1A1815] leading-none">
                    {currentUser?.name || 'Valentino'}
                  </span>
                  <span className="text-[10px] text-[#6B655C] leading-tight">
                    {currentUser?.roleTitle || 'Owner / Lead Developer'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-[#6B655C]" />
              </button>

              {staffDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#DDD5C9] rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B655C] border-b border-[#E4DED4] mb-1.5 flex items-center justify-between">
                    <span>Cambiar Usuario Activo (Owner)</span>
                    <span className="text-[9px] text-[#B5654A]">3 Perfiles</span>
                  </div>
                  <div className="space-y-1">
                    {PREDEFINED_STAFF.map((staff) => {
                      const isSelected =
                        currentUser?.email?.toLowerCase() === staff.email.toLowerCase() ||
                        currentUser?.name?.toLowerCase() === staff.name.toLowerCase() ||
                        currentUser?.dni === staff.dni;
                      return (
                        <button
                          key={staff.id}
                          type="button"
                          onClick={() => {
                            onSelectStaffQuickLogin(staff);
                            setStaffDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-[#FAF2E8] border border-[#B5654A]/30 font-semibold text-[#1A1815]'
                              : 'hover:bg-[#FAF8F5] border border-transparent text-[#6B655C] hover:text-[#1A1815]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#DDD5C9] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-xs leading-tight text-[#1A1815] truncate">
                                {staff.name}
                              </div>
                              <div className="text-[10px] text-[#6B655C] leading-tight truncate">
                                {staff.roleTitle}
                              </div>
                            </div>
                          </div>
                          {isSelected ? (
                            <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Activo</span>
                            </span>
                          ) : (
                            <span
                              className={`shrink-0 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-xs ${
                                staff.role === 'owner_dev'
                                  ? 'bg-[#B5654A] text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {staff.role === 'owner_dev' ? 'Owner' : 'Admin'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white border-[#DDD5C9] shadow-xs select-none"
              title="Sesión fija asignada a administración (Cambio de cuenta restringido al Owner)"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#1A1815] leading-none">
                  {currentUser?.name || 'Administración'}
                </span>
                <span className="text-[10px] text-[#6B655C] leading-tight">
                  {currentUser?.roleTitle || 'Administración Sede SJL'}
                </span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs ml-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                {currentUser?.role === 'receptionist' ? 'RECEPCIÓN' : currentUser?.role === 'instructor' ? 'INSTRUCTORA' : 'ADMIN'}
              </span>
            </div>
          )}
        </div>

        {/* Botón Escáner QR de Cámara Directo */}
        {onOpenScannerModal && (
          <button
            type="button"
            onClick={onOpenScannerModal}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Escanear pase QR de alumna con la cámara para check-in y asignación de cama"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
            <span>Escanear QR</span>
          </button>
        )}

        {/* Quick Web switch button */}
        <button
          type="button"
          onClick={onExitToPublic}
          className="px-3.5 py-1.5 text-xs font-semibold bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          title="Volver al sitio web público de alumnos"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">← Salir a Web Pública</span>
          <span className="sm:hidden">Web</span>
        </button>
      </div>
    </header>
  );
};
