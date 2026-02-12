import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { HeroBackground } from '@/components/hero-background';
import { getSettings } from '@/lib/settings';

export default async function HomePage() {
  const s = await getSettings([
    'homepage.hero.backgroundType',
    'homepage.hero.imageUrl',
    'homepage.hero.tagline',
    'homepage.hero.cta',
    'homepage.about.title',
    'homepage.about.text1',
    'homepage.about.text2',
    'homepage.blackcard.title',
    'homepage.blackcard.text',
    'homepage.blackcard.cta',
    'homepage.blackcard.stat',
    'homepage.blackcard.statLabel',
    'homepage.apply.title',
    'homepage.apply.text',
    'homepage.apply.cta',
    'homepage.contact.title',
    'homepage.contact.text',
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader heroMode />

      {/* Hero Section - pulls up behind the transparent header */}
      <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden -mt-[57px]">
        <HeroBackground
          backgroundType={s['homepage.hero.backgroundType']}
          imageUrl={s['homepage.hero.imageUrl']}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center gap-8">
          <Image
            src="/LogoGotecRecords.png"
            alt="GOTEC Records"
            width={320}
            height={110}
            className="h-14 sm:h-20 md:h-24 w-auto"
          />
          <p className="text-sm sm:text-base text-white/70 max-w-md tracking-wide">
            {s['homepage.hero.tagline']}
          </p>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 border border-white/30 bg-white/5 backdrop-blur px-6 py-3 text-xs uppercase tracking-widest text-white/90 hover:bg-white/10 hover:border-white/50 transition-all"
          >
            {s['homepage.hero.cta']}
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
        <h2 className="text-2xl font-bold text-primary mb-6">{s['homepage.about.title']}</h2>
        <div className="space-y-5 text-base text-foreground/80 leading-relaxed text-justify">
          <p>{s['homepage.about.text1']}</p>
          <p>{s['homepage.about.text2']}</p>
        </div>
      </section>

      {/* Black Card Teaser */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-12">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-primary mb-4">{s['homepage.blackcard.title']}</h2>
              <p className="text-base text-foreground/80 leading-relaxed mb-6 text-justify">
                {s['homepage.blackcard.text']}
              </p>
              <Link
                href="/blackcard"
                className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                {s['homepage.blackcard.cta']} &rarr;
              </Link>
            </div>
            <div className="sm:w-48 border p-6 text-center shrink-0">
              <p className="text-2xl font-light text-primary mb-1">{s['homepage.blackcard.stat']}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s['homepage.blackcard.statLabel']}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Teaser */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-2xl">
          <h2 className="text-2xl font-bold text-primary mb-4">{s['homepage.apply.title']}</h2>
          <p className="text-base text-foreground/80 leading-relaxed mb-6 text-justify">
            {s['homepage.apply.text']}
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            {s['homepage.apply.cta']} &rarr;
          </Link>
        </div>
      </section>

      {/* Contact Teaser */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-12 max-w-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">{s['homepage.contact.title']}</h2>
            <p className="text-base text-foreground/80">
              {s['homepage.contact.text']}
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <a
              href="mailto:info@gotec-records.com"
              className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
            >
              E-Mail
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
