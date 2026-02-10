'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BookingFormProps {
  sessionId: string;
  sessionTitle: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
}

type FormStep = 'details' | 'verification' | 'success';

export function BookingForm({
  sessionId,
  sessionTitle,
  artistName,
  date,
  startTime,
  endTime,
}: BookingFormProps) {
  const router = useRouter();

  // Form state
  const [cardCode, setCardCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Verification state
  const [step, setStep] = useState<FormStep>('details');
  const [verificationId, setVerificationId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ message: string; status: string } | null>(null);

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format card code as user types (auto uppercase and add BC- prefix if needed)
  function handleCardCodeChange(value: string) {
    let formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    // Auto-add BC- prefix if user starts typing without it
    if (formatted.length > 0 && !formatted.startsWith('BC-') && !formatted.startsWith('BC')) {
      formatted = 'BC-' + formatted;
    } else if (formatted === 'B') {
      formatted = 'BC-';
    } else if (formatted === 'BC') {
      formatted = 'BC-';
    }

    // Limit length
    if (formatted.length > 9) {
      formatted = formatted.slice(0, 9);
    }

    setCardCode(formatted);
  }

  // Step 1: Request verification code
  async function handleRequestVerification(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/bookings/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          cardCode,
          guestName,
          guestEmail,
          guestPhone: guestPhone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      setVerificationId(data.verificationId);
      setExpiresAt(new Date(data.expiresAt));
      setStep('verification');
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify code and complete booking
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/bookings/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        setLoading(false);
        return;
      }

      setSuccess({
        message: data.message,
        status: data.booking.status,
      });
      setStep('success');
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  // Resend verification code
  async function handleResendCode() {
    setStep('details');
    setVerificationCode('');
    setError('');
  }

  // Success screen
  if (step === 'success' && success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {success.status === 'confirmed' ? 'Booking confirmed!' : 'On the waitlist'}
          </CardTitle>
          <CardDescription>{success.message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border bg-muted/30 space-y-2 text-xs">
            <p><span className="font-medium">Session:</span> {sessionTitle}</p>
            <p><span className="font-medium">Artist:</span> {artistName}</p>
            <p><span className="font-medium">Date:</span> {formattedDate}</p>
            <p><span className="font-medium">Time:</span> {startTime} - {endTime}</p>
            <p><span className="font-medium">Name:</span> {guestName}</p>
            <p><span className="font-medium">Card:</span> {cardCode}</p>
          </div>

          <div className="p-3 border border-primary/30 bg-primary/5 text-xs">
            <p className="font-medium text-primary">Email Confirmation</p>
            <p className="text-muted-foreground mt-1">
              A confirmation email has been sent to <strong>{guestEmail}</strong>.
              Please also check your spam folder.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
              Back to Overview
            </Button>
            <Button onClick={() => router.push('/my-bookings')} className="flex-1">
              My Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verification code entry screen
  if (step === 'verification') {
    const isExpired = expiresAt ? new Date() > expiresAt : false;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirm Email</CardTitle>
          <CardDescription>
            A 6-digit code has been sent to <strong>{guestEmail}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="text-destructive text-xs p-2 border border-destructive/50 bg-destructive/10">
                {error}
              </div>
            )}

            {isExpired && (
              <div className="text-destructive text-xs p-2 border border-destructive/50 bg-destructive/10">
                Code expired. Please request a new code.
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="verificationCode" className="text-xs font-medium">
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="text-center text-2xl tracking-widest font-mono"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-center">
                Also check your spam folder
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                className="flex-1"
              >
                Request New Code
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || verificationCode.length !== 6 || isExpired}
              >
                {loading ? 'Verifying...' : 'Confirm'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Details entry screen (Step 1)
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{sessionTitle}</CardTitle>
        <CardDescription>
          {artistName} • {formattedDate} • {startTime} - {endTime}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestVerification} className="space-y-4">
          {error && (
            <div className="text-destructive text-xs p-2 border border-destructive/50 bg-destructive/10">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="cardCode" className="text-xs font-medium">
              Black Card Code *
            </label>
            <Input
              id="cardCode"
              type="text"
              value={cardCode}
              onChange={(e) => handleCardCodeChange(e.target.value)}
              placeholder="BC-XXXXXX"
              className="font-mono uppercase"
              required
            />
            <p className="text-xs text-muted-foreground">
              The code is on your Black Card (e.g. BC-X7K9M2)
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="guestName" className="text-xs font-medium">
              Your Name *
            </label>
            <Input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Max Mustermann"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="guestEmail" className="text-xs font-medium">
              Email Address *
            </label>
            <Input
              id="guestEmail"
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="max@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              A verification code will be sent to this address
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="guestPhone" className="text-xs font-medium">
              Phone Number (optional)
            </label>
            <Input
              id="guestPhone"
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="+49 170 1234567"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending code...' : 'Request Verification Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
