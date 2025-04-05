'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface RevenueChartProps {
  data: {
    thisMonth: number;
  };
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = [
    {
      name: 'This Month',
      revenue: data.thisMonth,
    },
  ];

  if (data.thisMonth === 0 ) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No revenue data available</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => `Rp ${value.toLocaleString()}`}
          />
          <Tooltip 
            formatter={(value) => [`Rp ${(Number(value)).toLocaleString()}`, 'Revenue']}
          />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}