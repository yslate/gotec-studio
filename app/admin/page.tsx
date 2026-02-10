import Link from 'next/link';
import { db, recordingSessions, bookings, blackCards, guestListTickets } from '@/db';
import { sql, eq, and, gte, gt, or, desc } from 'drizzle-orm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

async function getStats() {
  const today = new Date().toISOString().split('T')[0];

  // Total sessions
  const totalSessions = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recordingSessions);

  // Upcoming sessions
  const upcomingSessions = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(recordingSessions)
    .where(
      and(
        gte(recordingSessions.date, today),
        eq(recordingSessions.isCancelled, false)
      )
    );

  // Active bookings
  const activeBookings = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      or(
        eq(bookings.status, 'confirmed'),
        eq(bookings.status, 'waitlist')
      )
    );

  // Active cards
  const activeCards = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blackCards)
    .where(eq(blackCards.status, 'active'));

  // Locked cards
  const lockedCards = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blackCards)
    .where(eq(blackCards.status, 'locked'));

  // No-shows count
  const noShows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings)
    .where(eq(bookings.status, 'no_show'));

  // Today's session
  const todaySession = await db
    .select({
      id: recordingSessions.id,
      title: recordingSessions.title,
      artistName: recordingSessions.artistName,
      date: recordingSessions.date,
      startTime: recordingSessions.startTime,
      endTime: recordingSessions.endTime,
      maxCardholders: recordingSessions.maxCardholders,
      bookedCount: sql<number>`(
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
      guestListUsedCount: sql<number>`(
        SELECT COUNT(*) FROM ${guestListTickets}
        WHERE ${guestListTickets.sessionId} = ${recordingSessions.id}
        AND ${guestListTickets.status} = 'used'
      )::int`,
    })
    .from(recordingSessions)
    .where(
      and(
        eq(recordingSessions.date, today),
        eq(recordingSessions.isCancelled, false)
      )
    )
    .limit(1);

  // Next upcoming session (if no today session)
  const nextSession = !todaySession[0] ? await db
    .select({
      id: recordingSessions.id,
      title: recordingSessions.title,
      artistName: recordingSessions.artistName,
      date: recordingSessions.date,
      startTime: recordingSessions.startTime,
      bookedCount: sql<number>`(
        SELECT COUNT(*) FROM ${bookings}
        WHERE ${bookings.sessionId} = ${recordingSessions.id}
        AND ${bookings.status} IN ('confirmed', 'checked_in')
      )::int`,
      maxCardholders: recordingSessions.maxCardholders,
    })
    .from(recordingSessions)
    .where(
      and(
        gt(recordingSessions.date, today),
        eq(recordingSessions.isCancelled, false),
        eq(recordingSessions.isPublished, true)
      )
    )
    .orderBy(recordingSessions.date, recordingSessions.startTime)
    .limit(1) : [];

  // Recent bookings
  const recentBookings = await db
    .select({
      id: bookings.id,
      guestName: bookings.guestName,
      status: bookings.status,
      createdAt: bookings.createdAt,
      sessionTitle: recordingSessions.title,
    })
    .from(bookings)
    .innerJoin(recordingSessions, eq(bookings.sessionId, recordingSessions.id))
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  return {
    totalSessions: totalSessions[0]?.count || 0,
    upcomingSessions: upcomingSessions[0]?.count || 0,
    activeBookings: activeBookings[0]?.count || 0,
    activeCards: activeCards[0]?.count || 0,
    lockedCards: lockedCards[0]?.count || 0,
    noShows: noShows[0]?.count || 0,
    todaySession: todaySession[0] || null,
    nextSession: nextSession[0] || null,
    recentBookings,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-xs text-muted-foreground">Booking system overview</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Upcoming Sessions</CardDescription>
            <CardTitle className="text-2xl">{stats.upcomingSessions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Bookings</CardDescription>
            <CardTitle className="text-2xl">{stats.activeBookings}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Cards active/locked</CardDescription>
            <CardTitle className="text-2xl">
              {stats.activeCards}
              {stats.lockedCards > 0 && (
                <span className="text-destructive text-lg ml-1">/{stats.lockedCards}</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total No-Shows</CardDescription>
            <CardTitle className="text-2xl">{stats.noShows}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {stats.todaySession ? (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge>Today</Badge>
              <CardTitle className="text-base">{stats.todaySession.title}</CardTitle>
            </div>
            <CardDescription>{stats.todaySession.artistName} • {stats.todaySession.startTime} - {stats.todaySession.endTime}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Booked</p>
                <p className="text-lg font-semibold">{stats.todaySession.bookedCount}/{stats.todaySession.maxCardholders}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Checked In</p>
                <p className="text-lg font-semibold">{stats.todaySession.checkedInCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guest List</p>
                <p className="text-lg font-semibold">{stats.todaySession.guestListCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">GL checked in</p>
                <p className="text-lg font-semibold">{stats.todaySession.guestListUsedCount}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/admin/check-in">Go to Check-in</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/sessions/${stats.todaySession.id}`}>Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : stats.nextSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Next Session</Badge>
              <CardTitle className="text-base">{stats.nextSession.title}</CardTitle>
            </div>
            <CardDescription>
              {stats.nextSession.artistName} • {new Date(stats.nextSession.date).toLocaleDateString('en-US')} • {stats.nextSession.startTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {stats.nextSession.bookedCount}/{stats.nextSession.maxCardholders} bookings
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/sessions/${stats.nextSession.id}`}>View Details</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                    <div>
                      <p className="font-medium">{booking.guestName}</p>
                      <p className="text-xs text-muted-foreground">{booking.sessionTitle}</p>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                      {booking.status === 'confirmed' ? 'Confirmed' :
                       booking.status === 'waitlist' ? 'Waitlist' :
                       booking.status === 'checked_in' ? 'Checked In' : booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/sessions/new">+ Create New Session</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/gl-tickets">Create GL Tickets</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/admin/cards">Manage Cards</Link>
            </Button>
            {stats.lockedCards > 0 && (
              <Button asChild variant="outline" size="sm" className="w-full justify-start text-destructive">
                <Link href="/admin/cards">{stats.lockedCards} locked card(s) to review</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
