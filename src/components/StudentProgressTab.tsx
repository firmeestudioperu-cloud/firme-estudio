import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Zap,
  Gift,
  CheckCircle2,
  Lock,
  Flame,
  Target,
  Clock,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Calendar,
  Layers,
  Activity,
  Trophy,
  Crown,
  Sun,
  Users,
  QrCode,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { AuthUser } from '../types';

interface StudentProgressTabProps {
  currentUser?: AuthUser | null;
  onGainExp?: (amount: number, reason: string) => void;
  onExploreSchedule?: () => void;
  onOpenCheckInModal?: () => void;
}

import { LEVEL_TIERS } from '../data/studentProgressionData';

export const StudentProgressTab: React.FC<StudentProgressTabProps> = ({
  currentUser,
  onGainExp,
  onExploreSchedule,
  onOpenCheckInModal,
}) => {
  const [selectedTabSection, setSelectedTabSection] = useState<'roadmap' | 'misiones' | 'insignias'>('roadmap');

  const currentExp = currentUser?.exp ?? 1350;
  const currentLevel = currentUser?.level ?? 2;

  const currentTier = LEVEL_TIERS.find((t) => t.level === currentLevel) || LEVEL_TIERS[1];
  const nextTier = LEVEL_TIERS.find((t) => t.level === currentLevel + 1) || LEVEL_TIERS[2];

  const expInCurrentLevel = currentExp - currentTier.minExp;
  const expNeededForNextLevel = nextTier.minExp - currentTier.minExp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((expInCurrentLevel / expNeededForNextLevel) * 100)));
  const expToNextLevel = Math.max(0, nextTier.minExp - currentExp);

  const CurrentIcon = currentTier.iconComponent;

  return (
    <section id="tab-student-progress" className="py-10 sm:py-14 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ========================================================================= */}
        {/* 1. HERO EJECUTIVO / MEMBRESÍA & EVOLUCIÓN BIOMECÁNICA                     */}
        {/* ========================================================================= */}
        <div className="bg-[#141311] rounded-3xl p-6 sm:p-8 lg:p-10 text-white shadow-2xl border border-[#2D2824] relative overflow-hidden">
          {/* Subtle architectural lighting */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[#B5654A]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Col 1 (7 cols): Member Details & Metrics */}
            <div className="lg:col-span-7 space-y-6">
              {/* Studio Status Pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-[#B5654A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md shadow-xs">
                  Membresía Exclusiva
                </span>
                <span className="text-white/80 text-xs flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Sede Oficial: <strong>Jr. Akapana 1261, SJL</strong>
                </span>
                <span className="text-amber-300 text-xs flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Constancia: 3 Semanas Consecutivas
                </span>
              </div>

              {/* Member Profile Block */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#221F1B] border-2 border-[#B5654A]/60 p-1 shadow-xl flex items-center justify-center overflow-hidden">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <CurrentIcon className="w-10 h-10 text-[#B5654A]" />
                    )}
                  </div>
                  <span className="absolute -bottom-2 -right-1 bg-[#B5654A] text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm border border-white/20">
                    Nivel {currentTier.romanNumeral}
                  </span>
                </div>

                <div className="min-w-0">
                  <h1 className="font-fraunces text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight">
                    {currentUser?.name || 'Sofía Montaner'}
                  </h1>
                  <p className="text-sm font-semibold text-[#D47E63] mt-1 flex items-center gap-2">
                    <CurrentIcon className="w-4 h-4 text-[#B5654A] shrink-0" />
                    <span>Nivel {currentTier.romanNumeral} — {currentTier.name}</span>
                  </p>
                  <p className="text-xs text-white/60 mt-1.5 max-w-lg leading-relaxed">
                    {currentTier.focus}
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] uppercase text-white/50 block font-semibold tracking-wider">Sesiones en Sala</span>
                  <span className="font-fraunces text-2xl text-white font-semibold block mt-0.5">14</span>
                  <span className="text-[10px] text-emerald-400 font-medium">100% Asistencia</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] uppercase text-white/50 block font-semibold tracking-wider">Tiempo en Carro</span>
                  <span className="font-fraunces text-2xl text-white font-semibold block mt-0.5">770 min</span>
                  <span className="text-[10px] text-white/60">Trabajo postural</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] uppercase text-white/50 block font-semibold tracking-wider">Distinciones</span>
                  <span className="font-fraunces text-2xl text-amber-300 font-semibold block mt-0.5">4 / 8</span>
                  <span className="text-[10px] text-white/60">Acreditadas</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] uppercase text-white/50 block font-semibold tracking-wider">Sede SJL</span>
                  <span className="font-fraunces text-2xl text-emerald-400 font-semibold block mt-0.5">Top 12%</span>
                  <span className="text-[10px] text-white/60">Mayor regularidad</span>
                </div>
              </div>
            </div>

            {/* Col 2 (5 cols): Practice Points & Next Tier Milestone */}
            <div className="lg:col-span-5 bg-[#1C1A17] rounded-2xl p-5 sm:p-6 border border-white/10 space-y-5 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#B5654A]" />
                    Puntos de Práctica & Fidelidad
                  </span>
                  <span className="font-mono text-xl font-bold text-white tracking-tight">
                    {currentExp.toLocaleString()} pts
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="pt-4 space-y-2.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/70">Progreso hacia Nivel {nextTier.romanNumeral} ({nextTier.name})</span>
                    <span className="text-amber-300 font-bold font-mono">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-[#B5654A] to-amber-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-white/50 font-mono">
                    <span>{currentTier.minExp} pts</span>
                    <span className="text-amber-200/90 font-sans font-medium">
                      {expToNextLevel} puntos para {nextTier.name}
                    </span>
                    <span>{nextTier.minExp} pts</span>
                  </div>
                </div>
              </div>

              {/* Next Milestone Card */}
              <div className="bg-[#24211D] border border-white/10 rounded-xl p-4 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <Gift className="w-4 h-4 text-[#B5654A]" />
                  <span>Próximo Beneficio de Rango (Nivel {nextTier.romanNumeral}):</span>
                </div>
                <p className="text-white font-medium leading-snug">
                  {nextTier.reward}
                </p>
                <p className="text-[11px] text-white/60">
                  {nextTier.perks[0]}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {onExploreSchedule && (
                  <button
                    type="button"
                    onClick={onExploreSchedule}
                    className="bg-[#B5654A] hover:bg-[#9E4F36] text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reservar Sesión (+100 pts)</span>
                  </button>
                )}

                {onOpenCheckInModal && (
                  <button
                    type="button"
                    onClick={onOpenCheckInModal}
                    className="bg-white/10 hover:bg-white/20 text-white py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Check-in en Sede (+150 pts)</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. REGISTRO & ACREDITACIÓN DE PRÁCTICA (ZERO EMOJIS, HIGH-END)            */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E4DED4] rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E4DED4]">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-[#B5654A]" />
              <div>
                <h3 className="font-fraunces text-lg text-[#1A1815] font-medium">
                  Acreditación de Práctica & Sesiones en Sala
                </h3>
                <p className="text-xs text-[#6B655C] mt-0.5">
                  Registra tus asistencias y compromisos para sumar puntos y evolucionar de categoría:
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#B5654A] bg-[#B5654A]/10 px-3 py-1 rounded-md self-start sm:self-auto">
              Simulación Activa
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <button
              type="button"
              onClick={() => onGainExp?.(100, 'Asistencia a Clase Reformer')}
              className="p-4 bg-[#FAF8F5] hover:bg-white border border-[#E4DED4] hover:border-[#B5654A] rounded-xl text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#B5654A]/10 flex items-center justify-center text-[#B5654A] group-hover:bg-[#B5654A] group-hover:text-white transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#B5654A] bg-[#B5654A]/10 px-2 py-0.5 rounded">
                    +100 pts
                  </span>
                </div>
                <span className="font-bold text-[#1A1815] block group-hover:text-[#B5654A] transition-colors text-sm">
                  Asistencia a Clase
                </span>
                <span className="text-[11px] text-[#6B655C] mt-1 block">
                  50 minutos de práctica en camilla reformer.
                </span>
              </div>
              <span className="text-[10px] text-[#8C5511] font-semibold mt-3 pt-2 border-t border-[#E4DED4]/60 flex items-center gap-1">
                Registrar sesión <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onGainExp?.(25, 'Puntualidad en Sala (10 min antes)')}
              className="p-4 bg-[#FAF8F5] hover:bg-white border border-[#E4DED4] hover:border-emerald-600 rounded-xl text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    +25 pts
                  </span>
                </div>
                <span className="font-bold text-[#1A1815] block group-hover:text-emerald-700 transition-colors text-sm">
                  Puntualidad en Sala
                </span>
                <span className="text-[11px] text-[#6B655C] mt-1 block">
                  Llegada 10 minutos antes para calentamiento.
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-3 pt-2 border-t border-[#E4DED4]/60 flex items-center gap-1">
                Registrar puntualidad <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onGainExp?.(50, 'Check-in Digital con QR en Recepción')}
              className="p-4 bg-[#FAF8F5] hover:bg-white border border-[#E4DED4] hover:border-sky-600 rounded-xl text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    +50 pts
                  </span>
                </div>
                <span className="font-bold text-[#1A1815] block group-hover:text-sky-700 transition-colors text-sm">
                  Check-in en Tótem
                </span>
                <span className="text-[11px] text-[#6B655C] mt-1 block">
                  Validación digital en la pantalla de recepción.
                </span>
              </div>
              <span className="text-[10px] text-sky-700 font-semibold mt-3 pt-2 border-t border-[#E4DED4]/60 flex items-center gap-1">
                Validar código QR <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>

            <button
              type="button"
              onClick={() => onGainExp?.(150, 'Bonus de Constancia Semanal (3 semanas seguidas)')}
              className="p-4 bg-[#FAF8F5] hover:bg-white border border-[#E4DED4] hover:border-amber-600 rounded-xl text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    +150 pts
                  </span>
                </div>
                <span className="font-bold text-[#1A1815] block group-hover:text-amber-800 transition-colors text-sm">
                  Constancia Semanal
                </span>
                <span className="text-[11px] text-[#6B655C] mt-1 block">
                  3 semanas consecutivas cumpliendo tu plan.
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-semibold mt-3 pt-2 border-t border-[#E4DED4]/60 flex items-center gap-1">
                Acreditar constancia <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. NAVEGACIÓN DE SECCIONES (ROADMAP / METAS / RECONOCIMIENTOS)            */}
        {/* ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-[#E4DED4] pb-4 gap-4">
          <div className="flex overflow-x-auto pb-1 scrollbar-none items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSelectedTabSection('roadmap')}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedTabSection === 'roadmap'
                    ? 'bg-[#141311] text-white shadow-xs'
                    : 'bg-[#F1ECE5] text-[#6B655C] hover:bg-[#E4DED4] hover:text-[#1A1815]'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Escala de Categorías</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTabSection('misiones')}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedTabSection === 'misiones'
                    ? 'bg-[#141311] text-white shadow-xs'
                    : 'bg-[#F1ECE5] text-[#6B655C] hover:bg-[#E4DED4] hover:text-[#1A1815]'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Metas Semanales</span>
                <span className="w-2 h-2 rounded-full bg-[#B5654A]" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedTabSection('insignias')}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  selectedTabSection === 'insignias'
                    ? 'bg-[#141311] text-white shadow-xs'
                    : 'bg-[#F1ECE5] text-[#6B655C] hover:bg-[#E4DED4] hover:text-[#1A1815]'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Reconocimientos de Práctica</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-900 px-2 py-0.5 rounded-full font-bold font-mono">
                  4/8
                </span>
              </button>
            </div>

            <div className="text-xs text-[#6B655C] hidden sm:block font-medium">
              Sede oficial: <strong>Jr. Akapana 1261, Lima - SJL</strong>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN A: ESCALA DE CATEGORÍAS (ROADMAP)                                */}
          {/* ========================================================================= */}
          {selectedTabSection === 'roadmap' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white p-4 rounded-2xl border border-[#E4DED4] flex items-center justify-between text-xs text-[#6B655C]">
                <span>
                  Cada categoría representa un estadio biomecánico consolidado en el reformer. La acumulación de puntos habilita beneficios de reserva y reconocimientos de estudio.
                </span>
              </div>

              <div className="space-y-4">
                {LEVEL_TIERS.map((tier) => {
                  const isCurrent = tier.level === currentLevel;
                  const isUnlocked = currentExp >= tier.minExp;
                  const TierIcon = tier.iconComponent;

                  return (
                    <div
                      key={tier.level}
                      className={`rounded-2xl border p-6 sm:p-7 transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-white via-[#FAF8F5] to-[#FAF2E8] border-[#B5654A] shadow-md ring-1 ring-[#B5654A]/40'
                          : isUnlocked
                          ? 'bg-white border-[#E4DED4] shadow-xs'
                          : 'bg-[#F1ECE5]/40 border-[#E4DED4]/60 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4DED4]/70">
                        <div className="flex items-start sm:items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border ${
                            isCurrent
                              ? 'bg-[#B5654A] text-white border-[#B5654A]'
                              : isUnlocked
                              ? 'bg-[#F1ECE5] text-[#B5654A] border-[#E4DED4]'
                              : 'bg-[#E4DED4] text-[#8C8479] border-[#DDD5C9]'
                          }`}>
                            <TierIcon className="w-6 h-6" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#B5654A]">
                                Categoría {tier.romanNumeral}
                              </span>
                              {isCurrent && (
                                <span className="bg-[#B5654A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                  Tu Nivel Actual
                                </span>
                              )}
                              <span className="text-[11px] text-[#6B655C] font-mono">
                                ({tier.minExp.toLocaleString()} – {tier.maxExp.toLocaleString()} pts)
                              </span>
                            </div>

                            <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] font-medium mt-0.5">
                              {tier.name}
                            </h3>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF2E8] text-[#8C5511] border border-[#ECD1B0]">
                              <Sparkles className="w-3.5 h-3.5 text-[#B5654A]" />
                              {progressPercent}% Completado
                            </span>
                          ) : isUnlocked ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EDF5F0] text-[#245E39] border border-[#C5DEC9]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Habilitado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E4DED4] text-[#6B655C] border border-[#DDD5C9]">
                              <Lock className="w-3.5 h-3.5" />
                              Requiere {tier.minExp.toLocaleString()} pts
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
                        <div className="lg:col-span-7 space-y-3">
                          <p className="text-xs sm:text-sm text-[#6B655C] leading-relaxed">
                            <strong className="text-[#1A1815]">Enfoque Biomecánico:</strong> {tier.focus}
                          </p>

                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A1815] block mb-1.5">
                              Privilegios y Beneficios de este Rango:
                            </span>
                            <ul className="space-y-1.5 text-xs text-[#6B655C]">
                              {tier.perks.map((p, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B5654A] shrink-0 mt-0.5" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Reward Card */}
                        <div className="lg:col-span-5">
                          <div className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-2 ${
                            isCurrent
                              ? 'bg-[#FAF2E8] border-[#ECD1B0] text-[#8C5511]'
                              : isUnlocked
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                              : 'bg-white border-[#E4DED4] text-[#6B655C]'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-[#B5654A] flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5" />
                                Beneficio Conmemorativo:
                              </span>
                              <span className="text-[9px] bg-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
                                {tier.rewardTag}
                              </span>
                            </div>

                            <p className="text-sm font-semibold text-[#1A1815] leading-snug">
                              {tier.reward}
                            </p>

                            <p className="text-[11px] text-[#6B655C] leading-relaxed">
                              Disponible para entrega y canje en el counter de recepción en <strong>Jr. Akapana 1261, SJL</strong>.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECCIÓN B: METAS SEMANALES                                               */}
          {/* ========================================================================= */}
          {selectedTabSection === 'misiones' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-[#FAF2E8] border border-[#ECD1B0] p-4 sm:p-5 rounded-2xl text-xs text-[#8C5511] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-800 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-[#B5654A]" />
                  </div>
                  <div>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Racha Activa: 3 Semanas Consecutivas
                    </h4>
                    <p className="text-[11px] text-[#8C5511]">
                      Mantén una frecuencia de al menos 2 sesiones por semana para recibir el reconocimiento de constancia (+300 pts).
                    </p>
                  </div>
                </div>

                <span className="bg-white px-3 py-1 rounded-full text-[11px] font-bold text-[#8C5511] self-start sm:self-auto shadow-2xs">
                  Próxima renovación en 3 días
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mission 1 */}
                <div className="p-5 bg-white rounded-2xl border border-emerald-300 shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                          Completado
                        </span>
                        <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                          Check-in Digital en Tótem
                        </h4>
                        <p className="text-xs text-[#6B655C] mt-0.5">
                          Escanear código QR en recepción al ingresar a la sede de Jr. Akapana 1261.
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 font-mono">
                      +50 pts ✓
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E4DED4] flex justify-between text-[11px] text-[#6B655C]">
                    <span>1 de 1 completado</span>
                    <span className="text-emerald-700 font-semibold">Puntos acreditados</span>
                  </div>
                </div>

                {/* Mission 2 */}
                <div className="p-5 bg-white rounded-2xl border border-[#B5654A] shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B5654A] block">
                          En Progreso (1/2)
                        </span>
                        <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                          Doble Frecuencia Semanal
                        </h4>
                        <p className="text-xs text-[#6B655C] mt-0.5">
                          Completar dos sesiones guiadas en Reformer en la semana en curso.
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#FAF2E8] text-[#8C5511] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#ECD1B0] shrink-0 font-mono">
                      +150 pts
                    </span>
                  </div>

                  <div>
                    <div className="w-full h-2 bg-[#E4DED4] rounded-full overflow-hidden mb-1">
                      <div className="w-1/2 h-full bg-[#B5654A]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#6B655C]">
                      <span>1 sesión realizada</span>
                      <span className="font-bold text-[#B5654A]">1 sesión pendiente</span>
                    </div>
                  </div>
                </div>

                {/* Mission 3 */}
                <div className="p-5 bg-white rounded-2xl border border-[#E4DED4] shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] block">
                          Pendiente
                        </span>
                        <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                          Sesión Matutina de Enfoque
                        </h4>
                        <p className="text-xs text-[#6B655C] mt-0.5">
                          Asistir a un turno matutino (06:30 o 07:30 AM).
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#F1ECE5] text-[#1A1815] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#E4DED4] shrink-0 font-mono">
                      +100 pts
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E4DED4] flex justify-between text-[11px] text-[#6B655C]">
                    <span>0 de 1 sesiones</span>
                    <button
                      type="button"
                      onClick={onExploreSchedule}
                      className="text-[#B5654A] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Ver horario matutino</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mission 4 */}
                <div className="p-5 bg-white rounded-2xl border border-[#E4DED4] shadow-2xs flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] block">
                          Pendiente
                        </span>
                        <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                          Exploración de Disciplinas
                        </h4>
                        <p className="text-xs text-[#6B655C] mt-0.5">
                          Experimentar una sesión de Tower Cadillac o Mat Sculpt.
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#F1ECE5] text-[#1A1815] text-xs font-bold px-2.5 py-1 rounded-lg border border-[#E4DED4] shrink-0 font-mono">
                      +75 pts
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#E4DED4] flex justify-between text-[11px] text-[#6B655C]">
                    <span>0 de 1 sesiones alternativas</span>
                    <button
                      type="button"
                      onClick={onExploreSchedule}
                      className="text-[#B5654A] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Explorar disciplinas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECCIÓN C: RECONOCIMIENTOS DE PRÁCTICA (8 BADGES, PURE SVGS)             */}
          {/* ========================================================================= */}
          {selectedTabSection === 'insignias' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white p-4 rounded-2xl border border-[#E4DED4] text-xs text-[#6B655C]">
                Distinciones de mérito otorgadas por disciplina postural, regularidad y control biomecánico en FIRME STUDIO.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Badge 1 */}
                <div className="bg-white border-2 border-emerald-400/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-2xs">
                      <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Acreditado
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Primer Salto
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      Completaste satisfactoriamente tu primera sesión de iniciación en Reformer.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B655C] pt-3 border-t border-[#E4DED4] block mt-4">
                    Conseguido: Mayo 2024
                  </span>
                </div>

                {/* Badge 2 */}
                <div className="bg-white border-2 border-amber-400/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 shadow-2xs">
                      <Flame className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                      Acreditado
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Racha de Constancia
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      3 semanas consecutivas de asistencia regular a clases en sede SJL.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B655C] pt-3 border-t border-[#E4DED4] block mt-4">
                    Conseguido: Agosto 2024
                  </span>
                </div>

                {/* Badge 3 */}
                <div className="bg-white border-2 border-blue-400/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 shadow-2xs">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                      Acreditado
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Columna Blindada
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      10 sesiones consecutivas manteniendo una correcta alineación lumbopélvica.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B655C] pt-3 border-t border-[#E4DED4] block mt-4">
                    Conseguido: Julio 2024
                  </span>
                </div>

                {/* Badge 4 */}
                <div className="bg-white border-2 border-emerald-400/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-2xs">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                      Acreditado
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Puntualidad en Sede
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      10 asistencias continuas registrándose con anticipación al inicio de sala.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B655C] pt-3 border-t border-[#E4DED4] block mt-4">
                    Conseguido: Agosto 2024
                  </span>
                </div>

                {/* Badge 5 (In progress) */}
                <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 opacity-80 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#E4DED4] text-[#8C8479] flex items-center justify-center mb-3">
                      <Sun className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] block">
                      En Progreso (2/5)
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Madrugador FIRME
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      Completar 5 clases en horario matutino de 06:30 o 07:30 AM.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E4DED4] mt-4">
                    <div className="w-full h-1.5 bg-[#E4DED4] rounded-full overflow-hidden">
                      <div className="w-2/5 h-full bg-[#B5654A]" />
                    </div>
                  </div>
                </div>

                {/* Badge 6 (In progress) */}
                <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 opacity-80 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#E4DED4] text-[#8C8479] flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] block">
                      En Progreso (4/10)
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Flexibilidad Fascial
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      10 sesiones enfocadas en elongación axial y liberación de tensiones.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E4DED4] mt-4">
                    <div className="w-full h-1.5 bg-[#E4DED4] rounded-full overflow-hidden">
                      <div className="w-4/10 h-full bg-[#B5654A]" />
                    </div>
                  </div>
                </div>

                {/* Badge 7 (Locked) */}
                <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 opacity-70 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#E4DED4] text-[#8C8479] flex items-center justify-center mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] block">
                      Por Desbloquear
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Embajador de Estudio
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      Invitar a un conocido/a a su primera sesión reformer en Jr. Akapana 1261.
                    </p>
                  </div>
                  <span className="text-[10px] text-[#6B655C] pt-3 border-t border-[#E4DED4] block mt-4">
                    Acredita: +200 pts
                  </span>
                </div>

                {/* Badge 8 (Locked legend) */}
                <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl p-5 opacity-70 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#E4DED4] text-[#8C8479] flex items-center justify-center mb-3">
                      <Crown className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B655C] block">
                      Por Desbloquear (14/100)
                    </span>
                    <h4 className="font-fraunces text-base text-[#1A1815] font-medium">
                      Centurión del Reformer
                    </h4>
                    <p className="text-xs text-[#6B655C] mt-1 leading-relaxed">
                      Alcanzar 100 clases asistidas en la sede de San Juan de Lurigancho.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#E4DED4] mt-4">
                    <div className="w-full h-1.5 bg-[#E4DED4] rounded-full overflow-hidden">
                      <div className="w-[14%] h-full bg-[#B5654A]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
