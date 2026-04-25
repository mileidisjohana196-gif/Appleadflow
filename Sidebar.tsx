'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Search, Download, Settings,
  ChevronLeft, ChevronRight, Zap, Users, CreditCard,
  HelpCircle, LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { key: 'nav-dashboard', href: '/leads-dashboard',        icon: LayoutDashboard, label: 'Dashboard',      badge: null },
      { key: 'nav-search',    href: '/lead-search-extraction', icon: Search,           label: 'Buscar Leads',   badge: null },
      { key: 'nav-exports',   href: '/leads-dashboard',        icon: Download,         label: 'Exportaciones',  badge: null },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { key: 'nav-team',     href: '/leads-dashboard', icon: Users,       label: 'Equipo',          badge: null },
      { key: 'nav-billing',  href: '/pricing',         icon: CreditCard,  label: 'Facturación',     badge: null },
      { key: 'nav-settings', href: '/leads-dashboard', icon: Settings,    label: 'Configuración',   badge: null },
    ],
  },
];

const PLAN_LABELS: Record<string, string> = {
  free: 'Plan Free',
  pro: 'Plan Pro',
  enterprise: 'Enterprise',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, getUserProfile } = useAuth();

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(console.error);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-up-login');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  // Iniciales del usuario para el avatar
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() ?? 'U';
  };

  const displayName = profile?.full_name ?? user?.email ?? 'Usuario';
  const displayEmail = user?.email ?? '';
  const plan = profile?.plan ?? 'free';
  const quotaUsed = profile?.quota_used ?? 0;
  const quotaTotal = profile?.quota_total ?? 100;

  return (
    <aside
      className={`
        relative flex flex-col bg-white border-r border-border h-screen
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-3 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-semibold text-[15px] text-foreground tracking-tight">LeadFlow</span>
        )}
      </div>

      {/* Plan badge */}
      {!collapsed && (
        <Link
          href="/pricing"
          className="mx-3 mt-3 mb-1 px-3 py-2 rounded-lg bg-primary/8 border border-primary/20 flex items-center gap-2 hover:bg-primary/12 transition-colors"
        >
          <Zap size={13} className="text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-600 text-primary leading-none">
              {PLAN_LABELS[plan] ?? 'Plan Free'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">
              {quotaUsed.toLocaleString()} / {quotaTotal.toLocaleString()} leads
            </p>
          </div>
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {NAV_SECTIONS.map((section) => (
          <div key={`section-${section.label}`} className="mb-1">
            {!collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-600 uppercase tracking-widest text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/leads-dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-[13.5px] font-500
                    transition-all duration-150
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon size={16} className="shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2 space-y-0.5">
        <Link
          href="/leads-dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-500 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          <HelpCircle size={16} className="shrink-0" />
          {!collapsed && <span>Ayuda</span>}
        </Link>

        {/* User + sign out */}
        <div
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted cursor-pointer transition-all duration-150 group ${collapsed ? 'justify-center' : ''}`}
          onClick={handleSignOut}
          title="Cerrar sesión"
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-700 text-primary">{getInitials()}</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-600 text-foreground truncate leading-none">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{displayEmail}</p>
              </div>
              <LogOut size={14} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-card hover:shadow-card-hover transition-all duration-150 z-10"
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
