'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, XCircle, Plane } from 'lucide-react';
import { getAirlineColor, getStatusColor } from '@/lib/utils';

export default function AdminFlightsPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) {
      redirect('/login');
    }
  }, [status, user]);

  useEffect(() => {
    const loadFlights = async () => {
      try {
        const res = await fetch('/api/admin/flights');
        if (res.ok) {
          const data = await res.json();
          setFlights(data);
        }
      } catch (error) {
        console.error('Error loading flights:', error);
      } finally {
        setLoading(false);
      }
    };
    if (status === 'authenticated' && user?.role === 'ADMIN') {
      loadFlights();
    }
  }, [status, user]);

  const handleCancel = async (flightId: string) => {
    if (!confirm('Cancel this flight? All bookings will be cancelled and passengers notified.')) return;

    try {
      const res = await fetch(`/api/admin/flights/${flightId}`, { method: 'DELETE' });
      if (res.ok) {
        setFlights((prev) =>
          prev.map((f) => (f.id === flightId ? { ...f, status: 'CANCELLED' } : f))
        );
      }
    } catch (error) {
      console.error('Error cancelling flight:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const groupedByAirline = flights.reduce((acc: Record<string, any[]>, flight: any) => {
    if (!acc[flight.airlineName]) acc[flight.airlineName] = [];
    acc[flight.airlineName].push(flight);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Flights</h1>
          <p className="text-muted-foreground">View all flights grouped by airline</p>
        </div>
        <Link
          href="/admin/flights/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Flight
        </Link>
      </div>

      {Object.keys(groupedByAirline).length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No flights yet</h3>
          <Link href="/admin/flights/new" className="text-primary hover:underline">Add your first flight</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByAirline).map(([airline, airlineFlights]: [string, any]) => (
            <div key={airline}>
              <h2 className={`inline-block px-3 py-1 rounded text-sm font-medium mb-4 ${getAirlineColor(airline)}`}>
                {airline} ({(airlineFlights as any[]).length} flights)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="text-left py-3 px-4">Flight</th>
                      <th className="text-left py-3 px-4">Route</th>
                      <th className="text-left py-3 px-4">Departure</th>
                      <th className="text-left py-3 px-4">Seats</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Bookings</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(airlineFlights as any[]).map((flight: any) => (
                      <tr key={flight.id} className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4 font-medium">{flight.flightNumber}</td>
                        <td className="py-3 px-4">{flight.origin} → {flight.destination}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(flight.departureTime).toLocaleDateString()}{' '}
                          {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          E:{flight.economySeats} B:{flight.businessSeats} F:{flight.firstSeats}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(flight.status)}`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{flight._count?.bookings || 0}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/flights/${flight.id}/edit`}
                              className="p-1.5 rounded-md hover:bg-accent"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            {flight.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleCancel(flight.id)}
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
                              >
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
