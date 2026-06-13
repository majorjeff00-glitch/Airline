'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

export default function BookFlightPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const travelClass = searchParams.get('class') || 'ECONOMY';
  const passengerCount = parseInt(searchParams.get('passengers') || '1');

  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => ({
      fullName: '',
      dateOfBirth: '',
      passportNumber: '',
    }))
  );

  useEffect(() => {
    const loadFlight = async () => {
      try {
        const res = await fetch(`/api/flights/${params.id}`);
        const data = await res.json();
        setFlight(data);
      } catch (error) {
        console.error('Error loading flight:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFlight();
  }, [params.id]);

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    (updated[index] as any)[field] = value;
    setPassengers(updated);
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: params.id,
          travelClass,
          passengers: passengers.map((p) => ({
            fullName: p.fullName,
            dateOfBirth: p.dateOfBirth || new Date().toISOString().split('T')[0],
            passportNumber: p.passportNumber || undefined,
          })),
        }),
      });

      const booking = await res.json();
      if (booking.pnr) {
        router.push(`/flights/${params.id}/book/payment?bookingId=${booking.id}&pnr=${booking.pnr}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Flight not found</h2>
        <Link href="/" className="text-primary hover:underline">Back to search</Link>
      </div>
    );
  }

  const getPrice = () => {
    if (travelClass === 'ECONOMY') return flight.economyPrice;
    if (travelClass === 'BUSINESS') return flight.businessPrice;
    return flight.firstPrice;
  };

  const totalPrice = getPrice() * passengerCount;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium">
            {flight.airlineName}
          </span>
          <span className="text-sm text-muted-foreground">{flight.flightNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">{flight.origin}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(flight.departureTime).toLocaleDateString()}</div>
          </div>
          <div className="text-sm text-muted-foreground px-4">
            {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{flight.destination}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(flight.arrivalTime).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Passenger Details</h2>
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-3">Passenger {index + 1}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={passenger.fullName}
                    onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                    className="w-full p-2 border rounded-md bg-background text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                    className="w-full p-2 border rounded-md bg-background text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Passport Number (optional)</label>
                  <input
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                    className="w-full p-2 border rounded-md bg-background text-sm"
                    placeholder="AB123456"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          {travelClass.charAt(0) + travelClass.slice(1).toLowerCase()} · {passengerCount} passenger{passengerCount > 1 ? 's' : ''} · ${getPrice().toFixed(2)} each
        </p>
        <button
          onClick={handleBooking}
          disabled={loading || passengers.some((p) => !p.fullName)}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}
