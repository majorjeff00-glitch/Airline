'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plane, ArrowLeft, Check, Clock, XCircle } from 'lucide-react';

function getAirlineTag(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'fastjet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'skylink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'BOARDED'];

function BookingTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {STATUS_FLOW.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;
        const isLast = index === STATUS_FLOW.length - 1;

        return (
          <div key={status} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-brand-primary text-white'
                  : isCurrent
                  ? 'bg-brand-primary text-white animate-pulse-ring'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                isCurrent ? 'text-foreground font-semibold' : isCompleted ? 'text-status-confirmed' : 'text-muted-foreground'
              }`}>
                {status.replace('_', ' ')}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-1.25rem] ${isCompleted ? 'bg-brand-primary' : 'bg-muted'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-4">
            <Search className="h-7 w-7 text-brand-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Track Your Booking</h1>
          <p className="text-muted-foreground text-sm">Enter your PNR and last name to look up your booking</p>
        </div>

        <div className="border rounded-2xl p-6 bg-card shadow-lg mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">PNR Code</label>
                <input
                  type="text"
                  value={pnr}
                  onChange={(e) => setPnr(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  className="input-field font-mono text-lg tracking-[0.2em] text-center"
                  required
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name <span className="text-muted-foreground/60">(optional)</span></label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Johnson"
                  className="input-field"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Searching...' : <><Search className="h-4 w-4" /> Track Booking</>}
            </button>
          </form>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading && (
          <div className="border rounded-2xl p-6 bg-card animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="h-12 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        )}

        {booking && (
          <div className="border rounded-2xl bg-card shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-brand-primary to-blue-500 p-6 text-white text-center">
              <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">PNR</p>
              <p className="text-3xl font-display font-bold tracking-[0.15em]">{booking.pnr}</p>
            </div>

            <div className="p-6">
              <BookingTimeline currentStatus={booking.status} />

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAirlineTag(booking.flight?.airlineName)}`}>
                  {booking.flight?.airlineName}
                </span>
                <span className="text-sm text-muted-foreground font-mono">{booking.flight?.flightNumber}</span>
              </div>

              <div className="flex items-center justify-between bg-muted/50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold font-display">{booking.flight?.origin}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(booking.flight?.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{Math.floor((booking.flight?.durationMinutes || 0) / 60)}h {(booking.flight?.durationMinutes || 0) % 60}m</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-display">{booking.flight?.destination}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(booking.flight?.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mb-4">
                {new Date(booking.flight?.departureTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Passengers</p>
                <div className="space-y-2">
                  {booking.passengers?.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between text-sm py-1.5">
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {p.fullName?.charAt(0) || '?'}
                        </span>
                        {p.fullName}
                      </span>
                      <span className="text-muted-foreground text-xs">Seat: {p.seatNumber || 'TBD'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {(booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN') && (
                  <Link href={`/check-in/${booking.pnr}`} className="btn-primary flex-1 text-sm">
                    Check In
                  </Link>
                )}
                {booking.status === 'CHECKED_IN' && (
                  <Link href={`/boarding-pass/${booking.pnr}`} className="btn-primary flex-1 text-sm !bg-status-checkedin">
                    Boarding Pass
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
