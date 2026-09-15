import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  CashRegisterState,
  WhatsAppMessageLog,
} from '../../src/types';
import { MOCK_CLASSES } from '../../src/data/mockData';
import {
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_LEADS,
  INITIAL_CASH_STATE,
} from '../../src/data/adminMockData';
import { persistence } from './persistence';

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'b-1',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'María Fernanda Ruiz',
    clientDni: '72849102',
    clientEmail: 'maria.ruiz@gmail.com',
    clientPhone: '+51 984 123 456',
    status: 'asistio',
    bookedAt: '02/09/2026 07:10',
    bedNumber: 1,
    medicalAlert: 'Tensión cervical leve por trabajo de oficina. Cabecero en nivel 2.',
    checkInTime: '07:22',
    whatsappReminderSent: true,
  },
  {
    id: 'b-2',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Rodrigo Salazar Peña',
    clientDni: '45912830',
    clientEmail: 'rodrigo.s@outlook.com',
    clientPhone: '+51 992 456 789',
    status: 'asistio',
    bookedAt: '01/09/2026 19:30',
    bedNumber: 2,
    medicalAlert: 'Cirugía de menisco derecho en 2023. Evitar flexión profunda extrema de rodilla.',
    checkInTime: '07:25',
    whatsappReminderSent: true,
  },
  {
    id: 'b-3',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Andrea Navarro Vega',
    clientDni: '71029384',
    clientEmail: 'andrea.navarro@gmail.com',
    clientPhone: '+51 971 332 114',
    status: 'asistio',
    bookedAt: '02/09/2026 06:45',
    bedNumber: 3,
    medicalAlert: 'Hiperlordosis lumbar compensada. Priorizar activación del transverso abdominal.',
    checkInTime: '07:28',
    whatsappReminderSent: true,
  },
  {
    id: 'b-4',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Camila Quispe Morales',
    clientDni: '74820193',
    clientEmail: 'camila.qm@hotmail.com',
    clientPhone: '+51 983 776 221',
    status: 'confirmada',
    bookedAt: '01/09/2026 21:00',
    bedNumber: 4,
    medicalAlert: 'Primer trimestre de embarazo (semana 14). Sin decúbito prono prolongado.',
    whatsappReminderSent: true,
  },
  {
    id: 'b-5',
    classId: 'lun-1',
    className: 'Fundamentos Reformer',
    classTime: '07:30',
    classDay: 'lun',
    instructor: 'Valeria Soler',
    clientName: 'Valeria Hurtado Cruz',
    clientDni: '76192834',
    clientEmail: 'valeria.hc@gmail.com',
    clientPhone: '+51 988 234 567',
    status: 'confirmada',
    bookedAt: '02/09/2026 06:15',
    bedNumber: 5,
    medicalAlert: 'Dolor recurrente en manguito rotador derecho. Resortes suaves en brazos.',
    whatsappReminderSent: false,
  },
  {
    id: 'b-6',
    classId: 'lun-2',
    className: 'Reformer Flow Dinámico',
    classTime: '09:00',
    classDay: 'lun',
    instructor: 'Mateo Arismendi',
    clientName: 'María Fernanda Ruiz',
    clientDni: '72849102',
    clientEmail: 'maria.ruiz@gmail.com',
    clientPhone: '+51 984 123 456',
    status: 'confirmada',
    bookedAt: '02/09/2026 08:30',
    bedNumber: 1,
    medicalAlert: 'Tensión cervical leve. Cabecero en nivel 2.',
    whatsappReminderSent: false,
  },
];

export type ReserveSpotResult =
  | { success: true; booking: BookingRecord; error?: never }
  | { success: false; error: string; booking?: never };

export type AssignBedResult =
  | { success: true; booking: BookingRecord; error?: never }
  | { success: false; error: string; booking?: never };

export type CheckInResult =
  | { success: true; booking: BookingRecord; error?: never }
  | { success: false; error: string; booking?: never };

export class StudioStore {
  private classes: ClassSession[];
  private bookings: BookingRecord[];
  private clients: ClientProfile[];
  private transactions: CashTransaction[];
  private expenses: ExpenseRecord[];
  private leads: LeadRecord[];
  private cashRegister: CashRegisterState;
  private whatsappLogs: WhatsAppMessageLog[];

  // O(1) Hash Map Indexes
  private classMap = new Map<string, ClassSession>();
  private clientMap = new Map<string, ClientProfile>();
  private clientDniMap = new Map<string, ClientProfile>();
  private clientEmailMap = new Map<string, ClientProfile>();
  private bookingMap = new Map<string, BookingRecord>();

  // Cached stats with reactive invalidation
  private statsDirty = true;
  private cachedStats: ReturnType<StudioStore['computeStats']> | null = null;

  constructor() {
    const saved = persistence.loadState();
    if (saved) {
      this.classes = saved.classes;
      this.bookings = saved.bookings;
      this.clients = saved.clients;
      this.transactions = saved.transactions;
      this.expenses = saved.expenses;
      this.leads = saved.leads;
      this.cashRegister = saved.cashRegister || { ...INITIAL_CASH_STATE };
      this.whatsappLogs = saved.whatsappLogs || [];
    } else {
      this.classes = JSON.parse(JSON.stringify(MOCK_CLASSES));
      this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
      this.clients = JSON.parse(JSON.stringify(INITIAL_CLIENTS));
      this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
      this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
      this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
      this.cashRegister = { ...INITIAL_CASH_STATE };
      this.whatsappLogs = [
        {
          id: 'wa-1',
          toName: 'María Fernanda Ruiz',
          toPhone: '+51 984 123 456',
          type: 'recordatorio',
          sentAt: '02/09/2026 06:30',
          status: 'enviado',
          content: '¡Hola María Fernanda! ✨ Te recordamos tu clase de Fundamentos Reformer hoy a las 07:30 con Valeria Soler en FIRME STUDIO.',
        },
        {
          id: 'wa-2',
          toName: 'Rodrigo Salazar Peña',
          toPhone: '+51 992 456 789',
          type: 'recordatorio',
          sentAt: '02/09/2026 06:30',
          status: 'enviado',
          content: '¡Hola Rodrigo! Te recordamos tu clase de Fundamentos Reformer hoy a las 07:30. Recuerda traer tus calcetines antideslizantes grip.',
        },
      ];
    }
    this.rebuildIndexes();
  }

  /**
   * Rebuilds all high-speed O(1) hash map indexes
   */
  private rebuildIndexes(): void {
    this.classMap.clear();
    for (const c of this.classes) {
      this.classMap.set(c.id, c);
    }

    this.clientMap.clear();
    this.clientDniMap.clear();
    this.clientEmailMap.clear();
    for (const cli of this.clients) {
      this.clientMap.set(cli.id, cli);
      if (cli.dni) this.clientDniMap.set(cli.dni, cli);
      if (cli.email) this.clientEmailMap.set(cli.email.toLowerCase(), cli);
    }

    this.bookingMap.clear();
    for (const b of this.bookings) {
      this.bookingMap.set(b.id, b);
    }

    this.statsDirty = true;
  }

  private persist(): void {
    this.statsDirty = true;
    persistence.scheduleSave({
      classes: this.classes,
      bookings: this.bookings,
      clients: this.clients,
      transactions: this.transactions,
      expenses: this.expenses,
      leads: this.leads,
      cashRegister: this.cashRegister,
      whatsappLogs: this.whatsappLogs,
    });
  }

  /**
   * Resets all store data to pristine defaults (primarily for testing)
   */
  resetToDefaults(): void {
    this.classes = JSON.parse(JSON.stringify(MOCK_CLASSES));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.clients = JSON.parse(JSON.stringify(INITIAL_CLIENTS));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS));
    this.expenses = JSON.parse(JSON.stringify(INITIAL_EXPENSES));
    this.leads = JSON.parse(JSON.stringify(INITIAL_LEADS));
    this.cashRegister = { ...INITIAL_CASH_STATE };
    this.whatsappLogs = [];
    this.rebuildIndexes();
    this.persist();
  }

  // --- WhatsApp Logs ---
  getWhatsAppLogs(): WhatsAppMessageLog[] {
    return this.whatsappLogs;
  }

  recordWhatsAppLog(log: WhatsAppMessageLog): WhatsAppMessageLog {
    this.whatsappLogs.unshift(log);
    const booking = this.bookings.find(
      (b) => b.clientPhone === log.toPhone || b.clientName.toLowerCase() === log.toName.toLowerCase()
    );
    if (booking) {
      booking.whatsappReminderSent = true;
      booking.whatsappReminderTime = log.sentAt;
    }
    this.persist();
    return log;
  }

  // --- Classes ---
  getClasses(): ClassSession[] {
    return this.classes;
  }

  getClassById(id: string): ClassSession | undefined {
    return this.classMap.get(id);
  }

  addClass(newClass: ClassSession): ClassSession {
    this.classes.push(newClass);
    this.classMap.set(newClass.id, newClass);
    this.persist();
    return newClass;
  }

  updateClass(id: string, update: Partial<ClassSession>): ClassSession | null {
    const existing = this.classMap.get(id);
    if (!existing) return null;
    const idx = this.classes.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.classes[idx] = { ...this.classes[idx], ...update };
    this.classMap.set(id, this.classes[idx]);
    this.persist();
    return this.classes[idx];
  }

  deleteClass(id: string): boolean {
    const prevLen = this.classes.length;
    this.classes = this.classes.filter((c) => c.id !== id);
    if (this.classes.length < prevLen) {
      this.classMap.delete(id);
      this.persist();
      return true;
    }
    return false;
  }

  // --- Bookings & Concurrency Control ---
  getBookings(): BookingRecord[] {
    return this.bookings;
  }

  getBookingsPaginated(params: {
    classId?: string;
    clientEmail?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): { items: BookingRecord[]; total: number; page: number; limit: number; totalPages: number } {
    let filtered = this.bookings;

    if (params.classId) {
      filtered = filtered.filter((b) => b.classId === params.classId);
    }
    if (params.clientEmail) {
      const emailLower = params.clientEmail.toLowerCase();
      filtered = filtered.filter((b) => b.clientEmail.toLowerCase() === emailLower);
    }
    if (params.status) {
      filtered = filtered.filter((b) => b.status === params.status);
    }

    const total = filtered.length;
    const limit = Math.max(1, Math.min(100, params.limit || 50));
    const page = Math.max(1, params.page || 1);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { items, total, page, limit, totalPages };
  }

  /**
   * Atomic reservation operation:
   * Validates capacity, prevents duplicates, checks bed collision,
   * decrements available spots, and deducts pack credits atomically.
   */
  reserveSpot(params: {
    classId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    clientDni?: string;
    bedNumber?: number;
    medicalAlert?: string;
  }): ReserveSpotResult {
    const { classId, clientName, clientEmail, clientPhone, clientDni, bedNumber, medicalAlert } = params;

    const classSession = this.classMap.get(classId);
    if (!classSession) {
      return { success: false, error: 'Sesión de clase no encontrada' };
    }

    // 1. Capacity check
    if (classSession.occupiedSpots >= classSession.totalSpots) {
      return {
        success: false,
        error: `La clase ya no tiene cupos disponibles (capacidad máxima: ${classSession.totalSpots} camas)`,
      };
    }

    // 2. Prevent duplicate booking for the same student in the same session
    const normalizedEmail = clientEmail.trim().toLowerCase();
    const existingBooking = this.bookings.find(
      (b) =>
        b.classId === classId &&
        b.clientEmail.trim().toLowerCase() === normalizedEmail &&
        (b.status === 'confirmada' || b.status === 'asistio')
    );
    if (existingBooking) {
      return {
        success: false,
        error: 'Ya cuentas con una reserva activa para este mismo turno.',
      };
    }

    // 3. Bed validation & collision check if bedNumber was specified
    if (bedNumber !== undefined) {
      if (!Number.isInteger(bedNumber) || bedNumber < 1 || bedNumber > 8) {
        return { success: false, error: 'El número de cama debe ser un entero entre 1 y 8' };
      }

      const bedTaken = this.bookings.find(
        (b) =>
          b.classId === classId &&
          b.bedNumber === bedNumber &&
          (b.status === 'confirmada' || b.status === 'asistio')
      );
      if (bedTaken) {
        return {
          success: false,
          error: `La cama Reformer #${bedNumber} ya se encuentra ocupada en este turno`,
        };
      }
    }

    // 4. Atomic spot increment
    classSession.occupiedSpots += 1;

    // 5. Create booking record
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    const newBooking: BookingRecord = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId,
      className: classSession.name,
      classTime: classSession.time,
      classDay: classSession.day,
      instructor: classSession.instructor,
      clientName: clientName.trim(),
      clientEmail: normalizedEmail,
      clientPhone: clientPhone || '+51 900 000 000',
      clientDni: clientDni,
      bedNumber: bedNumber,
      medicalAlert: medicalAlert || undefined,
      status: 'confirmada',
      bookedAt: `${dateStr} ${timeStr}`,
    };

    this.bookings.unshift(newBooking);
    this.bookingMap.set(newBooking.id, newBooking);

    // 6. Deduct client pack credit if applicable
    const existingClient = this.clientEmailMap.get(normalizedEmail);
    if (existingClient && existingClient.planType === 'pack' && existingClient.creditsLeft > 0) {
      existingClient.creditsLeft -= 1;
    }

    this.persist();
    return { success: true, booking: newBooking };
  }

  addBooking(booking: BookingRecord): BookingRecord {
    this.bookings.unshift(booking);
    this.bookingMap.set(booking.id, booking);
    const classSession = this.classMap.get(booking.classId);
    if (classSession && classSession.occupiedSpots < classSession.totalSpots) {
      classSession.occupiedSpots += 1;
    }
    this.persist();
    return booking;
  }

  updateBookingStatus(id: string, status: BookingRecord['status']): BookingRecord | null {
    const booking = this.bookingMap.get(id);
    if (!booking) return null;
    const oldStatus = booking.status;
    booking.status = status;

    const classSession = this.classMap.get(booking.classId);

    // If transitioning to cancelled from an active state, decrement occupied spots
    if (status === 'cancelada' && (oldStatus === 'confirmada' || oldStatus === 'asistio')) {
      if (classSession && classSession.occupiedSpots > 0) {
        classSession.occupiedSpots -= 1;
      }
    }
    // If reactivating a cancelled booking, increment occupied spots
    else if ((status === 'confirmada' || status === 'asistio') && oldStatus === 'cancelada') {
      if (classSession && classSession.occupiedSpots < classSession.totalSpots) {
        classSession.occupiedSpots += 1;
      }
    }

    this.persist();
    return booking;
  }

  /**
   * Assigns or changes a Reformer bed (1-8) with collision check
   */
  assignBed(bookingId: string, bedNumber: number): AssignBedResult {
    if (!Number.isInteger(bedNumber) || bedNumber < 1 || bedNumber > 8) {
      return { success: false, error: 'El número de cama debe ser un entero entre 1 y 8' };
    }

    const booking = this.bookingMap.get(bookingId);
    if (!booking) {
      return { success: false, error: 'Reserva no encontrada' };
    }

    // Check if another active attendee in the same class already has this bed
    const bedOccupied = this.bookings.find(
      (b) =>
        b.id !== bookingId &&
        b.classId === booking.classId &&
        b.bedNumber === bedNumber &&
        (b.status === 'confirmada' || b.status === 'asistio')
    );

    if (bedOccupied) {
      return {
        success: false,
        error: `La cama Reformer #${bedNumber} ya está asignada a ${bedOccupied.clientName} en este turno`,
      };
    }

    booking.bedNumber = bedNumber;
    this.persist();
    return { success: true, booking };
  }

  /**
   * Performs check-in at studio reception or kiosk
   */
  checkInBooking(bookingId: string, bedNumber?: number): CheckInResult {
    const booking = this.bookingMap.get(bookingId);
    if (!booking) {
      return { success: false, error: 'Reserva no encontrada para check-in' };
    }

    if (bedNumber !== undefined) {
      if (!Number.isInteger(bedNumber) || bedNumber < 1 || bedNumber > 8) {
        return { success: false, error: 'El número de cama debe ser un entero entre 1 y 8' };
      }

      const bedOccupied = this.bookings.find(
        (b) =>
          b.id !== bookingId &&
          b.classId === booking.classId &&
          b.bedNumber === bedNumber &&
          (b.status === 'confirmada' || b.status === 'asistio')
      );

      if (bedOccupied) {
        return {
          success: false,
          error: `La cama Reformer #${bedNumber} ya está ocupada por ${bedOccupied.clientName}`,
        };
      }
      booking.bedNumber = bedNumber;
    }

    booking.status = 'asistio';
    const now = new Date();
    booking.checkInTime = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    // Update client profile metrics
    const client = (booking.clientEmail && this.clientEmailMap.get(booking.clientEmail.toLowerCase())) ||
      (booking.clientDni ? this.clientDniMap.get(booking.clientDni) : undefined);
    if (client) {
      client.totalAttended = (client.totalAttended || 0) + 1;
      client.lastVisit = now.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    this.persist();
    return { success: true, booking };
  }

  /**
   * Studio fair cancellation with credit refund and waitlist candidate detection
   */
  cancelBookingWithRefund(bookingId: string): {
    success: boolean;
    booking?: BookingRecord;
    refunded?: boolean;
    nextWaitlistCandidate?: LeadRecord | null;
    error?: string;
  } {
    const booking = this.bookingMap.get(bookingId);
    if (!booking) {
      return { success: false, error: 'Reserva no encontrada' };
    }

    const wasActive = booking.status === 'confirmada' || booking.status === 'asistio';
    booking.status = 'cancelada';

    // Free up spot
    if (wasActive) {
      const cls = this.classMap.get(booking.classId);
      if (cls && cls.occupiedSpots > 0) {
        cls.occupiedSpots -= 1;
      }
    }

    // Refund credit to student pack
    const client = booking.clientEmail ? this.clientEmailMap.get(booking.clientEmail.toLowerCase()) : undefined;
    let refunded = false;
    if (client && client.planType === 'pack') {
      client.creditsLeft = (client.creditsLeft || 0) + 1;
      refunded = true;
    }

    // Check waitlist candidates
    const waitlistCandidates = this.leads.filter(
      (l) => l.status === 'nuevo' || l.status === 'contactado' || l.status === 'prueba_agendada'
    );
    const nextWaitlistCandidate = waitlistCandidates.length > 0 ? waitlistCandidates[0] : null;

    this.persist();
    return {
      success: true,
      booking,
      refunded,
      nextWaitlistCandidate,
    };
  }

  deleteBooking(id: string): boolean {
    const booking = this.bookingMap.get(id);
    if (!booking) return false;

    // Free up spot if it was active
    if (booking.status === 'confirmada' || booking.status === 'asistio') {
      const cls = this.classMap.get(booking.classId);
      if (cls && cls.occupiedSpots > 0) {
        cls.occupiedSpots -= 1;
      }
    }

    this.bookings = this.bookings.filter((b) => b.id !== id);
    this.bookingMap.delete(id);
    this.persist();
    return true;
  }

  // --- Clients ---
  getClients(): ClientProfile[] {
    return this.clients;
  }

  getClientsPaginated(params: {
    search?: string;
    status?: string;
    planType?: string;
    page?: number;
    limit?: number;
  }): { items: ClientProfile[]; total: number; page: number; limit: number; totalPages: number } {
    let filtered = this.clients;

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.dni.includes(q) ||
          c.phone.includes(q)
      );
    }

    if (params.status) {
      filtered = filtered.filter((c) => c.status === params.status);
    }

    if (params.planType) {
      filtered = filtered.filter((c) => c.planType === params.planType);
    }

    const total = filtered.length;
    const limit = Math.max(1, Math.min(100, params.limit || 50));
    const page = Math.max(1, params.page || 1);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { items, total, page, limit, totalPages };
  }

  getClientById(id: string): ClientProfile | undefined {
    return this.clientMap.get(id);
  }

  getClientByEmail(email: string): ClientProfile | undefined {
    return this.clientEmailMap.get(email.trim().toLowerCase());
  }

  getClientByDni(dni: string): ClientProfile | undefined {
    return this.clientDniMap.get(dni.trim());
  }

  addClient(client: ClientProfile): ClientProfile {
    this.clients.unshift(client);
    this.clientMap.set(client.id, client);
    if (client.dni) this.clientDniMap.set(client.dni, client);
    if (client.email) this.clientEmailMap.set(client.email.toLowerCase(), client);
    this.persist();
    return client;
  }

  updateClient(id: string, update: Partial<ClientProfile>): ClientProfile | null {
    const existing = this.clientMap.get(id);
    if (!existing) return null;
    const idx = this.clients.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    // Clean up old index keys if email or DNI changed
    if (existing.email) this.clientEmailMap.delete(existing.email.toLowerCase());
    if (existing.dni) this.clientDniMap.delete(existing.dni);

    this.clients[idx] = { ...this.clients[idx], ...update };
    const updated = this.clients[idx];

    this.clientMap.set(id, updated);
    if (updated.email) this.clientEmailMap.set(updated.email.toLowerCase(), updated);
    if (updated.dni) this.clientDniMap.set(updated.dni, updated);

    this.persist();
    return updated;
  }

  deleteClient(id: string): boolean {
    const prevLen = this.clients.length;
    const existing = this.clientMap.get(id);
    this.clients = this.clients.filter((c) => c.id !== id);
    if (this.clients.length < prevLen) {
      this.clientMap.delete(id);
      if (existing?.email) this.clientEmailMap.delete(existing.email.toLowerCase());
      if (existing?.dni) this.clientDniMap.delete(existing.dni);
      this.persist();
      return true;
    }
    return false;
  }

  // --- Transactions / Cash ---
  getTransactions(): CashTransaction[] {
    return this.transactions;
  }

  getTransactionsPaginated(params: {
    paymentMethod?: string;
    category?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): { items: CashTransaction[]; total: number; totalAmount: number; page: number; limit: number; totalPages: number } {
    let filtered = this.transactions;

    if (params.paymentMethod) {
      filtered = filtered.filter((t) => t.paymentMethod === params.paymentMethod);
    }
    if (params.category) {
      filtered = filtered.filter((t) => t.category === params.category);
    }
    if (params.date) {
      filtered = filtered.filter((t) => t.date.includes(params.date!));
    }
    if (params.startDate && params.endDate) {
      filtered = filtered.filter((t) => t.date >= params.startDate! && t.date <= params.endDate!);
    }

    const total = filtered.length;
    const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);
    const limit = Math.max(1, Math.min(100, params.limit || 50));
    const page = Math.max(1, params.page || 1);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { items, total, totalAmount, page, limit, totalPages };
  }

  addTransaction(tx: CashTransaction): CashTransaction {
    this.transactions.unshift(tx);
    this.persist();
    return tx;
  }

  updateTransaction(id: string, update: Partial<CashTransaction>): CashTransaction | null {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.transactions[idx] = { ...this.transactions[idx], ...update };
    this.persist();
    return this.transactions[idx];
  }

  deleteTransaction(id: string): boolean {
    const prevLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    if (this.transactions.length < prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  getCashRegister(): CashRegisterState {
    return this.cashRegister;
  }

  toggleCashRegister(): CashRegisterState {
    this.cashRegister.isOpen = !this.cashRegister.isOpen;
    this.persist();
    return this.cashRegister;
  }

  // --- Expenses ---
  getExpenses(): ExpenseRecord[] {
    return this.expenses;
  }

  getExpensesPaginated(params: {
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): { items: ExpenseRecord[]; total: number; totalAmount: number; page: number; limit: number; totalPages: number } {
    let filtered = this.expenses;

    if (params.category) {
      filtered = filtered.filter((e) => e.category === params.category);
    }
    if (params.status) {
      filtered = filtered.filter((e) => e.status === params.status);
    }
    if (params.startDate && params.endDate) {
      filtered = filtered.filter((e) => e.date >= params.startDate! && e.date <= params.endDate!);
    }

    const total = filtered.length;
    const totalAmount = filtered.reduce((acc, e) => acc + e.amount, 0);
    const limit = Math.max(1, Math.min(100, params.limit || 50));
    const page = Math.max(1, params.page || 1);
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return { items, total, totalAmount, page, limit, totalPages };
  }

  addExpense(exp: ExpenseRecord): ExpenseRecord {
    this.expenses.unshift(exp);
    this.persist();
    return exp;
  }

  updateExpense(id: string, update: Partial<ExpenseRecord>): ExpenseRecord | null {
    const idx = this.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.expenses[idx] = { ...this.expenses[idx], ...update };
    this.persist();
    return this.expenses[idx];
  }

  deleteExpense(id: string): boolean {
    const prevLen = this.expenses.length;
    this.expenses = this.expenses.filter((e) => e.id !== id);
    if (this.expenses.length < prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Leads ---
  getLeads(): LeadRecord[] {
    return this.leads;
  }

  addLead(lead: LeadRecord): LeadRecord {
    this.leads.unshift(lead);
    this.persist();
    return lead;
  }

  updateLead(id: string, update: Partial<LeadRecord>): LeadRecord | null {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;
    this.leads[idx] = { ...this.leads[idx], ...update };
    this.persist();
    return this.leads[idx];
  }

  deleteLead(id: string): boolean {
    const prevLen = this.leads.length;
    this.leads = this.leads.filter((l) => l.id !== id);
    if (this.leads.length < prevLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // Stats / Overview (Memoized with reactive cache invalidation)
  private computeStats() {
    const totalClients = this.clients.length;
    const activeClients = this.clients.filter((c) => c.status === 'activo').length;
    const totalRevenue = this.transactions.reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = this.expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalBookings = this.bookings.length;
    const confirmedBookings = this.bookings.filter((b) => b.status === 'confirmada' || b.status === 'asistio').length;
    const activeLeads = this.leads.length;

    return {
      totalClients,
      activeClients,
      totalRevenue,
      totalExpenses,
      netBalance: totalRevenue - totalExpenses,
      totalBookings,
      confirmedBookings,
      activeLeads,
      totalClasses: this.classes.length,
    };
  }

  getStats() {
    if (!this.statsDirty && this.cachedStats) {
      return this.cachedStats;
    }
    this.cachedStats = this.computeStats();
    this.statsDirty = false;
    return this.cachedStats;
  }
}

export const store = new StudioStore();
