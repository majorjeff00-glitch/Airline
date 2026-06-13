'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Lock } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const pnr = searchParams.get('pnr');

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          cardNumber,
          cardHolder,
          expiryDate,
          cvv,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Payment failed');
        return;
      }

      router.push(`/flights/${searchParams.get('bookingId')}/book/confirmation?pnr=${pnr}&bookingId=${bookingId}`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-card border rounded-lg p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>

        <div className="bg-muted p-3 rounded-md mb-6">
          <p className="text-sm font-medium">Booking PNR: {pnr}</p>
          <p className="text-xs text-muted-foreground mt-1">
            This is a simulated payment. Enter any dummy card details.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4242 4242 4242 4242"
              className="w-full p-2 border rounded-md bg-background"
              required
              maxLength={19}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Card Holder</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="John Doe"
              className="w-full p-2 border rounded-md bg-background"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className="w-full p-2 border rounded-md bg-background"
                required
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="w-full p-2 border rounded-md bg-background"
                required
                maxLength={4}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : <><Lock className="h-4 w-4" /> Pay Securely</>}
          </button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Your payment information is not stored. This is a simulation.
        </p>
      </div>
    </div>
  );
}
