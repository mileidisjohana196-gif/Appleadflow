import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-bold text-[17px]">Lead<span className="text-primary">Flow</span></a>
        <a href="/leads-dashboard" className="text-[13px] font-medium text-primary hover:underline">Ir al dashboard →</a>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-800 text-foreground mb-2">Política de Privacidad</h1>
        <p className="text-[13px] text-muted-foreground mb-10">Última actualización: Mayo 2026</p>
        <div className="space-y-8 text-[14px] text-foreground leading-relaxed">
          {[
            { title: '1. Información que recopilamos', body: 'Recopilamos nombre, email y datos de uso al crear tu cuenta. Los pagos son procesados por Mercado Pago — no almacenamos datos de tarjetas.' },
            { title: '2. Cómo usamos tu información', body: 'Usamos tu información para proveer el servicio, procesar pagos y enviarte notificaciones de tu cuenta. Nunca vendemos tu información a terceros.' },
            { title: '3. Datos de leads extraídos', body: 'Los leads extraídos son datos públicos de Google Maps. Eres responsable del uso que hagas de estos datos y de cumplir las leyes de protección de datos de tu país.' },
            { title: '4. Almacenamiento y seguridad', body: 'Tus datos se almacenan en Supabase con encriptación en reposo y en tránsito. La app se hospeda en Vercel con certificados SSL.' },
            { title: '5. Tus derechos', body: 'Tienes derecho a acceder, corregir o eliminar tus datos personales. Escríbenos a soporte@appleadflow.vercel.app para ejercer estos derechos.' },
            { title: '6. Cookies', body: 'Usamos únicamente cookies esenciales para mantener tu sesión activa. No usamos cookies de rastreo publicitario.' },
            { title: '7. Contacto', body: 'Para consultas sobre privacidad: soporte@appleadflow.vercel.app' },
          ].map((s, i) => (
            <section key={i}>
              <h2 className="text-[17px] font-700 mb-3">{s.title}</h2>
              <p className="text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
