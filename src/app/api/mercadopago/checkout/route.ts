import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_CONFIG: Record<string, { title: string; price: number }> = {
  starter:    { title: 'LeadFlow Starter — 1 mes', price: 9  },
  pro:        { title: 'LeadFlow Pro — 1 mes',     price: 19 },
  enterprise: { title: 'LeadFlow Enterprise — 1 mes', price: 49 },
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

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [{
          title: config.title,
          quantity: 1,
          unit_price: config.price,
          currency_id: 'USD',
        }],
        payer: { email: user.email },
        back_urls: {
          success: process.env.NEXT_PUBLIC_APP_URL + '/leads-dashboard?upgraded=true',
          failure: process.env.NEXT_PUBLIC_APP_URL + '/pricing?error=payment_failed',
          pending: process.env.NEXT_PUBLIC_APP_URL + '/pricing?status=pending',
        },
        auto_return: 'approved',
        external_reference: user.id + '|' + plan,
        notification_url: process.env.NEXT_PUBLIC_APP_URL + '/api/mercadopago/webhook',
      }),
    });

    if (!mpResponse.ok) {
      const err = await mpResponse.json();
      console.error('Mercado Pago error:', JSON.stringify(err));
      return NextResponse.json({ error: 'Error al crear preferencia de pago' }, { status: 500 });
    }

    const data = await mpResponse.json();
    return NextResponse.json({ url: data.init_point });
  } catch (err) {
    console.error('[POST /api/mercadopago/checkout]', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
