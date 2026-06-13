'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { TrendingUp, DollarSign, Calendar, Plane, BarChart3 } from 'lucide-react';

export default function RevenuePage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) redirect('/login');
  }, [status, user]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/revenue');
      if (res.ok) setData(await res.json());
      setLoading(false);
    };
    if (status === 'authenticated' && user?.role === 'ADMIN') load();
  }, [status, user]);

  if (status === 'loading' || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/4" /><div className="grid grid-cols-3 gap-4"><div className="h-32 bg-muted rounded-xl" /><div className="h-32 bg-muted rounded-xl" /><div className="h-32 bg-muted rounded-xl" /></div></div></div>;
  }

  if (!data) return null;

  const kpis = [
    { label: 'Total Revenue', value: `$${data.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-status-confirmed' },
    { label: 'Total Bookings', value: String(data.totalBookings), icon: BarChart3, color: 'text-brand-primary' },
    { label: 'Avg per Booking', value: `$${data.totalBookings > 0 ? (data.totalRevenue / data.totalBookings).toFixed(2) : '0.00'}`, icon: TrendingUp, color: 'text-status-checkedin' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Revenue Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                <kpi.icon className="h-5 w-5 text-brand-primary" />
              </div>
            </div>
            <p className={`text-2xl font-bold font-display ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-xl p-6 bg-card">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><Plane className="h-4 w-4" /> Revenue by Airline</h2>
          <div className="space-y-4">
            {Object.entries(data.revenueByAirline).map(([airline, revenue]: [string, any]) => (
              <div key={airline}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{airline}</span>
                  <span className="font-semibold text-brand-primary">${(revenue as number).toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: `${Math.min(100, (revenue as number) / data.totalRevenue * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-xl p-6 bg-card">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Revenue by Class</h2>
          <div className="space-y-4">
            {Object.entries(data.revenueByClass).map(([cls, revenue]: [string, any]) => (
              <div key={cls}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium capitalize">{cls.toLowerCase()}</span>
                  <span className="font-semibold text-brand-primary">${(revenue as number).toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (revenue as number) / Object.values(data.revenueByClass).reduce((a: number, b: any) => a + (b as number), 0) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><Calendar className="h-4 w-4" /> Bookings Per Day</h2>
        {data.bookingsPerDay.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No booking data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b">
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-right py-3 font-medium">Bookings</th>
                  <th className="text-right py-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.bookingsPerDay.map((item: any, i: number) => (
                  <tr key={item.date} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="py-3 text-sm">{item.date}</td>
                    <td className="py-3 text-right font-medium">{item.count}</td>
                    <td className="py-3 text-right">
                      {i > 0 && item.count > data.bookingsPerDay[i - 1].count ? (
                        <span className="text-status-confirmed text-xs">↑ +{item.count - data.bookingsPerDay[i - 1].count}</span>
                      ) : i > 0 && item.count < data.bookingsPerDay[i - 1].count ? (
                        <span className="text-status-cancelled text-xs">↓ {item.count - data.bookingsPerDay[i - 1].count}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
