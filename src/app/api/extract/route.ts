import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractBusinesses } from '@/lib/serpapi';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const secret = request.headers.get('x-internal-secret');
    if (secret !== process.env.INTERNAL_SECRET) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { jobId, userId } = await request.json();
    if (!jobId || !userId) {
      return NextResponse.json({ error: 'jobId y userId son requeridos' }, { status: 400 });
    }

    const { data: job, error: jobError } = await supabase
      .from('extraction_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job no encontrado' }, { status: 404 });
    }

    await supabase
      .from('extraction_jobs')
      .update({ status: 'running', started_at: new Date().toISOString(), progress: 5 })
      .eq('id', jobId);

    const businesses = await extractBusinesses(job.industry, job.city, job.max_results);

    await supabase
      .from('extraction_jobs')
      .update({ progress: 60 })
      .eq('id', jobId);

    const leads = businesses.map((b) => ({
      user_id: userId,
      job_id: jobId,
      name: b.name,
      industry: b.industry,
      city: b.city,
      phone: b.phone,
      whatsapp: b.whatsapp,
      email: b.email,
      website: b.website,
      address: b.address,
      maps_url: b.maps_url,
      enrichment: 'pending' as const,
      source: 'Google Maps via SerpApi',
      extracted_at: new Date().toISOString(),
    }));

    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const { error: insertError } = await supabase.from('leads').insert(batch);
      if (!insertError) inserted += batch.length;
      const progress = Math.min(60 + Math.floor(((i + batchSize) / leads.length) * 35), 95);
      await supabase
        .from('extraction_jobs')
        .update({ progress, found_count: inserted })
        .eq('id', jobId);
    }

    await supabase.rpc('increment_quota', { user_id: userId, amount: inserted });

    await supabase
      .from('extraction_jobs')
      .update({ status: 'completed', progress: 100, found_count: inserted, finished_at: new Date().toISOString() })
      .eq('id', jobId);

    return NextResponse.json({ success: true, inserted });
  } catch (error) {
    console.error('[POST /api/extract]', error);
    return NextResponse.json({ error: 'Error en la extracción' }, { status: 500 });
  }
}
