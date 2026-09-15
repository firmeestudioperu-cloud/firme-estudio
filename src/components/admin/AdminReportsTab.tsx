import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  PieChart,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import {
  CashTransaction,
  ExpenseRecord,
  ClientProfile,
  LeadRecord,
  ClassSession,
  BookingRecord,
  CashRegisterState,
  AdminSubTab,
} from '../../types';
import { WeeklyOccupancyBarChart } from './WeeklyOccupancyBarChart';
import { AdminDashboardTab } from './AdminDashboardTab';

interface AdminReportsTabProps {
  classes: ClassSession[];
  clients: ClientProfile[];
  transactions: CashTransaction[];
  expenses: ExpenseRecord[];
  leads: LeadRecord[];
  bookings?: BookingRecord[];
  cashRegister?: CashRegisterState;
  onNavigateTab?: (tab: AdminSubTab) => void;
  onNavigateToSchedule?: () => void;
  onAddManualBooking?: (booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => void;
  onQuickOpenCashModal?: () => void;
  onQuickOpenClassModal?: () => void;
  onQuickOpenClientModal?: () => void;
  onQuickOpenExpenseModal?: () => void;
  onQuickOpenScannerModal?: () => void;
  initialSubView?: 'finanzas' | 'dashboard';
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({
  classes = [],
  clients = [],
  transactions = [],
  expenses = [],
  leads = [],
  bookings = [],
  cashRegister,
  onNavigateTab,
  onNavigateToSchedule,
  onAddManualBooking,
  onQuickOpenCashModal,
  onQuickOpenClassModal,
  onQuickOpenClientModal,
  onQuickOpenExpenseModal,
  onQuickOpenScannerModal,
  initialSubView,
}) => {
  const [activeView, setActiveView] = useState<'finanzas' | 'dashboard'>(initialSubView || 'finanzas');
  const [reportPeriod, setReportPeriod] = useState<'mes_actual' | 'historico'>('mes_actual');

  // Calculations
  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const marginPct = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Breakdown by product category
  const categoryTotals: Record<string, number> = {};
  transactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Instructor stats
  const instructorStats: Record<string, { sessions: number; totalSpots: number; occupied: number }> = {};
  classes.forEach((c) => {
    const inst = c.instructor || 'Staff';
    if (!instructorStats[inst]) {
      instructorStats[inst] = { sessions: 0, totalSpots: 0, occupied: 0 };
    }
    instructorStats[inst].sessions += 1;
    instructorStats[inst].totalSpots += c.totalSpots;
    instructorStats[inst].occupied += c.occupiedSpots;
  });

  // CSV Export utility
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) =>
      Object.values(obj)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCash = () => {
    const data = transactions.map((t) => ({
      Comprobante: t.receiptNumber,
      Fecha: t.date,
      Hora: t.time,
      Concepto: t.concept,
      Monto_PEN: t.amount,
      Metodo_Pago: t.paymentMethod,
      Cliente: t.clientName,
    }));
    exportToCSV(data, 'firme_estudio_caja_ingresos.csv');
  };

  const handleExportExpenses = () => {
    const data = expenses.map((e) => ({
      Descripcion: e.description,
      Categoria: e.category,
      Monto_PEN: e.amount,
      Fecha: e.date,
      Proveedor: e.recipient,
      Estado: e.status,
      Comprobante: e.receiptNumber,
    }));
    exportToCSV(data, 'firme_estudio_gastos_egresos.csv');
  };

  const handleExportClients = () => {
    const data = clients.map((c) => ({
      Nombre: c.name,
      DNI: c.dni,
      Telefono: c.phone,
      Email: c.email,
      Plan: c.currentPlan,
      Creditos_Restantes: c.creditsLeft,
      Estado: c.status,
      Fecha_Ingreso: c.joinDate,
      Notas_Medicas: c.medicalNotes || '',
    }));
    exportToCSV(data, 'firme_estudio_alumnos_activos.csv');
  };

  const handleExportLeads = () => {
    const data = leads.map((l) => ({
      Nombre: l.name,
      Telefono: l.phone,
      Canal: l.channel,
      Interes: l.interest,
      Estado: l.status,
      Fecha_Clase_Prueba: l.trialDate || '',
      Notas: l.notes || '',
    }));
    exportToCSV(data, 'firme_estudio_captacion_leads.csv');
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs: Métricas Financieras vs Resumen Diario (Dashboard) */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] p-1.5 rounded-2xl flex items-center gap-1.5 w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveView('finanzas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'finanzas'
              ? 'bg-[#1A1815] text-white shadow-xs'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#B5654A]" />
          <span>Análisis Financiero & Métricas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeView === 'dashboard'
              ? 'bg-[#1A1815] text-white shadow-xs'
              : 'text-[#6B655C] hover:text-[#1A1815] hover:bg-white/60'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resumen Operativo (Hoy)</span>
        </button>
      </div>

      {activeView === 'dashboard' ? (
        <AdminDashboardTab
          classes={classes}
          bookings={bookings}
          clients={clients}
          transactions={transactions}
          expenses={expenses}
          leads={leads}
          cashRegister={cashRegister}
          onNavigateTab={onNavigateTab}
          onNavigateToSchedule={onNavigateToSchedule}
          onAddManualBooking={onAddManualBooking}
          onQuickOpenCashModal={onQuickOpenCashModal}
          onQuickOpenClassModal={onQuickOpenClassModal}
          onQuickOpenClientModal={onQuickOpenClientModal}
          onQuickOpenExpenseModal={onQuickOpenExpenseModal}
          onQuickOpenScannerModal={onQuickOpenScannerModal}
        />
      ) : (
        <>
          {/* Top Header */}
          <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-fraunces text-xl font-medium text-[#1A1815]">
                Reportes Financieros & Operativos
              </h2>
          <p className="text-xs text-[#6B655C] mt-0.5">
            Métricas consolidadas de rentabilidad, aforo por instructor y descarga de data en Excel / CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded-lg text-xs font-medium border border-[#DDD5C9] transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Resumen</span>
          </button>
        </div>
      </div>

      {/* Financial Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B655C]">
            <span>Ingresos Totales (Ventas)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-2">
            S/. {totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            {transactions.length} transacciones registradas
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B655C]">
            <span>Egresos & Costos Operativos</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-800 mt-2">
            S/. {totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#6B655C] mt-1">
            Alquiler, sueldos, mantenimiento y servicios
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-[#E4DED4] p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6B655C]">
            <span>Utilidad Neta / Margen</span>
            <Sparkles className="w-4 h-4 text-[#B5654A]" />
          </div>
          <div className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-[#B5654A]' : 'text-rose-700'}`}>
            S/. {netProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Margen operativo de {marginPct}%
          </div>
        </div>
      </div>

      {/* Gráfico Recharts de Ocupación Promedio Semanal */}
      <WeeklyOccupancyBarChart classes={classes} />

      {/* Two Column Layout: Instructor Performance + Income by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Box 1: Instructor Performance & Occupancy */}
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
            Rendimiento & Aforo por Profesor
          </h3>

          <div className="space-y-3">
            {Object.entries(instructorStats).map(([name, stat]) => {
              const occPct = stat.totalSpots > 0 ? Math.round((stat.occupied / stat.totalSpots) * 100) : 0;
              return (
                <div
                  key={name}
                  className="p-3.5 bg-[#F1ECE5]/50 border border-[#E4DED4] rounded-xl flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-xs text-[#1A1815] block">{name}</span>
                      <span className="text-[11px] text-[#6B655C]">
                        {stat.sessions} clases asignadas por semana
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#B5654A]">
                      {occPct}% ocupación
                    </span>
                  </div>

                  <div className="w-full bg-[#E4DED4] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B5654A] rounded-full transition-all duration-500"
                      style={{ width: `${occPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-[#6B655C]">
                    <span>Alumnos atendidos: {stat.occupied}</span>
                    <span>Capacidad total: {stat.totalSpots} cupos</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Box 2: Revenue Distribution by Product */}
        <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-fraunces text-base font-medium text-[#1A1815]">
            Distribución de Ingresos por Producto
          </h3>

          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([cat, val]) => {
              const pct = totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="capitalize text-[#1A1815]">
                      {cat.replace('_', ' ')}
                    </span>
                    <span className="text-[#6B655C]">
                      S/. {val.toLocaleString('es-PE')} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#E4DED4] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B5654A] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Data Export Center (CSV / Excel) */}
      <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#B5654A]" />
            <h3 className="font-fraunces text-lg font-medium text-[#1A1815]">
              Centro de Exportación de Información (CSV / Excel)
            </h3>
          </div>
          <p className="text-xs text-[#6B655C] mt-1">
            Descarga las bases de datos en formato estándar .CSV compatible con Microsoft Excel y Google Sheets para contabilidad externa y auditoría.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportCash}
            className="p-3.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded-xl border border-[#DDD5C9] transition-all flex flex-col items-start justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-semibold text-xs">Ingresos de Caja</span>
              <Download className="w-4 h-4 text-[#B5654A] group-hover:translate-y-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#6B655C]">
              Boletas, clientes, montos y métodos de pago
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportExpenses}
            className="p-3.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded-xl border border-[#DDD5C9] transition-all flex flex-col items-start justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-semibold text-xs">Gastos & Egresos</span>
              <Download className="w-4 h-4 text-[#B5654A] group-hover:translate-y-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#6B655C]">
              Alquiler, sueldos, mantenimiento y facturas
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportClients}
            className="p-3.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded-xl border border-[#DDD5C9] transition-all flex flex-col items-start justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-semibold text-xs">Padrón de Alumnos</span>
              <Download className="w-4 h-4 text-[#B5654A] group-hover:translate-y-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#6B655C]">
              DNI, WhatsApp, planes y notas biomecánicas
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportLeads}
            className="p-3.5 bg-[#F1ECE5] hover:bg-[#E4DED4] text-[#1A1815] rounded-xl border border-[#DDD5C9] transition-all flex flex-col items-start justify-between text-left cursor-pointer group"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="font-semibold text-xs">Leads de Captación</span>
              <Download className="w-4 h-4 text-[#B5654A] group-hover:translate-y-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#6B655C]">
              Embudo, canal de procedencia y clases de prueba
            </span>
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
