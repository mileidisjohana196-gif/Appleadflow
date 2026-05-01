'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Building2, Rocket, Gift } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Gift,
    color: 'border-border',
    badge: null,
    description: 'Para explorar la plataforma',
    quota: '100 leads/mes',
    features: [
      '100 leads por mes',
      'Exportación en CSV',
      'Dashboard básico',
      'Soporte por email',
    ],
    cta: 'Empezar gratis',
    ctaStyle: 'border border-border text-foreground hover:bg-muted',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    icon: Zap,
    color: 'border-blue-200',
    badge: null,
    description: 'Para freelancers y vendedores',
    quota: '500 leads/mes',
    features: [
      '500 leads por mes',
      'Exportación CSV y Reporte PDF',
      'Filtros por industria y ciudad',
      'Trabajos ilimitados',
      'Soporte prioritario',
    ],
    cta: 'Suscribirse a Starter',
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    icon: Rocket,
    color: 'border-primary',
    badge: 'Más popular',
    description: 'Para agencias y equipos',
    quota: '2.000 leads/mes',
    features: [
      '2.000 leads por mes',
      'Exportación CSV y Reporte PDF',
      'Filtros avanzados',
      'Trabajos ilimitados',
      'Monitor de negocios nuevos',
      'Soporte prioritario',
    ],
    cta: 'Suscribirse a Pro',
    ctaStyle: 'bg-primary text-white hover:bg-green-700',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    icon: Building2,
    color: 'border-purple-200',
    badge: null,
    description: 'Para agencias grandes',
    quota: '10.000 leads/mes',
    features: [
      '10.000 leads por mes',
      'Exportación CSV y Reporte PDF',
      'Todos los filtros disponibles',
      'Trabajos ilimitados',
      'API access',
      'Soporte dedicado',
      'Facturación para clientes',
    ],
    cta: 'Suscribirse a Enterprise',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      router.push('/sign-up-login');
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      if (res.status === 401) {
        router.push('/sign-up-login');
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
          <AppLogo size={28} />
          <span className="font-bold text-[17px] text-foreground">LeadFlow</span>
        </div>
        <button
          onClick={() => router.push('/sign-up-login')}
          className="text-[13px] font-medium text-primary hover:underline"
        >
          Iniciar sesión →
        </button>
      </nav>

      {/* Header */}
      <div className="text-center px-6 py-16">
        <span className="inline-block bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1 rounded-full mb-4">
          Precios simples y transparentes
        </span>
        <h1 className="text-3xl sm:text-4xl font-800 text-foreground mb-4 leading-tight">
          Elige el plan ideal<br />para tu negocio
        </h1>
        <p className="text-[15px] text-muted-foreground max-w-md mx-auto">
          Cancela cuando quieras. Sin contratos. Sin sorpresas.
        </p>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isLoading = loading === plan.id;
          return (
            <div
              key={plan.id}
              className={`relative bg-card rounded-2xl border-2 ${plan.color} p-6 flex flex-col ${plan.badge ? 'shadow-lg scale-[1.02]' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-[11px] font-700 px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="text-[17px] font-700 text-foreground">{plan.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-800 text-foreground">${plan.price}</span>
                  {plan.price > 0 && <span className="text-[13px] text-muted-foreground mb-1">/mes</span>}
                </div>
                <p className="text-[12px] font-600 text-primary mt-1">{plan.quota}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[13px] text-foreground">
                    <Check size={14} className="text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading}
                className={`w-full py-2.5 rounded-xl text-[13px] font-600 transition-all duration-150 active:scale-[0.98] disabled:opacity-60 ${plan.ctaStyle}`}
              >
                {isLoading ? 'Redirigiendo...' : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust */}
      <div className="border-t border-border py-10 text-center">
        <p className="text-[13px] text-muted-foreground">
          🔒 Pagos seguros · 📄 Cancela cuando quieras · 🌎 Disponible en toda LATAM
        </p>
      </div>
    </div>
  );
}
