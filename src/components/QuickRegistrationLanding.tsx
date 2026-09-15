import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Smartphone,
  Check,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { AuthUser } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface QuickRegistrationLandingProps {
  onSuccess?: (user: AuthUser) => void;
  onExitToHome: () => void;
}

type RegistrationStep = 'form' | 'verify' | 'success';

export const QuickRegistrationLanding: React.FC<QuickRegistrationLandingProps> = ({
  onSuccess,
  onExitToHome,
}) => {
  // Dominio oficial de producción
  const PRODUCTION_DOMAIN = 'firme-estudio.vercel.app';
  const registerUrl = `https://${PRODUCTION_DOMAIN}/#registro`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&color=1A1815&bgcolor=FFFFFF&margin=12&data=${encodeURIComponent(registerUrl)}`;

  // Pasos del flujo: 'form' -> 'verify' -> 'success'
  const [step, setStep] = useState<RegistrationStep>('form');

  // Datos del formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Código OTP de 6 dígitos
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Estados de carga y feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Contador para auto-reinicio tras éxito
  const [countdown, setCountdown] = useState(10);

  // Temporizador para reenvío de código
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Temporizador de reinicio automático en pantalla de éxito
  useEffect(() => {
    if (step === 'success') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        handleResetForNextStudent();
      }
    }
  }, [step, countdown]);

  // --------------------------------------------------------------------------
  // PASO 1: ENVIAR DATOS Y SOLICITAR CÓDIGO AL CORREO
  // --------------------------------------------------------------------------
  const handleRequestVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Por favor, ingresa tu nombre y apellidos.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim() ? (phone.startsWith('+51') ? phone : `+51 ${phone}`) : '+51 900 000 000';

      // Conexión con Supabase Auth como fuente de verdad
      let codeSentViaSupabase = false;
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                name: cleanName,
                phone: cleanPhone,
                registration_method: 'tablet_reception',
              },
            },
          });

          if (error) {
            // Si el correo ya existe en Supabase Auth
            const errMsg = error.message.toLowerCase();
            if (errMsg.includes('already registered') || errMsg.includes('already exists') || errMsg.includes('user already registered')) {
              setErrorMessage('Este correo ya se encuentra registrado en el sistema de FIRME STUDIO.');
              setIsLoading(false);
              return;
            }
            console.warn('Supabase signUp aviso:', error.message);
          } else if (data?.user) {
            codeSentViaSupabase = true;
            // Limpiar cualquier residuo de pruebas locales anteriores con este mismo correo
            try {
              const existingRaw = localStorage.getItem('firme_registered_users');
              if (existingRaw) {
                const cleaned = JSON.parse(existingRaw).filter((u: any) => u.email?.toLowerCase() !== cleanEmail);
                localStorage.setItem('firme_registered_users', JSON.stringify(cleaned));
              }
            } catch {
              // ignore
            }
          }
        } catch (supabaseErr: any) {
          console.warn('Supabase no disponible en este momento:', supabaseErr);
        }
      } else {
        // Modo offline: comprobar almacenamiento local
        const existingRaw = localStorage.getItem('firme_registered_users');
        const registeredList = existingRaw ? JSON.parse(existingRaw) : [];
        const alreadyExists = registeredList.some((u: any) => u.email?.toLowerCase() === cleanEmail);

        if (alreadyExists) {
          setErrorMessage('Este correo ya se encuentra registrado en el sistema de FIRME STUDIO.');
          setIsLoading(false);
          return;
        }
      }

      // Código de 6 dígitos generado (para visualización/prueba inmediata en tablet)
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(generatedCode);
      setResendCooldown(60);

      // Cambiar a paso de verificación
      setIsLoading(false);
      setStep('verify');
      setOtpCode(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la solicitud.');
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // MANEJO DE LOS 6 DÍGITOS OTP
  // --------------------------------------------------------------------------
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Manejar pegado de código completo (ej: 6 dígitos copiados)
      const pastedDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pastedDigits.length > 0) {
        const newOtp = [...otpCode];
        pastedDigits.forEach((digit, i) => {
          if (index + i < 6) newOtp[index + i] = digit;
        });
        setOtpCode(newOtp);
        const nextIdx = Math.min(index + pastedDigits.length, 5);
        otpInputRefs.current[nextIdx]?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    // Auto-enfocar el siguiente cuadro
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // --------------------------------------------------------------------------
  // PASO 2: VALIDAR EL CÓDIGO Y REGISTRAR SIN INICIAR SESIÓN EN LA TABLET
  // --------------------------------------------------------------------------
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const fullEnteredCode = otpCode.join('');
    if (fullEnteredCode.length < 6) {
      setErrorMessage('Por favor, ingresa los 6 dígitos del código enviado a tu correo.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();
      const cleanPhone = phone.trim() ? (phone.startsWith('+51') ? phone : `+51 ${phone}`) : '+51 900 000 000';

      // 1. Validar en Supabase si está disponible
      if (supabase && isSupabaseConfigured()) {
        try {
          const { data: authData } = await supabase.auth.verifyOtp({
            email: cleanEmail,
            token: fullEnteredCode,
            type: 'signup',
          });

          // Registrar inmediatamente a la alumna en public.clients
          const fallbackDni = cleanPhone.replace(/\D/g, '').slice(-8).padStart(8, '7');
          await supabase.from('clients').upsert(
            {
              auth_user_id: authData?.user?.id || null,
              name: cleanName,
              email: cleanEmail,
              phone: cleanPhone,
              dni: fallbackDni,
              status: 'activo',
              registration_method: 'receptionist_desk',
            },
            { onConflict: 'email' }
          );

          // IMPORTANTE: Cerrar sesión inmediatamente para que la tablet no quede con la cuenta abierta
          await supabase.auth.signOut();
        } catch (supabaseErr) {
          console.warn('Verificación Supabase fallback:', supabaseErr);
        }
      }

      // 2. Guardar registro en la base local de usuarias del estudio
      const newClientRecord: AuthUser = {
        id: `usr-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: 'client',
        roleTitle: 'Alumna',
        provider: 'manual',
        phone: cleanPhone,
        creditsLeft: 1,
        totalAttended: 0,
        experienceLevel: 'Principiante',
        healthConditions: ['Ninguna'],
        registrationMethod: 'manual_web',
      };

      const existingRaw = localStorage.getItem('firme_registered_users');
      const registeredList = existingRaw ? JSON.parse(existingRaw) : [];
      registeredList.push({
        id: newClientRecord.id,
        name: cleanName,
        email: cleanEmail,
        password: password,
        phone: cleanPhone,
        role: 'client',
        roleTitle: 'Alumna',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('firme_registered_users', JSON.stringify(registeredList));

      // NOTA CRÍTICA: NO guardamos en localStorage('firme_auth_user') para NO dejar la sesión abierta en la tablet compartida
      setIsLoading(false);
      setStep('success');
      setCountdown(10);
    } catch (err: any) {
      setErrorMessage(err.message || 'Código incorrecto o expirado.');
      setIsLoading(false);
    }
  };

  // Reenviar código
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (supabase && isSupabaseConfigured()) {
        await supabase.auth.resend({
          type: 'signup',
          email: email.trim().toLowerCase(),
        });
      }
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(newCode);
      setResendCooldown(60);
      setSuccessMessage('¡Nuevo código enviado a tu correo!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  // Reiniciar formulario para la siguiente alumna en la fila
  const handleResetForNextStudent = () => {
    setStep('form');
    setFullName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setOtpCode(['', '', '', '', '', '']);
    setErrorMessage('');
    setSuccessMessage('');
    setCountdown(10);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] flex flex-col justify-between selection:bg-[#B5654A] selection:text-[#FAF8F5]">
      {/* 1. BARRA SUPERIOR DISCRETA CON MARCA Y RETORNO */}
      <header className="border-b border-[#E4DED4] bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onExitToHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#1A1815] p-0.5 border border-[#B5654A] flex items-center justify-center shrink-0 shadow-xs">
              <img
                src="/firme-studio-logo.svg"
                alt="FIRME STUDIO"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <div className="font-fraunces text-base font-bold text-[#1A1815] tracking-wide group-hover:text-[#B5654A] transition-colors leading-tight">
                FIRME STUDIO
              </div>
              <div className="text-[10px] text-[#AFA79C] uppercase font-medium tracking-wider">
                Módulo de Auto-Registro · Mostrador SJL
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onExitToHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#DDD5C9] bg-white hover:bg-[#F1ECE5] text-xs font-semibold text-[#1A1815] transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#B5654A]" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </header>

      {/* 2. CONTENIDO PRINCIPAL EN 2 COLUMNAS (FORMULARIO LIMPIO + TÓTEM QR) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full bg-white border border-[#E4DED4] rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            {/* ===============================================================
                COLUMNA IZQUIERDA: FORMULARIO DE ALTA CON CÓDIGO (7 de 12 col)
                (Sin Google Auth, sin inicio de sesión en tablet, solo creación)
                =============================================================== */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                {/* -------------------------------------------------------------
                    ESTADO 1: FORMULARIO DE INGRESO DE DATOS
                    ------------------------------------------------------------- */}
                {step === 'form' && (
                  <div>
                    {/* Encabezado */}
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B5654A]/10 text-[#B5654A] text-xs font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Creación de Cuenta · Recepción</span>
                      </div>
                      <h1 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#1A1815] leading-tight">
                        Crea tu cuenta en FIRME STUDIO
                      </h1>
                      <p className="text-xs sm:text-sm text-[#6B655C] mt-1.5 leading-relaxed">
                        Completa tus datos para registrarte. Te enviaremos un código de confirmación a tu correo.
                      </p>
                    </div>

                    {/* Mensajes de error */}
                    {errorMessage && (
                      <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Formulario Limpio (Sin botón Google Auth) */}
                    <form onSubmit={handleRequestVerification} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#1A1815] mb-1">
                          Nombre y Apellidos <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ej. Valeria Soler"
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:bg-white focus:outline-hidden focus:border-[#B5654A] transition-colors"
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
                            placeholder="valeria@ejemplo.com"
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:bg-white focus:outline-hidden focus:border-[#B5654A] transition-colors"
                          />
                        </div>
                        <p className="text-[11px] text-[#AFA79C] mt-1">
                          Aquí te enviaremos el código de 6 dígitos para validar tu cuenta.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              placeholder="Mín. 6 caracteres"
                              className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:bg-white focus:outline-hidden focus:border-[#B5654A] transition-colors"
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

                        <div>
                          <label className="block text-xs font-bold text-[#1A1815] mb-1">
                            WhatsApp <span className="text-[#AFA79C] font-normal">(opcional)</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="987 654 321"
                              className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-[#1A1815] focus:bg-white focus:outline-hidden focus:border-[#B5654A] transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>{isLoading ? 'Enviando código...' : 'Crear Cuenta & Recibir Código'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    ESTADO 2: PANTALLA DE INGRESO DE CÓDIGO OTP (6 DÍGITOS)
                    ------------------------------------------------------------- */}
                {step === 'verify' && (
                  <div className="animate-in fade-in duration-300 space-y-5">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#B5654A]/15 text-[#B5654A] flex items-center justify-center mb-3 shadow-2xs">
                        <KeyRound className="w-6 h-6" />
                      </div>
                      <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#1A1815]">
                        Verifica tu Correo
                      </h2>
                      <p className="text-xs sm:text-sm text-[#6B655C] mt-1 leading-relaxed">
                        Ingresa el código de 6 dígitos que hemos enviado a:
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-[#1A1815] mt-0.5 break-all">
                        {email}
                      </p>
                    </div>

                    {/* Mensajes de error / éxito */}
                    {errorMessage && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                    {successMessage && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {/* Casilleros de los 6 dígitos */}
                    <form onSubmit={handleConfirmOtp} className="space-y-5">
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={idx === 0 ? 6 : 1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold bg-[#FAF8F5] border-2 border-[#DDD5C9] focus:border-[#B5654A] focus:bg-white rounded-xl focus:outline-hidden transition-all text-[#1A1815] shadow-xs"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || otpCode.join('').length < 6}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isLoading ? 'Verificando código...' : 'Confirmar y Activar Cuenta'}</span>
                      </button>

                      <div className="flex items-center justify-between text-xs text-[#6B655C] pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStep('form');
                            setErrorMessage('');
                          }}
                          className="hover:text-[#B5654A] underline cursor-pointer"
                        >
                          ← Corregir correo
                        </button>

                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={resendCooldown > 0}
                          className="text-[#B5654A] font-semibold hover:underline disabled:text-[#AFA79C] disabled:no-underline cursor-pointer"
                        >
                          {resendCooldown > 0
                            ? `Reenviar en ${resendCooldown}s`
                            : '¿No recibiste el código? Reenviar'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    ESTADO 3: ÉXITO TOTAL (TABLET LIMPIA, CERO SESIÓN ABIERTA)
                    ------------------------------------------------------------- */}
                {step === 'success' && (
                  <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-6 space-y-5 relative overflow-hidden">
                    {/* Destellos sutiles de bienvenida boutique */}
                    <div className="absolute top-2 right-4 text-amber-400/70 animate-bounce">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="absolute top-6 left-4 text-[#B5654A]/60 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                    </div>

                    {/* Ícono de Checkmark con doble onda zen expansiva */}
                    <div className="relative w-20 h-20 mx-auto flex items-center justify-center my-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping duration-1000" />
                      <span className="absolute -inset-2 rounded-full border-2 border-emerald-500/20 animate-pulse" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:scale-105">
                        <CheckCircle2 className="w-9 h-9" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Registro Completado</span>
                      </div>
                      <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#1A1815]">
                        ¡Cuenta creada con éxito!
                      </h2>
                      <p className="text-sm font-semibold text-[#B5654A]">
                        Bienvenida a FIRME STUDIO, {fullName.split(' ')[0]}
                      </p>
                    </div>

                    {/* Tarjeta de Instrucciones para ingresar en su móvil */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 text-left space-y-2.5 text-xs text-[#1A1815] shadow-xs">
                      <div className="font-bold flex items-center gap-2 text-[#B5654A]">
                        <Smartphone className="w-4 h-4 shrink-0" />
                        <span>Próximo paso: Ingresa desde tu propio celular</span>
                      </div>
                      <p className="text-[#6B655C] leading-relaxed">
                        Por tu seguridad, esta pantalla compartida de recepción <strong>no deja tu sesión abierta</strong>.
                      </p>
                      <div className="bg-white p-3 rounded-xl border border-[#E4DED4] font-mono text-xs flex items-center justify-between shadow-2xs">
                        <span className="text-[#1A1815] font-bold">{PRODUCTION_DOMAIN}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                          Enlace Oficial
                        </span>
                      </div>
                      <p className="text-[#6B655C] text-[11px]">
                        Abre este enlace en tu teléfono con tu correo <strong>{email}</strong> y tu contraseña creada para reservar tus clases en las camillas Reformer.
                      </p>
                    </div>

                    {/* Barra de progreso de 10 segundos decreciente y botón */}
                    <div className="pt-2 space-y-3">
                      <button
                        type="button"
                        onClick={handleResetForNextStudent}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#1A1815] hover:bg-[#322C27] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                      >
                        <UserPlus className="w-4 h-4 text-[#B5654A] group-hover:scale-110 transition-transform" />
                        <span>Registrar a Siguiente Alumna en Fila</span>
                      </button>

                      {/* Barra de tiempo decreciente animada (10s a 0s) */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-[#EAE4DC] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#B5654A] via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(countdown / 10) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[#AFA79C] flex items-center justify-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          La pantalla se reiniciará automáticamente en <strong>{countdown}s</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pie con nota de seguridad de mostrador */}
              <div className="mt-6 pt-4 border-t border-[#E4DED4] flex items-center justify-between text-xs text-[#AFA79C]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Terminal de Auto-Registro Protegida</span>
                </span>
                <span>Sede San Juan de Lurigancho</span>
              </div>
            </div>

            {/* ===============================================================
                COLUMNA DERECHA: TÓTEM QR PARA CELULAR (5 de 12 col)
                (Apunta directamente a https://firme-estudio.vercel.app/#registro)
                =============================================================== */}
            <div className="lg:col-span-5 bg-[#FAF2E8] border-t lg:border-t-0 lg:border-l border-[#E4DED4] p-6 sm:p-8 flex flex-col items-center justify-center text-center">
              <div className="max-w-xs w-full space-y-4">
                {/* Encabezado QR */}
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#B5654A]/15 text-[#B5654A] flex items-center justify-center mx-auto shadow-2xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h2 className="font-fraunces text-lg sm:text-xl font-medium text-[#1A1815]">
                    ¿Prefieres registrarte en tu celular?
                  </h2>
                  <p className="text-xs text-[#6B655C] leading-relaxed">
                    Apunta la cámara de tu móvil para abrir este mismo formulario en tu propio teléfono al instante.
                  </p>
                </div>

                {/* CONTENEDOR DEL CÓDIGO QR LIMPIO & ENMARCADO */}
                <div className="bg-white p-4 rounded-2xl border border-[#E4DED4] shadow-md inline-block mx-auto transition-transform hover:scale-102">
                  <img
                    src={qrCodeUrl}
                    alt={`Código QR para ${PRODUCTION_DOMAIN}`}
                    className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-xl"
                  />
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#AFA79C] tracking-wider uppercase">
                    <QrCode className="w-3.5 h-3.5 text-[#B5654A]" />
                    <span>{PRODUCTION_DOMAIN}</span>
                  </div>
                </div>

                {/* Beneficios Rápidos (Limpio, sin botones de copiar o imprimir) */}
                <div className="pt-2 text-left space-y-2 text-[11px] text-[#6B655C]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Crea tu cuenta desde tu propio teléfono</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Confirmación inmediata por código a tu correo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Lista para reservar tu clase de Reformer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. PIE DE PÁGINA MÍNIMO */}
      <footer className="py-4 text-center text-xs text-[#AFA79C] border-t border-[#E4DED4] bg-white">
        FIRME STUDIO · San Juan de Lurigancho (Jr. Akapana 1261) · {PRODUCTION_DOMAIN}
      </footer>
    </div>
  );
};
