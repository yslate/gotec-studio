'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { useSettings } from '@/lib/use-settings';

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

function formatSlotDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function ApplyPage() {
  const s = useSettings(['apply.title', 'apply.intro1', 'apply.intro2', 'apply.successTitle', 'apply.successText']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [slotPage, setSlotPage] = useState(0);
  const SLOTS_PER_PAGE = 5;

  useEffect(() => {
    async function fetchSlots() {
      try {
        const res = await fetch('/api/slots');
        if (res.ok) {
          setSlots(await res.json());
        }
      } catch {
        // Silently fail - slots are optional
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, []);

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
      slotId: selectedSlotId || undefined,
    };

    try {
      const res = await fetch('/api/apply', {
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

      <main className="container mx-auto px-4 py-12 sm:py-20 max-w-2xl flex-1">
        <h1 className="text-3xl font-bold text-primary mb-6">
          {s['apply.title']}
        </h1>

        <div className="text-base text-foreground/80 leading-relaxed mb-10 space-y-4 text-justify">
          <p>{s['apply.intro1']}</p>
          <p>{s['apply.intro2']}</p>
        </div>

        {success ? (
          <div className="border border-primary/30 p-8 text-center">
            <p className="text-sm text-primary font-medium mb-2">{s['apply.successTitle']}</p>
            <p className="text-xs text-muted-foreground">
              {s['apply.successText']}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Slot Selection */}
            <div>
              <label className="block text-sm text-foreground/70 mb-2">
                Select a recording slot
              </label>
              {slotsLoading ? (
                <p className="text-xs text-muted-foreground">Loading slots...</p>
              ) : slots.length === 0 ? (
                <p className="text-xs text-muted-foreground border border-dashed p-4 text-center">
                  No slots currently available. Applications are only possible with an available slot.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid gap-2">
                    {slots.slice(slotPage * SLOTS_PER_PAGE, (slotPage + 1) * SLOTS_PER_PAGE).map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(selectedSlotId === slot.id ? null : slot.id)}
                        className={`w-full text-left p-3 border text-sm transition-colors ${
                          selectedSlotId === slot.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <span className="font-medium">{formatSlotDate(slot.date)}</span>
                        <span className="text-muted-foreground ml-2">
                          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                        </span>
                      </button>
                    ))}
                  </div>
                  {slots.length > SLOTS_PER_PAGE && (
                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        disabled={slotPage === 0}
                        onClick={() => setSlotPage((p) => p - 1)}
                      >
                        &larr; Back
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {slotPage + 1} / {Math.ceil(slots.length / SLOTS_PER_PAGE)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        disabled={(slotPage + 1) * SLOTS_PER_PAGE >= slots.length}
                        onClick={() => setSlotPage((p) => p + 1)}
                      >
                        Next &rarr;
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
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

              <div>
                <label htmlFor="artistName" className="block text-sm text-foreground/70 mb-1.5">
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
                <label htmlFor="genre" className="block text-sm text-foreground/70 mb-1.5">
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
                <label htmlFor="artistOrigin" className="block text-sm text-foreground/70 mb-1.5">
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
                <label htmlFor="instagramUrl" className="block text-sm text-foreground/70 mb-1.5">
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
                <label htmlFor="soundcloudUrl" className="block text-sm text-foreground/70 mb-1.5">
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
              <label htmlFor="message" className="block text-sm text-foreground/70 mb-1.5">
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

            <Button type="submit" disabled={loading || !selectedSlotId} className="w-full sm:w-auto">
              {loading ? 'Sending...' : 'Submit Application'}
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
