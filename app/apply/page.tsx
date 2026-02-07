'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';

export default function ApplyPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email'),
      artistName: formData.get('artistName'),
      genre: formData.get('genre'),
      artistOrigin: formData.get('artistOrigin'),
      instagramUrl: formData.get('instagramUrl') || undefined,
      soundcloudUrl: formData.get('soundcloudUrl') || undefined,
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/apply', {
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

      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-2xl flex-1">
        <h1 className="text-xs uppercase tracking-widest text-primary mb-6">
          Recording Slot Application
        </h1>

        <div className="text-sm text-muted-foreground leading-relaxed mb-10 space-y-4">
          <p>
            Gotec Records Studio is opening a limited number of recording slots for DJs
            who want to capture their sound in a professional studio environment.
          </p>
          <p>
            We are looking for DJs with a clear musical identity, a strong selection,
            and a passion for electronic music. All submissions will be carefully reviewed
            by our team. Selected artists will be contacted directly.
          </p>
        </div>

        {success ? (
          <div className="border border-primary/30 p-8 text-center">
            <p className="text-sm text-primary font-medium mb-2">Application submitted</p>
            <p className="text-xs text-muted-foreground">
              We will review your application and get back to you if selected.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
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

              <div>
                <label htmlFor="artistName" className="block text-xs text-muted-foreground mb-1.5">
                  Artist Name *
                </label>
                <Input
                  id="artistName"
                  name="artistName"
                  required
                  placeholder="Your artist name"
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-xs text-muted-foreground mb-1.5">
                  Genre *
                </label>
                <Input
                  id="genre"
                  name="genre"
                  required
                  placeholder="e.g. Hard Techno, Melodic Techno"
                />
              </div>

              <div>
                <label htmlFor="artistOrigin" className="block text-xs text-muted-foreground mb-1.5">
                  Artist Origin *
                </label>
                <Input
                  id="artistOrigin"
                  name="artistOrigin"
                  required
                  placeholder="e.g. Karlsruhe, Germany"
                />
              </div>

              <div>
                <label htmlFor="instagramUrl" className="block text-xs text-muted-foreground mb-1.5">
                  Instagram
                </label>
                <Input
                  id="instagramUrl"
                  name="instagramUrl"
                  type="url"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <label htmlFor="soundcloudUrl" className="block text-xs text-muted-foreground mb-1.5">
                  SoundCloud
                </label>
                <Input
                  id="soundcloudUrl"
                  name="soundcloudUrl"
                  type="url"
                  placeholder="https://soundcloud.com/..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs text-muted-foreground mb-1.5">
                Tell us why we should select you *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Your message..."
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Sending...' : 'Submit Application'}
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
