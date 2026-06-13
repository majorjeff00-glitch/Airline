'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Lock, CheckCircle, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { Stepper } from '@/components/bookings/stepper';

const STEP_LABELS = [
  { number: 1, label: 'Search' },
  { number: 2, label: 'Seats' },
  { number: 3, label: 'Passengers' },
  { number: 4, label: 'Payment' },
];

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
  const [showSummary, setShowSummary] = useState(false);
  const [success, setSuccess] = useState(false);

  const detectCardType = (num: string): string => {
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    if (num.startsWith('3')) return 'Amex';
    return '';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.slice(i, i + 4));
    }
    return groups.join(' ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length > 2) {
      setExpiryDate(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      setError('Please fill in all card details.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardHolder,
          expiryDate,
          cvv,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      setSuccess(true);
      setTimeout(() => {
        router.push(`/flights/${searchParams.get('bookingId')}/book/confirmation?pnr=${pnr}&bookingId=${bookingId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Payment could not be processed. Please check your card details.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-status-confirmed/10 flex items-center justify-center mx-auto mb-6 animate-float">
          <CheckCircle className="h-10 w-10 text-status-confirmed" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-muted-foreground">Redirecting to confirmation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-8">
        <Stepper steps={STEP_LABELS} currentStep={4} />
      </div>

      <div className="glass-card-light p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
            <Lock className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Secure Payment</h1>
            <p className="text-xs text-muted-foreground">Your payment is simulated for testing</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">Use any card number for testing — payment is simulated. No real charges will be made.</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {['Visa', 'Mastercard', 'Amex'].map((brand) => (
            <span key={brand} className={`px-2.5 py-1 rounded text-xs font-medium border ${
              detectCardType(cardNumber) === brand
                ? 'bg-brand-light text-brand-primary border-brand-primary/30'
                : 'bg-muted text-muted-foreground border-border'
            }`}>
              {brand}
            </span>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4" role="alert">
            <span>✗</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4242 4242 4242 4242"
              className="input-field font-mono"
              required
              inputMode="numeric"
              autoComplete="cc-number"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Card Holder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="John Smith"
              className="input-field"
              required
              autoComplete="cc-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="input-field"
                required
                maxLength={5}
                inputMode="numeric"
                autoComplete="cc-exp"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                CVV
                <span className="ml-1 text-muted-foreground/60 cursor-help" title="The 3-digit security code on the back of your card">ⓘ</span>
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                className="input-field"
                required
                maxLength={4}
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSummary(!showSummary)}
              className="w-full flex items-center justify-between p-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              <span>Order Summary</span>
              {showSummary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showSummary && (
              <div className="px-3 pb-3 text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">PNR</span><span className="font-mono font-medium">{pnr}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-mono text-xs">{bookingId?.slice(0, 8)}...</span></div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3 !text-base"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : (
              <><Lock className="h-4 w-4" /> Pay Securely</>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          Secured by simulated payment gateway
        </div>
      </div>
    </div>
  );
}
