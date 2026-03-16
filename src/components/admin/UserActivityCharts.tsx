"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface ChartData {
  date?: string;
  week?: string;
  users: number;
}

interface UserActivityChartsProps {
  dauData: ChartData[];
  wauData: ChartData[];
}

export function UserActivityCharts({ dauData, wauData }: UserActivityChartsProps) {
  // Format the dates for DAU chart to be more readable
  const formattedDau = useMemo(() => {
    return dauData.map(d => ({
      ...d,
      displayDate: d.date ? new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
    }));
  }, [dauData]);

  // Format the weeks for WAU chart
  const formattedWau = useMemo(() => {
    return wauData.map(d => {
      let displayWeek = d.week ?? '';
      if (d.week) {
        const parsed = new Date(d.week);
        displayWeek = isNaN(parsed.getTime()) 
          ? d.week  // Use the raw label if it can't be parsed
          : parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }

      return { ...d, displayWeek };
    });
  }, [wauData]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* DAU Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Active Users (30d)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedDau} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   width={40}
                   tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--foreground)'
                  }} 
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="var(--primary)" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* WAU Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Active Users (8w)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedWau} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
                <XAxis 
                  dataKey="displayWeek" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   width={40}
                   tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--foreground)'
                  }} 
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Bar 
                  dataKey="users" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TrafficIntensityChartProps {
  data: { date: string; views: number }[];
}

export function TrafficIntensityChart({ data }: TrafficIntensityChartProps) {
  const formattedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      displayDate: d.date ? new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''
    }));
  }, [data]);

  return (
    <div className="rounded-lg border bg-card p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Traffic Intensity (30d)</h3>
      <div className="h-64 w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              interval="preserveStartEnd"
            />
            <YAxis 
               axisLine={false} 
               tickLine={false} 
               width={40}
               tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            />
            <Tooltip 
              cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--foreground)'
              }} 
              itemStyle={{ color: 'var(--primary)' }}
            />
            <Bar 
              dataKey="views" 
              fill="var(--primary)" 
              opacity={0.3}
              radius={[2, 2, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
