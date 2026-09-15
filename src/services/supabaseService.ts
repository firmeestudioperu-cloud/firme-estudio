import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  LeadRecord,
  AuthUser,
  determineUserRole,
  findStaffByCredential,
} from '../types';
import { MOCK_CLASSES } from '../data/mockData';
import {
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_LEADS,
} from '../data/adminMockData';

// Helper para convertir nombres snake_case de Postgres a camelCase de TypeScript
export function mapDbClassToSession(row: any): ClassSession {
  const formattedTime = row.time || (row.start_time ? row.start_time.slice(0, 5) : '08:00');
  const formattedDuration = row.duration || (row.duration_min ? `${row.duration_min} min` : '50 min');
  return {
    id: row.id,
    day: row.day,
    time: formattedTime,
    name: row.name,
    instructor: row.instructor || row.instructor_name || 'Instructora FIRME',
    level: row.level || 'Principiante',
    classType: row.class_type || 'Reformer',
    duration: formattedDuration,
    totalSpots: row.total_spots ?? 8,
    occupiedSpots: row.occupied_spots ?? 0,
    focus: row.focus || '',
  };
}

export function mapSessionToDbClass(cls: ClassSession): any {
  return {
    id: cls.id,
    day: cls.day,
    time: cls.time,
    name: cls.name,
    instructor: cls.instructor,
    level: cls.level,
    class_type: cls.classType,
    duration: cls.duration,
    total_spots: cls.totalSpots,
    occupied_spots: cls.occupiedSpots,
    focus: cls.focus,
  };
}

export function mapDbBookingToRecord(row: any): BookingRecord {
  return {
    id: row.id,
    classId: row.class_id,
    className: row.class_name,
    classTime: row.class_time,
    classDay: row.class_day,
    instructor: row.instructor,
    clientName: row.client_name,
    clientEmail: row.client_email || '',
    clientPhone: row.client_phone || '',
    clientDni: row.client_dni || '',
    status: row.status,
    bookedAt: row.booked_at ? new Date(row.booked_at).toLocaleDateString('es-PE') : 'Hoy',
    bedNumber: row.bed_number ?? undefined,
    isWaitlist: row.is_waitlist ?? false,
    medicalAlert: row.medical_alert ?? undefined,
    checkInTime: row.check_in_time ?? undefined,
    whatsappReminderSent: row.whatsapp_reminder_sent ?? false,
  };
}

export function mapRecordToDbBooking(b: Partial<BookingRecord>): any {
  return {
    id: b.id,
    class_id: b.classId,
    class_name: b.className,
    class_time: b.classTime,
    class_day: b.classDay,
    instructor: b.instructor,
    client_name: b.clientName,
    client_email: b.clientEmail,
    client_phone: b.clientPhone,
    client_dni: b.clientDni,
    status: b.status || 'confirmada',
    bed_number: b.bedNumber,
    is_waitlist: b.isWaitlist || false,
    medical_alert: b.medicalAlert,
    check_in_time: b.checkInTime,
  };
}

export function mapDbClientToProfile(row: any): ClientProfile {
  return {
    id: row.id,
    name: row.name,
    dni: row.dni,
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
    registrationMethod: row.registration_method || 'manual_smartfit',
  };
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
    if (!isSupabaseConfigured() || !supabase) return true;
    try {
      const { error } = await supabase
        .from('classes')
        .update({ occupied_spots: occupiedSpots })
        .eq('id', classId);
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

  async createBooking(booking: Omit<BookingRecord, 'id' | 'bookedAt' | 'status'>): Promise<BookingRecord | null> {
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
      const dbRow = mapRecordToDbBooking({
        ...booking,
        id: `b-${Date.now()}`,
        status: 'confirmada',
      });
      const { data, error } = await supabase.from('bookings').insert([dbRow]).select().single();
      if (error || !data) {
        console.warn('Error al insertar reserva en Supabase:', error);
        return null;
      }
      return mapDbBookingToRecord(data);
    } catch (err) {
      console.error('Excepción al crear reserva en Supabase:', err);
      return null;
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
      // 1. Buscar la reserva más reciente del DNI que esté confirmada
      const { data: bookingRows, error: searchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_dni', trimmedDni)
        .neq('status', 'cancelada')
        .order('created_at', { ascending: false })
        .limit(1);

      if (searchError || !bookingRows || bookingRows.length === 0) {
        return {
          success: false,
          error: `No encontramos reserva activa para el DNI ${trimmedDni}. Acércate al counter de recepción.`,
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
      const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
      if (error || !data || data.length === 0) return INITIAL_CLIENTS;
      return data.map(mapDbClientToProfile);
    } catch {
      return INITIAL_CLIENTS;
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
          await supabase.from('clients').upsert(
            {
              name: authUser.name,
              email: authUser.email,
              phone: authUser.phone,
              dni: authUser.dni,
              current_plan: authUser.planName,
              plan_type: authUser.planName?.toLowerCase().includes('ilimitad') ? 'ilimitado' : 'pack',
              credits_left: authUser.creditsLeft ?? 0,
              status: 'activo',
              emergency_contact: authUser.emergencyContact,
              emergency_phone: authUser.emergencyPhone,
              medical_notes: authUser.medicalNotes,
              document_type: authUser.documentType,
              birth_date: authUser.birthDate,
              gender: authUser.gender,
              registration_method: authUser.registrationMethod,
            },
            { onConflict: 'dni' }
          );
        } catch {
          // ignore
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
    if (!supabase) return false;
    try {
      await supabase.from('clients').upsert(
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          dni: profile.dni,
          current_plan: profile.planName,
          credits_left: profile.creditsLeft,
          status: 'activo',
          emergency_contact: profile.emergencyContact,
          emergency_phone: profile.emergencyPhone,
          medical_notes: profile.medicalNotes,
          document_type: profile.documentType,
          birth_date: profile.birthDate,
          gender: profile.gender,
        },
        { onConflict: 'dni' }
      );
      return true;
    } catch {
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
