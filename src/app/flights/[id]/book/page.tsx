'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plane, MapPin, Clock, User, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Stepper } from '@/components/bookings/stepper';
import { SeatMap } from '@/components/flights/seat-map';

const STEP_LABELS = [
  { number: 1, label: 'Search' },
  { number: 2, label: 'Seats' },
  { number: 3, label: 'Passengers' },
  { number: 4, label: 'Payment' },
];

function getAirlineTag(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'fastjet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'skylink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export default function BookFlightPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const travelClass = searchParams.get('class') || 'ECONOMY';
  const passengerCount = parseInt(searchParams.get('passengers') || '1');

  const [flight, setFlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);
  const [error, setError] = useState('');

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => ({
      fullName: '',
      dateOfBirth: '',
      passportNumber: '',
      email: '',
      phone: '',
    }))
  );
  const [expandedPassenger, setExpandedPassenger] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadFlight = async () => {
      try {
        const res = await fetch(`/api/flights/${params.id}`);
        const data = await res.json();
        if (data.status === 'CANCELLED') {
          setError('This flight has been cancelled.');
        }
        setFlight(data);
      } catch {
        setError('Failed to load flight details.');
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

  const handleSubmit = async () => {
    if (selectedSeats.length !== passengerCount) {
      setError('Please select seats for all passengers.');
      return;
    }

    const invalidPassenger = passengers.find((p) => !p.fullName || !p.dateOfBirth);
    if (invalidPassenger) {
      setError('Please fill in all required passenger details.');
      return;
    }

    setSubmitting(true);
    setError('');
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
          selectedSeats,
        }),
      });

      const booking = await res.json();
      if (!res.ok) throw new Error(booking.error || 'Booking failed');

      router.push(`/flights/${params.id}/book/payment?bookingId=${booking.id}&pnr=${booking.pnr}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (error && !flight) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Plane className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Unable to load flight</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Link href="/" className="btn-primary">Back to Search</Link>
      </div>
    );
  }

  if (!flight) return null;

  const getPrice = () => {
    if (travelClass === 'ECONOMY') return flight.economyPrice;
    if (travelClass === 'BUSINESS') return flight.businessPrice;
    return flight.firstPrice;
  };

  const totalPrice = getPrice() * passengerCount;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>

      <div className="mb-8">
        <Stepper steps={STEP_LABELS} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-xl p-5 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getAirlineTag(flight.airlineName)}`}>
                {flight.airlineName}
              </span>
              <span className="text-sm text-muted-foreground font-mono">{flight.flightNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-xl font-bold font-display">{flight.origin}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="flex flex-col items-center px-4">
                <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">
                  {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                </span>
                <div className="w-16 h-px bg-border my-1" />
                <Plane className="h-3 w-3 text-muted-foreground rotate-90" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-display">{flight.destination}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(flight.arrivalTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl p-5 bg-card">
            <h2 className="font-display font-semibold text-lg mb-4">Select Seats</h2>
            <SeatMap
              occupiedSeats={flight.occupiedSeats || []}
              travelClass={travelClass}
              passengers={passengerCount}
              onSeatsChange={setSelectedSeats}
            />
          </div>

          <div className="border rounded-xl p-5 bg-card">
            <h2 className="font-display font-semibold text-lg mb-4">Passenger Details</h2>
            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div key={index} className="border rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setExpandedPassenger(expandedPassenger === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center">
                        <User className="h-4 w-4 text-brand-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">
                          Passenger {index + 1}{index === 0 ? ' — Lead' : ''}
                        </p>
                        {passenger.fullName && (
                          <p className="text-xs text-muted-foreground">{passenger.fullName}</p>
                        )}
                      </div>
                    </div>
                    {expandedPassenger === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {expandedPassenger === index && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
                          <input
                            type="text"
                            value={passenger.fullName}
                            onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                            className="input-field"
                            placeholder="e.g. John Smith"
                            required
                            aria-describedby={`name-error-${index}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Passport Number <span className="text-muted-foreground/60">(optional)</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={passenger.passportNumber}
                              onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                              className="input-field pl-8"
                              placeholder="AB123456"
                            />
                            <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Email (optional)</label>
                          <input
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                            className="input-field"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Phone (optional)</label>
                          <input
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                            className="input-field"
                            placeholder="+1 555-0123"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-xl p-5 bg-card sticky top-24 shadow-lg">
            <h3 className="font-display font-semibold mb-4">Booking Summary</h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-light flex items-center justify-center">
                  <Plane className="h-4 w-4 text-brand-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{flight.airlineName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{flight.flightNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Class</span>
                <span className="font-medium capitalize">{travelClass.toLowerCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Passengers</span>
                <span className="font-medium">{passengerCount}</span>
              </div>
              {selectedSeats.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seats</span>
                  <span className="font-medium">{selectedSeats.join(', ')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per person</span>
                <span>${getPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold font-display border-t pt-2">
                <span>Total</span>
                <span className="text-brand-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mt-4" role="alert">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || selectedSeats.length !== passengerCount}
              className="btn-primary w-full mt-4"
            >
              {submitting ? 'Processing...' : `Continue to Payment — $${totalPrice.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
