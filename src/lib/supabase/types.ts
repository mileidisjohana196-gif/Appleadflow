// ============================================================
// LeadFlow — Tipos TypeScript para la base de datos Supabase
// Ubica este archivo en: src/lib/supabase/types.ts
// ============================================================

export type Plan = 'free' | 'pro' | 'enterprise';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';
export type EnrichmentStatus = 'pending' | 'verified' | 'failed';

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  quota_total: number;
  quota_used: number;
  created_at: string;
  updated_at: string;
}

export interface ExtractionJob {
  id: string;
  user_id: string;
  industry: string;
  city: string;
  radius_km: number;
  max_results: number;
  extract_email: boolean;
  extract_whatsapp: boolean;
  extract_website: boolean;
  extract_address: boolean;
  status: JobStatus;
  progress: number;
  found_count: number;
  error_msg: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  user_id: string;
  job_id: string | null;
  name: string;
  industry: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  whatsapp: boolean;
  email: string | null;
  website: string | null;
  address: string | null;
  maps_url: string | null;
  enrichment: EnrichmentStatus;
  source: string;
  extracted_at: string;
  created_at: string;
}

// Tipo para insertar un nuevo lead (sin campos auto-generados)
export type NewLead = Omit<Lead, 'id' | 'created_at'>;

// Tipo para insertar un nuevo job
export type NewJob = Omit<ExtractionJob, 'id' | 'created_at' | 'progress' | 'found_count' | 'started_at' | 'finished_at' | 'error_msg'>;
