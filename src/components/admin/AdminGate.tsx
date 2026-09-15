import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle, Unlock } from 'lucide-react';
import { AuthUser, PREDEFINED_STAFF, findStaffByCredential } from '../../types';

interface AdminGateProps {
  onExitToPublic: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  getStoredPassword: () => string;
}

export const AdminGate: React.FC<AdminGateProps> = ({
  onExitToPublic,
  onLoginSuccess,
  getStoredPassword,
}) => {
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctMasterPassword = getStoredPassword();
    const trimmedId = adminIdentifier.trim();
    const trimmedPass = inputPassword.trim();

    if (!trimmedPass) {
      setAuthError('Por favor ingresa tu contraseña de acceso.');
      return;
    }

    // Buscar si corresponde a un miembro del staff por correo, nombre o DNI
    let matchedStaff = trimmedId ? findStaffByCredential(trimmedId) : null;
    const staffPass = matchedStaff?.defaultPassword || correctMasterPassword;

    const isPasswordValid =
      trimmedPass === correctMasterPassword || (matchedStaff && trimmedPass === staffPass);

    if (isPasswordValid) {
      // Si no especificó correo pero la contraseña es correcta, vincular al Owner Dev
      if (!matchedStaff) {
        matchedStaff = PREDEFINED_STAFF.find((s) => s.role === 'owner_dev') || PREDEFINED_STAFF[0];
      }

      const authUser: AuthUser = {
        id: matchedStaff.id,
        name: matchedStaff.name,
        email: matchedStaff.email,
        role: matchedStaff.role,
        roleTitle: matchedStaff.roleTitle,
        avatar: matchedStaff.avatar,
        provider: 'manual',
        phone: matchedStaff.phone,
        dni: matchedStaff.dni,
        planName: matchedStaff.role === 'owner_dev' ? 'Owner Developer' : 'Administración Sede',
        creditsLeft: 99,
        experienceLevel: 'Avanzado',
        healthConditions: ['Ninguna'],
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
      sessionStorage.setItem('firme_admin_logged', 'true');
      onLoginSuccess(authUser);
    } else {
      setAuthError('Credenciales incorrectas. Acceso exclusivo para personal autorizado de FIRME STUDIO.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#141210] text-[#FAF8F5]">
      {/* Top Minimal Staff Bar */}
      <header className="w-full bg-[#1A1815] border-b border-[#2C2723] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F5] p-0.5 border border-[#B5654A] flex items-center justify-center shrink-0">
            <img
              src="/firme-studio-logo.svg"
              alt="FIRME STUDIO"
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-[#FAF8F5] block">
              FIRME STUDIO · Back-Office
            </span>
            <span className="text-[10px] text-[#B5654A] font-medium">
              Portal Administrativo & Operativo (Sede Lima - SJL)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onExitToPublic}
          className="px-3.5 py-1.5 text-xs font-medium text-[#D8D2C8] hover:text-white bg-[#26221E] hover:bg-[#322C27] border border-[#3C3630] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>← Volver a la Web Pública</span>
        </button>
      </header>

      {/* Centered Login Card */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#141210]">
        <div className="max-w-md w-full bg-[#FAF8F5] text-[#1A1815] border border-[#E4DED4] rounded-2xl p-8 shadow-2xl text-center relative overflow-hidden">
          {/* Top aesthetic accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#B5654A] via-[#D49581] to-[#B5654A]" />

          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ECE5DD] border border-[#DDD5C9] mb-5 shadow-xs">
            <img
              src="/firme-studio-logo.svg"
              alt="FIRME STUDIO"
              className="w-16 h-16 rounded-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5654A]/10 text-[#B5654A] text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Acceso Administrativo</span>
          </div>

          <h1 className="font-fraunces text-2xl font-medium text-[#1A1815] mb-2">
            Panel de Control General
          </h1>
          <p className="text-xs text-[#6B655C] mb-5 leading-relaxed">
            Suite operativa integral para la sede{' '}
            <strong className="text-[#1A1815]">LIMA - SJL</strong>. Gestión de agenda, clientes, caja diaria, gastos, captación y reportes.
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left mt-6">
            <div>
              <label
                htmlFor="admin-identifier"
                className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1.5"
              >
                Correo o Identificador de Personal
              </label>
              <input
                id="admin-identifier"
                type="text"
                value={adminIdentifier}
                onChange={(e) => {
                  setAdminIdentifier(e.target.value);
                  setAuthError('');
                }}
                placeholder="ej. tino@firme.com"
                className="w-full px-4 py-3 bg-white border border-[#E4DED4] rounded-xl text-sm text-[#1A1815] placeholder-[#6B655C]/50 focus:outline-hidden focus:ring-2 focus:ring-[#B5654A] focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1.5"
              >
                Contraseña de Personal
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-white border border-[#E4DED4] rounded-xl text-sm text-[#1A1815] placeholder-[#6B655C]/50 focus:outline-hidden focus:ring-2 focus:ring-[#B5654A] focus:border-transparent transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B655C] hover:text-[#1A1815] p-1.5 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] py-3.5 rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Ingresar al Panel de Gestión</span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-[#E4DED4]/60 text-center">
            <p className="text-[11px] text-[#6B655C]">
              Acceso restringido y cifrado · Protocolo de seguridad FIRME STUDIO SJL
            </p>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={onExitToPublic}
              className="text-xs text-[#6B655C] hover:text-[#1A1815] inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← Volver a la web pública de alumnos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
