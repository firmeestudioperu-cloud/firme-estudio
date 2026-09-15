import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Wallet,
  Receipt,
  Target,
  BarChart3,
  Server,
  Smartphone,
  MessageSquare,
  Image as ImageIcon,
  UserCheck,
  Settings,
  X,
  ExternalLink,
  LogOut,
  ChevronDown,
  ChevronRight,
  MapPin,
  QrCode,
} from 'lucide-react';
import {
  AdminSubTab,
  AuthUser,
  CashRegisterState,
  ExpenseRecord,
  LeadRecord,
} from '../../types';

export interface NavItemConfig {
  key: AdminSubTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export interface NavGroupConfig {
  groupTitle: string;
  items: NavItemConfig[];
}

interface AdminSidebarProps {
  currentSubTab: AdminSubTab;
  onSelectSubTab: (tab: AdminSubTab) => void;
  currentUser?: AuthUser | null;
  isOwnerDev: boolean;
  cashRegister: CashRegisterState;
  expenses: ExpenseRecord[];
  leads: LeadRecord[];
  mobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  onExitToPublic: () => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSubTab,
  onSelectSubTab,
  currentUser,
  isOwnerDev,
  cashRegister,
  expenses,
  leads,
  mobileSidebarOpen,
  onCloseMobileSidebar,
  onExitToPublic,
  onLogout,
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('firme_sidebar_collapsed_groups');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const isReceptionist = currentUser?.role === 'receptionist';
  const isInstructor = currentUser?.role === 'instructor';

  const NAV_GROUPS: NavGroupConfig[] = [
    {
      groupTitle: isInstructor ? 'SALA & INSTRUCTORA' : 'SALA & RECEPCIÓN',
      items: isInstructor
        ? [
            {
              key: 'instructor',
              label: 'Control Instructor',
              icon: Users,
              badge: 'Principal',
              badgeColor: 'bg-purple-700 text-white',
            },
            {
              key: 'agenda',
              label: 'Agenda Semanal',
              icon: Calendar,
            },
            {
              key: 'kiosco',
              label: 'Salas & Camas',
              icon: QrCode,
              badge: '2 Salas',
              badgeColor: 'bg-emerald-700 text-white',
            },
          ]
        : [
            {
              key: 'kiosco',
              label: 'Panel Alumno/Sala',
              icon: QrCode,
              badge: 'Salas & Café',
              badgeColor: 'bg-emerald-700 text-white',
            },
            {
              key: 'agenda',
              label: 'Agenda Semanal',
              icon: Calendar,
            },
            {
              key: 'instructor',
              label: 'Control Instructor',
              icon: Users,
            },
            {
              key: 'whatsapp',
              label: 'WhatsApp Alumnas',
              icon: MessageSquare,
            },
          ],
    },
    ...(!isInstructor
      ? [
          {
            groupTitle: 'CLIENTES & COMUNIDAD',
            items: [
              {
                key: 'clientes' as AdminSubTab,
                label: 'Directorio Clientes',
                icon: Users,
                badge: leads.filter((l) => l.status === 'nuevo').length
                  ? `+${leads.filter((l) => l.status === 'nuevo').length} leads`
                  : undefined,
                badgeColor: 'bg-rose-500 text-white font-bold',
              },
            ],
          },
        ]
      : []),
    ...(!isInstructor
      ? [
          {
            groupTitle: 'FINANZAS & VENTAS',
            items: [
              {
                key: 'caja' as AdminSubTab,
                label: 'Caja Diaria POS',
                icon: Wallet,
                badge: cashRegister.isOpen ? 'Abierta' : 'Cerrada',
                badgeColor: cashRegister.isOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
              },
              ...(!isReceptionist
                ? [
                    {
                      key: 'gastos' as AdminSubTab,
                      label: 'Gastos Operativos',
                      icon: Receipt,
                      badge: expenses.filter((e) => e.status === 'pendiente').length || undefined,
                      badgeColor: 'bg-amber-500 text-black',
                    },
                    {
                      key: 'reportes' as AdminSubTab,
                      label: 'Reportes & Métricas',
                      icon: BarChart3,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(!isReceptionist && !isInstructor
      ? [
          {
            groupTitle: 'ADMINISTRACIÓN & SISTEMA',
            items: [
              {
                key: 'usuarios' as AdminSubTab,
                label: 'Gestión de Usuarios',
                icon: UserCheck,
                badge: 'Staff',
                badgeColor: 'bg-[#B5654A]/30 text-[#FAF8F5] border border-[#B5654A]/40',
              },
              {
                key: 'seguridad' as AdminSubTab,
                label: 'Configuración & Web',
                icon: Settings,
              },
            ],
          },
        ]
      : []),
  ];

  const toggleGroup = (groupTitle: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [groupTitle]: !prev[groupTitle] };
      try {
        localStorage.setItem('firme_sidebar_collapsed_groups', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const collapseAllGroups = () => {
    const next: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      next[g.groupTitle] = true;
    });
    setCollapsedGroups(next);
    try {
      localStorage.setItem('firme_sidebar_collapsed_groups', JSON.stringify(next));
    } catch {}
  };

  const expandAllGroups = () => {
    setCollapsedGroups({});
    try {
      localStorage.setItem('firme_sidebar_collapsed_groups', JSON.stringify({}));
    } catch {}
  };

  // Keep active section open so user never loses sight of active module
  useEffect(() => {
    const parent = NAV_GROUPS.find((g) => g.items.some((it) => it.key === currentSubTab));
    if (parent && collapsedGroups[parent.groupTitle]) {
      setCollapsedGroups((prev) => {
        const next = { ...prev, [parent.groupTitle]: false };
        try {
          localStorage.setItem('firme_sidebar_collapsed_groups', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [currentSubTab]);

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobileSidebar}
        />
      )}

      {/* Elegant Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-40 w-64 bg-[#1A1815] text-[#FAF8F5] flex flex-col justify-between border-r border-[#2C2723] shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 h-screen shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header: Brand & Location */}
        <div className="p-4 border-b border-[#2C2723]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#FAF8F5] p-0.5 border border-[#B5654A] flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/firme-studio-logo.svg"
                  alt="FIRME STUDIO"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h2 className="font-fraunces text-sm font-semibold tracking-wide text-[#FAF8F5] leading-tight">
                  FIRME STUDIO
                </h2>
                <div className="flex items-center gap-1 text-[10px] text-[#B5654A] font-medium">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span>SJL · Lima</span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobileSidebar}
              className="lg:hidden p-1 text-[#8C8479] hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compact status & active user badge */}
          <div className="mt-3 pt-2.5 border-t border-[#2C2723]/60 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#AFA79C] font-medium">8 Camas</span>
            </div>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                isOwnerDev
                  ? 'bg-[#B5654A]/20 text-[#D49581] border border-[#B5654A]/30'
                  : currentUser?.role === 'instructor'
                  ? 'bg-purple-950 text-purple-300 border border-purple-700/50'
                  : currentUser?.role === 'receptionist'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
              }`}
            >
              {currentUser?.roleTitle || (isOwnerDev ? 'Owner Dev' : 'Admin Sede')}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Header & Quick Toggle */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[10px] select-none">
          <span className="font-semibold uppercase tracking-wider text-[#787168]">
            Módulos
          </span>
          <button
            type="button"
            onClick={() => {
              const allCollapsed = NAV_GROUPS.every((g) => collapsedGroups[g.groupTitle]);
              if (allCollapsed) {
                expandAllGroups();
              } else {
                collapseAllGroups();
              }
            }}
            className="text-[#AFA79C] hover:text-[#FAF8F5] transition-colors cursor-pointer text-[10px] font-medium"
            title={
              NAV_GROUPS.every((g) => collapsedGroups[g.groupTitle])
                ? 'Expandir todas las secciones'
                : 'Colapsar todas las secciones'
            }
          >
            {NAV_GROUPS.every((g) => collapsedGroups[g.groupTitle])
              ? 'Expandir todo'
              : 'Colapsar todo'}
          </button>
        </div>

        {/* Sidebar Navigation Links (Collapsible Accordion Groups) */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {NAV_GROUPS.map((group, gIdx) => {
            const isCollapsed = !!collapsedGroups[group.groupTitle];
            const hasActiveItem = group.items.some((it) => it.key === currentSubTab);
            const activeItemInGroup = group.items.find((it) => it.key === currentSubTab);

            return (
              <div
                key={gIdx}
                className={`rounded-xl transition-all duration-200 ${
                  isCollapsed
                    ? 'bg-[#221E1A]/40 border border-[#2C2723]/60 p-1'
                    : 'space-y-0.5'
                }`}
              >
                {/* Collapsible Section Header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.groupTitle)}
                  className="w-full px-2 py-1.5 rounded-lg flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#8C8479] hover:text-[#FAF8F5] hover:bg-[#26221E]/70 transition-colors cursor-pointer select-none group"
                  aria-expanded={!isCollapsed}
                  title={isCollapsed ? `Expandir sección ${group.groupTitle}` : `Colapsar sección ${group.groupTitle}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 shrink-0 ${
                        isCollapsed
                          ? '-rotate-90 text-[#B5654A]'
                          : 'rotate-0 text-[#787168] group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{group.groupTitle}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Active item indicator when section is collapsed */}
                    {isCollapsed && hasActiveItem && (
                      <span className="px-1.5 py-0.5 rounded-md bg-[#B5654A] text-white text-[8px] font-bold tracking-tight">
                        {activeItemInGroup?.label.split(' ')[0]}
                      </span>
                    )}

                    {/* Total item count in section */}
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[8px] font-mono ${
                        isCollapsed
                          ? 'bg-[#2A2520] text-[#AFA79C] border border-[#3C3630]'
                          : 'text-[#6B655C]'
                      }`}
                    >
                      {group.items.length}
                    </span>
                  </div>
                </button>

                {/* Sub-items (shown when expanded) */}
                {!isCollapsed && (
                  <div className="space-y-0.5 pt-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentSubTab === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            onSelectSubTab(item.key);
                            onCloseMobileSidebar();
                          }}
                          className={`w-full group px-2.5 py-2 rounded-xl text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                            isActive
                              ? 'bg-[#B5654A] text-white shadow-xs font-semibold'
                              : 'text-[#C7C0B5] hover:bg-[#26221E] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive
                                  ? 'text-white'
                                  : 'text-[#8C8479] group-hover:text-white'
                              }`}
                            />
                            <span className="text-xs truncate tracking-wide">
                              {item.label}
                            </span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.badgeColor || 'bg-[#26221E] text-[#AFA79C]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Quick Actions & Exit */}
        <div className="p-3 border-t border-[#2C2723] bg-[#141210]/60 space-y-1.5">
          <button
            type="button"
            onClick={onExitToPublic}
            className="w-full px-3 py-2 rounded-xl bg-[#26221E] hover:bg-[#322C27] text-[#FAF8F5] text-xs font-medium transition-colors border border-[#3C3630] flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#B5654A] group-hover:text-white transition-colors" />
              <span>Ver Web Alumnos</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#8C8479]" />
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-200 text-xs font-medium transition-colors border border-red-900/30 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Cerrar Sesión</span>
            </div>
            <span className="text-[9px] text-red-400 uppercase font-mono tracking-wider">Salir</span>
          </button>
        </div>
      </aside>
    </>
  );
};
