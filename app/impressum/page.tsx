import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Imprint',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
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
              <Link href="/">Back</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Imprint</h1>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Information according to § 5 TMG</h2>
            <p className="text-base text-foreground/80">
              GOTEC Records<br />
              [Street and Number]<br />
              [Postal Code] Karlsruhe<br />
              Germany
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Contact</h2>
            <p className="text-base text-foreground/80">
              E-Mail: info@gotec-records.de<br />
              [Telefon: +49 XXX XXXXXXX]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Responsible for content according to § 55 Abs. 2 RStV</h2>
            <p className="text-base text-foreground/80">
              [Name of responsible person]<br />
              [Address]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">EU Dispute Resolution</h2>
            <p className="text-base text-foreground/80 text-justify">
              The European Commission provides a platform for online dispute resolution (ODR):
            </p>
            <div className="mt-3">
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border px-4 py-2 text-xs text-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                EU Online Dispute Resolution &rarr;
              </a>
            </div>
            <p className="text-base text-foreground/80 mt-3">
              You can find our email address in the imprint above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Consumer Dispute Resolution / Arbitration Body</h2>
            <p className="text-base text-foreground/80 text-justify">
              We are not willing or obligated to participate in dispute resolution proceedings before a
              consumer arbitration body.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> Please fill in the placeholders [in brackets] with the correct information.
          </p>
        </div>
      </main>
    </div>
  );
}
