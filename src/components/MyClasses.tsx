import React, { useState } from 'react';
import { ClassSession, DifficultyLevel, ClassType, AuthUser } from '../types';
import { DAYS_OF_WEEK } from '../data/mockData';
import {
  Calendar,
  Clock,
  User,
  XCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  BellRing,
  QrCode,
  Award,
  Gift,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  Download,
  Maximize2,
  X,
} from 'lucide-react';

interface MyClassesProps {
  bookedClasses: ClassSession[];
  waitlistClasses: ClassSession[];
  alertClasses: ClassSession[];
  currentUser?: AuthUser | null;
  onCancelBooking: (classId: string) => void;
  onCancelWaitlist?: (classId: string) => void;
  onCancelAlert?: (classId: string) => void;
  onExploreSchedule: () => void;
  onOpenCheckInModal?: () => void;
  onOpenLevelModal?: () => void;
}

export const MyClasses: React.FC<MyClassesProps> = ({
  bookedClasses,
  waitlistClasses,
  alertClasses,
  currentUser,
  onCancelBooking,
  onCancelWaitlist,
  onCancelAlert,
  onExploreSchedule,
  onOpenCheckInModal,
  onOpenLevelModal,
}) => {
  const [classToCancel, setClassToCancel] = useState<ClassSession | null>(null);
  const [isQrEnlarged, setIsQrEnlarged] = useState(false);
  const [isDownloadingPass, setIsDownloadingPass] = useState(false);

  // Recuperar DNI real prioritario: de currentUser, de sus reservas activas o de localStorage
  const studentDni = (() => {
    if (currentUser?.dni && currentUser.dni !== '70112233') return currentUser.dni;
    if (typeof window !== 'undefined') {
      try {
        const authSaved = localStorage.getItem('firme_auth_user');
        if (authSaved) {
          const u = JSON.parse(authSaved);
          if (u.dni && u.dni !== '70112233') return u.dni;
        }
        const bksSaved = localStorage.getItem('firme_bookings_data');
        if (bksSaved) {
          const bks = JSON.parse(bksSaved);
          const myBk = bks.find((b: any) =>
            (currentUser?.email && b.clientEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
            (currentUser?.name && b.clientName?.toLowerCase() === currentUser.name.toLowerCase())
          );
          if (myBk?.clientDni) return myBk.clientDni;
        }
      } catch {}
    }
    return currentUser?.dni || '74829103';
  })();

  const studentId = currentUser?.id || 'FIRME-MEM-8821';
  const studentName = currentUser?.name || 'Alumna FIRME';

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://firmestudio.pe';
  const checkInUrl = `${currentOrigin}/?action=checkin&dni=${encodeURIComponent(studentDni)}&name=${encodeURIComponent(studentName)}&memId=${encodeURIComponent(studentId)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&color=1A1815&bgcolor=FFFFFF&margin=8&qzone=2&data=${encodeURIComponent(checkInUrl)}`;

  const handleDownloadPass = () => {
    setIsDownloadingPass(true);
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloadingPass(false);
      return;
    }

    // 1. Background gradient luxury
    const grad = ctx.createLinearGradient(0, 0, 900, 540);
    grad.addColorStop(0, '#1A1815');
    grad.addColorStop(0.5, '#2D2622');
    grad.addColorStop(1, '#151311');
    ctx.fillStyle = grad;
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, 900, 540, 28);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, 900, 540);
    }

    // 2. Border
    ctx.strokeStyle = 'rgba(250, 248, 245, 0.2)';
    ctx.lineWidth = 3;
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, 900, 540, 28);
      ctx.stroke();
    }

    // 3. Accent corner glow
    ctx.fillStyle = 'rgba(181, 101, 74, 0.15)';
    ctx.beginPath();
    ctx.arc(800, 80, 180, 0, Math.PI * 2);
    ctx.fill();

    // 4. Studio Header
    ctx.fillStyle = '#FAF8F5';
    ctx.font = 'bold 30px serif';
    ctx.fillText('FIRME STUDIO', 50, 65);

    ctx.fillStyle = '#B5654A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PASE OFICIAL DE ALUMNO · LIMA-SJL', 50, 90);

    // 5. Active Badge
    ctx.fillStyle = 'rgba(46, 125, 70, 0.25)';
    if (ctx.roundRect) {
      ctx.roundRect(710, 40, 140, 32, 16);
      ctx.fill();
    }
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('● SOCIO ACTIVO', 735, 61);

    // 6. Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 115);
    ctx.lineTo(850, 115);
    ctx.stroke();

    // 7. Student Info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px sans-serif';
    ctx.fillText('ALUMNO / TITULAR', 50, 150);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px serif';
    ctx.fillText(studentName, 50, 190);

    ctx.fillStyle = '#B5654A';
    ctx.font = '14px monospace';
    ctx.fillText(`DNI: ${studentDni} · ID: ${studentId}`, 50, 220);

    // 8. Plan & Level Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    if (ctx.roundRect) {
      ctx.roundRect(50, 250, 520, 135, 14);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px sans-serif';
    ctx.fillText('PLAN CONTRATADO', 70, 280);
    ctx.fillText('NIVEL & EXPERIENCIA', 310, 280);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(currentUser?.planName || 'Plan Reformer Boutique', 70, 310);
    ctx.fillText(`Nv. ${currentUser?.level ?? 2} · ${currentUser?.exp ?? 1350} EXP`, 310, 310);

    ctx.fillStyle = '#4ade80';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${currentUser?.credits !== undefined ? currentUser.credits : 8} sesiones disponibles`, 70, 340);
    ctx.fillStyle = '#B5654A';
    ctx.fillText(currentUser?.levelTitle || 'Nivel II · Enfoque & Constancia', 310, 340);

    // 9. Footer Sede
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '13px sans-serif';
    ctx.fillText('Sede Oficial: Jr. Akapana 1261, Lima - SJL · Escaneo directo en recepción', 50, 480);

    // 10. QR Code White Background
    ctx.fillStyle = '#FFFFFF';
    if (ctx.roundRect) {
      ctx.roundRect(640, 190, 210, 225, 16);
      ctx.fill();
    } else {
      ctx.fillRect(640, 190, 210, 225);
    }

    const triggerDownload = () => {
      ctx.fillStyle = '#6B655C';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ESCANEAR EN RECEPCIÓN', 665, 395);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `FIRME-PASS-${studentName.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      setIsDownloadingPass(false);
    };

    // Draw real scannable QR onto canvas
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrImageUrl;

    qrImg.onload = () => {
      ctx.drawImage(qrImg, 655, 202, 180, 180);
      triggerDownload();
    };

    qrImg.onerror = () => {
      ctx.fillStyle = '#1A1815';
      ctx.fillRect(665, 210, 45, 45);
      ctx.fillRect(775, 210, 45, 45);
      ctx.fillRect(665, 320, 45, 45);
      triggerDownload();
    };
  };

  const getDayFullLabel = (dayKey: string) => {
    const dayObj = DAYS_OF_WEEK.find((d) => d.key === dayKey);
    return dayObj ? `${dayObj.fullLabel} (${dayObj.dateLabel})` : dayKey;
  };

  const renderDifficultyBadge = (level: DifficultyLevel) => {
    switch (level) {
      case 'Principiante':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EDF5F0] text-[#245E39] border border-[#C5DEC9]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D46]" />
            Principiante
          </span>
        );
      case 'Intermedio':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF2E8] text-[#8C5511] border border-[#ECD1B0]">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8731F]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8731F]" />
            </span>
            Intermedio
          </span>
        );
      case 'Avanzado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAECE8] text-[#A64028] border border-[#ECC0B4]">
            <span className="flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
            </span>
            Avanzado
          </span>
        );
      default:
        return null;
    }
  };

  const renderClassTypeBadge = (classType: ClassType) => {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#1A1815] border border-[#E4DED4]">
        <Layers className="w-3 h-3 text-[#B5654A]" />
        {classType}
      </span>
    );
  };

  const totalActiveItems = bookedClasses.length + waitlistClasses.length + alertClasses.length;

  return (
    <section
      id="mis-clases"
      className="py-12 sm:py-16 bg-[#FAF8F5] border-b border-[#E4DED4]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E4DED4]/80 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium tracking-widest uppercase text-[#B5654A]">
                Tu Espacio Personal
              </span>
              {totalActiveItems > 0 && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#B5654A] text-[#FAF8F5]">
                  {bookedClasses.length} {bookedClasses.length === 1 ? 'reserva activa' : 'reservas activas'}
                </span>
              )}
            </div>
            <h2 className="font-fraunces text-2xl sm:text-3xl text-[#1A1815] font-normal">
              Mis Clases y Reservas
            </h2>
            <p className="text-sm text-[#6B655C] mt-1 max-w-xl">
              Gestiona tus sesiones confirmadas, consulta detalles de sala y cancela con antelación sin penalizaciones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreSchedule}
              className="inline-flex items-center text-xs font-medium text-[#B5654A] hover:text-[#9A5340] transition-colors cursor-pointer"
            >
              <span>Explorar más horarios</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MIEMBRO ACTIVO: FIRME PASS DIGITAL & CLUB DE HITOS (RETENCIÓN)           */}
        {/* ========================================================================= */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Card 1 (7 cols): Digital Member Pass (Apple Wallet / Passbook aesthetic) */}
          <div className="md:col-span-1 lg:col-span-7 bg-gradient-to-br from-[#1A1815] via-[#2A2421] to-[#1A1815] rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-[#FAF8F5]/10 relative overflow-hidden flex flex-col justify-between">
            {/* Background luxury watermark */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-[#B5654A]/10 blur-2xl pointer-events-none" />
            
            <div>
              {/* Pass Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF8F5] p-1 flex items-center justify-center">
                    <img src="/firme-studio-logo.svg" alt="FIRME STUDIO" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="font-fraunces text-base tracking-wider block">FIRME PASS</span>
                    <span className="text-[10px] text-[#B5654A] font-semibold uppercase tracking-widest">Pase Oficial de Alumno</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Membresía Activa
                </div>
              </div>

              {/* Pass Main Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                {/* Left Info (8 cols) */}
                <div className="sm:col-span-8 space-y-3">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider block">Alumno / Titular</span>
                    <h3 className="font-fraunces text-xl sm:text-2xl text-white font-medium">
                      {studentName}
                    </h3>
                    <span className="text-xs text-[#B5654A] font-mono">
                      DNI: {studentDni} · ID: {studentId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-white/60 block">Plan Contratado</span>
                      <span className="text-xs font-semibold text-white truncate block">
                        {currentUser?.planName || 'Plan Reformer Boutique'}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                      <span className="text-[10px] text-white/60 block">Créditos en Cuenta</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {currentUser?.credits !== undefined ? currentUser.credits : 8} sesiones
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Scannable QR Code (4 cols) - 100% Real & Scannable */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner text-center">
                  <button
                    type="button"
                    onClick={() => setIsQrEnlarged(true)}
                    title="Click para ampliar QR a pantalla completa para escaneo rápido"
                    className="group relative cursor-pointer flex flex-col items-center"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center bg-white rounded-lg p-1 border border-[#E4DED4]/80 shadow-xs group-hover:shadow-md transition-all group-hover:scale-105">
                      <img
                        src={qrImageUrl}
                        alt={`Código QR FIRME PASS de ${studentName}`}
                        className="w-full h-full object-contain"
                        loading="eager"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-[#1A1815]/90 text-white text-[9px] font-semibold px-2 py-0.5 rounded shadow-sm transition-opacity flex items-center gap-1">
                          <Maximize2 className="w-2.5 h-2.5" /> Ampliar
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#6B655C] mt-1.5 font-bold tracking-tight">
                      ESCANEAR EN RECEPCIÓN
                    </span>
                    <span className="text-[8px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      QR ACTIVO · CHECK-IN EXPRESS
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pass Actions */}
            <div className="pt-4 mt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-white/70">
                Sede: <strong>Jr. Akapana 1261, Lima - SJL</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPass}
                  disabled={isDownloadingPass}
                  className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-white/15 disabled:opacity-50"
                  title="Descargar carnet oficial FIRME PASS en alta definición para guardar en tu móvil"
                >
                  <Download className="w-3.5 h-3.5 text-[#B5654A]" />
                  <span>{isDownloadingPass ? 'Generando...' : 'Descargar Pase (PNG)'}</span>
                </button>

                {onOpenCheckInModal && (
                  <button
                    type="button"
                    onClick={onOpenCheckInModal}
                    className="bg-[#B5654A] hover:bg-[#9A5340] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Autocheck-in en Tótem</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2 (5 cols): Milestone Club / Fidelización por Hitos */}
          <div className="md:col-span-1 lg:col-span-5 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#B5654A] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Club de Hitos FIRME
                </span>
                <span className="text-xs font-bold text-[#1A1815] bg-[#F1ECE5] px-2.5 py-0.5 rounded-full border border-[#E4DED4]">
                  Nivel 2: Constancia
                </span>
              </div>

              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-fraunces text-xl text-[#1A1815] font-medium leading-tight">
                    {currentUser?.levelTitle || `Categoría Nivel ${currentUser?.level ?? 2}: Enfoque & Constancia`}
                  </h4>
                  <p className="text-xs text-[#6B655C] mt-0.5">
                    Acreditas <strong>+100 pts</strong> por cada sesión asistida en reformer.
                  </p>
                </div>

                {onOpenLevelModal && (
                  <button
                    type="button"
                    onClick={onOpenLevelModal}
                    className="bg-[#1A1815] hover:bg-[#B5654A] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                  >
                    <span>Ver Escala de Categorías</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* EXP Progress Bar */}
              <div className="space-y-1.5 mb-4 bg-white p-3 rounded-xl border border-[#E4DED4] shadow-2xs">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#1A1815] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
                    Puntos acumulados:
                  </span>
                  <span className="text-[#B5654A] font-bold font-mono">
                    {currentUser?.exp ?? 1350} / 2000 pts (67%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#E4DED4] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#B5654A] to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((currentUser?.exp ?? 1350) / 2000) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#6B655C] block">
                  Faltan <strong>{Math.max(0, 2000 - (currentUser?.exp ?? 1350))} pts</strong> para desbloquear <em>Categoría Nivel III: Maestría Reformer</em>
                </span>
              </div>

              {/* Next Reward Alert Box */}
              <div className="bg-[#FAF2E8] border border-[#ECD1B0] rounded-xl p-3 text-xs text-[#8C5511] flex items-start gap-2.5 mb-4">
                <Gift className="w-4 h-4 text-[#B5654A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Próximo Beneficio de Rango (Nivel III):</span>
                  <span>Calcetines Grip Antideslizantes FIRME edición especial en recepción.</span>
                </div>
              </div>

              {/* Milestone Badges Strip */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-[#EDF5F0] border border-[#C5DEC9] text-[#245E39]">
                  <span className="font-bold block">Nv. 1 Semilla</span>
                  <span className="text-[9px]">Completado ✓</span>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF8F5] border-2 border-[#B5654A] text-[#B5654A] font-semibold">
                  <span className="font-bold block">Nv. 2 Enfoque</span>
                  <span className="text-[9px]">Nivel Actual</span>
                </div>
                <div className="p-2 rounded-lg bg-[#F1ECE5] border border-[#E4DED4] text-[#6B655C]">
                  <span className="font-bold block">Nv. 3 Maestría</span>
                  <span className="text-[9px]">Grip Socks</span>
                </div>
                <div className="p-2 rounded-lg bg-[#F1ECE5] border border-[#E4DED4] text-[#6B655C]">
                  <span className="font-bold block">Nv. 4 Élite</span>
                  <span className="text-[9px]">Sesión 1-on-1</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4DED4] text-[11px] text-[#6B655C] flex items-center justify-between">
              <span>Tu constancia suma puntos y protege tu espalda</span>
              <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
            </div>
          </div>

        </div>

        {/* Empty State */}
        {bookedClasses.length === 0 && waitlistClasses.length === 0 && alertClasses.length === 0 ? (
          <div
            id="empty-my-classes"
            className="bg-[#F1ECE5]/60 border border-dashed border-[#D6CEC2] rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto"
          >
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center mx-auto mb-4 text-[#B5654A] shadow-xs">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-fraunces text-xl text-[#1A1815] font-medium mb-2">
              Aún no tienes reservas activas
            </h3>
            <p className="text-xs sm:text-sm text-[#6B655C] leading-relaxed mb-6 max-w-md mx-auto">
              Selecciona tu clase favorita en nuestro calendario semanal para asegurar tu reformer o colchoneta. Recuerda que los cupos están limitados a 8 personas por sesión.
            </p>
            <button
              id="btn-empty-state-explore"
              onClick={onExploreSchedule}
              className="inline-flex items-center justify-center bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-6 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 shadow-xs cursor-pointer"
            >
              <span>Ver Horario Semanal</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. CONFIRMED BOOKINGS */}
            {bookedClasses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium tracking-wider uppercase text-[#6B655C] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Sesiones Confirmadas ({bookedClasses.length})
                  </h3>
                  <span className="text-[11px] text-[#6B655C]">
                    Cancelación gratuita hasta 12h antes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookedClasses.map((session) => (
                    <div
                      key={session.id}
                      id={`my-class-card-${session.id}`}
                      className="bg-[#FAF8F5] border border-[#E4DED4] rounded-lg p-5 shadow-xs hover:border-[#B5654A]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Top info header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-[#B5654A] font-medium mb-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{getDayFullLabel(session.day)}</span>
                            </div>
                            <h4 className="font-fraunces text-lg text-[#1A1815] font-medium">
                              {session.name}
                            </h4>
                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-[#EDF5F0] text-[#245E39] border border-[#C5DEC9] shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            Plaza asegurada
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {renderClassTypeBadge(session.classType)}
                          {renderDifficultyBadge(session.level)}
                        </div>

                        {/* Details grid */}
                        <div className="bg-[#F1ECE5] rounded-md p-3 text-xs space-y-1.5 mb-4 text-[#1A1815]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B655C] flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1 text-[#B5654A]" />
                              Horario:
                            </span>
                            <span className="font-medium">{session.time} h ({session.duration})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B655C] flex items-center">
                              <User className="w-3.5 h-3.5 mr-1 text-[#B5654A]" />
                              Instructor:
                            </span>
                            <span className="font-medium">{session.instructor}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B655C] flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1 text-[#B5654A]" />
                              Enfoque:
                            </span>
                            <span className="text-[11px] text-right truncate max-w-[200px] text-[#6B655C]">
                              {session.focus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#E4DED4] flex items-center justify-between">
                        <span className="text-[11px] text-[#6B655C]">
                          Tarifa: <strong>S/. 95</strong> (o pase activo)
                        </span>

                        <button
                          id={`btn-cancel-class-${session.id}`}
                          onClick={() => setClassToCancel(session)}
                          className="inline-flex items-center text-xs font-medium text-[#9A5340] hover:text-[#7A3626] hover:bg-[#9A5340]/10 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                          title="Cancelar esta reserva"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1.5" />
                          Cancelar reserva
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. ACTIVE AVAILABILITY ALERTS */}
            {alertClasses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-medium tracking-wider uppercase text-[#6B655C] flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-[#B5654A]" />
                  Avisos de Disponibilidad Automáticos ({alertClasses.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alertClasses.map((session) => (
                    <div
                      key={`alert-${session.id}`}
                      className="bg-[#FAF8F5] border border-[#B5654A]/30 rounded-lg p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FAF2E8] border border-[#ECD1B0] flex items-center justify-center text-[#B5654A] shrink-0">
                          <BellRing className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-fraunces text-sm font-medium text-[#1A1815]">
                            {session.name}
                          </p>
                          <p className="text-xs text-[#6B655C]">
                            {getDayFullLabel(session.day)} a las {session.time} h · {session.instructor}
                          </p>
                          <span className="text-[10px] text-[#B5654A] font-medium">
                            Aviso activo: Te notificaremos si se libera un cupo
                          </span>
                        </div>
                      </div>

                      {onCancelAlert && (
                        <button
                          onClick={() => onCancelAlert(session.id)}
                          className="text-xs text-[#6B655C] hover:text-[#1A1815] p-1.5 rounded-md hover:bg-[#F1ECE5] transition-colors cursor-pointer shrink-0"
                          title="Desactivar aviso"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. WAITLIST */}
            {waitlistClasses.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-medium tracking-wider uppercase text-[#6B655C] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#B5654A]" />
                  En Lista de Espera ({waitlistClasses.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {waitlistClasses.map((session) => (
                    <div
                      key={`wl-${session.id}`}
                      className="bg-[#FAF8F5] border border-[#E4DED4] rounded-lg p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-fraunces text-sm font-medium text-[#1A1815]">
                          {session.name}
                        </p>
                        <p className="text-xs text-[#6B655C]">
                          {getDayFullLabel(session.day)} a las {session.time} h con {session.instructor}
                        </p>
                        <span className="text-[11px] text-[#B5654A] font-medium">
                          Turno #2 en lista de espera
                        </span>
                      </div>

                      {onCancelWaitlist && (
                        <button
                          onClick={() => onCancelWaitlist(session.id)}
                          className="text-xs text-[#9A5340] hover:text-[#7A3626] p-1.5 rounded-md hover:bg-[#9A5340]/10 transition-colors cursor-pointer shrink-0"
                          title="Salir de la lista de espera"
                        >
                          Salir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Confirmation Dialog */}
        {classToCancel && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setClassToCancel(null)}
          >
            <div
              className="bg-[#FAF8F5] border border-[#E4DED4] rounded-lg p-6 max-w-md w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-full bg-[#FAECE8] text-[#A64028] flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="font-fraunces text-xl text-[#1A1815] font-medium mb-2">
                ¿Deseas cancelar esta reserva?
              </h3>

              <p className="text-xs sm:text-sm text-[#6B655C] leading-relaxed mb-4">
                Vas a cancelar tu lugar en <strong className="text-[#1A1815]">{classToCancel.name}</strong> programada para el{' '}
                <strong className="text-[#1A1815]">{getDayFullLabel(classToCancel.day)} a las {classToCancel.time} h</strong>. Tu cupo será liberado inmediatamente para los alumnos en espera.
              </p>

              <div className="bg-[#F1ECE5] p-3 rounded-md text-xs text-[#6B655C] mb-5">
                • Si tienes un pase o paquete de clases, tu crédito será reembolsado automáticamente a tu cuenta.
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setClassToCancel(null)}
                  className="px-4 py-2 rounded-md border border-[#E4DED4] text-xs font-medium text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                >
                  Mantener reserva
                </button>
                <button
                  type="button"
                  id="btn-confirm-cancel-booking"
                  onClick={() => {
                    const id = classToCancel.id;
                    setClassToCancel(null);
                    onCancelBooking(id);
                  }}
                  className="px-4 py-2 rounded-md bg-[#A64028] hover:bg-[#8B3420] text-[#FAF8F5] text-xs font-medium transition-colors cursor-pointer shadow-xs"
                >
                  Sí, cancelar reserva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal QR Ampliado en Pantalla Completa (Escaneo Rápido para Tótem / Recepción) */}
        {isQrEnlarged && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/80 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsQrEnlarged(false)}
          >
            <div
              className="bg-white rounded-3xl border border-[#E4DED4] p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsQrEnlarged(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
                aria-label="Cerrar QR ampliado"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                FIRME PASS · QR OFICIAL ACTIVO
              </div>

              <h3 className="font-fraunces text-2xl text-[#1A1815] font-semibold mb-1">
                {studentName}
              </h3>
              <p className="text-xs font-mono text-[#B5654A] font-bold mb-4">
                DNI: {studentDni} · ID: {studentId}
              </p>

              {/* Large high contrast scannable QR */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border-2 border-[#1A1815] inline-block shadow-inner mb-4">
                <img
                  src={qrImageUrl}
                  alt={`QR Pase Oficial de ${studentName}`}
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                />
              </div>

              <p className="text-xs text-[#6B655C] leading-relaxed mb-4">
                Acerca este código a la <strong>cámara del tótem</strong> o muéstralo en recepción en <strong>Jr. Akapana 1261</strong> para registrar tu asistencia y ver tu cama Reformer asignada.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPass}
                  disabled={isDownloadingPass}
                  className="flex-1 bg-[#1A1815] hover:bg-[#2A2421] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-[#B5654A]" />
                  <span>{isDownloadingPass ? 'Generando...' : 'Descargar Pase'}</span>
                </button>
                {onOpenCheckInModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQrEnlarged(false);
                      onOpenCheckInModal();
                    }}
                    className="bg-[#B5654A] hover:bg-[#9A5340] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Autocheck-in</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
