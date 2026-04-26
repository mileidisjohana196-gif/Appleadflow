'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search, Download, Trash2, ExternalLink, ChevronUp, ChevronDown,
  ChevronsUpDown, CheckCircle2, Clock, AlertCircle, MessageCircle,
  Globe, ChevronLeft, ChevronRight, RefreshCw, Loader2,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Lead {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: boolean;
  email: string | null;
  website: string | null;
  enrichment: 'pending' | 'verified' | 'failed';
  source: string;
  extracted_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ENRICHMENT_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'destructive' | 'neutral'; icon: React.ReactNode }> = {
  verified: { label: 'Verificado', variant: 'success', icon: <CheckCircle2 size={10} /> },
  pending: { label: 'Enriqueciendo', variant: 'warning', icon: <Clock size={10} /> },
  failed: { label: 'Sin datos', variant: 'destructive', icon: <AlertCircle size={10} /> },
};

type SortField = 'name' | 'industry' | 'city' | 'extracted_at';
type SortDir = 'asc' | 'desc';

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 8, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [industries, setIndustries] = useState<string[]>(['all']);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('extracted_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
      });
      if (search) params.set('search', search);
      if (industryFilter !== 'all') params.set('industry', industryFilter);

      const res = await fetch(`/api/leads?${params}`);
      if (!res.ok) throw new Error('Error al cargar leads');
      const data = await res.json();
      setLeads(data.leads ?? []);
      setPagination(data.pagination);

      // Construir lista de industrias únicas para el filtro
      if (data.leads?.length) {
        const unique = Array.from(new Set(data.leads.map((l: Lead) => l.industry).filter(Boolean))) as string[];
        setIndustries((prev) => {
          const merged = Array.from(new Set([...prev.filter((i) => i !== 'all'), ...unique]));
          return ['all', ...merged];
        });
      }
    } catch (err) {
      toast.error('Error al cargar leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, industryFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Reset página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [search, industryFilter]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} className="text-muted-foreground/50" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const toggleAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map((l) => l.id)));
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadflow-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${selected.size} leads exportados a CSV`);
      setSelected(new Set());
    } catch {
      toast.error('Error al exportar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lead eliminado');
    } catch {
      toast.error('Error al eliminar lead');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      await Promise.all(ids.map((id) => fetch(`/api/leads/${id}`, { method: 'DELETE' })));
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
      toast.success(`${ids.length} leads eliminados`);
      setSelected(new Set());
    } catch {
      toast.error('Error al eliminar leads');
    }
  };

  const handleEnrich = () => {
    toast.success(`Enriquecimiento iniciado para ${selected.size} leads`);
    setSelected(new Set());
  };

  // Ordenar localmente los leads cargados
  const sorted = [...leads].sort((a, b) => {
    const aVal = String(a[sortField] ?? '');
    const bVal = String(b[sortField] ?? '');
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  return (
    <div className="bg-white rounded-xl border border-border shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-border">
        <div className="flex-1">
          <h2 className="text-[15px] font-600 text-foreground">Base de Leads</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">{pagination.total} leads encontrados</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad, industria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-[13px] border border-border rounded-lg bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-64 placeholder:text-muted-foreground/60"
          />
        </div>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="text-[13px] border border-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-foreground"
        >
          {industries.map((ind) => (
            <option key={`industry-filter-${ind}`} value={ind}>{ind === 'all' ? 'Todas las industrias' : ind}</option>
          ))}
        </select>
        <button
          onClick={fetchLeads}
          title="Refrescar leads"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selected.size === leads.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                />
              </th>
              {(['name', 'industry', 'city'] as SortField[]).map((field) => (
                <th key={field} className="px-4 py-3 text-left font-500 text-muted-foreground">
                  <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors capitalize">
                    {field === 'name' ? 'Nombre' : field === 'industry' ? 'Industria' : 'Ciudad'}
                    <SortIcon field={field} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left font-500 text-muted-foreground">Teléfono</th>
              <th className="px-4 py-3 text-center font-500 text-muted-foreground">WA</th>
              <th className="px-4 py-3 text-left font-500 text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-center font-500 text-muted-foreground">Web</th>
              <th className="px-4 py-3 text-left font-500 text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-500 text-muted-foreground">
                <button onClick={() => toggleSort('extracted_at')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Fecha <SortIcon field="extracted_at" />
                </button>
              </th>
              <th className="px-4 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={10} className="py-16 text-center">
                  <Loader2 size={20} className="animate-spin text-muted-foreground mx-auto" />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8">
                  <EmptyState
                    title="No hay leads aún"
                    description="Inicia una extracción para comenzar a llenar tu base de leads."
                  />
                </td>
              </tr>
            ) : (
              sorted.map((lead) => {
                const enrich = ENRICHMENT_CONFIG[lead.enrichment] ?? ENRICHMENT_CONFIG.pending;
                const isSelected = selected.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`group transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(lead.id)}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-500 text-foreground max-w-[180px] truncate">{lead.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.industry ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {lead.city}{lead.state ? `, ${lead.state}` : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-[12px]">{lead.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {lead.whatsapp ? (
                        <MessageCircle size={15} className="text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground/30 text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline truncate block max-w-[180px] text-[12px]" title={lead.email}>
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {lead.website ? (
                        <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={`Visitar ${lead.website}`}>
                          <Globe size={14} className="mx-auto" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground/30 text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={enrich.variant} dot>{enrich.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {new Date(lead.extracted_at).toLocaleDateString('es-MX')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button title="Ver detalles" className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                          <ExternalLink size={13} />
                        </button>
                        <button title="Re-enriquecer" className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                          <RefreshCw size={13} />
                        </button>
                        <button
                          title="Eliminar lead"
                          onClick={() => handleDelete(lead.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
        <p className="text-[12px] text-muted-foreground">
          Mostrando {Math.min((page - 1) * perPage + 1, pagination.total)}–{Math.min(page * perPage, pagination.total)} de {pagination.total} leads
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: Math.min(pagination.pages, 7) }).map((_, i) => (
            <button
              key={`page-${i + 1}`}
              onClick={() => setPage(i + 1)}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-[12px] font-500 transition-all ${
                page === i + 1 ? 'bg-primary text-white' : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-xl shadow-modal px-5 py-3 flex items-center gap-4 transition-all duration-300 ${selected.size > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
        <span className="text-[13px] font-500">{selected.size} leads seleccionados</span>
        <div className="w-px h-4 bg-white/20" />
        <button onClick={handleExport} className="flex items-center gap-1.5 text-[13px] font-500 text-green-400 hover:text-green-300 transition-colors">
          <Download size={14} />Exportar CSV
        </button>
        <button onClick={handleEnrich} className="flex items-center gap-1.5 text-[13px] font-500 text-blue-400 hover:text-blue-300 transition-colors">
          <RefreshCw size={14} />Enriquecer
        </button>
        <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-[13px] font-500 text-red-400 hover:text-red-300 transition-colors">
          <Trash2 size={14} />Eliminar
        </button>
        <button onClick={() => setSelected(new Set())} className="text-[12px] text-white/50 hover:text-white transition-colors ml-2">
          Cancelar
        </button>
      </div>
    </div>
  );
}
