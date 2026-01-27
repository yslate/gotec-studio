import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/booking/booking-form';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

async function getSession(sessionId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/sessions`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  const sessions = await res.json();
  return sessions.find((s: { id: string }) => s.id === sessionId) || null;
}

export default async function BookingPage({ params }: PageProps) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);

  if (!session) {
    notFound();
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

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-md">
        <BookingForm
          sessionId={session.id}
          sessionTitle={session.title}
          artistName={session.artistName}
          date={session.date}
          startTime={session.startTime}
          endTime={session.endTime}
        />
      </main>
    </div>
  );
}
