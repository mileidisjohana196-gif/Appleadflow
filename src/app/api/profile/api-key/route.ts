import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'lf_';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (!profile || !['pro', 'enterprise'].includes(profile.plan)) {
      return NextResponse.json({ error: 'Requiere Plan Pro o Enterprise' }, { status: 403 });
    }

    const api_key = generateApiKey();

    const { error } = await supabase
      .from('user_profiles')
      .update({ api_key, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Error al generar API Key' }, { status: 500 });
    }

    return NextResponse.json({ api_key });
  } catch (err) {
    console.error('[POST /api/profile/api-key]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
