import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { CarouselBanner, CarouselSettings } from '../types';
import {
  getStoredBanners,
  getStoredCarouselSettings,
  INITIAL_CAROUSEL_BANNERS,
} from '../data/bannerData';

interface HeroProps {
  onBookFirstClass: () => void;
  onViewSchedule: () => void;
  onOpenBiomechanicsQuiz?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onBookFirstClass,
  onViewSchedule,
  onOpenBiomechanicsQuiz,
}) => {
  const [banners, setBanners] = useState<CarouselBanner[]>(() => getStoredBanners());
  const [settings, setSettings] = useState<CarouselSettings>(() => getStoredCarouselSettings());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Active banners list
  const activeBanners =
    banners.filter((b) => b.isActive).length > 0
      ? banners.filter((b) => b.isActive)
      : INITIAL_CAROUSEL_BANNERS;

  // Listen for banner updates from the Admin Panel
  useEffect(() => {
    const handleUpdate = () => {
      setBanners(getStoredBanners());
      setSettings(getStoredCarouselSettings());
    };
    window.addEventListener('firme_banners_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('firme_banners_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Timer for automatic rotation (default: 4 minutes = 240,000 ms)
  useEffect(() => {
    if (!settings.autoPlay || activeBanners.length <= 1) {
      setProgress(0);
      return;
    }

    const intervalMinutes = settings.intervalMinutes || 4;
    const intervalMs = intervalMinutes * 60 * 1000;
    const stepMs = 500; // updates progress smoothly every 500ms
    const stepIncrement = (stepMs / intervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % activeBanners.length);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [settings.autoPlay, settings.intervalMinutes, activeBanners.length, currentIndex]);

  const goToNext = () => {
    setCurrentIndex((curr) => (curr + 1) % activeBanners.length);
    setProgress(0);
  };

  const goToPrev = () => {
    setCurrentIndex((curr) => (curr - 1 + activeBanners.length) % activeBanners.length);
    setProgress(0);
  };

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  const currentBanner = activeBanners[currentIndex % activeBanners.length] || activeBanners[0];

  return (
    <section
      id="hero-section"
      className="relative w-full bg-[#FAF8F5] py-10 sm:py-14 md:py-16 lg:py-20 flex items-center border-b border-[#E4DED4]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left / Top Text Area */}
          <div className="md:col-span-1 lg:col-span-7 flex flex-col justify-center space-y-5 sm:space-y-6">
            
            {/* Minimal Sub-tag */}
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-[#B5654A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B5654A]" />
              <span>Estudio Boutique Reformer & Cadillac</span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-headline"
              className="font-fraunces text-3xl sm:text-4xl md:text-5xl lg:text-[54px] leading-[1.12] text-[#1A1815] tracking-tight"
            >
              Movimiento consciente.<br />
              Pilates, con <span className="italic text-[#B5654A] font-normal">intención</span>.
            </h1>

            {/* Subtitle */}
            <p
              id="hero-subtitle"
              className="text-base sm:text-lg text-[#6B655C] max-w-xl leading-relaxed font-normal"
            >
              Reeduca tu postura, fortalece el centro y restaura el equilibrio corporal en un espacio concebido para el bienestar integral.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                id="hero-cta-primary"
                onClick={onBookFirstClass}
                className="inline-flex items-center justify-center bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-6 py-3.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 shadow-sm group cursor-pointer"
              >
                <span>Reserva tu primera clase</span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                id="hero-cta-secondary"
                onClick={onViewSchedule}
                className="inline-flex items-center justify-center border border-[#1A1815]/20 hover:border-[#1A1815] text-[#1A1815] hover:bg-[#1A1815]/5 px-6 py-3.5 rounded-lg font-medium text-sm sm:text-base transition-colors duration-200 cursor-pointer"
              >
                Ver horarios
              </button>
            </div>

            {/* Minimal Typographic Trust Row (Sin cuadros ni fondos grises) */}
            <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#6B655C] border-t border-[#E4DED4]/60">
              <span className="flex items-center gap-1.5 text-[#1A1815] font-medium">
                <span className="w-1 h-1 rounded-full bg-[#B5654A]" />
                8 Camas Reformer Allegro 2
              </span>
              <span className="hidden sm:inline text-[#E4DED4]">·</span>
              <span className="flex items-center gap-1.5 text-[#1A1815] font-medium">
                <span className="w-1 h-1 rounded-full bg-[#B5654A]" />
                Máximo 8 alumnas por sesión
              </span>
              <span className="hidden sm:inline text-[#E4DED4]">·</span>
              <span className="flex items-center gap-1.5 text-[#1A1815] font-medium">
                <span className="w-1 h-1 rounded-full bg-[#B5654A]" />
                Instructores Certificados PMA
              </span>
            </div>

          </div>

          {/* Right / Bottom Editorial Image Carousel */}
          <div className="md:col-span-1 lg:col-span-5 flex items-center justify-center">
            <div className="w-full max-w-md lg:max-w-none relative group">
              
              {/* Studio Showcase Card with 4-minute Auto-Carousel */}
              <div
                id="hero-image-showcase"
                className="w-full aspect-[16/10] sm:aspect-[16/11] lg:aspect-[4/5] bg-[#1A1815] rounded-xl border border-[#E4DED4] relative overflow-hidden transition-all duration-500 hover:shadow-xl select-none"
              >
                {/* Cross-fading Banner Images */}
                {activeBanners.map((banner, index) => {
                  const isCurrent = index === (currentIndex % activeBanners.length);
                  return (
                    <div
                      key={banner.id || index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={banner.url}
                        alt={banner.title}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        onError={(e) => {
                          // Fallback to local image if external link fails
                          (e.currentTarget as HTMLImageElement).src = '/assets/hero-studio.jpg';
                        }}
                      />
                    </div>
                  );
                })}

                {/* Subtle Vignette for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1815]/80 via-transparent to-black/10 z-10 pointer-events-none" />

                {/* Subtle Prev / Next Chevron Arrows on Hover */}
                {activeBanners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#1A1815]/60 hover:bg-[#1A1815] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/20 cursor-pointer shadow-sm"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#1A1815]/60 hover:bg-[#1A1815] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 border border-white/20 cursor-pointer shadow-sm"
                      aria-label="Siguiente imagen"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Minimal Editorial Caption */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-[#FAF8F5] z-20 flex items-end justify-between">
                  <div>
                    <span className="block font-fraunces text-lg sm:text-xl text-[#FAF8F5] font-medium tracking-tight">
                      {currentBanner.title}
                    </span>
                    <span className="block text-xs text-[#FAF8F5]/80 mt-0.5">
                      {currentBanner.locationLabel || 'Jr. Akapana 1261, SJL'} · {currentBanner.capacityLabel || 'Máx. 8 alumnas'}
                    </span>
                  </div>

                  {/* Dot Indicators */}
                  {activeBanners.length > 1 && (
                    <div className="flex items-center gap-1.5 pb-1">
                      {activeBanners.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToSlide(idx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            idx === currentIndex % activeBanners.length
                              ? 'w-5 bg-[#B5654A]'
                              : 'w-1.5 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Ver foto ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Continuous 4-minute Progress Bar */}
                {settings.showProgressBar && settings.autoPlay && activeBanners.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#B5654A] via-[#D49581] to-[#B5654A] transition-all duration-500 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
