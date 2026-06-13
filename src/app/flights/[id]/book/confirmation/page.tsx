'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Plane } from 'lucide-react';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const pnr = searchParams.get('pnr');

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>

      <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
      <p className="text-muted-foreground mb-6">Your booking has been confirmed and a confirmation email has been sent.</p>

      <div className="bg-card border rounded-lg p-8 mb-8">
        <Plane className="h-8 w-8 mx-auto mb-4 text-primary" />
        <div className="text-3xl font-mono font-bold tracking-wider text-primary mb-2">
          {pnr}
        </div>
        <p className="text-sm text-muted-foreground">Your PNR (Record Locator)</p>
        <p className="text-xs text-muted-foreground mt-4">
          Save this PNR to manage your booking and check in.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard"
          className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="border px-6 py-2 rounded-md font-medium hover:bg-accent"
        >
          Book Another Flight
        </Link>
      </div>
    </div>
  );
}
