import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { full_name } = await request.json();
    if (!full_name?.trim()) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: full_name.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/profile]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
