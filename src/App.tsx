import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MyClasses } from './components/MyClasses';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { PricingSection } from './components/PricingSection';
import { InstructorGrid } from './components/InstructorGrid';
import { Testimonials } from './components/Testimonials';
import { FinalCTA } from './components/FinalCTA';
import { BoutiqueSection } from './components/BoutiqueSection';
import { FaqSection } from './components/FaqSection';
import { LocationSection } from './components/LocationSection';
import { FloatingAdminButton } from './components/FloatingAdminButton';
import { Footer } from './components/Footer';
import { StudioToast } from './components/StudioToast';
import { StudioErrorBoundary } from './components/StudioErrorBoundary';

// Hooks
import { useToast } from './hooks/useToast';
import { useStudioData } from './hooks/useStudioData';
import { useStudioAuth } from './hooks/useStudioAuth';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';

// Types
import {
  ClassSession,
  BookingModalData,
  PricingPlan,
  MainTabType,
  BookingRecord,
  ClientProfile,
  AuthUser,
  determineUserRole,
  ClientBookingFormData,
  PaymentMethod,
} from './types';

// Helper robusto para importación dinámica de componentes con recuperación ante cortes de red o reinicios de Vite
const robustLazy = <T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T } | { [key: string]: T }>,
  key: string = 'default'
) =>
  lazy(async () => {
    try {
      const module = await factory();
      return { default: (module as any)[key] || (module as any).default };
    } catch (err: any) {
      console.warn('Fallo transitorio en importación dinámica, reintentando carga...', err);
      await new Promise((resolve) => setTimeout(resolve, 600));
      const moduleRetry = await factory();
      return { default: (moduleRetry as any)[key] || (moduleRetry as any).default };
    }
  });

// Lazy-loaded heavy components (Modals & Secondary Views)
const AdminPanel = robustLazy(
  () => import('./components/AdminPanel'),
  'AdminPanel'
);
const StaffDestinationHub = robustLazy(
  () => import('./components/StaffDestinationHub'),
  'StaffDestinationHub'
);
const StudentRoomPanel = robustLazy(
  () => import('./components/StudentRoomPanel'),
  'StudentRoomPanel'
);
const QuickRegistrationLanding = lazy(() =>
  import('./components/QuickRegistrationLanding').then((m) => ({ default: m.QuickRegistrationLanding }))
);
const StudentProgressTab = lazy(() =>
  import('./components/StudentProgressTab').then((m) => ({ default: m.StudentProgressTab }))
);
const AiAssistantWidget = lazy(() =>
  import('./components/AiAssistantWidget').then((m) => ({ default: m.AiAssistantWidget }))
);
const BookingModal = lazy(() =>
  import('./components/BookingModal').then((m) => ({ default: m.BookingModal }))
);
const GoogleAuthModal = lazy(() =>
  import('./components/GoogleAuthModal').then((m) => ({ default: m.GoogleAuthModal }))
);
const ClientCheckInModal = lazy(() =>
  import('./components/ClientCheckInModal').then((m) => ({ default: m.ClientCheckInModal }))
);
const EditProfileModal = lazy(() =>
  import('./components/EditProfileModal').then((m) => ({ default: m.EditProfileModal }))
);
const PlanCheckoutModal = lazy(() =>
  import('./components/PlanCheckoutModal').then((m) => ({ default: m.PlanCheckoutModal }))
);
const StudentLevelModal = lazy(() =>
  import('./components/StudentLevelModal').then((m) => ({ default: m.StudentLevelModal }))
);
const ReceptionKioskModal = lazy(() =>
  import('./components/ReceptionKioskModal').then((m) => ({ default: m.ReceptionKioskModal }))
);
const ReceptionQrModal = lazy(() =>
  import('./components/ReceptionQrModal').then((m) => ({ default: m.ReceptionQrModal }))
);
const BiomechanicsQuizModal = lazy(() =>
  import('./components/BiomechanicsQuizModal').then((m) => ({ default: m.BiomechanicsQuizModal }))
);

const FallbackLoader = () => (
  <div className="min-h-[300px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#B5654A] border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('inicio');
  const { toast, showToast, closeToast } = useToast();

  // Encapsulated data collections and persistence
  const {
    classesList,
    setClassesList,
    bookingsList,
    setBookingsList,
    clientsList,
    setClientsList,
    transactionsList,
    expensesList,
    leadsList,
    cashRegister,
    handleAddClass,
    handleUpdateClass,
    handleDeleteClass,
    handleUpdateSpots,
    handleAddManualBooking,
    handleUpdateBookingStatus,
    handleCheckInBooking,
    handleAssignBed,
    handleAddClient,
    handleUpdateClient,
    handleDeleteClient,
    handleUpdateClientCredits,
    handleAddTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleToggleCashRegister,
    handleAddExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleUpdateExpenseStatus,
    handleAddLead,
    handleUpdateLead,
    handleDeleteLead,
    handleUpdateLeadStatus,
    handleConvertLeadToClient,
    handleResetData,
    handleClearDemoData,
  } = useStudioData({ showToast });

  // Encapsulated user authentication & gamification
  const {
    currentUser,
    setCurrentUser,
    handleGainExp,
    handleSpendExp,
    handleSaveProfile,
    handleGoogleAuthSuccess,
    handleLogout,
  } = useStudioAuth({
    showToast,
    onRegisterClientProfile: (user) => {
      if (!user.email) return;
      setClientsList((prev) => {
        const exists = prev.some((c) => c.email && c.email.toLowerCase() === user.email.toLowerCase());
        if (!exists) {
          const newClient: ClientProfile = {
            id: `cli-${Date.now()}`,
            name: user.name,
            dni: user.dni || 'No registrado',
            phone: user.phone || '+51 900 000 000',
            email: user.email,
            currentPlan: user.planName || 'Nuevo Alumno',
            planType: user.planName?.toLowerCase().includes('ilimitada') ? 'ilimitado' : 'pack',
            creditsLeft: user.creditsLeft ?? 0,
            totalAttended: 0,
            status: 'activo',
            joinDate: new Date().toLocaleDateString('es-PE'),
            lastVisit: 'Recién registrado',
            emergencyContact: user.emergencyContact || '',
            emergencyPhone: user.emergencyPhone || '',
            medicalNotes: Array.isArray(user.healthConditions)
              ? user.healthConditions.join(', ')
              : typeof user.healthConditions === 'string' && user.healthConditions
              ? user.healthConditions
              : user.medicalNotes || '',
            documentType: user.documentType || 'dni',
            birthDate: user.birthDate,
            gender: user.gender,
            registrationMethod: user.registrationMethod || 'manual_smartfit',
          };
          return [newClient, ...prev];
        }
        return prev;
      });
    },
  });

  // Modals & transient interaction state
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [scannedDniParam, setScannedDniParam] = useState<string | null>(null);
  const [scannedNameParam, setScannedNameParam] = useState<string | null>(null);
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

  // Persistent tracking of bookings on this device/browser
  const [deviceBookingIds, setDeviceBookingIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('firme_device_booking_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [bookedClassIds, setBookedClassIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('firme_booked_class_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [waitlistClassIds, setWaitlistClassIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('firme_waitlist_class_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [alertClassIds, setAlertClassIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('firme_alert_class_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>(['mar-2']);
    } catch {
      return new Set<string>(['mar-2']);
    }
  });

  const [bookingModalData, setBookingModalData] = useState<BookingModalData | null>(null);

  // Sync state sets with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('firme_device_booking_ids', JSON.stringify(Array.from(deviceBookingIds)));
    } catch {}
  }, [deviceBookingIds]);

  useEffect(() => {
    try {
      localStorage.setItem('firme_booked_class_ids', JSON.stringify(Array.from(bookedClassIds)));
    } catch {}
  }, [bookedClassIds]);

  useEffect(() => {
    try {
      localStorage.setItem('firme_waitlist_class_ids', JSON.stringify(Array.from(waitlistClassIds)));
    } catch {}
  }, [waitlistClassIds]);

  useEffect(() => {
    try {
      localStorage.setItem('firme_alert_class_ids', JSON.stringify(Array.from(alertClassIds)));
    } catch {}
  }, [alertClassIds]);

  // Re-synchronize student's booked & waitlist classes whenever bookingsList or currentUser changes
  useEffect(() => {
    const userDni = currentUser?.dni?.trim().toLowerCase();
    const userAltDni = currentUser?.alternateDni?.trim().toLowerCase();
    const userEmail = currentUser?.email?.trim().toLowerCase();
    const userName = currentUser?.name?.trim().toLowerCase();

    const myBooked = new Set<string>();
    const myWaitlist = new Set<string>();

    bookingsList.forEach((b) => {
      if (b.status === 'cancelada') return;

      const bDni = b.clientDni?.trim().toLowerCase();
      const bEmail = b.clientEmail?.trim().toLowerCase();
      const bName = b.clientName?.trim().toLowerCase();

      const isMyRecord =
        (userDni && bDni && (bDni === userDni || bDni === userAltDni)) ||
        (userEmail && bEmail && bEmail === userEmail) ||
        (userName && bName && bName === userName) ||
        deviceBookingIds.has(b.id);

      if (isMyRecord) {
        if (b.isWaitlist) {
          myWaitlist.add(b.classId);
        } else {
          myBooked.add(b.classId);
        }
      }
    });

    if (myBooked.size > 0 || myWaitlist.size > 0) {
      setBookedClassIds(myBooked);
      setWaitlistClassIds(myWaitlist);
    }
  }, [bookingsList, currentUser, deviceBookingIds]);

  // Auto-opening quick auth modal for new visitors
  useEffect(() => {
    if (!currentUser && !sessionStorage.getItem('firme_quick_auth_dismissed')) {
      const timer = setTimeout(() => {
        setAuthInitialModality('register');
        setIsGoogleAuthOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Routing synchronization with URL hash/path
  useEffect(() => {
    const handleRouteCheck = () => {
      // Check for QR Pass scan action: /?action=checkin&dni=...
      const searchParams = new URLSearchParams(window.location.search);
      const actionParam = searchParams.get('action');
      const dniParam = searchParams.get('dni');
      const nameParam = searchParams.get('name');

      if (actionParam === 'checkin') {
        if (dniParam) setScannedDniParam(dniParam);
        if (nameParam) setScannedNameParam(nameParam);
        setIsCheckInModalOpen(true);
        showToast(
          '📱 FIRME PASS Escaneado',
          dniParam
            ? `Identificado: ${nameParam || 'Alumno'} (DNI ${dniParam}). Confirma tu llegada para asignar tu cama Reformer.`
            : 'Pase oficial detectado. Confirma tu asistencia en sala.',
          false
        );
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        return;
      }

      const hash = window.location.hash.replace('#', '').toLowerCase();
      const pathname = window.location.pathname.toLowerCase();

      const isStaffRoute =
        hash === 'acceso-staff' ||
        hash === 'staff-portal' ||
        hash === 'admin' ||
        hash === 'staff' ||
        hash === 'admin-login' ||
        hash === 'mostrador' ||
        pathname === '/admin' ||
        pathname === '/acceso-staff' ||
        pathname === '/staff';

      if (isStaffRoute) {
        const savedUserStr = localStorage.getItem('firme_auth_user');
        const isRealOwner = sessionStorage.getItem('firme_real_owner') === 'true';
        if (savedUserStr && !isRealOwner) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed.role === 'client') {
              setActiveTab('inicio');
              history.replaceState(null, '', window.location.pathname);
              showToast(
                'Acceso Denegado',
                'Tu cuenta tiene perfil de Alumna/Cliente. El portal administrativo es exclusivo para el equipo de FIRME STUDIO.',
                true
              );
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

      if (
        hash === 'totem' ||
        hash === 'totem-qr' ||
        hash === 'kiosko' ||
        pathname === '/totem'
      ) {
        setActiveTab('staff-hub');
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
      } else if (hash === 'panel-alumno-sala' || hash === 'kiosco') {
        setActiveTab('kiosco');
      } else if (hash === 'staff-hub' || hash === 'hub') {
        const savedUserStr = localStorage.getItem('firme_auth_user');
        const isRealOwner = sessionStorage.getItem('firme_real_owner') === 'true';
        if (savedUserStr && !isRealOwner) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed.role === 'client') {
              setActiveTab('inicio');
              history.replaceState(null, '', window.location.pathname);
              showToast(
                'Acceso Denegado',
                'Tu cuenta tiene perfil de Alumna/Cliente. El Hub es exclusivo para el equipo de FIRME STUDIO.',
                true
              );
              return;
            }
          } catch (e) {
            // ignore
          }
        }
        setActiveTab('staff-hub');
      } else if (['inicio', 'horarios', 'mis-clases', 'membresias', 'profesores', 'metodo'].includes(hash)) {
        setActiveTab(hash as MainTabType);
      }
    };

    handleRouteCheck();
    window.addEventListener('hashchange', handleRouteCheck);
    return () => window.removeEventListener('hashchange', handleRouteCheck);
  }, [showToast]);

  const handleSelectTab = (tab: MainTabType) => {
    if (tab === 'registro') {
      setActiveTab('registro');
      window.location.hash = 'registro';
    } else if (tab === 'kiosco') {
      const isRealOwner = sessionStorage.getItem('firme_real_owner') === 'true' || currentUser?.role === 'owner_dev';
      if (currentUser?.role === 'client' && !isRealOwner) {
        showToast(
          'Acceso Denegado',
          'Tu cuenta tiene perfil de Alumna/Cliente. El Panel Alumno/Sala es exclusivo para el equipo de mostrador y recepción de FIRME STUDIO.',
          true
        );
        return;
      }
      setActiveTab('kiosco');
      window.location.hash = 'panel-alumno-sala';
    } else if (tab === 'staff-hub') {
      const isRealOwner = sessionStorage.getItem('firme_real_owner') === 'true' || currentUser?.role === 'owner_dev';
      if (currentUser?.role === 'client' && !isRealOwner) {
        showToast(
          'Acceso Denegado',
          'Tu cuenta tiene perfil de Alumna/Cliente. El Hub es exclusivo para el equipo de FIRME STUDIO.',
          true
        );
        return;
      }
      setActiveTab('staff-hub');
      window.location.hash = 'staff-hub';
    } else if (tab === 'admin') {
      const isRealOwner = sessionStorage.getItem('firme_real_owner') === 'true' || currentUser?.role === 'owner_dev';
      if (currentUser?.role === 'client' && !isRealOwner) {
        showToast(
          'Acceso Denegado',
          'Tu cuenta tiene perfil de Alumna/Cliente. El portal administrativo es exclusivo para el equipo de FIRME STUDIO.',
          true
        );
        return;
      }
      setActiveTab('admin');
      window.location.hash = 'acceso-staff';
    } else {
      setActiveTab(tab);
      const staffHashes = ['#admin', '#acceso-staff', '#staff-portal', '#staff', '#admin-login', '#registro', '#panel-alumno-sala', '#kiosco', '#staff-hub', '#hub', '#totem', '#totem-qr'];
      if (staffHashes.includes(window.location.hash)) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: AuthUser) => {
    handleGoogleAuthSuccess(user, () => {
      setActiveTab('admin');
    });

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

  const handleUserLogout = async () => {
    await handleLogout(() => {
      if (activeTab === 'admin') {
        setActiveTab('inicio');
        history.replaceState(null, '', window.location.pathname);
      }
    });
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

    if (isSupabaseConfigured()) {
      const target = bookingsList.find((b) => b.id === bookingId);
      if (target?.clientDni) {
        supabaseService.performTotemCheckIn(target.clientDni).catch((err) => {
          console.warn('Error en checkin Supabase:', err);
        });
      } else {
        supabaseService.updateBookingStatus(bookingId, 'asistio').then(() => {
          supabaseService.assignBed(bookingId, assignedBed);
        }).catch((err) => {
          console.warn('Error en checkin Supabase:', err);
        });
      }
    }

    handleGainExp(150, `Check-in en Sala Realizado (Cama #${assignedBed})`);
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
      showToast(
        'Creación de Cuenta Requerida',
        'Para agendar tu clase de Pilates Reformer, por favor crea tu cuenta o inicia sesión.'
      );
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
      showToast(
        'Identificación Necesaria',
        `Para reservar tu cama Reformer en ${session.name}, crea tu cuenta o inicia sesión.`
      );
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

    const medicalSummary = Array.isArray(clientData?.healthConditions) && clientData.healthConditions.length
      ? `${clientData.healthConditions.join(', ')}${
          clientData.medicalNotes ? ` — Nota: ${clientData.medicalNotes}` : ''
        }`
      : typeof clientData?.healthConditions === 'string' && clientData.healthConditions
      ? clientData.healthConditions
      : undefined;

    const newTempId = `b-${Date.now()}`;
    const newRecord: BookingRecord = {
      id: newTempId,
      classId: session?.id || classId,
      className: session?.name || 'Clase Reformer',
      classTime: session?.time || '08:00',
      classDay: session?.day || 'lun',
      instructor: session?.instructor || 'Instructora FIRME',
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
      isWaitlist: isWaitlist,
      bedNumber: isWaitlist ? undefined : (clientData?.selectedBed || 3),
    };

    // 1. Guardar en memoria local y registrar ID de reserva del dispositivo
    setDeviceBookingIds((prev) => new Set(prev).add(newTempId));
    setBookingsList((prev) => [newRecord, ...prev]);

    if (isWaitlist) {
      setWaitlistClassIds((prev) => new Set(prev).add(classId));
      showToast('Lista de espera activada', 'Te avisaremos por WhatsApp si se libera una plaza.');
    } else {
      setBookedClassIds((prev) => new Set(prev).add(classId));
      setClassesList((prev) =>
        prev.map((c) =>
          c.id === classId ? { ...c, occupiedSpots: Math.min(c.totalSpots, c.occupiedSpots + 1) } : c
        )
      );

      // Descontar crédito de sesión
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              credits: Math.max(0, (prev.credits ?? 8) - 1),
              creditsLeft: Math.max(0, (prev.creditsLeft ?? 8) - 1),
            }
          : prev
      );
    }

    // 2. Persistir en Supabase Cloud
    if (isSupabaseConfigured()) {
      supabaseService.createBooking(newRecord).then((res) => {
        if (res && res.id) {
          // Reemplazar el ID temporal con el UUID final de Supabase
          setBookingsList((prev) =>
            prev.map((b) => (b.id === newTempId ? res : b))
          );
          setDeviceBookingIds((prev) => {
            const next = new Set(prev);
            next.delete(newTempId);
            next.add(res.id);
            return next;
          });
          showToast(
            '¡Reserva Guardada en la Nube!',
            isWaitlist
              ? 'Has quedado registrada en la lista de espera.'
              : `Tu plaza para ${newRecord.className} fue confirmada y guardada en Supabase.`
          );
        } else {
          showToast(
            'Aviso de Guardado',
            'La reserva se guardó localmente, pero no se pudo sincronizar con la base de datos en la nube.',
            true
          );
        }
      }).catch((err) => {
        console.warn('Error sincronizando reserva con Supabase:', err);
        showToast(
          'Error al Sincronizar Reserva',
          `Fallo al enviar la reserva a Supabase: ${err?.message || 'Error de conexión'}`,
          true
        );
      });
    }

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
                medicalNotes: clientData?.medicalNotes || (Array.isArray(clientData?.healthConditions) ? clientData.healthConditions.join(', ') : (typeof clientData?.healthConditions === 'string' ? clientData.healthConditions : '')),
              };
              if (isSupabaseConfigured()) {
                supabaseService.createClient(newClientProfile).then((res) => {
                  if (!res) {
                    showToast(
                      'Aviso de Alumna',
                      'Perfil guardado en el navegador, pero no se pudo registrar en la base de datos.',
                      true
                    );
                  }
                }).catch((err) => {
                  showToast(
                    'Error al Guardar Alumna',
                    `Fallo al sincronizar alumna con Supabase: ${err?.message || 'Error de conexión'}`,
                    true
                  );
                });
              }
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

        handleGainExp(100, `Reserva asegurada en ${session ? session.name : 'Reformer'}`);
  };

  const handleCancelBooking = (classId: string) => {
    const cancelledClass = classesList.find((c) => c.id === classId);

    setBookedClassIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });

    setClassesList((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, occupiedSpots: Math.max(0, c.occupiedSpots - 1) } : c
      )
    );

    // Cancelar en la lista de reservas y sincronizar con Supabase
    const userDni = currentUser?.dni?.trim().toLowerCase();
    const userEmail = currentUser?.email?.trim().toLowerCase();

    const activeBooking =
      bookingsList.find(
        (b) =>
          b.classId === classId &&
          b.status !== 'cancelada' &&
          ((userDni && b.clientDni?.trim().toLowerCase() === userDni) ||
           (userEmail && b.clientEmail?.trim().toLowerCase() === userEmail) ||
           deviceBookingIds.has(b.id))
      ) ||
      bookingsList.find((b) => b.classId === classId && b.status !== 'cancelada');

    if (activeBooking) {
      setBookingsList((prev) =>
        prev.map((b) => (b.id === activeBooking.id ? { ...b, status: 'cancelada' } : b))
      );
      setDeviceBookingIds((prev) => {
        const next = new Set(prev);
        next.delete(activeBooking.id);
        return next;
      });

      if (isSupabaseConfigured()) {
        supabaseService.updateBookingStatus(activeBooking.id, 'cancelada').then((success) => {
          if (!success) {
            showToast('Aviso de Cancelación', 'La reserva se canceló en pantalla pero no se pudo sincronizar con la nube.', true);
          }
        }).catch((err) => {
          showToast('Error de Cancelación', `Fallo al sincronizar con la base de datos: ${err?.message || 'Error'}`, true);
        });
      }
    }

    if (alertClassIds.has(classId)) {
      showToast(
        '🔔 ¡Aviso de disponibilidad automática!',
        `¡Se acaba de liberar 1 cupo en ${cancelledClass ? cancelledClass.name : 'la clase'}! Ya puedes reservarla en el horario.`,
        true,
        5000
      );
    } else {
      showToast(
        'Reserva cancelada con éxito',
        `Has liberado tu lugar en ${cancelledClass ? cancelledClass.name : 'la clase'}. Tu cupo quedó disponible.`,
        false,
        5000
      );
    }
  };

  const handleCancelWaitlist = (classId: string) => {
    setWaitlistClassIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });
    showToast('Lista de espera actualizada', 'Has salido de la lista de espera correctamente.');
  };

  const handleToggleAlert = (session: ClassSession) => {
    if (alertClassIds.has(session.id)) {
      setAlertClassIds((prev) => {
        const next = new Set(prev);
        next.delete(session.id);
        return next;
      });
      showToast('Aviso desactivado', `Ya no recibirás alertas automáticas para ${session.name}.`);
    } else {
      setAlertClassIds((prev) => new Set(prev).add(session.id));
      showToast(
        '🔔 ¡Aviso automático activado!',
        `Te notificaremos de inmediato en cuanto se libere un cupo en ${session.name} (${session.time} h) con ${session.instructor}.`,
        true
      );
    }
  };

  const handleCancelAlert = (classId: string) => {
    setAlertClassIds((prev) => {
      const next = new Set(prev);
      next.delete(classId);
      return next;
    });
    showToast('Aviso desactivado', 'Aviso automático de cupo cancelado.');
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!currentUser) {
      setPendingBookingAction({
        type: 'plan',
        plan: plan,
      });
      setAuthPurpose(`adquirir la membresía ${plan.name} (${plan.price})`);
      setIsGoogleAuthOpen(true);
      showToast(
        'Cuenta Requerida para Adquirir Plan',
        `Para contratar ${plan.name}, por favor crea tu cuenta o inicia sesión.`
      );
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
    let credits = 1;
    if (plan.id === 'pack-8') credits = 8;
    else if (plan.id === 'ilimitada') credits = 30;
    else if (plan.id === 'membresia-privadas') credits = 32;

    const { role, roleTitle } = currentUser?.role 
      ? { role: currentUser.role, roleTitle: currentUser.roleTitle || 'Alumna' }
      : determineUserRole(details.clientName, details.clientEmail);

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

    const newTx = {
      type: 'ingreso' as const,
      concept: `Suscripción a ${plan.name}`,
      category:
        plan.id === 'clase-suelta'
          ? ('clase_suelta' as const)
          : plan.id === 'pack-8'
          ? ('pack_clases' as const)
          : ('membresia' as const),
      amount: details.amountPaid,
      paymentMethod: details.paymentMethod,
      clientName: details.clientName,
      receiptNumber: details.receiptNumber,
      date: new Date().toLocaleDateString('es-PE'),
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      notes: `${details.receiptType.toUpperCase()} emitida a DNI/RUC ${details.clientDni}`,
    };
    handleAddTransaction(newTx);

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

    if (isSupabaseConfigured()) {
      supabaseService.recordPlanPurchase({
        clientDni: details.clientDni,
        clientName: details.clientName,
        clientEmail: details.clientEmail,
        planName: plan.name,
        planType:
          plan.id === 'clase-suelta'
            ? 'clase_suelta'
            : plan.id === 'ilimitada'
            ? 'ilimitado'
            : 'pack',
        credits,
        amountPaid: details.amountPaid,
        paymentMethod: details.paymentMethod,
        receiptNumber: details.receiptNumber,
      }).then((res) => {
        if (!res || !res.success) {
          showToast(
            'Aviso de Membresía',
            'El pago fue registrado, pero no se pudo guardar el plan en la base de datos en la nube.',
            true
          );
        }
      }).catch((err) => {
        console.warn('Aviso sincronizando plan con Supabase:', err);
        showToast(
          'Error al Registrar Membresía',
          `Fallo de sincronización con la nube: ${err?.message || 'Error de conexión'}`,
          true
        );
      });
    }

    showToast(
      '¡Suscripción Activada con Éxito!',
      `${details.receiptType.toUpperCase()} ${details.receiptNumber} emitida por S/. ${details.amountPaid}. Ya puedes agendar tu clase.`,
      false,
      5000
    );
  };

  const bookedClasses = useMemo(() => {
    const userDni = currentUser?.dni?.trim().toLowerCase();
    const userAltDni = currentUser?.alternateDni?.trim().toLowerCase();
    const userEmail = currentUser?.email?.trim().toLowerCase();
    const userName = currentUser?.name?.trim().toLowerCase();

    const myConfirmedBookings = bookingsList.filter((b) => {
      if (b.status === 'cancelada' || b.isWaitlist) return false;
      const bDni = b.clientDni?.trim().toLowerCase();
      const bEmail = b.clientEmail?.trim().toLowerCase();
      const bName = b.clientName?.trim().toLowerCase();

      return (
        (userDni && bDni && (bDni === userDni || bDni === userAltDni)) ||
        (userEmail && bEmail && bEmail === userEmail) ||
        (userName && bName && bName === userName) ||
        deviceBookingIds.has(b.id) ||
        bookedClassIds.has(b.classId)
      );
    });

    if (myConfirmedBookings.length > 0) {
      return myConfirmedBookings.map((b) => {
        const found = classesList.find((c) => c.id === b.classId);
        if (found) {
          return {
            ...found,
            time: b.classTime || found.time,
            day: (b.classDay as any) || found.day,
            instructor: b.instructor || found.instructor,
            name: b.className || found.name,
          };
        }
        return {
          id: b.classId,
          name: b.className || 'Clase Reformer',
          instructor: b.instructor || 'Instructora FIRME',
          time: b.classTime || '08:00',
          duration: '50 min',
          totalSpots: 8,
          occupiedSpots: 6,
          day: (b.classDay as any) || 'lun',
          level: 'Principiante',
          classType: 'Reformer',
          focus: 'Reserva confirmada en FIRME STUDIO',
        } as ClassSession;
      });
    }

    return classesList.filter((c) => bookedClassIds.has(c.id));
  }, [bookingsList, currentUser, deviceBookingIds, bookedClassIds, classesList]);

  const waitlistClasses = useMemo(() => {
    const userDni = currentUser?.dni?.trim().toLowerCase();
    const userAltDni = currentUser?.alternateDni?.trim().toLowerCase();
    const userEmail = currentUser?.email?.trim().toLowerCase();
    const userName = currentUser?.name?.trim().toLowerCase();

    const myWaitlistBookings = bookingsList.filter((b) => {
      if (b.status === 'cancelada' || !b.isWaitlist) return false;
      const bDni = b.clientDni?.trim().toLowerCase();
      const bEmail = b.clientEmail?.trim().toLowerCase();
      const bName = b.clientName?.trim().toLowerCase();

      return (
        (userDni && bDni && (bDni === userDni || bDni === userAltDni)) ||
        (userEmail && bEmail && bEmail === userEmail) ||
        (userName && bName && bName === userName) ||
        deviceBookingIds.has(b.id) ||
        waitlistClassIds.has(b.classId)
      );
    });

    if (myWaitlistBookings.length > 0) {
      return myWaitlistBookings.map((b) => {
        const found = classesList.find((c) => c.id === b.classId);
        if (found) return found;
        return {
          id: b.classId,
          name: b.className || 'Clase en Espera',
          instructor: b.instructor || 'Instructora FIRME',
          time: b.classTime || '08:00',
          duration: '50 min',
          totalSpots: 8,
          occupiedSpots: 8,
          day: (b.classDay as any) || 'lun',
          level: 'Principiante',
          classType: 'Reformer',
          focus: 'Lista de espera activa',
        } as ClassSession;
      });
    }

    return classesList.filter((c) => waitlistClassIds.has(c.id));
  }, [bookingsList, currentUser, deviceBookingIds, waitlistClassIds, classesList]);

  const alertClasses = useMemo(() => {
    return classesList.filter((c) => alertClassIds.has(c.id));
  }, [classesList, alertClassIds]);

  // Quick Registration Landing
  if (activeTab === 'registro') {
    return (
      <Suspense fallback={<FallbackLoader />}>
        <QuickRegistrationLanding
          onSuccess={(user) => {
            handleAuthSuccess(user);
            handleSelectTab('horarios');
          }}
          onExitToHome={() => handleSelectTab('inicio')}
        />
      </Suspense>
    );
  }

  // Staff Destination Hub
  if (activeTab === 'staff-hub') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] font-sans antialiased selection:bg-[#B5654A] selection:text-[#FAF8F5]">
        <StudioToast toast={toast} onClose={closeToast} />
        <Suspense fallback={<FallbackLoader />}>
          <StudioErrorBoundary
            fallbackTitle="Hub de Personal y Lanzador de Pantallas"
            fallbackMessage="Ocurrió un inconveniente al cargar el Hub. Puedes reintentar o volver al sitio web."
            onReset={() => setActiveTab('staff-hub')}
            onNavigateHome={() => handleSelectTab('inicio')}
          >
            <StaffDestinationHub
              currentUser={currentUser}
              onSelectDestination={handleSelectTab}
              onLogout={handleUserLogout}
              bookings={bookingsList}
              classes={classesList}
              clients={clientsList}
              onCheckInBooking={handleCheckInBooking}
              onAssignBed={handleAssignBed}
              onGainExp={handleGainExp}
              showToast={showToast}
              initialTotemMode={
                typeof window !== 'undefined' &&
                (window.location.hash.replace('#', '').toLowerCase() === 'totem' ||
                 window.location.hash.replace('#', '').toLowerCase() === 'totem-qr' ||
                 window.location.pathname.toLowerCase() === '/totem')
              }
            />
          </StudioErrorBoundary>
        </Suspense>
      </div>
    );
  }

  // Panel Alumno / Sala (Completamente separado e independiente del Panel Admin)
  if (activeTab === 'kiosco') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] font-sans antialiased selection:bg-[#B5654A] selection:text-[#FAF8F5]">
        <StudioToast toast={toast} onClose={closeToast} />
        <Suspense fallback={<FallbackLoader />}>
          <StudioErrorBoundary
            fallbackTitle="Panel Alumno / Sala"
            fallbackMessage="Ocurrió un inconveniente al cargar la estación de mostrador. Puedes reintentar o volver al Hub."
            onReset={() => setActiveTab('kiosco')}
            onNavigateHome={() => handleSelectTab('staff-hub')}
          >
            <StudentRoomPanel
              currentUser={currentUser}
              classes={classesList}
              bookings={bookingsList}
              clients={clientsList}
              onCheckInBooking={handleCheckInBooking}
              onAssignBed={handleAssignBed}
              onUpdateClientCredits={handleUpdateClientCredits}
              onGoToStaffHub={() => handleSelectTab('staff-hub')}
              onGoToAdminPanel={() => handleSelectTab('admin')}
              onExitToPublic={() => handleSelectTab('inicio')}
              onLogout={handleUserLogout}
            />
          </StudioErrorBoundary>
        </Suspense>
      </div>
    );
  }

  // Admin Panel Back-Office
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] font-sans antialiased selection:bg-[#B5654A] selection:text-[#FAF8F5]">
        <StudioToast toast={toast} onClose={closeToast} />
        <Suspense fallback={<FallbackLoader />}>
          <StudioErrorBoundary
            fallbackTitle="Panel de Control General (Back-Office)"
            fallbackMessage="Ocurrió un inconveniente al cargar el panel administrativo. Puedes reintentar o volver al Hub de Trabajadores."
            onReset={() => setActiveTab('admin')}
            onNavigateHome={() => handleSelectTab('staff-hub')}
          >
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
              onGoToStaffHub={() => handleSelectTab('staff-hub')}
            />
          </StudioErrorBoundary>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] font-sans antialiased flex flex-col selection:bg-[#B5654A] selection:text-[#FAF8F5]">
      <StudioToast toast={toast} onClose={closeToast} />

      {/* Sticky Banner de Simulación de Rol Alumna para el Owner */}
      {sessionStorage.getItem('firme_simulated_role') === 'client' && (
        <aside
          aria-label="Banner de modo de simulación de rol"
          className="sticky top-0 z-50 bg-gradient-to-r from-stone-950 via-[#B5654A] to-stone-950 text-white px-4 py-2.5 shadow-xl border-b border-[#B5654A]/50 flex items-center justify-between gap-3 text-xs backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="bg-white/20 text-white font-bold px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider shrink-0">
              🎭 Vista Previa: Alumna
            </span>
            <span className="font-medium text-stone-100 truncate">
              Previsualizando la experiencia web de alumna (reserva de clases reformer, créditos de packs, FIRME PASS QR y niveles).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('firme_simulated_role');
              handleSelectTab('admin');
            }}
            className="bg-white text-stone-950 hover:bg-stone-100 font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <span>↩️ Volver al Panel Owner</span>
          </button>
        </aside>
      )}

      {/* Header */}
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

      {/* Main Tab Panels */}
      <main className="flex-grow">
        {activeTab === 'inicio' && (
          <div
            id="tabpanel-inicio"
            role="tabpanel"
            aria-labelledby="tab-btn-inicio"
            className="animate-in fade-in duration-300"
          >
            <Hero
              onBookFirstClass={handleBookFirstClass}
              onViewSchedule={() => handleSelectTab('horarios')}
              onOpenBiomechanicsQuiz={() => setIsBiomechanicsQuizOpen(true)}
            />
            <BoutiqueSection
              userExp={currentUser?.exp ?? 1350}
              onRedeemWithExp={(productName, expCost) => handleSpendExp(expCost, productName)}
              onNotifyProduct={(productName) => {
                showToast(
                  'Producto Separado en Recepción',
                  `Hemos reservado "${productName}". Puedes abonarlo y recogerlo al llegar a tu sesión.`
                );
              }}
            />
            <Testimonials />
            <FaqSection />
            <LocationSection />
            <FinalCTA onBookClass={handleBookFirstClass} />
          </div>
        )}

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

        {activeTab === 'niveles' && (
          <div
            id="tabpanel-niveles"
            role="tabpanel"
            aria-labelledby="tab-btn-niveles"
            className="animate-in fade-in duration-300 py-4"
          >
            <Suspense fallback={<FallbackLoader />}>
              <StudentProgressTab
                currentUser={currentUser}
                onGainExp={handleGainExp}
                onExploreSchedule={() => handleSelectTab('horarios')}
                onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
              />
            </Suspense>
          </div>
        )}

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

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} />

      {/* Modals with Lazy Loading protected by Error Boundary */}
      <StudioErrorBoundary
        fallbackTitle="Ventana en Recuperación"
        fallbackMessage="Ocurrió un inconveniente temporal al cargar el modal. Puedes cerrarlo de manera segura sin interrumpir tu navegación."
        onReset={() => {
          setIsCheckInModalOpen(false);
          setIsEditProfileOpen(false);
          setBookingModalData(null);
          setIsGoogleAuthOpen(false);
          setSelectedPlanForCheckout(null);
          setIsStudentLevelOpen(false);
          setIsKioskModalOpen(false);
          setIsQrModalOpen(false);
          setIsBiomechanicsQuizOpen(false);
        }}
      >
        <Suspense fallback={null}>
        {bookingModalData && (
          <BookingModal
            data={bookingModalData}
            onClose={() => setBookingModalData(null)}
            onConfirmBooking={handleConfirmBooking}
            onViewMyClasses={() => handleSelectTab('mis-clases')}
            currentUser={currentUser}
            onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
          />
        )}

        {isCheckInModalOpen && (
          <ClientCheckInModal
            isOpen={isCheckInModalOpen}
            onClose={() => {
              setIsCheckInModalOpen(false);
              setScannedDniParam(null);
              setScannedNameParam(null);
            }}
            currentUser={currentUser}
            userBookings={bookingsList.filter((b) => {
              if (!currentUser || !b) return false;
              const userDni = currentUser.dni?.trim();
              const userEmail = currentUser.email?.trim().toLowerCase();
              const userFirstName = (currentUser.name || '').trim().toLowerCase().split(' ')[0];

              if (userDni && b.clientDni && b.clientDni === userDni) return true;
              if (userEmail && b.clientEmail && b.clientEmail.toLowerCase() === userEmail) return true;
              if (userFirstName && b.clientName && b.clientName.toLowerCase().includes(userFirstName)) return true;
              return false;
            })}
            allBookings={bookingsList}
            scannedDni={scannedDniParam}
            scannedName={scannedNameParam}
            onOpenGoogleAuth={() => {
              setIsCheckInModalOpen(false);
              setIsGoogleAuthOpen(true);
            }}
            onLogout={handleUserLogout}
            onPerformCheckIn={handlePerformCheckIn}
            onOpenEditProfile={() => {
              setIsCheckInModalOpen(false);
              setIsEditProfileOpen(true);
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
        )}

        {isEditProfileOpen && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            currentUser={currentUser}
            onSave={handleSaveProfile}
          />
        )}

        {isGoogleAuthOpen && (
          <GoogleAuthModal
            isOpen={isGoogleAuthOpen}
            onClose={() => {
              setIsGoogleAuthOpen(false);
              setPendingBookingAction(null);
              setAuthPurpose('');
              sessionStorage.setItem('firme_quick_auth_dismissed', 'true');
            }}
            onSuccess={handleAuthSuccess}
            purpose={authPurpose}
            initialMode={authInitialModality}
          />
        )}

        {selectedPlanForCheckout !== null && (
          <PlanCheckoutModal
            isOpen={selectedPlanForCheckout !== null}
            plan={selectedPlanForCheckout}
            onClose={() => setSelectedPlanForCheckout(null)}
            currentUser={currentUser}
            onOpenGoogleAuth={() => setIsGoogleAuthOpen(true)}
            onPaymentSuccess={handlePlanPaymentSuccess}
          />
        )}

        {isLevelModalOpen && (
          <StudentLevelModal
            isOpen={isLevelModalOpen}
            onClose={() => setIsLevelModalOpen(false)}
            currentUser={currentUser}
            onGainExp={handleGainExp}
          />
        )}

        {isKioskModalOpen && (
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
        )}

        {isQrModalOpen && (
          <ReceptionQrModal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
          />
        )}

        {isBiomechanicsQuizOpen && (
          <BiomechanicsQuizModal
            isOpen={isBiomechanicsQuizOpen}
            onClose={() => setIsBiomechanicsQuizOpen(false)}
            onSelectSchedule={() => {
              setIsBiomechanicsQuizOpen(false);
              handleSelectTab('horarios');
            }}
          />
        )}

        <AiAssistantWidget
          onNavigateToSchedule={() => handleSelectTab('horarios')}
          onOpenBiomechanicsQuiz={() => setIsBiomechanicsQuizOpen(true)}
        />
      </Suspense>
      </StudioErrorBoundary>

      {/* Floating Action Buttons */}
      <FloatingAdminButton
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />
    </div>
  );
}
