import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Impressum',
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
              <Link href="/">Zurück</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Impressum</h1>

        <div className="prose prose-sm prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2">Angaben gemäß § 5 TMG</h2>
            <p className="text-muted-foreground">
              GOTEC Records<br />
              [Straße und Hausnummer]<br />
              [PLZ] Karlsruhe<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Kontakt</h2>
            <p className="text-muted-foreground">
              E-Mail: info@gotec-records.de<br />
              [Telefon: +49 XXX XXXXXXX]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="text-muted-foreground">
              [Name des Verantwortlichen]<br />
              [Adresse]
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">EU-Streitschlichtung</h2>
            <p className="text-muted-foreground">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p className="text-muted-foreground mt-2">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p className="text-muted-foreground">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t text-xs text-muted-foreground">
          <p>
            <strong>Hinweis:</strong> Bitte ergänze die Platzhalter [in Klammern] mit den korrekten Angaben.
          </p>
        </div>
      </main>
    </div>
  );
}
