'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface SessionActionsProps {
  sessionId: string;
  isPast: boolean;
}

export function SessionActions({ sessionId, isPast }: SessionActionsProps) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (!confirm('Session zurücksetzen?\n\nDies markiert alle nicht eingecheckten Gäste als No-Show und setzt GL-Tickets auf abgelaufen.')) {
      return;
    }

    setResetting(true);

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/reset`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Fehler beim Zurücksetzen');
      } else {
        alert(`Session zurückgesetzt!\n\n${data.stats.noShows} No-Shows markiert\n${data.stats.expiredTickets} GL-Tickets abgelaufen`);
        router.refresh();
      }
    } catch {
      alert('Ein Fehler ist aufgetreten');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="flex gap-1 justify-end">
      {isPast && (
        <Button
          variant="outline"
          size="xs"
          onClick={handleReset}
          disabled={resetting}
        >
          {resetting ? '...' : 'Reset'}
        </Button>
      )}
      <Button asChild variant="ghost" size="xs">
        <Link href={`/admin/sessions/${sessionId}`}>Bearbeiten</Link>
      </Button>
    </div>
  );
}
