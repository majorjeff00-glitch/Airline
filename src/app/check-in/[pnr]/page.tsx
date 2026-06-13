'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/pnr?pnr=${params.pnr}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== 'CONFIRMED' && data.status !== 'CHECKED_IN') {
            setError('Booking is not eligible for check-in');
          }
          setBooking(data);
        } else {
          setError('Booking not found');
        }
      } catch {
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [params.pnr]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/bookings/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: params.pnr }),
      });

      if (res.ok) {
        const data = await res.json();
        setBooking(data);
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Check-in failed');
      }
    } catch {
      setError('Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  if (!booking) return null;

  const hoursUntilDeparture =
    (new Date(booking.flight.departureTime).getTime() - Date.now()) / (1000 * 60 * 60);
  const canCheckIn = hoursUntilDeparture <= 24 && hoursUntilDeparture >= 2;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {success ? (
        <div className="text-center py-12">
          <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Checked In!</h2>
          <p className="text-muted-foreground mb-6">You have been checked in for your flight.</p>
          <Link
            href={`/boarding-pass/${params.pnr}`}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90"
          >
            Download Boarding Pass
          </Link>
        </div>
      ) : (
        <div className="bg-card border rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Online Check-in</h1>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>
          )}

          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">PNR</span>
              <span className="font-mono font-bold">{booking.pnr}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Flight</span>
              <span>{booking.flight.airlineName} {booking.flight.flightNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Route</span>
              <span>{booking.flight.origin} → {booking.flight.destination}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span>{new Date(booking.flight.departureTime).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="font-medium">{booking.status}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Passengers</h3>
            <div className="space-y-2">
              {booking.passengers.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{p.fullName}</span>
                  <span className="text-muted-foreground">Seat: {p.seatNumber || 'TBD'}</span>
                </div>
              ))}
            </div>
          </div>

          {booking.status === 'CONFIRMED' && (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn || !canCheckIn}
              className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {checkingIn ? 'Checking in...' : !canCheckIn
                ? 'Check-in not available yet (24h to 2h before departure)'
                : 'Check In'}
            </button>
          )}

          {booking.status === 'CHECKED_IN' && (
            <Link
              href={`/boarding-pass/${params.pnr}`}
              className="mt-6 block w-full bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 text-center"
            >
              View Boarding Pass
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
