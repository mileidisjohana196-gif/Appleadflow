'use client';
import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import {
  User, CreditCard, Key, Star, BookOpen, Bell, HelpCircle,
  Trash2, ChevronRight, Copy, RefreshCw, Check, AlertTriangle,
  ExternalLink, Shield, Zap, Target, TrendingUp, Award,
  MessageCircle, Camera, Lock, Briefcase, Phone,
  Globe, AtSign, ArrowRight,
} from 'lucide-react';

const SECTIONS = [
  { id: 'profile',       icon: User,       label: 'Perfil',             color: 'text-blue-500',   bg: 'bg-blue-50'   },
  { id: 'billing',       icon: CreditCard, label: 'Plan y facturacion', color: 'text-green-600',  bg: 'bg-green-50'  },
  { id: 'api',           icon: Key,        label: 'API Access',         color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'favorites',     icon: Star,       label: 'Leads favoritos',    color: 'text-amber-500',  bg: 'bg-amber-50'  },
  { id: 'guide',         icon: BookOpen,   label: 'Guia de LeadFlow',   color: 'text-primary',    bg: 'bg-green-50'  },
  { id: 'notifications', icon: Bell,       label: 'Notificaciones',     color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'help',          icon: HelpCircle, label: 'Comunidad y ayuda',  color: 'text-cyan-500',   bg: 'bg-cyan-50'   },
  { id: 'danger',        icon: Trash2,     label: 'Zona de peligro',    color: 'text-red-500',    bg: 'bg-red-50'    },
];

const PLAN_LABELS: Record<string, string> = {
  free: 'Plan Free', starter: 'Plan Starter', pro: 'Plan Pro', enterprise: 'Enterprise',
};

const GUIDE_STEPS = [
  { icon: Target,     title: 'Extrae leads en segundos',       desc: 'Ve a Buscar Leads, elige una industria y ciudad. LeadFlow extrae negocios reales de Google Maps con telefono, WhatsApp y sitio web en segundos.',  color: 'from-blue-500 to-blue-600'    },
  { icon: Star,       title: 'Marca tus leads potenciales',    desc: 'En el Dashboard, toca la estrella de cualquier lead para guardarlo en Favoritos. Asi organizas los contactos mas prometedores para trabajar primero.', color: 'from-amber-500 to-amber-600'  },
  { icon: TrendingUp, title: 'Analiza tu rendimiento',         desc: 'El Dashboard muestra metricas reales: leads totales, cobertura de email y WhatsApp, tasa de extraccion y evolucion mensual.',                         color: 'from-green-500 to-green-600'  },
  { icon: Award,      title: 'Exporta y actua',                desc: 'Descarga tus leads en CSV para importar a cualquier CRM, o genera un Reporte PDF profesional para presentar a clientes.',                              color: 'from-purple-500 to-purple-600' },
  { icon: Zap,        title: 'Optimiza tu cuota',              desc: 'Filtra por industrias especificas y ciudades concretas. La calidad siempre supera a la cantidad — leads enfocados convierten mejor.',                  color: 'from-rose-500 to-rose-600'    },
];


const SOCIAL_LINKS_CONFIG = [
  { key: 'instagram', icon: Camera, placeholder: 'instagram.com/tu_usuario', color: 'text-pink-500'  },
  { key: 'twitter',   icon: AtSign,    placeholder: 'x.com/tu_usuario',         color: 'text-sky-500'   },
  { key: 'whatsapp',  icon: Phone,     placeholder: '+57 300 000 0000',          color: 'text-green-500' },
  { key: 'website',   icon: Globe,     placeholder: 'tu-sitio-web.com',          color: 'text-primary'   },
];

export default function SettingsPage() {
  const [active, setActive]             = useState('profile');
  const [profile, setProfile]           = useState<any>(null);
  const [fullName, setFullName]         = useState('');
  const [description, setDescription]   = useState('');
  const [socialLinks, setSocialLinks]   = useState({ instagram: '', twitter: '', whatsapp: '', website: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile]     = useState<File | null>(null);
  const [saving, setSaving]             = useState(false);
  const [apiKey, setApiKey]             = useState('');
  const [apiName, setApiName]           = useState('');
  const [apiDesc, setApiDesc]           = useState('');
  const [apiMeta, setApiMeta]           = useState<any>(null);
  const [apiCopied, setApiCopied]       = useState(false);
  const [creatingKey, setCreatingKey]   = useState(false);
  const [favorites, setFavorites]       = useState<any[]>([]);
  const [loadingFavs, setLoadingFavs]   = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const { user, getUserProfile } = useAuth();

  useEffect(() => {
    getUserProfile().then((p: any) => {
      setProfile(p);
      setFullName(p?.full_name ?? '');
      setDescription(p?.description ?? '');
      setSocialLinks(p?.social_links ?? { instagram: '', twitter: '', whatsapp: '', website: '' });
      if (p?.avatar_url) setAvatarPreview(p.avatar_url);
      if (p?.api_key) {
        setApiKey(p.api_key);
        setApiMeta({ name: p.api_key_name, desc: p.api_key_description, created: p.api_key_created_at });
      }
    });
  }, []);

  useEffect(() => {
    if (active === 'favorites') {
      setLoadingFavs(true);
      fetch('/api/leads?favorite=true&limit=100')
        .then((r) => r.json())
        .then((data) => setFavorites(data.leads ?? []))
        .finally(() => setLoadingFavs(false));
    }
  }, [active]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      let avatarUrl = profile?.avatar_url ?? '';
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user!.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        avatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          description,
          social_links: socialLinks,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);
      if (error) throw error;
      setProfile((p: any) => ({ ...p, full_name: fullName, description, social_links: socialLinks, avatar_url: avatarUrl }));
      toast.success('Perfil guardado correctamente');
    } catch (err: any) {
      toast.error('Error: ' + (err.message ?? 'intenta de nuevo'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!apiName.trim()) { toast.error('El nombre es obligatorio'); return; }
    setCreatingKey(true);
    try {
      const supabase = createClient();
      const bytes = crypto.getRandomValues(new Uint8Array(24));
      const key = 'lf_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('user_profiles')
        .update({ api_key: key, api_key_name: apiName.trim(), api_key_description: apiDesc.trim(), api_key_created_at: now })
        .eq('id', user!.id);
      if (error) throw error;
      setApiKey(key);
      setApiMeta({ name: apiName.trim(), desc: apiDesc.trim(), created: now });
      toast.success('API Key creada exitosamente');
    } catch (err: any) {
      toast.error('Error: ' + (err.message ?? ''));
    } finally {
      setCreatingKey(false);
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

  const plan        = profile?.plan ?? 'free';
  const quotaUsed   = profile?.quota_used ?? 0;
  const quotaTotal  = profile?.quota_total ?? 100;
  const isPro       = plan === 'pro' || plan === 'enterprise';
  const isEnterprise = plan === 'enterprise';

  const renderContent = () => {
    switch (active) {

      /* ─────────────── PERFIL ─────────────── */
      case 'profile':
        return (
          <div className="space-y-6 max-w-lg">
            {/* Banner + Avatar */}
            <div className="relative pb-12">
              <div className="h-28 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/15 to-primary/5 border border-border" />
              <div className="absolute bottom-0 left-5 flex items-end gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-background bg-muted overflow-hidden shadow-lg">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <User size={30} className="text-primary/40" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera size={13} />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div className="pb-1">
                  <p className="text-[15px] font-bold text-foreground leading-tight">{fullName || 'Tu nombre'}</p>
                  <p className="text-[12px] text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Nombre completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Descripcion</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Una breve descripcion sobre ti o tu negocio..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Email</label>
                <input
                  type="text"
                  value={user?.email ?? ''}
                  disabled
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted text-[13px] text-muted-foreground"
                />
              </div>
              {/* Social links */}
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-2 block">
                  Redes sociales <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <div className="space-y-2">
                  {SOCIAL_LINKS_CONFIG.map(({ key, icon: Icon, placeholder, color }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                        <Icon size={15} className={color} />
                      </div>
                      <input
                        type="text"
                        value={(socialLinks as Record<string, string>)[key]}
                        onChange={(e) => setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        );

      /* ─────────────── BILLING ─────────────── */
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
                  <p className="text-[12px] text-muted-foreground">Mas leads y funciones premium</p>
                </div>
                <ChevronRight size={16} className="text-primary" />
              </a>
            )}
          </div>
        );

      /* ─────────────── API ─────────────── */
      case 'api':
        return (
          <div className="space-y-6 max-w-lg">
            {!isEnterprise ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100">
                  <Lock size={28} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-[16px] font-bold text-foreground mb-1">Solo plan Enterprise</p>
                  <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
                    La API de LeadFlow esta disponible exclusivamente para el plan Enterprise (10.000 leads/mes).
                  </p>
                </div>
                <a
                  href="/pricing"
                  className="flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Ver planes <ChevronRight size={15} />
                </a>
              </div>
            ) : (
              <React.Fragment>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Key size={14} className="text-purple-500" />
                    </div>
                    <h2 className="text-[17px] font-bold text-foreground">API Key Access</h2>
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    Agrega un nombre y una descripcion para acceder a tu clave API de LeadFlow.
                  </p>
                </div>
                {!apiKey ? (
                  <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                    <div>
                      <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Nombre de la clave *</label>
                      <input
                        type="text"
                        value={apiName}
                        onChange={(e) => setApiName(e.target.value)}
                        placeholder="Ej: Produccion principal"
                        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-foreground mb-1.5 block">
                        Descripcion <span className="text-muted-foreground font-normal">(opcional)</span>
                      </label>
                      <textarea
                        value={apiDesc}
                        onChange={(e) => setApiDesc(e.target.value)}
                        placeholder="Para que usaras esta API key..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleCreateApiKey}
                      disabled={creatingKey || !apiName.trim()}
                      className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {creatingKey ? 'Generando...' : 'Crear API Key'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-bold text-foreground">{apiMeta?.name ?? 'Mi API Key'}</p>
                    {apiMeta?.desc && <p className="text-[12px] text-muted-foreground mt-0.5">{apiMeta.desc}</p>}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold shrink-0">Activa</span>
                </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[11px] font-semibold text-foreground mb-0.5">Cuenta</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-foreground mb-0.5">Creada</p>
                          <p className="text-[11px] text-muted-foreground">
                            {apiMeta?.created ? new Date(apiMeta.created).toLocaleDateString('es-CO') : 'Hoy'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Tu API Key</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted flex items-center overflow-hidden">
                          <span className="text-[11px] text-muted-foreground font-mono truncate">{apiKey}</span>
                        </div>
                        <button
                          onClick={handleCopyApiKey}
                          className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-background text-[13px] hover:bg-muted transition-colors shrink-0"
                        >
                          {apiCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          <span className="text-[12px]">{apiCopied ? 'Copiada' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => { setApiKey(''); setApiName(apiMeta?.name ?? ''); setApiDesc(apiMeta?.desc ?? ''); setApiMeta(null); }}
                      className="flex items-center gap-2 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RefreshCw size={13} /> Regenerar clave
                    </button>
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        );

      /* ─────────────── FAVORITOS ─────────────── */
      case 'favorites':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Leads favoritos</h2>
              <p className="text-[13px] text-muted-foreground">Tus leads marcados con estrella en el Dashboard</p>
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
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {[
                        { label: 'Telefono', value: selectedLead.phone    },
                        { label: 'Ciudad',   value: selectedLead.city     },
                        { label: 'Estado',   value: selectedLead.state    },
                        { label: 'WhatsApp', value: selectedLead.whatsapp },
                      ].filter((f) => f.value).map((field, i) => (
                        <div key={i}>
                          <p className="text-[11px] text-muted-foreground mb-0.5">{field.label}</p>
                          <p className="text-[13px] text-foreground font-medium">{field.value}</p>
                        </div>
                      ))}
                      {selectedLead.email && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground mb-0.5">Email</p>
                          <p className="text-[13px] text-foreground font-medium truncate">{selectedLead.email}</p>
                        </div>
                      )}
                      {selectedLead.website && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground mb-0.5">Sitio web</p>
                          <a href={selectedLead.website} target="_blank" rel="noreferrer"
                            className="text-[13px] text-primary flex items-center gap-1 truncate">
                            Ver sitio <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                      {selectedLead.address && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground mb-0.5">Direccion</p>
                          <p className="text-[13px] text-foreground">{selectedLead.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loadingFavs ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
              </div>
            ) : favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                  <Star size={26} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Sin favoritos aun</p>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Toca la estrella en cualquier lead del Dashboard para guardarlo aqui
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {favorites.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Star size={14} className="text-amber-500 fill-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{lead.name}</p>
                      <p className="text-[11px] text-muted-foreground">{lead.industry ?? 'Sin industria'} · {lead.city ?? '—'}</p>
                    </div>
                    <p className="text-[12px] text-muted-foreground font-mono shrink-0">{lead.phone ?? '—'}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUnfavorite(lead.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      /* ─────────────── GUIA ─────────────── */
      case 'guide':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Guia de LeadFlow</h2>
              <p className="text-[13px] text-muted-foreground">Domina la plataforma en 5 pasos</p>
            </div>
            <div className="relative">
              <div className="absolute left-[21px] top-11 bottom-11 w-0.5 bg-border z-0" />
              <div className="relative z-10 space-y-4">
                {GUIDE_STEPS.map((step, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-[15px] shrink-0 shadow-md`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 p-4 rounded-2xl border border-border bg-muted/10 hover:bg-muted/25 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                          <step.icon size={15} className="text-foreground" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-foreground mb-1">{step.title}</p>
                          <p className="text-[12px] text-muted-foreground leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <a
              href="/lead-search-extraction"
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors"
            >
              Comenzar a extraer leads <ArrowRight size={15} />
            </a>
          </div>
        );

      /* ─────────────── NOTIFICACIONES ─────────────── */
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Notificaciones</h2>
              <p className="text-[13px] text-muted-foreground">Controla que notificaciones recibes</p>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Extraccion completada', desc: 'Cuando termina un trabajo de busqueda'   },
                { label: 'Cuota casi agotada',    desc: 'Cuando usas el 80% de tu cuota mensual' },
                { label: 'Novedades de LeadFlow', desc: 'Nuevas funciones y mejoras de la app'    },
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

      /* ─────────────── AYUDA ─────────────── */
      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-[17px] font-bold text-foreground mb-1">Comunidad y ayuda</h2>
              <p className="text-[13px] text-muted-foreground">Recursos, soporte y privacidad</p>
            </div>
            <div className="space-y-2">
              {[
                { icon: MessageCircle, label: 'Comunidad WhatsApp', desc: 'Tips, estrategias y soporte directo', href: 'https://chat.whatsapp.com/Lrw99M0Qh6h3cje9zxh28N', bg: 'bg-green-50', color: 'text-green-600' },
                { icon: BookOpen,      label: 'Documentacion',      desc: 'Guias paso a paso',                  href: '/guide',                                          bg: 'bg-blue-50',  color: 'text-blue-500'  },
              ].map((item, i) => (
                <a key={i} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:bg-muted/30 transition-colors">
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
            {/* Politica de privacidad */}
            <div className="p-5 rounded-2xl border border-border space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                  <Shield size={15} className="text-foreground" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">Politica de privacidad</p>
                  <p className="text-[11px] text-muted-foreground">Actualizacion: enero 2025</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                <p className="text-[12px] font-bold text-green-800 mb-1">Lo mas importante primero</p>
                <p className="text-[12px] text-green-700 leading-relaxed">
                  LeadFlow no vende, no comparte ni comercializa tus datos personales. Jamas. Existimos para ayudarte a crecer tu negocio, no para beneficiarnos de tu informacion.
                </p>
              </div>
              <div className="space-y-3 text-[12px] text-muted-foreground leading-relaxed">
                {[
                  {
                    title: 'Que informacion recopilamos',
                    body: 'Solo lo necesario: tu email para el login, tu nombre si decides agregarlo, y los leads que extraes (que son completamente tuyos). No recopilamos datos de navegacion ni comportamiento mas alla de lo estrictamente necesario para que la app funcione correctamente.',
                  },
                  {
                    title: 'Como usamos tu informacion',
                    body: 'Tu email se usa exclusivamente para autenticarte y enviarte notificaciones de tu cuenta. Tus leads extraidos se almacenan de forma privada y solo tu tienes acceso a ellos. Nadie en nuestro equipo accede a tu informacion sin una razon tecnica justificada.',
                  },
                  {
                    title: 'Tus leads son tuyos, siempre',
                    body: 'Todo lo que extraes con LeadFlow te pertenece al 100%. Puedes exportarlo, eliminarlo o descargarlo cuando quieras. Si cancelas tu cuenta, eliminamos todos tus datos de nuestros servidores en un plazo maximo de 30 dias.',
                  },
                  {
                    title: 'Sin cookies de rastreo',
                    body: 'Usamos unicamente cookies tecnicas minimas para mantener tu sesion activa. No usamos cookies publicitarias, no te rastreamos entre sitios y no compartimos ningun dato con plataformas de publicidad.',
                  },
                  {
                    title: 'Seguridad real',
                    body: 'Tu informacion se almacena en Supabase con cifrado en reposo y en transito. Usamos autenticacion segura via email y Google OAuth. Las contrasenas nunca se almacenan en texto plano.',
                  },
                  {
                    title: 'Tus derechos',
                    body: 'Tienes derecho a acceder, modificar o eliminar tu informacion en cualquier momento desde esta seccion de Configuracion. Para solicitar la eliminacion completa de tu cuenta y todos tus datos, escríbenos directamente en nuestra comunidad de WhatsApp.',
                  },
                ].map((s, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="font-semibold text-foreground">{s.title}</p>
                    <p>{s.body}</p>
                  </div>
                ))}
                <p className="pt-1 text-[11px] border-t border-border">
                  Preguntas sobre privacidad: escríbenos en la comunidad de WhatsApp y te respondemos personalmente.
                </p>
              </div>
            </div>
          </div>
        );

      /* ─────────────── PELIGRO ─────────────── */
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
                onClick={() => toast.error('Contacta a soporte en WhatsApp para eliminar tu cuenta')}
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
