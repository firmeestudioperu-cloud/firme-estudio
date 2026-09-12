import React from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, Car, Train, ExternalLink, Phone, MessageCircle } from 'lucide-react';

export const LocationSection: React.FC = () => {
  const googleMapsUrl = "https://maps.google.com/?q=Jr.+Akapana+1261,+San+Juan+de+Lurigancho,+Lima";
  const wazeUrl = "https://waze.com/ul?q=Jr.+Akapana+1261,+San+Juan+de+Lurigancho";

  return (
    <section
      id="ubicacion"
      className="w-full bg-[#F1ECE5]/60 py-16 sm:py-20 lg:py-24 border-b border-[#E4DED4]/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#B5654A] block mb-2">
              Ubicación & Estudio
            </span>
            <h2 className="font-fraunces text-2xl sm:text-3xl md:text-4xl text-[#1A1815] tracking-tight">
              Tu santuario de movimiento en San Juan de Lurigancho
            </h2>
            <p className="mt-3 text-[#6B655C] text-sm sm:text-base leading-relaxed">
              Un oasis acústico y visual diseñado para desconectarte del ruido urbano y conectar con tu respiración.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#1A1815] bg-[#FAF8F5] px-4 py-2 rounded-lg border border-[#E4DED4] self-start md:self-auto shadow-xs">
            <MapPin className="w-4 h-4 text-[#B5654A]" />
            <span className="font-medium">Jr. Akapana 1261 · LIMA - SJL</span>
          </div>
        </div>

        {/* 2-Column Main Layout: Info & Interactive Map Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Col 1 (5 cols): Location Details Cards */}
          <div className="md:col-span-1 lg:col-span-5 flex flex-col justify-between space-y-4">
            
            {/* Address & Hours Clean Card */}
            <div className="bg-[#FAF8F5] border border-[#E4DED4] rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6">
              
              {/* Address Header */}
              <div>
                <span className="text-[11px] font-semibold tracking-widest uppercase text-[#B5654A] block mb-1">
                  Sede San Juan de Lurigancho
                </span>
                <h3 className="font-fraunces text-xl text-[#1A1815] font-medium">
                  Jr. Akapana 1261
                </h3>
                <p className="text-xs text-[#6B655C] mt-1">
                  Zona residencial accesible con vigilancia y estacionamiento cercano.
                </p>
              </div>

              {/* Hours Schedule */}
              <div className="space-y-2 text-xs pt-4 border-t border-[#E4DED4]/60">
                <div className="flex justify-between py-1 border-b border-[#E4DED4]/40">
                  <span className="text-[#6B655C]">Lunes a Viernes</span>
                  <span className="font-medium text-[#1A1815]">06:30 – 21:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E4DED4]/40">
                  <span className="text-[#6B655C]">Sábados</span>
                  <span className="font-medium text-[#1A1815]">07:30 – 14:00</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#6B655C]">Domingos y Feriados</span>
                  <span className="font-medium text-[#1A1815]">08:30 – 13:00</span>
                </div>
              </div>

              {/* Action Buttons (Boutique styling) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1A1815] hover:bg-[#B5654A] text-[#FAF8F5] py-3 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>

                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-[#1A1815]/30 hover:border-[#1A1815] text-[#1A1815] hover:bg-[#1A1815]/5 py-3 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Navigation className="w-3.5 h-3.5 rotate-45" />
                  <span>Waze</span>
                </a>
              </div>

            </div>

          </div>

          {/* Col 2 (7 cols): Visual Studio Map Showcase & Room Atmosphere */}
          <div className="md:col-span-1 lg:col-span-7 bg-[#FAF8F5] border border-[#E4DED4] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
            {/* Realistic Editorial Studio Photo + Map Overlay */}
            <div className="relative w-full h-72 sm:h-80 md:h-96 overflow-hidden">
              <img
                src="/assets/hero-studio.jpg"
                alt="Instalaciones FIRME STUDIO San Juan de Lurigancho"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1815]/90 via-[#1A1815]/40 to-transparent" />
              
              {/* Floating Pin Card */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#FAF8F5]/95 backdrop-blur-md px-4 py-3 rounded-xl border border-[#E4DED4] shadow-lg max-w-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-[#1A1815] uppercase tracking-wider">Sala de Reformer Abierta</span>
                </div>
                <p className="text-[11px] text-[#6B655C] mt-1">
                  8 camas de madera noble con resortes suizos de tensión progresiva.
                </p>
              </div>

              {/* Bottom Info in Image */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
                <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                  <span className="bg-[#B5654A] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Sede Oficial SJL
                  </span>
                  <span className="text-white/80 text-xs">
                    Jr. Akapana 1261 · SJL
                  </span>
                </div>
                <h4 className="font-fraunces text-xl sm:text-2xl text-white font-normal">
                  Iluminación indirecta cálida y ambiente climatizado a 21°C
                </h4>
              </div>
            </div>

            {/* Highlights row */}
            <div className="p-5 sm:p-6 bg-[#FAF8F5] border-t border-[#E4DED4] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="font-fraunces text-xl font-bold text-[#1A1815] block">8</span>
                <span className="text-[11px] text-[#6B655C]">Camas Reformer</span>
              </div>
              <div>
                <span className="font-fraunces text-xl font-bold text-[#1A1815] block">SJL</span>
                <span className="text-[11px] text-[#6B655C]">Jr. Akapana 1261</span>
              </div>
              <div>
                <span className="font-fraunces text-xl font-bold text-[#1A1815] block">Lockers</span>
                <span className="text-[11px] text-[#6B655C]">Con cerradura digital</span>
              </div>
              <div>
                <span className="font-fraunces text-xl font-bold text-[#1A1815] block">Agua</span>
                <span className="text-[11px] text-[#6B655C]">Filtrada de cortesía</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
