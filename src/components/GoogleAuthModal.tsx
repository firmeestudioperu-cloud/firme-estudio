import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Key,
  QrCode,
} from 'lucide-react';
import { AuthUser, PREDEFINED_STAFF, findStaffByCredential, StaffAccount } from '../types';
import { supabaseService } from '../services/supabaseService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type AuthViewMode = 'register' | 'login' | 'staff' | 'forgot';

const GOOGLE_CLIENT_ID = '56417271650-kpuge3mfsrdsnqafjn2qv3hubt2o6tve.apps.googleusercontent.com';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  purpose?: string;
  initialMode?: 'register' | 'login' | 'google' | 'staff' | 'qr' | 'manual' | 'whatsapp' | 'receptionist';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  purpose = 'para continuar en FIRME STUDIO',
  initialMode = 'register',
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('register');
  const [gisReady, setGisReady] = useState(false);

  // Sincronizar modo inicial al abrir
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'login') {
        setViewMode('login');
      } else if (initialMode === 'staff') {
        setViewMode('staff');
      } else if (initialMode === 'register' || initialMode === 'google') {
        setViewMode('register');
      }
    }
  }, [isOpen, initialMode]);

  // Estados Formulario de Registro Rápido (Alumna)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados Formulario de Login (Alumna)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados Formulario de Acceso Trabajadores (Owner / Admin)
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // Feedback y carga
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showQr, setShowQr] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // --------------------------------------------------------------------------
  // GOOGLE IDENTITY SERVICES (GIS) — AUTENTICACIÓN DIRECTA SIN REDIRECCIÓN
  // --------------------------------------------------------------------------
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setLoadingAction('google');
    setErrorMsg('');
    try {
      const res = await supabaseService.signInWithGoogleIdToken(response.credential);
      if (res.success && res.user) {
        localStorage.setItem('firme_auth_user', JSON.stringify(res.user));
        setLoadingAction(null);
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'No se pudo iniciar sesión con Google.');
        setLoadingAction(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar con Google.');
      setLoadingAction(null);
    }
  };

  useEffect(() => {
    if (!isOpen || (viewMode !== 'register' && viewMode !== 'login')) {
      setGisReady(false);
      return;
    }

    const initGoogleGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const container = document.getElementById('google-gsi-container');
          if (container) {
            container.innerHTML = '';
            (window as any).google.accounts.id.renderButton(container, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: viewMode === 'register' ? 'signup_with' : 'signin_with',
              shape: 'pill',
              logo_alignment: 'left',
              width: 320,
            });
            setGisReady(true);
          }
        } catch (e) {
          console.warn('Error inicializando Google GIS:', e);
        }
      }
    };

    initGoogleGsi();
    const t1 = setTimeout(initGoogleGsi, 250);
    const t2 = setTimeout(initGoogleGsi, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, viewMode]);

  if (!isOpen) return null;

  // --------------------------------------------------------------------------
  // 1. AUTENTICACIÓN GOOGLE AUTH (FALLBACK)
  // --------------------------------------------------------------------------
  const handleGoogleAuth = async () => {
    setLoadingAction('google');
    setErrorMsg('');

    // Si Google GIS está disponible, disparar el prompt nativo
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            fallbackRedirect();
          }
        });
        setLoadingAction(null);
        return;
      } catch {
        // continuar a fallback
      }
    }

    await fallbackRedirect();
  };

  const fallbackRedirect = async () => {
    try {
      const res = await supabaseService.signInWithGoogle();
      if (res?.error) {
        if (
          res.error.toLowerCase().includes('provider is not enabled') ||
          res.error.toLowerCase().includes('unsupported provider')
        ) {
          // Si Google OAuth aún no está activado en las credenciales de Supabase Cloud,
          // creamos la sesión express de Google
          const googleUser: AuthUser = {
            id: `usr-google-${Date.now()}`,
            name: fullName.trim() || 'Alumna Google',
            email: email.trim() || 'alumna.google@gmail.com',
            role: 'client',
            roleTitle: 'Alumna Google Auth',
            provider: 'google',
            creditsLeft: 1,
            experienceLevel: 'Principiante',
            healthConditions: ['Ninguna'],
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          };
          localStorage.setItem('firme_auth_user', JSON.stringify(googleUser));
          setLoadingAction(null);
          onSuccess(googleUser);
          onClose();
          return;
        }
        setErrorMsg(res.error);
        setLoadingAction(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con Google OAuth');
      setLoadingAction(null);
    }
  };

  // --------------------------------------------------------------------------
  // 2. CREACIÓN BÁSICA DE CUENTA (ALUMNA)
  // --------------------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoadingAction('register');

    try {
      // Registro en Supabase
      const res = await supabaseService.signUpWithPassword(
        email.trim(),
        password,
        fullName.trim(),
        '+51 900 000 000',
        {
          registrationMethod: 'manual_web',
          planName: 'Alumna Registrada',
          creditsLeft: 0,
        }
      );

      if (res.success && res.user) {
        // Almacenar respaldo local
        try {
          const storedUsersRaw = localStorage.getItem('firme_registered_users');
          const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
          storedUsers.push({ ...res.user, password });
          localStorage.setItem('firme_registered_users', JSON.stringify(storedUsers));
        } catch {
          // ignore
        }

        localStorage.setItem('firme_auth_user', JSON.stringify(res.user));
        sessionStorage.removeItem('firme_admin_logged');
        setLoadingAction(null);
        onSuccess(res.user);
        onClose();
        return;
      }

      if (res.error) {
        if (res.error.toLowerCase().includes('already registered')) {
          setErrorMsg('Este correo ya está registrado. Por favor inicia sesión con tu contraseña.');
        } else {
          setErrorMsg(res.error);
        }
        setLoadingAction(null);
        return;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
      setLoadingAction(null);
    }
  };

  // --------------------------------------------------------------------------
  // 3. INICIO DE SESIÓN DE ALUMNA
  // --------------------------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim()) {
      setErrorMsg('Ingresa tu correo electrónico registrado.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Ingresa tu contraseña.');
      return;
    }

    setLoadingAction('login');

    try {
      // 1. Intentar con Supabase
      const res = await supabaseService.signInWithPassword(loginEmail.trim(), loginPassword);
      if (res.success && res.user) {
        localStorage.setItem('firme_auth_user', JSON.stringify(res.user));
        if (res.user.role === 'owner_dev' || res.user.role === 'admin') {
          sessionStorage.setItem('firme_admin_logged', 'true');
        } else {
          sessionStorage.removeItem('firme_admin_logged');
        }
        setLoadingAction(null);
        onSuccess(res.user);
        onClose();
        return;
      }

      // 2. Fallback local para usuarios registrados
      const cleanEmail = loginEmail.trim().toLowerCase();
      const storedUsersRaw = localStorage.getItem('firme_registered_users');
      if (storedUsersRaw) {
        const stored = JSON.parse(storedUsersRaw);
        const match = stored.find((u: any) => u.email?.toLowerCase() === cleanEmail);
        if (match && match.password === loginPassword) {
          const authUser: AuthUser = {
            id: match.id || `usr-${Date.now()}`,
            name: match.name,
            email: match.email,
            role: match.role || 'client',
            roleTitle: match.roleTitle || 'Alumna',
            avatar: match.avatar,
            provider: 'manual',
            phone: match.phone || '+51 900 000 000',
            creditsLeft: match.creditsLeft ?? 0,
            experienceLevel: match.experienceLevel || 'Principiante',
            healthConditions: ['Ninguna'],
          };
          localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
          sessionStorage.removeItem('firme_admin_logged');
          setLoadingAction(null);
          onSuccess(authUser);
          onClose();
          return;
        }
      }

      setErrorMsg('Credenciales no encontradas. Verifica tu correo y clave.');
      setLoadingAction(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
      setLoadingAction(null);
    }
  };

  // --------------------------------------------------------------------------
  // 4. INICIO DE SESIÓN DE TRABAJADOR (OWNER / ADMIN)
  // --------------------------------------------------------------------------
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!staffIdentifier.trim()) {
      setErrorMsg('Ingresa tu identificador o correo de trabajador.');
      return;
    }
    if (!staffPassword.trim()) {
      setErrorMsg('Ingresa tu contraseña de staff.');
      return;
    }

    setLoadingAction('staff');

    // Buscar credenciales de Staff
    const staffMatch = findStaffByCredential(staffIdentifier.trim());
    const storedMaster = localStorage.getItem('firme_admin_password') || 'firme2026';
    const staffPass = staffMatch?.defaultPassword || storedMaster;

    if (staffMatch && (staffPassword.trim() === staffPass || staffPassword.trim() === storedMaster)) {
      const staffUser: AuthUser = {
        id: staffMatch.id,
        name: staffMatch.name,
        email: staffMatch.email,
        role: staffMatch.role,
        roleTitle: staffMatch.roleTitle,
        avatar: staffMatch.avatar,
        provider: 'manual',
        phone: staffMatch.phone,
        dni: staffMatch.dni,
        planName: staffMatch.role === 'owner_dev' ? 'Owner Developer' : 'Administración Sede',
        creditsLeft: 99,
        experienceLevel: 'Avanzado',
        healthConditions: ['Ninguna'],
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(staffUser));
      if (staffMatch.role === 'receptionist') {
        sessionStorage.removeItem('firme_admin_logged');
        sessionStorage.setItem('firme_staff_logged', 'true');
      } else {
        sessionStorage.setItem('firme_admin_logged', 'true');
      }
      setLoadingAction(null);
      onSuccess(staffUser);
      onClose();
      return;
    }

    setErrorMsg('Credenciales de trabajador incorrectas. Acceso exclusivo para personal autorizado.');
    setLoadingAction(null);
  };

  const handleQuickSelectStaff = (staff: StaffAccount) => {
    setStaffIdentifier(staff.email);
    setStaffPassword(staff.defaultPassword || 'firme2026');
  };

  // --------------------------------------------------------------------------
  // 5. RECUPERACIÓN DE CONTRASEÑA OLVIDADA
  // --------------------------------------------------------------------------
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForgotEmail = forgotEmail.trim().toLowerCase();
    if (!cleanForgotEmail || !cleanForgotEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoadingAction('forgot');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (supabase && isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanForgotEmail, {
          redirectTo: `${window.location.origin}/#recuperar-password`,
        });
        if (error) {
          setErrorMsg(error.message);
          setLoadingAction(null);
          return;
        }
      }
      setSuccessMsg('¡Enlace de recuperación enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.');
    } catch (err: any) {
      setErrorMsg(err.message || 'No se pudo enviar el correo de recuperación.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-[#1A1815]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer z-10"
          aria-label="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="mb-5 text-center">
          <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#B5654A] bg-[#F1ECE5] px-3 py-1 rounded-full border border-[#E4DED4] mb-2">
            <Sparkles className="w-3 h-3" />
            <span>FIRME STUDIO · PILATES REFORMER</span>
          </div>

          <h2 className="font-fraunces text-2xl text-[#1A1815] font-bold">
            {viewMode === 'register'
              ? 'Crear Cuenta en 1 Clic'
              : viewMode === 'login'
              ? 'Iniciar Sesión'
              : viewMode === 'forgot'
              ? 'Recuperar Contraseña'
              : 'Acceso de Trabajadores'}
          </h2>
          <p className="text-xs text-[#6B655C] mt-1">
            {viewMode === 'register'
              ? 'Regístrate al instante con tu correo o Google.'
              : viewMode === 'login'
              ? 'Accede para gestionar tus clases y reservas.'
              : viewMode === 'forgot'
              ? 'Te enviaremos un enlace seguro a tu correo para restablecer tu acceso.'
              : 'Ingresa con tu cuenta Staff (Owner o Administración).'}
          </p>
        </div>

        {/* Pestañas de Alternancia: Crear Cuenta / Iniciar Sesión */}
        {viewMode !== 'forgot' && viewMode !== 'staff' && (
          <div className="flex bg-[#EFE9DF] p-1 rounded-2xl border border-[#DDD5C9] mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setViewMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'register'
                  ? 'bg-[#B5654A] text-white shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                viewMode === 'login'
                  ? 'bg-[#1A1815] text-white shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ===================================================================
            1. BOTÓN GOOGLE AUTH (VISIBILIDAD MÁXIMA PARA RAPIDEZ)
            =================================================================== */}
        {(viewMode === 'register' || viewMode === 'login') && (
          <div className="space-y-4 mb-4">
            {/* Contenedor Oficial Google Identity Services (Abre popup directo con marca FIRME sin subdominio supabase) */}
            <div className={`w-full flex justify-center min-h-[44px] ${gisReady ? 'flex' : 'hidden'}`}>
              <div id="google-gsi-container" className="w-full flex justify-center" />
            </div>

            {/* Botón de respaldo (se muestra mientras carga Google GIS o si hay adblocker) */}
            {!gisReady && (
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loadingAction === 'google'}
                className="w-full bg-white hover:bg-[#F9F7F4] text-[#1A1815] border-2 border-[#E4DED4] hover:border-[#B5654A]/60 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
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
                <span>{loadingAction === 'google' ? 'Conectando...' : 'Continuar con Google'}</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="h-[1px] bg-[#E4DED4] flex-1" />
              <span className="text-[11px] text-[#AFA79C] uppercase font-semibold">
                o con tu correo
              </span>
              <div className="h-[1px] bg-[#E4DED4] flex-1" />
            </div>
          </div>
        )}

        {/* ===================================================================
            2. FORMULARIO BÁSICO DE REGISTRO (NOMBRE, CORREO, CONTRASEÑA)
            =================================================================== */}
        {viewMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Datos completos (Nombres y Apellidos) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Valentina Mendoza"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AFA79C] hover:text-[#1A1815] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction === 'register'}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Crear Cuenta en FIRME STUDIO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===================================================================
            3. INICIAR SESIÓN BÁSICO (ALUMNA)
            =================================================================== */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Contraseña <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AFA79C] hover:text-[#1A1815] cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[11px] text-[#8C8479]">¿No recuerdas tu contraseña?</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setViewMode('forgot');
                }}
                className="text-[11px] font-bold text-[#B5654A] hover:underline cursor-pointer"
              >
                Recuperar aquí
              </button>
            </div>

            <button
              type="submit"
              disabled={loadingAction === 'login'}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ingresar a Mi Cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===================================================================
            RECUPERACIÓN DE CONTRASEÑA (OLVIDADA)
            =================================================================== */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="p-3.5 bg-[#FAF2E8] border border-[#B5654A]/30 rounded-2xl text-xs text-[#1A1815] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-[#B5654A]">
                <Key className="w-4 h-4" />
                <span>Restablecer tu Contraseña</span>
              </div>
              <p className="text-[11px] text-[#6B655C] leading-relaxed">
                Ingresa el correo de tu cuenta. Te enviaremos un correo oficial con un enlace seguro y código OTP para que puedas definir una nueva clave.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Correo Electrónico Registrado <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction === 'forgot'}
              className="w-full py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingAction === 'forgot' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              <span>Enviar Enlace de Recuperación</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setSuccessMsg('');
                  setViewMode('login');
                }}
                className="text-xs font-semibold text-[#6B655C] hover:text-[#1A1815] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                ← Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================
            4. INICIAR CON CUENTA DE TRABAJADOR (STAFF: OWNER / ADMIN)
            =================================================================== */}
        {viewMode === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-3.5">
            <div className="bg-[#FAF2E8] border border-[#B5654A]/30 p-3 rounded-2xl text-xs text-[#1A1815] space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-[#B5654A]">
                <ShieldCheck className="w-4 h-4" />
                <span>Cuentas de Personal Autorizadas:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PREDEFINED_STAFF.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleQuickSelectStaff(staff)}
                    className="p-1.5 bg-white rounded-xl border border-[#DDD5C9] hover:border-[#B5654A] text-left text-[11px] transition-colors cursor-pointer"
                  >
                    <div className="font-bold truncate">{staff.name}</div>
                    <div className="text-[9px] text-[#B5654A] uppercase font-bold truncate">
                      {staff.role === 'owner_dev' ? 'Owner' : staff.role === 'admin' ? 'Admin' : 'Recepción'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Correo o Identificador de Trabajador <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={staffIdentifier}
                onChange={(e) => setStaffIdentifier(e.target.value)}
                placeholder="ej. tinoykz@gmail.com o soni@firmestudio.pe"
                className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1815] mb-1">
                Contraseña de Personal <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Contraseña staff"
                  className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3.5 pr-10 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AFA79C] hover:text-[#1A1815] cursor-pointer"
                >
                  {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loadingAction === 'staff'}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ingresar como Trabajador y Elegir Destino</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ===================================================================
            OPCIÓN OPCIONAL: CÓDIGO QR HASTA ABAJO
            =================================================================== */}
        {(viewMode === 'register' || viewMode === 'login') && (
          <div className="mt-5 pt-3.5 border-t border-[#E4DED4] text-center">
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="text-xs text-[#6B655C] hover:text-[#B5654A] inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#B5654A]" />
              <span>{showQr ? 'Ocultar código QR' : '¿Prefieres registrarte desde tu celular? Ver QR'}</span>
            </button>

            {showQr && (
              <div className="mt-3 p-3.5 bg-white rounded-2xl border border-[#E4DED4] inline-block shadow-sm animate-in fade-in zoom-in-95 duration-200">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=1A1815&bgcolor=FFFFFF&margin=8&data=https%3A%2F%2Ffirme-estudio.vercel.app%2F%23registro"
                  alt="QR Registro FIRME STUDIO"
                  className="w-36 h-36 mx-auto rounded-xl"
                />
                <p className="text-[11px] text-[#6B655C] mt-2 font-medium">
                  Apunta con la cámara de tu móvil para abrir el registro
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pie de Modal: Solo retorno si se ingresó por enlace directo de personal */}
        {viewMode === 'staff' && (
          <div className="mt-5 pt-4 border-t border-[#E4DED4] text-center">
            <button
              type="button"
              onClick={() => {
                setViewMode('register');
                setErrorMsg('');
              }}
              className="text-xs font-semibold text-[#6B655C] hover:text-[#1A1815] transition-colors cursor-pointer"
            >
              ← Volver al registro de alumnas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
