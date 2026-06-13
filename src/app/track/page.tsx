'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plane, ArrowLeft } from 'lucide-react';
import { getStatusColor, getAirlineColor } from '@/lib/utils';

export default function TrackBookingPage() {
  const [pnr, setPnr] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pnr) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const params = new URLSearchParams({ pnr: pnr.toUpperCase() });
      if (lastName) params.set('lastName', lastName);

      const res = await fetch(`/api/bookings/pnr?${params}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Booking not found');
        return;
      }
      const data = await res.json();
      setBooking(data);
    } catch {
      setError('Failed to fetch booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="text-center mb-8">
        <Plane className="h-10 w-10 mx-auto mb-2 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Track Your Booking</h1>
        <p className="text-muted-foreground">Enter your PNR and last name to look up your booking</p>
      </div>

      <form onSubmit={handleSearch} className="bg-card border rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">PNR *</label>
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="w-full p-2 border rounded-md bg-background font-mono uppercase"
              required
              maxLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name (optional)</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Johnson"
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Searching...' : <><Search className="h-4 w-4" /> Track Booking</>}
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-6">{error}</div>
      )}

      {booking && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Booking Found</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 text-center mb-4">
            <p className="text-2xl font-mono font-bold tracking-wider">{booking.pnr}</p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAirlineColor(booking.flight.airlineName)}`}>
                {booking.flight.airlineName}
              </span>
              <span className="text-muted-foreground">{booking.flight.flightNumber}</span>
            </div>
            <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
              <div className="text-center">
                <div className="font-bold">{booking.flight.origin}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(booking.flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <Plane className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <div className="font-bold">{booking.flight.destination}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(booking.flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {new Date(booking.flight.departureTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Passengers</h3>
            <div className="space-y-2">
              {booking.passengers.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.fullName}</span>
                  <span className="text-muted-foreground">Seat: {p.seatNumber || 'TBD'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {booking.status === 'CONFIRMED' && (
              <Link
                href={`/check-in/${booking.pnr}`}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 text-center text-sm"
              >
                Check In
              </Link>
            )}
            {booking.status === 'CHECKED_IN' && (
              <Link
                href={`/boarding-pass/${booking.pnr}`}
                className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 text-center text-sm"
              >
                Boarding Pass
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
