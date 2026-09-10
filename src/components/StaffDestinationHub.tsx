import React from 'react';
import {
  ShieldCheck,
  Store,
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
  Lock,
} from 'lucide-react';
import { AuthUser, MainTabType, getRoleDefinition } from '../types';

interface StaffDestinationHubProps {
  currentUser: AuthUser | null;
  onSelectDestination: (tab: MainTabType) => void;
  onLogout: () => void;
}

export const StaffDestinationHub: React.FC<StaffDestinationHubProps> = ({
  currentUser,
  onSelectDestination,
  onLogout,
}) => {
  const isOwnerDev = currentUser?.role === 'owner_dev';
  const isAdmin = currentUser?.role === 'admin';
  const isReceptionist = currentUser?.role === 'receptionist';
  const roleDef = getRoleDefinition(currentUser?.role);
  const firstName = currentUser?.name?.split(' ')[0] || 'Personal';

  const [deniedMessage, setDeniedMessage] = React.useState('');

  const handleAdminClick = () => {
    if (isReceptionist) {
      setDeniedMessage('El Panel Admin General está reservado para Administradoras y Owner. Tu espacio asignado es el Panel de Registros Presencial.');
      setTimeout(() => setDeniedMessage(''), 4500);
      return;
    }
    onSelectDestination('admin');
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
                Portal de Trabajador · Sede SJL
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </header>

      {/* Contenido Central: Selección de Espacio de Trabajo */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 my-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-[#B5654A] bg-[#F1ECE5] px-3 py-1 rounded-full border border-[#E4DED4] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estación de Trabajo Activa</span>
          </div>
          <h1 className="font-fraunces text-3xl sm:text-4xl text-[#1A1815] font-semibold leading-tight">
            ¡Hola, {firstName}! ¿A dónde deseas ingresar?
          </h1>
          <p className="text-sm text-[#6B655C] mt-2 leading-relaxed">
            Como rol {isOwnerDev ? 'Owner & Lead Dev' : 'Administradora de Sede'}, puedes elegir el
            entorno optimizado para tu tarea: atención rápida en mostrador o control general del
            estudio.
          </p>
        </div>

        {/* Mensaje de restricción de rol */}
        {deniedMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{deniedMessage}</span>
          </div>
        )}

        {/* Tarjetas de Selección de Destino */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opción 1: Panel de Registros Presencial */}
          <div
            onClick={() => onSelectDestination('registros-presencial')}
            className="group relative bg-white rounded-3xl border-2 border-[#E4DED4] hover:border-[#B5654A] p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5654A]/5 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-300" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center text-[#B5654A] shadow-xs group-hover:scale-105 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#B5654A] text-white shadow-xs">
                  Recepción & Counter
                </span>
              </div>

              <h2 className="font-fraunces text-2xl text-[#1A1815] font-bold group-hover:text-[#B5654A] transition-colors">
                Panel de Registros Presencial
              </h2>
              <p className="text-xs sm:text-sm text-[#6B655C] mt-2 leading-relaxed">
                Optimizado para la velocidad en recepción física de la sede Jr. Akapana 1261.
                Registro de alumnas en 15 segundos, cobro express y control en sala.
              </p>

              {/* Módulos destacados */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-[#F1ECE5]">
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <Zap className="w-4 h-4 text-[#B5654A] shrink-0" />
                  <span>
                    <strong>Alta Express:</strong> DNI + Nombre + Cobro en 1 clic (Yape/POS/Efectivo)
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Check-in en Vivo:</strong> Asignación y marcado en las 8 camas Reformer
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <CreditCard className="w-4 h-4 text-[#B5654A] shrink-0" />
                  <span>
                    <strong>Caja Rápida:</strong> Venta de calcetines grip, bebidas y recargas
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <QrCode className="w-4 h-4 text-[#B5654A] shrink-0" />
                  <span>
                    <strong>Kiosco QR:</strong> Código en pantalla para auto-registro de alumnas
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F1ECE5] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#B5654A] group-hover:underline">
                Abrir Panel de Mostrador
              </span>
              <div className="w-10 h-10 rounded-full bg-[#B5654A] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Opción 2: Panel Admin General */}
          <div
            onClick={handleAdminClick}
            className={`group relative bg-white rounded-3xl border-2 p-6 sm:p-8 shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden ${
              isReceptionist
                ? 'opacity-85 border-[#E4DED4] cursor-not-allowed bg-zinc-50'
                : 'border-[#E4DED4] hover:border-[#1A1815] hover:shadow-2xl cursor-pointer'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A1815]/5 rounded-bl-full -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-300" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-[#F1ECE5] border border-[#DDD5C9] flex items-center justify-center text-[#1A1815] shadow-xs group-hover:scale-105 transition-transform">
                  {isReceptionist ? <Lock className="w-7 h-7 text-amber-700" /> : <LayoutDashboard className="w-7 h-7" />}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs ${
                    isReceptionist
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#1A1815] text-[#FAF8F5]'
                  }`}
                >
                  {isReceptionist ? 'Requiere Rol Admin / Owner' : 'Back-Office Integral'}
                </span>
              </div>

              <h2 className="font-fraunces text-2xl text-[#1A1815] font-bold group-hover:text-[#B5654A] transition-colors">
                Panel Admin General
              </h2>
              <p className="text-xs sm:text-sm text-[#6B655C] mt-2 leading-relaxed">
                {isReceptionist
                  ? 'Acceso restringido a Administradoras de sede y Owner. Para la atención presencial utiliza el Panel de Registros.'
                  : 'Centro de comando completo para la administración integral: analíticas, arqueo de caja, gastos, agenda semanal completa, instructores y WhatsApp.'}
              </p>

              {/* Módulos destacados */}
              <div className="mt-5 space-y-2.5 pt-4 border-t border-[#F1ECE5]">
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <Calendar className="w-4 h-4 text-[#1A1815] shrink-0" />
                  <span>
                    <strong>Agenda Semanal:</strong> Programación y horarios de las 8 camas
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <CreditCard className="w-4 h-4 text-[#1A1815] shrink-0" />
                  <span>
                    <strong>Finanzas & Caja:</strong> Ingresos, egresos de sede y balance diario
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <Users className="w-4 h-4 text-[#1A1815] shrink-0" />
                  <span>
                    <strong>Clientes & Leads:</strong> Base de datos completa y seguimiento
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#1A1815]">
                  <ShieldCheck className="w-4 h-4 text-[#1A1815] shrink-0" />
                  <span>
                    <strong>Configuración:</strong> Instructoras, banners y APIs del sistema
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F1ECE5] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A1815] group-hover:underline">
                Abrir Panel de Administración
              </span>
              <div className="w-10 h-10 rounded-full bg-[#1A1815] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-xs">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

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

      {/* Pie de Página Minimalista */}
      <footer className="border-t border-[#E4DED4] py-4 text-center text-xs text-[#AFA79C]">
        FIRME STUDIO · Sede San Juan de Lurigancho (Jr. Akapana 1261) · Control de Acceso Autorizado
      </footer>
    </div>
  );
};
