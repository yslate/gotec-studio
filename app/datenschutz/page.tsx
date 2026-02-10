import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Privacy Policy',
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
              <Link href="/">Back</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-base text-foreground/80">
          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">1. Privacy at a Glance</h2>
            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">General Information</h3>
            <p className="text-justify">
              The following information provides a simple overview of what happens to your personal
              data when you visit this website. Personal data is any data that can be used to
              personally identify you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">2. Data Collection on This Website</h2>

            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">Who is responsible for data collection?</h3>
            <p className="text-justify">
              Data processing on this website is carried out by the website operator. You can find
              their contact details in the imprint of this website.
            </p>

            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">How do we collect your data?</h3>
            <p className="text-justify">
              Your data is collected in part by you providing it to us. This may include data that
              you enter into a booking form, for example.
            </p>
            <p className="mt-2 text-justify">
              Other data is collected automatically or with your consent when you visit the website
              by our IT systems. This is primarily technical data (e.g. internet browser, operating
              system, or time of page access).
            </p>

            <h3 className="text-base font-medium mt-4 mb-2 text-foreground">What do we use your data for?</h3>
            <p className="text-justify">
              Some of the data is collected to ensure the error-free provision of the website. Other
              data may be used to analyze your user behavior. When making bookings, your data is used
              to process and manage the booking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">3. Booking System</h2>
            <p className="text-justify">
              When booking a recording session, we collect the following data:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Black Card Code</li>
            </ul>
            <p className="mt-2 text-justify">
              This data is used to process the booking, verify your identity, and communicate
              regarding the session. The legal basis is Art. 6(1)(b) GDPR (performance of a
              contract).
            </p>
            <p className="mt-2 text-justify">
              Your booking data is stored for the duration of session planning and up to 30 days
              after the session, unless a longer retention period is required for legal reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">4. Email Sending</h2>
            <p className="text-justify">
              We use Postmark for sending emails (booking confirmations, verification codes).
              Postmark processes your email address on our behalf.
            </p>
            <div className="mt-3">
              <a
                href="https://postmarkapp.com/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center border px-4 py-2 text-xs text-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                Postmark Privacy Policy &rarr;
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">5. Your Rights</h2>
            <p>You have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Right of access (Art. 15 GDPR)</li>
              <li>Right to rectification (Art. 16 GDPR)</li>
              <li>Right to erasure (Art. 17 GDPR)</li>
              <li>Right to restriction of processing (Art. 18 GDPR)</li>
              <li>Right to data portability (Art. 20 GDPR)</li>
              <li>Right to object (Art. 21 GDPR)</li>
            </ul>
            <p className="mt-2 text-justify">
              To exercise these rights, please contact us using the contact details provided in the imprint.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2 text-foreground">6. Hosting</h2>
            <p className="text-justify">
              This website is hosted by an external service provider. The personal data collected on
              this website is stored on the servers of the host. This may include IP addresses,
              contact requests, meta and communication data, contract data, contact details, names,
              website access logs, and other data generated through a website.
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>
      </main>
    </div>
  );
}
