import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Settings,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Database,
  Building,
  Image as ImageIcon,
  Server,
} from 'lucide-react';
import {
  AuthUser,
  PREDEFINED_STAFF,
  StaffAccount,
} from '../../types';
import { AdminBannersTab } from './AdminBannersTab';
import { AdminBackendTab } from './AdminBackendTab';

interface AdminSettingsTabProps {
  currentUser?: AuthUser | null;
  isOwnerDev: boolean;
  onSelectStaffQuickLogin: (staff: StaffAccount) => void;
  onResetData: () => void;
  onClearDemoData?: () => void;
  showNotification: (msg: string) => void;
  getStoredPassword: () => string;
  setStoredPassword: (pwd: string) => void;
  initialSubView?: 'sede' | 'banners' | 'backend';
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  currentUser,
  isOwnerDev,
  onSelectStaffQuickLogin,
  onResetData,
  onClearDemoData,
  showNotification,
  getStoredPassword,
  setStoredPassword,
  initialSubView,
}) => {
  const [activeView, setActiveView] = useState<'sede' | 'banners' | 'backend'>(initialSubView || 'sede');
  const [currentKeyInput, setCurrentKeyInput] = useState('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [keyChangeSuccess, setKeyChangeSuccess] = useState('');
  const [keyChangeError, setKeyChangeError] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const correctCurrentKey = getStoredPassword();

    if (currentKeyInput.trim() !== correctCurrentKey) {
      setKeyChangeError('La clave actual es incorrecta.');
      setKeyChangeSuccess('');
      return;
    }

    if (newKeyInput.trim().length < 4) {
      setKeyChangeError('La nueva clave debe tener al menos 4 caracteres.');
      setKeyChangeSuccess('');
      return;
    }

    setStoredPassword(newKeyInput.trim());
    setKeyChangeSuccess('¡Contraseña actualizada exitosamente!');
    setKeyChangeError('');
    setCurrentKeyInput('');
    setNewKeyInput('');
    showNotification('Clave de acceso de administrador actualizada');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Sub-tabs: Ajustes de Sede vs Banners Web vs Backend IA */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveView('sede')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'sede'
              ? 'bg-[#1A1815] text-white shadow-xs'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Ajustes & Parámetros</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'banners'
              ? 'bg-[#1A1815] text-white shadow-xs'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#B5654A]" />
          <span>Imágenes & Carrusel Web</span>
        </button>

        {isOwnerDev && (
          <button
            type="button"
            onClick={() => setActiveView('backend')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeView === 'backend'
                ? 'bg-[#B5654A] text-white shadow-xs'
                : 'text-[#6B655C] hover:text-[#B5654A] hover:bg-white/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Backend & IA API</span>
            <span className="px-1.5 py-0.2 rounded-xs text-[9px] uppercase font-mono bg-black/20 text-white font-bold">
              Owner
            </span>
          </button>
        )}
      </div>

      {activeView === 'banners' ? (
        <AdminBannersTab />
      ) : activeView === 'backend' ? (
        <AdminBackendTab />
      ) : (
        <>
          {/* 1. Header de Sección */}
      <div className="bg-white border border-[#E8E2D7] rounded-3xl p-7 sm:p-9 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B5654A]/10 text-[#B5654A] text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Configuración Global & Entorno</span>
          </div>
          <h1 className="font-fraunces text-2xl sm:text-3xl font-bold text-[#1A1815]">
            Ajustes, Parámetros & Seguridad
          </h1>
          <p className="text-xs sm:text-sm text-[#6B655C] max-w-2xl leading-relaxed">
            Gestión de credenciales maestras, perfiles de acceso técnico y parámetros de la sede San Juan de Lurigancho.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#DDD5C9] text-xs font-semibold text-[#1A1815] shrink-0 self-start sm:self-auto">
          <span>Clave Predeterminada: </span>
          <strong className="text-[#B5654A] font-mono text-sm">30092023</strong>
        </div>
      </div>

      {/* 2. Cuentas de Personal Oficiales (Espaciosas y Limpias) */}
      <div className="bg-white border border-[#E8E2D7] rounded-3xl p-7 sm:p-9 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F2EEE9]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-fraunces text-xl font-bold text-[#1A1815]">
                Cuenta Principal del Equipo Staff (Owner & Lead Dev)
              </h2>
              <p className="text-xs text-[#6B655C]">
                Perfil maestro con acceso a la infraestructura y configuración del sistema
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREDEFINED_STAFF.map((staff) => {
            const isCurrent =
              currentUser?.email?.toLowerCase() === staff.email.toLowerCase() ||
              currentUser?.name?.toLowerCase() === staff.name.toLowerCase() ||
              currentUser?.dni === staff.dni;

            return (
              <div
                key={staff.id}
                className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A] shadow-md ring-1 ring-[#B5654A]/30'
                    : 'bg-white border-[#E8E2D7] hover:border-[#DDD5C9] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#B5654A] shadow-sm shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-fraunces font-bold text-base flex items-center gap-2 truncate">
                        <span>{staff.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-[#B5654A] text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Activo
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-[#D49581]' : 'text-[#B5654A]'}`}>
                        {staff.roleTitle}
                      </span>
                    </div>
                  </div>

                  <div className={`space-y-2.5 text-xs py-4 border-y ${isCurrent ? 'border-white/10 text-[#E0DDD8]' : 'border-[#F2EEE9] text-[#5C564E]'}`}>
                    <div className="flex justify-between">
                      <span className="opacity-70">Email Oficial:</span>
                      <strong className="font-mono text-xs">{staff.email}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">DNI:</span>
                      <strong className="font-mono text-xs">{staff.dni}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Celular:</span>
                      <strong className="text-xs">{staff.phone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Clave inicial:</span>
                      <strong className="font-mono text-xs text-[#B5654A]">{staff.defaultPassword || '30092023'}</strong>
                    </div>
                  </div>

                  <p className={`text-xs my-4 leading-relaxed line-clamp-2 ${isCurrent ? 'text-[#C9C3BA]' : 'text-[#6B655C]'}`}>
                    {staff.description}
                  </p>
                </div>

                <div>
                  {isCurrent ? (
                    <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Sesión Activa Ahora</span>
                    </div>
                  ) : isOwnerDev ? (
                    <button
                      type="button"
                      onClick={() => onSelectStaffQuickLogin(staff)}
                      className="w-full py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 bg-[#B5654A] hover:bg-[#9A5340] text-white shadow-xs"
                    >
                      <span>Cambiar a {staff.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="w-full py-2.5 px-4 rounded-2xl bg-[#F0ECE1] border border-[#DDD5C9] text-[#8C8479] text-xs font-medium flex items-center justify-center gap-2 select-none">
                      <Lock className="w-4 h-4 text-[#8C8479]" />
                      <span>Solo Owner puede alternar</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Ajustes de Seguridad & Parámetros en 2 Columnas Espaciosas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Password change */}
        <div className="bg-white border border-[#E8E2D7] rounded-3xl p-7 sm:p-9 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="font-fraunces text-xl font-bold text-[#1A1815]">
                Seguridad de Acceso
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B655C] mb-6 leading-relaxed">
              Cambia la contraseña maestra con la que el personal ingresa al portal administrativo de FIRME STUDIO.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={currentKeyInput}
                  onChange={(e) => setCurrentKeyInput(e.target.value)}
                  placeholder="Introduce la contraseña actual..."
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newKeyInput}
                  onChange={(e) => setNewKeyInput(e.target.value)}
                  placeholder="Mínimo 4 caracteres..."
                  className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl text-xs sm:text-sm text-[#1A1815] focus:outline-hidden focus:border-[#B5654A] focus:bg-white transition-all"
                  required
                />
              </div>

              {keyChangeError && (
                <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-200">
                  {keyChangeError}
                </div>
              )}

              {keyChangeSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200">
                  {keyChangeSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#1A1815] hover:bg-black text-[#FAF8F5] py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs hover:shadow-md mt-2"
              >
                Actualizar Contraseña Maestra
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Studio info & Reset */}
        <div className="bg-white border border-[#E8E2D7] rounded-3xl p-7 sm:p-9 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#B5654A]/10 text-[#B5654A] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h2 className="font-fraunces text-xl font-bold text-[#1A1815]">
                Parámetros de la Sede
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B655C] mb-6 leading-relaxed">
              Configuración operativa de la sede oficial de Pilates Boutique.
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#1A1815] bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E2D7]">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#6B655C]">Sede Activa:</span>
                <span className="font-bold text-[#B5654A]">LIMA - SAN JUAN DE LURIGANCHO</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E8E2D7]">
                <span className="text-[#6B655C]">Equipamiento:</span>
                <span className="font-semibold">Allegro 2 Reformer Balanced Body</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E8E2D7]">
                <span className="text-[#6B655C]">Capacidad Reformer:</span>
                <span className="font-semibold">8 camas exclusivas por turno</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E8E2D7]">
                <span className="text-[#6B655C]">Capacidad Mat:</span>
                <span className="font-semibold">12 lugares</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#E8E2D7]">
                <span className="text-[#6B655C]">Políticas de Cancelación:</span>
                <span className="font-semibold">Hasta 12 horas antes</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#F2EEE9] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                  Empezar con Estudio en Limpio
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Elimina datos de demostración y deja la plataforma lista para producción real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas vaciar todos los datos de demostración? Los clientes, reservas y cobros de prueba se borrarán para que ingreses solo tus datos reales.')) {
                    if (onClearDemoData) {
                      onClearDemoData();
                    }
                    showNotification('Base de datos limpiada. Ahora está en modo producción.');
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#B5654A] hover:bg-[#9A5340] text-xs font-bold text-white transition-all cursor-pointer inline-flex items-center gap-2 shrink-0 shadow-xs hover:shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Vaciar Demo</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#1A1815]">
                  Restablecer Datos de Demostración
                </h3>
                <p className="text-xs text-[#6B655C] mt-0.5">
                  Vuelve a cargar las alumnas y cobros de prueba de ejemplo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas recargar los datos de prueba de ejemplo?')) {
                    onResetData();
                    showNotification('Datos de demostración cargados');
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#E8E2D7] hover:bg-[#DDD5C9] text-xs font-bold text-[#1A1815] transition-colors cursor-pointer inline-flex items-center gap-2 shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Cargar Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AdminSettingsTab;
