import Link from 'next/link';
import Image from 'next/image';
import { SessionCard } from '@/components/booking/session-card';
import { Button } from '@/components/ui/button';

async function getSessions() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/sessions`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function HomePage() {
  const sessions = await getSessions();

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
                priority
              />
            </Link>
            <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
              <Link href="/my-bookings">Meine Buchungen</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Verfügbare Sessions</h2>
          <p className="text-xs text-muted-foreground">
            Wähle eine Recording Session und buche deinen Platz mit deiner Black Card
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-12 border border-dashed">
            <p className="text-muted-foreground text-sm">
              Aktuell keine Sessions verfügbar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Schau später wieder vorbei!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session: {
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
            }) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GOTEC Records. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
