import Link from 'next/link';
import { SessionCard } from '@/components/booking/session-card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { getSettings } from '@/lib/settings';

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

export default async function SessionsPage() {
  const [sessions, s] = await Promise.all([
    getSessions(),
    getSettings([
      'sessions.title',
      'sessions.subtitle',
      'sessions.empty',
      'sessions.emptyHint',
    ]),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 sm:py-12 flex-1 max-w-4xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">{s['sessions.title']}</h1>
            <p className="text-sm text-foreground/70">
              {s['sessions.subtitle']}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs shrink-0">
            <Link href="/my-bookings">My Bookings</Link>
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16 border border-dashed">
            <p className="text-foreground/70 text-base">
              {s['sessions.empty']}
            </p>
            <p className="text-sm text-foreground/50 mt-1">
              {s['sessions.emptyHint']}
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

      <Footer />
    </div>
  );
}
