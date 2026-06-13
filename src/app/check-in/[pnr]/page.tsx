'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Plane, Clock } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

export default function CheckInPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/bookings/pnr?pnr=${params.pnr}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status !== 'CONFIRMED' && data.status !== 'CHECKED_IN') setError('Booking is not eligible for check-in');
          setBooking(data);
        } else setError('Booking not found');
      } catch { setError('Failed to load booking'); }
      finally { setLoading(false); }
    };
    load();
  }, [params.pnr]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/bookings/check-in', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pnr: params.pnr }),
      });
      if (res.ok) { setBooking(await res.json()); setSuccess(true); }
      else { const d = await res.json(); setError(d.error || 'Check-in failed'); }
    } catch { setError('Check-in failed.'); }
    finally { setCheckingIn(false); }
  };

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-64 bg-muted rounded-2xl" /></div></div>;
  }

  if (error && !booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Plane className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Unable to check in</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {success ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-status-confirmed/10 flex items-center justify-center mx-auto mb-6 animate-float">
            <CheckCircle className="h-10 w-10 text-status-confirmed" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Checked In!</h2>
          <p className="text-muted-foreground mb-6">You&apos;re all set. Download your boarding pass below.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/boarding-pass/${params.pnr}`} className="btn-primary">
              Download Boarding Pass
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="border rounded-2xl p-6 bg-card shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
              <Plane className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Online Check-in</h1>
              <p className="text-xs text-muted-foreground">Available 24h to 2h before departure</p>
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">{error}</div>}

          <div className="space-y-3 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">PNR</span>
              <span className="font-mono font-bold">{booking.pnr}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Flight</span>
              <span>{booking.flight?.airlineName} {booking.flight?.flightNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Route</span>
              <span>{booking.flight?.origin} → {booking.flight?.destination}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Date</span>
              <span>{new Date(booking.flight?.departureTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>{booking.status}</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Passengers</p>
            <div className="space-y-2">
              {booking.passengers?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{p.fullName?.charAt(0)}</span>
                    {p.fullName}
                  </span>
                  <span className="text-muted-foreground text-xs">Seat: {p.seatNumber || 'TBD'}</span>
                </div>
              ))}
            </div>
          </div>

          {booking.status === 'CONFIRMED' && (
            <button onClick={handleCheckIn} disabled={checkingIn} className="btn-primary w-full">
              {checkingIn ? 'Checking in...' : 'Check In'}
            </button>
          )}
          {booking.status === 'CHECKED_IN' && (
            <Link href={`/boarding-pass/${params.pnr}`} className="btn-primary w-full flex justify-center">
              View Boarding Pass
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
