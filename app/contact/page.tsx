'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export default function ContactPage() {
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
        throw new Error(body.error || 'Fehler beim Senden');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-xl flex-1">
        <h1 className="text-xs uppercase tracking-widest text-primary mb-6">
          Contact
        </h1>

        <p className="text-sm text-muted-foreground mb-10">
          Questions, collaborations, or feedback? Send us a message or write to{' '}
          <a href="mailto:info@gotec-records.com" className="text-primary hover:underline">
            info@gotec-records.com
          </a>
        </p>

        {success ? (
          <div className="border border-primary/30 p-8 text-center">
            <p className="text-sm text-primary font-medium mb-2">Message sent</p>
            <p className="text-xs text-muted-foreground">
              We will get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="block text-xs text-muted-foreground mb-1.5">
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
                <label htmlFor="email" className="block text-xs text-muted-foreground mb-1.5">
                  E-Mail *
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
              <label htmlFor="subject" className="block text-xs text-muted-foreground mb-1.5">
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
              <label htmlFor="message" className="block text-xs text-muted-foreground mb-1.5">
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
