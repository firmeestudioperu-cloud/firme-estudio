import React from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageCircle,
  Plus,
  AlertCircle,
  Percent,
} from 'lucide-react';
import {
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  ExpenseRecord,
  LeadRecord,
  AdminSubTab,
  CashRegisterState,
} from '../../types';
import { WeeklyOccupancyBarChart } from './WeeklyOccupancyBarChart';

interface AdminDashboardTabProps {
  classes: ClassSession[];
  bookings: BookingRecord[];
  clients: ClientProfile[];
  transactions: CashTransaction[];
  expenses: ExpenseRecord[];
  leads: LeadRecord[];
  cashRegister?: CashRegisterState;
  onNavigateTab?: (tab: AdminSubTab) => void;
  onNavigateToSchedule?: () => void;
  onAddManualBooking?: (booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => void;
  onQuickOpenCashModal?: () => void;
  onQuickOpenClassModal?: () => void;
  onQuickOpenClientModal?: () => void;
  onQuickOpenExpenseModal?: () => void;
  onQuickOpenScannerModal?: () => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  classes = [],
  bookings = [],
  clients = [],
  transactions = [],
  expenses = [],
  leads = [],
  cashRegister,
  onNavigateTab,
  onNavigateToSchedule,
  onAddManualBooking,
  onQuickOpenCashModal,
  onQuickOpenClassModal,
  onQuickOpenClientModal,
  onQuickOpenExpenseModal,
  onQuickOpenScannerModal,
}) => {
  // Calculations
  const todayStr = '02/09/2026';
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const totalCashToday = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  const totalIncomeAll = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpensesAll = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncomeAll - totalExpensesAll;
  const profitMargin = totalIncomeAll > 0 ? Math.round((netProfit / totalIncomeAll) * 100) : 0;

  const totalSpots = classes.reduce((sum, c) => sum + c.totalSpots, 0);
  const occupiedSpots = classes.reduce((sum, c) => sum + c.occupiedSpots, 0);
  const occupancyRate = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

  const activeClients = clients.filter((c) => c.status === 'activo').length;
  const atRiskClients = clients.filter((c) => c.status === 'en_riesgo').length;

  const convertedLeads = leads.filter((l) => l.status === 'convertido').length;
  const leadConversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;
  const pendingLeads = leads.filter((l) => l.status === 'nuevo' || l.status === 'contactado');

  // Today's classes (example: Monday 'lun')
  const todayClasses = classes.filter((c) => c.day === 'lun');

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B5654A]/10 text-[#B5654A] text-[11px] font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Resumen Ejecutivo · Sede SJL</span>
            </div>
            <h2 className="font-fraunces text-2xl font-medium text-[#1A1815]">
              Control y Operaciones del Estudio
            </h2>
            <p className="text-xs text-[#6B655C] mt-1 max-w-2xl">
              Monitoreo en tiempo real de ingresos, aforo de camas Allegro 2, retención de alumnos y captación de prospectos para escalamiento.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (onQuickOpenCashModal ? onQuickOpenCashModal() : onNavigateTab ? onNavigateTab('caja') : undefined)}
              className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Cobro en Caja</span>
            </button>
            <button
              type="button"
              onClick={() => (onQuickOpenClientModal ? onQuickOpenClientModal() : onNavigateTab ? onNavigateTab('clientes') : undefined)}
              className="bg-[#1A1815] hover:bg-black text-[#FAF8F5] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Nuevo Alumno</span>
            </button>
            <button
              type="button"
              onClick={() => (onQuickOpenExpenseModal ? onQuickOpenExpenseModal() : onNavigateTab ? onNavigateTab('gastos') : undefined)}
              className="bg-[#EFE9DF] hover:bg-[#E4DED4] text-[#1A1815] px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-[#DDD5C9] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Gasto</span>
            </button>
            <button
              type="button"
              onClick={() => (onQuickOpenClassModal ? onQuickOpenClassModal() : onNavigateTab ? onNavigateTab('agenda') : undefined)}
              className="bg-[#EFE9DF] hover:bg-[#E4DED4] text-[#1A1815] px-3 py-2 rounded-xl text-xs font-semibold transition-colors border border-[#DDD5C9] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Nueva Clase</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Caja Hoy / Ingresos */}
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B655C] text-xs font-medium">
            <span>Cobrado Hoy en Caja</span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A1815]">
              S/. {totalCashToday.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{todayTransactions.length} operaciones registradas hoy</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4DED4] flex items-center justify-between text-[11px] text-[#6B655C]">
            <span>Ingresos acumulados:</span>
            <span className="font-semibold text-[#1A1815]">S/. {totalIncomeAll.toLocaleString('es-PE')}</span>
          </div>
        </div>

        {/* Card 2: Ocupación de Camas */}
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B655C] text-xs font-medium">
            <span>Ocupación de Camas SJL</span>
            <div className="p-1.5 rounded-md bg-[#B5654A]/10 text-[#B5654A]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A1815]">
              {occupancyRate}%
            </div>
            <div className="w-full bg-[#E4DED4] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#B5654A] h-full rounded-full transition-all duration-500"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4DED4] flex items-center justify-between text-[11px] text-[#6B655C]">
            <span>Plazas cubiertas:</span>
            <span className="font-semibold text-[#1A1815]">{occupiedSpots} de {totalSpots}</span>
          </div>
        </div>

        {/* Card 3: Clientes Activos & Retención */}
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B655C] text-xs font-medium">
            <span>Comunidad Activa</span>
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A1815]">
              {activeClients} <span className="text-xs font-normal text-[#6B655C]">alumnos activos</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>{atRiskClients} en riesgo (sin venir &gt;14d)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4DED4] flex items-center justify-between text-[11px] text-[#6B655C]">
            <span>Total registrados:</span>
            <span className="font-semibold text-[#1A1815]">{clients.length} miembros</span>
          </div>
        </div>

        {/* Card 4: Funnel de Captación / Margen Operativo */}
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6B655C] text-xs font-medium">
            <span>Captación & Conversión</span>
            <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-[#1A1815]">
              {leadConversionRate}% <span className="text-xs font-normal text-[#6B655C]">a compra</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-purple-700 font-medium mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{convertedLeads} convertidos de {leads.length} leads</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E4DED4] flex items-center justify-between text-[11px] text-[#6B655C]">
            <span>Margen neto:</span>
            <span className="font-semibold text-emerald-700">+{profitMargin}% (S/. {netProfit.toLocaleString('es-PE')})</span>
          </div>
        </div>

      </div>

      {/* Gráfico de Barras Recharts: Ocupación Promedio Semanal & Optimización de Horarios */}
      <WeeklyOccupancyBarChart
        classes={classes}
        onOpenNewClassModal={() =>
          onQuickOpenClassModal ? onQuickOpenClassModal() : onNavigateTab('agenda')
        }
        onNavigateToAgenda={() => onNavigateTab('agenda')}
      />

      {/* Two Column Layout: Today's Schedule + Financial Bar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Today's Schedule & Live Bed Occupancy */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B5654A]" />
              <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
                Clases de Hoy (Lunes en Sala)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('agenda')}
              className="text-xs text-[#B5654A] hover:text-[#9A5340] font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Agenda Completa</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todayClasses.map((cls) => {
              const pct = Math.round((cls.occupiedSpots / cls.totalSpots) * 100);
              const isFull = cls.occupiedSpots >= cls.totalSpots;
              return (
                <div
                  key={cls.id}
                  className="bg-[#F1ECE5]/40 hover:bg-[#F1ECE5] p-3.5 rounded-lg border border-[#E4DED4] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="text-sm font-bold text-[#1A1815] block">{cls.time}</span>
                      <span className="text-[10px] text-[#6B655C] block">{cls.duration}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#1A1815]">{cls.name}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#E4DED4] text-[#6B655C]">
                          {cls.classType}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B655C] mt-0.5">
                        Instructor: <strong className="text-[#1A1815]">{cls.instructor}</strong> · {cls.level}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:justify-end">
                    <div className="w-28 text-right">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[#6B655C]">Aforo:</span>
                        <span className={`font-semibold ${isFull ? 'text-rose-600' : 'text-[#1A1815]'}`}>
                          {cls.occupiedSpots}/{cls.totalSpots}
                        </span>
                      </div>
                      <div className="w-full bg-[#E4DED4] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-[#B5654A]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigateTab('agenda')}
                      className="px-2.5 py-1 text-[11px] font-medium bg-[#FAF8F5] hover:bg-[#E4DED4] text-[#1A1815] rounded border border-[#DDD5C9] transition-colors cursor-pointer"
                    >
                      Ver Camas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 col): Leads by WhatsApp to close & Cash Quick Summary */}
        <div className="space-y-6">
          
          {/* Box 1: Leads pending follow-up */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                  Prospectos por Contactar
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                {pendingLeads.length} Nuevos
              </span>
            </div>
            <p className="text-[11px] text-[#6B655C] mb-3">
              Leads recientes interesados en probar Reformer en la sede SJL:
            </p>

            <div className="space-y-2.5">
              {pendingLeads.slice(0, 3).map((lead) => (
                <div
                  key={lead.id}
                  className="p-2.5 rounded-lg bg-[#F1ECE5]/50 border border-[#E4DED4] flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-[#1A1815] block">{lead.name}</span>
                    <span className="text-[10px] text-[#6B655C] capitalize">
                      Vía {lead.channel} · {lead.interest}
                    </span>
                  </div>
                  <a
                    href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(
                      lead.name || 'Alumna'
                    )},%20te%20saludamos%20de%20FIRME%20STUDIO%20SJL.%20¿Te%20gustaría%20agendar%20tu%20clase%20de%20prueba%20de%20Reformer?`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-[#FAF8F5] text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Enviar WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Chat</span>
                  </a>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('captacion')}
              className="w-full mt-3 text-center text-xs text-[#B5654A] hover:text-[#9A5340] font-medium py-1.5 border border-[#E4DED4] rounded-lg transition-colors cursor-pointer bg-[#F1ECE5]/30 hover:bg-[#F1ECE5]"
            >
              Ver Pipeline Comercial Completo →
            </button>
          </div>

          {/* Box 2: Quick Financial Balance Summary */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#B5654A]" />
                <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
                  Balance Financiero SJL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('reportes')}
                className="text-[11px] text-[#B5654A] font-medium hover:underline cursor-pointer"
              >
                Reporte
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#E4DED4]/60">
                <span className="text-[#6B655C] flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> Ingresos Totales
                </span>
                <span className="font-semibold text-emerald-700">
                  + S/. {totalIncomeAll.toLocaleString('es-PE')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#E4DED4]/60">
                <span className="text-[#6B655C] flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" /> Gastos Operativos
                </span>
                <span className="font-semibold text-rose-700">
                  - S/. {totalExpensesAll.toLocaleString('es-PE')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1.5 text-sm">
                <span className="font-medium text-[#1A1815]">Utilidad Neta:</span>
                <span className="font-bold text-[#B5654A]">
                  S/. {netProfit.toLocaleString('es-PE')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
