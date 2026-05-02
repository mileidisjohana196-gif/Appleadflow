'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Download, Trash2, ChevronLeft, ChevronRight, Loader2, FileText, Star, Copy } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: boolean;
  email: string | null;
  website: string | null;
  favorite: boolean;
  extracted_at: string;
}

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const perPage = 10;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(perPage) });
      if (search) params.set('search', search);
      const res = await fetch('/api/leads?' + params.toString());
      if (!res.ok) throw new Error('Error al cargar leads');
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch (err) {
      toast.error('Error al cargar leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { setPage(1); }, [search]);

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const ids = selected.size > 0 ? Array.from(selected) : [];
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, format }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'pdf' ? 'leadflow-leads.html' : 'leadflow-leads.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(format === 'pdf' ? 'Reporte descargado' : 'CSV exportado');
    } catch {
      toast.error('Error al exportar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/leads/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setTotal((prev) => prev - 1);
      toast.success('Lead eliminado');
    } catch {
      toast.error('Error al eliminar lead');
    }
  };

  const handleToggleFavorite = async (lead: Lead) => {
    const method = lead.favorite ? 'DELETE' : 'POST';
    try {
      await fetch('/api/leads/' + lead.id + '/favorite', { method });
      setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, favorite: !l.favorite } : l));
      toast.success(lead.favorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    } catch {
      toast.error('Error al actualizar favorito');
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between bg-card">
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Mis Leads</h2>
          <p className="text-[12px] text-muted-foreground">
            {selected.size > 0 ? `${selected.size} seleccionados · ` : ''}{total} en total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-[13px] bg-background border border-border rounded-lg outline-none focus:border-primary w-44 transition-colors"
            />
          </div>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Download size={13} />CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium bg-primary text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText size={13} />Reporte
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={22} className="animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center mb-3">
            <Search size={20} className="text-primary" />
          </div>
          <p className="text-[14px] font-semibold text-foreground mb-1">Sin leads aún</p>
          <p className="text-[12px] text-muted-foreground">Extrae leads desde la sección Buscar Leads</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === leads.length && leads.length > 0}
                    onChange={() => selected.size === leads.length ? setSelected(new Set()) : setSelected(new Set(leads.map(l => l.id)))}
                    className="rounded accent-primary cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wide uppercase text-[10.5px]">Negocio</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wide uppercase text-[10.5px]">Industria</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wide uppercase text-[10.5px]">Ciudad</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wide uppercase text-[10.5px]">Teléfono</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wide uppercase text-[10.5px]">WA</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground tracking-wide uppercase text-[10.5px]">Web</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleRow(lead.id)}
                      className="rounded accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleFavorite(lead)}
                      className="p-1 rounded-lg transition-colors"
                    >
                      <Star
                        size={14}
                        className={lead.favorite ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/40 hover:text-amber-400'}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground truncate max-w-[180px]">{lead.name}</p>
                    {lead.email && <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{lead.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary">
                      {lead.industry ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground font-mono text-[11.5px]">{lead.phone ?? '—'}</span>
                      {lead.phone && (
                        <button onClick={() => { navigator.clipboard.writeText(lead.phone!); toast.success('Teléfono copiado'); }}
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground/50 hover:text-muted-foreground">
                          <Copy size={11} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.whatsapp
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Sí</span>
                      : <span className="text-muted-foreground text-[11px]">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    {lead.website ? (
                      <div className="flex items-center gap-1">
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-[11px] truncate max-w-[80px] block">
                          {lead.website.replace(/https?:\/\/(www\.)?/, '').slice(0, 18)}...
                        </a>
                        <button onClick={() => { navigator.clipboard.writeText(lead.website!); toast.success('URL copiada'); }}
                          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground/50 hover:text-muted-foreground shrink-0">
                          <Copy size={11} />
                        </button>
                      </div>
                    ) : <span className="text-muted-foreground text-[11px]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/10">
          <p className="text-[12px] text-muted-foreground">Página {page} de {totalPages} · {total} leads</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
