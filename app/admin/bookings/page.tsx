'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { generateCheckInListPDF } from '@/lib/pdf-export';

interface Session {
  id: string;
  title: string;
  artistName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface Booking {
  id: string;
  guestName: string;
  guestPhone: string;
  status: string;
  position: number | null;
  checkedInAt: string | null;
  createdAt: string;
  session: {
    id: string;
    title: string;
    artistName: string;
    date: string;
    startTime: string;
  };
  card: {
    id: number;
    cardNumber: number;
    holderName: string | null;
  };
}

export default function AdminBookingsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch upcoming sessions
  useEffect(() => {
    async function fetchSessions() {
      const res = await fetch('/api/admin/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    }
    fetchSessions();
  }, []);

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('status', filter);
      }
      if (selectedSession) {
        params.set('sessionId', selectedSession);
      } else {
        params.set('upcoming', 'true');
      }

      const res = await fetch(`/api/admin/bookings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
      setLoading(false);
    }

    fetchBookings();
  }, [filter, selectedSession]);

  async function handleExportPDF() {
    if (!selectedSession) return;

    setExportLoading(true);
    try {
      const session = sessions.find(s => s.id === selectedSession);
      if (!session) return;

      // Fetch guest list for the session
      const glRes = await fetch(`/api/admin/sessions/${selectedSession}/guest-list`);
      const guestList = glRes.ok ? await glRes.json() : [];

      generateCheckInListPDF(
        {
          title: session.title,
          artistName: session.artistName,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
        },
        bookings.map(b => ({
          guestName: b.guestName,
          cardNumber: b.card.cardNumber,
          status: b.status,
          phone: b.guestPhone,
        })),
        guestList.map((g: { guestName: string; code: string; status: string; allocatedBy?: string }) => ({
          guestName: g.guestName,
          code: g.code,
          status: g.status,
          allocatedBy: g.allocatedBy,
        }))
      );
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setExportLoading(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      booking.guestName.toLowerCase().includes(searchLower) ||
      booking.guestPhone.includes(search) ||
      booking.card.cardNumber.toString() === search ||
      booking.session.title.toLowerCase().includes(searchLower)
    );
  });

  function getStatusBadge(status: string) {
    switch (status) {
      case 'confirmed':
        return <Badge>Confirmed</Badge>;
      case 'waitlist':
        return <Badge variant="secondary">Waitlist</Badge>;
      case 'checked_in':
        return <Badge variant="outline">Checked In</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="destructive">No-Show</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Bookings</h1>
        <p className="text-xs text-muted-foreground">Manage all bookings</p>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="h-8 px-2 text-xs border bg-background sm:w-64"
          >
            <option value="">All upcoming sessions</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} - {new Date(session.date).toLocaleDateString('en-US')}
              </option>
            ))}
          </select>
          <Input
            placeholder="Search by name, phone, card..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          {selectedSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exportLoading || bookings.length === 0}
              className="text-xs"
            >
              {exportLoading ? 'Generating...' : 'PDF Export'}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {['all', 'confirmed', 'waitlist', 'checked_in', 'cancelled'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="xs"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' :
               status === 'confirmed' ? 'Confirmed' :
               status === 'waitlist' ? 'Waitlist' :
               status === 'checked_in' ? 'Checked In' : 'Cancelled'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 border border-dashed">
          <p className="text-muted-foreground text-sm">No bookings found</p>
        </div>
      ) : (
        <div className="border overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Guest</th>
                <th className="text-left p-3 font-medium">Card</th>
                <th className="text-left p-3 font-medium">Session</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-t">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-muted-foreground">{booking.guestPhone}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono">#{booking.card.cardNumber}</span>
                  </td>
                  <td className="p-3">
                    <div>
                      <p>{booking.session.title}</p>
                      <p className="text-muted-foreground">{booking.session.artistName}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p>{new Date(booking.session.date).toLocaleDateString('en-US')}</p>
                      <p className="text-muted-foreground">{booking.session.startTime}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    {getStatusBadge(booking.status)}
                    {booking.position && (
                      <span className="text-muted-foreground ml-1">#{booking.position}</span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(booking.createdAt).toLocaleDateString('en-US')}
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
