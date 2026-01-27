'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionFormProps {
  initialData?: {
    id?: string;
    title: string;
    artistName: string;
    date: string;
    startTime: string;
    endTime: string;
    maxCardholders: number;
    maxWaitlist: number;
    maxGuestList: number;
    description?: string | null;
    isPublished: boolean;
  };
  mode: 'create' | 'edit';
}

export function SessionForm({ initialData, mode }: SessionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    artistName: initialData?.artistName || '',
    date: initialData?.date || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    maxCardholders: initialData?.maxCardholders || 15,
    maxWaitlist: initialData?.maxWaitlist || 5,
    maxGuestList: initialData?.maxGuestList || 10,
    description: initialData?.description || '',
    isPublished: initialData?.isPublished || false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = mode === 'create'
        ? '/api/admin/sessions'
        : `/api/admin/sessions/${initialData?.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Fehler beim Speichern');
        setLoading(false);
        return;
      }

      router.push('/admin/sessions');
      router.refresh();
    } catch {
      setError('Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {mode === 'create' ? 'Neue Session erstellen' : 'Session bearbeiten'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-destructive text-xs p-2 border border-destructive/50 bg-destructive/10">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium">Titel</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Recording Session"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Artist</label>
              <Input
                value={formData.artistName}
                onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                placeholder="Artist Name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Datum</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Startzeit</label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Endzeit</label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Max. Karteninhaber</label>
              <Input
                type="number"
                min="1"
                max="50"
                value={formData.maxCardholders}
                onChange={(e) => setFormData({ ...formData, maxCardholders: parseInt(e.target.value) || 15 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Max. Warteliste</label>
              <Input
                type="number"
                min="0"
                max="20"
                value={formData.maxWaitlist}
                onChange={(e) => setFormData({ ...formData, maxWaitlist: parseInt(e.target.value) || 5 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Max. Gästeliste</label>
              <Input
                type="number"
                min="0"
                max="30"
                value={formData.maxGuestList}
                onChange={(e) => setFormData({ ...formData, maxGuestList: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Status</label>
              <div className="flex items-center gap-2 h-8">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPublished" className="text-xs">
                  Veröffentlicht (sichtbar für Buchungen)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Beschreibung (optional)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Zusätzliche Informationen zur Session..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Speichere...' : mode === 'create' ? 'Session erstellen' : 'Änderungen speichern'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Abbrechen
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
