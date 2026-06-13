'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Plane, Download, ArrowRight, Mail, ArrowLeft } from 'lucide-react';

function getAirlineColor(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'fastjet': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'skylink': 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  };
  return colors[airline.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const pnr = searchParams.get('pnr');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[var(--z-overlay)] overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#1a56db', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-blue-400 flex items-center justify-center mx-auto animate-float shadow-lg">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Your booking has been confirmed and a confirmation email is on its way.
        </p>

        <div className="border rounded-2xl p-8 bg-card shadow-lg mb-8">
          <Plane className="h-8 w-8 mx-auto mb-4 text-brand-primary" />
          <div className="text-3xl font-display font-bold tracking-[0.15em] text-brand-primary mb-2">
            {pnr}
          </div>
          <p className="text-sm text-muted-foreground mb-1">Your PNR (Record Locator)</p>
          <p className="text-xs text-muted-foreground">
            Save this code to manage your booking and check in online.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="btn-primary"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/check-in/${pnr}`}
            className="btn-secondary"
          >
            Check In Now
          </Link>
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            A confirmation email has been sent to your registered email address.
          </div>
        </div>

        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Book another flight
        </Link>
      </div>
    </>
  );
}
