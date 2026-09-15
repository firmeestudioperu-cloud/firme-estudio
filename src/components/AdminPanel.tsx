import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  CashRegisterState,
  AdminSubTab,
  AuthUser,
  StaffAccount,
  UserRole,
} from '../types';

import { AdminGate } from './admin/AdminGate';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminHeader } from './admin/AdminHeader';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminAgendaTab } from './admin/AdminAgendaTab';
import { AdminClientsTab } from './admin/AdminClientsTab';
import { AdminCashTab } from './admin/AdminCashTab';
import { AdminExpensesTab } from './admin/AdminExpensesTab';
import { AdminLeadsTab } from './admin/AdminLeadsTab';
import { AdminReportsTab } from './admin/AdminReportsTab';
import { AdminBackendTab } from './admin/AdminBackendTab';
import { AdminKioskTab } from './admin/AdminKioskTab';
import { AdminInstructorTab } from './admin/AdminInstructorTab';
import { AdminWhatsAppTab } from './admin/AdminWhatsAppTab';
import { AdminBannersTab } from './admin/AdminBannersTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';
import { CameraQrScannerModal } from './CameraQrScannerModal';

interface AdminPanelProps {
  currentUser?: AuthUser | null;
  onUpdateCurrentUser?: (user: AuthUser | null) => void;
  classes: ClassSession[];
  bookings: BookingRecord[];
  clients: ClientProfile[];
  transactions: CashTransaction[];
  expenses: ExpenseRecord[];
  leads: LeadRecord[];
  cashRegister: CashRegisterState;
  onAddClass: (newClass: Omit<ClassSession, 'id'>) => void;
  onUpdateClass: (updatedClass: ClassSession) => void;
  onDeleteClass: (classId: string) => void;
  onUpdateSpots: (classId: string, delta: number) => void;
  onAddManualBooking: (booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'confirmada' | 'asistio' | 'cancelada') => void;
  onResetData: () => void;
  onExitToPublic: () => void;
  // Sub-modules handlers
  onAddClient: (client: Omit<ClientProfile, 'id'>) => void;
  onUpdateClient: (client: ClientProfile) => void;
  onDeleteClient?: (clientId: string) => void;
  onAddTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  onUpdateTransaction?: (tx: CashTransaction) => void;
  onDeleteTransaction?: (txId: string) => void;
  onToggleCashRegister: () => void;
  onAddExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  onUpdateExpense?: (expense: ExpenseRecord) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onUpdateExpenseStatus: (id: string, status: 'pagado' | 'pendiente') => void;
  onAddLead: (lead: Omit<LeadRecord, 'id' | 'createdAt'>) => void;
  onUpdateLead?: (lead: LeadRecord) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateLeadStatus: (id: string, status: LeadRecord['status']) => void;
  onConvertLeadToClient: (lead: LeadRecord) => void;
  // Express Check-in & WhatsApp handlers
  onCheckInBooking?: (booking: BookingRecord) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
  onUpdateClientCredits?: (clientId: string, credits: number) => void;
  onClearDemoData?: () => void;
  initialSubTab?: AdminSubTab;
  onOpenQrModal?: () => void;
  onGoToStaffHub?: () => void;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

class AdminErrorBoundary extends (React.Component as new (props: any) => any) {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error en módulo de administración:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-[#FAF8F5] border border-rose-200 rounded-2xl text-center space-y-4 my-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
              No se pudo cargar este módulo
            </h3>
            <p className="text-xs text-[#6B655C] max-w-sm mx-auto mt-1 leading-relaxed">
              Ocurrió un error inesperado al renderizar esta sección. Puedes volver al Dashboard sin perder tus datos.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-left max-w-lg mx-auto text-xs font-mono text-red-700 overflow-auto max-h-48 whitespace-pre-wrap">
                <strong>Error: {this.state.error.name} - {this.state.error.message}</strong>
                {this.state.error.stack && (
                  <div className="text-[10px] text-red-600 mt-1 opacity-80">{this.state.error.stack}</div>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 bg-[#B5654A] hover:bg-[#9A5340] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Volver al Dashboard</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_ADMIN_KEY = '30092023';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onUpdateCurrentUser,
  classes,
  bookings,
  clients,
  transactions,
  expenses,
  leads,
  cashRegister,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onUpdateSpots,
  onAddManualBooking,
  onUpdateBookingStatus,
  onResetData,
  onExitToPublic,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onToggleCashRegister,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateExpenseStatus,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onConvertLeadToClient,
  onCheckInBooking,
  onAssignBed,
  onUpdateClientCredits,
  onClearDemoData,
  initialSubTab,
  onOpenQrModal,
  onGoToStaffHub,
}) => {
  // Owner identity & Role simulation
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(() => {
    return (sessionStorage.getItem('firme_simulated_role') as UserRole) || null;
  });

  const isRealOwner =
    currentUser?.role === 'owner_dev' ||
    sessionStorage.getItem('firme_real_owner') === 'true';

  useEffect(() => {
    if (currentUser?.role === 'owner_dev') {
      sessionStorage.setItem('firme_real_owner', 'true');
    }
  }, [currentUser?.role]);

  const effectiveRole: UserRole = simulatedRole || currentUser?.role || 'owner_dev';

  const effectiveUser: AuthUser | null = currentUser
    ? {
        ...currentUser,
        role: effectiveRole,
        roleTitle:
          effectiveRole === 'owner_dev'
            ? 'Owner / Lead Developer'
            : effectiveRole === 'admin'
            ? 'Administración de Sede'
            : effectiveRole === 'receptionist'
            ? 'Recepcionista de Mostrador'
            : effectiveRole === 'instructor'
            ? 'Instructora Reformer'
            : 'Alumna / Estudiante',
      }
    : null;

  const isOwnerDev = effectiveRole === 'owner_dev';

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (currentUser?.role === 'owner_dev' || currentUser?.role === 'admin' || currentUser?.role === 'receptionist' || sessionStorage.getItem('firme_real_owner') === 'true') {
      return true;
    }
    return sessionStorage.getItem('firme_admin_logged') === 'true';
  });

  const [currentSubTab, setCurrentSubTab] = useState<AdminSubTab>(() => {
    const directSubTab = sessionStorage.getItem('firme_admin_subtab') as AdminSubTab;
    if (directSubTab) {
      sessionStorage.removeItem('firme_admin_subtab');
      return directSubTab;
    }
    return initialSubTab || 'dashboard';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminNotification, setAdminNotification] = useState<string | null>(null);
  const [isGlobalScannerOpen, setIsGlobalScannerOpen] = useState(false);

  const handleSelectSimulatedRole = (role: UserRole | null) => {
    if (!role || role === 'owner_dev') {
      setSimulatedRole(null);
      sessionStorage.removeItem('firme_simulated_role');
      showNotification('👑 Vista restaurada: Owner & Lead Developer (Control Total)');
      return;
    }

    setSimulatedRole(role);
    sessionStorage.setItem('firme_simulated_role', role);

    if (role === 'client') {
      showNotification('📱 Redirigiendo a vista de Alumna en la Web Pública...');
      setTimeout(() => {
        onExitToPublic();
      }, 300);
    } else if (role === 'receptionist') {
      setCurrentSubTab('kiosco');
      showNotification('🛎️ Vista de Recepcionista activada (Salas 1 & 2 + Kiosco QR)');
    } else if (role === 'instructor') {
      setCurrentSubTab('instructor');
      showNotification('🧘‍♀️ Vista de Instructora activada (Control de Camas 1-8)');
    } else if (role === 'admin') {
      setCurrentSubTab('dashboard');
      showNotification('🏢 Vista de Administración activada (Operación General)');
    }
  };

  const showNotification = (message: string) => {
    setAdminNotification(message);
    setTimeout(() => {
      setAdminNotification(null);
    }, 3500);
  };

  const handleGlobalQrScan = (data: { dni?: string; name?: string; memId?: string; raw: string }) => {
    const searchDni = (data.dni || data.memId || '').trim();
    if (!searchDni) {
      showNotification('⚠️ No se pudo identificar un DNI o código válido en el QR escaneado.');
      return;
    }

    const booking = bookings.find(
      (b) =>
        b.status !== 'cancelada' &&
        ((b.clientDni && b.clientDni === searchDni) ||
          (data.name && b.clientName?.toLowerCase() === data.name.toLowerCase()))
    );

    if (booking) {
      if (booking.status === 'asistio') {
        showNotification(
          `ℹ️ ${booking.clientName} ya registró su ingreso (Cama #${booking.bedNumber || 'Asignada'} - ${booking.className}).`
        );
        setIsGlobalScannerOpen(false);
        setCurrentSubTab('kiosco');
        return;
      }

      let assignedBed = booking.bedNumber;
      if (!assignedBed) {
        const classBookings = bookings.filter(
          (b) => b.classId === booking.classId && b.status !== 'cancelada' && b.bedNumber
        );
        const occupiedBeds = classBookings.map((b) => b.bedNumber as number);
        assignedBed = [1, 2, 3, 4, 5, 6, 7, 8].find((n) => !occupiedBeds.includes(n)) || 1;
      }

      const updatedBooking: BookingRecord = {
        ...booking,
        status: 'asistio',
        bedNumber: assignedBed,
        checkInTime: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };

      if (onAssignBed && !booking.bedNumber) {
        onAssignBed(booking.id, assignedBed);
      }

      if (onCheckInBooking) {
        onCheckInBooking(updatedBooking);
      } else {
        onUpdateBookingStatus(booking.id, 'asistio');
      }

      const cls = classes.find((c) => c.id === booking.classId);
      const roomLabel = booking.roomName || cls?.roomName || (cls?.classType === 'Reformer' ? 'Sala 1 (Principal)' : 'Sala 2 (Torre)');

      showNotification(
        `🎉 ¡Check-in confirmado para ${booking.clientName}! Cama Reformer #${assignedBed} en ${roomLabel} (${booking.className} - ${booking.classTime}h).`
      );
      setIsGlobalScannerOpen(false);
      setCurrentSubTab('kiosco');
      return;
    }

    const client = clients.find(
      (c) => c.dni === searchDni || (data.name && c.name?.toLowerCase() === data.name.toLowerCase())
    );

    if (client) {
      showNotification(
        `👤 Alumna encontrada: ${client.name} (DNI ${client.dni}). Redirigiendo a Kiosco para registro.`
      );
      setIsGlobalScannerOpen(false);
      setCurrentSubTab('kiosco');
      return;
    }

    showNotification(`❌ No se encontró reserva activa ni alumna con DNI / código: ${searchDni}`);
  };

  const getStoredPassword = (): string => {
    return localStorage.getItem('firme_admin_key') || DEFAULT_ADMIN_KEY;
  };

  const setStoredPassword = (pwd: string) => {
    localStorage.setItem('firme_admin_key', pwd);
  };

  const handleSelectStaffQuickLogin = (staff: StaffAccount) => {
    const authUser: AuthUser = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      roleTitle: staff.roleTitle,
      avatar: staff.avatar,
      provider: 'google',
      phone: staff.phone,
      dni: staff.dni,
      planName: staff.role === 'owner_dev' ? 'Owner Developer' : 'Administración Sede',
      creditsLeft: 99,
      experienceLevel: 'Avanzado',
      healthConditions: ['Ninguna'],
    };

    localStorage.setItem('firme_auth_user', JSON.stringify(authUser));
    sessionStorage.setItem('firme_admin_logged', 'true');
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(authUser);
    }
    setIsAuthenticated(true);
    showNotification(`Sesión iniciada como ${staff.name} (${staff.roleTitle})`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('firme_admin_logged');
    sessionStorage.removeItem('firme_simulated_role');
    sessionStorage.removeItem('firme_real_owner');
    localStorage.removeItem('firme_auth_user');
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(null);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: GATE / LOGIN SCREEN (PROTECTED)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <AdminGate
        onExitToPublic={onExitToPublic}
        onLoginSuccess={(user) => {
          if (onUpdateCurrentUser) onUpdateCurrentUser(user);
          setIsAuthenticated(true);
          showNotification(`Bienvenido/a, ${user.name} (${user.roleTitle || 'Staff'})`);
        }}
        getStoredPassword={getStoredPassword}
      />
    );
  }

  // Subtab Labels dictionary for the header title (10 consolidated modules)
  const SUBTAB_LABELS: Record<AdminSubTab, { label: string; group: string }> = {
    kiosco: { label: 'Panel Alumno/Sala', group: 'SALA & RECEPCIÓN' },
    agenda: { label: 'Agenda Semanal', group: 'SALA & RECEPCIÓN' },
    instructor: { label: 'Control Instructor', group: 'SALA & RECEPCIÓN' },
    whatsapp: { label: 'WhatsApp Alumnas', group: 'SALA & RECEPCIÓN' },
    clientes: { label: 'Directorio Clientes & Leads', group: 'CLIENTES & COMUNIDAD' },
    dashboard: { label: 'Reportes & Métricas', group: 'FINANZAS & VENTAS' },
    caja: { label: 'Caja Diaria POS', group: 'FINANZAS & VENTAS' },
    gastos: { label: 'Gastos Operativos', group: 'FINANZAS & VENTAS' },
    captacion: { label: 'Directorio Clientes & Leads', group: 'CLIENTES & COMUNIDAD' },
    reportes: { label: 'Reportes & Métricas', group: 'FINANZAS & VENTAS' },
    usuarios: { label: 'Gestión de Usuarios', group: 'ADMINISTRACIÓN & SISTEMA' },
    banners: { label: 'Configuración & Web', group: 'ADMINISTRACIÓN & SISTEMA' },
    backend: { label: 'Configuración & Web', group: 'ADMINISTRACIÓN & SISTEMA' },
    seguridad: { label: 'Configuración & Web', group: 'ADMINISTRACIÓN & SISTEMA' },
  };

  const currentNavInfo = SUBTAB_LABELS[currentSubTab] || {
    label: 'Panel Administrativo',
    group: 'OPERACIÓN',
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row text-[#1A1815]">
      {/* Toast Alert */}
      {adminNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A1815] text-[#FAF8F5] px-4 py-3 rounded-xl shadow-2xl border border-[#B5654A] text-xs flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#B5654A]" />
          <span>{adminNotification}</span>
        </div>
      )}

      {/* Navigation Sidebar */}
      <AdminSidebar
        currentSubTab={currentSubTab}
        onSelectSubTab={(tab) => setCurrentSubTab(tab)}
        currentUser={effectiveUser}
        isOwnerDev={isOwnerDev}
        cashRegister={cashRegister}
        expenses={expenses}
        leads={leads}
        mobileSidebarOpen={mobileSidebarOpen}
        onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
        onExitToPublic={onExitToPublic}
        onLogout={handleLogout}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Simulation Banner (Exclusivo cuando el Owner simula otro rol) */}
        {simulatedRole && simulatedRole !== 'owner_dev' && (
          <div className="sticky top-0 z-40 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-amber-100 border-b border-amber-500/40 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">
                Modo Vista Previa de Rol:
              </span>
              <span className="bg-amber-500/25 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-md font-bold text-xs">
                {effectiveUser?.roleTitle || simulatedRole}
              </span>
              <span className="hidden md:inline text-stone-300 text-[11px]">
                — Navegando con la interfaz y permisos específicos de este perfil
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSelectSimulatedRole('owner_dev')}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold px-3 py-1 rounded-lg text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
            >
              <span>↩️ Salir de Vista Previa (Restaurar Owner)</span>
            </button>
          </div>
        )}

        {/* Top App Bar */}
        <AdminHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          currentGroupTitle={currentNavInfo.group}
          currentNavLabel={currentNavInfo.label}
          cashRegister={cashRegister}
          onSelectSubTab={(tab) => setCurrentSubTab(tab)}
          isOwnerDev={isOwnerDev}
          isRealOwner={isRealOwner}
          simulatedRole={simulatedRole}
          onSelectSimulatedRole={handleSelectSimulatedRole}
          currentUser={effectiveUser}
          onSelectStaffQuickLogin={handleSelectStaffQuickLogin}
          onOpenQrModal={onOpenQrModal}
          onOpenScannerModal={() => setIsGlobalScannerOpen(true)}
          onExitToPublic={onExitToPublic}
          onGoToStaffHub={onGoToStaffHub}
        />

        {/* Content View Container */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          <AdminErrorBoundary onReset={() => setCurrentSubTab('dashboard')}>
            {/* 0. KIOSCO DE AUTO CHECK-IN & RECEPCIÓN */}
            {currentSubTab === 'kiosco' && (
              <AdminKioskTab
                classes={classes}
                bookings={bookings}
                clients={clients}
                onCheckInSuccess={(updatedBooking) => {
                  if (onCheckInBooking) {
                    onCheckInBooking(updatedBooking);
                  } else {
                    onUpdateBookingStatus(updatedBooking.id, 'asistio');
                  }
                }}
                onAssignBed={onAssignBed}
                onOpenQrModal={onOpenQrModal}
                onUpdateClientCredits={onUpdateClientCredits}
              />
            )}

            {/* 1. CONTROL DE INSTRUCTOR */}
            {currentSubTab === 'instructor' && (
              <AdminInstructorTab
                classes={classes}
                bookings={bookings}
                onCheckInBooking={onCheckInBooking}
                onAssignBed={onAssignBed}
                onUpdateBookingStatus={onUpdateBookingStatus}
                onAddManualBooking={onAddManualBooking}
              />
            )}

            {/* 2. ATENCIÓN DIRECTA WHATSAPP */}
            {currentSubTab === 'whatsapp' && (
              <AdminWhatsAppTab
                clients={clients}
                bookings={bookings}
                classes={classes}
              />
            )}

            {/* 3. AGENDA SEMANAL */}
            {currentSubTab === 'agenda' && (
              <AdminAgendaTab
                classes={classes}
                bookings={bookings}
                onAddClass={onAddClass}
                onUpdateClass={onUpdateClass}
                onDeleteClass={onDeleteClass}
                onUpdateSpots={onUpdateSpots}
                onAddManualBooking={onAddManualBooking}
                onUpdateBookingStatus={onUpdateBookingStatus}
              />
            )}

            {/* 4. CLIENTES & LEADS (CONSOLIDADO) */}
            {(currentSubTab === 'clientes' || currentSubTab === 'captacion') && (
              <AdminClientsTab
                clients={clients}
                onAddClient={onAddClient}
                onUpdateClient={onUpdateClient}
                onDeleteClient={onDeleteClient}
                leads={leads}
                onAddLead={onAddLead}
                onUpdateLead={onUpdateLead}
                onDeleteLead={onDeleteLead}
                onUpdateLeadStatus={onUpdateLeadStatus}
                onConvertLeadToClient={onConvertLeadToClient}
                initialSubView={currentSubTab === 'captacion' ? 'leads' : 'alumnas'}
              />
            )}

            {/* 5. CAJA DIARIA & POS */}
            {currentSubTab === 'caja' && (
              <AdminCashTab
                transactions={transactions}
                cashRegister={cashRegister}
                onAddTransaction={onAddTransaction}
                onUpdateTransaction={onUpdateTransaction}
                onDeleteTransaction={onDeleteTransaction}
                onToggleCashRegister={onToggleCashRegister}
              />
            )}

            {/* 6. GASTOS DE SEDE */}
            {currentSubTab === 'gastos' && (
              <AdminExpensesTab
                expenses={expenses}
                onAddExpense={onAddExpense}
                onUpdateExpense={onUpdateExpense}
                onDeleteExpense={onDeleteExpense}
                onUpdateExpenseStatus={onUpdateExpenseStatus}
              />
            )}

            {/* 7. REPORTES & MÉTRICAS (CONSOLIDADO CON DASHBOARD) */}
            {(currentSubTab === 'reportes' || currentSubTab === 'dashboard') && (
              <AdminReportsTab
                classes={classes}
                bookings={bookings}
                clients={clients}
                transactions={transactions}
                expenses={expenses}
                leads={leads}
                cashRegister={cashRegister}
                onNavigateTab={(tab) => setCurrentSubTab(tab)}
                onQuickOpenScannerModal={() => setIsGlobalScannerOpen(true)}
                onAddManualBooking={onAddManualBooking}
                onNavigateToSchedule={() => setCurrentSubTab('agenda')}
                initialSubView={currentSubTab === 'dashboard' ? 'dashboard' : 'finanzas'}
              />
            )}

            {/* 8. ADMINISTRACIÓN DE USUARIOS, STAFF & ROLES */}
            {currentSubTab === 'usuarios' && (
              <AdminUsersTab
                currentUser={currentUser || null}
                clients={clients}
                onUpdateCurrentUser={onUpdateCurrentUser}
                onUpdateClient={onUpdateClient}
              />
            )}

            {/* 9. CONFIGURACIÓN & WEB (CONSOLIDADO CON BANNERS Y BACKEND OWNER) */}
            {(currentSubTab === 'seguridad' || currentSubTab === 'banners' || currentSubTab === 'backend') && (
              <AdminSettingsTab
                currentUser={currentUser}
                isOwnerDev={isOwnerDev}
                onSelectStaffQuickLogin={handleSelectStaffQuickLogin}
                onResetData={onResetData}
                onClearDemoData={onClearDemoData}
                showNotification={showNotification}
                getStoredPassword={getStoredPassword}
                setStoredPassword={setStoredPassword}
                initialSubView={
                  currentSubTab === 'banners'
                    ? 'banners'
                    : currentSubTab === 'backend'
                    ? 'backend'
                    : 'sede'
                }
              />
            )}
          </AdminErrorBoundary>
        </main>
      </div>

      {/* Modal de Escáner QR con Cámara Global */}
      <CameraQrScannerModal
        isOpen={isGlobalScannerOpen}
        onClose={() => setIsGlobalScannerOpen(false)}
        onScanSuccess={handleGlobalQrScan}
        title="Escáner QR de Check-in"
        subtitle="Apunta la cámara al FIRME PASS de la alumna para validar su reserva y asignar cama Reformer automáticamente."
      />
    </div>
  );
};

export default AdminPanel;
