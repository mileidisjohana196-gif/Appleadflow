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
    if (authError || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { data: lead, error } = await supabase
      .from('leads').select('*').eq('id', id).eq('user_id', user.id).single();
    if (error || !lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });

    const prompt = `Eres un experto en ventas B2B para el mercado latinoamericano.

Analiza este negocio y responde SOLO con JSON válido, sin markdown ni texto extra:

NEGOCIO: ${lead.name}
INDUSTRIA: ${lead.industry ?? 'No especificada'}
CIUDAD: ${lead.city ?? 'No especificada'}
TELÉFONO: ${lead.phone ?? 'No disponible'}
EMAIL: ${lead.email ?? 'No disponible'}
SITIO WEB: ${lead.website ?? 'No disponible'}

Estructura JSON requerida:
{
  "research": "2-3 oraciones sobre el negocio, sus necesidades probables y principal punto de dolor",
  "score": numero del 0 al 100 según potencial de conversión,
  "score_reason": "una línea explicando el score",
  "email_subject": "asunto del email de prospección",
  "email_body": "email personalizado de máximo 120 palabras, español, tono profesional y cercano",
  "sequence": [
    {"day": 1, "action": "Email inicial", "message": "descripción de la acción"},
    {"day": 3, "action": "WhatsApp de seguimiento", "message": "descripción de la acción"},
    {"day": 7, "action": "Segunda llamada o email", "message": "descripción de la acción"}
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const geminiData = await res.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(clean);

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('[POST /api/leads/[id]/analyze]', error);
    return NextResponse.json({ error: 'Error al analizar lead' }, { status: 500 });
  }
}
