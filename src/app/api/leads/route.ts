import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page      = parseInt(searchParams.get('page')  ?? '1');
    const limit     = parseInt(searchParams.get('limit') ?? '50');
    const industry  = searchParams.get('industry');
    const city      = searchParams.get('city');
    const search    = searchParams.get('search');
    const job_id    = searchParams.get('job_id');

    const offset = (page - 1) * limit;

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('extracted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (industry) query = query.eq('industry', industry);
    if (city)     query = query.eq('city', city);
    if (job_id)   query = query.eq('job_id', job_id);
    if (search) {
      query = query.or(
        \`name.ilike.%\${search}%,email.ilike.%\${search}%,phone.ilike.%\${search}%\`
      );
    }

    const { data: leads, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Error al obtener leads' }, { status: 500 });
    }

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/leads]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
