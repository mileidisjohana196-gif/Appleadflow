'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { day: '10 Abr', leads: 42 },
  { day: '11 Abr', leads: 78 },
  { day: '12 Abr', leads: 55 },
  { day: '13 Abr', leads: 12 },
  { day: '14 Abr', leads: 8 },
  { day: '15 Abr', leads: 91 },
  { day: '16 Abr', leads: 134 },
  { day: '17 Abr', leads: 109 },
  { day: '18 Abr', leads: 67 },
  { day: '19 Abr', leads: 18 },
  { day: '20 Abr', leads: 14 },
  { day: '21 Abr', leads: 88 },
  { day: '22 Abr', leads: 143 },
  { day: '23 Abr', leads: 61 },
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

export default function LeadsChart() {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
          interval={2}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)', fontFamily: 'DM Sans' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="leads"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#leadGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#16a34a', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
