import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('quota_used, quota_total')
      .eq('id', user.id)
      .single();

    if (!profile || profile.quota_used >= profile.quota_total) {
      return NextResponse.json({ error: 'Cuota de extracción agotada' }, { status: 429 });
    }

    const body = await request.json();
    const {
      industry, city,
      radius_km = 10, max_results = 100,
      extract_email = true, extract_whatsapp = true,
      extract_website = true, extract_address = true,
    } = body;

    if (!industry || !city) {
      return NextResponse.json({ error: 'industry y city son requeridos' }, { status: 400 });
    }

    const { data: job, error: jobError } = await supabase
      .from('extraction_jobs')
      .insert({ user_id: user.id, industry, city, radius_km, max_results, extract_email, extract_whatsapp, extract_website, extract_address, status: 'queued' })
      .select()
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Error al crear el job' }, { status: 500 });
    }

    fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_SECRET ?? '',
      },
      body: JSON.stringify({ jobId: job.id, userId: user.id }),
    }).catch(console.error);

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/search-jobs]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
