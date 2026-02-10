'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Session {
  id: string;
  title: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
  maxGuestList: number;
  guestListCount: number;
}

interface DJGuestListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: Session[];
  onSuccess: () => void;
}

export function DJGuestListDialog({ open, onOpenChange, sessions, onSuccess }: DJGuestListDialogProps) {
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [djEmail, setDjEmail] = useState('');
  const [ticketCount, setTicketCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const available = selectedSession
    ? selectedSession.maxGuestList - selectedSession.guestListCount
    : 0;

  useEffect(() => {
    if (!open) {
      setSelectedSessionId('');
      setDjEmail('');
      setTicketCount(5);
      setError('');
      setSuccess('');
    }
  }, [open]);

  useEffect(() => {
    if (ticketCount > available && available > 0) {
      setTicketCount(available);
    }
  }, [selectedSessionId, available, ticketCount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSessionId || !djEmail || ticketCount < 1) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/gl-tickets/dj-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          djEmail,
          ticketCount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`${data.ticketCount} tickets sent to ${djEmail}!`);
        onSuccess();
        setTimeout(() => onOpenChange(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || 'Error sending');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send DJ Guest List</DialogTitle>
          <DialogDescription>
            Send multiple GL tickets bundled to a DJ via email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-destructive text-xs p-2 border border-destructive/50 bg-destructive/10">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-xs p-2 border border-green-500/50 bg-green-500/10">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium">Session</label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full h-8 px-2 text-xs border bg-background"
              required
            >
              <option value="">Choose session...</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title} ({session.artistName}) – {new Date(session.date).toLocaleDateString('en-US')}
                </option>
              ))}
            </select>
          </div>

          {selectedSession && (
            <div className="text-xs p-2 border bg-muted/30">
              <span className="text-muted-foreground">Available spots:</span>{' '}
              <strong>{available}</strong> von {selectedSession.maxGuestList}
              {available === 0 && (
                <span className="text-destructive ml-2">– Guest list full</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium">DJ E-Mail</label>
            <Input
              type="email"
              value={djEmail}
              onChange={(e) => setDjEmail(e.target.value)}
              placeholder="dj@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Number of Tickets</label>
            <Input
              type="number"
              min={1}
              max={available || 1}
              value={ticketCount}
              onChange={(e) => setTicketCount(Number(e.target.value))}
              required
              disabled={!selectedSession || available === 0}
            />
          </div>

          {selectedSession && ticketCount > 0 && available > 0 && (
            <div className="text-xs text-muted-foreground p-2 border border-dashed">
              {ticketCount} ticket{ticketCount > 1 ? 's' : ''} will be created as{' '}
              <span className="text-foreground font-medium">
                &quot;Guest of {selectedSession.artistName} #1
                {ticketCount > 1 ? `–#${ticketCount}` : ''}&quot;
              </span>{' '}
              and sent to <span className="text-foreground font-medium">{djEmail || '...'}</span>.
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !selectedSession || available === 0 || ticketCount < 1}
            >
              {loading ? 'Sending...' : 'Send Tickets'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
