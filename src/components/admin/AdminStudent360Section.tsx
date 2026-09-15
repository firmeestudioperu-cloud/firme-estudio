import React, { useState, useMemo } from 'react';
import {
  User,
  Search,
  Calendar,
  CreditCard,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Plus,
  ShieldCheck,
  Award,
  ChevronRight,
  Coffee,
  Check,
} from 'lucide-react';
import { ClientProfile, BookingRecord, ClassSession, DEFAULT_STUDIO_ROOMS } from '../../types';

interface AdminStudent360SectionProps {
  clients: ClientProfile[];
  bookings: BookingRecord[];
  classes: ClassSession[];
  onGoToHealthyBar?: (client: ClientProfile) => void;
  onUpdateClientCredits?: (clientId: string, credits: number) => void;
}

export const AdminStudent360Section: React.FC<AdminStudent360SectionProps> = ({
  clients = [],
  bookings = [],
  classes = [],
  onGoToHealthyBar,
  onUpdateClientCredits,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    clients[0]?.id || ''
  );
  const [renewalSuccessMsg, setRenewalSuccessMsg] = useState<string | null>(null);

  // Filtrado de alumnas
  const filteredStudents = useMemo(() => {
    return clients.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.dni.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [clients, searchQuery]);

  const activeStudent = useMemo(() => {
    return (
      clients.find((c) => c.id === selectedStudentId) ||
      filteredStudents[0] ||
      clients[0] ||
      null
    );
  }, [clients, selectedStudentId, filteredStudents]);

  // Reservas activas de esta alumna
  const studentBookings = useMemo(() => {
    if (!activeStudent) return [];
    return bookings.filter(
      (b) =>
        b &&
        b.status !== 'cancelada' &&
        (b.clientDni === activeStudent.dni ||
          b.clientName?.toLowerCase() === activeStudent.name.toLowerCase())
    );
  }, [bookings, activeStudent]);

  // Historial de asistencias pasadas
  const attendanceHistory = useMemo(() => {
    if (!activeStudent) return [];
    return bookings.filter(
      (b) =>
        b &&
        b.status === 'asistio' &&
        (b.clientDni === activeStudent.dni ||
          b.clientName?.toLowerCase() === activeStudent.name.toLowerCase())
    );
  }, [bookings, activeStudent]);

  // Simulación de renovación rápida de plan
  const handleQuickRenew = (addedCredits: number, planName: string) => {
    if (!activeStudent) return;
    const newCredits = (activeStudent.creditsLeft ?? 0) + addedCredits;
    activeStudent.creditsLeft = newCredits;
    activeStudent.currentPlan = planName;
    activeStudent.status = 'activo';

    if (onUpdateClientCredits) {
      onUpdateClientCredits(activeStudent.id, newCredits);
    }

    setRenewalSuccessMsg(
      `¡Plan ${planName} renovado exitosamente para ${activeStudent.name}! Ahora cuenta con ${newCredits} créditos.`
    );
    setTimeout(() => setRenewalSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Mensaje de Éxito de Renovación */}
      {renewalSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{renewalSuccessMsg}</span>
        </div>
      )}

      {/* Grid Principal: Lista de Alumnas (Izquierda) + Ficha 360° (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Directorio & Buscador (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E4DED4] p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-fraunces text-base font-bold text-[#1A1815]">
                Directorio de Alumnas
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF2E8] text-[#B5654A]">
                {filteredStudents.length} alumnas
              </span>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#AFA79C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, DNI o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DDD5C9] bg-[#FAF8F5] text-[#1A1815] focus:outline-none focus:ring-2 focus:ring-[#B5654A]"
              />
            </div>

            {/* Lista Scrollable de Alumnas */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#AFA79C]">
                  No se encontraron alumnas con "{searchQuery}"
                </div>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = activeStudent?.id === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setSelectedStudentId(st.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#FAF2E8] border-[#B5654A] shadow-xs'
                          : 'bg-white border-[#E4DED4] hover:border-[#DDD5C9]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#1A1815] text-white font-fraunces text-xs flex items-center justify-center font-bold shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#1A1815] truncate">
                            {st.name}
                          </div>
                          <div className="text-[10px] text-[#6B655C] font-mono">
                            DNI: {st.dni}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 block mb-0.5">
                          {st.creditsLeft ?? 0} clases
                        </span>
                        <span className="text-[9px] text-[#AFA79C] block">
                          {st.currentPlan?.split(' ')[0] || 'Pack'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Ficha Integral 360° (8 cols) */}
        <div className="lg:col-span-8">
          {activeStudent ? (
            <div className="bg-white rounded-3xl border-2 border-[#E4DED4] p-6 shadow-sm space-y-6">
              
              {/* 1. Cabecera del Perfil con Nivel y Contacto */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F1ECE5]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF2E8] border border-[#B5654A]/30 flex items-center justify-center font-fraunces text-2xl font-bold text-[#B5654A] shadow-xs">
                    {activeStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-fraunces text-2xl font-bold text-[#1A1815]">
                        {activeStudent.name}
                      </h2>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {activeStudent.status === 'activo' ? 'Al Día' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B655C] mt-1">
                      <span className="font-mono font-semibold">DNI: {activeStudent.dni}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#B5654A]" /> {activeStudent.phone}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#B5654A]" /> {activeStudent.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón Acción: Despachar en Healthy Bar */}
                <button
                  type="button"
                  onClick={() => onGoToHealthyBar?.(activeStudent)}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF2E8] hover:bg-[#B5654A] text-[#B5654A] hover:text-white border border-[#B5654A]/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <Coffee className="w-4 h-4" />
                  <span>Cargar Café & Bienestar</span>
                </button>
              </div>

              {/* 2. Grid de 3 Pilares: Membresía, Asistencia y Pagos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Membresía y Plan */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-[#B5654A]" /> Membresía Activa
                  </div>
                  <div className="text-sm font-bold text-[#1A1815]">
                    {activeStudent.currentPlan}
                  </div>
                  <div className="text-xs text-[#6B655C] flex items-center justify-between pt-1">
                    <span>Créditos Restantes:</span>
                    <span className="font-bold text-[#B5654A] text-sm">
                      {activeStudent.creditsLeft ?? 0} clases
                    </span>
                  </div>
                  <div className="text-[10px] text-[#AFA79C]">
                    Vencimiento: 30 de Noviembre 2026
                  </div>
                </div>

                {/* Control de Asistencia */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Asistencia Acumulada
                  </div>
                  <div className="text-sm font-bold text-[#1A1815]">
                    {activeStudent.totalAttended || attendanceHistory.length || 0} sesiones asistidas
                  </div>
                  <div className="text-xs text-[#6B655C] flex items-center justify-between pt-1">
                    <span>Última Visita:</span>
                    <span className="font-semibold text-[#1A1815]">
                      {activeStudent.lastVisit || 'Esta semana'}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    Constancia: 95% Puntualidad
                  </div>
                </div>

                {/* Estado de Pagos */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#1A1815]" /> Estado Financiero
                  </div>
                  <div className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Pagos al Día
                  </div>
                  <div className="text-xs text-[#6B655C] flex items-center justify-between pt-1">
                    <span>Saldo Pendiente:</span>
                    <span className="font-bold text-emerald-700">S/ 0.00</span>
                  </div>
                  <div className="text-[10px] text-[#AFA79C]">
                    Miembro desde: {activeStudent.joinDate || '2026'}
                  </div>
                </div>
              </div>

              {/* 3. Alertas Médicas, Restricciones y Observaciones */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <HeartPulse className="w-4 h-4 text-amber-700" />
                  <span>ALERTAS MÉDICAS & RESTRICCIONES FÍSICAS REFORMER</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {activeStudent.medicalNotes ||
                    'Sin lesiones graves registradas. Apta para todos los ejercicios de resistencia en cama Reformer.'}
                </p>
                {activeStudent.emergencyContact && (
                  <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-2">
                    <span className="font-semibold">Contacto de Emergencia:</span>
                    <span>{activeStudent.emergencyContact} ({activeStudent.emergencyPhone || 'Sin teléfono'})</span>
                  </div>
                )}
              </div>

              {/* 4. Clases Reservadas & Sala Asignada */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-fraunces text-base font-bold text-[#1A1815] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#B5654A]" />
                    <span>Reservas y Horarios Programados</span>
                  </h3>
                  <span className="text-xs text-[#6B655C]">
                    {studentBookings.length} reservas activas
                  </span>
                </div>

                {studentBookings.length === 0 ? (
                  <div className="p-5 text-center text-xs text-[#AFA79C] border border-dashed border-[#E4DED4] rounded-2xl">
                    La alumna no tiene clases reservadas para hoy. Puedes registrar una sesión manual o walk-in.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-3.5 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#1A1815]">
                              {b.className}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#1A1815] text-white">
                              {b.status === 'asistio' ? 'Asistencia Marcada' : 'Confirmada'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#6B655C]">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#B5654A]" /> {b.classTime}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#B5654A]" /> SJL · Sala 1 Reformer
                            </span>
                            <span>·</span>
                            <span className="text-[#1A1815]">
                              Instructora: <strong>{b.instructor}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Cama Asignada */}
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-[#B5654A] text-white shadow-xs block">
                            Cama #{b.bedNumber || 'Asignada'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Acceso Rápido a Renovación de Planes */}
              <div className="p-4 bg-white rounded-2xl border border-[#E4DED4] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B5654A]" />
                    <span className="text-xs font-bold text-[#1A1815]">
                      Renovación Rápida de Membresía / Venta de Clases
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B655C]">Mostrador SJL</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickRenew(8, 'Pack 8 Clases Reformer')}
                    className="p-3 rounded-xl border border-[#E4DED4] hover:border-[#B5654A] bg-[#FAF8F5] text-left hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="font-bold text-[#1A1815]">+8 Clases Pack</div>
                    <div className="text-[11px] text-[#6B655C]">S/ 240.00 · 30 días</div>
                    <div className="text-[10px] text-[#B5654A] font-semibold mt-1">Renovar en 1 clic →</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRenew(12, 'Pack 12 Clases Reformer')}
                    className="p-3 rounded-xl border border-[#E4DED4] hover:border-[#B5654A] bg-[#FAF8F5] text-left hover:bg-white transition-all cursor-pointer"
                  >
                    <div className="font-bold text-[#1A1815]">+12 Clases Pack</div>
                    <div className="text-[11px] text-[#6B655C]">S/ 320.00 · 45 días</div>
                    <div className="text-[10px] text-[#B5654A] font-semibold mt-1">Renovar en 1 clic →</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRenew(24, 'Membresía Ilimitada Mensual')}
                    className="p-3 rounded-xl border border-[#B5654A] bg-[#FAF2E8] text-left hover:bg-[#FAF8F5] transition-all cursor-pointer"
                  >
                    <div className="font-bold text-[#B5654A]">Pase Ilimitado Mes</div>
                    <div className="text-[11px] text-[#6B655C]">S/ 390.00 · 30 días VIP</div>
                    <div className="text-[10px] text-[#B5654A] font-semibold mt-1">Activar VIP en 1 clic →</div>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-xs text-[#AFA79C] bg-white rounded-3xl border border-[#E4DED4]">
              Selecciona una alumna de la lista izquierda para ver su Ficha 360°.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
