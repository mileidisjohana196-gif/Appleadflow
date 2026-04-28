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
    const { ids } = body;

    let query = supabase
      .from('leads')
      .select('name, industry, city, state, phone, whatsapp, email, website, address, source, extracted_at')
      .eq('user_id', user.id)
      .order('extracted_at', { ascending: false });

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = query.in('id', ids);
    }

    const { data: leads, error } = await query;

    if (error || !leads) {
      return NextResponse.json({ error: 'Error al exportar leads' }, { status: 500 });
    }

    const headers = ['Nombre', 'Industria', 'Ciudad', 'Estado', 'Teléfono', 'WhatsApp', 'Email', 'Sitio Web', 'Dirección', 'Fuente', 'Fecha'];
    const rows = leads.map((l) => [
      l.name,
      l.industry ?? '',
      l.city ?? '',
      l.state ?? '',
      l.phone ?? '',
      l.whatsapp ? 'Sí' : 'No',
      l.email ?? '',
      l.website ?? '',
      l.address ?? '',
      l.source,
      new Date(l.extracted_at).toLocaleDateString('es-ES'),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => \`"\${String(cell).replace(/"/g, '""')}"\`).join(','))
      .join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': \`attachment; filename="leadflow-export-\${Date.now()}.csv"\`,
      },
    });
  } catch (error) {
    console.error('[POST /api/leads/export]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
