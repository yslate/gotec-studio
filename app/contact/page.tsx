'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { useSettings } from '@/lib/use-settings';

export default function ContactPage() {
  const s = useSettings(['contact.title', 'contact.intro', 'contact.successTitle', 'contact.successText']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || 'Failed to send');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-xl flex-1">
        <h1 className="text-3xl font-bold text-primary mb-6">
          {s['contact.title']}
        </h1>

        <p className="text-base text-foreground/80 mb-6 text-justify">
          {s['contact.intro']}
        </p>
        <div className="mb-10">
          <a
            href="mailto:info@gotec-records.com"
            className="inline-flex items-center border px-5 py-2.5 text-xs uppercase tracking-widest text-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            info@gotec-records.com
          </a>
        </div>

        {success ? (
          <div className="border border-primary/30 p-8 text-center">
            <p className="text-sm text-primary font-medium mb-2">{s['contact.successTitle']}</p>
            <p className="text-xs text-muted-foreground">
              {s['contact.successText']}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm text-foreground/70 mb-1.5">
                  Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-foreground/70 mb-1.5">
                  Email *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm text-foreground/70 mb-1.5">
                Subject *
              </label>
              <Input
                id="subject"
                name="subject"
                required
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-foreground/70 mb-1.5">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Your message..."
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
