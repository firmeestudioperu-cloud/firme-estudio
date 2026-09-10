import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MyClasses } from './components/MyClasses';
import { NewHereSection } from './components/NewHereSection';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { PricingSection } from './components/PricingSection';
import { InstructorGrid } from './components/InstructorGrid';
import { Testimonials } from './components/Testimonials';
import { FinalCTA } from './components/FinalCTA';
import { BoutiqueSection } from './components/BoutiqueSection';
import { FaqSection } from './components/FaqSection';
import { LocationSection } from './components/LocationSection';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { FloatingAdminButton } from './components/FloatingAdminButton';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { ClientCheckInModal } from './components/ClientCheckInModal';
import { EditProfileModal } from './components/EditProfileModal';
import { PlanCheckoutModal } from './components/PlanCheckoutModal';
import { StudentLevelModal } from './components/StudentLevelModal';
import { StudentProgressTab } from './components/StudentProgressTab';
import { AdminPanel } from './components/AdminPanel';
import { StaffDestinationHub } from './components/StaffDestinationHub';
import { ReceptionDeskPanel } from './components/ReceptionDeskPanel';
import { ReceptionKioskModal } from './components/ReceptionKioskModal';
import { ReceptionQrModal } from './components/ReceptionQrModal';
import { BiomechanicsQuizModal } from './components/BiomechanicsQuizModal';
import { QuickRegistrationLanding } from './components/QuickRegistrationLanding';
import { AiAssistantWidget } from './components/AiAssistantWidget';
import { studioApi } from './services/api';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { MOCK_CLASSES } from './data/mockData';
import {
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_LEADS,
  INITIAL_CASH_STATE,
} from './data/adminMockData';
import {
  ClassSession,
  BookingModalData,
  PricingPlan,
  MainTabType,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  CashRegisterState,
  AuthUser,
  determineUserRole,
  ClientBookingFormData,
  PaymentMethod,
} from './types';
import {
  CheckCircle2,
  Sparkles,
  X,
  BellRing,
  Calendar,
  UserCheck,
  CreditCard,
  Users,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'b-1',
    classId: 'c2',
    className: 'Reformer Core & Form',
    classTime: '08:30',
    classDay: 'lun',
    instructor: 'Mateo Silva',
    clientName: 'María Fernanda Ruiz',
    clientEmail: 'maria.ruiz@gmail.com',
    clientPhone: '+51 984 123 456',
    status: 'confirmada',
    bookedAt: '02/09/2026 08:30',
  },
  {
    id: 'b-2',
    classId: 'c1',
    className: 'Reformer Foundations',
    classTime: '07:00',
    classDay: 'lun',
    instructor: 'Camila Morales',
    clientName: 'Rodrigo Salazar',
    clientEmail: 'rodrigo.s@outlook.com',
    clientPhone: '+51 992 456 789',
    status: 'asistio',
    bookedAt: '01/09/2026 19:30',
  },
  {
    id: 'b-3',
    classId: 'c3',
    className: 'Mat Sculpt & Breath',
    classTime: '10:00',
    classDay: 'lun',
    instructor: 'Valeria Castro',
    clientName: 'Andrea Navarro',
    clientEmail: 'andrea.navarro@gmail.com',
    clientPhone: '+51 971 332 114',
    status: 'confirmada',
    bookedAt: '02/09/2026 09:15',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('inicio');
  const [classesList, setClassesList] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('firme_classes_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MOCK_CLASSES;
      }
    }
    return MOCK_CLASSES;
  });
  const [bookingsList, setBookingsList] = useState<BookingRecord[]>(() => {
    const saved = localStorage.getItem('firme_bookings_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BOOKINGS;
      }
    }
    return INITIAL_BOOKINGS;
  });

  // Admin modules persistent state
  const [clientsList, setClientsList] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('firme_clients_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CLIENTS;
      }
    }
    return INITIAL_CLIENTS;
  });

  const [transactionsList, setTransactionsList] = useState<CashTransaction[]>(() => {
    const saved = localStorage.getItem('firme_transactions_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TRANSACTIONS;
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [expensesList, setExpensesList] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('firme_expenses_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_EXPENSES;
      }
    }
    return INITIAL_EXPENSES;
  });

  const [leadsList, setLeadsList] = useState<LeadRecord[]>(() => {
    const saved = localStorage.getItem('firme_leads_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_LEADS;
      }
    }
    return INITIAL_LEADS;
  });

  const [cashRegister, setCashRegister] = useState<CashRegisterState>(() => {
    const saved = localStorage.getItem('firme_cash_register_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CASH_STATE;
      }
    }
    return INITIAL_CASH_STATE;
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('firme_classes_data', JSON.stringify(classesList));
  }, [classesList]);

  useEffect(() => {
    localStorage.setItem('firme_bookings_data', JSON.stringify(bookingsList));
  }, [bookingsList]);

  useEffect(() => {
    localStorage.setItem('firme_clients_data', JSON.stringify(clientsList));
  }, [clientsList]);

  useEffect(() => {
    localStorage.setItem('firme_transactions_data', JSON.stringify(transactionsList));
  }, [transactionsList]);

  useEffect(() => {
    localStorage.setItem('firme_expenses_data', JSON.stringify(expensesList));
  }, [expensesList]);

  useEffect(() => {
    localStorage.setItem('firme_leads_data', JSON.stringify(leadsList));
  }, [leadsList]);

  useEffect(() => {
    localStorage.setItem('firme_cash_register_data', JSON.stringify(cashRegister));
  }, [cashRegister]);

  // Sync with Backend API on load
  useEffect(() => {
    let isMounted = true;
    studioApi
      .getHealth()
      .then((health) => {
        if (!isMounted) return;
        console.log('✨ FIRME STUDIO Backend API conectado:', health.service, health.version);
      })
      .catch((err) => {
        console.log('Backend API en modo local/fallback:', err.message);
      });

    // Cargar datos desde Supabase Cloud si está configurado
    if (isSupabaseConfigured()) {
      supabaseService.getClasses().then((cls) => {
        if (isMounted && cls && cls.length > 0) {
          setClassesList(cls);
        }
      });
      supabaseService.getBookings().then((bks) => {
        if (isMounted && bks && bks.length > 0) {
          setBookingsList(bks);
        }
      });

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

    // Suscripción Realtime a reservas (Tótem SJL y nuevas reservas)
    const unsubscribe = supabaseService.subscribeToBookings(({ newRecord }) => {
      if (!isMounted || !newRecord) return;
      setBookingsList((prev) => {
        const idx = prev.findIndex((b) => b.id === newRecord.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newRecord;
          return updated;
        }
        return [newRecord, ...prev];
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  // Authenticated user state (simulated Google or email session)
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
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isGoogleAuthOpen, setIsGoogleAuthOpen] = useState(false);
  const [authInitialModality, setAuthInitialModality] = useState<'qr' | 'manual' | 'whatsapp' | 'receptionist' | 'register' | 'login'>('manual');
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isKioskModalOpen, setIsKioskModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBiomechanicsQuizOpen, setIsBiomechanicsQuizOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PricingPlan | null>(null);
  const [authPurpose, setAuthPurpose] = useState<string>('');
  const [pendingBookingAction, setPendingBookingAction] = useState<{
    type: 'class' | 'plan';
    classSession?: ClassSession;
    bookingType?: 'reserve' | 'waitlist';
    plan?: PricingPlan;
  } | null>(null);

  // Pre-seed an initial booking (e.g. c2) so the user immediately sees the 'Mis Clases' panel
  const [bookedClassIds, setBookedClassIds] = useState<Set<string>>(new Set(['c2']));
  const [waitlistClassIds, setWaitlistClassIds] = useState<Set<string>>(new Set());
  const [alertClassIds, setAlertClassIds] = useState<Set<string>>(new Set(['c4']));
  const [bookingModalData, setBookingModalData] = useState<BookingModalData | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; isAlert?: boolean } | null>(null);

  // Auto-apertura del modal de registro rápido en la web pública para visitas no autenticadas ("Aparece solo")
  useEffect(() => {
    if (!currentUser && !sessionStorage.getItem('firme_quick_auth_dismissed')) {
      const timer = setTimeout(() => {
        setAuthInitialModality('register');
        setIsGoogleAuthOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  const handleGainExp = (amount: number, reason: string) => {
    const prevExp = currentUser?.exp ?? 1350;
    const prevLevel = currentUser?.level ?? 2;
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
      ...(currentUser || {
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

    setCurrentUser(updatedUser);
    localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));

    if (newLevel > prevLevel) {
      setToast({
        title: 'Evolución de Categoría Alcanzada',
        message: `Has alcanzado la Categoría ${newLevel} (${levelTitle}). Consulta tus nuevos beneficios de membresía en tu panel de evolución.`,
        isAlert: true,
      });
    } else {
      setToast({
        title: `+${amount} Puntos de Práctica Acreditados`,
        message: `${reason}. Total acumulado: ${newExp.toLocaleString()} pts.`,
      });
    }
    setTimeout(() => setToast(null), 4500);
  };

  const handleSpendExp = (amount: number, reason: string): boolean => {
    const currentExp = currentUser?.exp ?? 1350;
    if (currentExp < amount) {
      setToast({
        title: 'Puntos Insuficientes',
        message: `Se requieren ${amount} pts para este canje y dispones de ${currentExp} pts. Asiste a tus próximas sesiones para continuar acumulando.`,
        isAlert: true,
      });
      setTimeout(() => setToast(null), 4000);
      return false;
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
      ...(currentUser || {
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

    setCurrentUser(updatedUser);
    localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));

    setToast({
      title: 'Beneficio Canjeado Exitosamente',
      message: `Has canjeado ${amount} pts por ${reason}. Saldo actual: ${newExp.toLocaleString()} pts.`,
    });
    setTimeout(() => setToast(null), 4500);
    return true;
  };

  const handleSaveProfile = (updatedUser: AuthUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));
    setToast({
      title: 'Perfil Actualizado',
      message: 'Tus datos personales y ficha de salud se guardaron exitosamente.',
    });
    setTimeout(() => setToast(null), 3500);

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
  };

  const handleGoogleAuthSuccess = (user: AuthUser) => {
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
      // Ensure client is in the studio clients directory
      if (userWithExp.email) {
        setClientsList((prev) => {
          const exists = prev.some((c) => c.email && c.email.toLowerCase() === userWithExp.email.toLowerCase());
          if (!exists) {
            const newClient: ClientProfile = {
              id: `cli-${Date.now()}`,
              name: userWithExp.name,
              dni: userWithExp.dni || 'No registrado',
              phone: userWithExp.phone || '+51 900 000 000',
              email: userWithExp.email,
              currentPlan: userWithExp.planName || 'Nuevo Alumno',
              planType: userWithExp.planName?.toLowerCase().includes('ilimitada') ? 'ilimitado' : 'pack',
              creditsLeft: userWithExp.creditsLeft ?? 0,
              totalAttended: 0,
              status: 'activo',
              joinDate: new Date().toLocaleDateString('es-PE'),
              lastVisit: 'Recién registrado',
              emergencyContact: userWithExp.emergencyContact || '',
              emergencyPhone: userWithExp.emergencyPhone || '',
              medicalNotes: userWithExp.healthConditions?.join(', ') || userWithExp.medicalNotes || '',
              documentType: userWithExp.documentType || 'dni',
              birthDate: userWithExp.birthDate,
              gender: userWithExp.gender,
              registrationMethod: userWithExp.registrationMethod || 'manual_smartfit',
            };
            return [newClient, ...prev];
          }
          return prev;
        });
      }
    } else {
      if (userWithExp.role === 'receptionist') {
        sessionStorage.removeItem('firme_admin_logged');
        sessionStorage.setItem('firme_staff_logged', 'true');
        setActiveTab('registros-presencial');
      } else {
        sessionStorage.setItem('firme_admin_logged', 'true');
        setActiveTab('staff-hub');
      }
    }
    setToast({
      title: 'Sesión Iniciada Exitosamente',
      message: `Bienvenido/a, ${user.name}. Continuando con tu gestión...`,
    });
    setTimeout(() => setToast(null), 3500);

    // Reanudar automáticamente la reserva o compra pendiente si el usuario no estaba autenticado
    if (pendingBookingAction) {
      if (pendingBookingAction.type === 'class') {
        const targetClass = pendingBookingAction.classSession || classesList[0];
        if (targetClass) {
          setBookingModalData({
            classSession: targetClass,
            type: pendingBookingAction.bookingType || 'reserve',
          });
        }
      } else if (pendingBookingAction.type === 'plan' && pendingBookingAction.plan) {
        setSelectedPlanForCheckout(pendingBookingAction.plan);
      }
      setPendingBookingAction(null);
      setAuthPurpose('');
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('firme_auth_user');
    sessionStorage.removeItem('firme_admin_logged');
    if (activeTab === 'admin') {
      setActiveTab('inicio');
      history.replaceState(null, '', window.location.pathname);
    }
    setToast({
      title: 'Sesión cerrada',
      message: 'Has cerrado tu cuenta correctamente.',
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePerformCheckIn = (bookingId: string) => {
    const assignedBed = Math.floor(Math.random() * 8) + 1;
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    setBookingsList((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'asistio',
              bedNumber: assignedBed,
              checkInTime: nowTime,
            }
          : b
      )
    );

    // Reward with +150 EXP for checking in at the studio kiosk
    handleGainExp(150, `Check-in en Sala Realizado (Cama #${assignedBed})`);
  };

  // Sync state with URL hash (#acceso-staff, #admin or public tabs) or path (/admin, /acceso-staff)
  useEffect(() => {
    const handleRouteCheck = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      // Rutas exclusivas para el panel presencial de mostrador
      const isDeskRoute =
        hash === 'mostrador' ||
        hash === 'registros-presencial' ||
        hash === 'recepcion' ||
        hash === 'desk' ||
        pathname === '/mostrador' ||
        pathname === '/registros-presencial';

      if (isDeskRoute) {
        const savedUserStr = localStorage.getItem('firme_auth_user');
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed.role === 'client') {
              setActiveTab('inicio');
              history.replaceState(null, '', window.location.pathname);
              setToast({
                title: 'Acceso Denegado',
                message: 'El mostrador presencial es de uso exclusivo para el personal autorizado de FIRME STUDIO.',
                isAlert: true,
              });
              return;
            }
          } catch (e) {
            // ignore
          }
        }
        setActiveTab('registros-presencial');
        return;
      }

      // Enlace único privado para el panel administrativo y login de staff
      const isStaffRoute =
        hash === 'acceso-staff' ||
        hash === 'staff-portal' ||
        hash === 'admin' ||
        hash === 'staff' ||
        hash === 'admin-login' ||
        pathname === '/admin' ||
        pathname === '/acceso-staff' ||
        pathname === '/staff';

      if (isStaffRoute) {
        const savedUserStr = localStorage.getItem('firme_auth_user');
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed.role === 'client') {
              // Bloquear estrictamente a clientes de acceder al portal admin
              setActiveTab('inicio');
              history.replaceState(null, '', window.location.pathname);
              setToast({
                title: 'Acceso Denegado',
                message: 'Tu cuenta tiene perfil de Alumna/Cliente. El portal administrativo es exclusivo para el equipo directivo de FIRME STUDIO (Valentino, Soni, Keyla).',
                isAlert: true,
              });
              return;
            }
            if (parsed.role === 'receptionist') {
              // BLOQUEO ESTRICTO: La recepcionista no puede ver el Panel Admin General
              setActiveTab('registros-presencial');
              history.replaceState(null, '', window.location.pathname + '#mostrador');
              setToast({
                title: 'Acceso Restringido al Admin General',
                message: 'Hola Camila. Tu panel exclusivo de trabajo es el Mostrador Presencial. Las finanzas y configuración están reservadas para Administración y Dirección.',
                isAlert: true,
              });
              return;
            }
          } catch (e) {
            // ignore
          }
        }
        setActiveTab('admin');
        return;
      }

      if (
        hash === 'registro' ||
        hash === 'registro-rapido' ||
        hash === 'registro-alumna' ||
        hash === 'alta' ||
        pathname === '/registro'
      ) {
        setActiveTab('registro');
        return;
      }

      if (hash === 'registro-smartfit') {
        setAuthInitialModality('manual');
        setIsGoogleAuthOpen(true);
        setAuthPurpose('crear tu cuenta en FIRME STUDIO');
      } else if (hash === 'qr' || hash === 'registro-qr') {
        setAuthInitialModality('qr');
        setIsGoogleAuthOpen(true);
      } else if (hash === 'registro-whatsapp' || hash === 'whatsapp') {
        setAuthInitialModality('whatsapp');
        setIsGoogleAuthOpen(true);
      } else if (hash === 'registro-presencial' || hash === 'counter') {
        setAuthInitialModality('receptionist');
        setIsGoogleAuthOpen(true);
      } else if (['inicio', 'horarios', 'mis-clases', 'membresias', 'profesores', 'metodo'].includes(hash)) {
        setActiveTab(hash as MainTabType);
      }
    };

    handleRouteCheck();
    window.addEventListener('hashchange', handleRouteCheck);
    return () => window.removeEventListener('hashchange', handleRouteCheck);
  }, []);

  const handleSelectTab = (tab: MainTabType) => {
    if (tab === 'registro') {
      setActiveTab('registro');
      window.location.hash = 'registro';
    } else if (tab === 'admin') {
      if (currentUser?.role === 'receptionist') {
        setActiveTab('registros-presencial');
        setToast({
          title: 'Acceso Restringido al Admin General',
          message: 'Tu espacio asignado de trabajo es el Mostrador Presencial. El panel administrativo contiene información financiera y operativa confidencial.',
          isAlert: true,
        });
        return;
      }
      if (currentUser?.role === 'client') {
        setToast({
          title: 'Acceso Denegado',
          message: 'Tu cuenta tiene perfil de Alumna/Cliente. El portal administrativo es exclusivo para el equipo de FIRME STUDIO (Valentino, Soni, Keyla).',
          isAlert: true,
        });
        return;
      }
      setActiveTab('admin');
      window.location.hash = 'acceso-staff';
    } else {
      setActiveTab(tab);
      const staffHashes = ['#admin', '#acceso-staff', '#staff-portal', '#staff', '#admin-login', '#mostrador', '#registros-presencial', '#registro'];
      if (staffHashes.includes(window.location.hash)) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookFirstClass = () => {
    const availableClass = classesList.find(
      (c) => c.occupiedSpots < c.totalSpots && !bookedClassIds.has(c.id)
    );

    if (!currentUser) {
      setPendingBookingAction({
        type: 'class',
        classSession: availableClass || classesList[0],
        bookingType: 'reserve',
      });
      setAuthPurpose('reservar tu primera clase en Reformer');
      setIsGoogleAuthOpen(true);
      setToast({
        title: 'Creación de Cuenta Requerida',
        message: 'Para agendar tu clase de Pilates Reformer, por favor crea tu cuenta o inicia sesión.',
      });
      return;
    }

    if (availableClass) {
      setBookingModalData({
        classSession: availableClass,
        type: 'reserve',
      });
    } else {
      handleSelectTab('horarios');
    }
  };

  const handleSelectClassForBooking = (session: ClassSession, type: 'reserve' | 'waitlist') => {
    if (!currentUser) {
      setPendingBookingAction({
        type: 'class',
        classSession: session,
        bookingType: type,
      });
      setAuthPurpose(`agendar tu plaza en ${session.name} (${session.time} h)`);
      setIsGoogleAuthOpen(true);
      setToast({
        title: 'Identificación Necesaria',
        message: `Para reservar tu cama Reformer en ${session.name}, crea tu cuenta o inicia sesión.`,
      });
      return;
    }

    setBookingModalData({
      classSession: session,
      type: type,
      waitlistPosition: type === 'waitlist' ? 2 : undefined,
    });
  };

  const handleConfirmBooking = (
    classId: string,
    isWaitlist: boolean,
    clientData?: ClientBookingFormData
  ) => {
    const session = classesList.find((c) => c.id === classId);

    if (isWaitlist) {
      setWaitlistClassIds((prev) => new Set(prev).add(classId));
      setToast({
        title: 'Lista de espera activada',
        message: 'Te avisaremos por WhatsApp si se libera una plaza.',
      });
    } else {
      setBookedClassIds((prev) => new Set(prev).add(classId));
      // Increase occupied spot
      setClassesList((prev) =>
        prev.map((c) =>
          c.id === classId ? { ...c, occupiedSpots: Math.min(c.totalSpots, c.occupiedSpots + 1) } : c
        )
      );

      // Record booking for admin view & client profile
      if (session) {
        const medicalSummary = clientData?.healthConditions?.length
          ? `${clientData.healthConditions.join(', ')}${
              clientData.medicalNotes ? ` — Nota: ${clientData.medicalNotes}` : ''
            }`
          : undefined;

        const newRecord: BookingRecord = {
          id: `b-${Date.now()}`,
          classId: session.id,
          className: session.name,
          classTime: session.time,
          classDay: session.day,
          instructor: session.instructor,
          clientName: clientData?.name || currentUser?.name || 'Cliente Registrado',
          clientEmail: clientData?.email || currentUser?.email || 'alumno@firmestudio.pe',
          clientPhone: clientData?.phone || currentUser?.phone || '+51 987 654 321',
          clientDni: clientData?.dni || currentUser?.dni || '74829103',
          medicalAlert: medicalSummary,
          status: 'confirmada',
          bookedAt: new Date().toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          isWaitlist: false,
          bedNumber: clientData?.selectedBed || 3,
        };
        setBookingsList((prev) => [newRecord, ...prev]);

        // If user wasn't logged in, log them in automatically with their submitted data
        if (!currentUser && clientData) {
          const { role, roleTitle } = determineUserRole(clientData.name, clientData.email);
          const autoUser: AuthUser = {
            id: `usr-${Date.now()}`,
            name: clientData.name,
            email: clientData.email,
            role: role,
            roleTitle: roleTitle,
            phone: clientData.phone,
            dni: clientData.dni,
            provider: clientData.authProvider || 'manual',
            avatar: clientData.googleAvatar,
            experienceLevel: clientData.experienceLevel,
            healthConditions: clientData.healthConditions,
            medicalNotes: clientData.medicalNotes,
            emergencyContact: clientData.emergencyContact,
            emergencyPhone: clientData.emergencyPhone,
            planName: 'Clase Suelta',
            creditsLeft: 1,
            totalAttended: 0,
          };
          setCurrentUser(autoUser);
          localStorage.setItem('firme_auth_user', JSON.stringify(autoUser));
        }

        // Also ensure client is registered in the studio's client directory
        const clientEmail = clientData?.email || currentUser?.email;
        const clientName = clientData?.name || currentUser?.name;
        if (clientEmail && clientName) {
          setClientsList((prev) => {
            const exists = prev.some(
              (c) =>
                (c.email && c.email.toLowerCase() === clientEmail.toLowerCase()) ||
                (clientData?.dni && c.dni === clientData.dni)
            );
            if (!exists) {
              const newClientProfile: ClientProfile = {
                id: `cli-${Date.now()}`,
                name: clientName,
                dni: clientData?.dni || currentUser?.dni || 'No registrado',
                phone: clientData?.phone || currentUser?.phone || '+51 900 000 000',
                email: clientEmail,
                currentPlan: 'Clase Suelta',
                planType: 'clase_suelta',
                creditsLeft: 0,
                totalAttended: 1,
                status: 'activo',
                joinDate: new Date().toLocaleDateString('es-PE'),
                lastVisit: 'Hoy (Reserva)',
                emergencyContact: clientData?.emergencyContact
                  ? `${clientData.emergencyContact} ${clientData.emergencyPhone ? `(${clientData.emergencyPhone})` : ''}`.trim()
                  : '',
                medicalNotes: clientData?.medicalNotes || (clientData?.healthConditions?.join(', ') ?? ''),
              };
              return [newClientProfile, ...prev];
            } else {
              return prev.map((c) =>
                (c.email && c.email.toLowerCase() === clientEmail.toLowerCase()) ||
                (clientData?.dni && c.dni === clientData.dni)
                  ? {
                      ...c,
                      lastVisit: 'Hoy (Reserva)',
                      totalAttended: c.totalAttended + 1,
                      medicalNotes: clientData?.medicalNotes || c.medicalNotes,
                    }
                  : c
              );
            }
          });
        }
      }

      // Reward user with +100 EXP for attending/booking Reformer
      handleGainExp(100, `Reserva asegurada en ${session ? session.name : 'Reformer'}`);
    }

    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Administrative action handlers
  const handleAddClass = (newClass: Omit<ClassSession, 'id'>) => {
    const id = `c-${Date.now()}`;
    setClassesList((prev) => [{ id, ...newClass }, ...prev]);
  };

  const handleUpdateClass = (updatedClass: ClassSession) => {
    setClassesList((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
  };

  const handleDeleteClass = (classId: string) => {
    setClassesList((prev) => prev.filter((c) => c.id !== classId));
  };

  const handleUpdateSpots = (classId: string, delta: number) => {
    setClassesList((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const newOccupied = Math.max(0, Math.min(c.totalSpots, c.occupiedSpots + delta));
          return { ...c, occupiedSpots: newOccupied };
        }
        return c;
      })
    );
  };

  const handleAddManualBooking = (booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => {
    const record: BookingRecord = {
      ...booking,
      id: `b-${Date.now()}`,
      bookedAt: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setBookingsList((prev) => [record, ...prev]);
  };

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: 'confirmada' | 'asistio' | 'cancelada'
  ) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const handleCheckInBooking = (updatedBooking: BookingRecord) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

  const handleAssignBed = (bookingId: string, bedNumber: number) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bedNumber } : b))
    );
  };

  const handleUpdateClientCredits = (clientId: string, credits: number) => {
    setClientsList((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, creditsLeft: credits } : c))
    );
  };

  const handleResetData = () => {
    localStorage.removeItem('firme_classes_data');
    localStorage.removeItem('firme_bookings_data');
    localStorage.removeItem('firme_clients_data');
    localStorage.removeItem('firme_transactions_data');
    localStorage.removeItem('firme_expenses_data');
    localStorage.removeItem('firme_leads_data');
    localStorage.removeItem('firme_cash_register_data');
    setClassesList(MOCK_CLASSES);
    setBookingsList(INITIAL_BOOKINGS);
    setClientsList(INITIAL_CLIENTS);
    setTransactionsList(INITIAL_TRANSACTIONS);
    setExpensesList(INITIAL_EXPENSES);
    setLeadsList(INITIAL_LEADS);
    setCashRegister(INITIAL_CASH_STATE);
  };

  const handleClearDemoData = () => {
    localStorage.setItem('firme_bookings_data', JSON.stringify([]));
    localStorage.setItem('firme_clients_data', JSON.stringify([]));
    localStorage.setItem('firme_transactions_data', JSON.stringify([]));
    localStorage.setItem('firme_expenses_data', JSON.stringify([]));
    localStorage.setItem('firme_leads_data', JSON.stringify([]));
    localStorage.setItem('firme_cash_register_data', JSON.stringify(INITIAL_CASH_STATE));
    setBookingsList([]);
    setClientsList([]);
    setTransactionsList([]);
    setExpensesList([]);
    setLeadsList([]);
    setCashRegister(INITIAL_CASH_STATE);
    setToast({
      title: 'Plataforma en Limpio',
      message: 'Se han eliminado los datos de prueba. Ahora verás solo la información real que registres.',
    });
    setTimeout(() => setToast(null), 4500);
  };

  // Sub-modules handlers
  const handleAddClient = (clientData: Omit<ClientProfile, 'id'>) => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${Date.now()}`,
    };
    setClientsList((prev) => [newClient, ...prev]);
  };

  const handleUpdateClient = (updatedClient: ClientProfile) => {
    setClientsList((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  };

  const handleDeleteClient = (clientId: string) => {
    setClientsList((prev) => prev.filter((c) => c.id !== clientId));
  };

  const handleAddTransaction = (txData: Omit<CashTransaction, 'id'>) => {
    const newTx: CashTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactionsList((prev) => [newTx, ...prev]);
  };

  const handleUpdateTransaction = (updatedTx: CashTransaction) => {
    setTransactionsList((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactionsList((prev) => prev.filter((t) => t.id !== txId));
  };

  const handleToggleCashRegister = () => {
    setCashRegister((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      openedAt: !prev.isOpen ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : prev.openedAt,
      closedAt: prev.isOpen ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : undefined,
    }));
  };

  const handleAddExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpensesList((prev) => [newExpense, ...prev]);
  };

  const handleUpdateExpense = (updatedExpense: ExpenseRecord) => {
    setExpensesList((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpensesList((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleUpdateExpenseStatus = (id: string, status: 'pagado' | 'pendiente') => {
    setExpensesList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const handleAddLead = (leadData: Omit<LeadRecord, 'id' | 'createdAt'>) => {
    const now = new Date();
    const newLead: LeadRecord = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setLeadsList((prev) => [newLead, ...prev]);
  };

  const handleUpdateLead = (updatedLead: LeadRecord) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
  };

  const handleDeleteLead = (leadId: string) => {
    setLeadsList((prev) => prev.filter((l) => l.id !== leadId));
  };

  const handleUpdateLeadStatus = (leadId: string, status: LeadRecord['status']) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  };

  const handleConvertLeadToClient = (lead: LeadRecord) => {
    // 1. Mark lead as converted
    handleUpdateLeadStatus(lead.id, 'convertido');

    // 2. Add as client if not already present
    const existing = clientsList.find((c) => c.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, ''));
    if (!existing) {
      handleAddClient({
        name: lead.name,
        phone: lead.phone,
        email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        dni: '70000000',
        currentPlan: 'Pack 8 Clases',
        planType: 'pack',
        creditsLeft: 8,
        totalAttended: 0,
        status: 'activo',
        joinDate: new Date().toLocaleDateString('es-PE'),
        lastVisit: 'Recién registrado',
        medicalNotes: lead.notes || 'Convertido desde captación de leads (SJL)',
      });
    }

    setToast({
      title: '¡Prospecto Convertido con Éxito!',
      message: `${lead.name} ha sido dado de alta en la base de datos de Alumnos con Pack 8.`,
    });
    setTimeout(() => setToast(null), 4000);
  };

  // Cancellation handler for booked classes
  const handleCancelBooking = (classId: string) => {
    const cancelledClass = classesList.find((c) => c.id === classId);

    // Remove from booked
    setBookedClassIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });

    // Free up 1 spot
    setClassesList((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, occupiedSpots: Math.max(0, c.occupiedSpots - 1) } : c
      )
    );

    // If an automatic availability alert was set for this class, trigger the notification!
    if (alertClassIds.has(classId)) {
      setToast({
        title: '🔔 ¡Aviso de disponibilidad automática!',
        message: `¡Se acaba de liberar 1 cupo en ${cancelledClass ? cancelledClass.name : 'la clase'}! Ya puedes reservarla en el horario.`,
        isAlert: true,
      });
    } else {
      setToast({
        title: 'Reserva cancelada con éxito',
        message: `Has liberado tu lugar en ${cancelledClass ? cancelledClass.name : 'la clase'}. Tu cupo quedó disponible.`,
      });
    }

    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleCancelWaitlist = (classId: string) => {
    setWaitlistClassIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });
    setToast({
      title: 'Lista de espera actualizada',
      message: 'Has salido de la lista de espera correctamente.',
    });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Toggle automatic notification when a full class frees up
  const handleToggleAlert = (session: ClassSession) => {
    if (alertClassIds.has(session.id)) {
      setAlertClassIds((prev) => {
        const next = new Set(prev);
        next.delete(session.id);
        return next;
      });
      setToast({
        title: 'Aviso desactivado',
        message: `Ya no recibirás alertas automáticas para ${session.name}.`,
      });
    } else {
      setAlertClassIds((prev) => new Set(prev).add(session.id));
      setToast({
        title: '🔔 ¡Aviso automático activado!',
        message: `Te notificaremos de inmediato en cuanto se libere un cupo en ${session.name} (${session.time} h) con ${session.instructor}.`,
        isAlert: true,
      });
    }

    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleCancelAlert = (classId: string) => {
    setAlertClassIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });
    setToast({
      title: 'Aviso desactivado',
      message: 'Aviso automático de cupo cancelado.',
    });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!currentUser) {
      setPendingBookingAction({
        type: 'plan',
        plan: plan,
      });
      setAuthPurpose(`adquirir la membresía ${plan.name} (${plan.price})`);
      setIsGoogleAuthOpen(true);
      setToast({
        title: 'Cuenta Requerida para Adquirir Plan',
        message: `Para contratar ${plan.name}, por favor crea tu cuenta o inicia sesión.`,
      });
      return;
    }
    setSelectedPlanForCheckout(plan);
  };

  const handlePlanPaymentSuccess = (
    plan: PricingPlan,
    details: {
      paymentMethod: PaymentMethod;
      clientName: string;
      clientEmail: string;
      clientDni: string;
      receiptType: 'boleta' | 'factura';
      receiptNumber: string;
      amountPaid: number;
    }
  ) => {
    // Determine credits granted
    let credits = 1;
    if (plan.id === 'pack-8') credits = 8;
    else if (plan.id === 'ilimitada') credits = 30;
    else if (plan.id === 'membresia-privadas') credits = 32;

    const { role, roleTitle } = currentUser?.role 
      ? { role: currentUser.role, roleTitle: currentUser.roleTitle || 'Alumna' }
      : determineUserRole(details.clientName, details.clientEmail);

    // Update active user profile
    const updatedUser: AuthUser = {
      id: currentUser?.id || `usr-${Date.now()}`,
      name: details.clientName,
      email: details.clientEmail,
      role: role,
      roleTitle: roleTitle,
      dni: details.clientDni,
      phone: currentUser?.phone || '+51 984 123 456',
      provider: currentUser?.provider || 'manual',
      avatar: currentUser?.avatar,
      planName: plan.name,
      creditsLeft: (currentUser?.creditsLeft || 0) + credits,
      experienceLevel: currentUser?.experienceLevel || 'Intermedio',
      healthConditions: currentUser?.healthConditions || ['Ninguna'],
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('firme_auth_user', JSON.stringify(updatedUser));

    // Register income in Finance / Cash Register
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      type: 'ingreso',
      concept: `Suscripción a ${plan.name}`,
      category:
        plan.id === 'clase-suelta'
          ? 'clase_suelta'
          : plan.id === 'pack-8'
          ? 'pack_clases'
          : 'membresia',
      amount: details.amountPaid,
      paymentMethod: details.paymentMethod,
      clientName: details.clientName,
      receiptNumber: details.receiptNumber,
      date: new Date().toLocaleDateString('es-PE'),
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      notes: `${details.receiptType.toUpperCase()} emitida a DNI/RUC ${details.clientDni}`,
    };
    setTransactionsList((prev) => [newTx, ...prev]);

    // Synchronize client profile in studio directory with new credits and plan
    setClientsList((prev) => {
      const exists = prev.some(
        (c) =>
          (c.email && c.email.toLowerCase() === details.clientEmail.toLowerCase()) ||
          (details.clientDni && c.dni === details.clientDni)
      );
      if (exists) {
        return prev.map((c) =>
          (c.email && c.email.toLowerCase() === details.clientEmail.toLowerCase()) ||
          (details.clientDni && c.dni === details.clientDni)
            ? {
                ...c,
                currentPlan: plan.name,
                planType:
                  plan.id === 'clase-suelta'
                    ? 'clase_suelta'
                    : plan.id === 'ilimitada'
                    ? 'ilimitado'
                    : 'pack',
                creditsLeft: (c.creditsLeft || 0) + credits,
                status: 'activo',
              }
            : c
        );
      } else {
        const newClient: ClientProfile = {
          id: `cli-${Date.now()}`,
          name: details.clientName,
          dni: details.clientDni || 'No registrado',
          phone: currentUser?.phone || '+51 984 123 456',
          email: details.clientEmail,
          currentPlan: plan.name,
          planType:
            plan.id === 'clase-suelta'
              ? 'clase_suelta'
              : plan.id === 'ilimitada'
              ? 'ilimitado'
              : 'pack',
          creditsLeft: credits,
          totalAttended: 0,
          status: 'activo',
          joinDate: new Date().toLocaleDateString('es-PE'),
          lastVisit: 'Compra de Plan',
          medicalNotes: '',
          emergencyContact: '',
        };
        return [newClient, ...prev];
      }
    });

    setToast({
      title: '¡Suscripción Activada con Éxito!',
      message: `${details.receiptType.toUpperCase()} ${details.receiptNumber} emitida por S/. ${details.amountPaid}. Ya puedes agendar tu clase.`,
    });
    setTimeout(() => setToast(null), 5000);
  };

  // Filtered arrays derived for MyClasses component
  const bookedClasses = classesList.filter((c) => bookedClassIds.has(c.id));
  const waitlistClasses = classesList.filter((c) => waitlistClassIds.has(c.id));
  const alertClasses = classesList.filter((c) => alertClassIds.has(c.id));

  // -------------------------------------------------------------
  // VISTA TOTALMENTE INDEPENDIENTE: ENLACE ÚNICO REGISTRO + QR
  // -------------------------------------------------------------
  if (activeTab === 'registro') {
    return (
      <QuickRegistrationLanding
        onSuccess={(user) => {
          handleGoogleAuthSuccess(user);
          handleSelectTab('horarios');
        }}
        onExitToHome={() => handleSelectTab('inicio')}
      />
    );
  }

  // -------------------------------------------------------------
  // VISTA TOTALMENTE INDEPENDIENTE: PORTAL STAFF / SELECCIÓN DE ESPACIOS
  // -------------------------------------------------------------
  if (activeTab === 'staff-hub') {
    return (
      <StaffDestinationHub
        currentUser={currentUser}
        onSelectDestination={handleSelectTab}
        onLogout={handleLogout}
      />
    );
  }

  // -------------------------------------------------------------
  // VISTA TOTALMENTE INDEPENDIENTE: PANEL DE REGISTROS PRESENCIAL
  // -------------------------------------------------------------
  if (activeTab === 'registros-presencial') {
    return (
      <ReceptionDeskPanel
        currentUser={currentUser}
        classes={classesList}
        bookings={bookingsList}
        clients={clientsList}
        transactions={transactionsList}
        cashRegister={cashRegister}
        onAddClient={handleAddClient}
        onUpdateClient={handleUpdateClient}
        onAddTransaction={handleAddTransaction}
        onCheckInBooking={handleCheckInBooking}
        onAssignBed={handleAssignBed}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onAddManualBooking={handleAddManualBooking}
        onSelectDestination={handleSelectTab}
        onLogout={handleLogout}
      />
    );
  }

  // -------------------------------------------------------------
  // VISTA TOTALMENTE INDEPENDIENTE: PORTAL ADMIN / BACK-OFFICE
  // No comparte Header, ni Footer, ni elementos de la web pública de alumnos.
  // -------------------------------------------------------------
  if (activeTab === 'admin') {
    // ESCUDO DE SEGURIDAD: Si una recepcionista intenta acceder a 'admin', renderizar únicamente el panel de recepción
    if (currentUser?.role === 'receptionist') {
      return (
        <ReceptionDeskPanel
          currentUser={currentUser}
          classes={classesList}
          bookings={bookingsList}
          clients={clientsList}
          transactions={transactionsList}
          cashRegister={cashRegister}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClient}
          onAddTransaction={handleAddTransaction}
          onCheckInBooking={handleCheckInBooking}
          onAssignBed={handleAssignBed}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onAddManualBooking={handleAddManualBooking}
          onSelectDestination={handleSelectTab}
          onLogout={handleLogout}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] font-sans antialiased selection:bg-[#B5654A] selection:text-[#FAF8F5]">
        {/* Toast Notification para acciones administrativas */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-lg shadow-xl border animate-in slide-in-from-bottom-5 duration-300 flex items-start justify-between ${
              toast.isAlert
                ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]'
                : 'bg-[#1A1815] text-[#FAF8F5] border-[#FAF8F5]/10'
            }`}
          >
            <div className="flex items-start space-x-3">
              {toast.isAlert ? (
                <BellRing className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm font-medium text-[#FAF8F5]">{toast.title}</p>
                <p className="text-xs text-[#FAF8F5]/70 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] p-1 -mr-1 cursor-pointer"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <AdminPanel
          currentUser={currentUser}
          onUpdateCurrentUser={setCurrentUser}
          classes={classesList}
          bookings={bookingsList}
          clients={clientsList}
          transactions={transactionsList}
          expenses={expensesList}
          leads={leadsList}
          cashRegister={cashRegister}
          onAddClass={handleAddClass}
          onUpdateClass={handleUpdateClass}
          onDeleteClass={handleDeleteClass}
          onUpdateSpots={handleUpdateSpots}
          onAddManualBooking={handleAddManualBooking}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onResetData={handleResetData}
          onExitToPublic={() => handleSelectTab('inicio')}
          onAddClient={handleAddClient}
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
          onAddTransaction={handleAddTransaction}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onToggleCashRegister={handleToggleCashRegister}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
          onUpdateExpenseStatus={handleUpdateExpenseStatus}
          onAddLead={handleAddLead}
          onUpdateLead={handleUpdateLead}
          onDeleteLead={handleDeleteLead}
          onUpdateLeadStatus={handleUpdateLeadStatus}
          onConvertLeadToClient={handleConvertLeadToClient}
          onCheckInBooking={handleCheckInBooking}
          onAssignBed={handleAssignBed}
          onUpdateClientCredits={handleUpdateClientCredits}
          onClearDemoData={handleClearDemoData}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onGoToReceptionDesk={() => handleSelectTab('registros-presencial')}
          onGoToStaffHub={() => handleSelectTab('staff-hub')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] font-sans antialiased flex flex-col selection:bg-[#B5654A] selection:text-[#FAF8F5]">
      
      {/* Global Notification Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-lg shadow-xl border animate-in slide-in-from-bottom-5 duration-300 flex items-start justify-between ${
            toast.isAlert
              ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]'
              : 'bg-[#1A1815] text-[#FAF8F5] border-[#FAF8F5]/10'
          }`}
        >
          <div className="flex items-start space-x-3">
            {toast.isAlert ? (
              <BellRing className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#B5654A] shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-[#FAF8F5]">{toast.title}</p>
              <p className="text-xs text-[#FAF8F5]/70 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-[#FAF8F5]/60 hover:text-[#FAF8F5] p-1 -mr-1 cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HEADER (Única barra superior con navegación por pestañas y acceso a cuenta) */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        bookedCount={bookedClasses.length}
        currentUser={currentUser}
        onOpenCheckInModal={() => {
          if (!currentUser) {
            setAuthPurpose('acceder a tu cuenta de alumna');
            setIsGoogleAuthOpen(true);
          } else {
            setIsCheckInModalOpen(true);
          }
        }}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onOpenLevelModal={() => handleSelectTab('niveles')}
        onOpenKioskModal={() => setIsKioskModalOpen(true)}
        onOpenBiomechanicsQuiz={() => setIsBiomechanicsQuizOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* 2. MAIN INDEPENDENT TAB CONTENT PANELS */}
      <main className="flex-grow">
        {/* TAB 1: INICIO */}
        {activeTab === 'inicio' && (
          <div
            id="tabpanel-inicio"
            role="tabpanel"
            aria-labelledby="tab-btn-inicio"
            className="animate-in fade-in duration-300"
          >
            {/* Hero Section */}
            <Hero
              onBookFirstClass={handleBookFirstClass}
              onViewSchedule={() => handleSelectTab('horarios')}
              onOpenBiomechanicsQuiz={() => setIsBiomechanicsQuizOpen(true)}
            />

            {/* Studio Pillars & Fast Navigation Cards */}
            <section className="py-14 sm:py-18 bg-[#F1ECE5]/40 border-b border-[#E4DED4]/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-[11px] uppercase tracking-widest text-[#B5654A] font-semibold">
                    Explora el Estudio
                  </span>
                  <h2 className="font-fraunces text-2xl sm:text-3xl text-[#1A1815] font-medium mt-1">
                    Accede directamente a cada sección
                  </h2>
                  <p className="text-sm text-[#6B655C] mt-2">
                    Todo organizado en pestañas independientes para que encuentres tu sesión ideal sin scroll innecesario.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {/* Card Horarios */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('horarios')}
                    className="p-4 sm:p-6 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-left hover:border-[#B5654A] hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#F1ECE5] flex items-center justify-center text-[#B5654A] mb-2.5 sm:mb-4 group-hover:bg-[#B5654A] group-hover:text-[#FAF8F5] transition-colors">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-fraunces text-sm sm:text-lg text-[#1A1815] font-medium mb-1">
                        Horarios & Cupos
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#6B655C] leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                        Disponibilidad en vivo de lunes a domingo con filtros por nivel.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-[#B5654A] pt-1">
                      Ver horarios <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>

                  {/* Card Mis Clases */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('mis-clases')}
                    className="p-4 sm:p-6 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-left hover:border-[#B5654A] hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#F1ECE5] flex items-center justify-center text-[#B5654A] mb-2.5 sm:mb-4 group-hover:bg-[#B5654A] group-hover:text-[#FAF8F5] transition-colors">
                        <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-fraunces text-sm sm:text-lg text-[#1A1815] font-medium">
                          Mis Clases
                        </h3>
                        {bookedClasses.length > 0 && (
                          <span className="text-[9px] sm:text-[10px] bg-[#B5654A] text-[#FAF8F5] px-1.5 py-0.2 rounded-full font-bold">
                            {bookedClasses.length}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#6B655C] leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                        Tus reservas activas, cancelaciones y pase digital en sala.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-[#B5654A] pt-1">
                      Mi panel <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>

                  {/* Card Membresías */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('membresias')}
                    className="p-4 sm:p-6 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-left hover:border-[#B5654A] hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#F1ECE5] flex items-center justify-center text-[#B5654A] mb-2.5 sm:mb-4 group-hover:bg-[#B5654A] group-hover:text-[#FAF8F5] transition-colors">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-fraunces text-sm sm:text-lg text-[#1A1815] font-medium mb-1">
                        Membresías
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#6B655C] leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                        Prueba desde S/. 45, packs de 8 clases y pases sin matrícula.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-[#B5654A] pt-1">
                      Ver tarifas <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>

                  {/* Card Instructores */}
                  <button
                    type="button"
                    onClick={() => handleSelectTab('profesores')}
                    className="p-4 sm:p-6 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-left hover:border-[#B5654A] hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#F1ECE5] flex items-center justify-center text-[#B5654A] mb-2.5 sm:mb-4 group-hover:bg-[#B5654A] group-hover:text-[#FAF8F5] transition-colors">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <h3 className="font-fraunces text-sm sm:text-lg text-[#1A1815] font-medium mb-1">
                        Instructores
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#6B655C] leading-relaxed mb-2 sm:mb-3 line-clamp-2 sm:line-clamp-none">
                        Docentes con certificaciones internacionales PMA y biomecánica.
                      </p>
                    </div>
                    <span className="inline-flex items-center text-[11px] sm:text-xs font-semibold text-[#B5654A] pt-1">
                      Equipo <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Boutique & Retail Showcase */}
            <BoutiqueSection
              userExp={currentUser?.exp ?? 1350}
              onRedeemWithExp={(productName, expCost) => handleSpendExp(expCost, productName)}
              onNotifyProduct={(productName) => {
                setToast({
                  title: 'Producto Separado en Recepción',
                  message: `Hemos reservado "${productName}". Puedes abonarlo y recogerlo al llegar a tu sesión.`,
                });
                setTimeout(() => setToast(null), 4000);
              }}
            />

            {/* Testimonials */}
            <Testimonials />

            {/* FAQ Interactive Accordion */}
            <FaqSection />

            {/* Location & Studio Features */}
            <LocationSection />

            {/* Final CTA */}
            <FinalCTA onBookClass={handleBookFirstClass} />
          </div>
        )}

        {/* TAB 2: HORARIOS Y RESERVAS */}
        {activeTab === 'horarios' && (
          <div
            id="tabpanel-horarios"
            role="tabpanel"
            aria-labelledby="tab-btn-horarios"
            className="animate-in fade-in duration-300 py-4"
          >
            <ScheduleCalendar
              classes={classesList}
              bookedClassIds={bookedClassIds}
              waitlistClassIds={waitlistClassIds}
              alertClassIds={alertClassIds}
              onSelectClassForBooking={handleSelectClassForBooking}
              onToggleAlert={handleToggleAlert}
            />
          </div>
        )}

        {/* TAB 3: MIS CLASES */}
        {activeTab === 'mis-clases' && (
          <div
            id="tabpanel-mis-clases"
            role="tabpanel"
            aria-labelledby="tab-btn-mis-clases"
            className="animate-in fade-in duration-300 py-4"
          >
            <MyClasses
              bookedClasses={bookedClasses}
              waitlistClasses={waitlistClasses}
              alertClasses={alertClasses}
              currentUser={currentUser}
              onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
              onOpenLevelModal={() => handleSelectTab('niveles')}
              onCancelBooking={handleCancelBooking}
              onCancelWaitlist={handleCancelWaitlist}
              onCancelAlert={handleCancelAlert}
              onExploreSchedule={() => handleSelectTab('horarios')}
            />
          </div>
        )}

        {/* TAB 4: MI NIVEL & EXP (SISTEMA DE GAMIFICACIÓN Y LOGROS) */}
        {activeTab === 'niveles' && (
          <div
            id="tabpanel-niveles"
            role="tabpanel"
            aria-labelledby="tab-btn-niveles"
            className="animate-in fade-in duration-300 py-4"
          >
            <StudentProgressTab
              currentUser={currentUser}
              onGainExp={handleGainExp}
              onExploreSchedule={() => handleSelectTab('horarios')}
              onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: MEMBRESÍAS Y PRECIOS */}
        {activeTab === 'membresias' && (
          <div
            id="tabpanel-membresias"
            role="tabpanel"
            aria-labelledby="tab-btn-membresias"
            className="animate-in fade-in duration-300 py-4"
          >
            <PricingSection onSelectPlan={handleSelectPlan} />
          </div>
        )}

        {/* TAB 5: INSTRUCTORES & VENTANILLA DE MÉTODOS */}
        {activeTab === 'profesores' && (
          <div
            id="tabpanel-profesores"
            role="tabpanel"
            aria-labelledby="tab-btn-profesores"
            className="animate-in fade-in duration-300 py-4"
          >
            <InstructorGrid initialSubTab="instructores" />
          </div>
        )}

        {/* TAB 6: MÉTODO PILATES (VENTANILLA DENTRO DE INSTRUCTORES) */}
        {activeTab === 'metodo' && (
          <div
            id="tabpanel-metodo"
            role="tabpanel"
            aria-labelledby="tab-btn-metodo"
            className="animate-in fade-in duration-300 py-4"
          >
            <InstructorGrid initialSubTab="metodo" />
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <Footer onSelectTab={handleSelectTab} />

      {/* BOOKING / WAITLIST MODAL CON DATOS COMPLETOS & GOOGLE AUTOFILL */}
      <BookingModal
        data={bookingModalData}
        onClose={() => setBookingModalData(null)}
        onConfirmBooking={handleConfirmBooking}
        currentUser={currentUser}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
      />

      {/* CLIENT CHECK-IN & MI CUENTA MODAL */}
      <ClientCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        currentUser={currentUser}
        userBookings={bookingsList.filter(
          (b) =>
            currentUser &&
            (b.clientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
              b.clientName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
        )}
        onOpenGoogleAuth={() => {
          setIsCheckInModalOpen(false);
          setIsGoogleAuthOpen(true);
        }}
        onLogout={handleLogout}
        onPerformCheckIn={handlePerformCheckIn}
        onOpenEditProfile={() => {
          setIsCheckInModalOpen(false);
          setIsEditProfileOpen(true);
        }}
        onGoToReceptionDesk={() => {
          setIsCheckInModalOpen(false);
          handleSelectTab('registros-presencial');
        }}
        onGoToAdminPanel={() => {
          setIsCheckInModalOpen(false);
          handleSelectTab('admin');
        }}
        onGoToStaffHub={() => {
          setIsCheckInModalOpen(false);
          handleSelectTab('staff-hub');
        }}
      />

      {/* MODAL DE EDICION DE DATOS DEL PERFIL & SALUD */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={currentUser}
        onSave={handleSaveProfile}
      />

      {/* CENTRO UNIFICADO DE REGISTRO & ACCESO (GOOGLE AUTH + FORMULARIO BÁSICO) */}
      <GoogleAuthModal
        isOpen={isGoogleAuthOpen}
        onClose={() => {
          setIsGoogleAuthOpen(false);
          setPendingBookingAction(null);
          setAuthPurpose('');
          sessionStorage.setItem('firme_quick_auth_dismissed', 'true');
        }}
        onSuccess={handleGoogleAuthSuccess}
        purpose={authPurpose}
        initialMode={authInitialModality}
      />

      {/* SIMULADOR DE CHECKOUT & PAGO DE PLAN */}
      <PlanCheckoutModal
        isOpen={selectedPlanForCheckout !== null}
        plan={selectedPlanForCheckout}
        onClose={() => setSelectedPlanForCheckout(null)}
        currentUser={currentUser}
        onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
        onPaymentSuccess={handlePlanPaymentSuccess}
      />

      {/* MODAL DE NIVEL DE ESTUDIANTE, EXP & MISIONES */}
      <StudentLevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentUser={currentUser}
        onGainExp={handleGainExp}
      />

      {/* KIOSCO TÓTEM PARA TABLET DE RECEPCIÓN (JR. AKAPANA 1261) */}
      <ReceptionKioskModal
        isOpen={isKioskModalOpen}
        onClose={() => setIsKioskModalOpen(false)}
        bookings={bookingsList}
        clients={clientsList}
        onCheckInSuccess={(updated) => {
          setBookingsList((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b))
          );
        }}
        onGainExp={handleGainExp}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAuthModal={(modality) => {
          setIsKioskModalOpen(false);
          setAuthInitialModality(modality || 'manual');
          setIsGoogleAuthOpen(true);
        }}
      />

      {/* MODAL DE CÓDIGO QR Y ENLACE ÚNICO DE REGISTRO PARA MOSTRADOR */}
      <ReceptionQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* TEST BIOMECÁNICO & POSTURAL EN 4 PASOS */}
      <BiomechanicsQuizModal
        isOpen={isBiomechanicsQuizOpen}
        onClose={() => setIsBiomechanicsQuizOpen(false)}
        onSelectSchedule={() => {
          setIsBiomechanicsQuizOpen(false);
          handleSelectTab('horarios');
        }}
      />

      {/* ASISTENTE VIRTUAL CONCIERGE IA (GEMINI & HEURÍSTICA ESTUDIO) */}
      <AiAssistantWidget
        onNavigateToSchedule={() => handleSelectTab('horarios')}
        onOpenBiomechanicsQuiz={() => setIsBiomechanicsQuizOpen(true)}
      />

      {/* FLOATING WHATSAPP BUTTON */}
      <WhatsAppFloat />

      {/* BOTÓN FLOTANTE DE ACCESO EXCLUSIVO STAFF (OWNER Y ADMINS) */}
      <FloatingAdminButton
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

    </div>
  );
}
