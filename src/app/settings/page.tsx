'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  User, CreditCard, Key, Star, BookOpen, Bell,
  HelpCircle, Trash2, ChevronRight, Copy, RefreshCw,
  Check, AlertTriangle, ExternalLink, Shield, Zap,
  Target, TrendingUp, Award, MessageCircle,
} from 'lucide-react';

const SECTIONS = [
  { id: 'profile',       icon: User,         label: 'Perfil',             color: 'text-blue-500',   bg: 'bg-blue-50'   },
  { id: 'billing',       icon: CreditCard,   label: 'Plan y facturación', color: 'text-green-600',  bg: 'bg-green-50'  },
  { id: 'api',           icon: Key,          label: 'API Access',         color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'favorites',     icon: Star,         label: 'Leads favoritos',    color: 'text-amber-500',  bg: 'bg-amber-50'  },
  { id: 'guide',         icon: BookOpen,     label: 'Guía de LeadFlow',   color: 'text-primary',    bg: 'bg-green-50'  },
  { id: 'notifications', icon: Bell,         label: 'Notificaciones',     color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'help',          icon: HelpCircle,   label: 'Comunidad y ayuda',  color: 'text-cyan-500',   bg: 'bg-cyan-50'   },
  { id: 'danger',        icon: Trash2,       label: 'Zona de peligro',    color: 'text-red-500',    bg: 'bg-red-50'    },
];

const PLAN_LABELS: Record<string, string> = {
  free: 'Plan Free', starter: 'Plan Starter', pro: 'Plan Pro', enterprise: 'Enterprise',
};

const GUIDE_STEPS = [
  { icon: Target,    title: 'Extrae leads en segundos',         desc: 'Ve a Buscar Leads, elige una industria y ciudad, y LeadFlow extrae negocios reales de Google Maps con teléfono, WhatsApp y sitio web.' },
  { icon: Star,      title: 'Marca tus leads más potenciales',  desc: 'En Mis Leads puedes marcar como favorito cualquier lead. Así organizas los contactos más prometedores para trabajar los primero.' },
  { icon: TrendingUp,title: 'Analiza tu rendimiento',           desc: 'El Dashboard muestra métricas reales: total de leads, cobertura de email y WhatsApp, tasa de extracción y evolución mensual.' },
  { icon: Award,     title: 'Exporta y actúa',                  desc: 'Descarga tus leads en CSV o genera un Reporte PDF profesional para presentar a clientes.' },
  { icon: Zap,       title: 'Optimiza tu cuota',                desc: 'Extrae por industrias específicas y ciudades concretas para maximizar la calidad sobre la cantidad.' },
];

export default function SettingsPage() {
  const [active, setActive] = useState('profile');
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiCopied, setApiCopied] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const { user, getUserProfile } = useAuth();

  useEffect(() => {
    getUserProfile().then((p: any) => {
      setProfile(p);
      setFullName(p?.full_name ?? '');
      if (p?.api_key) setApiKey(p.api_key);
    });
  }, []);

  useEffect(() => {
    if (active === 'favorites') {
      setLoadingFavs(true);
      fetch('/api/leads?favorites=true')
        .then((r) => r.json())
        .then((data) => setFavorites(data.leads ?? []))
        .finally(() => setLoadingFavs(false));
    }
  }, [active]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      });
      toast.success('Perfil guardado');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const r = await fetch('/api/profile/api-key', { method: 'POST' });
      const data = await r.json();
      setApiKey(data.api_key);
      toast.success('API Key generada');
    } catch {
      toast.error('Error al generar');
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiCopied(true);
    setTimeout(() => setApiCopied(false), 2000);
  };

  const handleUnfavorite = async (id: string) => {
    try {
      await fetch('/api/leads/' + id + '/favorite', { method: 'DELETE' });
      setFavorites((prev) => prev.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      toast.success('Eliminado de favoritos');
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const plan = profile?.plan ?? 'free';
  const quotaUsed = profile?.quota_used ?? 0;
  const quotaTotal = profile?.quota_total ?? 100;
  const isPro = plan === 'pro' || plan === 'enterprise';

  const renderContent = () => {
    switch (active) {

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Tu perfil</h2>
              <p className="text-[13px] text-muted-foreground">Administra tu informacion personal</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-[13px] text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Email</label>
                <input
                  type="text"
                  value={user?.email ?? ''}
                  disabled
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted text-[13px] text-muted-foreground outline-none"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Plan actual</label>
                <div className="h-10 px-3 rounded-xl border border-border bg-muted flex items-center">
                  <span className="text-[13px] text-foreground font-medium">{PLAN_LABELS[plan]}</span>
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Plan y facturacion</h2>
              <p className="text-[13px] text-muted-foreground">Tu suscripcion y uso de cuota</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-foreground">{PLAN_LABELS[plan]}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {isPro ? 'Activo' : 'Gratuito'}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[12px] text-muted-foreground mb-1">
                  <span>Leads usados</span>
                  <span>{quotaUsed} / {quotaTotal}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (quotaUsed / quotaTotal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            {!isPro && (
              <a
                href="/pricing"
                className="flex items-center justify-between p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Actualizar plan</p>
                  <p className="text-[12px] text-muted-foreground">Obtener mas leads y funciones premium</p>
                </div>
                <ChevronRight size={16} className="text-primary" />
              </a>
            )}
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">API Access</h2>
              <p className="text-[13px] text-muted-foreground">Tu clave para acceder a la API de LeadFlow</p>
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-semibold text-foreground block">Tu API Key</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted flex items-center overflow-hidden">
                  <span className="text-[12px] text-muted-foreground font-mono truncate">
                    {apiKey || 'No generada aun'}
                  </span>
                </div>
                {apiKey && (
                  <button
                    onClick={handleCopyApiKey}
                    className="flex items-center gap-2 h-9 px-4 border border-border rounded-lg text-[13px] hover:bg-muted transition-colors"
                  >
                    {apiCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              <button
                onClick={handleGenerateApiKey}
                className="flex items-center gap-2 h-9 px-4 border border-border rounded-lg text-[13px] hover:bg-muted transition-colors"
              >
                <RefreshCw size={14} />
                {apiKey ? 'Regenerar API Key' : 'Generar API Key'}
              </button>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Leads favoritos</h2>
              <p className="text-[13px] text-muted-foreground">Tus leads marcados como prioritarios</p>
            </div>
            {selectedLead && (
              <div
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedLead(null)}
              >
                <div
                  className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <h3 className="text-[15px] font-bold text-foreground">Lead favorito</h3>
                    </div>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground font-bold text-lg"
                    >x</button>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <p className="text-[18px] font-bold text-foreground">{selectedLead.name}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary mt-1">
                        {selectedLead.industry ?? 'Sin industria'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {selectedLead.phone && (
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">Telefono</p>
                          <p className="text-[13px] text-foreground font-medium">{selectedLead.phone}</p>
                        </div>
                      )}
                      {selectedLead.city && (
                        <div>
                          <p className="text-[11px] text-muted-foreground mb-0.5">Ciudad</p>
                          <p className="text-[13px] text-foreground font-medium">{selectedLead.city}</p>
                        </div>
                      )}
                      {selectedLead.email && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground mb-0.5">Email</p>
                          <p className="text-[13px] text-foreground font-medium truncate">{selectedLead.email}</p>
                        </div>
                      )}
                      {selectedLead.website && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground mb-0.5">Sitio web</p>
                          <a
                            href={selectedLead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] text-primary truncate flex items-center gap-1"
                          >
                            Ver sitio <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                    {selectedLead.address && (
                      <div className="pt-1">
                        <p className="text-[11px] text-muted-foreground mb-0.5">Direccion</p>
                        <p className="text-[13px] text-foreground">{selectedLead.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {loadingFavs ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Star size={32} className="text-muted-foreground mb-3" />
                <p className="text-[14px] font-semibold text-foreground">Sin favoritos aun</p>
                <p className="text-[12px] text-muted-foreground mt-1">Marca leads con estrella en el Dashboard</p>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Star size={14} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{lead.name}</p>
                      <p className="text-[11px] text-muted-foreground">{lead.industry} - {lead.city}</p>
                    </div>
                    <p className="text-[12px] text-muted-foreground font-mono shrink-0">{lead.phone ?? '-'}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnfavorite(lead.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'guide':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Guia de LeadFlow</h2>
              <p className="text-[13px] text-muted-foreground">Aprende a sacar el maximo provecho</p>
            </div>
            <div className="space-y-3">
              {GUIDE_STEPS.map((step, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-2xl border border-border bg-muted/20">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground mb-0.5">{step.title}</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Notificaciones</h2>
              <p className="text-[13px] text-muted-foreground">Controla que notificaciones recibes</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Extraccion completada',  desc: 'Cuando termina un trabajo de busqueda' },
                { label: 'Cuota casi agotada',     desc: 'Cuando usas el 80% de tu cuota mensual' },
                { label: 'Novedades de LeadFlow',  desc: 'Nuevas funciones y mejoras' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                    <p className="text-[12px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-primary/20 flex items-center px-1 cursor-pointer">
                    <div className="w-4 h-4 rounded-full bg-primary ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Comunidad y ayuda</h2>
              <p className="text-[13px] text-muted-foreground">Recursos y soporte</p>
            </div>
            <div className="space-y-3">
              {[
                { icon: MessageCircle, label: 'Comunidad WhatsApp', desc: 'Unete a nuestra comunidad', href: 'https://chat.whatsapp.com/Lrw99M0Qh6h3cje9zxh28N', bg: 'bg-green-50', color: 'text-green-600' },
                { icon: BookOpen,      label: 'Documentacion',      desc: 'Guias y tutoriales',   href: '/guide',                                          bg: 'bg-blue-50',  color: 'text-blue-500'  },
                { icon: Shield,        label: 'Privacidad',         desc: 'Politica de privacidad',    href: '/privacy',                                        bg: 'bg-gray-50',  color: 'text-gray-500'  },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                    <p className="text-[12px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Zona de peligro</h2>
              <p className="text-[13px] text-muted-foreground">Acciones irreversibles sobre tu cuenta</p>
            </div>
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/50 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-bold text-red-700">Eliminar cuenta</p>
                  <p className="text-[12px] text-red-600 mt-0.5">
                    Esta accion eliminara todos tus datos permanentemente. No se puede deshacer.
                  </p>
                </div>
              </div>
              <button
                onClick={() => toast.error('Contacta a soporte para eliminar tu cuenta')}
                className="w-full h-10 rounded-xl border border-red-300 text-red-600 text-[13px] font-semibold hover:bg-red-100 transition-colors"
              >
                Solicitar eliminacion de cuenta
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="w-52 border-r border-border py-3 shrink-0 overflow-y-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                active === s.id ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={14} className={s.color} />
              </div>
              <span className={`text-[13px] font-medium truncate ${active === s.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}
