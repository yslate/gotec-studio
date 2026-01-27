'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    artistName: string;
    date: string;
    startTime: string;
    endTime: string;
    maxCardholders: number;
    maxWaitlist: number;
    description?: string | null;
    bookedCount: number;
    waitlistCount: number;
  };
}

export function SessionCard({ session }: SessionCardProps) {
  const available = session.maxCardholders - session.bookedCount;
  const waitlistAvailable = session.maxWaitlist - session.waitlistCount;
  const isFull = available <= 0 && waitlistAvailable <= 0;

  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{session.title}</CardTitle>
            <CardDescription className="mt-1">{session.artistName}</CardDescription>
          </div>
          {isFull ? (
            <Badge variant="secondary">Ausgebucht</Badge>
          ) : available <= 0 ? (
            <Badge variant="outline">Nur Warteliste</Badge>
          ) : available <= 3 ? (
            <Badge variant="destructive">Nur noch {available} Plätze</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Datum:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Uhrzeit:</span>
            <span>{session.startTime} - {session.endTime}</span>
          </div>
          {session.description && (
            <p className="pt-2 line-clamp-2">{session.description}</p>
          )}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Verfügbar: </span>
            <span className="font-medium">{Math.max(0, available)}/{session.maxCardholders}</span>
          </div>
          {available <= 0 && (
            <div>
              <span className="text-muted-foreground">Warteliste: </span>
              <span className="font-medium">{session.waitlistCount}/{session.maxWaitlist}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={isFull}>
          <Link href={`/book/${session.id}`}>
            {isFull ? 'Ausgebucht' : available <= 0 ? 'Auf Warteliste setzen' : 'Jetzt buchen'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
