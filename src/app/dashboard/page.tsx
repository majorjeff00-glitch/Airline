'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plane, Clock, Download, XCircle, ChevronRight, Ticket, LuggageIcon, Search } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

function getAirlineTag(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'fastjet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'skylink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

    if (status === 'authenticated') loadBookings();
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
        setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      }
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  if (status === 'loading') {
    return <div className="max-w-6xl mx-auto px-4 py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-32 bg-muted rounded-xl" /></div></div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="hidden md:flex flex-col w-60 border-r bg-card p-4 gap-1">
        <div className="flex items-center gap-3 px-3 py-4 border-b mb-2">
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold font-display">
            {user?.name?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="text-sm truncate">
            <p className="font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>

        {[
          { href: '/dashboard', label: 'Dashboard', icon: Ticket, active: true },
          { href: '/dashboard?filter=upcoming', label: 'Upcoming Flights', icon: Plane },
          { href: '/dashboard?filter=past', label: 'Past Flights', icon: Clock },
          { href: '/track', label: 'Track Booking', icon: Search },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              item.active
                ? 'bg-brand-light text-brand-primary border-l-[3px] border-brand-primary pl-[calc(0.75rem-3px)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="border-t my-2" />
            <p className="px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Admin</p>
            {[
              { href: '/admin/flights', label: 'Flight Management', icon: Plane },
              { href: '/admin/bookings', label: 'All Bookings', icon: Ticket },
              { href: '/admin/revenue', label: 'Revenue Reports', icon: Clock },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </aside>

      <div className="flex-1 px-4 py-8 lg:px-8">
        <h1 className="font-display text-2xl font-bold mb-1">My Trips</h1>
        <p className="text-muted-foreground text-sm mb-6">View and manage your flight bookings across all airlines</p>

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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-accent text-accent-foreground hover:bg-accent/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-xl p-5 bg-card animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-card">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <LuggageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-4">Start your journey by searching for flights</p>
            <Link href="/" className="btn-primary"><Search className="h-4 w-4" /> Search Flights</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-xl p-5 bg-card hover:shadow-md transition-all duration-200">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAirlineTag(booking.flight.airlineName)}`}>
                        {booking.flight.airlineName}
                      </span>
                      <span className="text-sm text-muted-foreground font-mono">{booking.flight.flightNumber}</span>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>
                        <span className={`status-dot ${
                          booking.status === 'CONFIRMED' ? 'bg-status-confirmed' :
                          booking.status === 'PENDING' ? 'bg-status-pending' :
                          booking.status === 'CHECKED_IN' ? 'bg-status-checkedin' :
                          booking.status === 'BOARDED' ? 'bg-status-boarded' :
                          'bg-status-cancelled'
                        }`} />
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-8">
                      <div className="text-center min-w-[70px]">
                        <div className="text-lg font-bold font-display">{booking.flight.origin}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                      <div className="flex flex-col items-center flex-1 max-w-[80px]">
                        <div className="text-xs text-muted-foreground">
                          {Math.floor(booking.flight.durationMinutes / 60)}h {booking.flight.durationMinutes % 60}m
                        </div>
                        <div className="w-full h-px bg-border my-1 relative">
                          <Plane className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 text-muted-foreground rotate-90" />
                        </div>
                      </div>
                      <div className="text-center min-w-[70px]">
                        <div className="text-lg font-bold font-display">{booking.flight.destination}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Ticket className="h-3 w-3" /> PNR: <strong className="text-foreground font-mono">{booking.pnr}</strong></span>
                      <span>{booking.passengers.length} passenger{booking.passengers.length > 1 ? 's' : ''}</span>
                      <span className="font-medium text-foreground">${booking.totalPrice.toFixed(2)}</span>
                      <span>{new Date(booking.flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
                    {booking.status === 'CONFIRMED' && new Date(booking.flight.departureTime).getTime() > Date.now() && (
                      <Link href={`/check-in/${booking.pnr}`} className="btn-primary !min-h-[36px] !py-1.5 !px-4 text-xs">
                        Check In
                      </Link>
                    )}
                    {booking.status === 'CHECKED_IN' && (
                      <Link href={`/boarding-pass/${booking.pnr}`} className="btn-primary !min-h-[36px] !py-1.5 !px-4 text-xs !bg-status-checkedin !border-0">
                        <Download className="h-3 w-3" /> Boarding Pass
                      </Link>
                    )}
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button onClick={() => handleCancel(booking.id)} className="btn-secondary !min-h-[36px] !py-1.5 !px-4 text-xs !text-status-cancelled !border-status-cancelled/30 hover:!bg-status-cancelled/5">
                        <XCircle className="h-3 w-3" /> Cancel
                      </button>
                    )}
                    <Link href={`/booking-detail/${booking.id}`} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5 px-2 py-1.5 transition-colors">
                      Details <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
