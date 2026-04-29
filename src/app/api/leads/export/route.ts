import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { ids, format = 'csv' } = body;

    let query = supabase
      .from('leads')
      .select('name, industry, city, phone, whatsapp, email, website, address, extracted_at')
      .eq('user_id', user.id)
      .order('extracted_at', { ascending: false });

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = query.in('id', ids);
    }

    const { data: leads, error } = await query;
    if (error || !leads) {
      return NextResponse.json({ error: 'Error al exportar leads' }, { status: 500 });
    }

    const date = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (format === 'pdf') {
      const rows = leads.map((l, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>${i + 1}</td>
          <td><strong>${l.name}</strong></td>
          <td>${l.industry ?? '—'}</td>
          <td>${l.city ?? '—'}</td>
          <td>${l.phone ?? '—'}</td>
          <td>${l.whatsapp ? '✓' : '—'}</td>
          <td>${l.email ?? '—'}</td>
          <td>${l.website ? '<a href="' + l.website + '">' + l.website.replace(/https?:\/\/(www\.)?/, '').slice(0, 30) + '</a>' : '—'}</td>
        </tr>`).join('');

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>LeadFlow — Exportación de Leads</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 26px; font-weight: 800; color: #16a34a; letter-spacing: -0.5px; }
    .meta { text-align: right; font-size: 12px; color: #666; }
    .meta p { margin-bottom: 2px; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; }
    .stat { flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; text-align: center; }
    .stat .num { font-size: 28px; font-weight: 800; color: #16a34a; }
    .stat .label { font-size: 11px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    thead tr { background: #16a34a; color: white; }
    thead th { padding: 10px 8px; text-align: left; font-weight: 600; letter-spacing: 0.3px; }
    tbody tr.even { background: #f9fafb; }
    tbody tr.odd { background: #ffffff; }
    tbody td { padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
    tbody tr:hover { background: #f0fdf4; }
    a { color: #16a34a; text-decoration: none; font-size: 10px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">🌱 LeadFlow</div>
      <p style="font-size:12px;color:#666;margin-top:4px">Plataforma de extracción de leads</p>
    </div>
    <div class="meta">
      <p><strong>Reporte de Leads</strong></p>
      <p>Generado: ${date}</p>
      <p>Total: ${leads.length} leads</p>
    </div>
  </div>

  <div class="summary">
    <div class="stat">
      <div class="num">${leads.length}</div>
      <div class="label">Total leads</div>
    </div>
    <div class="stat">
      <div class="num">${leads.filter(l => l.phone).length}</div>
      <div class="label">Con teléfono</div>
    </div>
    <div class="stat">
      <div class="num">${leads.filter(l => l.whatsapp).length}</div>
      <div class="label">Con WhatsApp</div>
    </div>
    <div class="stat">
      <div class="num">${leads.filter(l => l.email).length}</div>
      <div class="label">Con email</div>
    </div>
    <div class="stat">
      <div class="num">${leads.filter(l => l.website).length}</div>
      <div class="label">Con sitio web</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre del negocio</th>
        <th>Industria</th>
        <th>Ciudad</th>
        <th>Teléfono</th>
        <th>WA</th>
        <th>Email</th>
        <th>Sitio Web</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    Generado por LeadFlow · appleadflow.vercel.app · ${date}
  </div>
</body>
</html>`;

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': 'attachment; filename="leadflow-leads-' + Date.now() + '.html"',
        },
      });
    }

    // CSV mejorado
    const headers = ['#', 'Nombre', 'Industria', 'Ciudad', 'Teléfono', 'WhatsApp', 'Email', 'Sitio Web', 'Dirección', 'Fecha'];
    const csvRows = leads.map((l, i) => [
      i + 1,
      l.name,
      l.industry ?? '',
      l.city ?? '',
      l.phone ?? '',
      l.whatsapp ? 'Sí' : 'No',
      l.email ?? '',
      l.website ?? '',
      l.address ?? '',
      new Date(l.extracted_at).toLocaleDateString('es-CO'),
    ]);

    const csv = [headers, ...csvRows]
      .map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(','))
      .join('\n');

    return new NextResponse('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leadflow-leads-' + Date.now() + '.csv"',
      },
    });
  } catch (error) {
    console.error('[POST /api/leads/export]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
