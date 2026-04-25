'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormData {
  name: string;
  company: string;
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'enterprise';
  terms: boolean;
}

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: '/mes',
    leads: '100 leads/mes',
    color: 'border-border',
    badge: '',
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$29',
    period: '/mes',
    leads: '2,000 leads/mes',
    color: 'border-primary',
    badge: 'Más popular',
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: '$99',
    period: '/mes',
    leads: '10,000 leads/mes',
    color: 'border-purple-400',
    badge: 'Máximo poder',
  },
];

export default function SignupForm() {
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: { plan: 'pro', terms: false },
  });

  const selectedPlan = watch('plan');
  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, {
        fullName: data.name,
        company: data.company,
        plan: data.plan,
      });
      setDone(true);
    } catch (error: any) {
      const msg = error?.message ?? '';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        toast.error('Este correo ya tiene una cuenta. Inicia sesión.');
      } else if (msg.includes('Password should be')) {
        toast.error('La contraseña debe tener al menos 6 caracteres.');
      } else {
        toast.error('Error al crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Pantalla de confirmación de email
  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check size={24} className="text-green-600" />
        </div>
        <h3 className="text-[17px] font-700 text-foreground mb-2">¡Revisa tu correo!</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Te enviamos un enlace de confirmación a tu correo. Haz clic en el enlace para activar tu cuenta y empezar a extraer leads.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Plan selector */}
      <div>
        <p className="text-[13px] font-500 text-foreground mb-2.5">Selecciona tu plan</p>
        <div className="grid grid-cols-3 gap-2.5">
          {PLANS.map((plan) => (
            <label
              key={`plan-${plan.id}`}
              className={`relative cursor-pointer rounded-xl border-2 p-3 transition-all duration-150 ${
                selectedPlan === plan.id ? plan.color + ' bg-primary/3' : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <input type="radio" value={plan.id} {...register('plan')} className="sr-only" />
              {plan.badge && (
                <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-700 px-2 py-0.5 rounded-full whitespace-nowrap ${
                  plan.id === 'pro' ? 'bg-primary text-white' : 'bg-purple-500 text-white'
                }`}>
                  {plan.badge}
                </span>
              )}
              <p className="text-[13px] font-700 text-foreground mb-0.5">{plan.name}</p>
              <p className="text-[18px] font-700 text-foreground tabular-nums leading-none">
                {plan.price}<span className="text-[11px] font-400 text-muted-foreground">{plan.period}</span>
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{plan.leads}</p>
              {selectedPlan === plan.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </div>
              )}
            </label>
          ))}
        </div>
        {selectedPlan !== 'free' && (
          <p className="text-[11px] text-muted-foreground mt-1.5">
            * Los planes Pro y Enterprise se activan con Mercado Pago tras crear la cuenta.
          </p>
        )}
      </div>

      {/* Name + Company */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-500 text-foreground mb-1.5" htmlFor="signup-name">Nombre completo</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-name"
              type="text"
              placeholder="Tu nombre"
              {...register('name', { required: 'Ingresa tu nombre' })}
              className={`w-full pl-9 pr-3 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 text-foreground ${errors.name ? 'border-red-400' : 'border-border'}`}
            />
          </div>
          {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[13px] font-500 text-foreground mb-1.5" htmlFor="signup-company">Empresa</label>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              id="signup-company"
              type="text"
              placeholder="Mi empresa"
              {...register('company', { required: 'Ingresa tu empresa' })}
              className={`w-full pl-9 pr-3 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 text-foreground ${errors.company ? 'border-red-400' : 'border-border'}`}
            />
          </div>
          {errors.company && <p className="mt-1 text-[11px] text-red-600">{errors.company.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-[13px] font-500 text-foreground mb-1.5" htmlFor="signup-email">Correo electrónico</label>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="signup-email"
            type="email"
            placeholder="tu@empresa.com"
            {...register('email', {
              required: 'Ingresa tu correo',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
            })}
            className={`w-full pl-9 pr-4 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 text-foreground ${errors.email ? 'border-red-400' : 'border-border'}`}
          />
        </div>
        {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-[13px] font-500 text-foreground mb-1.5" htmlFor="signup-password">Contraseña</label>
        <p className="text-[11px] text-muted-foreground mb-1.5">Mínimo 8 caracteres con una mayúscula y un número</p>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="signup-password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password', {
              required: 'Crea una contraseña',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              pattern: { value: /^(?=.*[A-Z])(?=.*\d)/, message: 'Debe incluir una mayúscula y un número' },
            })}
            className={`w-full pl-9 pr-10 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 text-foreground ${errors.password ? 'border-red-400' : 'border-border'}`}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Mostrar contraseña">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password.message}</p>}
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            {...register('terms', { required: 'Debes aceptar los términos' })}
            className="w-4 h-4 mt-0.5 rounded border-border accent-primary shrink-0"
          />
          <span className="text-[12px] text-muted-foreground leading-relaxed">
            Acepto los{' '}
            <button type="button" className="text-primary hover:underline font-500">Términos de Servicio</button>
            {' '}y la{' '}
            <button type="button" className="text-primary hover:underline font-500">Política de Privacidad</button>
            {' '}de LeadFlow
          </span>
        </label>
        {errors.terms && <p className="mt-1 text-[11px] text-red-600">{errors.terms.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white text-[14px] font-600 rounded-lg hover:bg-green-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" />Creando cuenta...</>
        ) : (
          'Crear cuenta gratis'
        )}
      </button>
    </form>
  );
}
