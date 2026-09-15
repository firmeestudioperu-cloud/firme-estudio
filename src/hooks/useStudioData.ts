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
      supabaseService.getClients().then((clients) => {
        if (isMounted && clients && clients.length > 0) {
          setClientsList(clients);
        }
      });
      supabaseService.getCashTransactions().then((txs) => {
        if (isMounted && txs && txs.length > 0) {
          setTransactionsList(txs);
        }
      });
      supabaseService.getExpenses().then((exps) => {
        if (isMounted && exps && exps.length > 0) {
          setExpensesList(exps);
        }
      });
      supabaseService.getLeads().then((lds) => {
        if (isMounted && lds && lds.length > 0) {
          setLeadsList(lds);
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
    const tempId = `c-${Date.now()}`;
    setClassesList((prev) => [{ id: tempId, ...newClass }, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseService.createClass(newClass).then((created) => {
        if (created) {
          setClassesList((prev) => prev.map((c) => (c.id === tempId ? created : c)));
        } else {
          showToast?.('Error al guardar clase', 'No se pudo sincronizar la nueva clase con la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al guardar clase', `Fallo de conexión al registrar la clase: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateClass = useCallback((updatedClass: ClassSession) => {
    setClassesList((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
    if (isSupabaseConfigured()) {
      supabaseService.updateClass(updatedClass).then((success) => {
        if (!success) {
          showToast?.('Error al actualizar clase', 'No se pudieron guardar las modificaciones de la clase en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al actualizar clase', `Fallo de conexión al guardar cambios: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleDeleteClass = useCallback((classId: string) => {
    setClassesList((prev) => prev.filter((c) => c.id !== classId));
    if (isSupabaseConfigured()) {
      supabaseService.deleteClass(classId).then((success) => {
        if (!success) {
          showToast?.('Error al eliminar clase', 'No se pudo eliminar la clase de la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al eliminar clase', `Fallo de conexión al eliminar la clase: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

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
    if (isSupabaseConfigured()) {
      supabaseService.createBooking(record).then((res) => {
        if (!res) {
          showToast?.('Error al guardar reserva', 'La reserva se registró localmente pero no se pudo sincronizar con la base de datos.', true);
        }
      }).catch((err) => {
        showToast?.('Error al guardar reserva', `Fallo de conexión al guardar la reserva: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateBookingStatus = useCallback((
    bookingId: string,
    status: 'confirmada' | 'asistio' | 'cancelada'
  ) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
    if (isSupabaseConfigured()) {
      supabaseService.updateBookingStatus(bookingId, status).then((success) => {
        if (!success) {
          showToast?.('Error al actualizar reserva', 'No se pudo actualizar el estado de la reserva en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al actualizar reserva', `Fallo de conexión al actualizar la reserva: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleCheckInBooking = useCallback((updatedBooking: BookingRecord) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
    if (isSupabaseConfigured()) {
      if (updatedBooking.clientDni) {
        supabaseService.performTotemCheckIn(updatedBooking.clientDni).then((res) => {
          if (res && !res.success) {
            showToast?.('Error en Check-In', res.error || 'No se pudo validar la asistencia en la base de datos.', true);
          }
        }).catch((err) => {
          showToast?.('Error en Check-In', `Fallo al registrar check-in: ${err?.message || 'Error desconocido'}`, true);
        });
      } else {
        supabaseService.updateBookingStatus(updatedBooking.id, 'asistio').then((success) => {
          if (!success) {
            showToast?.('Error en Check-In', 'No se pudo marcar la asistencia en la base de datos.', true);
          }
        }).catch((err) => {
          showToast?.('Error en Check-In', `Fallo al marcar asistencia: ${err?.message || 'Error desconocido'}`, true);
        });
      }
    }
  }, [showToast]);

  const handleAssignBed = useCallback((bookingId: string, bedNumber: number) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, bedNumber } : b))
    );
    if (isSupabaseConfigured()) {
      supabaseService.assignBed(bookingId, bedNumber).then((success) => {
        if (!success) {
          showToast?.('Error al asignar cama', 'No se pudo registrar la cama en la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al asignar cama', `Fallo al guardar la cama: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  // CRUD: Clients
  const handleAddClient = useCallback((clientData: Omit<ClientProfile, 'id'>) => {
    const tempId = `cli-${Date.now()}`;
    const newClient: ClientProfile = {
      ...clientData,
      id: tempId,
    };
    setClientsList((prev) => [newClient, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseService.createClient(clientData).then((created) => {
        if (created) {
          setClientsList((prev) => prev.map((c) => (c.id === tempId ? created : c)));
        } else {
          showToast?.('Error al guardar alumna', 'No se pudo registrar la alumna en la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al guardar alumna', `Fallo de conexión al guardar alumna: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateClient = useCallback((updatedClient: ClientProfile) => {
    setClientsList((prev) =>
      prev.map((c) => (c.id === updatedClient.id ? updatedClient : c))
    );
    if (isSupabaseConfigured()) {
      supabaseService.updateClient(updatedClient).then((success) => {
        if (!success) {
          showToast?.('Error al actualizar alumna', 'No se pudieron guardar las modificaciones de la alumna en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al actualizar alumna', `Fallo de conexión al actualizar datos: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleDeleteClient = useCallback((clientId: string) => {
    setClientsList((prev) => prev.filter((c) => c.id !== clientId));
    if (isSupabaseConfigured()) {
      supabaseService.deleteClient(clientId).then((success) => {
        if (!success) {
          showToast?.('Error al eliminar alumna', 'No se pudo eliminar la alumna de la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al eliminar alumna', `Fallo de conexión al eliminar alumna: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateClientCredits = useCallback((clientId: string, credits: number) => {
    setClientsList((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updated = { ...c, creditsLeft: credits };
          if (isSupabaseConfigured()) {
            supabaseService.updateClient(updated).then((success) => {
              if (!success) {
                showToast?.('Error al actualizar créditos', 'No se pudo sincronizar el saldo de clases en Supabase.', true);
              }
            }).catch((err) => {
              showToast?.('Error al actualizar créditos', `Fallo al actualizar créditos: ${err?.message || 'Error desconocido'}`, true);
            });
          }
          return updated;
        }
        return c;
      })
    );
  }, [showToast]);

  // CRUD: Transactions & Cash Register
  const handleAddTransaction = useCallback((txData: Omit<CashTransaction, 'id'>) => {
    const tempId = `tx-${Date.now()}`;
    const newTx: CashTransaction = {
      ...txData,
      id: tempId,
    };
    setTransactionsList((prev) => [newTx, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseService.createCashTransaction(txData).then((created) => {
        if (created) {
          setTransactionsList((prev) => prev.map((t) => (t.id === tempId ? created : t)));
        } else {
          showToast?.('Error en caja', 'El movimiento se registró localmente pero no se pudo guardar en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error en caja', `Fallo al guardar movimiento de caja: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateTransaction = useCallback((updatedTx: CashTransaction) => {
    setTransactionsList((prev) =>
      prev.map((t) => (t.id === updatedTx.id ? updatedTx : t))
    );
    if (isSupabaseConfigured()) {
      supabaseService.updateCashTransaction(updatedTx).then((success) => {
        if (!success) {
          showToast?.('Error en caja', 'No se pudo actualizar la transacción en la base de datos.', true);
        }
      }).catch((err) => {
        showToast?.('Error en caja', `Fallo al actualizar movimiento: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleDeleteTransaction = useCallback((txId: string) => {
    setTransactionsList((prev) => prev.filter((t) => t.id !== txId));
    if (isSupabaseConfigured()) {
      supabaseService.deleteCashTransaction(txId).then((success) => {
        if (!success) {
          showToast?.('Error en caja', 'No se pudo eliminar el movimiento de la base de datos.', true);
        }
      }).catch((err) => {
        showToast?.('Error en caja', `Fallo al eliminar movimiento: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

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
    const tempId = `exp-${Date.now()}`;
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: tempId,
    };
    setExpensesList((prev) => [newExpense, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseService.createExpense(expenseData).then((created) => {
        if (created) {
          setExpensesList((prev) => prev.map((e) => (e.id === tempId ? created : e)));
        } else {
          showToast?.('Error al guardar gasto', 'El gasto se guardó localmente pero no se pudo sincronizar con Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al guardar gasto', `Fallo al guardar gasto: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateExpense = useCallback((updatedExpense: ExpenseRecord) => {
    setExpensesList((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
    if (isSupabaseConfigured()) {
      supabaseService.updateExpense(updatedExpense).then((success) => {
        if (!success) {
          showToast?.('Error al actualizar gasto', 'No se pudieron guardar las modificaciones del gasto en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al actualizar gasto', `Fallo al actualizar gasto: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleDeleteExpense = useCallback((expenseId: string) => {
    setExpensesList((prev) => prev.filter((e) => e.id !== expenseId));
    if (isSupabaseConfigured()) {
      supabaseService.deleteExpense(expenseId).then((success) => {
        if (!success) {
          showToast?.('Error al eliminar gasto', 'No se pudo eliminar el gasto de la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al eliminar gasto', `Fallo al eliminar gasto: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateExpenseStatus = useCallback((id: string, status: 'pagado' | 'pendiente') => {
    setExpensesList((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, status };
          if (isSupabaseConfigured()) {
            supabaseService.updateExpense(updated).then((success) => {
              if (!success) {
                showToast?.('Error al actualizar gasto', 'No se pudo actualizar el estado de pago del gasto en Supabase.', true);
              }
            }).catch((err) => {
              showToast?.('Error al actualizar gasto', `Fallo al actualizar estado de gasto: ${err?.message || 'Error desconocido'}`, true);
            });
          }
          return updated;
        }
        return e;
      })
    );
  }, [showToast]);

  // CRUD: Leads
  const handleAddLead = useCallback((leadData: Omit<LeadRecord, 'id' | 'createdAt'>) => {
    const now = new Date();
    const tempId = `lead-${Date.now()}`;
    const newLead: LeadRecord = {
      ...leadData,
      id: tempId,
      createdAt: `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`,
    };
    setLeadsList((prev) => [newLead, ...prev]);
    if (isSupabaseConfigured()) {
      supabaseService.createLead(leadData).then((created) => {
        if (created) {
          setLeadsList((prev) => prev.map((l) => (l.id === tempId ? created : l)));
        } else {
          showToast?.('Error al guardar prospecto', 'El prospecto se guardó localmente pero falló el registro en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al guardar prospecto', `Fallo al registrar prospecto: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateLead = useCallback((updatedLead: LeadRecord) => {
    setLeadsList((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    if (isSupabaseConfigured()) {
      supabaseService.updateLead(updatedLead).then((success) => {
        if (!success) {
          showToast?.('Error al actualizar prospecto', 'No se pudieron guardar las modificaciones del prospecto en Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al actualizar prospecto', `Fallo al actualizar prospecto: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleDeleteLead = useCallback((leadId: string) => {
    setLeadsList((prev) => prev.filter((l) => l.id !== leadId));
    if (isSupabaseConfigured()) {
      supabaseService.deleteLead(leadId).then((success) => {
        if (!success) {
          showToast?.('Error al eliminar prospecto', 'No se pudo eliminar el prospecto de la base de datos de Supabase.', true);
        }
      }).catch((err) => {
        showToast?.('Error al eliminar prospecto', `Fallo al eliminar prospecto: ${err?.message || 'Error desconocido'}`, true);
      });
    }
  }, [showToast]);

  const handleUpdateLeadStatus = useCallback((leadId: string, status: LeadRecord['status']) => {
    setLeadsList((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const updated = { ...l, status };
          if (isSupabaseConfigured()) {
            supabaseService.updateLead(updated).then((success) => {
              if (!success) {
                showToast?.('Error al actualizar prospecto', 'No se pudo actualizar el estado del prospecto en Supabase.', true);
              }
            }).catch((err) => {
              showToast?.('Error al actualizar prospecto', `Fallo al actualizar estado: ${err?.message || 'Error desconocido'}`, true);
            });
          }
          return updated;
        }
        return l;
      })
    );
  }, [showToast]);

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
        if (isSupabaseConfigured()) {
          supabaseService.createClient(newClient).then((res) => {
            if (!res) {
              showToast?.('Aviso de Sincronización', 'La alumna se dio de alta en el navegador pero no se pudo sincronizar en la nube.', true);
            }
          }).catch((err) => {
            showToast?.('Error al sincronizar alumna', `Fallo al enviar a la nube: ${err?.message || 'Error desconocido'}`, true);
          });
        }
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
