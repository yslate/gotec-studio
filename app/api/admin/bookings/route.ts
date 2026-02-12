import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, recordingSessions } from '@/db';
import { eq, desc, and, or, gte, ilike, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { getTodayString } from '@/lib/date-utils';

// GET /api/admin/bookings - Get all bookings with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    let query = db
      .select({
        id: bookings.id,
        guestName: bookings.guestName,
        guestPhone: bookings.guestPhone,
        status: bookings.status,
        position: bookings.position,
        checkedInAt: bookings.checkedInAt,
        createdAt: bookings.createdAt,
        session: {
          id: recordingSessions.id,
          title: recordingSessions.title,
          artistName: recordingSessions.artistName,
          date: recordingSessions.date,
          startTime: recordingSessions.startTime,
        },
        card: {
          id: blackCards.id,
          cardNumber: blackCards.cardNumber,
          holderName: blackCards.holderName,
        },
      })
      .from(bookings)
      .innerJoin(recordingSessions, eq(bookings.sessionId, recordingSessions.id))
      .innerJoin(blackCards, eq(bookings.cardId, blackCards.id))
      .$dynamic();

    const conditions = [];

    if (sessionId) {
      conditions.push(eq(bookings.sessionId, sessionId));
    }

    if (status) {
      conditions.push(eq(bookings.status, status as 'confirmed' | 'waitlist' | 'cancelled' | 'checked_in' | 'no_show'));
    }

    if (upcoming) {
      const today = getTodayString();
      conditions.push(gte(recordingSessions.date, today));
    }

    if (search) {
      conditions.push(
        or(
          ilike(bookings.guestName, `%${search}%`),
          ilike(bookings.guestEmail, `%${search}%`),
          ilike(recordingSessions.title, `%${search}%`),
          ilike(recordingSessions.artistName, `%${search}%`)
        )!
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const offset = (page - 1) * limit;

    const allBookings = await query.orderBy(
      desc(recordingSessions.date),
      bookings.status,
      bookings.position
    ).limit(limit).offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .innerJoin(recordingSessions, eq(bookings.sessionId, recordingSessions.id))
      .innerJoin(blackCards, eq(bookings.cardId, blackCards.id))
      .$dynamic();

    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }

    const totalCount = await countQuery;
    const total = totalCount[0]?.count || 0;

    return NextResponse.json({
      data: allBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
