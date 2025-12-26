'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SPORTS, Sport } from '@/lib/types';

interface DailyAccuracy {
  date: string;
  accuracy: number;
  total: number;
}

interface SportStat {
  sport: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface ConfidenceTier {
  name: string;
  min: number;
  max: number;
  total: number;
  correct: number;
  accuracy: number;
}

interface AccuracyChartProps {
  dailyAccuracy: DailyAccuracy[];
  sportStats: SportStat[];
  confidenceTiers: ConfidenceTier[];
}

export function AccuracyChart({
  dailyAccuracy,
  sportStats,
  confidenceTiers,
}: AccuracyChartProps) {
  // Format date for display
  const formattedDailyData = dailyAccuracy.map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  // Add sport icons/colors
  const formattedSportStats = sportStats.map(s => ({
    ...s,
    name: SPORTS[s.sport as Sport]?.name || s.sport,
    color: SPORTS[s.sport as Sport]?.color || '#666',
    icon: SPORTS[s.sport as Sport]?.icon || '',
  }));

  return (
    <div className="space-y-6">
      {/* Daily Accuracy Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Accuracy Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedDailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Accuracy']}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Accuracy by Sport */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedSportStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, _name, props) => {
                      const payload = props?.payload as { correct: number; total: number } | undefined;
                      return [
                        `${Number(value).toFixed(1)}% (${payload?.correct ?? 0}/${payload?.total ?? 0})`,
                        'Accuracy',
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {formattedSportStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy by Confidence */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy by Confidence Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={confidenceTiers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value, _name, props) => {
                      const payload = props?.payload as { correct: number; total: number } | undefined;
                      return [
                        `${Number(value).toFixed(1)}% (${payload?.correct ?? 0}/${payload?.total ?? 0})`,
                        'Accuracy',
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                    {confidenceTiers.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.min >= 80
                            ? '#22c55e'
                            : entry.min >= 70
                              ? '#84cc16'
                              : entry.min >= 60
                                ? '#eab308'
                                : '#f97316'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
