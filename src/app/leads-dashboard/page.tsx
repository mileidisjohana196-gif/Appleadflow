'use client';
import AppLayout from '@/components/AppLayout';
import KPIGrid from './components/KPIGrid';
import LeadsTable from './components/LeadsTable';

export default function LeadsDashboardPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <KPIGrid />
        <LeadsTable />
      </div>
    </AppLayout>
  );
}
