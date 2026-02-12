'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Suspense } from 'react';

function BookingConfirmedContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || 'confirmed';
  const position = searchParams.get('position');
  const session = searchParams.get('session');

  const isWaitlist = status === 'waitlist';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-4xl">
            {isWaitlist ? '⏳' : '✓'}
          </div>
          <CardTitle className="text-xl">
            {isWaitlist ? 'Waitlist' : 'Booking Confirmed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Badge variant={isWaitlist ? 'secondary' : 'default'} className="text-sm">
            {isWaitlist ? `Position ${position}` : 'Confirmed'}
          </Badge>

          {session && (
            <p className="text-sm text-muted-foreground">
              {decodeURIComponent(session)}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            {isWaitlist
              ? 'You are on the waitlist. We will notify you by email as soon as a spot becomes available.'
              : 'A confirmation email has been sent to your email address. Please bring your Black Card to the session.'
            }
          </p>

          <div className="flex flex-col gap-2 pt-4">
            <Button asChild>
              <Link href="/my-bookings">View My Bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sessions">Browse Sessions</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <BookingConfirmedContent />
    </Suspense>
  );
}
