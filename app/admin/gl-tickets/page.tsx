'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GLTicket {
  id: string;
  code: string;
  guestName: string;
  guestPhone: string | null;
  guestEmail: string | null;
  allocatedBy: string | null;
  status: string;
  usedAt: string | null;
  createdAt: string;
  session: {
    id: string;
    title: string;
    artistName: string;
    date: string;
    startTime: string;
    endTime: string;
  };
}

interface Session {
  id: string;
  title: string;
  artistName: string;
  date: string;
}

export default function AdminGLTicketsPage() {
  const [tickets, setTickets] = useState<GLTicket[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [allocatedBy, setAllocatedBy] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  async function fetchTickets() {
    const params = selectedSession ? `?sessionId=${selectedSession}` : '';
    const res = await fetch(`/api/admin/gl-tickets${params}`);
    if (res.ok) {
      const data = await res.json();
      setTickets(data);
    }
    setLoading(false);
  }

  async function fetchSessions() {
    const res = await fetch('/api/admin/sessions');
    if (res.ok) {
      const data = await res.json();
      // Filter to only upcoming sessions
      const today = new Date().toISOString().split('T')[0];
      const upcoming = data.filter((s: Session) => s.date >= today);
      setSessions(upcoming);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [selectedSession]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSession) {
      setFormError('Bitte wähle eine Session aus');
      return;
    }

    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    const res = await fetch('/api/admin/gl-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: selectedSession,
        guestName,
        guestPhone: guestPhone || undefined,
        guestEmail: guestEmail || undefined,
        allocatedBy: allocatedBy || undefined,
      }),
    });

    if (res.ok) {
      const emailSent = guestEmail ? ` E-Mail wurde an ${guestEmail} gesendet.` : '';
      setFormSuccess(`Ticket erstellt!${emailSent}`);
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setAllocatedBy('');
      fetchTickets();
      // Hide success message after 5 seconds
      setTimeout(() => setFormSuccess(''), 5000);
    } else {
      const data = await res.json();
      setFormError(data.error || 'Fehler beim Erstellen');
    }
    setFormLoading(false);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'valid':
        return <Badge>Gültig</Badge>;
      case 'used':
        return <Badge variant="secondary">Verwendet</Badge>;
      case 'expired':
        return <Badge variant="destructive">Abgelaufen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Gästeliste Tickets</h1>
          <p className="text-xs text-muted-foreground">GL-Tickets erstellen und verwalten</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Abbrechen' : '+ Neues Ticket'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Neues GL-Ticket erstellen</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              {formError && (
                <div className="text-destructive text-xs p-2 border border-destructive/50 bg-destructive/10">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="text-green-500 text-xs p-2 border border-green-500/50 bg-green-500/10">
                  {formSuccess}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Session</label>
                  <select
                    value={selectedSession}
                    onChange={(e) => setSelectedSession(e.target.value)}
                    className="w-full h-8 px-2 text-xs border bg-background"
                    required
                  >
                    <option value="">Session wählen...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title} - {new Date(session.date).toLocaleDateString('de-DE')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Gastname</label>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Max Mustermann"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">E-Mail *</label>
                  <Input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="max@example.com"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ticket wird per E-Mail zugestellt
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Telefon (optional)</label>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium">Eingeladen von (optional)</label>
                  <Input
                    value={allocatedBy}
                    onChange={(e) => setAllocatedBy(e.target.value)}
                    placeholder="Artist / Promoter Name"
                  />
                </div>
              </div>

              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Erstelle...' : 'Ticket erstellen'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full sm:w-auto h-8 px-2 text-xs border bg-background"
        >
          <option value="">Alle Sessions</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title} - {new Date(session.date).toLocaleDateString('de-DE')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Lade Tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 border border-dashed">
          <p className="text-muted-foreground text-sm">Keine GL-Tickets gefunden</p>
        </div>
      ) : (
        <div className="border overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Gast</th>
                <th className="text-left p-3 font-medium">Session</th>
                <th className="text-left p-3 font-medium">Eingeladen von</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t">
                  <td className="p-3">
                    <span className="font-mono font-medium">{ticket.code}</span>
                  </td>
                  <td className="p-3">
                    <div>
                      <p>{ticket.guestName}</p>
                      {ticket.guestEmail && (
                        <p className="text-muted-foreground">{ticket.guestEmail}</p>
                      )}
                      {ticket.guestPhone && (
                        <p className="text-muted-foreground">{ticket.guestPhone}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p>{ticket.session.title}</p>
                      <p className="text-muted-foreground">
                        {new Date(ticket.session.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    {ticket.allocatedBy || <span className="text-muted-foreground">-</span>}
                  </td>
                  <td className="p-3">
                    {getStatusBadge(ticket.status)}
                    {ticket.usedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ticket.usedAt).toLocaleString('de-DE')}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <a
                      href={`/gl/${ticket.code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Öffnen
                    </a>
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
