'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plane, BookOpen, TrendingUp, PlusCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-muted rounded" /></div>;
  }

  if (!session || user?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage flights, bookings, and view reports</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/flights" className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
          <Plane className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Manage Flights</h3>
          <p className="text-sm text-muted-foreground">Add, edit, or cancel flights</p>
        </Link>

        <Link href="/admin/flights/new" className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
          <PlusCircle className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Add Flight</h3>
          <p className="text-sm text-muted-foreground">Create a new flight for any airline</p>
        </Link>

        <Link href="/admin/bookings" className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
          <BookOpen className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-2">All Bookings</h3>
          <p className="text-sm text-muted-foreground">View and manage all bookings</p>
        </Link>

        <Link href="/admin/revenue" className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
          <TrendingUp className="h-10 w-10 text-primary mb-4" />
          <h3 className="font-semibold mb-2">Revenue Reports</h3>
          <p className="text-sm text-muted-foreground">View revenue by airline, flight, and class</p>
        </Link>
      </div>
    </div>
  );
}
