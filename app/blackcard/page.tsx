import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { getSettings } from '@/lib/settings';

export default async function BlackCardPage() {
  const s = await getSettings([
    'blackcard.title',
    'blackcard.text1',
    'blackcard.text2',
    'blackcard.text3',
    'blackcard.text4',
    'blackcard.text5',
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-2xl flex-1">
        <h1 className="text-3xl font-bold text-primary mb-8">
          {s['blackcard.title']}
        </h1>

        <div className="space-y-6 text-base text-foreground/80 leading-relaxed text-justify">
          <p>{s['blackcard.text1']}</p>
          <p>{s['blackcard.text2']}</p>
          <p>{s['blackcard.text3']}</p>
          <p>{s['blackcard.text4']}</p>
          <p className="text-primary font-medium pt-4">
            {s['blackcard.text5']}
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
