import React, { useState, useEffect } from 'react';
import { INSTRUCTORS } from '../data/mockData';
import {
  Award,
  Compass,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  X,
  Layers,
  Heart,
  Activity,
  ShieldCheck,
  ArrowRight,
  Users,
  BookOpen,
} from 'lucide-react';

const INSTRUCTOR_PHOTOS: Record<string, string> = {
  valeria: '/assets/instructor-valeria.jpg',
  mateo: '/assets/instructor-mateo.jpg',
  clara: '/assets/instructor-clara.jpg',
};

interface InstructorGridProps {
  initialSubTab?: 'instructores' | 'metodo';
}

export const InstructorGrid: React.FC<InstructorGridProps> = ({ initialSubTab = 'instructores' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'instructores' | 'metodo'>(initialSubTab);
  const [activeModal, setActiveModal] = useState<'pilates' | 'studio' | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <section
      id="profesores"
      className="w-full bg-[#FAF8F5] py-12 sm:py-16 lg:py-20 border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
              Docencia & Filosofía Biomecánica
            </span>
            <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
              {activeSubTab === 'instructores' ? 'Nuestros Instructores' : 'Ventanilla del Método Pilates'}
            </h2>
            <p className="mt-2 text-[#6B655C] text-sm sm:text-base leading-relaxed">
              {activeSubTab === 'instructores'
                ? 'Profesionales titulados con formación integral en anatomía funcional, biomecánica y el repertorio clásico de Joseph Pilates.'
                : 'Conoce los principios científicos del Reformer, nuestra metodología de adaptación anatómica y la guía para tus primeros pasos.'}
            </p>
          </div>

          {/* Segmented Switcher Pill: Instructores vs Método */}
          <div className="inline-flex p-1 bg-[#F1ECE5] border border-[#E4DED4] rounded-xl shrink-0 self-start md:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('instructores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSubTab === 'instructores'
                  ? 'bg-[#1A1815] text-[#FAF8F5] shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              <Users className="w-4 h-4 text-[#B5654A]" />
              <span>Instructores ({INSTRUCTORS.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('metodo')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSubTab === 'metodo'
                  ? 'bg-[#1A1815] text-[#FAF8F5] shadow-xs'
                  : 'text-[#6B655C] hover:text-[#1A1815]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#B5654A]" />
              <span>Ventanilla de Métodos</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-VIEW 1: INSTRUCTORES                                                 */}
        {/* ========================================================================= */}
        {activeSubTab === 'instructores' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* 3 Instructors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {INSTRUCTORS.map((teacher) => (
                <div
                  key={teacher.id}
                  id={`instructor-card-${teacher.id}`}
                  className="group bg-[#FAF8F5] border border-[#E4DED4] sm:border-0 p-4 sm:p-0 rounded-2xl sm:rounded-none shadow-xs sm:shadow-none flex flex-col transition-transform duration-300 ease-in-out hover:-translate-y-1"
                >
                  {/* Photo Showcase (Balanced on mobile, 4:5 on desktop) */}
                  <div
                    className="w-full aspect-[4/3] sm:aspect-[4/5] bg-[#E4DED4] rounded-xl border border-[#E4DED4] relative overflow-hidden mb-4 sm:mb-5 transition-all duration-500 group-hover:shadow-md"
                  >
                    <img
                      src={INSTRUCTOR_PHOTOS[teacher.id] || '/assets/instructor-valeria.jpg'}
                      alt={teacher.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1815]/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 bg-[#FAF8F5]/95 backdrop-blur-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] text-[#1A1815] font-medium border border-[#E4DED4] flex items-center justify-between shadow-xs">
                      <span>Certificación Oficial PMA</span>
                      <Award className="w-3.5 h-3.5 text-[#B5654A]" />
                    </div>
                  </div>

                  {/* Name & Specialty */}
                  <h3 className="font-fraunces text-lg sm:text-2xl text-[#1A1815] font-medium mb-1">
                    {teacher.name}
                  </h3>

                  <span className="text-[11px] sm:text-xs font-semibold text-[#B5654A] uppercase tracking-wider mb-2.5 sm:mb-3">
                    {teacher.specialty}
                  </span>

                  <p className="text-xs sm:text-sm text-[#6B655C] leading-relaxed mb-3 sm:mb-4 flex-grow">
                    {teacher.bio}
                  </p>

                  <span className="text-[10px] sm:text-[11px] text-[#6B655C]/90 italic pt-2 sm:pt-2.5 border-t border-[#E4DED4] block">
                    {teacher.certification}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick banner linking to Method window */}
            <div className="bg-[#F1ECE5]/70 border border-[#E4DED4] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shrink-0 shadow-2xs">
                  <Compass className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-fraunces text-lg text-[#1A1815] font-medium">
                    ¿Quieres conocer cómo estructuramos cada sesión?
                  </h4>
                  <p className="text-xs text-[#6B655C] mt-0.5">
                    Descubre los principios de respiración, resortes suizos y la guía de inicio en nuestra Ventanilla de Métodos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('metodo');
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                className="bg-[#1A1815] hover:bg-[#B5654A] text-[#FAF8F5] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
              >
                <span>Abrir Ventanilla de Métodos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 2: VENTANILLA DE MÉTODOS & PRIMEROS PASOS                       */}
        {/* ========================================================================= */}
        {activeSubTab === 'metodo' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* 1. Pilares Biomecánicos */}
            <div>
              <div className="mb-6">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                  Fundamentos Biomecánicos
                </span>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] font-medium">
                  Los 4 Pilares del Método FIRME
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF2E8] text-[#B5654A] flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-1">
                    Centro & Contrology
                  </h4>
                  <p className="text-xs text-[#6B655C] leading-relaxed">
                    Activación consciente del transverso abdominal y suelo pélvico en cada movimiento, blindando la zona lumbar.
                  </p>
                </div>

                <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-[#EDF5F0] text-[#2E7D46] flex items-center justify-center mb-3">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-1">
                    Respiración Torácica
                  </h4>
                  <p className="text-xs text-[#6B655C] leading-relaxed">
                    Respiración intercostal profunda que expande la caja torácica, disminuye la ansiedad y oxigena la fascia muscular.
                  </p>
                </div>

                <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF2E8] text-[#8C5511] flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-1">
                    Alineación Neutra
                  </h4>
                  <p className="text-xs text-[#6B655C] leading-relaxed">
                    Alineación progresiva de rodillas, caderas y columna con resortes suizos de resistencia concéntrica y excéntrica.
                  </p>
                </div>

                <div className="bg-white border border-[#E4DED4] rounded-2xl p-5 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] text-[#1A1815] flex items-center justify-center mb-3 border border-[#E4DED4]">
                    <Layers className="w-5 h-5 text-[#B5654A]" />
                  </div>
                  <h4 className="font-fraunces text-base text-[#1A1815] font-medium mb-1">
                    Fluidez sin Impacto
                  </h4>
                  <p className="text-xs text-[#6B655C] leading-relaxed">
                    Transiciones suaves y controladas sobre el carro deslizante sin golpear las articulaciones ni desgastar tendones.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Guía para Nuevos Alumnos (Tarjetas de Inicio) */}
            <div>
              <div className="mb-6">
                <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                  Primeros Pasos en el Estudio
                </span>
                <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] font-medium">
                  ¿Es tu primera vez con nosotros?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Card 1: Nuevo en Pilates */}
                <div
                  id="card-nuevo-en-pilates"
                  className="bg-[#F1ECE5] border border-[#E4DED4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xs group"
                >
                  <div>
                    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden mb-5 relative border border-[#E4DED4]/80 group-hover:shadow-xs transition-shadow">
                      <img
                        src="/assets/nuevo-en-pilates.jpg"
                        alt="Aprende Pilates Reformer"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-lg bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shadow-xs">
                        <Compass className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-[#1A1815]/75 backdrop-blur-xs text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded">
                        Fundamentos Reformer
                      </div>
                    </div>

                    <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-2 font-medium">
                      Nuevo en Pilates
                    </h3>
                    <p className="text-[#6B655C] text-xs sm:text-sm leading-relaxed mb-6">
                      Aprende la respiración intercostal, el control del centro y la mecánica
                      del Reformer desde cero con instructores especializados en alineación postural y adaptación anatómica.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveModal('pilates')}
                      className="inline-flex items-center text-sm font-semibold text-[#B5654A] hover:text-[#9A5340] group/link underline underline-offset-4 decoration-[#B5654A]/40 hover:decoration-[#9A5340] transition-colors cursor-pointer"
                    >
                      <span>Saber más sobre clases introductorias</span>
                      <ArrowUpRight className="ml-1.5 w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </button>
                  </div>
                </div>

                {/* Card 2: Nuevo en el estudio */}
                <div
                  id="card-nuevo-en-estudio"
                  className="bg-[#F1ECE5] border border-[#E4DED4] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xs group"
                >
                  <div>
                    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden mb-5 relative border border-[#E4DED4]/80 group-hover:shadow-xs transition-shadow">
                      <img
                        src="/assets/nuevo-en-estudio.jpg"
                        alt="Instalaciones y bienvenida en FIRME STUDIO"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 left-3 w-10 h-10 rounded-lg bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#E4DED4] flex items-center justify-center text-[#B5654A] shadow-xs">
                        <Sparkles className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-[#1A1815]/75 backdrop-blur-xs text-[#FAF8F5] text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded">
                        Experiencia en Sala
                      </div>
                    </div>

                    <h3 className="font-fraunces text-xl sm:text-2xl text-[#1A1815] mb-2 font-medium">
                      Nuevo en el estudio
                    </h3>
                    <p className="text-[#6B655C] text-xs sm:text-sm leading-relaxed mb-6">
                      Conoce nuestras normas de convivencia, cómo reservar tus sesiones semanales,
                      la política de cancelación de doce horas y las comodidades disponibles en vestuarios.
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setActiveModal('studio')}
                      className="inline-flex items-center text-sm font-semibold text-[#B5654A] hover:text-[#9A5340] group/link underline underline-offset-4 decoration-[#B5654A]/40 hover:decoration-[#9A5340] transition-colors cursor-pointer"
                    >
                      <span>Saber más sobre la experiencia en sala</span>
                      <ArrowUpRight className="ml-1.5 w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Instructors CTA */}
            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setActiveSubTab('instructores');
                  window.scrollTo({ top: 180, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#B5654A] hover:text-[#9A5340] cursor-pointer"
              >
                <span>← Volver a ver al Equipo Docente de Instructores</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Informative Modal when clicking "Saber más" */}
      {activeModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1815]/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-[#FAF8F5] rounded-2xl border border-[#E4DED4] p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B655C] hover:text-[#1A1815] hover:bg-[#F1ECE5] transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'pilates' ? (
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                  Guía de iniciación
                </span>
                <h3 className="font-fraunces text-2xl text-[#1A1815] mb-4">
                  Tu primera sesión en Reformer
                </h3>
                <div className="space-y-3.5 text-sm text-[#6B655C]">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Clase de Fundamentos:</strong> Te recomendamos comenzar por nuestras sesiones nivel 'Fundamentos' para familiarizarte con los muelles y la barra de pies.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Ropa recomendada:</strong> Ropa cómoda y flexible. Es obligatorio el uso de calcetines antideslizantes por higiene y agarre.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Llegada temprana:</strong> Te esperamos 10 minutos antes de tu primera clase para presentarte al instructor y calibrar el aparato.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                  Protocolo del estudio
                </span>
                <h3 className="font-fraunces text-2xl text-[#1A1815] mb-4">
                  Convivencia y reservas
                </h3>
                <div className="space-y-3.5 text-sm text-[#6B655C]">
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Cancelaciones:</strong> Cancelación sin cargo hasta 12 horas antes del inicio de la sesión.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Silencio y calma:</strong> Los móviles deben permanecer en silencio en las taquillas para preservar la concentración en sala.</p>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B5654A] mt-0.5 shrink-0" />
                    <p><strong className="text-[#1A1815]">Vestuarios:</strong> Disponemos de duchas privadas, toallas limpias y secadores a tu completa disposición.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#E4DED4] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
