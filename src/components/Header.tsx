import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Sparkles, MapPin, UserCheck, Zap, Award, Tablet, Activity, ShieldCheck, QrCode, Edit3 } from 'lucide-react';
import { MainTabType, AuthUser, isStaffRole } from '../types';

interface HeaderProps {
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
  bookedCount?: number;
  currentUser?: AuthUser | null;
  onOpenCheckInModal?: () => void;
  onOpenGoogleAuth?: () => void;
  onOpenLevelModal?: () => void;
  onOpenKioskModal?: () => void;
  onOpenBiomechanicsQuiz?: () => void;
  onOpenQrModal?: () => void;
  onOpenEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  bookedCount = 0,
  currentUser,
  onOpenCheckInModal,
  onOpenGoogleAuth,
  onOpenLevelModal,
  onOpenKioskModal,
  onOpenBiomechanicsQuiz,
  onOpenQrModal,
  onOpenEditProfile,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStaff = isStaffRole(currentUser?.role) && currentUser?.role !== 'instructor';
  const isOwnerDev = currentUser?.role === 'owner_dev';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { name: string; tab: MainTabType; count?: number }[] = [
    { name: 'Inicio', tab: 'inicio' },
    { name: 'Horarios', tab: 'horarios' },
    { name: 'Mis Clases', tab: 'mis-clases', count: bookedCount },
    { name: 'Membresías', tab: 'membresias' },
    { name: 'Instructores', tab: 'profesores' },
  ];

  const handleNavClick = (tab: MainTabType) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E4DED4] shadow-xs py-3'
          : 'bg-[#FAF8F5] border-b border-[#E4DED4]/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 min-w-0">
          
          {/* Group 1: Logo Brand (with Address) */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleNavClick('inicio')}
              id="brand-logo"
              className="flex items-center gap-2.5 group cursor-pointer focus:outline-hidden py-0.5 text-left"
              aria-label="FIRME STUDIO - Ir a la pestaña de inicio"
            >
              <img
                src="/firme-studio-logo.svg"
                alt="FIRME STUDIO"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-contain shadow-xs transition-transform duration-200 group-hover:scale-105 border border-[#DDD5C9]"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-fraunces text-sm sm:text-base font-semibold text-[#1A1815] tracking-wide leading-tight">
                  FIRME STUDIO
                </span>
                <span className="text-[10px] text-[#B5654A] font-semibold tracking-wider flex items-center gap-0.5 uppercase">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span>LIMA-SJL</span>
                </span>
              </div>
            </button>
          </div>

          {/* Group 2: Desktop Navigation (Spacious & Centered) */}
          <nav
            id="desktop-navigation"
            aria-label="Navegación por pestañas"
            className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3 whitespace-nowrap"
          >
            {navLinks.map((link) => {
              const isActive = activeTab === link.tab;
              return (
                <button
                  key={link.tab}
                  type="button"
                  onClick={() => handleNavClick(link.tab)}
                  className={`text-xs xl:text-sm px-2.5 py-1.5 rounded-lg transition-colors relative inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#1A1815] font-semibold bg-[#F1ECE5]/80 after:content-[\'\'] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[2px] after:bg-[#B5654A]'
                      : 'text-[#6B655C] font-medium hover:text-[#1A1815] hover:bg-[#F1ECE5]/40'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full leading-tight ${
                        isActive
                          ? 'bg-[#B5654A] text-[#FAF8F5]'
                          : 'bg-[#B5654A]/15 text-[#B5654A]'
                      }`}
                    >
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Group 3: Action & Utility Area */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Student Level & EXP Badge (Exclusive for Students on 2xl screens) */}
            {!isStaff && currentUser && (
              <button
                type="button"
                id="header-student-level-badge"
                onClick={() => handleNavClick('niveles')}
                className={`hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all cursor-pointer shadow-2xs group ${
                  activeTab === 'niveles'
                    ? 'bg-[#B5654A] text-[#FAF8F5] border-[#B5654A]'
                    : 'bg-[#FAF8F5] border-[#E4DED4] hover:border-[#B5654A] hover:bg-[#FAF2E8] text-[#1A1815]'
                }`}
                title="Ver tu nivel de estudiante, EXP y recompensas desbloqueables"
              >
                <Award className={`w-3.5 h-3.5 ${activeTab === 'niveles' ? 'text-white' : 'text-[#B5654A]'}`} />
                <span className={`text-[11px] font-bold ${
                  activeTab === 'niveles' ? 'text-white' : 'text-[#1A1815] group-hover:text-[#B5654A]'
                } transition-colors`}>
                  Nv. {currentUser?.level ?? 2}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === 'niveles'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#B5654A]/10 text-[#B5654A]'
                }`}>
                  {currentUser?.exp ?? 1350} pts
                </span>
              </button>
            )}

            {/* Check-in & Google Account button */}
            <div className="inline-flex items-center gap-1.5">
              <button
                id="header-cta-checkin"
                type="button"
                onClick={onOpenCheckInModal}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 sm:px-3 py-2 rounded-md border border-[#E4DED4] bg-white hover:bg-[#F1ECE5] hover:border-[#B5654A]/40 transition-all cursor-pointer text-[#1A1815] shadow-xs"
                title={currentUser ? `Mi cuenta: ${currentUser.name} (${currentUser.roleTitle || 'Alumna'})` : 'Check-in y crear cuenta con Gmail'}
              >
                {currentUser ? (
                  <>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-[#B5654A]" />
                    )}
                    <span className="font-semibold max-w-[85px] truncate">{currentUser.name.split(' ')[0]}</span>
                    {isStaff ? (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                          isOwnerDev
                            ? 'bg-[#B5654A] text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOwnerDev ? 'Dev' : 'Admin'}
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span className="hidden sm:inline">Ingresar / Registro</span>
                    <span className="sm:hidden">Acceso</span>
                  </>
                )}
              </button>

              {currentUser && onOpenEditProfile && (
                <button
                  type="button"
                  onClick={onOpenEditProfile}
                  className="hidden md:inline-flex p-2 rounded-md border border-[#E4DED4] bg-white hover:bg-[#FAF2E8] hover:border-[#B5654A]/50 text-[#6B655C] hover:text-[#B5654A] transition-colors cursor-pointer shadow-xs"
                  title="Editar datos del perfil"
                  aria-label="Editar datos del perfil"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Primary Action button */}
            <button
              id="header-cta-reserve"
              onClick={() => handleNavClick('horarios')}
              className="inline-flex items-center justify-center bg-[#B5654A] hover:bg-[#9A5340] text-[#FAF8F5] px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#B5654A]/40 cursor-pointer whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5 sm:hidden" />
              <span>Ver Horarios</span>
            </button>

            {/* Mobile / Tablet Hamburger Toggle (lg:hidden) */}
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#1A1815] hover:bg-[#F1ECE5] transition-colors focus:outline-hidden cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#1A1815]" />
              ) : (
                <Menu className="w-6 h-6 text-[#1A1815]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden pt-4 pb-3 border-t border-[#E4DED4] mt-3 space-y-1 animate-in fade-in duration-200"
          >
            {navLinks.map((link) => {
              const isActive = activeTab === link.tab;
              return (
                <button
                  key={link.tab}
                  type="button"
                  onClick={() => handleNavClick(link.tab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-base transition-colors text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#F1ECE5] font-semibold text-[#B5654A]'
                      : 'font-medium text-[#1A1815] hover:bg-[#F1ECE5] hover:text-[#B5654A]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.count !== undefined && link.count > 0 && (
                    <span className="text-xs bg-[#B5654A] text-[#FAF8F5] font-semibold px-2 py-0.5 rounded-full">
                      {link.count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 px-3 space-y-2">
              {/* Staff Portal Link (Exclusive for Owner Dev & Admin) */}
              {isStaff && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('admin');
                  }}
                  className="w-full py-2.5 px-3 rounded-md bg-[#1A1815] text-[#FAF8F5] border border-[#B5654A] text-xs font-semibold flex items-center justify-between shadow-xs cursor-pointer hover:bg-[#2A2420] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B5654A]" />
                    <span>Portal Staff / Panel Admin</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                      isOwnerDev ? 'bg-[#B5654A] text-white' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isOwnerDev ? 'Owner Dev' : 'Admin'}
                  </span>
                </button>
              )}

              {/* Student Level Badge (Students only) */}
              {!isStaff && currentUser && (
                <button
                  type="button"
                  onClick={() => handleNavClick('niveles')}
                  className={`w-full py-2.5 px-3 rounded-md border text-xs font-bold flex items-center justify-between shadow-2xs cursor-pointer transition-colors ${
                    activeTab === 'niveles'
                      ? 'bg-[#B5654A] text-[#FAF8F5] border-[#B5654A]'
                      : 'bg-gradient-to-r from-[#FAF2E8] to-[#FAF8F5] border-[#B5654A]/30 text-[#1A1815]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#B5654A]" />
                    <span>Nivel {currentUser?.level ?? 2}: {currentUser?.levelTitle || 'Enfoque & Constancia'}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'niveles' ? 'bg-white/20 text-white' : 'bg-[#B5654A] text-white'
                  }`}>
                    {currentUser?.exp ?? 1350} pts
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCheckInModal?.();
                }}
                className="w-full py-2.5 px-3 rounded-md bg-white border border-[#E4DED4] text-xs font-medium text-[#1A1815] flex items-center justify-center space-x-2 shadow-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{currentUser ? `Mi Cuenta (${currentUser.name})` : 'Check-in / Ingresar con Gmail'}</span>
              </button>

              {currentUser && onOpenEditProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEditProfile();
                  }}
                  className="w-full py-2.5 px-3 rounded-md bg-[#FAF2E8] border border-[#B5654A]/30 text-xs font-semibold text-[#B5654A] flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Datos del Perfil</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBiomechanicsQuiz?.();
                }}
                className="w-full py-2.5 px-3 rounded-md bg-[#F1ECE5] border border-[#E4DED4] text-xs font-semibold text-[#1A1815] flex items-center justify-between hover:border-[#B5654A] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#B5654A]" />
                  <span>Test Biomecánico y Postural</span>
                </div>
                <span className="text-[10px] text-[#B5654A] uppercase font-bold">4 Pasos</span>
              </button>

              {/* Staff Exclusive Mobile Reception Tools */}
              {isStaff && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenKioskModal?.();
                    }}
                    className="w-full py-2.5 px-3 rounded-md bg-[#1A1815] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Tablet className="w-4 h-4 text-amber-300" />
                    <span>Modo Tótem Kiosco (Tablet Recepción)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenQrModal?.();
                    }}
                    className="w-full py-2.5 px-3 rounded-md bg-white border border-[#DDD5C9] text-[#1A1815] hover:bg-[#F1ECE5] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-[#B5654A]" />
                    <span>QR Mostrador & Enlace de Registro</span>
                  </button>
                </>
              )}

              <div className="flex flex-col gap-1 text-xs text-[#6B655C] py-2 border-t border-[#E4DED4]">
                <div className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#B5654A] shrink-0" />
                  <span>Jr. Akapana 1261, Lima - SJL</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#B5654A] shrink-0" />
                  <span>Grupos reducidos · Máximo 8 personas</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
