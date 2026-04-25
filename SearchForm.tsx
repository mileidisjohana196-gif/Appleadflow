'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MapPin, Building2, Sliders, AlertTriangle, Zap, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SUGGESTED_INDUSTRIES = [
  // Salud
  'Dentistas', 'Médicos generales', 'Pediatras', 'Psicólogos', 'Nutricionistas',
  'Veterinarias', 'Farmacias', 'Ópticas', 'Fisioterapeutas', 'Clínicas estéticas',
  // Alimentación
  'Restaurantes', 'Panaderías', 'Cafeterías', 'Pizzerías', 'Marisquerías',
  'Heladerías', 'Bares', 'Supermercados', 'Carnicerías', 'Fruterías',
  // Servicios profesionales
  'Abogados', 'Contadores', 'Agencias inmobiliarias', 'Seguros', 'Consultores',
  'Agencias de marketing', 'Diseñadores gráficos', 'Arquitectos', 'Ingenieros',
  // Belleza y bienestar
  'Peluquerías', 'Salones de belleza', 'Barberías', 'Spas', 'Gimnasios',
  'Estudios de yoga', 'Tatuajes', 'Uñas y estética',
  // Comercio y retail
  'Ferreterías', 'Tiendas de ropa', 'Joyerías', 'Zapaterías', 'Librerías',
  'Papelerías', 'Florerías', 'Tiendas de electrónica', 'Mueblería',
  // Educación
  'Colegios', 'Universidades', 'Academias de idiomas', 'Guarderías', 'Tutorías',
  'Academias de música', 'Escuelas de baile', 'Academias de arte',
  // Automotriz y hogar
  'Talleres mecánicos', 'Concesionarios', 'Lavado de autos', 'Llanterías',
  'Electricistas', 'Plomeros', 'Pintores', 'Cerrajeros', 'Mudanzas',
  // Hospedaje y turismo
  'Hoteles', 'Hostales', 'Agencias de viajes', 'Guías turísticos', 'Alquiler de vehículos',
];

interface SearchFormData {
  industrySelect: string;
  industryCustom: string;
  city: string;
  country: string;
  radius: number;
  maxResults: number;
  extractEmail: boolean;
  extractWhatsapp: boolean;
  extractWebsite: boolean;
  extractAddress: boolean;
}

interface SearchFormProps {
  onJobStart: (job: { id: string; industry: string; city: string; maxResults: number }) => void;
}

export default function SearchForm({ onJobStart }: SearchFormProps) {
  const { getUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [quotaUsed, setQuotaUsed] = useState(0);
  const [quotaTotal, setQuotaTotal] = useState(100);
  const [useCustomIndustry, setUseCustomIndustry] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        if (profile) {
          setQuotaUsed(profile.quota_used);
          setQuotaTotal(profile.quota_total);
        }
      })
      .catch(console.error);
  }, []);

  const quotaRemaining = quotaTotal - quotaUsed;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SearchFormData>({
    defaultValues: {
      industrySelect: '',
      industryCustom: '',
      city: '',
      country: '',
      radius: 10,
      maxResults: 100,
      extractEmail: true,
      extractWhatsapp: true,
      extractWebsite: true,
      extractAddress: true,
    },
  });

  const maxResults = watch('maxResults');
  const radiusVal = watch('radius');
  const industrySelect = watch('industrySelect');

  // Si el usuario elige de la lista, limpiar el campo custom y viceversa
  const handleSelectChange = (val: string) => {
    setValue('industrySelect', val);
    if (val) {
      setUseCustomIndustry(false);
      setValue('industryCustom', '');
    }
  };

  const handleCustomFocus = () => {
    setUseCustomIndustry(true);
    setValue('industrySelect', '');
  };

  const getFinalIndustry = (data: SearchFormData): string => {
    if (useCustomIndustry && data.industryCustom.trim()) return data.industryCustom.trim();
    return data.industrySelect;
  };

  const getFinalCity = (data: SearchFormData): string => {
    const city = data.city.trim();
    const country = data.country.trim();
    return country ? `${city}, ${country}` : city;
  };

  const onSubmit = async (data: SearchFormData) => {
    const industry = getFinalIndustry(data);
    if (!industry) {
      toast.error('Selecciona o escribe una industria');
      return;
    }
    if (!data.city.trim()) {
      toast.error('Escribe una ciudad');
      return;
    }
    if (data.maxResults > quotaRemaining) {
      toast.error(`Solo tienes ${quotaRemaining} leads disponibles en tu cuota.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const city = getFinalCity(data);
      const res = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry,
          city,
          radius_km: data.radius,
          max_results: data.maxResults,
          extract_email: data.extractEmail,
          extract_whatsapp: data.extractWhatsapp,
          extract_website: data.extractWebsite,
          extract_address: data.extractAddress,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Error al iniciar extracción');
      }

      const { job } = await res.json();
      onJobStart({ id: job.id, industry: job.industry, city: job.city, maxResults: job.max_results });
      toast.success(`Extracción iniciada: ${industry} en ${city}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border shadow-card">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-[15px] font-600 text-foreground">Configurar extracción</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Busca negocios en cualquier ciudad del mundo y extrae sus datos de contacto
        </p>
      </div>

      {quotaRemaining < 500 && (
        <div className="mx-6 mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-600 text-amber-800">Cuota baja</p>
            <p className="text-[12px] text-amber-700 mt-0.5">
              Te quedan <strong>{quotaRemaining.toLocaleString()}</strong> leads disponibles este mes.{' '}
              <button className="underline font-600 hover:text-amber-900">Mejorar plan →</button>
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

        {/* Industry — híbrido lista + escritura libre */}
        <div>
          <label className="block text-[13px] font-500 text-foreground mb-1.5">
            Industria / Tipo de negocio
          </label>
          <p className="text-[11px] text-muted-foreground mb-2">
            Elige de la lista o escribe cualquier categoría manualmente
          </p>

          {/* Select de lista */}
          <div className="relative mb-2">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              {...register('industrySelect')}
              onChange={(e) => handleSelectChange(e.target.value)}
              value={industrySelect}
              className={`w-full pl-9 pr-4 py-2.5 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none text-foreground ${
                !useCustomIndustry && industrySelect ? 'border-primary' : 'border-border'
              }`}
            >
              <option value="">Selecciona una industria...</option>
              {SUGGESTED_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Divisor */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">o escribe manualmente</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Input libre */}
          <input
            type="text"
            placeholder="Ej: Clínicas de fertilidad, Estudios de tatuajes, Importadores de telas..."
            {...register('industryCustom')}
            onFocus={handleCustomFocus}
            className={`w-full px-3 py-2.5 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground/50 ${
              useCustomIndustry ? 'border-primary' : 'border-border'
            }`}
          />
          {!useCustomIndustry && !industrySelect && (
            <p className="mt-1.5 text-[11px] text-red-600">Selecciona o escribe una industria</p>
          )}
        </div>

        {/* Ciudad + País */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-500 text-foreground mb-1.5">
              Ciudad
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ej: Bogotá, Miami, Madrid..."
                {...register('city', { required: 'Escribe una ciudad' })}
                className={`w-full pl-9 pr-3 py-2.5 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground/50 ${
                  errors.city ? 'border-red-400' : 'border-border'
                }`}
              />
            </div>
            {errors.city && <p className="mt-1.5 text-[11px] text-red-600">{errors.city.message}</p>}
          </div>

          <div>
            <label className="block text-[13px] font-500 text-foreground mb-1.5">
              País <span className="text-muted-foreground font-400">(opcional)</span>
            </label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ej: Colombia, España..."
                {...register('country')}
                className="w-full pl-9 pr-3 py-2.5 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-3">
          Agregar el país mejora la precisión cuando hay ciudades con el mismo nombre en varios países.
        </p>

        {/* Max results */}
        <div>
          <label className="block text-[13px] font-500 text-foreground mb-1.5">
            Límite de resultados
          </label>
          <p className="text-[11px] text-muted-foreground mb-2">
            Te quedan <strong className="text-foreground">{quotaRemaining.toLocaleString()}</strong> leads en tu cuota
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={10}
              max={Math.min(500, quotaRemaining)}
              {...register('maxResults', {
                required: 'Ingresa un límite',
                min: { value: 10, message: 'Mínimo 10' },
                max: { value: Math.min(500, quotaRemaining), message: `Máximo ${Math.min(500, quotaRemaining)}` },
              })}
              className={`w-28 px-3 py-2.5 text-[13px] border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-foreground ${
                errors.maxResults ? 'border-red-400' : 'border-border'
              }`}
            />
            <div className="flex gap-2">
              {[50, 100, 200, 500].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setValue('maxResults', v)}
                  className={`px-3 py-2 text-[12px] font-500 border rounded-lg transition-all duration-150 ${
                    maxResults === v ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          {errors.maxResults && <p className="mt-1.5 text-[11px] text-red-600">{errors.maxResults.message}</p>}
        </div>

        {/* Advanced */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[13px] font-500 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Sliders size={14} />
          Opciones avanzadas
          <ChevronDown size={13} className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="bg-muted/40 rounded-lg p-4 space-y-4 animate-slide-up">
            <div>
              <label className="block text-[13px] font-500 text-foreground mb-1.5">
                Radio de búsqueda: <strong className="text-primary font-mono">{radiusVal} km</strong>
              </label>
              <input
                type="range" min={1} max={50}
                {...register('radius')}
                className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>1 km</span><span>25 km</span><span>50 km</span>
              </div>
            </div>
            <div>
              <p className="text-[13px] font-500 text-foreground mb-2.5">Datos a extraer</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { field: 'extractEmail' as const, label: 'Email corporativo', icon: '📧' },
                  { field: 'extractWhatsapp' as const, label: 'Número WhatsApp', icon: '💬' },
                  { field: 'extractWebsite' as const, label: 'Sitio web', icon: '🌐' },
                  { field: 'extractAddress' as const, label: 'Dirección completa', icon: '📍' },
                ].map(({ field, label, icon }) => (
                  <label key={field} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" {...register(field)} className="w-4 h-4 rounded border-border accent-primary cursor-pointer" />
                    <span className="text-[12px] text-foreground group-hover:text-primary transition-colors">{icon} {label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-primary text-white text-[14px] font-600 rounded-lg hover:bg-green-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando extracción...
              </>
            ) : (
              <><Zap size={16} />Iniciar extracción de leads</>
            )}
          </button>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Cobertura mundial · Fuente: Google Maps
          </p>
        </div>
      </form>
    </div>
  );
}
