'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Application {
  id: string;
  email: string;
  artistName: string;
  genre: string;
  artistOrigin: string;
  instagramUrl: string | null;
  soundcloudUrl: string | null;
  message: string;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  new: 'Neu',
  reviewed: 'Geprüft',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  new: 'default',
  reviewed: 'secondary',
  accepted: 'outline',
  rejected: 'destructive',
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      setLoading(true);
      const res = await fetch('/api/admin/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
      setLoading(false);
    }
    fetchApplications();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (selected?.id === id) setSelected(updated);
    }
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Bewerbungen</h1>
        <div className="flex gap-1">
          {['all', 'new', 'reviewed', 'accepted', 'rejected'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              className="text-xs"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Alle' : statusLabels[f]}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Laden...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed">
          <p className="text-sm text-muted-foreground">Keine Bewerbungen</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 space-y-1">
            {filtered.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className={`w-full text-left p-3 border text-sm transition-colors ${
                  selected?.id === app.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium truncate">{app.artistName}</span>
                  <Badge variant={statusVariants[app.status]} className="text-[10px] shrink-0">
                    {statusLabels[app.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {app.genre} &middot; {app.artistOrigin}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(app.createdAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="w-[400px] border p-4 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-sm">{selected.artistName}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelected(null)}
                >
                  &times;
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">E-Mail: </span>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                </div>
                <div>
                  <span className="text-muted-foreground">Genre: </span>
                  <span>{selected.genre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Origin: </span>
                  <span>{selected.artistOrigin}</span>
                </div>
                {selected.instagramUrl && (
                  <div>
                    <span className="text-muted-foreground">Instagram: </span>
                    <a
                      href={selected.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selected.instagramUrl}
                    </a>
                  </div>
                )}
                {selected.soundcloudUrl && (
                  <div>
                    <span className="text-muted-foreground">SoundCloud: </span>
                    <a
                      href={selected.soundcloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {selected.soundcloudUrl}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Datum: </span>
                  <span>
                    {new Date(selected.createdAt).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-2">Nachricht:</p>
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="border-t pt-4 flex flex-wrap gap-2">
                {selected.status === 'new' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'reviewed')}
                  >
                    Als geprüft markieren
                  </Button>
                )}
                {selected.status !== 'accepted' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'accepted')}
                  >
                    Annehmen
                  </Button>
                )}
                {selected.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'rejected')}
                  >
                    Ablehnen
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
