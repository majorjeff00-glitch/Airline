'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function NewFlightPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && user?.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [status, user, router]);

  const [form, setForm] = useState({
    airlineName: '',
    flightNumber: '',
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    economySeats: '150',
    businessSeats: '20',
    firstSeats: '10',
    economyPrice: '200',
    businessPrice: '500',
    firstPrice: '1000',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const departureDateTime = `${form.departureDate}T${form.departureTime}:00`;
    const arrivalDateTime = `${form.arrivalDate}T${form.arrivalTime}:00`;
    const dep = new Date(departureDateTime);
    const arr = new Date(arrivalDateTime);
    const durationMinutes = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));

    if (durationMinutes <= 0) {
      setError('Arrival time must be after departure time');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          airlineName: form.airlineName,
          flightNumber: form.flightNumber,
          origin: form.origin,
          destination: form.destination,
          departureTime: departureDateTime,
          arrivalTime: arrivalDateTime,
          durationMinutes,
          economySeats: parseInt(form.economySeats),
          businessSeats: parseInt(form.businessSeats),
          firstSeats: parseInt(form.firstSeats),
          economyPrice: parseFloat(form.economyPrice),
          businessPrice: parseFloat(form.businessPrice),
          firstPrice: parseFloat(form.firstPrice),
        }),
      });

      if (res.ok) {
        router.push('/admin/flights');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create flight');
      }
    } catch {
      setError('Failed to create flight');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Flight</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Flight Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Airline Name *</label>
              <input
                type="text"
                value={form.airlineName}
                onChange={(e) => updateField('airlineName', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="e.g. Demo Airways, FastJet"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Flight Number *</label>
              <input
                type="text"
                value={form.flightNumber}
                onChange={(e) => updateField('flightNumber', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="e.g. DA123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Origin *</label>
              <input
                type="text"
                value={form.origin}
                onChange={(e) => updateField('origin', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="e.g. JFK"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Destination *</label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => updateField('destination', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                placeholder="e.g. LAX"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Departure Date *</label>
              <input
                type="date"
                value={form.departureDate}
                onChange={(e) => updateField('departureDate', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Departure Time *</label>
              <input
                type="time"
                value={form.departureTime}
                onChange={(e) => updateField('departureTime', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Arrival Date *</label>
              <input
                type="date"
                value={form.arrivalDate}
                onChange={(e) => updateField('arrivalDate', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Arrival Time *</label>
              <input
                type="time"
                value={form.arrivalTime}
                onChange={(e) => updateField('arrivalTime', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Seats & Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Economy Seats</label>
              <input
                type="number"
                value={form.economySeats}
                onChange={(e) => updateField('economySeats', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Business Seats</label>
              <input
                type="number"
                value={form.businessSeats}
                onChange={(e) => updateField('businessSeats', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Seats</label>
              <input
                type="number"
                value={form.firstSeats}
                onChange={(e) => updateField('firstSeats', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Economy Price ($)</label>
              <input
                type="number"
                value={form.economyPrice}
                onChange={(e) => updateField('economyPrice', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Business Price ($)</label>
              <input
                type="number"
                value={form.businessPrice}
                onChange={(e) => updateField('businessPrice', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Price ($)</label>
              <input
                type="number"
                value={form.firstPrice}
                onChange={(e) => updateField('firstPrice', e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Flight'}
        </button>
      </form>
    </div>
  );
}
