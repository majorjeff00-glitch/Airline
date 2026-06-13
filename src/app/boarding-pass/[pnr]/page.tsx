'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Plane } from 'lucide-react';

export default function BoardingPassPage() {
  const params = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/pnr?pnr=${params.pnr}`);
        if (res.ok) {
          const data = await res.json();
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

  const handleDownloadPDF = async (passenger: any) => {
    try {
      const res = await fetch('/api/boarding-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pnr: booking.pnr,
          passengerName: passenger.fullName,
          airlineName: booking.flight.airlineName,
          flightNumber: booking.flight.flightNumber,
          origin: booking.flight.origin,
          destination: booking.flight.destination,
          departureTime: booking.flight.departureTime,
          arrivalTime: booking.flight.arrivalTime,
          seatNumber: passenger.seatNumber || 'TBD',
          gate: `G${Math.floor(Math.random() * 30) + 1}`,
          boardingTime: new Date(new Date(booking.flight.departureTime).getTime() - 30 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          travelClass: passenger.travelClass,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boarding-pass-${booking.pnr}-${passenger.fullName.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error('PDF download error:', error);
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

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-bold mb-4">{error}</h2>
        <Link href="/" className="text-primary hover:underline">Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Boarding Pass</h1>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 mb-4 text-center">
          <p className="text-sm text-muted-foreground">PNR</p>
          <p className="text-2xl font-mono font-bold tracking-wider">{booking.pnr}</p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Airline</span>
            <span className="font-medium">{booking.flight.airlineName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Flight</span>
            <span className="font-medium">{booking.flight.flightNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Route</span>
            <span className="font-medium">{booking.flight.origin} → {booking.flight.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Departure</span>
            <span className="font-medium">
              {new Date(booking.flight.departureTime).toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        <h3 className="font-medium mb-3">Passengers</h3>
        <div className="space-y-3">
          {booking.passengers.map((p: any) => (
            <div key={p.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{p.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  Seat: {p.seatNumber || 'TBD'} · {p.travelClass}
                </p>
              </div>
              <button
                onClick={() => handleDownloadPDF(p)}
                className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90"
              >
                <Download className="h-3 w-3" /> PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
