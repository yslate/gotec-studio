'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  status: string;
  position: number | null;
  guestName: string;
  guestEmail: string;
  createdAt: string;
  session: {
    id: string;
    title: string;
    artistName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  card: {
    cardNumber: number;
  };
}

export default function MyBookingsPage() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email.toLowerCase())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Fehler beim Abrufen der Buchungen');
        setBookings([]);
      } else {
        setBookings(data);
      }
    } catch {
      setError('Ein Fehler ist aufgetreten');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(bookingId: string) {
    if (!confirm('Möchtest du diese Buchung wirklich stornieren?')) {
      return;
    }

    setCancellingId(bookingId);

    try {
      const res = await fetch(`/api/bookings/${bookingId}?email=${encodeURIComponent(email.toLowerCase())}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Stornierung fehlgeschlagen');
      } else {
        // Refresh bookings
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      }
    } catch {
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setCancellingId(null);
    }
  }

  function getStatusBadge(status: string, position: number | null) {
    switch (status) {
      case 'confirmed':
        return <Badge>Bestätigt</Badge>;
      case 'waitlist':
        return <Badge variant="secondary">Warteliste #{position}</Badge>;
      case 'checked_in':
        return <Badge variant="outline">Eingecheckt</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Storniert</Badge>;
      case 'no_show':
        return <Badge variant="destructive">Nicht erschienen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/">
              <Image
                src="/LogoGotecRecords.png"
                alt="GOTEC Records"
                width={140}
                height={50}
                className="h-8 sm:h-10 w-auto"
              />
            </Link>
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
              <Link href="/">Zurück</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Buchungen abrufen</CardTitle>
            <CardDescription>
              Gib deine E-Mail-Adresse ein, um deine Buchungen zu sehen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-0 sm:flex sm:gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="w-full sm:flex-1"
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Suche...' : 'Suchen'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="text-destructive text-xs p-3 border border-destructive/50 bg-destructive/10 mb-6">
            {error}
          </div>
        )}

        {searched && bookings.length === 0 && !error && (
          <div className="text-center py-8 border border-dashed">
            <p className="text-muted-foreground text-sm">
              Keine Buchungen gefunden
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Prüfe deine E-Mail-Adresse oder buche eine Session
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/">Sessions ansehen</Link>
            </Button>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const sessionDate = new Date(booking.session.date);
              const isPast = sessionDate < new Date(new Date().setHours(0, 0, 0, 0));
              const canCancel = !isPast && !['cancelled', 'checked_in', 'no_show'].includes(booking.status);

              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{booking.session.title}</CardTitle>
                        <CardDescription>{booking.session.artistName}</CardDescription>
                      </div>
                      {getStatusBadge(booking.status, booking.position)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Datum: </span>
                        <span className="font-medium">
                          {sessionDate.toLocaleDateString('de-DE', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Uhrzeit: </span>
                        <span className="font-medium">
                          {booking.session.startTime} - {booking.session.endTime}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Name: </span>
                        <span className="font-medium">{booking.guestName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Karte: </span>
                        <span className="font-medium">#{booking.card.cardNumber}</span>
                      </div>
                    </div>
                  </CardContent>
                  {canCancel && (
                    <CardFooter>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'Storniere...' : 'Stornieren'}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
