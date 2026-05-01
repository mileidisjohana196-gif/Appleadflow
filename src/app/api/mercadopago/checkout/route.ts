import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_CONFIG: Record<string, { title: string; price: number }> = {
  starter:    { title: 'LeadFlow Starter',    price: 9  },
  pro:        { title: 'LeadFlow Pro',        price: 19 },
  enterprise: { title: 'LeadFlow Enterprise', price: 49 },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { plan } = await request.json();
    const config = PLAN_CONFIG[plan];
    if (!config) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        reason: config.title,
        external_reference: `${user.id}|${plan}`,
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: config.price,
          currency_id: 'USD',
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/leads-dashboard?upgraded=true`,
        notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
        status: 'pending',
      }),
    });

    if (!mpResponse.ok) {
      const err = await mpResponse.json();
      console.error('Mercado Pago error:', err);
      return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 });
    }

    const data = await mpResponse.json();
    return NextResponse.json({ url: data.init_point });
  } catch (err) {
    console.error('[POST /api/mercadopago/checkout]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
