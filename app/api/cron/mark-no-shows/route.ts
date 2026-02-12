import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, recordingSessions } from '@/db';
import { eq, and, lt, sql } from 'drizzle-orm';
import { getTodayString } from '@/lib/date-utils';

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// No-show suspension threshold
const NO_SHOW_SUSPEND_THRESHOLD = 3;
const SUSPEND_DAYS = 30;

// GET /api/cron/mark-no-shows - Mark confirmed bookings for past sessions as no-show
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = getTodayString();

    // Find confirmed bookings for sessions that have already passed
    const noShowBookings = await db
      .select({
        bookingId: bookings.id,
        cardId: bookings.cardId,
        guestName: bookings.guestName,
      })
      .from(bookings)
      .innerJoin(recordingSessions, eq(bookings.sessionId, recordingSessions.id))
      .where(
        and(
          eq(bookings.status, 'confirmed'),
          lt(recordingSessions.date, today),
          eq(recordingSessions.isCancelled, false)
        )
      );

    if (noShowBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No no-shows to process',
        stats: { marked: 0, suspended: 0 },
      });
    }

    let marked = 0;
    let suspended = 0;

    for (const booking of noShowBookings) {
      // Mark booking as no_show
      await db
        .update(bookings)
        .set({ status: 'no_show', updatedAt: new Date() })
        .where(eq(bookings.id, booking.bookingId));
      marked++;

      // Increment noShowCount on the card
      await db
        .update(blackCards)
        .set({
          noShowCount: sql`${blackCards.noShowCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(blackCards.id, booking.cardId));

      // Check if card should be suspended
      const card = await db
        .select({ noShowCount: blackCards.noShowCount, status: blackCards.status })
        .from(blackCards)
        .where(eq(blackCards.id, booking.cardId))
        .limit(1);

      if (card.length && card[0].noShowCount >= NO_SHOW_SUSPEND_THRESHOLD && card[0].status === 'active') {
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + SUSPEND_DAYS);

        await db
          .update(blackCards)
          .set({
            status: 'suspended',
            suspendedUntil: suspendUntil,
            updatedAt: new Date(),
          })
          .where(eq(blackCards.id, booking.cardId));
        suspended++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed no-shows`,
      stats: { marked, suspended },
    });
  } catch (error) {
    console.error('Failed to mark no-shows:', error);
    return NextResponse.json(
      { error: 'Failed to process no-shows' },
      { status: 500 }
    );
  }
}
