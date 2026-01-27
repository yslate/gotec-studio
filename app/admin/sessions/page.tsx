import Link from 'next/link';
import { db, recordingSessions, bookings, guestListTickets } from '@/db';
import { sql, desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SessionActions } from '@/components/admin/session-actions';

async function getSessions() {
  const sessions = await db
    .select({
      id: recordingSessions.id,
      title: recordingSessions.title,
      artistName: recordingSessions.artistName,
      date: recordingSessions.date,
      startTime: recordingSessions.startTime,
      endTime: recordingSessions.endTime,
      maxCardholders: recordingSessions.maxCardholders,
      maxWaitlist: recordingSessions.maxWaitlist,
      maxGuestList: recordingSessions.maxGuestList,
      isPublished: recordingSessions.isPublished,
      isCancelled: recordingSessions.isCancelled,
      confirmedCount: sql<number>`(
        SELECT COUNT(*) FROM ${bookings}
        WHERE ${bookings.sessionId} = ${recordingSessions.id}
        AND ${bookings.status} IN ('confirmed', 'checked_in')
      )::int`,
      checkedInCount: sql<number>`(
        SELECT COUNT(*) FROM ${bookings}
        WHERE ${bookings.sessionId} = ${recordingSessions.id}
        AND ${bookings.status} = 'checked_in'
      )::int`,
      guestListCount: sql<number>`(
        SELECT COUNT(*) FROM ${guestListTickets}
        WHERE ${guestListTickets.sessionId} = ${recordingSessions.id}
      )::int`,
    })
    .from(recordingSessions)
    .orderBy(desc(recordingSessions.date), recordingSessions.startTime);

  return sessions;
}

export default async function AdminSessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Sessions</h1>
          <p className="text-xs text-muted-foreground">Alle Recording Sessions verwalten</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/sessions/new">+ Neue Session</Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 border border-dashed">
          <p className="text-muted-foreground text-sm">Keine Sessions vorhanden</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/admin/sessions/new">Erste Session erstellen</Link>
          </Button>
        </div>
      ) : (
        <div className="border overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Session</th>
                <th className="text-left p-3 font-medium">Datum</th>
                <th className="text-left p-3 font-medium">Buchungen</th>
                <th className="text-left p-3 font-medium">Gästeliste</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const date = new Date(session.date);
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <tr key={session.id} className="border-t">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-muted-foreground">{session.artistName}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <p>{date.toLocaleDateString('de-DE')}</p>
                        <p className="text-muted-foreground">{session.startTime} - {session.endTime}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span>{session.checkedInCount}/{session.confirmedCount}/{session.maxCardholders}</span>
                      <p className="text-muted-foreground">check/book/max</p>
                    </td>
                    <td className="p-3">
                      <span>{session.guestListCount}/{session.maxGuestList}</span>
                    </td>
                    <td className="p-3">
                      {session.isCancelled ? (
                        <Badge variant="destructive">Abgesagt</Badge>
                      ) : !session.isPublished ? (
                        <Badge variant="secondary">Entwurf</Badge>
                      ) : isPast ? (
                        <Badge variant="outline">Vergangen</Badge>
                      ) : (
                        <Badge>Aktiv</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <SessionActions sessionId={session.id} isPast={isPast} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
