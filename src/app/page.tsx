'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plane, ArrowRight, Users, Calendar, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [travelClass, setTravelClass] = useState('ECONOMY');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    setSearching(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
        passengers,
        travelClass,
      });
      const res = await fetch(`/api/flights?${params}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const getPrice = (flight: any) => {
    if (travelClass === 'ECONOMY') return flight.economyPrice;
    if (travelClass === 'BUSINESS') return flight.businessPrice;
    return flight.firstPrice;
  };

  const getAirlineColor = (airline: string) => {
    const colors: Record<string, string> = {
      'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'fastjet': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'skylink': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Book Flights from Any Airline</h1>
        <p className="text-muted-foreground text-lg">
          Search, compare, and book across multiple airlines in one place
        </p>
      </div>

      <form onSubmit={handleSearch} className="bg-card border rounded-lg p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="City or airport code"
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City or airport code"
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passengers</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="ECONOMY">Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First Class</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={searching}
          className="mt-4 w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {searching ? 'Searching...' : <><Search className="h-5 w-5" /> Search Flights</>}
        </button>
      </form>

      {searched && (
        <div>
          {searching ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Searching flights across all airlines...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-card">
              <Plane className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No flights found</h3>
              <p className="text-muted-foreground">Try different airports or dates</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{results.length} flight{results.length > 1 ? 's' : ''} found</h2>
              {results.map((flight) => (
                <div key={flight.id} className="border rounded-lg p-6 bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getAirlineColor(flight.airlineName)}`}>
                        {flight.airlineName}
                      </span>
                      <span className="text-sm text-muted-foreground">{flight.flightNumber}</span>
                    </div>
                    <div className="flex items-center gap-4 md:gap-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-muted-foreground">{flight.origin}</div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground">
                          {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                        </div>
                        <div className="border-t w-16 border-dashed border-muted-foreground my-1" />
                        <Plane className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm text-muted-foreground">{flight.destination}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ${getPrice(flight).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">per person</div>
                      <Link
                        href={`/flights/${flight.id}/book?class=${travelClass}&passengers=${passengers}`}
                        className="mt-2 inline-flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
                      >
                        Book <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!searched && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="border rounded-lg p-6 text-center bg-card">
              <Search className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Search All Airlines</h3>
              <p className="text-sm text-muted-foreground">Find flights from Delta, Emirates, Demo Airways and more</p>
            </div>
            <div className="border rounded-lg p-6 text-center bg-card">
              <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Book & Manage</h3>
              <p className="text-sm text-muted-foreground">Complete booking flow with seat selection and payment</p>
            </div>
            <div className="border rounded-lg p-6 text-center bg-card">
              <Briefcase className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Track Anywhere</h3>
              <p className="text-sm text-muted-foreground">Track bookings via PNR, check in online, get boarding passes</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/track" className="border-2 border-dashed rounded-lg p-8 text-center bg-card hover:border-primary/50 transition-colors">
              <Search className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-lg mb-1">Track by PNR</h3>
              <p className="text-sm text-muted-foreground">Enter your PNR code to view booking status</p>
            </Link>
            <Link href="/flight-status" className="border-2 border-dashed rounded-lg p-8 text-center bg-card hover:border-primary/50 transition-colors">
              <Plane className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold text-lg mb-1">Flight Status</h3>
              <p className="text-sm text-muted-foreground">Check real-time status of any flight</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
