'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit3, XCircle, Plane } from 'lucide-react';

function getAirlineTag(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'fastjet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'skylink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700';
}

function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    DELAYED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    BOARDING: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    DEPARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export default function AdminFlightsPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) redirect('/login');
  }, [status, user]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/flights');
      if (res.ok) setFlights(await res.json());
      setLoading(false);
    };
    if (status === 'authenticated' && user?.role === 'ADMIN') load();
  }, [status, user]);

  const handleCancel = async (flightId: string) => {
    if (!confirm('Cancel this flight? All bookings will be cancelled and passengers notified.')) return;
    const res = await fetch(`/api/admin/flights/${flightId}`, { method: 'DELETE' });
    if (res.ok) setFlights(prev => prev.map(f => f.id === flightId ? { ...f, status: 'CANCELLED' } : f));
  };

  if (status === 'loading' || loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8"><div className="animate-pulse h-64 bg-muted rounded-2xl" /></div>;
  }

  const groupedByAirline = flights.reduce((acc: Record<string, any[]>, flight: any) => {
    if (!acc[flight.airlineName]) acc[flight.airlineName] = [];
    acc[flight.airlineName].push(flight);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Flights</h1>
          <p className="text-sm text-muted-foreground">All flights grouped by airline</p>
        </div>
        <Link href="/admin/flights/new" className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> Add Flight
        </Link>
      </div>

      {flights.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-card">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold mb-2">No flights added yet</h3>
          <Link href="/admin/flights/new" className="btn-primary"><Plus className="h-4 w-4" /> Add Flight</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByAirline).map(([airline, airlineFlights]: [string, any]) => (
            <div key={airline}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAirlineTag(airline)}`}>{airline}</span>
                <span className="text-xs text-muted-foreground">({airlineFlights.length} flights)</span>
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="text-left py-3 px-4 font-medium">Flight</th>
                      <th className="text-left py-3 px-4 font-medium">Route</th>
                      <th className="text-left py-3 px-4 font-medium">Departure</th>
                      <th className="text-left py-3 px-4 font-medium">Seats (E/B/F)</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Bookings</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {airlineFlights.map((flight: any) => (
                      <tr key={flight.id} className="border-t hover:bg-accent/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{flight.flightNumber}</td>
                        <td className="py-3 px-4 text-sm">{flight.origin} → {flight.destination}</td>
                        <td className="py-3 px-4 text-sm whitespace-nowrap">
                          {new Date(flight.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                          {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {flight.economySeats}/{flight.businessSeats}/{flight.firstSeats}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(flight.status)}`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{flight._count?.bookings || 0}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/flights/${flight.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent transition-colors" aria-label="Edit flight">
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            {flight.status !== 'CANCELLED' && (
                              <button onClick={() => handleCancel(flight.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-status-cancelled transition-colors" aria-label="Cancel flight">
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
