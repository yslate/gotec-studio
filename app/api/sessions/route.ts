import { NextResponse } from 'next/server';
import { db, recordingSessions, bookings } from '@/db';
import { eq, and, gte, sql } from 'drizzle-orm';

// GET /api/sessions - Get available (published, not cancelled, future) sessions
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

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
        description: recordingSessions.description,
        bookedCount: sql<number>`(
          SELECT COUNT(*) FROM ${bookings}
          WHERE ${bookings.sessionId} = ${recordingSessions.id}
          AND ${bookings.status} IN ('confirmed', 'checked_in')
        )::int`,
        waitlistCount: sql<number>`(
          SELECT COUNT(*) FROM ${bookings}
          WHERE ${bookings.sessionId} = ${recordingSessions.id}
          AND ${bookings.status} = 'waitlist'
        )::int`,
      })
      .from(recordingSessions)
      .where(
        and(
          eq(recordingSessions.isPublished, true),
          eq(recordingSessions.isCancelled, false),
          gte(recordingSessions.date, today)
        )
      )
      .orderBy(recordingSessions.date, recordingSessions.startTime);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
