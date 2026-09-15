import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onBookClass: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onBookClass }) => {
  return (
    <section
      id="cta-final"
      className="w-full bg-[#1A1815] text-[#FAF8F5] py-16 sm:py-20 lg:py-24 relative overflow-hidden"
    >
      {/* Subtle atmospheric background image */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <img
          src="/assets/hero-studio.jpg"
          alt="FIRME STUDIO"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover filter brightness-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1815] via-transparent to-[#1A1815]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <div className="inline-flex items-center space-x-2 text-xs font-medium tracking-widest uppercase text-[#B5654A] bg-[#FAF8F5]/10 px-3 py-1.5 rounded-md mb-6 border border-[#FAF8F5]/10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Comienza hoy</span>
        </div>

        <h2 className="font-fraunces text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FAF8F5] leading-tight mb-6 max-w-3xl mx-auto">
          El cuerpo que buscas, el cuidado que necesitas.
        </h2>

        <p className="text-base sm:text-lg text-[#FAF8F5]/80 max-w-xl mx-auto leading-relaxed mb-8">
          Reserva tu sesión introductoria de Reformer o consulta nuestros horarios semanales. Plazas limitadas a ocho personas por clase.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            id="btn-final-cta"
            onClick={onBookClass}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-8 py-4 rounded-md font-medium text-base transition-colors duration-200 shadow-md group"
          >
            <span>Reservar mi clase</span>
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="mt-8 text-xs text-[#FAF8F5]/60 flex items-center justify-center space-x-6">
          <span>Sin permanencia</span>
          <span>·</span>
          <span>Cancelación flexible</span>
          <span>·</span>
          <span>Atención 100% personalizada</span>
        </div>

      </div>
    </section>
  );
};
