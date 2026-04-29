import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { after } from 'next/server';
import { extractBusinesses } from '@/lib/serpapi';

export const maxDuration = 60;

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
      radius_km = 10, max_results = 50,
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

    const jobId = job.id;
    const userId = user.id;

    after(async () => {
      try {
        await supabase
          .from('extraction_jobs')
          .update({ status: 'running', started_at: new Date().toISOString(), progress: 5 })
          .eq('id', jobId);

        const businesses = await extractBusinesses(industry, city, max_results);

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

      } catch (err) {
        console.error('[after extraction]', err);
        await supabase
          .from('extraction_jobs')
          .update({ status: 'failed', finished_at: new Date().toISOString() })
          .eq('id', jobId);
      }
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/search-jobs]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
