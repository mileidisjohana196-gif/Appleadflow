'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Download, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string;
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
      const params = new URLSearchParams({
        page: String(page),
        limit: String(perPage),
      });
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

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleExport = async () => {
    try {
      const ids = selected.size > 0 ? Array.from(selected) : [];
      const res = await fetch('/api/leads/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('Error al exportar');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leadflow-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exportado correctamente');
    } catch (err) {
      toast.error('Error al exportar');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/leads/' + id, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setTotal((prev) => prev - 1);
      toast.success('Lead eliminado');
    } catch (err) {
      toast.error('Error al eliminar lead');
      console.error(err);
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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-[15px] font-600 text-foreground">Mis Leads</h2>
          <p className="text-[12px] text-muted-foreground">{total} leads en total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 h-8 text-[13px] bg-muted border border-border rounded-md outline-none focus:border-primary w-48"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 h-8 px-3 text-[13px] font-500 border border-border rounded-md hover:bg-muted transition-colors"
          >
            <Download size={14} />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <p className="text-[15px] font-500 text-foreground mb-1">Sin leads aún</p>
          <p className="text-[13px] text-muted-foreground">Extrae leads desde la sección Buscar Leads</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={selected.size === leads.length && leads.length > 0}
                    onChange={() => {
                      if (selected.size === leads.length) {
                        setSelected(new Set());
                      } else {
                        setSelected(new Set(leads.map((l) => l.id)));
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-2.5 text-left font-500 text-muted-foreground">Nombre</th>
                <th className="px-4 py-2.5 text-left font-500 text-muted-foreground">Industria</th>
                <th className="px-4 py-2.5 text-left font-500 text-muted-foreground">Ciudad</th>
                <th className="px-4 py-2.5 text-left font-500 text-muted-foreground">Teléfono</th>
                <th className="px-4 py-2.5 text-left font-500 text-muted-foreground">Email</th>
                <th className="px-4 py-2.5 text-left font-500 text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(lead.id)}
                      onChange={() => toggleRow(lead.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-500 text-foreground">{lead.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.industry ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.city ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="p-1.5 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                    >
                      <Trash2 size={14} />
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
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
