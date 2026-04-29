import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: jobs, error } = await supabase
      .from('extraction_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Error al obtener jobs' }, { status: 500 });
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('[GET /api/jobs]', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
