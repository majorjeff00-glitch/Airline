'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { getStatusColor, getAirlineColor } from '@/lib/utils';
import { Search } from 'lucide-react';

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    airline: '',
    flightNumber: '',
    pnr: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) {
      redirect('/login');
    }
  }, [status, user]);

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      loadBookings();
    }
  }, [status, user]);

  const loadBookings = async (appliedFilters?: any) => {
    setLoading(true);
    try {
      const f = appliedFilters || filters;
      const params = new URLSearchParams();
      if (f.airline) params.set('airline', f.airline);
      if (f.flightNumber) params.set('flightNumber', f.flightNumber);
      if (f.pnr) params.set('pnr', f.pnr);
      if (f.status) params.set('status', f.status);
      if (f.dateFrom) params.set('dateFrom', f.dateFrom);
      if (f.dateTo) params.set('dateTo', f.dateTo);

      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const handleBoard = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'board' }),
      });
      if (res.ok) {
        loadBookings();
      }
    } catch (error) {
      console.error('Board error:', error);
    }
  };

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-muted rounded" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Bookings</h1>

      <form onSubmit={handleFilter} className="bg-card border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Airline"
            value={filters.airline}
            onChange={(e) => setFilters((p) => ({ ...p, airline: e.target.value }))}
            className="p-2 border rounded-md bg-background text-sm"
          />
          <input
            type="text"
            placeholder="Flight No."
            value={filters.flightNumber}
            onChange={(e) => setFilters((p) => ({ ...p, flightNumber: e.target.value }))}
            className="p-2 border rounded-md bg-background text-sm"
          />
          <input
            type="text"
            placeholder="PNR"
            value={filters.pnr}
            onChange={(e) => setFilters((p) => ({ ...p, pnr: e.target.value }))}
            className="p-2 border rounded-md bg-background text-sm"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            className="p-2 border rounded-md bg-background text-sm"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="BOARDED">Boarded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
            className="p-2 border rounded-md bg-background text-sm"
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 flex items-center justify-center gap-1 text-sm"
          >
            <Search className="h-4 w-4" /> Filter
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="text-left py-3 px-4">PNR</th>
                <th className="text-left py-3 px-4">Passenger</th>
                <th className="text-left py-3 px-4">Airline</th>
                <th className="text-left py-3 px-4">Flight</th>
                <th className="text-left py-3 px-4">Route</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-accent/50">
                  <td className="py-3 px-4 font-mono font-medium">{booking.pnr}</td>
                  <td className="py-3 px-4 text-sm">
                    {booking.user?.name || booking.user?.email || 'Anonymous'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAirlineColor(booking.flight.airlineName)}`}>
                      {booking.flight.airlineName}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{booking.flight.flightNumber}</td>
                  <td className="py-3 px-4 text-sm">{booking.flight.origin}→{booking.flight.destination}</td>
                  <td className="py-3 px-4 text-sm">${booking.totalPrice.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {booking.status === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleBoard(booking.id)}
                        className="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                      >
                        Board
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
