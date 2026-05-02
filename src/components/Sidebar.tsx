'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Search, Database, Download,
  DollarSign, Settings, LogOut, ChevronLeft,
  ChevronRight, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { key: 'search',   href: '/lead-search-extraction', icon: Search,          label: 'Buscar Leads',  section: 'PRINCIPAL' },
  { key: 'leads',    href: '/leads-dashboard',         icon: Database,        label: 'Mis Leads',     section: 'PRINCIPAL' },
  { key: 'exports',  href: '/leads-dashboard',         icon: Download,        label: 'Exportaciones', section: 'PRINCIPAL' },
  { key: 'dash',     href: '/leads-dashboard',         icon: LayoutDashboard, label: 'Dashboard',     section: 'ANÁLISIS'  },
  { key: 'pricing',  href: '/pricing',                 icon: DollarSign,      label: 'Planes',        section: 'CUENTA'    },
  { key: 'settings', href: '/settings',                icon: Settings,        label: 'Configuración', section: 'CUENTA'    },
];

const PLAN_LABELS: Record<string, string> = {
  free:       'Plan Free',
  starter:    'Plan Starter',
  pro:        'Plan Pro',
  enterprise: 'Enterprise',
};

const PLAN_COLORS: Record<string, string> = {
  free:       'text-muted-foreground',
  starter:    'text-blue-500',
  pro:        'text-primary',
  enterprise: 'text-purple-500',
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, getUserProfile } = useAuth();

  useEffect(() => {
    getUserProfile().then(setProfile).catch(console.error);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-up-login');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() ?? 'U';
  };

  const plan = profile?.plan ?? 'free';
  const quotaUsed = profile?.quota_used ?? 0;
  const quotaTotal = profile?.quota_total ?? 100;
  const quotaPct = Math.min(Math.round((quotaUsed / quotaTotal) * 100), 100);

  // Group nav by section
  const sections = ['PRINCIPAL', 'ANÁLISIS', 'CUENTA'];

  return (
    <aside className={`relative flex flex-col bg-white border-r border-border h-screen transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>

      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <TrendingUp size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-[16px] text-foreground tracking-tight">
            Lead<span className="text-primary">Flow</span>
          </span>
        )}
      </div>

      {/* Plan badge */}
      {!collapsed && (
        <Link href="/pricing" className="mx-3 mt-3 mb-1 px-3 py-2.5 rounded-xl bg-primary/6 border border-primary/15 hover:bg-primary/10 transition-colors block">
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-700 ${PLAN_COLORS[plan]}`}>
              {PLAN_LABELS[plan]}
            </span>
            <span className="text-[10px] text-muted-foreground">{quotaPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${quotaPct >= 90 ? 'bg-red-400' : quotaPct >= 70 ? 'bg-amber-400' : 'bg-primary'}`}
              style={{ width: `${quotaPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {quotaUsed.toLocaleString()} / {quotaTotal.toLocaleString()} leads
          </p>
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {sections.map((section) => {
          const items = NAV_ITEMS.filter(i => i.section === section);
          if (items.length === 0) return null;
          return (
            <div key={section} className="mb-1">
              {!collapsed && (
                <p className="px-4 py-1.5 text-[10px] font-700 uppercase tracking-widest text-muted-foreground/60">
                  {section}
                </p>
              )}
              {items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/leads-dashboard' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-[13px] font-500 transition-all duration-150 mb-0.5
                      ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <item.icon size={17} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User + signout */}
      <div className="border-t border-border p-2">
        <div
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted cursor-pointer transition-colors group ${collapsed ? 'justify-center' : ''}`}
          onClick={handleSignOut}
          title="Cerrar sesión"
        >
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-[11px] font-700 text-primary">{getInitials()}</span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-600 text-foreground truncate leading-none">{profile?.full_name ?? user?.email}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
              </div>
              <LogOut size={13} className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-10"
      >
        {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </button>
    </aside>
  );
}
