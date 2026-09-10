import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  LayoutDashboard,
  Calendar,
  Users,
  Wallet,
  Receipt,
  Target,
  BarChart3,
  Settings,
  Unlock,
  Lock,
  Key,
  Eye,
  EyeOff,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Menu,
  X,
  MapPin,
  Clock,
  ChevronRight,
  ChevronDown,
  Activity,
  Server,
  Smartphone,
  MessageSquare,
  QrCode,
  Trash2,
  Image as ImageIcon,
  Store,
} from 'lucide-react';
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
  PREDEFINED_STAFF,
  StaffAccount,
} from '../types';

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
  onGoToReceptionDesk?: () => void;
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

const DEFAULT_ADMIN_KEY = 'firme2026';

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
  onGoToReceptionDesk,
  onGoToStaffHub,
}) => {
  const isOwnerDev = currentUser?.role === 'owner_dev';
  const isAdmin = currentUser?.role === 'admin';
  const isReceptionist = currentUser?.role === 'receptionist';
  const isStaff = isOwnerDev || isAdmin;

  // Authentication state (strict: receptionist can never authenticate as admin)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (isReceptionist) return false;
    if (currentUser?.role === 'owner_dev' || currentUser?.role === 'admin') {
      return true;
    }
    return sessionStorage.getItem('firme_admin_logged') === 'true';
  });
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active sub-tab
  const [currentSubTab, setCurrentSubTab] = useState<AdminSubTab>(initialSubTab || 'dashboard');

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Staff switcher dropdown state
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);

  // Password change state
  const [currentKeyInput, setCurrentKeyInput] = useState('');
  const [newKeyInput, setNewKeyInput] = useState('');
  const [keyChangeSuccess, setKeyChangeSuccess] = useState('');
  const [keyChangeError, setKeyChangeError] = useState('');

  // Toast feedback
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setAdminNotification(msg);
    setTimeout(() => setAdminNotification(null), 3500);
  };

  // Sync auth state if currentUser changes
  useEffect(() => {
    if (currentUser?.role === 'owner_dev' || currentUser?.role === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('firme_admin_logged', 'true');
    }
  }, [currentUser]);

  // Restrict 'backend' tab if user is not Owner Dev (e.g. Soni or Keyla)
  useEffect(() => {
    if (!isOwnerDev && currentSubTab === 'backend') {
      setCurrentSubTab('dashboard');
      showNotification('Acceso restringido: El módulo Backend & APIs es exclusivo para Valentino (Owner Dev).');
    }
  }, [isOwnerDev, currentSubTab]);

  const getStoredPassword = () => {
    return localStorage.getItem('firme_admin_password') || DEFAULT_ADMIN_KEY;
  };

  const handleSelectStaffQuickLogin = (staff: StaffAccount) => {
    // Restriccion estricta: Solo el Owner Dev (Valentino) puede alternar cuentas
    if (isAuthenticated && !isOwnerDev) {
      showNotification('Acceso denegado: Solo el Owner tiene autorizacion para alternar entre cuentas.');
      return;
    }

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
    setAuthError('');
    showNotification(`Sesión iniciada como ${staff.name} (${staff.roleTitle})`);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = getStoredPassword();
    if (inputPassword.trim() === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('firme_admin_logged', 'true');
      if (!currentUser || currentUser.role === 'client') {
        const defaultStaff: AuthUser = {
          id: 'staff-valentino',
          name: 'Valentino',
          email: 'tinoykz@gmail.com',
          role: 'owner_dev',
          roleTitle: 'Owner / Lead Developer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          phone: '+51 981 223 330',
          dni: '70112233',
          provider: 'google',
          creditsLeft: 99,
          experienceLevel: 'Avanzado',
          healthConditions: ['Ninguna'],
        };
        localStorage.setItem('firme_auth_user', JSON.stringify(defaultStaff));
        if (onUpdateCurrentUser) onUpdateCurrentUser(defaultStaff);
      }
      setAuthError('');
      setInputPassword('');
    } else {
      setAuthError('Contraseña incorrecta. Acceso restringido al personal del estudio.');
    }
  };

  const handleQuickDemoLogin = () => {
    const pass = getStoredPassword();
    setInputPassword(pass);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('firme_admin_logged');
    localStorage.removeItem('firme_auth_user');
    if (onUpdateCurrentUser) {
      onUpdateCurrentUser(null);
    }
    setInputPassword('');
    setAuthError('');
    onExitToPublic();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStoredPassword();
    if (currentKeyInput !== current) {
      setKeyChangeError('La contraseña actual no coincide.');
      setKeyChangeSuccess('');
      return;
    }

    if (newKeyInput.trim().length < 4) {
      setKeyChangeError('La nueva contraseña debe tener al menos 4 caracteres.');
      setKeyChangeSuccess('');
      return;
    }

    localStorage.setItem('firme_admin_password', newKeyInput.trim());
    setKeyChangeSuccess('¡Contraseña actualizada exitosamente!');
    setKeyChangeError('');
    setCurrentKeyInput('');
    setNewKeyInput('');
    showNotification('Clave de acceso de administrador actualizada');
  };

  // -------------------------------------------------------------
  // ESCUDO DE SEGURIDAD ESTRICTO: RECEPCIONISTA BLOQUEADA DE ADMIN GENERAL
  // -------------------------------------------------------------
  if (isReceptionist) {
    return (
      <div className="min-h-screen flex flex-col bg-[#141210] text-[#FAF8F5]">
        <header className="w-full bg-[#1A1815] border-b border-[#2C2723] px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FAF8F5] p-0.5 border border-[#B5654A] flex items-center justify-center shrink-0">
              <img
                src="/firme-studio-logo.svg"
                alt="FIRME STUDIO"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-[#FAF8F5] block">
                FIRME STUDIO · Control de Acceso
              </span>
              <span className="text-[10px] text-[#B5654A] font-medium">
                Panel Administrativo General Protegido (SJL)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onExitToPublic}
            className="px-3.5 py-1.5 text-xs font-medium text-[#D8D2C8] hover:text-white bg-[#26221E] hover:bg-[#322C27] border border-[#3C3630] rounded-lg transition-colors cursor-pointer"
          >
            ← Volver a la Web
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 bg-[#141210]">
          <div className="max-w-md w-full bg-[#FAF8F5] text-[#1A1815] border border-[#E4DED4] rounded-2xl p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300">
              <Lock className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h2 className="font-fraunces text-2xl font-bold text-[#1A1815]">Acceso Restringido al Admin General</h2>
              <p className="text-xs text-[#6B655C] mt-2 leading-relaxed">
                Hola, <strong>{currentUser?.name || 'Camila'}</strong>. El Panel Admin General (finanzas, reportes de facturación, egresos y configuración de sistema) es de acceso exclusivo para Owner y Administradoras.
              </p>
            </div>
            <div className="p-4 bg-[#FAF2E8] border border-[#B5654A]/30 rounded-xl text-left text-xs space-y-1">
              <div className="font-bold text-[#B5654A]">Tu espacio de trabajo autorizado:</div>
              <div className="text-[#6B655C]">Mostrador Presencial: Altas express, Cobro Yape/POS y Check-in de Camas 1-8.</div>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onGoToReceptionDesk}
                className="w-full py-3 px-4 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4" />
                <span>Ir a mi Mostrador Presencial</span>
              </button>
              <button
                type="button"
                onClick={onExitToPublic}
                className="w-full py-2 px-4 rounded-xl bg-[#E4DED4] hover:bg-[#DDD5C9] text-[#1A1815] text-xs font-semibold transition-colors cursor-pointer"
              >
                Ir a la Web Pública
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 1: GATE / LOGIN SCREEN (PROTECTED)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
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

            {/* Quick Staff Selection */}
            <div className="mb-5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B655C] block text-left">
                Acceso Directo por Cuenta Staff:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PREDEFINED_STAFF.map((staff) => (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleSelectStaffQuickLogin(staff)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer group ${
                      staff.role === 'owner_dev'
                        ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A]/60 hover:border-[#B5654A]'
                        : 'bg-white hover:bg-[#F1ECE5] border-[#E4DED4] text-[#1A1815]'
                    }`}
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-8 h-8 rounded-full object-cover mx-auto mb-1 border border-[#DDD5C9]"
                    />
                    <div className="text-xs font-bold truncate">{staff.name}</div>
                    <div
                      className={`text-[9px] font-semibold uppercase tracking-wider ${
                        staff.role === 'owner_dev' ? 'text-[#B5654A]' : 'text-emerald-700'
                      }`}
                    >
                      {staff.role === 'owner_dev' ? 'Owner Dev' : 'Admin'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E4DED4]" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-[#FAF8F5] px-2 text-[#6B655C] font-semibold">o con contraseña</span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#6B655C] mb-1.5"
                >
                  Contraseña de Administrador
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
                    placeholder="Introduce tu clave..."
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-sm text-[#1A1815] placeholder-[#6B655C]/50 focus:outline-hidden focus:ring-2 focus:ring-[#B5654A] focus:border-transparent transition-all pr-11"
                    autoFocus
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
                className="w-full bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] py-3.5 rounded-xl text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Ingresar al Panel de Gestión</span>
              </button>
            </form>

            {/* Quick Demo Login */}
            <div className="mt-6 pt-5 border-t border-[#E4DED4] text-center">
              <p className="text-[11px] text-[#6B655C] mb-2">
                Clave de acceso predeterminada de la sede:
              </p>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#EFE9DF] hover:bg-[#E4DED4] text-[#1A1815] px-3.5 py-1.5 rounded-lg border border-[#DDD5C9] transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-[#B5654A]" />
                <span>{getStoredPassword()}</span>
                <span className="text-[10px] text-[#B5654A] ml-1 font-sans font-medium">(Autocompletar)</span>
              </button>
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
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD WITH SIDEBAR
  // -------------------------------------------------------------
  interface NavItemConfig {
    key: AdminSubTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  const NAV_GROUPS: { groupTitle: string; items: NavItemConfig[] }[] = [
    {
      groupTitle: 'RECEPCIÓN & SALA EN VIVO',
      items: [
        {
          key: 'kiosco',
          label: 'Kiosco Check-in',
          description: 'Validación DNI y asignación de cama',
          icon: Smartphone,
          badge: 'Express',
          badgeColor: 'bg-[#B5654A] text-white',
        },
        {
          key: 'instructor',
          label: 'Modo Instructora',
          description: 'Vista tablet, 8 camas y alertas',
          icon: Activity,
          badge: 'Tablet Sala',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
        },
      ],
    },
    {
      groupTitle: 'OPERACIÓN & AGENDA',
      items: [
        {
          key: 'dashboard',
          label: 'Dashboard General',
          description: 'Métricas, KPIs y alertas',
          icon: LayoutDashboard,
        },
        {
          key: 'agenda',
          label: 'Agenda & Horarios',
          description: 'Sesiones y mapa de camas',
          icon: Calendar,
          badge: classes.length,
          badgeColor: 'bg-[#B5654A] text-white',
        },
        {
          key: 'whatsapp',
          label: 'WhatsApp & Avisos',
          description: 'Recordatorios 3h y cancelaciones',
          icon: MessageSquare,
          badge: 'Auto',
          badgeColor: 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40',
        },
        {
          key: 'clientes',
          label: 'Clientes CRM',
          description: 'Directorio, créditos y fichas',
          icon: Users,
          badge: clients.length,
          badgeColor: 'bg-[#E4DED4] text-[#1A1815]',
        },
        {
          key: 'caja',
          label: 'Caja Diaria',
          description: 'Ingresos, cobros y comprobantes',
          icon: Wallet,
          badge: cashRegister.isOpen ? 'Abierta' : 'Cerrada',
          badgeColor: cashRegister.isOpen ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
        },
      ],
    },
    {
      groupTitle: 'FINANZAS Y CRECIMIENTO',
      items: [
        {
          key: 'gastos',
          label: 'Gastos Operativos',
          description: 'Alquiler, sueldos y servicios',
          icon: Receipt,
          badge: expenses.filter((e) => e.status === 'pendiente').length || undefined,
          badgeColor: 'bg-amber-500 text-black',
        },
        {
          key: 'captacion',
          label: 'Captación Leads',
          description: 'Embudo comercial y WhatsApp',
          icon: Target,
          badge: leads.filter((l) => l.status === 'nuevo').length || undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        {
          key: 'reportes',
          label: 'Reportes & Export',
          description: 'Estado de resultados y CSV',
          icon: BarChart3,
        },
      ],
    },
    {
      groupTitle: 'CONTENIDO & MULTIMEDIA',
      items: [
        {
          key: 'banners' as AdminSubTab,
          label: 'Imágenes & Portadas',
          description: 'Carrusel de 4 min, Hero y fotos',
          icon: ImageIcon,
          badge: '4 min',
          badgeColor: 'bg-[#B5654A] text-white',
        },
      ],
    },
    {
      groupTitle: 'SISTEMA',
      items: [
        ...(isOwnerDev
          ? [
              {
                key: 'backend' as AdminSubTab,
                label: 'Backend & IA API',
                description: 'Arquitectura, endpoints y Gemini',
                icon: Server,
                badge: 'Owner Dev',
                badgeColor: 'bg-[#B5654A] text-white',
              },
            ]
          : []),
        {
          key: 'seguridad' as AdminSubTab,
          label: 'Ajustes & Clave',
          description: 'Parámetros del estudio',
          icon: Settings,
        },
      ],
    },
  ];

  // Helper to find current sub-tab info
  const currentGroup = NAV_GROUPS.find((g) => g.items.some((it) => it.key === currentSubTab));
  const allNavItems = NAV_GROUPS.flatMap((g) => g.items);
  const currentNav = allNavItems.find((item) => item.key === currentSubTab) || allNavItems[0];
  const currentGroupTitle = currentGroup?.groupTitle || 'OPERACIÓN';

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row text-[#1A1815]">
      {/* Toast Alert */}
      {adminNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#1A1815] text-[#FAF8F5] px-4 py-3 rounded-xl shadow-2xl border border-[#B5654A] text-xs flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#B5654A]" />
          <span>{adminNotification}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* =========================================================
          ELEGANT ADMIN SIDEBAR
          ========================================================= */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-40 w-72 bg-[#1A1815] text-[#FAF8F5] flex flex-col justify-between border-r border-[#2C2723] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 h-screen shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header: Brand & Location */}
        <div className="p-5 border-b border-[#2C2723]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FAF8F5] p-1 border border-[#B5654A] flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src="/firme-studio-logo.svg"
                  alt="FIRME STUDIO"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="font-fraunces text-base font-semibold tracking-wide text-[#FAF8F5]">
                  FIRME STUDIO
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-[#B5654A] font-medium">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>Sede Lima - SJL</span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1 text-[#8C8479] hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick status bar */}
          <div className="mt-4 pt-3 border-t border-[#2C2723]/60 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sala Activa
            </span>
            <span className="text-[#8C8479] font-mono">
              8 Allegro 2
            </span>
          </div>

          {/* Active staff user in sidebar */}
          <div className="mt-2.5 pt-2.5 border-t border-[#2C2723]/40 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOwnerDev ? 'bg-[#B5654A]' : 'bg-emerald-400'}`} />
              <span className="font-semibold text-[#FAF8F5]">
                {currentUser?.name || (isOwnerDev ? 'Valentino' : 'Soni')}
              </span>
            </div>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${
                isOwnerDev
                  ? 'bg-[#B5654A] text-white'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              }`}
            >
              {isOwnerDev ? 'Owner Dev' : 'Admin'}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          {/* Direct link to Reception Desk Panel */}
          {onGoToReceptionDesk && (
            <div className="pb-2 border-b border-[#2C2723]/60">
              <button
                type="button"
                onClick={onGoToReceptionDesk}
                className="w-full py-2.5 px-3 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-bold flex items-center justify-between transition-all shadow-md cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Panel de Registros</span>
                </span>
                <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md uppercase font-mono">
                  Presencial
                </span>
              </button>
            </div>
          )}

          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#8C8479]">
                {group.groupTitle}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSubTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setCurrentSubTab(item.key);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full group px-3 py-2.5 rounded-xl text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#B5654A] text-white shadow-md font-semibold'
                        : 'text-[#D8D2C8] hover:bg-[#282420] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#26221E] text-[#8C8479] group-hover:text-[#FAF8F5]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs truncate">{item.label}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? 'text-white/80' : 'text-[#8C8479]'
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                          item.badgeColor || 'bg-white/20 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Quick Actions & Exit */}
        <div className="p-4 border-t border-[#2C2723] bg-[#141210] space-y-2.5">
          <button
            type="button"
            onClick={onExitToPublic}
            className="w-full px-3 py-2 rounded-xl bg-[#26221E] hover:bg-[#322C27] text-[#FAF8F5] text-xs font-medium transition-colors border border-[#3C3630] flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#B5654A] group-hover:text-white transition-colors" />
              <span>Ver Web Alumnos</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8C8479]" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-200 text-xs font-medium transition-colors border border-red-900/40 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Cerrar Sesión</span>
            </div>
            <span className="text-[10px] text-red-400 uppercase font-mono">Salir</span>
          </button>
        </div>
      </aside>

      {/* =========================================================
          MAIN APPLICATION WORKSPACE (WITH TOPBAR & ACTIVE MODULE)
          ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E4DED4] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
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
                {currentNav.label}
              </h1>
            </div>
          </div>

          {/* Top Bar Contextual Badges & Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick button to Reception Desk Panel */}
            {onGoToReceptionDesk && (
              <button
                type="button"
                onClick={onGoToReceptionDesk}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-md"
                title="Ir al Panel de Registros Presencial (Atención Counter SJL)"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">⚡ Panel de Registros</span>
                <span className="sm:hidden">⚡ Registros</span>
              </button>
            )}

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
              onClick={() => setCurrentSubTab('caja')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                cashRegister.isOpen
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Caja: {cashRegister.isOpen ? 'Abierta' : 'Cerrada'}</span>
            </button>

            {/* Active Staff Identity & 1-Click Switcher in Topbar (Exclusivo Owner) */}
            <div className="relative">
              {isOwnerDev ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStaffDropdownOpen(!staffDropdownOpen)}
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
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs ml-0.5 bg-[#B5654A] text-white">
                      OWNER DEV
                    </span>
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
                                handleSelectStaffQuickLogin(staff);
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
                    ADMIN
                  </span>
                </div>
              )}
            </div>

            {/* QR Mostrador Button */}
            {onOpenQrModal && (
              <button
                type="button"
                onClick={onOpenQrModal}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#DDD5C9] hover:bg-[#F1ECE5] hover:border-[#B5654A] text-[#1A1815] rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                title="Abrir QR y Enlace Único de Registro para Alumnas"
              >
                <QrCode className="w-3.5 h-3.5 text-[#B5654A]" />
                <span className="hidden md:inline">QR Mostrador</span>
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

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
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
            />
          )}

          {/* 0.1 MODO INSTRUCTORA (TABLET DE SALA) */}
          {currentSubTab === 'instructor' && (
            <AdminInstructorTab
              classes={classes}
              bookings={bookings}
              clients={clients}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onAssignBed={onAssignBed}
            />
          )}

          {/* 0.2 WHATSAPP & AVISOS AUTOMATIZADOS */}
          {currentSubTab === 'whatsapp' && (
            <AdminWhatsAppTab
              bookings={bookings}
              clients={clients}
              leads={leads}
              classes={classes}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onUpdateClientCredits={onUpdateClientCredits}
            />
          )}

          {/* 1. DASHBOARD GENERAL */}
          {currentSubTab === 'dashboard' && (
            <AdminDashboardTab
              classes={classes}
              bookings={bookings}
              clients={clients}
              transactions={transactions}
              expenses={expenses}
              leads={leads}
              onNavigateTab={setCurrentSubTab}
            />
          )}

          {/* 2. AGENDA & HORARIOS */}
          {currentSubTab === 'agenda' && (
            <AdminAgendaTab
              classes={classes}
              bookings={bookings}
              clients={clients}
              onAddClass={onAddClass}
              onUpdateClass={onUpdateClass}
              onDeleteClass={onDeleteClass}
              onUpdateSpots={onUpdateSpots}
              onAddManualBooking={onAddManualBooking}
              onUpdateBookingStatus={onUpdateBookingStatus}
            />
          )}

          {/* 3. CLIENTES CRM */}
          {currentSubTab === 'clientes' && (
            <AdminClientsTab
              clients={clients}
              onAddClient={onAddClient}
              onUpdateClient={onUpdateClient}
              onDeleteClient={onDeleteClient}
            />
          )}

          {/* 4. CAJA DIARIA */}
          {currentSubTab === 'caja' && (
            <AdminCashTab
              transactions={transactions}
              cashRegister={cashRegister}
              onAddTransaction={onAddTransaction}
              onUpdateTransaction={onUpdateTransaction}
              onDeleteTransaction={onDeleteTransaction}
              onToggleRegister={onToggleCashRegister}
            />
          )}

          {/* 5. GASTOS */}
          {currentSubTab === 'gastos' && (
            <AdminExpensesTab
              expenses={expenses}
              onAddExpense={onAddExpense}
              onUpdateExpense={onUpdateExpense}
              onDeleteExpense={onDeleteExpense}
              onUpdateExpenseStatus={onUpdateExpenseStatus}
            />
          )}

          {/* 6. CAPTACIÓN / LEADS */}
          {currentSubTab === 'captacion' && (
            <AdminLeadsTab
              leads={leads}
              onAddLead={onAddLead}
              onUpdateLead={onUpdateLead}
              onDeleteLead={onDeleteLead}
              onUpdateLeadStatus={onUpdateLeadStatus}
              onConvertLeadToClient={onConvertLeadToClient}
            />
          )}

          {/* 7. REPORTES & EXPORTACIÓN */}
          {currentSubTab === 'reportes' && (
            <AdminReportsTab
              classes={classes}
              clients={clients}
              transactions={transactions}
              expenses={expenses}
              leads={leads}
            />
          )}

          {/* 7.5 CONTENIDO & MULTIMEDIA (CARRUSEL 4 MINUTOS) */}
          {currentSubTab === 'banners' && <AdminBannersTab />}

          {/* 8. BACKEND & SERVICIOS API */}
          {currentSubTab === 'backend' && <AdminBackendTab />}

          {/* 9. SEGURIDAD & AJUSTES */}
          {currentSubTab === 'seguridad' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Card 0: Staff Accounts Overview */}
              <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#B5654A]" />
                    <h2 className="font-fraunces text-xl font-medium text-[#1A1815]">
                      Cuentas Oficiales del Equipo Staff (Owner & Admins)
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#6B655C]">
                    Clave de acceso predeterminada: <strong className="text-[#B5654A] font-mono">firme2026</strong>
                  </span>
                </div>

                <p className="text-xs text-[#6B655C] mb-5 leading-relaxed">
                  Perfiles configurados para la gestión operativa y técnica del estudio. El cambio entre cuentas está reservado exclusivamente para el perfil Owner (Valentino). Las administradoras disponen de una sesión fija asignada.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PREDEFINED_STAFF.map((staff) => {
                    const isStaffOwnerDev = staff.role === 'owner_dev';
                    const isCurrent =
                      currentUser?.id === staff.id ||
                      (isStaffOwnerDev && isOwnerDev) ||
                      currentUser?.email?.toLowerCase() === staff.email.toLowerCase() ||
                      currentUser?.dni === staff.dni;
                    return (
                      <div
                        key={staff.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'bg-[#1A1815] text-[#FAF8F5] border-[#B5654A] shadow-md'
                            : 'bg-white border-[#DDD5C9] text-[#1A1815]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className={`w-12 h-12 rounded-full object-cover border-2 shrink-0 ${
                                isStaffOwnerDev ? 'border-[#B5654A]' : 'border-[#DDD5C9]'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className={`font-semibold text-sm truncate ${isCurrent ? 'text-[#FAF8F5]' : 'text-[#1A1815]'}`}>
                                  {staff.name}
                                </h3>
                                <span
                                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm border ${
                                    isStaffOwnerDev
                                      ? 'bg-[#B5654A] text-white border-[#B5654A]'
                                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  }`}
                                >
                                  {isStaffOwnerDev ? 'Owner Dev' : 'Admin'}
                                </span>
                              </div>
                              <p className={`text-[10px] mt-0.5 font-medium ${isCurrent ? 'text-[#B5654A]' : 'text-[#8C8479]'}`}>
                                {staff.roleTitle}
                              </p>
                            </div>
                          </div>

                          <div className={`text-xs space-y-1 py-2 px-3 rounded-xl mb-3 ${isCurrent ? 'bg-[#2E2823]' : 'bg-[#FAF8F5]'}`}>
                            <div className="truncate">
                              <span className="opacity-70">Email:</span>{' '}
                              <strong className="font-mono text-[11px]">{staff.email}</strong>
                            </div>
                            {staff.secondaryEmail && (
                              <div className="truncate">
                                <span className="opacity-70">Secundario:</span>{' '}
                                <strong className="font-mono text-[11px]">{staff.secondaryEmail}</strong>
                              </div>
                            )}
                            <div>
                              <span className="opacity-70">DNI:</span>{' '}
                              <strong className="font-mono text-[11px]">{staff.dni}</strong>
                            </div>
                            <div>
                              <span className="opacity-70">Celular:</span>{' '}
                              <strong className="text-[11px]">{staff.phone}</strong>
                            </div>
                            <div>
                              <span className="opacity-70">Clave inicial:</span>{' '}
                              <strong className="font-mono text-[11px] text-[#B5654A]">{staff.defaultPassword || 'firme2026'}</strong>
                            </div>
                          </div>

                          <p className={`text-[10px] mb-4 leading-snug ${isCurrent ? 'text-[#C9C3BA]' : 'text-[#6B655C]'}`}>
                            {staff.description}
                          </p>
                        </div>

                        <div>
                          {isCurrent ? (
                            <div className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Sesión Activa Ahora</span>
                            </div>
                          ) : isOwnerDev ? (
                            <button
                              type="button"
                              onClick={() => handleSelectStaffQuickLogin(staff)}
                              className="w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 bg-[#B5654A] hover:bg-[#9A5340] text-white"
                            >
                              <span>Cambiar a {staff.name}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="w-full py-2 px-3 rounded-xl bg-[#F0ECE1] border border-[#DDD5C9] text-[#8C8479] text-xs font-medium flex items-center justify-center gap-1.5 select-none">
                              <Lock className="w-3.5 h-3.5 text-[#8C8479]" />
                              <span>Solo Owner puede alternar</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Password change */}
                <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-[#B5654A]" />
                    <h2 className="font-fraunces text-lg font-medium text-[#1A1815]">
                      Seguridad de Acceso
                    </h2>
                  </div>
                <p className="text-xs text-[#6B655C] mb-4 leading-relaxed">
                  Cambia la contraseña maestra con la que la administración ingresa al panel de FIRME STUDIO.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B655C] mb-1.5">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={currentKeyInput}
                      onChange={(e) => setCurrentKeyInput(e.target.value)}
                      placeholder="Introduce la contraseña actual..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-xs text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B655C] mb-1.5">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newKeyInput}
                      onChange={(e) => setNewKeyInput(e.target.value)}
                      placeholder="Mínimo 4 caracteres..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl text-xs text-[#1A1815] focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]"
                      required
                    />
                  </div>

                  {keyChangeError && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                      {keyChangeError}
                    </div>
                  )}

                  {keyChangeSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200">
                      {keyChangeSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#1A1815] hover:bg-black text-[#FAF8F5] py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    Actualizar Contraseña
                  </button>
                </form>
              </div>

              {/* Card 2: Studio info & Reset */}
              <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-[#B5654A]" />
                    <h2 className="font-fraunces text-lg font-medium text-[#1A1815]">
                      Parámetros del Estudio
                    </h2>
                  </div>
                  <p className="text-xs text-[#6B655C] mb-4 leading-relaxed">
                    Configuración operativa de la sede oficial de Pilates Boutique.
                  </p>

                  <div className="space-y-3 text-xs text-[#1A1815] bg-[#F1ECE5]/50 p-4 rounded-xl border border-[#E4DED4]">
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-[#6B655C]">Sede Activa:</span>
                      <span className="font-semibold text-[#B5654A]">LIMA - SAN JUAN DE LURIGANCHO</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-[#E4DED4]/60">
                      <span className="text-[#6B655C]">Equipamiento Principal:</span>
                      <span className="font-semibold">Allegro 2 Reformer Balanced Body</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-[#E4DED4]/60">
                      <span className="text-[#6B655C]">Capacidad Reformer:</span>
                      <span className="font-semibold">8 camas exclusivas por turno</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-[#E4DED4]/60">
                      <span className="text-[#6B655C]">Capacidad Mat:</span>
                      <span className="font-semibold">12 lugares</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-t border-[#E4DED4]/60">
                      <span className="text-[#6B655C]">Cancelación de Clase:</span>
                      <span className="font-semibold">Hasta 12 horas antes</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#E4DED4] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                    <div>
                      <h3 className="text-xs font-bold text-amber-950">
                        Empezar con Estudio en Limpio
                      </h3>
                      <p className="text-[11px] text-amber-800">
                        Elimina todas las alumnas de prueba, cobros y prospectos ficticios. Deja el estudio listo para producción real.
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
                      className="px-3.5 py-2 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-xs font-semibold text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar Datos Demo</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-semibold text-[#1A1815]">
                        Restablecer Datos de Demostración
                      </h3>
                      <p className="text-[11px] text-[#6B655C]">
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
                      className="px-3.5 py-2 rounded-xl bg-[#E4DED4] hover:bg-[#DDD5C9] text-xs font-semibold text-[#1A1815] transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Cargar Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};

