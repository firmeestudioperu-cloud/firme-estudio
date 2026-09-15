import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  AuthUser,
  PaymentMethod,
  determineUserRole,
  findStaffByCredential,
} from '../types';
import { MOCK_CLASSES } from '../data/mockData';
import {
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_LEADS,
} from '../data/adminMockData';

export function getUpcomingDateForDay(dayAbbr?: string): string {
  const dayMap: Record<string, number> = {
    dom: 0,
    lun: 1,
    mar: 2,
    mie: 3,
    jue: 4,
    vie: 5,
    sab: 6,
  };
  const now = new Date();
  const currentDay = now.getDay();
  if (!dayAbbr || !(dayAbbr.toLowerCase() in dayMap)) {
    return now.toISOString().split('T')[0];
  }
  const targetDay = dayMap[dayAbbr.toLowerCase()];
  let diff = targetDay - currentDay;
  if (diff < 0) {
    diff += 7;
  }
  const targetDate = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
  return targetDate.toISOString().split('T')[0];
}

// Helper para convertir nombres snake_case de Postgres a camelCase de TypeScript
export function mapDbClassToSession(row: any): ClassSession {
  const formattedTime = row.time || (row.start_time ? row.start_time.slice(0, 5) : '08:00');
  const formattedDuration = row.duration || (row.duration_min ? `${row.duration_min} min` : '50 min');
  return {
    id: row.id,
    day: row.day,
    time: formattedTime,
    name: row.name,
    instructor: row.instructor_name || row.instructor || 'Instructora FIRME',
    level: row.level || 'Principiante',
    classType: row.class_type || 'Reformer',
    duration: formattedDuration,
    totalSpots: row.total_spots ?? 8,
    occupiedSpots: row.occupied_spots ?? 0,
    focus: row.focus || '',
  };
}

export function mapSessionToDbClass(cls: ClassSession): any {
  const durationNum = parseInt(cls.duration?.replace(/\D/g, '') || '50', 10) || 50;
  const timeClean = cls.time?.length === 5 ? `${cls.time}:00` : (cls.time || '08:00:00');
  return {
    id: cls.id,
    day: cls.day,
    start_time: timeClean,
    name: cls.name,
    instructor_name: cls.instructor || 'Instructora FIRME',
    level: cls.level || 'Principiante',
    class_type: cls.classType?.toLowerCase().includes('suspen')
      ? 'Suspension'
      : cls.classType?.toLowerCase().includes('mat')
      ? 'Mat'
      : 'Reformer',
    duration_min: durationNum,
    total_spots: cls.totalSpots || 8,
    focus: cls.focus || '',
    is_active: true,
  };
}

export function mapDbBookingToRecord(row: any): BookingRecord {
  return {
    id: row.id,
    classId: row.class_id,
    className: row.class_name,
    classTime: row.class_time,
    classDay: row.class_day,
    instructor: row.instructor_name || row.instructor || 'Instructora FIRME',
    clientName: row.client_name,
    clientEmail: row.client_email || '',
    clientPhone: row.client_phone || '',
    clientDni: row.client_dni || '',
    status: row.status,
    bookedAt: row.created_at ? new Date(row.created_at).toLocaleDateString('es-PE') : 'Hoy',
    bedNumber: row.bed_number ?? undefined,
    isWaitlist: row.is_waitlist ?? false,
    medicalAlert: row.medical_alert ?? undefined,
    checkInTime: row.check_in_time ?? undefined,
    whatsappReminderSent: row.whatsapp_reminder_sent ?? false,
  };
}

export function mapRecordToDbBooking(b: Partial<BookingRecord> & { scheduledDate?: string }): any {
  const isUuid = b.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.id);
  const scheduledDate = b.scheduledDate || getUpcomingDateForDay(b.classDay);

  const payload: any = {
    class_id: b.classId,
    class_name: b.className,
    class_time: b.classTime,
    class_day: b.classDay,
    instructor_name: b.instructor || 'Instructora FIRME',
    scheduled_date: scheduledDate,
    client_name: b.clientName,
    client_email: b.clientEmail || null,
    client_phone: b.clientPhone || null,
    client_dni: b.clientDni,
    status: b.status || 'confirmada',
    bed_number: b.bedNumber,
    is_waitlist: b.isWaitlist || false,
    medical_alert: b.medicalAlert || null,
    check_in_time: b.checkInTime || null,
  };

  if (isUuid) {
    payload.id = b.id;
  }
  return payload;
}

export function mapDbClientToProfile(row: any): ClientProfile {
  return {
    id: row.id,
    name: row.name,
    dni: row.dni,
    alternateDni: row.alternate_dni || undefined,
    phone: row.phone,
    email: row.email || '',
    currentPlan: row.current_plan || 'Pack 8 Sesiones',
    planType: row.plan_type || 'pack',
    creditsLeft: row.credits_left ?? 8,
    totalAttended: row.total_attended ?? 0,
    status: row.status || 'activo',
    joinDate: row.join_date ? new Date(row.join_date).toLocaleDateString('es-PE') : '01/01/2026',
    lastVisit: row.last_visit ? new Date(row.last_visit).toLocaleDateString('es-PE') : 'Nunca',
    emergencyContact: row.emergency_contact,
    emergencyPhone: row.emergency_phone,
    medicalNotes: row.medical_notes,
    documentType: row.document_type || 'dni',
    birthDate: row.birth_date,
    gender: row.gender || 'otro',
    registrationMethod: row.registration_method || 'manual_web',
  };
}

export function mapDbTxToTransaction(row: any): CashTransaction {
  const tDate = row.transacted_at ? new Date(row.transacted_at) : new Date();
  return {
    id: row.id,
    type: row.type,
    concept: row.concept,
    category: row.category,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    clientName: row.client_name || undefined,
    receiptNumber: row.receipt_number || '',
    date: tDate.toLocaleDateString('es-PE'),
    time: tDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    notes: row.notes || undefined,
  };
}

export function mapTxToDbTx(tx: Partial<CashTransaction>): any {
  const isUuid = tx.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tx.id);
  const payload: any = {
    type: tx.type || 'ingreso',
    concept: tx.concept || 'Operación de Caja',
    category: tx.category || 'otro',
    amount: tx.amount || 0,
    payment_method: tx.paymentMethod || 'efectivo',
    client_name: tx.clientName || null,
    receipt_number: tx.receiptNumber || null,
    receipt_type: tx.receiptNumber?.startsWith('F') ? 'factura' : (tx.receiptNumber?.startsWith('B') ? 'boleta' : 'ninguno'),
    notes: tx.notes || null,
    transacted_at: new Date().toISOString(),
  };
  if (isUuid) {
    payload.id = tx.id;
  }
  return payload;
}

export function mapDbExpenseToRecord(row: any): ExpenseRecord {
  const d = row.created_at ? new Date(row.created_at) : new Date();
  return {
    id: row.id,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    date: d.toLocaleDateString('es-PE'),
    recipient: row.recipient || '',
    paymentMethod: row.payment_method || 'efectivo',
    status: row.status === 'vencido' ? 'pendiente' : row.status,
    receiptNumber: row.receipt_number || undefined,
  };
}

export function mapExpenseToDb(exp: Partial<ExpenseRecord>): any {
  const isUuid = exp.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exp.id);
  const payload: any = {
    description: exp.description || 'Gasto operativo',
    category: exp.category || 'otros',
    amount: exp.amount || 0,
    recipient: exp.recipient || '',
    payment_method: exp.paymentMethod || 'efectivo',
    status: exp.status || 'pendiente',
    receipt_number: exp.receiptNumber || null,
    paid_at: exp.status === 'pagado' ? new Date().toISOString() : null,
  };
  if (isUuid) {
    payload.id = exp.id;
  }
  return payload;
}

export function mapDbLeadToRecord(row: any): LeadRecord {
  const cDate = row.created_at ? new Date(row.created_at) : new Date();
  let interestDisplay: LeadRecord['interest'] = 'Reformer';
  if (row.interest === 'Suspension') interestDisplay = 'Suspensión';
  else if (row.interest === 'Mat' || row.interest === 'Todos') interestDisplay = row.interest;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || '',
    channel: row.channel || 'whatsapp',
    interest: interestDisplay,
    status: row.status || 'nuevo',
    trialDate: row.trial_date || undefined,
    notes: row.notes || '',
    createdAt: `${cDate.toLocaleDateString('es-PE')} ${cDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
  };
}

export function mapLeadToDb(lead: Partial<LeadRecord>): any {
  const isUuid = lead.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lead.id);
  const cleanInterest = lead.interest === 'Suspensión' ? 'Suspension' : (lead.interest || 'Reformer');
  const payload: any = {
    name: lead.name,
    phone: lead.phone,
    email: lead.email || null,
    channel: lead.channel || 'whatsapp',
    interest: cleanInterest,
    status: lead.status || 'nuevo',
    notes: lead.notes || null,
    trial_date: lead.trialDate || null,
  };
  if (isUuid) {
    payload.id = lead.id;
  }
  return payload;
}

export const supabaseService = {
  // =========================================================================
  // 1. CLASES & HORARIOS
  // =========================================================================
  async getClasses(): Promise<ClassSession[]> {
    if (!isSupabaseConfigured() || !supabase) {
      return MOCK_CLASSES;
    }
    try {
      // Intentar ordenar por start_time o created_at
      const { data, error } = await supabase.from('classes').select('*').order('start_time', { ascending: true });
      if (error || !data || data.length === 0) {
        return MOCK_CLASSES;
      }
      return data.map(mapDbClassToSession);
    } catch {
      return MOCK_CLASSES;
    }
  },

  async updateClassSpots(classId: string, occupiedSpots: number): Promise<boolean> {
    // La ocupación se calcula dinámicamente en Postgres por las vistas classes_today y classes_week
    return true;
  },

  async createClass(cls: Omit<ClassSession, 'id'>): Promise<ClassSession | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const newId = `c-${cls.day}-${cls.time.replace(':', '')}-${Date.now().toString().slice(-4)}`;
      const dbRow = mapSessionToDbClass({ ...cls, id: newId });
      const { data, error } = await supabase.from('classes').insert([dbRow]).select().single();
      if (error || !data) {
        console.warn('Error al crear clase en Supabase:', error);
        return null;
      }
      return mapDbClassToSession(data);
    } catch (err) {
      console.error('Excepción al crear clase en Supabase:', err);
      return null;
    }
  },

  async updateClass(cls: ClassSession): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const dbRow = mapSessionToDbClass(cls);
      delete dbRow.id;
      const { error } = await supabase.from('classes').update(dbRow).eq('id', cls.id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteClass(classId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', classId);
      return !error;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 2. RESERVAS & ASISTENCIAS
  // =========================================================================
  async getBookings(): Promise<BookingRecord[]> {
    if (!isSupabaseConfigured() || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(mapDbBookingToRecord);
    } catch {
      return [];
    }
  },

  async createBooking(booking: Omit<BookingRecord, 'id' | 'bookedAt' | 'status'> & { id?: string; scheduledDate?: string }): Promise<BookingRecord | null> {
    if (!isSupabaseConfigured() || !supabase) {
      const fallback: BookingRecord = {
        ...booking,
        id: `b-${Date.now()}`,
        status: 'confirmada',
        bookedAt: new Date().toLocaleDateString('es-PE'),
      };
      return fallback;
    }
    try {
      let clientId: string | undefined = undefined;
      if (booking.clientDni) {
        const { data: clientRow } = await supabase
          .from('clients')
          .select('id')
          .eq('dni', booking.clientDni.trim())
          .maybeSingle();
        if (clientRow?.id) {
          clientId = clientRow.id;
        } else if (booking.clientName) {
          // Auto-registrar alumna si no existe para que quede vinculada en la base de datos
          const { data: createdClient } = await supabase
            .from('clients')
            .insert({
              name: booking.clientName,
              dni: booking.clientDni.trim(),
              email: booking.clientEmail?.trim() || null,
              phone: booking.clientPhone?.trim() || '+51 900 000 000',
              status: 'activo',
              registration_method: 'manual_web',
              medical_notes: booking.medicalAlert || null,
            })
            .select('id')
            .maybeSingle();
          if (createdClient?.id) {
            clientId = createdClient.id;
          }
        }
      }

      const dbRow = mapRecordToDbBooking({
        ...booking,
        status: 'confirmada',
      });
      if (clientId) {
        dbRow.client_id = clientId;
      }

      const { data, error } = await supabase.from('bookings').insert([dbRow]).select().single();
      if (error) {
        let userMessage = error.message;
        if (error.code === '23505') {
          userMessage = 'Ya existe una reserva confirmada para este DNI en este horario y fecha.';
        } else if (error.message?.includes('Capacidad máxima') || error.code === 'P0001') {
          userMessage = 'La clase ha alcanzado su capacidad máxima de cupos.';
        } else if (error.message?.includes('idx_bookings_active_bed') || error.message?.includes('cama')) {
          userMessage = `La cama Reformer #${dbRow.bed_number || ''} ya está ocupada por otra alumna.`;
        }
        console.warn('Error al insertar reserva en Supabase:', error);
        throw new Error(userMessage);
      }
      if (!data) return null;
      return mapDbBookingToRecord(data);
    } catch (err) {
      console.error('Excepción al crear reserva en Supabase:', err);
      return null;
    }
  },

  async updateBookingStatus(bookingId: string, status: 'confirmada' | 'asistio' | 'cancelada'): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      return !error;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 3. TÓTEM SJL: AUTO CHECK-IN POR DNI EN TIEMPO REAL
  // =========================================================================
  async performTotemCheckIn(dni: string): Promise<{
    success: boolean;
    booking?: BookingRecord;
    assignedBed?: number;
    error?: string;
  }> {
    const trimmedDni = dni.trim();
    const nowTime = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

    if (!isSupabaseConfigured() || !supabase) {
      // Modo local simulado
      return {
        success: true,
        assignedBed: Math.floor(Math.random() * 8) + 1,
      };
    }

    try {
      const cleanDigits = trimmedDni.replace(/\D/g, '');

      // 1. Buscar la reserva activa más reciente por DNI, Teléfono o Email
      let query = supabase
        .from('bookings')
        .select('*')
        .neq('status', 'cancelada');

      if (trimmedDni.includes('@')) {
        query = query.ilike('client_email', trimmedDni);
      } else if (cleanDigits.length >= 8) {
        query = query.or(
          `client_dni.eq.${trimmedDni},client_dni.eq.${cleanDigits},client_phone.ilike.%${cleanDigits.slice(-8)}%`
        );
      } else {
        query = query.or(`client_dni.eq.${trimmedDni},id.eq.${trimmedDni}`);
      }

      let { data: bookingRows, error: searchError } = await query
        .order('created_at', { ascending: false })
        .limit(1);

      // 1.1 Si no se encontró directamente en bookings, buscar si la persona existe en clients
      if (!bookingRows || bookingRows.length === 0) {
        let clientQuery = supabase.from('clients').select('*');
        if (trimmedDni.includes('@')) {
          clientQuery = clientQuery.ilike('email', trimmedDni);
        } else if (cleanDigits.length >= 8) {
          clientQuery = clientQuery.or(
            `dni.eq.${trimmedDni},dni.eq.${cleanDigits},phone.ilike.%${cleanDigits.slice(-8)}%`
          );
        } else {
          clientQuery = clientQuery.eq('dni', trimmedDni);
        }

        const { data: matchedClients } = await clientQuery.limit(1);

        if (matchedClients && matchedClients.length > 0) {
          const cli = matchedClients[0];
          // Buscar reservas con cualquiera de sus identificadores registrados
          const { data: crossBookings } = await supabase
            .from('bookings')
            .select('*')
            .neq('status', 'cancelada')
            .or(
              `client_dni.eq.${cli.dni}${cli.email ? `,client_email.ilike.${cli.email}` : ''}${
                cli.phone ? `,client_phone.ilike.%${cli.phone.replace(/\D/g, '').slice(-8)}%` : ''
              }`
            )
            .order('created_at', { ascending: false })
            .limit(1);

          if (crossBookings && crossBookings.length > 0) {
            bookingRows = crossBookings;
            searchError = null;
          }
        }
      }

      if (searchError || !bookingRows || bookingRows.length === 0) {
        return {
          success: false,
          error: `No encontramos reserva activa para ${trimmedDni}. Acércate al counter de recepción.`,
        };
      }

      const currentBooking = bookingRows[0];

      // 2. Determinar cama (si ya tiene cama asignada la conserva, sino asigna una del 1 al 8)
      let chosenBed = currentBooking.bed_number;
      if (!chosenBed) {
        // Consultar qué camas de esta clase ya están ocupadas
        const { data: occupiedBeds } = await supabase
          .from('bookings')
          .select('bed_number')
          .eq('class_id', currentBooking.class_id)
          .not('bed_number', 'is', null);

        const usedSet = new Set((occupiedBeds || []).map((r) => r.bed_number));
        for (let bed = 1; bed <= 8; bed++) {
          if (!usedSet.has(bed)) {
            chosenBed = bed;
            break;
          }
        }
        if (!chosenBed) chosenBed = 1;
      }

      // 3. Actualizar reserva a 'asistio' con la cama y hora exacta
      const { data: updatedData, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'asistio',
          bed_number: chosenBed,
          check_in_time: nowTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentBooking.id)
        .select()
        .single();

      if (updateError || !updatedData) {
        return {
          success: false,
          error: 'Error al registrar tu check-in en el sistema. Por favor avisa a recepción.',
        };
      }

      // 4. Sumar +150 EXP y +1 asistencia en la tabla clients
      try {
        const { data: clientRow } = await supabase
          .from('clients')
          .select('id, exp_points, total_attended')
          .eq('dni', trimmedDni)
          .single();

        if (clientRow) {
          await supabase
            .from('clients')
            .update({
              exp_points: (clientRow.exp_points || 0) + 150,
              total_attended: (clientRow.total_attended || 0) + 1,
              last_visit: new Date().toISOString(),
            })
            .eq('id', clientRow.id);
        }
      } catch {
        // Ignorar si el cliente no está en la tabla
      }

      return {
        success: true,
        booking: mapDbBookingToRecord(updatedData),
        assignedBed: chosenBed,
      };
    } catch (err: any) {
      console.error('Error en check-in de tótem:', err);
      return {
        success: false,
        error: err.message || 'Error de conexión con el Tótem SJL.',
      };
    }
  },

  // =========================================================================
  // 4. ASIGNACIÓN MANUAL DE CAMAS (REFORMER 1-8)
  // =========================================================================
  async assignBed(bookingId: string, bedNumber: number): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ bed_number: bedNumber, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      return !error;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 5. CLIENTES & EXP
  // =========================================================================
  async getClients(): Promise<ClientProfile[]> {
    if (!isSupabaseConfigured() || !supabase) return INITIAL_CLIENTS;
    try {
      const { data, error } = await supabase
        .from('clients_with_plan')
        .select('*')
        .order('name', { ascending: true });
      if (error || !data || data.length === 0) {
        const { data: rawData, error: rawError } = await supabase
          .from('clients')
          .select('*')
          .order('name', { ascending: true });
        if (rawError || !rawData || rawData.length === 0) return INITIAL_CLIENTS;
        return rawData.map(mapDbClientToProfile);
      }
      return data.map(mapDbClientToProfile);
    } catch {
      return INITIAL_CLIENTS;
    }
  },

  async createClient(clientData: Omit<ClientProfile, 'id'>): Promise<ClientProfile | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const clientPayload: any = {
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone || '',
        dni: clientData.dni,
        document_type: clientData.documentType || 'dni',
        birth_date: clientData.birthDate || null,
        gender: clientData.gender || 'otro',
        emergency_contact: clientData.emergencyContact || null,
        emergency_phone: clientData.emergencyPhone || null,
        medical_notes: clientData.medicalNotes || null,
        registration_method: clientData.registrationMethod || 'receptionist_desk',
        status: clientData.status || 'activo',
      };

      const { data, error } = await supabase
        .from('clients')
        .upsert(clientPayload, { onConflict: 'dni' })
        .select()
        .single();

      if (error || !data) {
        console.warn('Error al crear cliente en Supabase:', error);
        return null;
      }

      // Si tiene plan asignado, registrar en client_plans
      if (clientData.currentPlan) {
        await supabase.from('client_plans').insert({
          client_id: data.id,
          plan_name: clientData.currentPlan,
          plan_type: clientData.planType || 'pack',
          credits_initial: clientData.creditsLeft ?? 8,
          credits_left: clientData.creditsLeft ?? 8,
          is_active: true,
        });
      }

      return mapDbClientToProfile({
        ...data,
        current_plan: clientData.currentPlan,
        plan_type: clientData.planType,
        credits_left: clientData.creditsLeft,
      });
    } catch (err) {
      console.error('Excepción al crear cliente en Supabase:', err);
      return null;
    }
  },

  async updateClient(clientData: ClientProfile): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const clientPayload: any = {
        name: clientData.name,
        email: clientData.email || null,
        phone: clientData.phone || '',
        dni: clientData.dni,
        document_type: clientData.documentType || 'dni',
        birth_date: clientData.birthDate || null,
        gender: clientData.gender || 'otro',
        emergency_contact: clientData.emergencyContact || null,
        emergency_phone: clientData.emergencyPhone || null,
        medical_notes: clientData.medicalNotes || null,
        status: clientData.status || 'activo',
        updated_at: new Date().toISOString(),
      };

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientData.id);
      let query = supabase.from('clients').update(clientPayload);
      if (isUuid) {
        query = query.eq('id', clientData.id);
      } else {
        query = query.eq('dni', clientData.dni);
      }

      const { error } = await query;
      if (error) {
        console.warn('Error al actualizar cliente en Supabase:', error);
        return false;
      }

      // Actualizar créditos en client_plans si se modificaron
      if (clientData.creditsLeft !== undefined) {
        const { data: clientRow } = await supabase
          .from('clients')
          .select('id')
          .eq('dni', clientData.dni)
          .maybeSingle();

        if (clientRow?.id) {
          const { data: activePlans } = await supabase
            .from('client_plans')
            .select('id')
            .eq('client_id', clientRow.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

          if (activePlans && activePlans.length > 0) {
            await supabase
              .from('client_plans')
              .update({
                credits_left: clientData.creditsLeft,
                plan_name: clientData.currentPlan,
              })
              .eq('id', activePlans[0].id);
          } else {
            await supabase.from('client_plans').insert({
              client_id: clientRow.id,
              plan_name: clientData.currentPlan || 'Pack 8 Sesiones',
              plan_type: clientData.planType || 'pack',
              credits_initial: clientData.creditsLeft,
              credits_left: clientData.creditsLeft,
              is_active: true,
            });
          }
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  async deleteClient(clientId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);
      if (isUuid) {
        const { error } = await supabase.from('clients').delete().eq('id', clientId);
        return !error;
      } else {
        const { error } = await supabase.from('clients').delete().eq('dni', clientId);
        return !error;
      }
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 5.1 CAJA & TRANSACCIONES POS
  // =========================================================================
  async getCashTransactions(): Promise<CashTransaction[]> {
    if (!isSupabaseConfigured() || !supabase) return INITIAL_TRANSACTIONS;
    try {
      const { data, error } = await supabase
        .from('cash_transactions')
        .select('*')
        .order('transacted_at', { ascending: false });
      if (error || !data || data.length === 0) return INITIAL_TRANSACTIONS;
      return data.map(mapDbTxToTransaction);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  async createCashTransaction(tx: Omit<CashTransaction, 'id'>): Promise<CashTransaction | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const dbRow = mapTxToDbTx(tx);
      const { data, error } = await supabase.from('cash_transactions').insert([dbRow]).select().single();
      if (error || !data) {
        console.warn('Error al registrar transacción en Supabase:', error);
        return null;
      }
      return mapDbTxToTransaction(data);
    } catch (err) {
      console.error('Excepción al registrar transacción en Supabase:', err);
      return null;
    }
  },

  async updateCashTransaction(tx: CashTransaction): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const dbRow = mapTxToDbTx(tx);
      delete dbRow.transacted_at;
      const { error } = await supabase.from('cash_transactions').update(dbRow).eq('id', tx.id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteCashTransaction(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 5.2 GASTOS OPERATIVOS
  // =========================================================================
  async getExpenses(): Promise<ExpenseRecord[]> {
    if (!isSupabaseConfigured() || !supabase) return INITIAL_EXPENSES;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return INITIAL_EXPENSES;
      return data.map(mapDbExpenseToRecord);
    } catch {
      return INITIAL_EXPENSES;
    }
  },

  async createExpense(exp: Omit<ExpenseRecord, 'id'>): Promise<ExpenseRecord | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const dbRow = mapExpenseToDb(exp);
      const { data, error } = await supabase.from('expenses').insert([dbRow]).select().single();
      if (error || !data) {
        console.warn('Error al registrar gasto en Supabase:', error);
        return null;
      }
      return mapDbExpenseToRecord(data);
    } catch (err) {
      console.error('Excepción al registrar gasto en Supabase:', err);
      return null;
    }
  },

  async updateExpense(exp: ExpenseRecord): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const dbRow = mapExpenseToDb(exp);
      const { error } = await supabase.from('expenses').update(dbRow).eq('id', exp.id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteExpense(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 5.3 PROSPECTOS / CRM LEADS
  // =========================================================================
  async getLeads(): Promise<LeadRecord[]> {
    if (!isSupabaseConfigured() || !supabase) return INITIAL_LEADS;
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return INITIAL_LEADS;
      return data.map(mapDbLeadToRecord);
    } catch {
      return INITIAL_LEADS;
    }
  },

  async createLead(lead: Omit<LeadRecord, 'id' | 'createdAt'>): Promise<LeadRecord | null> {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const dbRow = mapLeadToDb(lead);
      const { data, error } = await supabase.from('leads').insert([dbRow]).select().single();
      if (error || !data) {
        console.warn('Error al registrar prospecto en Supabase:', error);
        return null;
      }
      return mapDbLeadToRecord(data);
    } catch (err) {
      console.error('Excepción al registrar prospecto en Supabase:', err);
      return null;
    }
  },

  async updateLead(lead: LeadRecord): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const dbRow = mapLeadToDb(lead);
      const { error } = await supabase.from('leads').update(dbRow).eq('id', lead.id);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteLead(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // =========================================================================
  // 5.4 COMPRA DE PLANES / PASARELA ONLINE
  // =========================================================================
  async recordPlanPurchase(details: {
    clientDni: string;
    clientName: string;
    clientEmail: string;
    planName: string;
    planType: 'ilimitado' | 'pack' | 'clase_suelta' | 'prueba';
    credits: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    receiptNumber: string;
  }): Promise<{ success: boolean; transactionId?: string; planId?: string }> {
    if (!isSupabaseConfigured() || !supabase) return { success: true };
    try {
      let clientId: string | undefined;
      const { data: clientRow } = await supabase
        .from('clients')
        .select('id')
        .eq('dni', details.clientDni.trim())
        .maybeSingle();

      if (clientRow?.id) {
        clientId = clientRow.id;
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            name: details.clientName,
            email: details.clientEmail,
            dni: details.clientDni,
            phone: '+51 900 000 000',
            status: 'activo',
            registration_method: 'manual_web',
          })
          .select('id')
          .single();
        if (newClient?.id) clientId = newClient.id;
      }

      let clientPlanId: string | undefined;
      if (clientId) {
        const { data: newPlan } = await supabase
          .from('client_plans')
          .insert({
            client_id: clientId,
            plan_name: details.planName,
            plan_type: details.planType,
            credits_initial: details.credits,
            credits_left: details.credits,
            price_paid: details.amountPaid,
            payment_method: details.paymentMethod,
            is_active: true,
          })
          .select('id')
          .single();
        if (newPlan?.id) clientPlanId = newPlan.id;
      }

      const receiptType = details.receiptNumber.startsWith('F') ? 'factura' : 'boleta';
      const category = details.planType === 'clase_suelta' ? 'clase_suelta' : (details.planType === 'pack' ? 'pack_clases' : 'membresia');

      const { data: txData } = await supabase
        .from('cash_transactions')
        .insert({
          type: 'ingreso',
          concept: `Venta Web: ${details.planName}`,
          category,
          amount: details.amountPaid,
          payment_method: details.paymentMethod,
          client_id: clientId || null,
          client_name: details.clientName,
          client_plan_id: clientPlanId || null,
          receipt_type: receiptType,
          receipt_number: details.receiptNumber,
          notes: `Pago procesado online para DNI ${details.clientDni}`,
        })
        .select('id')
        .single();

      return {
        success: true,
        transactionId: txData?.id,
        planId: clientPlanId,
      };
    } catch (err) {
      console.error('Error al registrar compra de plan en Supabase:', err);
      return { success: false };
    }
  },

  // =========================================================================
  // 6. REALTIME: SUSCRIPCIÓN EN VIVO A CHECK-INS Y RESERVAS
  // =========================================================================
  subscribeToBookings(onPayload: (payload: { eventType: string; newRecord: BookingRecord }) => void) {
    if (!isSupabaseConfigured() || !supabase) return () => {};

    const channel = supabase
      .channel('realtime:bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload: any) => {
          if (payload.new) {
            onPayload({
              eventType: payload.eventType,
              newRecord: mapDbBookingToRecord(payload.new),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // =========================================================================
  // 7. AUTENTICACIÓN REAL (SUPABASE AUTH & POSTGRES)
  // =========================================================================

  async signUpWithPassword(
    email: string,
    password: string,
    name: string,
    phone?: string,
    extraProfile?: {
      dni?: string;
      documentType?: 'dni' | 'ce' | 'pasaporte';
      birthDate?: string;
      gender?: 'femenino' | 'masculino' | 'otro';
      emergencyContact?: string;
      emergencyPhone?: string;
      medicalNotes?: string;
      registrationMethod?: 'qr' | 'manual_smartfit' | 'manual_web' | 'whatsapp' | 'receptionist_desk';
      planName?: string;
      creditsLeft?: number;
    }
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!supabase) return { success: false, error: 'Servicio Supabase no inicializado' };
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedDni = (extraProfile?.dni || '').trim() || '70000000';
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
        options: {
          data: {
            name: name.trim(),
            phone: phone?.trim() || '',
            dni: trimmedDni,
            document_type: extraProfile?.documentType || 'dni',
            birth_date: extraProfile?.birthDate || '',
            gender: extraProfile?.gender || 'otro',
            emergency_contact: extraProfile?.emergencyContact || '',
            emergency_phone: extraProfile?.emergencyPhone || '',
            medical_notes: extraProfile?.medicalNotes || '',
            registration_method: extraProfile?.registrationMethod || 'manual_smartfit',
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const { role, roleTitle } = determineUserRole(name, trimmedEmail);
      const authUser: AuthUser = {
        id: data.user?.id || `usr-${Date.now()}`,
        name: name.trim(),
        email: trimmedEmail,
        role,
        roleTitle,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=B5654A&color=fff`,
        provider: 'manual',
        phone: phone?.trim() || '+51 900 000 000',
        dni: trimmedDni,
        documentType: extraProfile?.documentType || 'dni',
        birthDate: extraProfile?.birthDate,
        gender: extraProfile?.gender,
        emergencyContact: extraProfile?.emergencyContact,
        emergencyPhone: extraProfile?.emergencyPhone,
        medicalNotes: extraProfile?.medicalNotes,
        registrationMethod: extraProfile?.registrationMethod || 'manual_smartfit',
        planName: extraProfile?.planName || (role === 'client' ? 'Alumna Registrada' : roleTitle),
        creditsLeft: extraProfile?.creditsLeft ?? (role === 'client' ? 0 : 99),
        experienceLevel: 'Principiante',
        healthConditions: extraProfile?.medicalNotes ? [extraProfile.medicalNotes] : ['Ninguna'],
      };

      // Registrar también en tabla public.clients si es alumna
      if (role === 'client') {
        try {
          const { data: insertedClient } = await supabase
            .from('clients')
            .upsert(
              {
                auth_user_id: data.user?.id || null,
                name: authUser.name,
                email: authUser.email,
                phone: authUser.phone,
                dni: authUser.dni,
                status: 'activo',
                emergency_contact: authUser.emergencyContact || null,
                emergency_phone: authUser.emergencyPhone || null,
                medical_notes: authUser.medicalNotes || null,
                document_type: authUser.documentType || 'dni',
                birth_date: authUser.birthDate || null,
                gender: authUser.gender || 'otro',
                registration_method: authUser.registrationMethod || 'manual_web',
              },
              { onConflict: 'dni' }
            )
            .select('id')
            .single();

          if (insertedClient?.id) {
            await supabase.from('client_plans').insert({
              client_id: insertedClient.id,
              plan_name: authUser.planName || 'Alumna Registrada',
              plan_type: authUser.planName?.toLowerCase().includes('ilimitad') ? 'ilimitado' : 'pack',
              credits_initial: authUser.creditsLeft ?? 0,
              credits_left: authUser.creditsLeft ?? 0,
              is_active: true,
            });

            if (data.user?.id) {
              await supabase.from('user_profiles').upsert({
                id: data.user.id,
                client_id: insertedClient.id,
                role: 'client',
                role_title: 'Alumna',
                experience_level: authUser.experienceLevel || 'Principiante',
              });
            }
          }
        } catch (clientErr) {
          console.warn('Aviso al sincronizar cliente en Supabase:', clientErr);
        }
      }

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrar cuenta' };
    }
  },

  async signInWithPassword(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    // 0. Comprobación directa de cuentas del equipo Staff (Owner & Admins)
    const staffMatch = findStaffByCredential(identifier);
    if (staffMatch) {
      const storedMasterPass =
        (typeof window !== 'undefined' && localStorage.getItem('firme_admin_password')) || '30092023';
      const staffPass = staffMatch.defaultPassword || '30092023';
      if (password.trim() === staffPass || password.trim() === storedMasterPass) {
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
        return { success: true, user: staffUser };
      }
    }

    if (!supabase) return { success: false, error: 'Servicio Supabase no inicializado' };
    try {
      let resolvedEmail = identifier.trim().toLowerCase();
      const isEmail = identifier.includes('@');

      // Si ingresó DNI o Documento, resolver correo asociado
      if (!isEmail) {
        const cleanDni = identifier.trim();
        try {
          const { data: clientRow } = await supabase
            .from('clients')
            .select('email, name, phone, dni')
            .eq('dni', cleanDni)
            .limit(1)
            .maybeSingle();

          if (clientRow?.email) {
            resolvedEmail = clientRow.email.toLowerCase();
          }
        } catch {
          // fallback
        }

        // Buscar también en memoria / local users
        if (!resolvedEmail.includes('@')) {
          try {
            const storedUsersRaw = localStorage.getItem('firme_registered_users');
            if (storedUsersRaw) {
              const stored = JSON.parse(storedUsersRaw);
              const found = stored.find(
                (u: any) => u.dni === cleanDni || (u.email && u.email.toLowerCase() === identifier.toLowerCase())
              );
              if (found && found.email) {
                resolvedEmail = found.email.toLowerCase();
              }
            }
          } catch {
            // ignore
          }
        }
      }

      if (!resolvedEmail.includes('@')) {
        return {
          success: false,
          error: 'No encontramos ninguna cuenta vinculada al DNI ' + identifier + '. Regístrate o ingresa con tu correo.',
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: resolvedEmail,
        password: password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const userMeta = data.user?.user_metadata || {};
      const rawName = userMeta.name || resolvedEmail.split('@')[0];
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const { role, roleTitle } = determineUserRole(formattedName, resolvedEmail);

      const authUser: AuthUser = {
        id: data.user?.id || `usr-${Date.now()}`,
        name: formattedName,
        email: resolvedEmail,
        role,
        roleTitle,
        avatar: userMeta.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=B5654A&color=fff`,
        provider: 'manual',
        phone: userMeta.phone || '+51 900 000 000',
        dni: userMeta.dni || identifier.trim(),
        documentType: userMeta.document_type || 'dni',
        birthDate: userMeta.birth_date,
        gender: userMeta.gender,
        emergencyContact: userMeta.emergency_contact,
        emergencyPhone: userMeta.emergency_phone,
        medicalNotes: userMeta.medical_notes,
        registrationMethod: userMeta.registration_method,
        planName: role === 'client' ? 'Alumna Registrada' : roleTitle,
        creditsLeft: role === 'client' ? 0 : 99,
        experienceLevel: 'Principiante',
        healthConditions: ['Ninguna'],
      };

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    }
  },

  mapSupabaseUserToAuthUser(user: any): AuthUser {
    const userMeta = user.user_metadata || {};
    const email = (user.email || '').trim().toLowerCase();
    const rawName = (userMeta.full_name || userMeta.name || email.split('@')[0] || 'Alumna').trim();
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const { role, roleTitle } = determineUserRole(formattedName, email);

    return {
      id: user.id || `usr-${Date.now()}`,
      name: formattedName,
      email: email,
      role,
      roleTitle,
      avatar:
        userMeta.avatar_url ||
        userMeta.picture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=B5654A&color=fff`,
      provider: user.app_metadata?.provider === 'google' ? 'google' : 'manual',
      phone: userMeta.phone || '+51 900 000 000',
      dni: userMeta.dni || '70000000',
      documentType: userMeta.document_type || 'dni',
      birthDate: userMeta.birth_date,
      gender: userMeta.gender,
      emergencyContact: userMeta.emergency_contact,
      emergencyPhone: userMeta.emergency_phone,
      medicalNotes: userMeta.medical_notes,
      registrationMethod: userMeta.registration_method,
      planName: role === 'client' ? 'Alumna Registrada' : roleTitle,
      creditsLeft: role === 'client' ? 0 : 99,
      experienceLevel: 'Principiante',
      healthConditions: ['Ninguna'],
    };
  },

  async getCurrentSessionUser(): Promise<AuthUser | null> {
    if (!supabase) return null;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return null;
      return this.mapSupabaseUserToAuthUser(session.user);
    } catch {
      return null;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    if (!supabase) return () => {};
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (
          session?.user &&
          (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED')
        ) {
          const authUser = this.mapSupabaseUserToAuthUser(session.user);
          callback(authUser);
        } else if (event === 'SIGNED_OUT') {
          callback(null);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    } catch {
      return () => {};
    }
  },

  async signInWithGoogle(): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Servicio Supabase no inicializado' };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Error al conectar con Google' };
    }
  },

  async signInWithGoogleIdToken(idToken: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    if (!supabase) return { success: false, error: 'Servicio Supabase no inicializado' };
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.user) {
        return { success: false, error: 'No se recibieron datos de usuario desde Google.' };
      }

      const authUser = this.mapSupabaseUserToAuthUser(data.user);

      // Si es alumna, sincronizar su perfil en la base de datos
      if (authUser.role === 'client') {
        try {
          await supabase.from('clients').upsert(
            {
              auth_user_id: data.user.id,
              name: authUser.name,
              email: authUser.email,
              phone: authUser.phone || '',
              dni: authUser.dni || '70000000',
              status: 'activo',
            },
            { onConflict: 'dni' }
          );
        } catch {
          // ignore
        }
      }

      return { success: true, user: authUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al autenticar con Google' };
    }
  },

  async saveClientProfile(profile: Partial<AuthUser>): Promise<boolean> {
    if (!supabase || !isSupabaseConfigured()) return false;
    try {
      const clientPayload: any = {
        name: profile.name,
        phone: profile.phone || '',
        status: 'activo',
        emergency_contact: profile.emergencyContact || null,
        emergency_phone: profile.emergencyPhone || null,
        medical_notes: profile.medicalNotes || null,
        document_type: profile.documentType || 'dni',
        birth_date: profile.birthDate || null,
        gender: profile.gender || 'otro',
        share_in_leaderboard: profile.shareInLeaderboard ?? true,
        receive_marketing_updates: profile.receiveMarketingUpdates ?? true,
        updated_at: new Date().toISOString(),
      };
      if (profile.email) clientPayload.email = profile.email.trim().toLowerCase();
      if (profile.dni) clientPayload.dni = profile.dni.trim();

      let clientRow: any = null;
      // Intento 1: Guardar con campos enriquecidos (segundo DNI, nivel, avatar)
      const enrichedPayload = {
        ...clientPayload,
        ...(profile.alternateDni ? { alternate_dni: profile.alternateDni.trim() } : {}),
        ...(profile.experienceLevel ? { experience_level: profile.experienceLevel } : {}),
        ...(profile.avatar ? { avatar_url: profile.avatar.trim() } : {}),
      };

      const { data: c1, error: err1 } = await supabase
        .from('clients')
        .upsert(enrichedPayload, { onConflict: 'dni' })
        .select('id')
        .single();

      if (err1 && err1.message && err1.message.includes('schema cache')) {
        // Fallback si la base de datos aún no tiene las columnas opcionales
        const { data: c2, error: err2 } = await supabase
          .from('clients')
          .upsert(clientPayload, { onConflict: 'dni' })
          .select('id')
          .single();
        if (err2) {
          console.warn('Error guardando perfil de cliente en Supabase:', err2.message);
          return false;
        }
        clientRow = c2;
      } else if (err1) {
        console.warn('Error guardando perfil de cliente en Supabase:', err1.message);
        return false;
      } else {
        clientRow = c1;
      }

      // Si tiene plan asignado, registrar o actualizar en client_plans
      if (clientRow?.id && (profile.planName || profile.creditsLeft !== undefined)) {
        const planName = profile.planName || 'Pase Regular';
        const planType = planName.toLowerCase().includes('ilimitad') ? 'ilimitado' : 'pack';
        const credits = profile.creditsLeft ?? 8;

        const { data: existingPlans } = await supabase
          .from('client_plans')
          .select('id')
          .eq('client_id', clientRow.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (existingPlans && existingPlans.length > 0) {
          await supabase
            .from('client_plans')
            .update({
              plan_name: planName,
              plan_type: planType,
              credits_left: credits,
            })
            .eq('id', existingPlans[0].id);
        } else {
          await supabase
            .from('client_plans')
            .insert({
              client_id: clientRow.id,
              plan_name: planName,
              plan_type: planType,
              credits_initial: credits,
              credits_left: credits,
              is_active: true,
            });
        }
      }

      return true;
    } catch (err) {
      console.error('Excepción en saveClientProfile:', err);
      return false;
    }
  },

  async signOut(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
  },
};
