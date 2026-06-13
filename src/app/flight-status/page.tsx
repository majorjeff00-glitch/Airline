'use client';

import { useState } from 'react';
import { Search, Plane } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';

export default function FlightStatusPage() {
  const [airlineName, setAirlineName] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!airlineName || !flightNumber) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const params = new URLSearchParams({ airlineName, flightNumber });
      if (date) params.set('date', date);

      const res = await fetch(`/api/flight-status?${params}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Flight not found');
        return;
      }
      const data = await res.json();
      setResults(data);
    } catch {
      setError('Failed to fetch flight status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Plane className="h-10 w-10 mx-auto mb-2 text-primary" />
        <h1 className="text-3xl font-bold mb-2">Flight Status</h1>
        <p className="text-muted-foreground">
          Check the real-time status of any flight by airline and flight number
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-card border rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Airline Name</label>
            <input
              type="text"
              value={airlineName}
              onChange={(e) => setAirlineName(e.target.value)}
              placeholder="e.g. Delta, Emirates"
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Flight Number</label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="e.g. DL123"
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date (optional)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Searching...' : <><Search className="h-4 w-4" /> Check Status</>}
        </button>
      </form>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((flight: any, index: number) => (
            <div key={index} className="border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{flight.airlineName}</span>
                  <span className="text-muted-foreground">{flight.flightNumber}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
                  {flight.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-bold">{flight.origin}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(flight.departureTime).toLocaleDateString()}
                  </div>
                </div>
                <Plane className="h-5 w-5 text-muted-foreground" />
                <div className="text-right">
                  <div className="text-lg font-bold">{flight.destination}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(flight.arrivalTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
