import React, { useState, useMemo } from 'react';
import {
  Store,
  UserPlus,
  CheckCircle2,
  Users,
  Search,
  CreditCard,
  QrCode,
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Zap,
  Clock,
  Printer,
  Calendar,
  AlertCircle,
  ShoppingBag,
  Plus,
  Minus,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  BadgeAlert,
  ChevronRight,
  Globe,
} from 'lucide-react';
import {
  AuthUser,
  MainTabType,
  ClassSession,
  BookingRecord,
  ClientProfile,
  CashTransaction,
  CashRegisterState,
  PaymentMethod,
} from '../types';

interface ReceptionDeskPanelProps {
  currentUser: AuthUser | null;
  classes: ClassSession[];
  bookings: BookingRecord[];
  clients: ClientProfile[];
  transactions: CashTransaction[];
  cashRegister: CashRegisterState;
  onAddClient: (newClient: Omit<ClientProfile, 'id'>) => void;
  onUpdateClient: (updatedClient: ClientProfile) => void;
  onAddTransaction: (tx: Omit<CashTransaction, 'id'>) => void;
  onCheckInBooking?: (booking: BookingRecord) => void;
  onAssignBed?: (bookingId: string, bedNumber: number) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'confirmada' | 'asistio' | 'cancelada') => void;
  onAddManualBooking: (booking: Omit<BookingRecord, 'id' | 'bookedAt'>) => void;
  onSelectDestination: (tab: MainTabType) => void;
  onLogout: () => void;
}

type DeskTab = 'alta_express' | 'sala_camas' | 'caja_rapida' | 'buscador_alumnas' | 'kiosco_qr';

export const ReceptionDeskPanel: React.FC<ReceptionDeskPanelProps> = ({
  currentUser,
  classes,
  bookings,
  clients,
  transactions,
  cashRegister,
  onAddClient,
  onUpdateClient,
  onAddTransaction,
  onCheckInBooking,
  onAssignBed,
  onUpdateBookingStatus,
  onAddManualBooking,
  onSelectDestination,
  onLogout,
}) => {
  const isOwnerDev = currentUser?.role === 'owner_dev';
  const isAdmin = currentUser?.role === 'admin';
  const canAccessAdminPanel = isOwnerDev || isAdmin;
  const staffName = currentUser?.name || 'Personal Staff';

  const [activeDeskTab, setActiveDeskTab] = useState<DeskTab>('alta_express');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3800);
  };

  // =========================================================================
  // ESTADO - MÓDULO 1: ALTA EXPRESS DE ALUMNA EN COUNTER
  // =========================================================================
  const [expDni, setExpDni] = useState('');
  const [expName, setExpName] = useState('');
  const [expPhone, setExpPhone] = useState('');
  const [expEmail, setExpEmail] = useState('');
  const [expPlan, setExpPlan] = useState<'prueba' | 'pack8' | 'pack12' | 'ilimitado' | 'suelta'>('prueba');
  const [expPaymentMethod, setExpPaymentMethod] = useState<PaymentMethod>('yape');
  const [expCashGiven, setExpCashGiven] = useState<string>('');
  const [expAssignCurrentClass, setExpAssignCurrentClass] = useState<boolean>(true);
  const [expSuccessData, setExpSuccessData] = useState<{
    clientName: string;
    dni: string;
    plan: string;
    amount: number;
    receipt: string;
    bedAssigned?: number;
  } | null>(null);

  const planPrices: Record<string, { label: string; price: number; credits: number }> = {
    prueba: { label: 'Clase de Prueba Reformer', price: 45, credits: 1 },
    pack8: { label: 'Pack 8 Clases Reformer', price: 680, credits: 8 },
    pack12: { label: 'Pack 12 Clases Reformer', price: 900, credits: 12 },
    ilimitado: { label: 'Membresía Ilimitada Mensual', price: 1050, credits: 99 },
    suelta: { label: 'Clase Suelta Reformer', price: 95, credits: 1 },
  };

  // Auto-detectar si el DNI ya existe en la base de datos
  const handleDniBlur = () => {
    const cleanDni = expDni.trim();
    if (cleanDni.length >= 8) {
      const existing = clients.find((c) => c.dni?.trim() === cleanDni);
      if (existing) {
        setExpName(existing.name);
        setExpPhone(existing.phone);
        setExpEmail(existing.email);
        showToast(`Alumna encontrada: ${existing.name}. Saldo: ${existing.creditsLeft} créditos.`);
      }
    }
  };

  // =========================================================================
  // ESTADO - MÓDULO 2: CHECK-IN EN VIVO (8 CAMAS REFORMER)
  // =========================================================================
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return classes[0]?.id || 'c1';
  });

  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Reservas correspondientes a la clase activa
  const activeClassBookings = useMemo(() => {
    if (!activeClass) return [];
    return bookings.filter((b) => b.classId === activeClass.id && b.status !== 'cancelada');
  }, [bookings, activeClass]);

  // Mapeo de las 8 camas
  const bedsStatus = useMemo(() => {
    const beds = Array.from({ length: 8 }, (_, i) => i + 1).map((bedNum) => {
      const booking = activeClassBookings.find((b) => b.bedNumber === bedNum);
      return {
        bedNumber: bedNum,
        booking: booking || null,
        isOccupied: !!booking,
        hasAttended: booking?.status === 'asistio',
      };
    });
    return beds;
  }, [activeClassBookings]);

  // Alumnas reservadas sin cama asignada aún
  const unassignedBookings = useMemo(() => {
    return activeClassBookings.filter((b) => !b.bedNumber);
  }, [activeClassBookings]);

  // =========================================================================
  // ESTADO - MÓDULO 3: CAJA RÁPIDA & VENTAS DE COUNTER
  // =========================================================================
  const counterProducts = [
    { id: 'prod-socks', name: 'Calcetines Grip Reformer', price: 25, category: 'tienda_calcetines' as const },
    { id: 'prod-water', name: 'Agua Mineral / Isotónica', price: 5, category: 'bebidas' as const },
    { id: 'prod-towel', name: 'Toalla Microfibra FIRME', price: 30, category: 'tienda_calcetines' as const },
    { id: 'prod-single', name: 'Recarga Clase Suelta', price: 95, category: 'clase_suelta' as const },
  ];

  const [cart, setCart] = useState<Record<string, number>>({});
  const [quickSalePayment, setQuickSalePayment] = useState<PaymentMethod>('yape');
  const [quickSaleClientName, setQuickSaleClientName] = useState('');

  const cartTotal = useMemo(() => {
    return counterProducts.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0);
  }, [cart]);

  const handleUpdateCart = (prodId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[prodId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      }
      return { ...prev, [prodId]: next };
    });
  };

  const handleExecuteQuickSale = () => {
    if (cartTotal <= 0) {
      showToast('Selecciona al menos un artículo para cobrar.');
      return;
    }

    const itemsSummary = counterProducts
      .filter((p) => (cart[p.id] || 0) > 0)
      .map((p) => `${cart[p.id]}x ${p.name}`)
      .join(', ');

    const newTx: Omit<CashTransaction, 'id'> = {
      type: 'ingreso',
      concept: `Venta Mostrador: ${itemsSummary}`,
      category: 'tienda_calcetines',
      amount: cartTotal,
      paymentMethod: quickSalePayment,
      clientName: quickSaleClientName.trim() || 'Cliente Mostrador',
      receiptNumber: `TKT-REC-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toLocaleDateString('es-PE'),
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      notes: `Cobrado por ${staffName} en recepción SJL vía ${quickSalePayment.toUpperCase()}`,
    };

    onAddTransaction(newTx);
    setCart({});
    setQuickSaleClientName('');
    showToast(`¡Venta cobrada con éxito (S/. ${cartTotal}) por ${quickSalePayment.toUpperCase()}!`);
  };

  // =========================================================================
  // ESTADO - MÓDULO 4: BUSCADOR RÁPIDO DE ALUMNAS
  // =========================================================================
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return clients.slice(0, 6);
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dni?.includes(q) ||
        c.phone?.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  // =========================================================================
  // HANDLER: REGISTRAR ALTA EXPRESS
  // =========================================================================
  const handleRegisterExpressClient = (e: React.FormEvent) => {
    e.preventDefault();

    if (!expName.trim()) {
      showToast('Ingresa el nombre completo de la clienta.');
      return;
    }
    if (!expDni.trim() || expDni.trim().length < 8) {
      showToast('Ingresa un número de DNI válido (8 dígitos).');
      return;
    }

    const planInfo = planPrices[expPlan];
    const clientEmail = expEmail.trim() || `${expDni.trim()}@firme-alumna.pe`;
    const clientPhone = expPhone.trim() || '+51 900 000 000';
    const receiptNum = `BOL-EXP-${Math.floor(Math.random() * 90000 + 10000)}`;

    // 1. Comprobar si ya existe para actualizar o crear nuevo
    const existing = clients.find((c) => c.dni?.trim() === expDni.trim());
    if (existing) {
      onUpdateClient({
        ...existing,
        name: expName.trim(),
        phone: clientPhone,
        email: clientEmail,
        currentPlan: planInfo.label,
        planType: planInfo.credits > 1 ? 'pack' : 'clase_suelta',
        creditsLeft: (existing.creditsLeft || 0) + planInfo.credits,
        lastVisit: 'Hoy en sede SJL',
      });
    } else {
      onAddClient({
        name: expName.trim(),
        dni: expDni.trim(),
        phone: clientPhone,
        email: clientEmail,
        currentPlan: planInfo.label,
        planType: planInfo.credits > 1 ? 'pack' : 'clase_suelta',
        creditsLeft: planInfo.credits,
        totalAttended: 0,
        status: 'activo',
        joinDate: new Date().toLocaleDateString('es-PE'),
        lastVisit: 'Hoy en sede SJL',
        emergencyContact: 'Alta en Counter SJL',
        medicalNotes: 'Ficha rápida en recepción',
        registrationMethod: 'receptionist_desk',
      });
    }

    // 2. Registrar cobro en caja
    onAddTransaction({
      type: 'ingreso',
      concept: `Alta Mostrador: ${planInfo.label}`,
      category: 'pack_clases',
      amount: planInfo.price,
      paymentMethod: expPaymentMethod,
      clientName: expName.trim(),
      receiptNumber: receiptNum,
      date: new Date().toLocaleDateString('es-PE'),
      time: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      notes: `Alta presencial por ${staffName} en sede SJL`,
    });

    // 3. Asignar inmediatamente a la clase activa si está marcado y hay cama libre
    let bedAssignedNumber: number | undefined;
    if (expAssignCurrentClass && activeClass) {
      const firstFreeBed = bedsStatus.find((b) => !b.isOccupied);
      if (firstFreeBed) {
        bedAssignedNumber = firstFreeBed.bedNumber;
        onAddManualBooking({
          classId: activeClass.id,
          className: activeClass.name,
          classTime: activeClass.time,
          classDay: activeClass.day,
          instructor: activeClass.instructor,
          clientName: expName.trim(),
          clientEmail: clientEmail,
          clientPhone: clientPhone,
          clientDni: expDni.trim(),
          status: 'asistio',
          bedNumber: bedAssignedNumber,
        });
      }
    }

    setExpSuccessData({
      clientName: expName.trim(),
      dni: expDni.trim(),
      plan: planInfo.label,
      amount: planInfo.price,
      receipt: receiptNum,
      bedAssigned: bedAssignedNumber,
    });

    // Limpiar campos para la siguiente clienta
    setExpDni('');
    setExpName('');
    setExpPhone('');
    setExpEmail('');
    setExpCashGiven('');
    showToast(`¡Clienta registrada con éxito! Boleta ${receiptNum} emitida.`);
  };

  // Calcular vuelto
  const changeAmount = useMemo(() => {
    if (expPaymentMethod !== 'efectivo') return null;
    const given = parseFloat(expCashGiven);
    const price = planPrices[expPlan]?.price || 0;
    if (isNaN(given) || given < price) return null;
    return (given - price).toFixed(2);
  }, [expCashGiven, expPaymentMethod, expPlan]);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://firmestudio.pe';
  const registerQrUrl = `${currentOrigin}/#registro`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&color=1A1815&bgcolor=FAF8F5&margin=10&data=${encodeURIComponent(registerQrUrl)}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1815] flex flex-col selection:bg-[#B5654A] selection:text-[#FAF8F5]">
      {/* =====================================================================
          1. HEADER EJECUTIVO DEL PERSONAL (BARRA DE CONTROL)
          ===================================================================== */}
      <header className="sticky top-0 z-30 bg-[#1A1815] text-[#FAF8F5] border-b border-[#B5654A]/30 px-4 sm:px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#B5654A] flex items-center justify-center text-white font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-fraunces text-base font-bold tracking-wide flex items-center gap-2">
                <span>FIRME STUDIO</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#B5654A] text-white">
                  Panel de Registros Presencial
                </span>
              </div>
              <div className="text-[11px] text-[#AFA79C]">
                Sede San Juan de Lurigancho · Jr. Akapana 1261
              </div>
            </div>
          </div>

          {/* Botones de Acción del Staff */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón directo para ir al Panel Admin General (solo Owner y Admin) */}
            {canAccessAdminPanel && (
              <button
                type="button"
                onClick={() => onSelectDestination('admin')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/20 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:border-[#B5654A]"
                title="Cambiar al Panel Admin General (Finanzas, Agenda, Gastos)"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#B5654A]" />
                <span className="hidden sm:inline">Ir a Panel Admin General</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* Selector de Hub */}
            <button
              type="button"
              onClick={() => onSelectDestination('staff-hub')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              title="Volver a la pantalla de selección de espacios"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Hub de Trabajo</span>
            </button>

            {/* Ver Web Pública */}
            <button
              type="button"
              onClick={() => onSelectDestination('inicio')}
              className="p-2 rounded-xl text-[#AFA79C] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Ver sitio web público"
            >
              <Globe className="w-4 h-4" />
            </button>

            {/* Cerrar Sesión */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-rose-300 hover:text-rose-100 hover:bg-rose-900/30 transition-colors cursor-pointer"
              title="Cerrar sesión de trabajador"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. BANNER DE INDICADORES RÁPIDOS DE TURNO
          ===================================================================== */}
      <section className="bg-white border-b border-[#E4DED4] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#6B655C]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">
              Atendiendo: <strong className="text-[#1A1815]">{staffName}</strong> (
              {isOwnerDev ? 'Owner' : isAdmin ? 'Admin' : 'Recepción'})
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-medium text-[#1A1815] flex-wrap">
            <div>
              <span className="text-[#6B655C]">Clase activa:</span>{' '}
              <strong>{activeClass?.name || 'Reformer'}</strong> ({activeClass?.time || '08:30'})
            </div>
            <div>
              <span className="text-[#6B655C]">Ocupación sala:</span>{' '}
              <strong className="text-[#B5654A]">{activeClassBookings.length} / 8 Camas</strong>
            </div>
            <div>
              <span className="text-[#6B655C]">Caja abierta:</span>{' '}
              <span className="text-emerald-700 font-bold">
                {cashRegister.isOpen ? 'Activa' : 'Cerrada'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. PESTAÑAS DE LOS MÓDULOS DE COUNTER
          ===================================================================== */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E4DED4] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveDeskTab('alta_express')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDeskTab === 'alta_express'
                ? 'bg-[#B5654A] text-white shadow-xs font-bold'
                : 'bg-white text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] border border-[#E4DED4]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>1. Alta Express en Counter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDeskTab('sala_camas')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDeskTab === 'sala_camas'
                ? 'bg-[#B5654A] text-white shadow-xs font-bold'
                : 'bg-white text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] border border-[#E4DED4]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Check-in Sala (8 Camas)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
              {activeClassBookings.length}/8
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDeskTab('caja_rapida')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDeskTab === 'caja_rapida'
                ? 'bg-[#B5654A] text-white shadow-xs font-bold'
                : 'bg-white text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] border border-[#E4DED4]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>3. Caja Rápida Mostrador</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDeskTab('buscador_alumnas')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDeskTab === 'buscador_alumnas'
                ? 'bg-[#B5654A] text-white shadow-xs font-bold'
                : 'bg-white text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] border border-[#E4DED4]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>4. Búsqueda & Saldos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDeskTab('kiosco_qr')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeDeskTab === 'kiosco_qr'
                ? 'bg-[#B5654A] text-white shadow-xs font-bold'
                : 'bg-white text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] border border-[#E4DED4]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>5. Kiosco QR Mostrador</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1815] text-[#FAF8F5] px-4 py-3 rounded-2xl shadow-2xl border border-[#B5654A] flex items-center gap-2.5 animate-in slide-in-from-bottom-5 text-xs font-medium">
          <Sparkles className="w-4 h-4 text-[#B5654A]" />
          <span>{notification}</span>
        </div>
      )}

      {/* =====================================================================
          4. CONTENIDO DE CADA MÓDULO
          ===================================================================== */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex-1">
        {/* -------------------------------------------------------------------
            MÓDULO 1: ALTA EXPRESS EN COUNTER
            ------------------------------------------------------------------- */}
        {activeDeskTab === 'alta_express' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E4DED4] p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#F1ECE5] pb-4">
                <div>
                  <h2 className="font-fraunces text-xl font-bold text-[#1A1815] flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#B5654A]" />
                    <span>Registro Rápido de Clienta en Mostrador</span>
                  </h2>
                  <p className="text-xs text-[#6B655C] mt-0.5">
                    Completa los datos en 15 segundos para cobrar y dar acceso presencial.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#B5654A] bg-[#FAF2E8] px-2.5 py-1 rounded-full border border-[#B5654A]/30">
                  ⚡ Modo Express
                </span>
              </div>

              <form onSubmit={handleRegisterExpressClient} className="space-y-5">
                {/* Fila 1: DNI y Nombre */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1815] mb-1">
                      DNI / Documento <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={expDni}
                        onChange={(e) => setExpDni(e.target.value.replace(/\D/g, ''))}
                        onBlur={handleDniBlur}
                        placeholder="Ej. 70112233"
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1815] font-mono focus:outline-hidden focus:border-[#B5654A]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1A1815] mb-1">
                      Nombres y Apellidos Completos <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={expName}
                      onChange={(e) => setExpName(e.target.value)}
                      placeholder="Ej. Carla Morales Vega"
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>

                {/* Fila 2: Celular WhatsApp y Correo (Opcional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1815] mb-1">
                      Celular WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={expPhone}
                      onChange={(e) => setExpPhone(e.target.value)}
                      placeholder="Ej. 984 123 456"
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#6B655C] mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      value={expEmail}
                      onChange={(e) => setExpEmail(e.target.value)}
                      placeholder={expDni ? `${expDni}@firme-alumna.pe` : 'correo@ejemplo.com'}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                    />
                  </div>
                </div>

                {/* Fila 3: Selección de Pack / Membresía */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1815] mb-2">
                    Seleccionar Pase o Paquete Adquirido:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {(Object.keys(planPrices) as Array<keyof typeof planPrices>).map((key) => {
                      const item = planPrices[key];
                      const isSelected = expPlan === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setExpPlan(key)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF2E8] border-[#B5654A] shadow-xs ring-1 ring-[#B5654A]'
                              : 'bg-white border-[#E4DED4] hover:bg-[#FAF8F5]'
                          }`}
                        >
                          <div className="text-[11px] font-bold text-[#1A1815] leading-tight">
                            {item.label}
                          </div>
                          <div className="text-base font-fraunces font-bold text-[#B5654A] mt-1">
                            S/. {item.price}
                          </div>
                          <div className="text-[10px] text-[#6B655C] mt-0.5">
                            {item.credits === 99 ? 'Ilimitadas x 30 días' : `${item.credits} clases`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fila 4: Método de Pago */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] space-y-3">
                  <label className="block text-xs font-bold text-[#1A1815]">
                    Método de Pago Presencial:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'yape', label: 'Yape' },
                      { id: 'plin', label: 'Plin' },
                      { id: 'efectivo', label: 'Efectivo' },
                      { id: 'tarjeta_pos', label: 'POS / Tarjeta' },
                      { id: 'transferencia_bcp', label: 'Transf. BCP' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setExpPaymentMethod(m.id as PaymentMethod)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          expPaymentMethod === m.id
                            ? 'bg-[#1A1815] text-[#FAF8F5] shadow-xs'
                            : 'bg-white border border-[#DDD5C9] text-[#6B655C] hover:text-[#1A1815]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Detalle si es Efectivo: Calculadora de Vuelto */}
                  {expPaymentMethod === 'efectivo' && (
                    <div className="pt-2 flex items-center gap-3">
                      <div className="w-1/2">
                        <label className="block text-[11px] font-medium text-[#6B655C] mb-1">
                          Monto entregado por clienta (S/.):
                        </label>
                        <input
                          type="number"
                          value={expCashGiven}
                          onChange={(e) => setExpCashGiven(e.target.value)}
                          placeholder="Ej. 100"
                          className="w-full bg-white border border-[#DDD5C9] rounded-xl px-3 py-1.5 text-xs text-[#1A1815]"
                        />
                      </div>
                      <div className="w-1/2 text-left">
                        <span className="text-[11px] text-[#6B655C] block">Vuelto a devolver:</span>
                        <span className="text-base font-bold text-[#B5654A]">
                          {changeAmount !== null ? `S/. ${changeAmount}` : 'Esperando monto...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opción de Asignación Inmediata a la clase activa */}
                <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <input
                    type="checkbox"
                    id="assign-live-class"
                    checked={expAssignCurrentClass}
                    onChange={(e) => setExpAssignCurrentClass(e.target.checked)}
                    className="w-4 h-4 text-[#B5654A] rounded-md accent-[#B5654A] cursor-pointer"
                  />
                  <label
                    htmlFor="assign-live-class"
                    className="text-xs text-emerald-900 font-medium cursor-pointer"
                  >
                    Asignar y marcar asistencia automáticamente a la clase actual ({activeClass?.name} - {activeClass?.time}) en una cama libre.
                  </label>
                </div>

                {/* Botón de Enviar Alta Express */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#B5654A] hover:bg-[#9A5340] text-white font-bold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>
                    Registrar y Cobrar S/. {planPrices[expPlan].price} en Mostrador
                  </span>
                </button>
              </form>
            </div>

            {/* Columna Derecha: Boleta/Ticket en Vivo y Resumen */}
            <div className="space-y-6">
              {expSuccessData ? (
                <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 shadow-md text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">
                      ¡Cobro y Registro Exitoso!
                    </h3>
                    <p className="text-xs text-[#6B655C] font-mono mt-0.5">
                      {expSuccessData.receipt}
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E4DED4] text-xs text-left space-y-1.5">
                    <div>
                      <strong>Clienta:</strong> {expSuccessData.clientName}
                    </div>
                    <div>
                      <strong>DNI:</strong> {expSuccessData.dni}
                    </div>
                    <div>
                      <strong>Plan:</strong> {expSuccessData.plan}
                    </div>
                    <div>
                      <strong>Total Pagado:</strong> S/. {expSuccessData.amount}
                    </div>
                    {expSuccessData.bedAssigned && (
                      <div className="text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded-lg inline-block">
                        🛏️ Cama Reformer Asignada: #{expSuccessData.bedAssigned}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpSuccessData(null)}
                    className="w-full py-2 px-4 rounded-xl bg-[#1A1815] text-white text-xs font-semibold hover:bg-[#322C27] transition-colors cursor-pointer"
                  >
                    Atender a Siguiente Clienta
                  </button>
                </div>
              ) : (
                <div className="bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A1815]">
                    <QrCode className="w-4 h-4 text-[#B5654A]" />
                    <span>¿La clienta prefiere auto-registrarse?</span>
                  </div>
                  <p className="text-xs text-[#6B655C] leading-relaxed">
                    Puedes indicarle que apunte su celular al código QR de recepción para que
                    llene sus datos en su propia pantalla.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveDeskTab('kiosco_qr')}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[#DDD5C9] hover:bg-[#FAF2E8] text-xs font-semibold text-[#B5654A] transition-colors cursor-pointer"
                  >
                    Mostrar Código QR en Pantalla
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            MÓDULO 2: CHECK-IN EN VIVO A SALA (8 CAMAS REFORMER)
            ------------------------------------------------------------------- */}
        {activeDeskTab === 'sala_camas' && (
          <div className="space-y-6">
            {/* Selector de clase */}
            <div className="bg-white rounded-3xl border border-[#E4DED4] p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B5654A]" />
                <span className="text-xs font-bold text-[#1A1815]">Seleccionar Turno / Clase:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {classes.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClassId(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedClassId === c.id
                        ? 'bg-[#1A1815] text-white shadow-xs'
                        : 'bg-[#FAF8F5] border border-[#DDD5C9] text-[#6B655C] hover:text-[#1A1815]'
                    }`}
                  >
                    {c.time} · {c.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista de las 8 Camas Reformer */}
            <div className="bg-white rounded-3xl border border-[#E4DED4] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-fraunces text-xl font-bold text-[#1A1815]">
                    Sala Reformer: {activeClass?.name} ({activeClass?.time})
                  </h3>
                  <p className="text-xs text-[#6B655C] mt-0.5">
                    Instructora: <strong>{activeClass?.instructor}</strong> · Capacidad fija de 8
                    camas
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Presente
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reservado
                  </span>
                  <span className="flex items-center gap-1.5 text-[#6B655C]">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Cama Libre
                  </span>
                </div>
              </div>

              {/* Matriz 2x4 de las 8 Camas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {bedsStatus.map(({ bedNumber, booking, isOccupied, hasAttended }) => (
                  <div
                    key={bedNumber}
                    className={`rounded-2xl border-2 p-4 flex flex-col justify-between min-h-[140px] transition-all ${
                      hasAttended
                        ? 'bg-emerald-50/60 border-emerald-400'
                        : isOccupied
                        ? 'bg-amber-50/60 border-amber-400'
                        : 'bg-[#FAF8F5] border-dashed border-[#DDD5C9]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-fraunces font-bold text-sm text-[#1A1815]">
                        Cama #{bedNumber}
                      </span>
                      {hasAttended ? (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Presente
                        </span>
                      ) : isOccupied ? (
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Agendada
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-[#6B655C] bg-gray-200 px-2 py-0.5 rounded-full">
                          Libre
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      {booking ? (
                        <div>
                          <div className="font-bold text-xs text-[#1A1815] line-clamp-1">
                            {booking.clientName}
                          </div>
                          <div className="text-[10px] text-[#6B655C]">
                            {booking.clientPhone || 'Sin celular'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#AFA79C] italic">Espacio disponible</div>
                      )}
                    </div>

                    <div>
                      {booking ? (
                        booking.status !== 'asistio' ? (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateBookingStatus(booking.id, 'asistio');
                              showToast(`Check-in marcado para ${booking.clientName} en Cama #${bedNumber}`);
                            }}
                            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            Marcar Llegada
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-semibold block text-center">
                            ✓ Asistencia confirmada
                          </span>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            // Asignar primer booking desasignado o abrir alta
                            if (unassignedBookings.length > 0 && onAssignBed) {
                              const b = unassignedBookings[0];
                              onAssignBed(b.id, bedNumber);
                              showToast(`Cama #${bedNumber} asignada a ${b.clientName}`);
                            } else {
                              setActiveDeskTab('alta_express');
                            }
                          }}
                          className="w-full py-1.5 rounded-xl bg-white border border-[#DDD5C9] hover:bg-[#FAF2E8] hover:border-[#B5654A] text-xs font-semibold text-[#B5654A] transition-colors cursor-pointer"
                        >
                          + Asignar Cama
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            MÓDULO 3: CAJA RÁPIDA & VENTAS DE COUNTER
            ------------------------------------------------------------------- */}
        {activeDeskTab === 'caja_rapida' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-[#E4DED4] p-6 shadow-sm">
                <h3 className="font-fraunces text-lg font-bold text-[#1A1815] mb-4">
                  Artículos de Venta Inmediata en Mostrador
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {counterProducts.map((prod) => {
                    const count = cart[prod.id] || 0;
                    return (
                      <div
                        key={prod.id}
                        className="bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#1A1815]">{prod.name}</div>
                          <div className="text-sm font-fraunces font-bold text-[#B5654A] mt-0.5">
                            S/. {prod.price}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateCart(prod.id, -1)}
                            className="w-7 h-7 rounded-lg bg-white border border-[#DDD5C9] flex items-center justify-center text-[#6B655C] hover:text-[#1A1815] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{count}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCart(prod.id, 1)}
                            className="w-7 h-7 rounded-lg bg-[#1A1815] text-white flex items-center justify-center hover:bg-[#322C27] cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Cobro Express */}
            <div className="bg-white rounded-3xl border border-[#E4DED4] p-6 shadow-sm space-y-4">
              <h3 className="font-fraunces text-lg font-bold text-[#1A1815]">Resumen de Cobro</h3>

              <div>
                <label className="block text-xs font-medium text-[#6B655C] mb-1">
                  Nombre de la clienta (Opcional):
                </label>
                <input
                  type="text"
                  value={quickSaleClientName}
                  onChange={(e) => setQuickSaleClientName(e.target.value)}
                  placeholder="Ej. Alumna en sala"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-xl px-3 py-2 text-xs text-[#1A1815]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1815] mb-2">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['yape', 'plin', 'efectivo', 'tarjeta_pos'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setQuickSalePayment(m as PaymentMethod)}
                      className={`py-2 px-2 rounded-xl font-semibold capitalize text-center cursor-pointer transition-all ${
                        quickSalePayment === m
                          ? 'bg-[#B5654A] text-white shadow-xs'
                          : 'bg-[#FAF8F5] border border-[#DDD5C9] text-[#6B655C]'
                      }`}
                    >
                      {m.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F1ECE5] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1A1815]">Total a Cobrar:</span>
                <span className="font-fraunces text-2xl font-bold text-[#B5654A]">
                  S/. {cartTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleExecuteQuickSale}
                className="w-full py-3 rounded-2xl bg-[#1A1815] hover:bg-[#322C27] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Cobrar y Emitir Comprobante
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            MÓDULO 4: BÚSQUEDA RÁPIDA DE ALUMNAS & SALDO
            ------------------------------------------------------------------- */}
        {activeDeskTab === 'buscador_alumnas' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-[#E4DED4] p-4 shadow-sm">
              <div className="relative">
                <Search className="w-4 h-4 text-[#AFA79C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por DNI, Nombre o Teléfono WhatsApp..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C9] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1A1815] focus:outline-hidden focus:border-[#B5654A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-3xl border border-[#E4DED4] p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#1A1815]">{client.name}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          client.creditsLeft > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {client.creditsLeft} clases
                      </span>
                    </div>

                    <div className="text-xs text-[#6B655C] mt-1 space-y-0.5">
                      <div>DNI: {client.dni || 'No registrado'}</div>
                      <div>Celular: {client.phone}</div>
                      <div>Plan: {client.currentPlan}</div>
                      {client.medicalNotes && (
                        <div className="text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-1 text-[11px]">
                          Nota: {client.medicalNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#F1ECE5] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateClient({
                          ...client,
                          creditsLeft: (client.creditsLeft || 0) + 1,
                        });
                        showToast(`+1 crédito sumado a ${client.name}`);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-[#FAF2E8] border border-[#B5654A]/30 text-[#B5654A] font-bold text-xs hover:bg-[#B5654A] hover:text-white transition-colors cursor-pointer"
                    >
                      +1 Crédito
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setExpDni(client.dni || '');
                        setExpName(client.name);
                        setExpPhone(client.phone);
                        setActiveDeskTab('alta_express');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-[#1A1815] text-white font-bold text-xs hover:bg-[#322C27] transition-colors cursor-pointer"
                    >
                      Renovar Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------
            MÓDULO 5: KIOSCO QR MOSTRADOR
            ------------------------------------------------------------------- */}
        {activeDeskTab === 'kiosco_qr' && (
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E4DED4] p-8 text-center shadow-lg space-y-4">
            <h3 className="font-fraunces text-2xl font-bold text-[#1A1815]">
              Auto-Registro con Código QR
            </h3>
            <p className="text-xs text-[#6B655C]">
              Apunta la cámara de tu teléfono móvil para crear tu cuenta en 30 segundos.
            </p>

            <div className="p-4 bg-[#FAF8F5] rounded-3xl border border-[#E4DED4] inline-block shadow-inner">
              <img
                src={qrImageUrl}
                alt="QR Registro Alumna"
                className="w-56 h-56 mx-auto object-contain rounded-2xl"
              />
            </div>

            <div className="text-xs font-mono text-[#6B655C] bg-[#F1ECE5] py-2 px-3 rounded-xl select-all">
              {registerQrUrl}
            </div>

            <button
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(registerQrUrl);
                  showToast('Enlace de registro copiado al portapapeles');
                }
              }}
              className="w-full py-2.5 rounded-xl bg-[#1A1815] text-white text-xs font-bold hover:bg-[#322C27] transition-colors cursor-pointer"
            >
              Copiar Enlace Directo
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
