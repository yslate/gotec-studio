import Link from 'next/link';
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader heroMode />

      {/* Hero Section - pulls up behind the transparent header */}
      <section className="relative h-[70vh] min-h-[400px] flex items-center justify-center overflow-hidden -mt-[57px]">
        <Image
          src="/hero.jpg"
          alt="GOTEC Records Studio"
          fill
          className="object-cover"
          priority
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
            DJ Recording Studio &mdash; Karlsruhe
          </p>
          <Link
            href="/sessions"
            className="inline-flex items-center gap-2 border border-white/30 bg-white/5 backdrop-blur px-6 py-3 text-xs uppercase tracking-widest text-white/90 hover:bg-white/10 hover:border-white/50 transition-all"
          >
            View Sessions
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
        <h2 className="text-xs uppercase tracking-widest text-primary mb-6">About</h2>
        <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
          <p>
            Gotec Records is a professional DJ recording studio based in Karlsruhe, Germany.
            We specialize in capturing raw, unfiltered DJ sessions across various genres of
            electronic music &mdash; from hard techno and industrial to melodic techno and minimal.
          </p>
          <p>
            Our studio is built for artists who want to record their sound in a professional
            environment and become part of our curated output. Every session is captured with
            precision, delivering the energy of a live performance.
          </p>
        </div>
      </section>

      {/* Black Card Teaser */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-12">
            <div className="flex-1">
              <h2 className="text-xs uppercase tracking-widest text-primary mb-4">The Black Card</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                You don&apos;t ask for it. You earn it &mdash; by fully vibing with the music
                at Gotec Club. When your energy stands out, someone will notice and hand you
                the Black Card.
              </p>
              <Link
                href="/blackcard"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
              >
                Learn more &rarr;
              </Link>
            </div>
            <div className="sm:w-48 border p-6 text-center shrink-0">
              <p className="text-2xl font-light text-primary mb-1">100</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Cards in Circulation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Teaser */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16 sm:py-20 max-w-2xl">
          <h2 className="text-xs uppercase tracking-widest text-primary mb-4">Recording Slot Application</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            We are opening a limited number of recording slots for DJs with a clear musical
            identity and a passion for electronic music. Submit your application and become
            part of our curated output.
          </p>
          <Link
            href="/apply"
            className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            Apply now &rarr;
          </Link>
        </div>
      </section>

      {/* Contact Teaser */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-12 max-w-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-primary mb-2">Questions?</h2>
            <p className="text-sm text-muted-foreground">
              Get in touch for collaborations, feedback, or general inquiries.
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
              className="inline-flex items-center px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              info@gotec-records.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
