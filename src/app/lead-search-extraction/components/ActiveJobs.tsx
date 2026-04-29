'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Clock, Loader2, AlertCircle, ChevronDown, MapPin, Building2, Download } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

interface Job {
  id: string;
  industry: string;
  city: string;
  max_results: number;
  status: 'running' | 'completed' | 'failed' | 'queued';
  progress: number;
  found_count: number;
  created_at: string;
  finished_at?: string | null;
}

const STATUS_CONFIG: Record<Job['status'], { label: string; variant: 'success' | 'warning' | 'destructive' | 'info' | 'neutral'; icon: React.ReactNode }> = {
  running: { label: 'Extrayendo', variant: 'info', icon: <Loader2 size={10} className="animate-spin" /> },
  completed: { label: 'Completado', variant: 'success', icon: <CheckCircle2 size={10} /> },
  failed: { label: 'Error', variant: 'destructive', icon: <AlertCircle size={10} /> },
  queued: { label: 'En cola', variant: 'neutral', icon: <Clock size={10} /> },
};

interface ActiveJobsProps {
  newJob: { id: string; industry: string; city: string; maxResults: number } | null;
}

export default function ActiveJobs({ newJob }: ActiveJobsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;
      const { jobs: data } = await res.json();
      setJobs(data ?? []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Polling cada 4 segundos si hay jobs activos
  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === 'running' || j.status === 'queued');
    if (hasActive) {
      pollingRef.current = setInterval(fetchJobs, 4000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [jobs, fetchJobs]);

  // Cuando llega un nuevo job desde SearchForm, refrescar lista
  useEffect(() => {
    if (newJob) {
      fetchJobs();
    }
  }, [newJob, fetchJobs]);

  // Notificar cuando un job pasa a completado
  useEffect(() => {
    jobs.forEach((job) => {
      if (job.status === 'completed') {
        // Usamos sessionStorage para no repetir el toast en cada render
        const key = `notified-${job.id}`;
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          toast.success(`Extracción completada: ${job.industry} en ${job.city} — ${job.found_count} leads`);
        }
      }
    });
  }, [jobs]);

  const handleExportJob = async (job: Job) => {
    try {
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, ids: [], format: 'pdf' }),
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadflow-${job.industry}-${job.city}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${job.found_count} reporte descargado — ábrelo en el navegador e imprime como PDF`);
    } catch {
      toast.error('Error al exportar leads');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-card p-8 flex items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-card">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-600 text-foreground">Trabajos de extracción</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {jobs.filter((j) => j.status === 'running').length} activo · {jobs.filter((j) => j.status === 'completed').length} completados
          </p>
        </div>
        <span className="text-[11px] font-500 text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{jobs.length} total</span>
      </div>

      {jobs.length === 0 ? (
        <div className="p-10 text-center text-[13px] text-muted-foreground">
          Aún no has iniciado ninguna extracción.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {jobs.map((job) => {
            const statusConf = STATUS_CONFIG[job.status];
            const isExpanded = expandedJob === job.id;
            return (
              <div key={job.id} className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    job.status === 'completed' ? 'bg-green-50' :
                    job.status === 'running' ? 'bg-blue-50' :
                    job.status === 'failed' ? 'bg-red-50' : 'bg-muted'
                  }`}>
                    {job.status === 'running' ? <Loader2 size={16} className="text-blue-500 animate-spin" /> :
                     job.status === 'completed' ? <CheckCircle2 size={16} className="text-green-500" /> :
                     job.status === 'failed' ? <AlertCircle size={16} className="text-red-500" /> :
                     <Clock size={16} className="text-muted-foreground" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-[14px] font-600 text-foreground">{job.industry}</p>
                      <Badge variant={statusConf.variant} dot>{statusConf.label}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground mb-2">
                      <span className="flex items-center gap-1"><MapPin size={11} />{job.city}</span>
                      <span className="flex items-center gap-1"><Building2 size={11} />{job.found_count} / {job.max_results} leads</span>
                      <span>{formatDate(job.created_at)}</span>
                    </div>

                    {job.status !== 'queued' && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-muted-foreground font-mono">{job.progress}%</span>
                          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">{job.found_count} leads</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              job.status === 'failed' ? 'bg-red-400' : job.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {job.status === 'completed' && (
                      <>
                        <button
                          onClick={() => handleExportJob(job)}
                          title="Exportar leads de este trabajo a CSV"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-green-50 hover:text-green-600 transition-all"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                          title="Ver leads extraídos"
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                          <ChevronDown size={13} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && job.status === 'completed' && (
                  <div className="mt-3 ml-13 pl-2 border-l-2 border-primary/20 animate-slide-up">
                    <p className="text-[11px] font-500 text-muted-foreground uppercase tracking-wide mb-1">
                      {job.found_count} leads guardados — exporta el CSV para verlos todos
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
