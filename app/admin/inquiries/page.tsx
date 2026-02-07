'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  new: 'Neu',
  read: 'Gelesen',
  archived: 'Archiviert',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  new: 'default',
  read: 'secondary',
  archived: 'outline',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Inquiry | null>(null);

  useEffect(() => {
    async function fetchInquiries() {
      setLoading(true);
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
      setLoading(false);
    }
    fetchInquiries();
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)));
      if (selected?.id === id) setSelected(updated);
    }
  }

  const filtered = filter === 'all'
    ? inquiries
    : inquiries.filter((i) => i.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium">Anfragen</h1>
        <div className="flex gap-1">
          {['all', 'new', 'read', 'archived'].map((f) => (
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
          <p className="text-sm text-muted-foreground">Keine Anfragen</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* List */}
          <div className="flex-1 space-y-1">
            {filtered.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => {
                  setSelected(inquiry);
                  if (inquiry.status === 'new') {
                    updateStatus(inquiry.id, 'read');
                  }
                }}
                className={`w-full text-left p-3 border text-sm transition-colors ${
                  selected?.id === inquiry.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium truncate">{inquiry.name}</span>
                  <Badge variant={statusVariants[inquiry.status]} className="text-[10px] shrink-0">
                    {statusLabels[inquiry.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{inquiry.subject}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(inquiry.createdAt).toLocaleDateString('de-DE', {
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
                <h2 className="font-medium text-sm">{selected.subject}</h2>
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
                  <span className="text-muted-foreground">Von: </span>
                  <span>{selected.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">E-Mail: </span>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                    {selected.email}
                  </a>
                </div>
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
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="border-t pt-4 flex gap-2">
                {selected.status !== 'read' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'read')}
                  >
                    Als gelesen markieren
                  </Button>
                )}
                {selected.status !== 'archived' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'archived')}
                  >
                    Archivieren
                  </Button>
                )}
                {selected.status === 'archived' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => updateStatus(selected.id, 'new')}
                  >
                    Wiederherstellen
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
