'use client';

import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const PLAN_LABELS: Record<string, string> = {
  free: 'Plan Free',
  pro: 'Plan Pro',
  enterprise: 'Plan Enterprise',
};

export default function PlanQuotaBar() {
  const { getUserProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-card px-5 py-4 flex items-center justify-center h-[88px]">
        <Loader2 size={16} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) return null;

  const { quota_used, quota_total, plan } = profile;
  const pct = Math.round((quota_used / quota_total) * 100);
  const remaining = quota_total - quota_used;

  // Calcular ciclo del mes actual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-border shadow-card px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-600 text-foreground">{PLAN_LABELS[plan] ?? 'Plan Free'}</p>
            <p className="text-[11px] text-muted-foreground">Ciclo: {firstDay} – {lastDay}</p>
          </div>
        </div>
        {plan !== 'enterprise' && (
          <Link
            href="/pricing"
            className="text-[12px] font-600 text-primary hover:text-green-700 transition-colors flex items-center gap-1"
          >
            <TrendingUp size={12} />
            Mejorar plan
          </Link>
        )}
      </div>
      <div className="flex items-center justify-between text-[12px] mb-1.5">
        <span className="text-muted-foreground">Leads usados</span>
        <span className="font-600 tabular-nums text-foreground">
          {quota_used?.toLocaleString()} / {quota_total?.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${pct > 80 ? 'bg-amber-500' : 'bg-primary'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className={pct > 80 ? 'text-amber-600 font-500' : 'text-muted-foreground'}>{pct}% utilizado</span>
        <span className="text-muted-foreground font-mono tabular-nums">{remaining?.toLocaleString()} disponibles</span>
      </div>
    </div>
  );
}
