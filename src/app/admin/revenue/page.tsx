'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function RevenuePage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) {
      redirect('/login');
    }
  }, [status, user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/admin/revenue');
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (error) {
        console.error('Error loading revenue:', error);
      } finally {
        setLoading(false);
      }
    };
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      loadData();
    }
  }, [status, user]);

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Revenue Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 text-primary mb-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">Total Revenue</span>
          </div>
          <div className="text-3xl font-bold">${data.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 text-primary mb-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-medium">Total Bookings</span>
          </div>
          <div className="text-3xl font-bold">{data.totalBookings}</div>
        </div>
        <div className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Avg per Booking</span>
          </div>
          <div className="text-3xl font-bold">
            ${data.totalBookings > 0 ? (data.totalRevenue / data.totalBookings).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Revenue by Airline</h2>
          <div className="space-y-3">
            {Object.entries(data.revenueByAirline).map(([airline, revenue]: [string, any]) => (
              <div key={airline} className="flex items-center justify-between">
                <span className="font-medium">{airline}</span>
                <span className="text-primary font-semibold">${(revenue as number).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6 bg-card">
          <h2 className="text-lg font-semibold mb-4">Revenue by Class</h2>
          <div className="space-y-3">
            {Object.entries(data.revenueByClass).map(([cls, revenue]: [string, any]) => (
              <div key={cls} className="flex items-center justify-between">
                <span className="font-medium">{cls}</span>
                <span className="text-primary font-semibold">${(revenue as number).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="text-lg font-semibold mb-4">Bookings Per Day</h2>
        {data.bookingsPerDay.length === 0 ? (
          <p className="text-muted-foreground">No booking data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {data.bookingsPerDay.map((item: any) => (
                  <tr key={item.date} className="border-b">
                    <td className="py-2">{item.date}</td>
                    <td className="py-2 text-right font-medium">{item.count}</td>
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
