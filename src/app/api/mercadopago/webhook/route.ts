import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_QUOTAS: Record<string, { quota: number }> = {
  pro:        { quota: 2000  },
  enterprise: { quota: 10000 },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return NextResponse.json({ received: true });

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });

    if (!paymentRes.ok) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
    }

    const payment = await paymentRes.json();

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true });
    }

    const [userId, plan] = (payment.external_reference ?? '').split('|');
    if (!userId || !plan || !PLAN_QUOTAS[plan]) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();
    await supabase
      .from('user_profiles')
      .update({ plan, quota_total: PLAN_QUOTAS[plan].quota })
      .eq('id', userId);

    console.log(`Plan actualizado: user ${userId} → ${plan}`);
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[POST /api/mercadopago/webhook]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
