'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const industryData = [
  { industry: 'Restaurantes', count: 312 },
  { industry: 'Dentistas', count: 198 },
  { industry: 'Gimnasios', count: 154 },
  { industry: 'Ferreterías', count: 143 },
  { industry: 'Hoteles', count: 127 },
  { industry: 'Abogados', count: 98 },
  { industry: 'Peluquerías', count: 87 },
  { industry: 'Talleres', count: 71 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border rounded-lg shadow-card-hover px-3 py-2">
        <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
        <p className="text-[14px] font-700 text-foreground tabular-nums">{payload[0].value} leads</p>
      </div>
    );
  }
  return null;
};

export default function IndustryChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={industryData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
        <XAxis
          dataKey="industry"
          tick={{ fontSize: 10, fill: 'hsl(220 9% 46%)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={44}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {industryData.map((entry, index) => (
            <Cell
              key={`cell-${entry.industry}`}
              fill={index === 0 ? '#16a34a' : index === 1 ? '#22c55e' : '#86efac'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
