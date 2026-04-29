'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import SearchForm from './components/SearchForm';
import ActiveJobs from './components/ActiveJobs';

export default function LeadSearchExtractionPage() {
  const [refreshJobs, setRefreshJobs] = useState(0);

  const handleJobStart = () => {
    setRefreshJobs((prev) => prev + 1);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-[22px] font-700 text-foreground">Buscar Leads</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Extrae negocios locales de Google Maps con datos de contacto
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SearchForm onJobStart={handleJobStart} />
          <ActiveJobs key={refreshJobs} />
        </div>
      </div>
    </AppLayout>
  );
}
