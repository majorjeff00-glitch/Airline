'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plane, ArrowRight, Users, Calendar, Briefcase, MapPin, Clock, Ticket, Shield } from 'lucide-react';
import Link from 'next/link';

const AIRLINE_COLORS: Record<string, string> = {
  'demo airways': '#3b82f6',
  'fastjet': '#8b5cf6',
  'skylink': '#f59e0b',
  'delta': '#10b981',
  'united': '#ef4444',
  'emirates': '#f97316',
};

function getAirlineColor(airline: string): { bg: string; text: string; dot: string; tag: string } {
  const colors: Record<string, { bg: string; text: string; dot: string; tag: string }> = {
    'demo airways': { bg: '#e8f0fe', text: '#1a56db', dot: '#3b82f6', tag: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' },
    'fastjet': { bg: '#f3e8ff', text: '#7c3aed', dot: '#8b5cf6', tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' },
    'skylink': { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' },
    'delta': { bg: '#ecfdf5', text: '#16a34a', dot: '#10b981', tag: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  };
  const key = airline.toLowerCase();
  return colors[key] || { bg: '#f8fafc', text: '#475569', dot: '#64748b', tag: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    DELAYED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    BOARDING: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    DEPARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    CHECKED_IN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
    BOARDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export default function HomePage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [travelClass, setTravelClass] = useState('ECONOMY');
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [showAirlineFilter, setShowAirlineFilter] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price');
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    setSearching(true);
    setSearched(true);
    setError('');

    try {
      const params = new URLSearchParams({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date,
        passengers,
        travelClass,
      });
      if (selectedAirlines.length > 0) {
        params.set('airlines', selectedAirlines.join(','));
      }

      const res = await fetch(`/api/flights?${params}`);
      if (!res.ok) throw new Error('Failed to search');
      const data = await res.json();
      setResults(data);
    } catch {
      setError('We couldn\'t load flights right now. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const getPrice = (flight: any) => {
    if (travelClass === 'ECONOMY') return flight.economyPrice;
    if (travelClass === 'BUSINESS') return flight.businessPrice;
    return flight.firstPrice;
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'price') return getPrice(a) - getPrice(b);
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
    return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
  });

  const toggleAirline = (airline: string) => {
    setSelectedAirlines(prev =>
      prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
    );
  };

  const uniqueAirlines = Array.from(new Set(results.map(r => r.airlineName)));

  return (
    <div>
      {!searched ? (
        <div className="hero-gradient min-h-[calc(100vh-64px)] flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="text-center mb-8 max-w-2xl">
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-white text-balance leading-tight mb-4">
                Fly Anywhere.<br />Book Everything.
              </h1>
              <p className="text-lg text-blue-200/80 text-balance">
                Search and book flights from Delta, Emirates, FastJet, SkyLink, and more — all in one place.
              </p>
            </div>

            <div className="glass-card w-full max-w-4xl p-6 md:p-8">
              <div className="flex gap-2 mb-6">
                {['One Way', 'Round Trip', 'Multi-City'].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${i === 0 ? 'bg-white text-gray-900' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-white/70 mb-1">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        placeholder="City or code"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        required
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-white/70 mb-1">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="City or code"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        required
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-white/70 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm min-h-[44px] [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-white/70 mb-1">Passengers</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <select
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm min-h-[44px] appearance-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n} className="text-gray-900">{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <label className="block text-xs font-medium text-white/70 mb-1">Class</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <select
                        value={travelClass}
                        onChange={(e) => setTravelClass(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm min-h-[44px] appearance-none focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                      >
                        <option value="ECONOMY" className="text-gray-900">Economy</option>
                        <option value="BUSINESS" className="text-gray-900">Business</option>
                        <option value="FIRST" className="text-gray-900">First Class</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowAirlineFilter(!showAirlineFilter)}
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    {showAirlineFilter ? 'Hide' : 'Filter by airline'} ▼
                  </button>
                  {showAirlineFilter && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['Demo Airways', 'FastJet', 'SkyLink', 'Delta', 'Emirates'].map((airline) => (
                        <label key={airline} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs cursor-pointer hover:bg-white/20 transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedAirlines.includes(airline)}
                            onChange={() => toggleAirline(airline)}
                            className="w-3 h-3 rounded accent-white"
                          />
                          {airline}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={searching}
                  className="btn-primary w-full mt-4 !bg-white !text-gray-900 hover:!bg-gray-100"
                >
                  {searching ? 'Searching...' : <><Search className="h-5 w-5" /> Search Flights</>}
                </button>
              </form>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
              {[
                { icon: Search, title: 'Multi-Airline Search', desc: 'Compare flights across all major airlines' },
                { icon: Ticket, title: 'Instant PNR', desc: 'Get your unique booking code immediately' },
                { icon: Clock, title: 'Live Status Tracking', desc: 'Track any flight by airline + number' },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-brand-light/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-xs text-blue-200/60 mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Link href="/track" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all">
                <Ticket className="h-4 w-4" /> Track by PNR
              </Link>
              <Link href="/flight-status" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all">
                <Plane className="h-4 w-4" /> Flight Status
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => setSearched(false)}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            ← New Search
          </button>

          {error && (
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <span className="text-amber-600 dark:text-amber-400">⚠</span>
              <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">{error}</p>
              <button onClick={handleSearch} className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline">Retry</button>
            </div>
          )}

          {searching ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-xl p-6 bg-card animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-8 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Plane className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No flights found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your dates or search criteria</p>
              <button onClick={() => setSearched(false)} className="btn-primary">
                <Search className="h-4 w-4" /> New Search
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">{results.length} flight{results.length > 1 ? 's' : ''} found</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sort by:</span>
                  {(['price', 'duration', 'departure'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sortBy === s ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground hover:bg-accent/80'}`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {sortedResults.map((flight) => {
                  const colors = getAirlineColor(flight.airlineName);
                  return (
                    <div
                      key={flight.id}
                      className="border rounded-xl p-5 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors.tag}`}>
                            {flight.airlineName}
                          </span>
                          <span className="text-sm text-muted-foreground font-mono">{flight.flightNumber}</span>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-8">
                          <div className="text-center min-w-[80px]">
                            <div className="text-xl font-bold font-display">
                              {new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                            <div className="text-sm font-medium">{flight.origin}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(flight.departureTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          <div className="flex flex-col items-center px-3">
                            <div className="text-xs text-muted-foreground">
                              {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                            </div>
                            <div className="relative w-20 h-px bg-border my-1.5">
                              <Plane className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-3 w-3 text-muted-foreground rotate-90" />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {flight.status === 'SCHEDULED' ? 'Direct' : flight.status}
                            </div>
                          </div>

                          <div className="text-center min-w-[80px]">
                            <div className="text-xl font-bold font-display">
                              {new Date(flight.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                            <div className="text-sm font-medium">{flight.destination}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(flight.arrivalTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                          <div className="text-right">
                            <div className="text-xl font-bold font-display text-brand-primary">
                              ${getPrice(flight).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">per person</div>
                          </div>
                          <Link
                            href={`/flights/${flight.id}/book?class=${travelClass}&passengers=${passengers}`}
                            className="btn-primary !min-h-[40px] !py-2 !px-5 text-sm"
                          >
                            Select <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
