'use client';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/AppLayout';
import KPIGrid from './components/KPIGrid';
import LeadsTable from './components/LeadsTable';

const LeadsChart = dynamic(() => import('./components/LeadsChart'), { ssr: false });
const IndustryChart = dynamic(() => import('./components/IndustryChart'), { ssr: false });

export default function LeadsDashboardPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <KPIGrid />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeadsChart />
          <IndustryChart />
        </div>
        <LeadsTable />
      </div>
    </AppLayout>
  );
}
