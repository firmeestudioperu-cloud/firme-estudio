export type DayOfWeek = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

export type DifficultyLevel = 'Principiante' | 'Intermedio' | 'Avanzado';

export type ClassType = 'Reformer' | 'Mat' | 'Suspensión';

export type MainTabType =
  | 'inicio'
  | 'horarios'
  | 'mis-clases'
  | 'niveles'
  | 'membresias'
  | 'profesores'
  | 'metodo'
  | 'admin'
  | 'registros-presencial'
  | 'staff-hub'
  | 'kiosco'
  | 'instructor'
  | 'registro';

export type AdminSubTab =
  | 'dashboard'
  | 'kiosco'
  | 'instructor'
  | 'whatsapp'
  | 'agenda'
  | 'clientes'
  | 'caja'
  | 'gastos'
  | 'captacion'
  | 'reportes'
  | 'backend'
  | 'banners'
  | 'seguridad';

export interface CarouselBanner {
  id: string;
  url: string;
  tag: string;
  title: string;
  subtitle: string;
  locationLabel?: string;
  capacityLabel?: string;
  isActive: boolean;
  order: number;
}

export interface CarouselSettings {
  intervalMinutes: number; // Por defecto: 4 minutos (240 segundos)
  autoPlay: boolean;
  showProgressBar: boolean;
}

export interface DayTab {
  key: DayOfWeek;
  shortLabel: string;
  fullLabel: string;
  dateLabel: string;
}

export interface BookingRecord {
  id: string;
  classId: string;
  className: string;
  classTime: string;
  classDay: DayOfWeek;
  instructor: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientDni?: string;
  status: 'confirmada' | 'asistio' | 'cancelada';
  bookedAt: string;
  bedNumber?: number; // Cama Reformer 1-8
  isWaitlist?: boolean;
  medicalAlert?: string;
  checkInTime?: string;
  whatsappReminderSent?: boolean;
  whatsappReminderTime?: string;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'recordatorio' | 'lista_espera' | 'post_prueba' | 'cancelacion';
  template: string;
  variables: string[];
}

export interface WhatsAppMessageLog {
  id: string;
  toName: string;
  toPhone: string;
  type: 'recordatorio' | 'lista_espera' | 'post_prueba' | 'cancelacion';
  sentAt: string;
  status: 'enviado' | 'simulado';
  content: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  currentPlan: string;
  planType: 'ilimitado' | 'pack' | 'clase_suelta' | 'prueba';
  creditsLeft: number;
  totalAttended: number;
  status: 'activo' | 'en_riesgo' | 'inactivo';
  joinDate: string;
  lastVisit: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  documentType?: 'dni' | 'ce' | 'pasaporte';
  birthDate?: string;
  gender?: 'femenino' | 'masculino' | 'otro';
  registrationMethod?: 'qr' | 'manual_smartfit' | 'manual_web' | 'whatsapp' | 'receptionist_desk';
}

export type PaymentMethod =
  | 'yape'
  | 'plin'
  | 'tarjeta_pos'
  | 'efectivo'
  | 'transferencia_bcp'
  | 'transferencia_bbva';

export interface CashTransaction {
  id: string;
  type: 'ingreso' | 'egreso';
  concept: string;
  category: 'membresia' | 'pack_clases' | 'clase_suelta' | 'tienda_calcetines' | 'bebidas' | 'otro';
  amount: number; // PEN (S/.)
  paymentMethod: PaymentMethod;
  clientName?: string;
  receiptNumber: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CashRegisterState {
  isOpen: boolean;
  openingAmount: number;
  openedAt?: string;
  closedAt?: string;
  cashierName: string;
}

export type DailyCashRegister = CashRegisterState;

export type ExpenseCategory =
  | 'alquiler_local'
  | 'pago_instructores'
  | 'mantenimiento_reformers'
  | 'servicios_luz_agua_wifi'
  | 'marketing_redes'
  | 'insumos_limpieza'
  | 'otros';

export interface ExpenseRecord {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number; // PEN (S/.)
  date: string;
  recipient: string;
  paymentMethod: PaymentMethod;
  status: 'pagado' | 'pendiente';
  receiptNumber?: string;
}

export type LeadStatus =
  | 'nuevo'
  | 'contactado'
  | 'prueba_agendada'
  | 'asistio_prueba'
  | 'convertido'
  | 'no_interesado';

export type LeadChannel =
  | 'instagram'
  | 'tiktok'
  | 'whatsapp'
  | 'web_organico'
  | 'recomendacion';

export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  channel: LeadChannel;
  interest: 'Reformer' | 'Mat' | 'Suspensión' | 'Todos';
  status: LeadStatus;
  trialDate?: string;
  notes?: string;
  createdAt: string;
}

export interface ClassSession {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: string;
  totalSpots: number;
  occupiedSpots: number;
  day: DayOfWeek;
  level: DifficultyLevel;
  classType: ClassType;
  focus: string;
  description?: string;
  isLocked?: boolean;
}

export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  certification: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  isPopular?: boolean;
  features: string[];
  ctaText: string;
}

export interface Testimonial {
  id: string;
  name: string;
  durationInStudio: string;
  quote: string;
}

export type BookingModalType = 'reserve' | 'waitlist' | null;

export interface BookingModalData {
  classSession: ClassSession;
  type: 'reserve' | 'waitlist';
  waitlistPosition?: number;
}

export type UserRole = 'owner_dev' | 'admin' | 'receptionist' | 'instructor' | 'client';

export interface RoleDefinition {
  id: UserRole;
  name: string;
  description: string;
  badgeLabel: string;
  canSwitchAccounts: boolean;
  canAccessBackend: boolean;
  canAccessAdminPanel: boolean;
  canManageCashRegister: boolean;
  canManageSchedule: boolean;
  canCheckInClients: boolean;
  allowedViews: string[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  owner_dev: {
    id: 'owner_dev',
    name: 'Owner & Lead Developer',
    description: 'Control absoluto del sistema, infraestructura, base de datos, APIs y alternancia exclusiva entre perfiles.',
    badgeLabel: 'OWNER DEV',
    canSwitchAccounts: true,
    canAccessBackend: true,
    canAccessAdminPanel: true,
    canManageCashRegister: true,
    canManageSchedule: true,
    canCheckInClients: true,
    allowedViews: ['owner_dev', 'admin', 'receptionist', 'instructor', 'client'],
  },
  admin: {
    id: 'admin',
    name: 'Administración de Sede',
    description: 'Gestión operativa diaria: agenda de 8 camas reformer, caja diaria, WhatsApp, cobros y clientes.',
    badgeLabel: 'ADMIN',
    canSwitchAccounts: false,
    canAccessBackend: false,
    canAccessAdminPanel: true,
    canManageCashRegister: true,
    canManageSchedule: true,
    canCheckInClients: true,
    allowedViews: ['admin', 'receptionist', 'instructor', 'client'],
  },
  receptionist: {
    id: 'receptionist',
    name: 'Recepcionista de Mostrador',
    description: 'Atención presencial en sede SJL: alta rápida de clientas, cobros (Yape/POS/Efectivo), check-in en vivo y caja rápida.',
    badgeLabel: 'RECEPCIÓN',
    canSwitchAccounts: false,
    canAccessBackend: false,
    canAccessAdminPanel: false,
    canManageCashRegister: true,
    canManageSchedule: false,
    canCheckInClients: true,
    allowedViews: ['receptionist', 'client'],
  },
  instructor: {
    id: 'instructor',
    name: 'Instructora Reformer',
    description: 'Control en sala de clases: visualización de alumnas por cama, notas médicas y asistencia.',
    badgeLabel: 'INSTRUCTORA',
    canSwitchAccounts: false,
    canAccessBackend: false,
    canAccessAdminPanel: false,
    canManageCashRegister: false,
    canManageSchedule: false,
    canCheckInClients: true,
    allowedViews: ['instructor', 'client'],
  },
  client: {
    id: 'client',
    name: 'Alumna / Estudiante',
    description: 'Reserva de clases reformer, adquisición de planes/membresías, créditos disponibles y nivel.',
    badgeLabel: 'ALUMNA',
    canSwitchAccounts: false,
    canAccessBackend: false,
    canAccessAdminPanel: false,
    canManageCashRegister: false,
    canManageSchedule: false,
    canCheckInClients: false,
    allowedViews: ['client'],
  },
};

export function isOwner(role?: UserRole): boolean {
  return role === 'owner_dev';
}

export function isAdmin(role?: UserRole): boolean {
  return role === 'admin';
}

export function isReceptionist(role?: UserRole): boolean {
  return role === 'receptionist';
}

export function isStaffRole(role?: UserRole): boolean {
  return role === 'owner_dev' || role === 'admin' || role === 'receptionist';
}

export function isInstructor(role?: UserRole): boolean {
  return role === 'instructor';
}

export function isClient(role?: UserRole): boolean {
  return role === 'client' || !role;
}

export function canSwitchAccount(role?: UserRole): boolean {
  return role === 'owner_dev';
}

export function getRoleDefinition(role?: UserRole): RoleDefinition {
  if (!role || !ROLE_DEFINITIONS[role]) {
    return ROLE_DEFINITIONS.client;
  }
  return ROLE_DEFINITIONS[role];
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatar: string;
  phone: string;
  dni: string;
  description: string;
  defaultPassword?: string;
  secondaryEmail?: string;
}

export const PREDEFINED_STAFF: StaffAccount[] = [
  {
    id: 'staff-valentino',
    name: 'Valentino',
    email: 'tinoykz@gmail.com',
    secondaryEmail: 'valentino@firmestudio.pe',
    role: 'owner_dev',
    roleTitle: 'Owner / Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    phone: '+51 981 223 330',
    dni: '70112233',
    description: 'Acceso Total: Infraestructura, APIs, Supabase y Back-Office',
    defaultPassword: 'firme2026',
  },
  {
    id: 'staff-soni',
    name: 'Soni',
    email: 'soni@firmestudio.pe',
    role: 'admin',
    roleTitle: 'Administración Sede SJL',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    phone: '+51 991 223 344',
    dni: '71223344',
    description: 'Gestión Operativa: Clientes, Agenda, 8 Camas, Caja y WhatsApp',
    defaultPassword: 'firme2026',
  },
  {
    id: 'staff-keyla',
    name: 'Keyla',
    email: 'keyla@firmestudio.pe',
    role: 'admin',
    roleTitle: 'Administración & Operaciones',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    phone: '+51 982 334 455',
    dni: '72334455',
    description: 'Gestión Operativa: Clientes, Agenda, 8 Camas, Caja y WhatsApp',
    defaultPassword: 'firme2026',
  },
  {
    id: 'staff-recepcion',
    name: 'Camila',
    email: 'recepcion@firmestudio.pe',
    role: 'receptionist',
    roleTitle: 'Recepción & Mostrador SJL',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
    phone: '+51 984 123 456',
    dni: '73445566',
    description: 'Atención Presencial: Altas express, Cobros en Mostrador y Check-in',
    defaultPassword: 'firme2026',
  },
];

export function determineUserRole(
  name?: string,
  email?: string,
  dni?: string
): { role: UserRole; roleTitle: string } {
  const normName = (name || '').trim().toLowerCase();
  const normEmail = (email || '').trim().toLowerCase();
  const normDni = (dni || '').trim();

  // OWNER DEV: Valentino / Tino (incluye tinoykz@gmail.com, DNI 70112233)
  if (
    normDni === '70112233' ||
    normName.includes('valentino') ||
    normEmail.includes('valentino') ||
    normName === 'tino' ||
    normName.startsWith('tino') ||
    normEmail.includes('tino') ||
    normEmail.includes('tinoykz') ||
    normEmail === 'tinoykz@gmail.com'
  ) {
    return { role: 'owner_dev', roleTitle: 'Owner / Lead Developer' };
  }

  // ADMIN: Soni (DNI 71223344)
  if (
    normDni === '71223344' ||
    normName.includes('soni') ||
    normEmail.includes('soni') ||
    normEmail === 'soni@firmestudio.pe'
  ) {
    return { role: 'admin', roleTitle: 'Administración Sede SJL' };
  }

  // ADMIN: Keyla (DNI 72334455)
  if (
    normDni === '72334455' ||
    normName.includes('keyla') ||
    normEmail.includes('keyla') ||
    normEmail === 'keyla@firmestudio.pe'
  ) {
    return { role: 'admin', roleTitle: 'Administración & Operaciones' };
  }

  // RECEPCIONISTA: Camila / Recepción (DNI 73445566)
  if (
    normDni === '73445566' ||
    normName.includes('recepcion') ||
    normEmail.includes('recepcion') ||
    normName.includes('camila') ||
    normEmail === 'recepcion@firmestudio.pe'
  ) {
    return { role: 'receptionist', roleTitle: 'Recepción & Mostrador SJL' };
  }

  // INSTRUCTOR: Instructora o Profesora
  if (
    normEmail.includes('profesora') ||
    normEmail.includes('instructor') ||
    normName.includes('instructora') ||
    normName.includes('profesora')
  ) {
    return { role: 'instructor', roleTitle: 'Instructora Reformer' };
  }

  return { role: 'client', roleTitle: 'Alumna' };
}

export function findStaffByCredential(identifier: string): StaffAccount | undefined {
  const clean = (identifier || '').trim().toLowerCase();
  if (!clean) return undefined;
  return PREDEFINED_STAFF.find((s) => {
    return (
      s.email.toLowerCase() === clean ||
      (s.secondaryEmail && s.secondaryEmail.toLowerCase() === clean) ||
      (s.dni && s.dni.toLowerCase() === clean) ||
      s.name.toLowerCase() === clean ||
      (clean.includes('tinoykz') && s.role === 'owner_dev') ||
      (clean === 'tino' && s.role === 'owner_dev')
    );
  });
}


export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle?: string;
  avatar?: string;
  provider: 'google' | 'manual';
  phone?: string;
  dni?: string;
  experienceLevel?: 'Principiante' | 'Intermedio' | 'Avanzado';
  healthConditions?: string[];
  medicalNotes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  documentType?: 'dni' | 'ce' | 'pasaporte';
  birthDate?: string;
  gender?: 'femenino' | 'masculino' | 'otro';
  registrationMethod?: 'qr' | 'manual_smartfit' | 'manual_web' | 'whatsapp' | 'receptionist_desk';
  planName?: string;
  creditsLeft?: number;
  totalAttended?: number;
  level?: number;
  levelTitle?: string;
  exp?: number;
  expNextLevel?: number;
  weeklyStreak?: number;
  unlockedBadges?: string[];
  shareInLeaderboard?: boolean;
  receiveMarketingUpdates?: boolean;
}

export interface ClientBookingFormData {
  name: string;
  email: string;
  phone: string;
  dni: string;
  experienceLevel: 'Principiante' | 'Intermedio' | 'Avanzado';
  healthConditions: string[];
  medicalNotes?: string;
  fitnessGoal: string;
  gripSocksOption: 'has_socks' | 'need_purchase';
  emergencyContact?: string;
  emergencyPhone?: string;
  acceptedTerms: boolean;
  googleAvatar?: string;
  authProvider?: 'google' | 'manual';
  selectedBed?: number;
}

