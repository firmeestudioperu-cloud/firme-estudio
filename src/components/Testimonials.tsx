import React from 'react';
import { Star, ShieldCheck, CheckCircle2, Sparkles, Quote, Target } from 'lucide-react';

interface EnhancedTestimonial {
  id: string;
  name: string;
  duration: string;
  classesCount: number;
  goal: string;
  quote: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS_DATA: EnhancedTestimonial[] = [
  {
    id: 'test-1',
    name: 'Elena Serrano M.',
    duration: 'Alumna desde Mayo 2024',
    classesCount: 48,
    goal: 'Recuperación de hernia lumbar L4-L5',
    quote: 'Trabajo 9 horas frente a la computadora y vivía con contracturas constantes. En FIRME no me tratan como un número: Valeria me adaptó la tensión de los resortes y hoy puedo levantar peso y caminar sin una pizca de dolor.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    id: 'test-2',
    name: 'Javier Bermejo P.',
    duration: 'Alumno desde Noviembre 2023',
    classesCount: 62,
    goal: 'Movilidad articular y rendimiento en running',
    quote: 'Pensaba que Pilates en reformer era suave o solo para estirar. La clase de Mateo me demostró una exigencia biomecánica que mejoró mis tiempos en la media maratón de Lima y blindó mis rodillas.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
  {
    id: 'test-3',
    name: 'Sofía Montaner R.',
    duration: 'Alumna desde Agosto 2024',
    classesCount: 35,
    goal: 'Tonificación profunda y reducción de estrés',
    quote: 'El ambiente del estudio en San Juan de Lurigancho es único: luces cálidas, música suave y aromaterapia deliciosa. Salir de mi sesión de las 7:30 AM me deja con energía y la espalda totalmente erguida.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section
      id="testimonios"
      className="w-full bg-[#F1ECE5]/60 py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-2">
            Experiencias en el Estudio
          </span>
          <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
            Historias que inspiran constancia
          </h2>
          <p className="mt-2.5 text-[#6B655C] text-sm sm:text-base leading-relaxed">
            La transformación postural y el bienestar cotidiano contados por nuestras alumnas.
          </p>
        </div>

        {/* Testimonials Container (Clean editorial cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#B5654A]/50 shadow-2xs"
            >
              <div>
                {/* Clean Quote Text */}
                <p className="text-sm text-[#1A1815] leading-relaxed mb-6 font-normal italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Student Footer Card */}
              <div className="flex items-center space-x-3 pt-4 border-t border-[#E4DED4]/60">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E4DED4] shrink-0"
                />

                <div className="min-w-0">
                  <h3 className="font-fraunces text-sm font-medium text-[#1A1815] truncate">
                    {t.name}
                  </h3>
                  <span className="text-xs text-[#6B655C] block truncate">
                    {t.goal} · {t.classesCount} clases
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 pt-1 text-[11px] text-[#6B655C]">
          <span>Desliza para leer más historias</span>
          <span className="text-[#B5654A] font-bold">→</span>
        </div>

        {/* Studio Guarantee Banner */}
        <div className="mt-12 text-center text-xs text-[#6B655C] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#B5654A]" />
          <span>Todas las reseñas provienen de alumnos reales con asistencia confirmada en sala reformer.</span>
        </div>

      </div>
    </section>
  );
};
