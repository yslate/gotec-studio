import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Datenschutz',
};

export default function DatenschutzPage() {
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
        <h1 className="text-2xl font-bold mb-6">Datenschutzerklärung</h1>

        <div className="prose prose-sm prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-2 text-foreground">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen
              Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit
              denen Sie persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 text-foreground">2. Datenerfassung auf dieser Website</h2>

            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">Wer ist verantwortlich für die Datenerfassung?</h3>
            <p>
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten
              können Sie dem Impressum dieser Website entnehmen.
            </p>

            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">Wie erfassen wir Ihre Daten?</h3>
            <p>
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich
              z.B. um Daten handeln, die Sie in ein Buchungsformular eingeben.
            </p>
            <p className="mt-2">
              Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere
              IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder
              Uhrzeit des Seitenaufrufs).
            </p>

            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">Wofür nutzen wir Ihre Daten?</h3>
            <p>
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten.
              Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden. Bei Buchungen werden Ihre
              Daten zur Durchführung und Verwaltung der Buchung verwendet.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 text-foreground">3. Buchungssystem</h2>
            <p>
              Bei der Buchung einer Recording Session erfassen wir folgende Daten:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name</li>
              <li>E-Mail-Adresse</li>
              <li>Telefonnummer (optional)</li>
              <li>Black Card Code</li>
            </ul>
            <p className="mt-2">
              Diese Daten werden zur Durchführung der Buchung, zur Verifizierung Ihrer Identität und zur
              Kommunikation bezüglich der Session verwendet. Die Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung).
            </p>
            <p className="mt-2">
              Ihre Buchungsdaten werden für die Dauer der Session-Planung und bis zu 30 Tage nach der Session
              gespeichert, sofern keine längere Aufbewahrung aus rechtlichen Gründen erforderlich ist.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 text-foreground">4. E-Mail-Versand</h2>
            <p>
              Wir verwenden Postmark für den Versand von E-Mails (Buchungsbestätigungen, Verifizierungscodes).
              Postmark verarbeitet Ihre E-Mail-Adresse in unserem Auftrag. Weitere Informationen finden Sie in
              der Datenschutzerklärung von Postmark:{' '}
              <a
                href="https://postmarkapp.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://postmarkapp.com/privacy-policy
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 text-foreground">5. Ihre Rechte</h2>
            <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Zur Ausübung dieser Rechte wenden Sie sich bitte an die im Impressum genannte Kontaktadresse.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2 text-foreground">6. Hosting</h2>
            <p>
              Diese Website wird bei einem externen Dienstleister gehostet. Die personenbezogenen Daten, die auf
              dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich
              v.a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten,
              Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert werden, handeln.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Stand: Januar 2026
          </p>
        </div>
      </main>
    </div>
  );
}
