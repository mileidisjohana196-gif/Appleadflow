import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PLAN_QUOTAS: Record<string, { quota: number }> = {
  starter:    { quota: 500   },
  pro:        { quota: 2000  },
  enterprise: { quota: 10000 },
};

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      if (!paymentId) return NextResponse.json({ received: true });

      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      if (!paymentRes.ok) return NextResponse.json({ error: 'Error' }, { status: 500 });

      const payment = await paymentRes.json();
      if (payment.status !== 'approved') return NextResponse.json({ received: true });

      const [userId, plan] = (payment.external_reference ?? '').split('|');
      if (!userId || !plan || !PLAN_QUOTAS[plan]) return NextResponse.json({ received: true });

      const supabase = getServiceClient();
      await supabase
        .from('user_profiles')
        .update({ plan, quota_total: PLAN_QUOTAS[plan].quota })
        .eq('id', userId);

      console.log(`Pago aprobado: user ${userId} → ${plan}`);
      return NextResponse.json({ received: true });
    }

    if (body.type === 'subscription_preapproval') {
      const subId = body.data?.id;
      if (!subId) return NextResponse.json({ received: true });

      const subRes = await fetch(`https://api.mercadopago.com/preapproval/${subId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      if (!subRes.ok) return NextResponse.json({ error: 'Error' }, { status: 500 });

      const sub = await subRes.json();
      const [userId, plan] = (sub.external_reference ?? '').split('|');
      if (!userId || !plan || !PLAN_QUOTAS[plan]) return NextResponse.json({ received: true });

      const supabase = getServiceClient();

      if (sub.status === 'authorized') {
        await supabase
          .from('user_profiles')
          .update({ plan, quota_total: PLAN_QUOTAS[plan].quota })
          .eq('id', userId);
        console.log(`Suscripción activa: user ${userId} → ${plan}`);
      } else if (sub.status === 'cancelled' || sub.status === 'paused') {
        await supabase
          .from('user_profiles')
          .update({ plan: 'free', quota_total: 100 })
          .eq('id', userId);
        console.log(`Suscripción cancelada: user ${userId} → free`);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[POST /api/mercadopago/webhook]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
