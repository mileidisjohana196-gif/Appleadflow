import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('leads')
      .update({ favorite: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/leads/[id]/favorite]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('leads')
      .update({ favorite: false })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/leads/[id]/favorite]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
