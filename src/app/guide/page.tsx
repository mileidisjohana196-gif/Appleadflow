import React from 'react';
import { Target, Star, TrendingUp, Award, Zap, Key, Download, Search } from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-[17px]">Lead<span className="text-primary">Flow</span></a>
        <a href="/leads-dashboard" className="text-[13px] font-medium text-primary hover:underline">Ir al dashboard →</a>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary text-[12px] font-semibold px-3 py-1 rounded-full mb-4">Documentación oficial</span>
          <h1 className="text-3xl font-800 text-foreground mb-4">Guía completa de LeadFlow</h1>
          <p className="text-[15px] text-muted-foreground">Todo lo que necesitas para extraer leads y hacer crecer tu negocio</p>
        </div>
        <div className="space-y-6">
          {[
            { icon: Search,     title: '1. Extrae leads en segundos',             desc: 'Ve a Buscar Leads en el menú. Selecciona una industria, ingresa la ciudad y el país, elige cuántos leads extraer según tu plan y presiona Iniciar extracción.' },
            { icon: Star,       title: '2. Organiza tus leads favoritos',          desc: 'En Mis Leads toca la estrella de cualquier lead para marcarlo como favorito. Accede a ellos desde Configuración → Leads favoritos.' },
            { icon: TrendingUp, title: '3. Analiza tu rendimiento',                desc: 'El Dashboard muestra métricas en tiempo real: total de leads, cobertura de WhatsApp y email, tasa de extracción y evolución mensual.' },
            { icon: Download,   title: '4. Exporta tus leads',                    desc: 'Exporta en CSV para tu CRM o genera un Reporte PDF profesional para presentar a clientes. Puedes exportar todos o solo los seleccionados.' },
            { icon: Zap,        title: '5. Optimiza tu cuota',                    desc: 'Extrae por industrias específicas con alta demanda y ciudades concretas. Prioriza leads con WhatsApp disponible para mayor tasa de respuesta.' },
            { icon: Key,        title: '6. API Access (Pro y Enterprise)',         desc: 'Genera tu API Key en Configuración → API Access. Usa el endpoint GET /api/leads con header Authorization: Bearer TU_API_KEY.' },
            { icon: Award,      title: '7. Mejores prácticas para cerrar ventas', desc: 'Contacta leads dentro de las primeras 24 horas. Personaliza tu mensaje con el nombre del negocio y ciudad. Sé directo y ofrece valor inmediato.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-5 p-6 border border-border rounded-xl bg-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-[15px] font-700 text-foreground mb-2">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-[14px] font-700 text-green-800 mb-2">¿Tienes dudas?</p>
          <p className="text-[13px] text-green-700 mb-4">Únete a nuestra comunidad de WhatsApp</p>
          <a href="https://chat.whatsapp.com/Lrw99M0Qh6h3cje9zxh28N" target="_blank" rel="noopener noreferrer"
            className="px-5 py-2.5 bg-green-500 text-white text-[13px] font-600 rounded-lg hover:bg-green-600 transition-colors inline-block">
            Unirse a la comunidad 🌱
          </a>
        </div>
      </div>
    </div>
  );
}
