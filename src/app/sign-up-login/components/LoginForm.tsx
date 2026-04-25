'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginFormProps {
  prefillEmail?: string;
  prefillPassword?: string;
}

export default function LoginForm({ prefillEmail = '', prefillPassword = '' }: LoginFormProps) {
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: prefillEmail, password: prefillPassword, remember: false },
  });

  React.useEffect(() => {
    if (prefillEmail) setValue('email', prefillEmail);
    if (prefillPassword) setValue('password', prefillPassword);
  }, [prefillEmail, prefillPassword, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Bienvenido de vuelta');
      router.push('/leads-dashboard');
    } catch (error: any) {
      const msg = error?.message ?? '';
      if (msg.includes('Invalid login credentials')) {
        toast.error('Correo o contraseña incorrectos');
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Confirma tu correo antes de iniciar sesión');
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-[13px] font-500 text-foreground mb-1.5" htmlFor="login-email">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="login-email"
            type="email"
            placeholder="tu@empresa.com"
            {...register('email', {
              required: 'Ingresa tu correo electrónico',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo electrónico inválido' },
            })}
            className={`w-full pl-9 pr-4 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 text-foreground ${errors.email ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
          />
        </div>
        {errors.email && <p className="mt-1.5 text-[11px] text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[13px] font-500 text-foreground" htmlFor="login-password">
            Contraseña
          </label>
          <button type="button" className="text-[12px] text-primary hover:text-green-700 transition-colors">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="login-password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('password', { required: 'Ingresa tu contraseña' })}
            className={`w-full pl-9 pr-10 py-2.5 text-[13px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 text-foreground ${errors.password ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 text-[11px] text-red-600">{errors.password.message}</p>}
      </div>

      {/* Remember */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" {...register('remember')} className="w-4 h-4 rounded border-border accent-primary" />
        <span className="text-[13px] text-muted-foreground">Mantener sesión iniciada</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white text-[14px] font-600 rounded-lg hover:bg-green-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" />Iniciando sesión...</>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );
}
