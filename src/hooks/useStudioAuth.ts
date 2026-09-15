import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { AuthUser, determineUserRole, ClientProfile } from '../types';

interface UseStudioAuthOptions {
  showToast?: (title: string, message: string, isAlert?: boolean, duration?: number) => void;
  onRegisterClientProfile?: (user: AuthUser) => void;
}

export function useStudioAuth(options?: UseStudioAuthOptions) {
  const { showToast, onRegisterClientProfile } = options || {};

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('firme_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.role) {
          const { role, roleTitle } = determineUserRole(parsed.name, parsed.email, parsed.dni);
          parsed.role = role;
          parsed.roleTitle = roleTitle;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Sync session with Supabase on mount
  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured()) {
      // Sincronizar sesión activa de Supabase (retorno de Google OAuth o sesión persistida)
      supabaseService.getCurrentSessionUser().then((user) => {
        if (!isMounted || !user) return;
        setCurrentUser((prev) => {
          if (!prev || prev.id !== user.id) {
            localStorage.setItem('firme_auth_user', JSON.stringify(user));
            return user;
          }
          return prev;
        });
      });
    }

    // Listener reactivo a cambios de sesión Supabase (Google OAuth o email)
    const authUnsubscribe = supabaseService.onAuthStateChange((user) => {
      if (!isMounted) return;
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('firme_auth_user', JSON.stringify(user));
        if (user.role === 'owner_dev' || user.role === 'admin') {
          sessionStorage.setItem('firme_admin_logged', 'true');
        } else {
          sessionStorage.removeItem('firme_admin_logged');
        }
      }
    });

    return () => {
      isMounted = false;
      authUnsubscribe();
    };
  }, []);

  const handleGainExp = useCallback((amount: number, reason: string) => {
    setCurrentUser((prev) => {
      const prevExp = prev?.exp ?? 1350;
      const prevLevel = prev?.level ?? 2;
      const newExp = prevExp + amount;

      let newLevel = 1;
      let levelTitle = 'Nivel I: Fundamentos & Alineación';
      if (newExp >= 5000) {
        newLevel = 5;
        levelTitle = 'Nivel V: Leyenda FIRME';
      } else if (newExp >= 3000) {
        newLevel = 4;
        levelTitle = 'Nivel IV: Élite Contrology';
      } else if (newExp >= 1500) {
        newLevel = 3;
        levelTitle = 'Nivel III: Maestría Reformer';
      } else if (newExp >= 500) {
        newLevel = 2;
        levelTitle = 'Nivel II: Enfoque & Constancia';
      }

      const updatedUser: AuthUser = {
        ...(prev || {
          id: 'usr-default',
          name: 'Sofía Montaner',
          email: 'sofia.montaner@gmail.com',
          provider: 'google',
          dni: '72418902',
          creditsLeft: 8,
          totalAttended: 14,
        }),
        exp: newExp,
        level: newLevel,
        levelTitle: levelTitle,
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));

      if (showToast) {
        if (newLevel > prevLevel) {
          showToast(
            'Evolución de Categoría Alcanzada',
            `Has alcanzado la Categoría ${newLevel} (${levelTitle}). Consulta tus nuevos beneficios de membresía en tu panel de evolución.`,
            true
          );
        } else {
          showToast(
            `+${amount} Puntos de Práctica Acreditados`,
            `${reason}. Total acumulado: ${newExp.toLocaleString()} pts.`
          );
        }
      }

      return updatedUser;
    });
  }, [showToast]);

  const handleSpendExp = useCallback((amount: number, reason: string): boolean => {
    let success = false;
    setCurrentUser((prev) => {
      const currentExp = prev?.exp ?? 1350;
      if (currentExp < amount) {
        if (showToast) {
          showToast(
            'Puntos Insuficientes',
            `Se requieren ${amount} pts para este canje y dispones de ${currentExp} pts. Asiste a tus próximas sesiones para continuar acumulando.`,
            true,
            4000
          );
        }
        success = false;
        return prev;
      }

      const newExp = currentExp - amount;
      let newLevel = 1;
      let levelTitle = 'Nivel I: Fundamentos & Alineación';
      if (newExp >= 5000) {
        newLevel = 5;
        levelTitle = 'Nivel V: Leyenda FIRME';
      } else if (newExp >= 3000) {
        newLevel = 4;
        levelTitle = 'Nivel IV: Élite Contrology';
      } else if (newExp >= 1500) {
        newLevel = 3;
        levelTitle = 'Nivel III: Maestría Reformer';
      } else if (newExp >= 500) {
        newLevel = 2;
        levelTitle = 'Nivel II: Enfoque & Constancia';
      }

      const updatedUser: AuthUser = {
        ...(prev || {
          id: 'usr-default',
          name: 'Sofía Montaner',
          email: 'sofia.montaner@gmail.com',
          provider: 'google',
          dni: '72418902',
          creditsLeft: 8,
          totalAttended: 14,
        }),
        exp: newExp,
        level: newLevel,
        levelTitle: levelTitle,
      };

      localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));

      if (showToast) {
        showToast(
          'Beneficio Canjeado Exitosamente',
          `Has canjeado ${amount} pts por ${reason}. Saldo actual: ${newExp.toLocaleString()} pts.`
        );
      }

      success = true;
      return updatedUser;
    });

    return success;
  }, [showToast]);

  const handleSaveProfile = useCallback((updatedUser: AuthUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));

    if (showToast) {
      showToast(
        'Perfil Actualizado',
        'Tus datos personales y ficha de salud se guardaron exitosamente.',
        false,
        3500
      );
    }

    // Sincronización en Supabase si está disponible
    if (isSupabaseConfigured() && updatedUser.role === 'client') {
      supabaseService.saveClientProfile({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        dni: updatedUser.dni || '',
        planName: updatedUser.planName || 'Pase Regular',
        creditsLeft: updatedUser.creditsLeft ?? 0,
        experienceLevel: updatedUser.experienceLevel || 'Principiante',
        healthConditions: updatedUser.healthConditions || ['Ninguna'],
        medicalNotes: updatedUser.medicalNotes || '',
        emergencyContact: updatedUser.emergencyContact || '',
        emergencyPhone: updatedUser.emergencyPhone || '',
      }).catch((err) => console.warn('Supabase profile sync warning:', err));
    }
  }, [showToast]);

  const handleGoogleAuthSuccess = useCallback((user: AuthUser, onAdminRoute?: () => void) => {
    const userWithExp: AuthUser = {
      ...user,
      exp: user.exp ?? 1350,
      level: user.level ?? 2,
      levelTitle: user.levelTitle ?? 'Nivel II: Enfoque & Constancia',
    };
    setCurrentUser(userWithExp);
    localStorage.setItem('firme_auth_user', JSON.stringify(userWithExp));

    if (userWithExp.role === 'client') {
      sessionStorage.removeItem('firme_admin_logged');
      if (onRegisterClientProfile) {
        onRegisterClientProfile(userWithExp);
      }
    } else {
      sessionStorage.setItem('firme_admin_logged', 'true');
      if (onAdminRoute) {
        onAdminRoute();
      }
    }

    if (showToast) {
      showToast(
        'Sesión Iniciada Exitosamente',
        `Bienvenido/a, ${user.name}. Continuando con tu gestión...`,
        false,
        3500
      );
    }
  }, [showToast, onRegisterClientProfile]);

  const handleLogout = useCallback(async (onLoggedOut?: () => void) => {
    try {
      await supabaseService.signOut();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('firme_auth_user');
    sessionStorage.removeItem('firme_admin_logged');

    if (onLoggedOut) {
      onLoggedOut();
    }

    if (showToast) {
      showToast(
        'Sesión cerrada',
        'Has cerrado tu cuenta correctamente.',
        false,
        3000
      );
    }
  }, [showToast]);

  return {
    currentUser,
    setCurrentUser,
    handleGainExp,
    handleSpendExp,
    handleSaveProfile,
    handleGoogleAuthSuccess,
    handleLogout,
  };
}
