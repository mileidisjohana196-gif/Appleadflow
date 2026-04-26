cat > src/app/leads-dashboard/components/KPIGrid.tsx << 'ENDOFFILE''use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Mail, MessageCircle, Download, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  highlight?: 'green' | 'red' | 'amber' | 'blue' | 'neutral';
  colSpan?: string;
}

function KPICard({ label, value, sub, trend, trendValue, icon, highlight = 'neutral', colSpan = '' }: KPICardProps) {
  const highlightBg: Record<string, string> = {
    green: 'bg-green-50 border-green-200', red: 'bg-red-50 border-red-200',
    amber: 'bg-amber-50 border-amber-200', blue: 'bg-blue-50 border-blue-200',
    neutral: 'bg-white border-border',
  };
  const highlightIcon: Record<string, string> = {
    green: 'bg-green-100 text-green-600', red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600', blue: 'bg-blue-100 text-blue-600',
    neutral: 'bg-muted text-muted-foreground',
  };
  const highlightValue: Record<string, string> = {
    green: 'text-green-700', red: 'text-red-700',
    amber: 'text-amber-700', blue: 'text-blue-700',
    neutral: 'text-foreground',
  };
  return (
    <div className={`rounded-xl border shadow-card p-5 ${highlightBg[highlight]} ${colSpan}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-500 text-muted-foreground uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlightIcon[highlight]}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-700 tabular-nums leading-none mb-1 ${highlightValue[highlight]}`}>{value}</p>
      <div className="flex items-center gap-1.5">
        {trend === 'up'   && <TrendingUp   size={12} className="text-green-500" />}
        {trend === 'down' && <TrendingDown  size={12} className="text-red-500"   />}
        {trendValue && (
          <span className={`text-[11px] font-500 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
            {trendValue}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

const PLAN_LABELS: Record<string, string> = { free: 'Plan Free', pro: 'Plan Pro', enterprise: 'Enterprise' };

export default function KPIGrid() {
  const { getUserProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [prof, leadsRes] = await Promise.all([
          getUserProfile(),
          fetch('/api/leads?limit=1'),
        ]);
        setProfile(prof);
        if (leadsRes.ok) {
          const data = await leadsRes.json();
          setStats({ total: data.pagination?.total ?? 0 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quotaUsed  = profile?.quota_used  ?? 0;
  const quotaTotal = profile?.quota_total ?? 100;
  const quotaPct   = Math.round((quotaUsed / quotaTotal) * 100);
  const totalLeads = stats?.total ?? 0;
  const plan       = profile?.plan ?? 'free';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {/* Hero card */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white rounded-xl border border-border shadow-card p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-500 text-muted-foreground uppercase tracking-wide">Total de Leads</p>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-primary" />
          </div>
        </div>
        <p className="text-5xl font-700 tabular-nums text-foreground leading-none mb-2">
          {totalLeads.toLocaleString()}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] text-muted-foreground">leads en tu base de datos</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Cuota usada</p>
            <p className="text-[16px] font-700 text-foreground tabular-nums">{quotaUsed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Disponibles</p>
            <p className="text-[16px] font-700 text-foreground tabular-nums">{(quotaTotal - quotaUsed).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <KPICard
        label="Cobertura Email"
        value="—"
        sub="enriquecimiento en progreso"
        icon={<Mail size={16} />}
        highlight="green"
      />
      <KPICard
        label="Cobertura WhatsApp"
        value="—"
        sub="enriquecimiento en progreso"
        icon={<MessageCircle size={16} />}
        highlight="blue"
      />

      {/* Quota card — datos reales */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-amber-50 border border-amber-200 rounded-xl shadow-card p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-500 text-amber-700 uppercase tracking-wide">Cuota Mensual</p>
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-[11px] font-600 text-amber-700">{PLAN_LABELS[plan]}</span>
          </div>
        </div>
        <div className="flex items-end gap-2 mb-3">
          <p className="text-3xl font-700 tabular-nums text-amber-800 leading-none">{quotaUsed.toLocaleString()}</p>
          <p className="text-[14px] text-amber-600 mb-0.5">/ {quotaTotal.toLocaleString()} leads</p>
        </div>
        <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
          <div
            className="bg-amber-500 h-2 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(quotaPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-amber-700">{quotaPct}% usado — {(quotaTotal - quotaUsed).toLocaleString()} disponibles</p>
          {plan !== 'enterprise' && (
            <Link href="/pricing" className="text-[11px] font-600 text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
              Mejorar plan →
            </Link>
          )}
        </div>
      </div>

      <KPICard label="Exportados este mes" value="0" sub="a CSV" icon={<Download size={16} />} highlight="neutral" />
      <KPICard label="Tasa de Extracción"  value="—"  sub="sin datos aún"  icon={<Zap     size={16} />} highlight="neutral" />
    </div>
  );
}


