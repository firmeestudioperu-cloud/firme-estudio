import { useState, useEffect, useCallback } from 'react';
import { studioApi } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { MOCK_CLASSES } from '../data/mockData';
import {
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_LEADS,
  INITIAL_CASH_STATE,
  INITIAL_BOOKINGS,
} from '../data/adminMockData';
import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  CashRegisterState,
} from '../types';

interface UseStudioDataOptions {
  showToast?: (title: string, message: string, isAlert?: boolean) => void;
}

export function useStudioData(options?: UseStudioDataOptions) {
  const { showToast } = options || {};

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

  // Sync with Backend API and Supabase on mount
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
    }

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
    };
  }, []);

  // CRUD: Classes
  const handleAddClass = useCallback((newClass: Omit<ClassSession, 'id'>) => {
    const id = `c-${Date.now()}`;
    setClassesList((prev) => [{ id, ...newClass }, ...prev]);
  }, []);

  const handleUpdateClass = useCallback((updatedClass: ClassSession) => {
    setClassesList((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
  }, []);

  const handleDeleteClass = useCallback((classId: string) => {
    setClassesList((prev) => prev.filter((c) => c.id !== classId));
  }, []);

  const handleUpdateSpots = useCallback((classId: string, delta: number) => {
    setClassesList((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const newOccupied = Math.max(0, Math.min(c.totalSpots, c.occupiedSpots + delta));
          return { ...c, occupiedSpots: newOccupied };
        }
        return c;
      })
    );
  }, []);

  // CRUD: Bookings
  const handleAddManualBooking = useCallback((booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => {
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
  }, []);

  const handleUpdateBookingStatus = useCallback((
    bookingId: string,
    status: 'confirmada' | 'asistio' | 'cancelada'
  ) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  }, []);

  const handleCheckInBooking = useCallback((updatedBooking: BookingRecord) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  }, []);

  const handleAssignBed = useCallback((bookingId: string, bedNumber: number) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bedNumber } : b))
    );
  }, []);

  // CRUD: Clients
  const handleAddClient = useCallback((clientData: Omit<ClientProfile, 'id'>) => {
    const newClient: ClientProfile = {
      ...clientData,
      id: `cli-${Date.now()}`,
    };
    setClientsList((prev) => [newClient, ...prev]);
  }, []);

  const handleUpdateClient = useCallback((updatedClient: ClientProfile) => {
    setClientsList((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
  }, []);

  const handleDeleteClient = useCallback((clientId: string) => {
    setClientsList((prev) => prev.filter((c) => c.id !== clientId));
  }, []);

  const handleUpdateClientCredits = useCallback((clientId: string, credits: number) => {
    setClientsList((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, creditsLeft: credits } : c))
    );
  }, []);

  // CRUD: Transactions & Cash Register
  const handleAddTransaction = useCallback((txData: Omit<CashTransaction, 'id'>) => {
    const newTx: CashTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactionsList((prev) => [newTx, ...prev]);
  }, []);

  const handleUpdateTransaction = useCallback((updatedTx: CashTransaction) => {
    setTransactionsList((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
  }, []);

  const handleDeleteTransaction = useCallback((txId: string) => {
    setTransactionsList((prev) => prev.filter((t) => t.id !== txId));
  }, []);

  const handleToggleCashRegister = useCallback(() => {
    setCashRegister((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      openedAt: !prev.isOpen ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : prev.openedAt,
      closedAt: prev.isOpen ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : undefined,
    }));
  }, []);

  // CRUD: Expenses
  const handleAddExpense = useCallback((expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpensesList((prev) => [newExpense, ...prev]);
  }, []);

  const handleUpdateExpense = useCallback((updatedExpense: ExpenseRecord) => {
    setExpensesList((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  }, []);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    setExpensesList((prev) => prev.filter((e) => e.id !== expenseId));
  }, []);

  const handleUpdateExpenseStatus = useCallback((id: string, status: 'pagado' | 'pendiente') => {
    setExpensesList((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  }, []);

  // CRUD: Leads
  const handleAddLead = useCallback((leadData: Omit<LeadRecord, 'id' | 'createdAt'>) => {
    const now = new Date();
    const newLead: LeadRecord = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setLeadsList((prev) => [newLead, ...prev]);
  }, []);

  const handleUpdateLead = useCallback((updatedLead: LeadRecord) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
  }, []);

  const handleDeleteLead = useCallback((leadId: string) => {
    setLeadsList((prev) => prev.filter((l) => l.id !== leadId));
  }, []);

  const handleUpdateLeadStatus = useCallback((leadId: string, status: LeadRecord['status']) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
  }, []);

  const handleConvertLeadToClient = useCallback((lead: LeadRecord) => {
    // 1. Mark lead as converted
    handleUpdateLeadStatus(lead.id, 'convertido');

    // 2. Add as client if not already present
    setClientsList((prev) => {
      const existing = prev.find((c) => c.phone.replace(/\D/g, '') === lead.phone.replace(/\D/g, ''));
      if (!existing) {
        const newClient: ClientProfile = {
          id: `cli-${Date.now()}`,
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
        };
        return [newClient, ...prev];
      }
      return prev;
    });

    if (showToast) {
      showToast(
        '¡Prospecto Convertido con Éxito!',
        `${lead.name} ha sido dado de alta en la base de datos de Alumnos con Pack 8.`
      );
    }
  }, [handleUpdateLeadStatus, showToast]);

  // Data Reset / Clear
  const handleResetData = useCallback(() => {
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
  }, []);

  const handleClearDemoData = useCallback(() => {
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
    if (showToast) {
      showToast(
        'Plataforma en Limpio',
        'Se han eliminado los datos de prueba. Ahora verás solo la información real que registres.'
      );
    }
  }, [showToast]);

  return {
    classesList,
    setClassesList,
    bookingsList,
    setBookingsList,
    clientsList,
    setClientsList,
    transactionsList,
    setTransactionsList,
    expensesList,
    setExpensesList,
    leadsList,
    setLeadsList,
    cashRegister,
    setCashRegister,
    // Handlers
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
  };
}
