'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DJGuestListDialog } from '@/components/admin/dj-guest-list-dialog';

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
  startTime: string;
  endTime: string;
  maxGuestList: number;
  guestListCount: number;
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
  const [showDJDialog, setShowDJDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copyTicketLink(ticketCode: string, ticketId: string) {
    const url = `${window.location.origin}/gl/${ticketCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(ticketId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

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
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
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
      setFormError('Please select a session');
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
      const emailSent = guestEmail ? ` Email sent to ${guestEmail}.` : '';
      setFormSuccess(`Ticket created!${emailSent}`);
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setAllocatedBy('');
      fetchTickets();
      // Hide success message after 5 seconds
      setTimeout(() => setFormSuccess(''), 5000);
    } else {
      const data = await res.json();
      setFormError(data.error || 'Error creating ticket');
    }
    setFormLoading(false);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'valid':
        return <Badge>Valid</Badge>;
      case 'used':
        return <Badge variant="secondary">Used</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Guest List Tickets</h1>
          <p className="text-xs text-muted-foreground">Create and manage GL tickets</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowDJDialog(true)}>
            Send DJ Guest List
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Ticket'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New GL Ticket</CardTitle>
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
                    <option value="">Choose session...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.title} - {new Date(session.date).toLocaleDateString('en-US')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Guest Name</label>
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
                    Ticket will be delivered by email
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Phone (optional)</label>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+49 170 1234567"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium">Invited by (optional)</label>
                  <Input
                    value={allocatedBy}
                    onChange={(e) => setAllocatedBy(e.target.value)}
                    placeholder="Artist / Promoter Name"
                  />
                </div>
              </div>

              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Creating...' : 'Create Ticket'}
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
          <option value="">All Sessions</option>
          {sessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.title} - {new Date(session.date).toLocaleDateString('en-US')}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 border border-dashed">
          <p className="text-muted-foreground text-sm">No GL tickets found</p>
        </div>
      ) : (
        <div className="border overflow-x-auto">
          <table className="w-full text-xs min-w-[700px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Guest</th>
                <th className="text-left p-3 font-medium">Session</th>
                <th className="text-left p-3 font-medium">Invited by</th>
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
                        {new Date(ticket.session.date).toLocaleDateString('en-US')}
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
                        {new Date(ticket.usedAt).toLocaleString('en-US')}
                      </p>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/gl/${ticket.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={() => copyTicketLink(ticket.code, ticket.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy ticket link"
                      >
                        {copiedId === ticket.id ? (
                          <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DJGuestListDialog
        open={showDJDialog}
        onOpenChange={setShowDJDialog}
        sessions={sessions}
        onSuccess={fetchTickets}
      />
    </div>
  );
}
