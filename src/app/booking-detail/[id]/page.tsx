'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plane } from 'lucide-react';
import { getStatusColor, getAirlineColor } from '@/lib/utils';

export default function BookingDetailPage() {
  const params = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        }
      } catch (error) {
        console.error('Error loading booking:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold mb-4">Booking not found</h2>
        <Link href="/dashboard" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Booking Details</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
            {booking.status}
          </span>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 text-center mb-6">
          <p className="text-sm text-muted-foreground">PNR (Record Locator)</p>
          <p className="text-3xl font-mono font-bold tracking-wider">{booking.pnr}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Flight</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getAirlineColor(booking.flight.airlineName)}`}>
                {booking.flight.airlineName}
              </span>
              <span className="text-muted-foreground">{booking.flight.flightNumber}</span>
            </div>
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-bold">{booking.flight.origin}</div>
                <div className="text-sm">
                  {new Date(booking.flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(booking.flight.departureTime).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.floor(booking.flight.durationMinutes / 60)}h {booking.flight.durationMinutes % 60}m
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{booking.flight.destination}</div>
                <div className="text-sm">
                  {new Date(booking.flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(booking.flight.arrivalTime).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Passengers</h3>
            <div className="space-y-2">
              {booking.passengers.map((p: any) => (
                <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      DOB: {new Date(p.dateOfBirth).toLocaleDateString()} | Seat: {p.seatNumber || 'TBD'}
                    </p>
                  </div>
                  <span className="text-xs bg-accent px-2 py-1 rounded">{p.travelClass}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Total Price</span>
              <span className="text-xl font-bold text-primary">${booking.totalPrice.toFixed(2)}</span>
            </div>
            {booking.cancellationRefund > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Refund Amount</span>
                <span className="text-green-600 font-medium">${booking.cancellationRefund.toFixed(2)}</span>
              </div>
            )}
            {booking.payment && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Payment</span>
                <span className="text-green-600">{booking.payment.status} ({booking.payment.transactionId})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
