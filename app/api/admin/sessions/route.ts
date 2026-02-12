import { NextRequest, NextResponse } from 'next/server';
import { db, recordingSessions, bookings, guestListTickets, checkIns } from '@/db';
import { sql, desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { createSessionSchema } from '@/lib/validations';
import { getTodayString } from '@/lib/date-utils';

// GET /api/admin/sessions - Get all sessions with stats
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
        description: recordingSessions.description,
        isPublished: recordingSessions.isPublished,
        isCancelled: recordingSessions.isCancelled,
        createdAt: recordingSessions.createdAt,
        confirmedCount: sql<number>`(
          SELECT COUNT(*) FROM ${bookings}
          WHERE ${bookings.sessionId} = ${recordingSessions.id}
          AND ${bookings.status} IN ('confirmed', 'checked_in')
        )::int`,
        waitlistCount: sql<number>`(
          SELECT COUNT(*) FROM ${bookings}
          WHERE ${bookings.sessionId} = ${recordingSessions.id}
          AND ${bookings.status} = 'waitlist'
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
      .orderBy(desc(recordingSessions.date), recordingSessions.startTime);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = createSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Prevent creating sessions in the past
    const today = getTodayString();
    if (validationResult.data.date < today) {
      return NextResponse.json(
        { error: 'Session date cannot be in the past' },
        { status: 400 }
      );
    }

    const newSession = await db
      .insert(recordingSessions)
      .values(validationResult.data)
      .returning();

    return NextResponse.json(newSession[0]);
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
