import Link from 'next/link';

const PLANS = [
  { name: 'Free',       price: 0,  leads: 100,   popular: false, cta: 'Empezar gratis', features: ['100 leads/mes', 'Exportar CSV', 'Dashboard básico', 'Soporte por email'] },
  { name: 'Starter',    price: 9,  leads: 500,   popular: false, cta: 'Empezar ahora',  features: ['500 leads/mes', 'Exportar CSV', 'Reporte PDF', 'Soporte prioritario'] },
  { name: 'Pro',        price: 19, leads: 2000,  popular: true,  cta: 'Empezar ahora',  features: ['2,000 leads/mes', 'Exportar CSV', 'Reporte PDF', 'Dashboard avanzado', 'Soporte prioritario'] },
  { name: 'Enterprise', price: 49, leads: 10000, popular: false, cta: 'Empezar ahora',  features: ['10,000 leads/mes', 'Todo lo anterior', 'Acceso API', 'Soporte dedicado'] },
];

const FAQS = [
  { q: '¿De dónde vienen los leads?',                   a: 'LeadFlow extrae datos directamente de Google Maps en tiempo real. Buscamos negocios reales según la industria y ciudad que eliges, y extraemos su información de contacto actualizada al momento.' },
  { q: '¿Qué datos obtengo por cada lead?',             a: 'Por cada negocio extraído obtienes: nombre, industria, ciudad, teléfono directo, número de WhatsApp (cuando disponible), email, sitio web, dirección completa y enlace a Google Maps.' },
  { q: '¿Los datos están actualizados?',                a: 'Sí. Cada extracción se hace en tiempo real contra Google Maps. No vendemos bases de datos viejas — cada lead se extrae en el momento en que lo solicitas.' },
  { q: '¿Puedo exportar los leads?',                    a: 'Sí. Puedes exportar en CSV compatible con Excel y cualquier CRM, o generar un reporte PDF profesional para presentar a clientes.' },
  { q: '¿Qué pasa si agoto mi cuota mensual?',          a: 'La extracción se pausa automáticamente. Puedes actualizar tu plan en cualquier momento desde Configuración para continuar extrayendo.' },
  { q: '¿Necesito tarjeta de crédito para el plan gratuito?', a: 'No. El plan Free es completamente gratuito sin datos de pago. Solo te registras con tu email y empiezas en minutos.' },
];

const MOCK_LEADS = [
  { name: 'Restaurante El Bandido',   phone: '+57 301 234 5678', wa: true,  email: 'contacto@bandido.co' },
  { name: 'Asadero La Parrilla Real', phone: '+57 314 567 8901', wa: true,  email: '—' },
  { name: 'Pizzería Don Marco',       phone: '+57 320 891 2345', wa: true,  email: 'donmarco@gmail.com' },
  { name: 'Café Sabor Colombiano',    phone: '+57 311 123 4567', wa: false, email: 'cafe@sabor.co' },
];

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden">

      {/* NAV */}
      <nav className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-sm shadow-[0_0_12px_rgba(16,185,129,0.4)]">LF</div>
            <span className="font-bold text-lg tracking-tight">LeadFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#precios"       className="hover:text-white transition-colors">Precios</a>
            <a href="#faq"           className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-up-login" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Iniciar sesión</Link>
            <Link href="/sign-up-login" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-lg transition-all shadow-[0_0_16px_rgba(16,185,129,0.25)]">Empezar gratis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-24 pb-16 px-5 max-w-6xl mx-auto text-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-600/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-emerald-400 text-xs font-semibold mb-6 uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Extracción en tiempo real · Google Maps
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
          Consigue clientes reales.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Directo de Google Maps.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Escribe una industria y una ciudad. LeadFlow extrae negocios reales con{' '}
          <strong className="text-white">teléfono, WhatsApp, email y sitio web</strong>{' '}
          en segundos. Sin búsquedas manuales. Sin bases de datos viejas.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href="/sign-up-login" className="w-full sm:w-auto px-9 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base rounded-xl transition-all shadow-[0_0_28px_rgba(16,185,129,0.35)] hover:-translate-y-0.5">
            Obtener 100 leads gratis
          </Link>
          <a href="#como-funciona" className="w-full sm:w-auto px-9 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-base rounded-xl border border-zinc-700 transition-all">
            Ver cómo funciona →
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
          {['Sin tarjeta de crédito', 'Datos en tiempo real', 'WhatsApp incluido'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* PRODUCT MOCKUP */}
      <section className="py-10 px-5 max-w-4xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            <div className="flex-1 mx-4 h-7 bg-zinc-800 rounded-lg flex items-center px-3">
              <span className="text-zinc-500 text-xs">appleadflow.vercel.app · Restaurantes en Bogotá</span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-bold text-sm">Restaurantes · Bogotá, Colombia</p>
                <p className="text-zinc-500 text-xs mt-0.5">47 leads extraídos en 8 segundos</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-zinc-800 rounded-lg text-xs text-zinc-400 border border-zinc-700 hidden sm:block">Exportar CSV</div>
                <div className="px-3 py-1.5 bg-emerald-500/10 rounded-lg text-xs text-emerald-400 border border-emerald-500/20">Reporte PDF</div>
              </div>
            </div>
            <div className="space-y-2">
              {MOCK_LEADS.map((lead, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/40 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold shrink-0 border border-emerald-500/20 text-sm">{lead.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate text-[13px]">{lead.name}</p>
                  </div>
                  <div className="text-zinc-400 hidden sm:block font-mono">{lead.phone}</div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold hidden sm:block ${lead.wa ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-800 text-zinc-600 border border-zinc-700'}`}>
                    {lead.wa ? 'WhatsApp ✓' : 'Sin WA'}
                  </div>
                  <div className="text-zinc-500 hidden md:block">{lead.email}</div>
                </div>
              ))}
              <p className="text-center text-zinc-600 text-xs py-2">+ 43 leads más...</p>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO DEMO */}
      <section className="py-20 px-5 max-w-4xl mx-auto text-center">
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Demo en vivo</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Míralo funcionar en 90 segundos</h2>
        <p className="text-zinc-500 mb-8 max-w-xl mx-auto text-sm">Industria → ciudad → leads reales con teléfono y WhatsApp. Así de simple.</p>
        <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent" />
          <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 group-hover:border-emerald-500/40 flex items-center justify-center transition-all group-hover:scale-110 relative z-10">
            <svg className="w-7 h-7 text-emerald-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm relative z-10">Video demo — próximamente</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-24 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Simple por diseño</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">3 pasos para tener leads reales</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { step: '01', title: 'Elige industria y ciudad',    desc: 'Escribe el tipo de negocio y la ciudad objetivo. Restaurantes en Medellín, clínicas en CDMX, agencias en Lima. Tú decides el mercado.' },
            { step: '02', title: 'LeadFlow extrae en segundos', desc: 'Consultamos Google Maps en tiempo real y extraemos nombre, teléfono, WhatsApp, email y sitio web de cada negocio encontrado.' },
            { step: '03', title: 'Exporta y convierte',         desc: 'Descarga en CSV para tu CRM o genera un reporte PDF profesional. Leads listos para usar en segundos.' },
          ].map((item, i) => (
            <div key={i} className="relative p-7 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/25 transition-colors group">
              <div className="text-5xl font-black text-zinc-800 group-hover:text-emerald-500/15 transition-colors mb-4 font-mono leading-none">{item.step}</div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Datos incluidos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Todo lo que obtienes por cada lead</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '📞', title: 'Teléfono directo',  desc: 'Número del negocio listo para llamar o enviar SMS de ventas.' },
            { icon: '💬', title: 'WhatsApp',           desc: 'Detectamos si el número tiene WhatsApp activo para contacto inmediato.' },
            { icon: '📧', title: 'Email',              desc: 'Email de contacto cuando está disponible en el perfil del negocio.' },
            { icon: '🌐', title: 'Sitio web',          desc: 'URL del sitio para investigar al prospecto antes de contactar.' },
            { icon: '📍', title: 'Dirección',          desc: 'Ubicación física con enlace directo a Google Maps incluido.' },
            { icon: '🏭', title: 'Industria y ciudad', desc: 'Categoría y ubicación para segmentar y priorizar tu prospección.' },
          ].map((item, i) => (
            <div key={i} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOR WHO */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">¿Para quién es LeadFlow?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { emoji: '🎯', title: 'Agencias de marketing',     desc: 'Consigue clientes locales para tus servicios. Extrae cientos de negocios en tu ciudad y ofrece gestión de redes, publicidad pagada o diseño web.' },
            { emoji: '💼', title: 'Freelancers y consultores', desc: 'Construye tu propia fuente de prospectos sin depender de plataformas. Contacta directamente a dueños de negocios que necesitan lo que ofreces.' },
            { emoji: '📈', title: 'Equipos de ventas',         desc: 'Alimenta tu CRM con leads B2B locales y actualizados. Segmenta por industria y ciudad para cold email, llamadas o WhatsApp.' },
          ].map((item, i) => (
            <div key={i} className="p-7 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div className="text-3xl mb-4">{item.emoji}</div>
              <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" className="py-24 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Sin sorpresas</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Precios simples y transparentes</h2>
          <p className="text-zinc-500 text-sm">Empieza gratis. Escala cuando lo necesites. Cancela cuando quieras.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <div key={i} className={`relative p-6 rounded-2xl border flex flex-col ${plan.popular ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.08)]' : 'bg-zinc-900 border-zinc-800'}`}>
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-xs font-black rounded-full uppercase tracking-wide whitespace-nowrap">
                  Más popular
                </div>
              )}
              <div className="mb-5">
                <p className="text-zinc-400 text-sm font-medium mb-2">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  {plan.price > 0 && <span className="text-zinc-500 text-sm">/mes</span>}
                </div>
                <p className="text-emerald-400 text-sm font-semibold">{plan.leads.toLocaleString()} leads/mes</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up-login" className={`w-full py-2.5 rounded-xl text-sm font-bold text-center transition-all block ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-5 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details key={i} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                <svg className="w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 pt-4 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="relative p-10 md:p-16 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-60 bg-emerald-600/8 blur-[100px] rounded-full pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 relative z-10 leading-tight">
              Empieza a conseguir<br />
              <span className="text-emerald-400">clientes reales hoy.</span>
            </h2>
            <p className="text-zinc-500 mb-8 relative z-10 text-sm">100 leads gratis. Sin tarjeta de crédito. En minutos.</p>
            <Link href="/sign-up-login" className="relative z-10 inline-flex items-center gap-2 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
              Crear cuenta gratis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/60 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-500 rounded-md flex items-center justify-center font-black text-black text-xs">LF</div>
            <span className="font-bold text-sm">LeadFlow</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacidad</Link>
            <Link href="/guide"   className="hover:text-zinc-300 transition-colors">Guía</Link>
            <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Precios</Link>
            <a href="https://chat.whatsapp.com/Lrw99M0Qh6h3cje9zxh28N" target="_blank" rel="noreferrer" className="hover:text-zinc-300 transition-colors">Comunidad</a>
          </div>
          <p className="text-zinc-700 text-xs">© 2025 LeadFlow. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
