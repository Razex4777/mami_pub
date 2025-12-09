import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/layout/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  formatCurrency: (amount: number) => string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, formatCurrency }) => {
  return (
    <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
      {/* Subtle animated background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700 hidden sm:block" />
      
      <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <CardTitle className="text-sm sm:text-base md:text-lg">Revenue Overview</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">Monthly revenue trends</CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 p-3 sm:p-4 md:p-6 pt-0">
        <ResponsiveContainer width="100%" height={200} className="sm:h-[250px] md:h-[300px]">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
              width={40}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(value as number) : value,
                name === 'revenue' ? 'Revenue' : 'Orders'
              ]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#revenueGradient)"
              animationDuration={1500}
              animationBegin={0}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
