'use client';

import { useState } from 'react';
import { Search, Plane, Clock } from 'lucide-react';

function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    DELAYED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    BOARDING: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    DEPARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

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
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Flight not found'); return; }
      setResults(await res.json());
    } catch { setError('Failed to fetch flight status'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-4">
            <Plane className="h-7 w-7 text-brand-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Flight Status</h1>
          <p className="text-muted-foreground text-sm">Check real-time status by airline and flight number</p>
        </div>

        <div className="border rounded-2xl p-6 bg-card shadow-lg mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Airline Name</label>
              <input type="text" value={airlineName} onChange={e => setAirlineName(e.target.value)} placeholder="e.g. Delta, Emirates, FastJet" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Flight Number</label>
              <input type="text" value={flightNumber} onChange={e => setFlightNumber(e.target.value)} placeholder="e.g. FJ202" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date <span className="text-muted-foreground/60">(optional)</span></label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Searching...' : <><Search className="h-4 w-4" /> Check Status</>}
            </button>
          </form>
        </div>

        {error && <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive mb-6">{error}</div>}

        {results && results.map((flight: any, i: number) => (
          <div key={i} className="border rounded-xl p-5 bg-card mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{flight.airlineName}</span>
                <span className="text-muted-foreground font-mono text-sm">{flight.flightNumber}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(flight.status)}`}>{flight.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-bold font-display">{flight.origin}</div>
                <div className="text-xs text-muted-foreground">{new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              </div>
              <Plane className="h-5 w-5 text-muted-foreground" />
              <div className="text-right">
                <div className="text-lg font-bold font-display">{flight.destination}</div>
                <div className="text-xs text-muted-foreground">{new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">{new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
