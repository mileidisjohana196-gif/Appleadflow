'use client';

import React, { useState } from 'react';
import { Copy, Check, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface CredentialsBoxProps {
  onAutofill: (email: string, password: string) => void;
}

const DEMO_ACCOUNTS = [
  { role: 'Admin Pro', email: 'marco@leadflow.mx', password: 'LeadFlow2026!' },
  { role: 'Free User', email: 'sofia@agenciamx.com', password: 'LeadFlow2026!' },
];

export default function CredentialsBox({ onAutofill }: CredentialsBoxProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(key);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <KeyRound size={13} className="text-muted-foreground" />
        <p className="text-[12px] font-600 text-muted-foreground uppercase tracking-wide">Cuentas demo</p>
      </div>
      <div className="space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <div
            key={`demo-${account.email}`}
            className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2.5 border border-border hover:border-primary/40 transition-all cursor-pointer group"
            onClick={() => onAutofill(account.email, account.password)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onAutofill(account.email, account.password); }}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-600 text-primary mb-0.5">{account.role}</p>
              <p className="text-[12px] text-foreground font-mono truncate">{account.email}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); copyToClipboard(account.email, `email-${account.email}`); }}
                className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-primary transition-colors"
                title="Copiar email"
                aria-label="Copiar email"
              >
                {copiedField === `email-${account.email}` ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
              </button>
              <span className="text-[11px] font-600 text-green-600 bg-green-50 px-2 py-0.5 rounded group-hover:bg-green-100 transition-colors">
                Usar →
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2.5 text-center">Haz clic en una cuenta para autocompletar el formulario</p>
    </div>
  );
}