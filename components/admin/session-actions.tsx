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
    if (!confirm('Reset session?\n\nThis marks all non-checked-in guests as no-show and expires GL tickets.')) {
      return;
    }

    setResetting(true);

    try {
      const res = await fetch(`/api/admin/sessions/${sessionId}/reset`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error resetting session');
      } else {
        alert(`Session reset!\n\n${data.stats.noShows} no-shows marked\n${data.stats.expiredTickets} GL tickets expired`);
        router.refresh();
      }
    } catch {
      alert('An error occurred');
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
        <Link href={`/admin/sessions/${sessionId}`}>Edit</Link>
      </Button>
    </div>
  );
}
