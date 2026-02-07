import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export default function BlackCardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-2xl flex-1">
        <h1 className="text-xs uppercase tracking-widest text-primary mb-8">
          The Black Card
        </h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <p>
            You don&apos;t ask for it. You earn it &mdash; by fully vibing with the music
            at Gotec Club.
          </p>
          <p>
            When your energy stands out, someone will notice &mdash; and hand you the
            Black Card.
          </p>
          <p>
            It gives you one-time access to a live session at Gotec Records &mdash; a raw
            DJ recording, straight from the source.
          </p>
          <p>
            After that, the card goes back to the club &mdash; waiting for the next one
            who feels the music deep.
          </p>
          <p className="text-primary font-medium pt-4">
            Use it wisely.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link
            href="/sessions"
            className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            View Sessions &rarr;
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
