import { NextRequest, NextResponse } from 'next/server';
import { db, recordingSessions, bookings, guestListTickets, checkIns } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { updateSessionSchema } from '@/lib/validations';

// GET /api/admin/sessions/[id] - Get a single session with full details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const sessionData = await db
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
        updatedAt: recordingSessions.updatedAt,
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
      })
      .from(recordingSessions)
      .where(eq(recordingSessions.id, id))
      .limit(1);

    if (!sessionData.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(sessionData[0]);
  } catch (error) {
    console.error('Failed to fetch session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/sessions/[id] - Update a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validationResult = updateSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const updatedSession = await db
      .update(recordingSessions)
      .set({
        ...validationResult.data,
        updatedAt: new Date(),
      })
      .where(eq(recordingSessions.id, id))
      .returning();

    if (!updatedSession.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSession[0]);
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sessions/[id] - Delete a session (only if no bookings)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if there are any bookings
    const bookingCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(eq(bookings.sessionId, id));

    if (bookingCount[0]?.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete session with existing bookings. Cancel the session instead.' },
        { status: 400 }
      );
    }

    await db.delete(recordingSessions).where(eq(recordingSessions.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
