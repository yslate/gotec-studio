'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Card {
  id: number;
  cardNumber: number;
  code: string;
  status: string;
  holderName: string | null;
  holderPhone: string | null;
  holderEmail: string | null;
  noShowCount: number;
  suspendedUntil: string | null;
  notes: string | null;
  totalBookings: number;
  activeBookings: number;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  async function fetchCards() {
    const res = await fetch('/api/admin/cards');
    if (res.ok) {
      const data = await res.json();
      setCards(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCards();
  }, []);

  const filteredCards = cards.filter((card) => {
    // Status filter
    if (filter !== 'all' && card.status !== filter) {
      return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const searchUpper = search.toUpperCase();
      return (
        card.cardNumber.toString().includes(search) ||
        card.code?.toUpperCase().includes(searchUpper) ||
        card.holderName?.toLowerCase().includes(searchLower) ||
        card.holderPhone?.includes(search) ||
        card.holderEmail?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  async function handleLock(cardId: number) {
    if (!confirm('Möchtest du diese Karte wirklich sperren?')) {
      return;
    }

    setActionLoading(cardId);
    const res = await fetch(`/api/admin/cards/${cardId}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Manuell gesperrt' }),
    });

    if (res.ok) {
      await fetchCards();
    } else {
      alert('Fehler beim Sperren der Karte');
    }
    setActionLoading(null);
  }

  async function handleUnlock(cardId: number) {
    setActionLoading(cardId);
    const res = await fetch(`/api/admin/cards/${cardId}/unlock`, {
      method: 'POST',
    });

    if (res.ok) {
      await fetchCards();
    } else {
      alert('Fehler beim Entsperren der Karte');
    }
    setActionLoading(null);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active':
        return <Badge>Aktiv</Badge>;
      case 'locked':
        return <Badge variant="destructive">Gesperrt</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspendiert</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Black Cards</h1>
        <p className="text-xs text-muted-foreground">Kartenstatus verwalten</p>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Suche nach Code, Name, E-Mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1">
          {['all', 'active', 'locked', 'suspended'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="xs"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'Alle' :
               status === 'active' ? 'Aktiv' :
               status === 'locked' ? 'Gesperrt' : 'Suspendiert'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Lade Karten...</p>
        </div>
      ) : (
        <div className="border overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Inhaber</th>
                <th className="text-left p-3 font-medium">Buchungen</th>
                <th className="text-left p-3 font-medium">No-Shows</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id} className="border-t">
                  <td className="p-3">
                    <div>
                      <span className="font-mono font-medium">{card.code || `#${card.cardNumber}`}</span>
                      <p className="text-muted-foreground text-xs">#{card.cardNumber}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    {card.holderName || card.holderEmail ? (
                      <div>
                        {card.holderName && <p>{card.holderName}</p>}
                        {card.holderEmail && <p className="text-muted-foreground">{card.holderEmail}</p>}
                        {card.holderPhone && <p className="text-muted-foreground">{card.holderPhone}</p>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span>{card.activeBookings} aktiv</span>
                    <span className="text-muted-foreground"> / {card.totalBookings} gesamt</span>
                  </td>
                  <td className="p-3">
                    <span className={card.noShowCount >= 2 ? 'text-destructive font-medium' : ''}>
                      {card.noShowCount}
                    </span>
                  </td>
                  <td className="p-3">
                    {getStatusBadge(card.status)}
                    {card.suspendedUntil && (
                      <p className="text-xs text-muted-foreground mt-1">
                        bis {new Date(card.suspendedUntil).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {card.status === 'active' ? (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleLock(card.id)}
                        disabled={actionLoading === card.id}
                      >
                        {actionLoading === card.id ? '...' : 'Sperren'}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleUnlock(card.id)}
                        disabled={actionLoading === card.id}
                      >
                        {actionLoading === card.id ? '...' : 'Entsperren'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
