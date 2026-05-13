'use client';
import React, { useState } from 'react';
import { X, Copy, Check, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string; name: string; industry: string | null; city: string | null;
  phone: string | null; email: string | null; website: string | null; whatsapp: boolean;
}
interface Analysis {
  research: string; score: number; score_reason: string;
  email_subject: string; email_body: string;
  sequence: Array<{ day: number; action: string; message: string }>;
}
interface Props { lead: Lead; onClose: () => void; }

function quickScore(lead: Lead): number {
  let s = 0;
  if (lead.phone) s += 25;
  if (lead.whatsapp) s += 20;
  if (lead.email) s += 30;
  if (lead.website) s += 25;
  return s;
}

export default function AiAnalysisModal({ lead, onClose }: Props) {
  const [loading, setLoading]     = useState(false);
  const [analysis, setAnalysis]   = useState<Analysis | null>(null);
  const [copied, setCopied]       = useState(false);
  const [tab, setTab]             = useState<'research' | 'email' | 'sequence'>('research');

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/leads/${lead.id}/analyze`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al analizar');
      setAnalysis(data.analysis);
      setTab('research');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(`Asunto: ${analysis.email_subject}\n\n${analysis.email_body}`);
    setCopied(true);
    toast.success('Email copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = (s: number) => s >= 70 ? 'text-emerald-500' : s >= 40 ? 'text-amber-500' : 'text-red-400';
  const scoreBg    = (s: number) => s >= 70 ? 'bg-emerald-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-400';

  const qs = quickScore(lead);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-foreground">Análisis IA</p>
              <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">{lead.name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!analysis ? (
            <>
              {/* Quick score */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-foreground">Score de datos</p>
                  <span className={`text-[14px] font-black ${scoreColor(qs)}`}>{qs}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(qs)} transition-all`} style={{ width: `${qs}%` }} />
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: 'Teléfono', ok: !!lead.phone },
                    { label: 'WhatsApp', ok: lead.whatsapp },
                    { label: 'Email',    ok: !!lead.email  },
                    { label: 'Web',      ok: !!lead.website},
                  ].map(item => (
                    <span key={item.label}
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${item.ok
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border-border'}`}>
                      {item.ok ? '✓' : '✗'} {item.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center py-6 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Zap size={26} className="text-primary" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground mb-1">Analiza este lead con Gemini</p>
                  <p className="text-[12px] text-muted-foreground max-w-xs leading-relaxed">
                    Investigación del negocio, score de conversión y un email personalizado listo para enviar.
                  </p>
                </div>
                <button onClick={handleAnalyze} disabled={loading}
                  className="flex items-center gap-2 px-7 py-2.5 bg-primary text-primary-foreground rounded-xl text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Analizando...</>
                    : <><Zap size={14} /> Analizar con IA</>}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Score */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-center shrink-0">
                  <div className={`text-3xl font-black ${scoreColor(analysis.score)}`}>{analysis.score}</div>
                  <div className="text-[10px] text-muted-foreground">/100</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 rounded-full bg-border overflow-hidden mb-1.5">
                    <div className={`h-full rounded-full ${scoreBg(analysis.score)}`} style={{ width: `${analysis.score}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{analysis.score_reason}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex rounded-xl bg-muted/50 p-1 gap-1">
                {(['research', 'email', 'sequence'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      tab === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                    {t === 'research' ? 'Investigación' : t === 'email' ? 'Email' : 'Secuencia'}
                  </button>
                ))}
              </div>

              {tab === 'research' && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border">
                  <p className="text-[13px] text-foreground leading-relaxed">{analysis.research}</p>
                </div>
              )}

              {tab === 'email' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Asunto</p>
                    <p className="text-[13px] text-foreground font-medium">{analysis.email_subject}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide font-semibold">Mensaje</p>
                    <p className="text-[12px] text-foreground leading-relaxed whitespace-pre-wrap">{analysis.email_body}</p>
                  </div>
                  <button onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-[13px] font-semibold transition-colors">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copiado' : 'Copiar email completo'}
                  </button>
                </div>
              )}

              {tab === 'sequence' && (
                <div className="space-y-2">
                  {analysis.sequence.map((step, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/20 border border-border">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-[11px] font-bold text-primary">
                        D{step.day}
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">{step.action}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{step.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={handleAnalyze} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-border text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                {loading ? 'Regenerando...' : 'Regenerar análisis'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
