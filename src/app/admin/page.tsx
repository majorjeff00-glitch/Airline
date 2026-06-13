'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plane, BookOpen, TrendingUp, PlusCircle, DollarSign, Calendar, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [revenue, setRevenue] = useState<any>(null);

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      fetch('/api/admin/revenue').then(r => r.ok && r.json()).then(setRevenue).catch(() => {});
    }
  }, [status, user]);

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-muted rounded-2xl" /></div>;
  }

  if (!session || user?.role !== 'ADMIN') redirect('/login');

  const kpis = [
    { label: 'Total Revenue', value: `$${revenue?.totalRevenue?.toFixed(2) || '0.00'}`, icon: DollarSign, trend: '+12%' },
    { label: 'Total Bookings', value: String(revenue?.totalBookings || 0), icon: BookOpen, trend: '+5%' },
    { label: 'Active Airlines', value: String(Object.keys(revenue?.revenueByAirline || {}).length || 3), icon: Plane, trend: '0%' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage your multi-airline platform</p>
        </div>
        <Link href="/admin/flights/new" className="btn-primary text-sm">
          <PlusCircle className="h-4 w-4" /> Add Flight
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                <kpi.icon className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="text-xs font-medium text-status-confirmed bg-status-confirmed/10 px-2 py-0.5 rounded-full">
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold font-display">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/flights" className="border rounded-xl p-6 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <Plane className="h-8 w-8 text-brand-primary mb-3" />
          <h3 className="font-display font-semibold mb-1">Manage Flights</h3>
          <p className="text-xs text-muted-foreground">Add, edit, or cancel flights across all airlines</p>
        </Link>
        <Link href="/admin/flights/new" className="border rounded-xl p-6 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <PlusCircle className="h-8 w-8 text-brand-primary mb-3" />
          <h3 className="font-display font-semibold mb-1">Add Flight</h3>
          <p className="text-xs text-muted-foreground">Create a new flight for any airline</p>
        </Link>
        <Link href="/admin/bookings" className="border rounded-xl p-6 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <BookOpen className="h-8 w-8 text-brand-primary mb-3" />
          <h3 className="font-display font-semibold mb-1">All Bookings</h3>
          <p className="text-xs text-muted-foreground">View and manage bookings with filters</p>
        </Link>
        <Link href="/admin/revenue" className="border rounded-xl p-6 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <TrendingUp className="h-8 w-8 text-brand-primary mb-3" />
          <h3 className="font-display font-semibold mb-1">Revenue Reports</h3>
          <p className="text-xs text-muted-foreground">Revenue by airline, flight, class, and trends</p>
        </Link>
      </div>
    </div>
  );
}
