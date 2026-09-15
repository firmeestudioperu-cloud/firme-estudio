import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  CashRegisterState,
  WhatsAppMessageLog,
  WhatsAppTemplate,
} from '../types';

const API_BASE = '/api';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  environment: string;
  version: string;
  uptimeSeconds?: number;
  system?: {
    nodeVersion: string;
    rssMemoryMb: number;
    heapUsedMb: number;
    heapTotalMb?: number;
  };
  persistence?: {
    lastSavedAt: string | null;
    isSaving: boolean;
    hasPendingSave: boolean;
  };
  metrics: {
    totalClients: number;
    activeClients: number;
    totalRevenue: number;
    totalExpenses: number;
    netBalance: number;
    totalBookings: number;
    confirmedBookings: number;
    activeLeads: number;
    totalClasses: number;
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error en la petición al servidor');
  }
  return data;
}

export const studioApi = {
  // Health & Server info
  getHealth: () => request<HealthResponse>('/health'),

  // Classes
  getClasses: (day?: string) =>
    request<{ success: boolean; data: ClassSession[] }>(day ? `/classes?day=${day}` : '/classes'),
  createClass: (cls: Omit<ClassSession, 'id' | 'occupiedSpots'>) =>
    request<{ success: boolean; data: ClassSession }>('/classes', {
      method: 'POST',
      body: JSON.stringify(cls),
    }),
  updateClass: (id: string, update: Partial<ClassSession>) =>
    request<{ success: boolean; data: ClassSession }>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    }),
  deleteClass: (id: string) =>
    request<{ success: boolean; message: string }>(`/classes/${id}`, {
      method: 'DELETE',
    }),

  // Bookings
  getBookings: (params?: { classId?: string; clientEmail?: string; status?: string; page?: number; limit?: number }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return request<{ success: boolean; data: BookingRecord[]; count?: number; pagination?: PaginationMeta }>(`/bookings${qs}`);
  },
  createBooking: (booking: Omit<BookingRecord, 'id' | 'bookedAt' | 'status'>) =>
    request<{ success: boolean; data: BookingRecord; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
  updateBookingStatus: (id: string, status: BookingRecord['status']) =>
    request<{ success: boolean; data: BookingRecord }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  checkInBooking: (id: string, bedNumber?: number) =>
    request<{ success: boolean; data: BookingRecord; message: string }>(`/bookings/${id}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber }),
    }),
  assignBed: (id: string, bedNumber: number) =>
    request<{ success: boolean; data: BookingRecord; message: string }>(`/bookings/${id}/assign-bed`, {
      method: 'POST',
      body: JSON.stringify({ bedNumber }),
    }),
  cancelBookingWithRefund: (id: string) =>
    request<{ success: boolean; data: BookingRecord; refunded: boolean; nextWaitlistCandidate?: any; message: string }>(
      `/bookings/${id}/cancel-with-refund`,
      { method: 'POST' }
    ),
  deleteBooking: (id: string) =>
    request<{ success: boolean; message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    }),

  // Clients
  getClients: (searchOrParams?: string | { search?: string; status?: string; planType?: string; page?: number; limit?: number }) => {
    let qs = '';
    if (typeof searchOrParams === 'string') {
      qs = searchOrParams ? `?search=${encodeURIComponent(searchOrParams)}` : '';
    } else if (searchOrParams && typeof searchOrParams === 'object') {
      qs = '?' + new URLSearchParams(Object.entries(searchOrParams).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString();
    }
    return request<{ success: boolean; data: ClientProfile[]; count?: number; pagination?: PaginationMeta }>(`/clients${qs}`);
  },
  createClient: (client: Omit<ClientProfile, 'id' | 'joinDate' | 'lastVisit' | 'totalAttended' | 'status'>) =>
    request<{ success: boolean; data: ClientProfile }>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),
  updateClient: (id: string, update: Partial<ClientProfile>) =>
    request<{ success: boolean; data: ClientProfile }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    }),
  deleteClient: (id: string) =>
    request<{ success: boolean; message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    }),

  // Finance & Cash Register
  getCashRegister: () => request<{ success: boolean; data: CashRegisterState }>('/finance/register'),
  toggleCashRegister: () => request<{ success: boolean; data: CashRegisterState; message: string }>('/finance/register/toggle', { method: 'POST' }),
  getTransactions: (params?: { paymentMethod?: string; category?: string; date?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return request<{ success: boolean; data: CashTransaction[]; totalAmount: number; count?: number; pagination?: PaginationMeta }>(`/finance/transactions${qs}`);
  },
  createTransaction: (tx: Omit<CashTransaction, 'id'>) =>
    request<{ success: boolean; data: CashTransaction }>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    }),
  updateTransaction: (id: string, update: Partial<CashTransaction>) =>
    request<{ success: boolean; data: CashTransaction }>(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    }),
  deleteTransaction: (id: string) =>
    request<{ success: boolean; message: string }>(`/finance/transactions/${id}`, {
      method: 'DELETE',
    }),

  // Expenses
  getExpenses: (params?: { category?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
    const qs = params
      ? '?' + new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
      : '';
    return request<{ success: boolean; data: ExpenseRecord[]; totalAmount: number; count?: number; pagination?: PaginationMeta }>(`/finance/expenses${qs}`);
  },
  createExpense: (exp: Omit<ExpenseRecord, 'id'>) =>
    request<{ success: boolean; data: ExpenseRecord }>('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(exp),
    }),
  updateExpense: (id: string, update: Partial<ExpenseRecord>) =>
    request<{ success: boolean; data: ExpenseRecord }>(`/finance/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    }),
  deleteExpense: (id: string) =>
    request<{ success: boolean; message: string }>(`/finance/expenses/${id}`, {
      method: 'DELETE',
    }),

  // Leads
  getLeads: () => request<{ success: boolean; data: LeadRecord[] }>('/leads'),
  createLead: (lead: Omit<LeadRecord, 'id' | 'createdAt'>) =>
    request<{ success: boolean; data: LeadRecord }>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    }),
  updateLead: (id: string, update: Partial<LeadRecord>) =>
    request<{ success: boolean; data: LeadRecord }>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    }),
  updateLeadStatus: (id: string, status: LeadRecord['status']) =>
    request<{ success: boolean; data: LeadRecord }>(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  convertLead: (id: string, payload: { dni?: string; plan?: string; credits?: number }) =>
    request<{ success: boolean; data: { lead: LeadRecord; client: ClientProfile }; message: string }>(
      `/leads/${id}/convert`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  deleteLead: (id: string) =>
    request<{ success: boolean; message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    }),

  // Gemini AI Operations & Biomechanics
  getStudioInsights: () =>
    request<{
      success: boolean;
      source: string;
      insights: {
        summary: string;
        recommendations: string[];
        retentionTip: string;
        projectedRevenue?: string;
      };
    }>('/ai/studio-insights', { method: 'POST' }),

  getBiomechanicsAdvice: (payload: { clientCondition: string; classFocus?: string; exerciseName?: string }) =>
    request<{
      success: boolean;
      source: string;
      adaptation: {
        condition: string;
        recommendedSprings: string;
        headrestPosition: string;
        contraindications: string[];
        suggestedModifications: string;
        instructorCue?: string;
      };
    }>('/ai/biomechanics-advisor', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  chatWithStudioAi: (payload: { message: string; history?: Array<{ role: 'user' | 'model'; text: string }> }) =>
    request<{
      success: boolean;
      source: string;
      reply: string;
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // WhatsApp Automations & Messaging
  getWhatsAppTemplates: () =>
    request<{ success: boolean; data: WhatsAppTemplate[] }>('/whatsapp/templates'),

  getWhatsAppLogs: () =>
    request<{ success: boolean; data: WhatsAppMessageLog[] }>('/whatsapp/logs'),

  logWhatsAppSend: (payload: { toName: string; toPhone: string; type: string; content?: string }) =>
    request<{ success: boolean; data: WhatsAppMessageLog }>('/whatsapp/send-log', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
