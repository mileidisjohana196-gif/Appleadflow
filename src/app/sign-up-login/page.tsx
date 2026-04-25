'use client';

import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import CredentialsBox from './components/CredentialsBox';
import { MapPin, Zap, Database, Download, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';


const FEATURES = [
  { icon: MapPin, text: 'Extrae leads de Google Maps en segundos' },
  { icon: Zap, text: 'Enriquecimiento automático con email y WhatsApp' },
  { icon: Database, text: 'Base de datos limpia y filtrable' },
  { icon: Download, text: 'Exporta a CSV o sincroniza con tu CRM' },
];

export default function SignUpLoginPage() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillPassword, setPrefillPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      toast.error('Error al conectar con Google. Intenta de nuevo.');
      setGoogleLoading(false);
    }
  };

  const handleAutofill = (email: string, password: string) => {
    setPrefillEmail(email);
    setPrefillPassword(password);
    setTab('login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] 2xl:w-[40%] bg-[#0f2318] flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-green-400 blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-14">
            <AppLogo size={36} />
            <span className="text-white font-700 text-xl tracking-tight">LeadFlow</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-700 text-white leading-tight mb-4">
            Encuentra clientes<br />
            <span className="text-green-400">antes que tu competencia</span>
          </h2>
          <p className="text-[15px] text-green-100/70 leading-relaxed mb-10">
            Extrae negocios locales de Google Maps, obtén sus datos de contacto y exporta leads listos para contactar — en minutos.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={`feature-${text.slice(0, 20)}`} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-green-400" />
                </div>
                <p className="text-[13px] text-green-100/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/8 rounded-xl p-5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-[13px] font-700 text-green-300">CA</span>
            </div>
            <div>
              <p className="text-[13px] font-600 text-white">Carlos Andrade</p>
              <p className="text-[11px] text-green-100/50">Director, Agencia Impulso Digital</p>
            </div>
          </div>
          <p className="text-[12px] text-green-100/70 leading-relaxed italic">
            "Con LeadFlow extraemos 500 leads calificados cada semana sin mover un dedo. Nuestro pipeline creció 3x en 2 meses."
          </p>
          <div className="flex items-center gap-1 mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={`star-${i}`} className="text-yellow-400 text-[13px]">★</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 lg:py-8 overflow-y-auto scrollbar-thin">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={32} />
            <span className="font-700 text-lg text-foreground">LeadFlow</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-xl p-1 mb-7">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2.5 text-[13px] font-600 rounded-lg transition-all duration-200 ${
                tab === 'login' ? 'bg-white text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2.5 text-[13px] font-600 rounded-lg transition-all duration-200 ${
                tab === 'signup' ? 'bg-white text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-700 text-foreground">
              {tab === 'login' ? 'Bienvenido de vuelta' : 'Empieza gratis hoy'}
            </h1>
            <p className="text-[13px] text-muted-foreground mt-1">
              {tab === 'login' ?'Inicia sesión para acceder a tu base de leads' :'Crea tu cuenta y extrae tus primeros 100 leads sin costo'}
            </p>
          </div>

          {/* Google auth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg text-[13px] font-500 text-foreground hover:bg-muted active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 mb-5 bg-white"
          >
            {googleLoading && <Loader2 size={16} className="animate-spin" />}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">o con correo</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Forms */}
          {tab === 'login' ? (
            <LoginForm prefillEmail={prefillEmail} prefillPassword={prefillPassword} />
          ) : (
            <SignupForm />
          )}

          {/* Credentials box — only on login tab */}
          {tab === 'login' && (
            <CredentialsBox onAutofill={handleAutofill} />
          )}

          {/* Switch tab link */}
          <p className="text-center text-[13px] text-muted-foreground mt-6">
            {tab === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button onClick={() => setTab('signup')} className="text-primary font-600 hover:text-green-700 transition-colors">
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button onClick={() => setTab('login')} className="text-primary font-600 hover:text-green-700 transition-colors">
                  Inicia sesión
                </button>
              </>
            )}
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-border">
            {['SSL Seguro', 'Sin tarjeta', 'Cancela cuando quieras'].map((badge) => (
              <div key={`trust-${badge}`} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-[11px] text-muted-foreground">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}