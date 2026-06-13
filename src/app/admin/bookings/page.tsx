'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Search, Ticket, Filter } from 'lucide-react';

function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    CHECKED_IN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    BOARDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    NO_SHOW: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

function getAirlineTag(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'fastjet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'skylink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export default function AdminBookingsPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ airline: '', flightNumber: '', pnr: '', status: '', dateFrom: '', dateTo: '' });

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) redirect('/login');
  }, [status, user]);

  useEffect(() => {
    if (status === 'authenticated' && user?.role === 'ADMIN') loadBookings();
  }, [status, user]);

  const loadBookings = async (f?: any) => {
    const f2 = f || filters;
    const params = new URLSearchParams();
    Object.entries(f2).forEach(([k, v]) => { if (v) params.set(k, v as string); });
    setLoading(true);
    const res = await fetch(`/api/admin/bookings?${params}`);
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  };

  const handleBoard = async (bookingId: string) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'board' }),
    });
    if (res.ok) loadBookings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">All Bookings</h1>

      <div className="border rounded-xl p-4 bg-card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input type="text" placeholder="Airline" value={filters.airline} onChange={e => setFilters(p => ({ ...p, airline: e.target.value }))} className="input-field text-xs" />
          <input type="text" placeholder="Flight No." value={filters.flightNumber} onChange={e => setFilters(p => ({ ...p, flightNumber: e.target.value }))} className="input-field text-xs" />
          <input type="text" placeholder="PNR" value={filters.pnr} onChange={e => setFilters(p => ({ ...p, pnr: e.target.value }))} className="input-field text-xs" />
          <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))} className="input-field text-xs">
            <option value="">All Status</option>
            {['PENDING','CONFIRMED','CHECKED_IN','BOARDED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters(p => ({ ...p, dateFrom: e.target.value }))} className="input-field text-xs" />
          <button onClick={() => loadBookings()} className="btn-primary text-xs !min-h-[44px]"><Search className="h-4 w-4" /> Filter</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-card">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Ticket className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">PNR</th>
                <th className="text-left py-3 px-4 font-medium">Passenger</th>
                <th className="text-left py-3 px-4 font-medium">Airline</th>
                <th className="text-left py-3 px-4 font-medium">Flight</th>
                <th className="text-left py-3 px-4 font-medium">Route</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t hover:bg-accent/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-sm">{b.pnr}</td>
                  <td className="py-3 px-4 text-sm">{b.user?.name || b.user?.email || 'Anonymous'}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAirlineTag(b.flight?.airlineName)}`}>{b.flight?.airlineName}</span></td>
                  <td className="py-3 px-4 text-sm font-mono">{b.flight?.flightNumber}</td>
                  <td className="py-3 px-4 text-sm">{b.flight?.origin}→{b.flight?.destination}</td>
                  <td className="py-3 px-4 text-sm font-medium">${b.totalPrice?.toFixed(2)}</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(b.status)}`}>{b.status}</span></td>
                  <td className="py-3 px-4 text-right">
                    {b.status === 'CHECKED_IN' && (
                      <button onClick={() => handleBoard(b.id)} className="text-xs bg-status-boarded text-white px-3 py-1.5 rounded-lg hover:opacity-90 font-medium transition-all">
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
