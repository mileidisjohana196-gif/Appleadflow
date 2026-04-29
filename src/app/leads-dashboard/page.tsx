'use client';
import AppLayout from '@/components/AppLayout';
import KPIGrid from './components/KPIGrid';

export default function LeadsDashboardPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <KPIGrid />
      </div>
    </AppLayout>
  );
}
