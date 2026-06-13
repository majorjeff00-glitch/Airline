'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plane, Clock, Download, XCircle, ChevronRight } from 'lucide-react';
import { getStatusColor, getAirlineColor } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') redirect('/login');
  }, [status]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await fetch(`/api/users/bookings?filter=${filter}`);
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

    if (status === 'authenticated') {
      loadBookings();
    }
  }, [filter, status]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
          )
        );
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-muted-foreground mb-6">
        View and manage your flight bookings across all airlines
      </p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground hover:bg-accent/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card">
          <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <Link href="/" className="text-primary hover:underline">
            Search flights to book
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAirlineColor(booking.flight.airlineName)}`}>
                      {booking.flight.airlineName}
                    </span>
                    <span className="text-sm text-muted-foreground">{booking.flight.flightNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold">{booking.flight.origin}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(booking.flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {Math.floor(booking.flight.durationMinutes / 60)}h {booking.flight.durationMinutes % 60}m
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{booking.flight.destination}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(booking.flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>PNR: <strong className="text-foreground">{booking.pnr}</strong></span>
                    <span>{booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}</span>
                    <span>${booking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {booking.status === 'CONFIRMED' && new Date(booking.flight.departureTime).getTime() - Date.now() > 0 && (
                    <Link
                      href={`/check-in/${booking.pnr}`}
                      className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-center"
                    >
                      Check In
                    </Link>
                  )}
                  {booking.status === 'CHECKED_IN' && (
                    <Link
                      href={`/boarding-pass/${booking.pnr}`}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 text-center flex items-center justify-center gap-1"
                    >
                      <Download className="h-4 w-4" /> Boarding Pass
                    </Link>
                  )}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="text-sm border border-destructive text-destructive px-4 py-2 rounded-md font-medium hover:bg-destructive/10 text-center flex items-center justify-center gap-1"
                    >
                      <XCircle className="h-4 w-4" /> Cancel
                    </button>
                  )}
                  <Link
                    href={`/booking-detail/${booking.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground text-center flex items-center justify-center gap-1"
                  >
                    Details <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
