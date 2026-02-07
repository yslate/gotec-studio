import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, guestListTickets, recordingSessions, blackCards } from '@/db';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

const NO_SHOW_THRESHOLD = 2; // Auto-lock card after this many no-shows

// POST /api/admin/sessions/[id]/reset - Reset session (mark no-shows, archive bookings)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify session exists
    const sessionData = await db
      .select()
      .from(recordingSessions)
      .where(eq(recordingSessions.id, id))
      .limit(1);

    if (!sessionData.length) {
      return NextResponse.json({ error: 'Session nicht gefunden' }, { status: 404 });
    }

    // Get bookings that will be marked as no-shows (with card IDs)
    const noShowBookings = await db
      .select({ id: bookings.id, cardId: bookings.cardId })
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, id),
          inArray(bookings.status, ['confirmed', 'waitlist'])
        )
      );

    // Mark all 'confirmed' and 'waitlist' bookings as 'no_show'
    if (noShowBookings.length > 0) {
      await db
        .update(bookings)
        .set({
          status: 'no_show',
          updatedAt: new Date(),
        })
        .where(
          inArray(bookings.id, noShowBookings.map(b => b.id))
        );
    }

    // Get unique card IDs that have no-shows
    const cardIds = [...new Set(noShowBookings.map(b => b.cardId))];

    // Increment noShowCount for each card
    let lockedCards: number[] = [];
    for (const cardId of cardIds) {
      // Increment and get updated count
      const updatedCard = await db
        .update(blackCards)
        .set({
          noShowCount: sql`${blackCards.noShowCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(blackCards.id, cardId))
        .returning({ id: blackCards.id, noShowCount: blackCards.noShowCount });

      // Auto-lock card if threshold reached
      if (updatedCard[0] && updatedCard[0].noShowCount >= NO_SHOW_THRESHOLD) {
        await db
          .update(blackCards)
          .set({
            status: 'locked',
            notes: `Automatisch gesperrt: ${updatedCard[0].noShowCount} No-Shows`,
            updatedAt: new Date(),
          })
          .where(eq(blackCards.id, cardId));
        lockedCards.push(cardId);
      }
    }

    // Mark unused guest list tickets as expired
    const expiredGlResult = await db
      .update(guestListTickets)
      .set({
        status: 'expired',
      })
      .where(
        and(
          eq(guestListTickets.sessionId, id),
          eq(guestListTickets.status, 'valid')
        )
      )
      .returning({ id: guestListTickets.id });

    return NextResponse.json({
      success: true,
      message: lockedCards.length > 0
        ? `Session zurückgesetzt. ${lockedCards.length} Karte(n) wegen zu vieler No-Shows gesperrt.`
        : 'Session wurde zurückgesetzt',
      stats: {
        noShows: noShowBookings.length,
        expiredTickets: expiredGlResult.length,
        cardsLocked: lockedCards.length,
      },
    });
  } catch (error) {
    console.error('Failed to reset session:', error);
    return NextResponse.json(
      { error: 'Fehler beim Zurücksetzen der Session' },
      { status: 500 }
    );
  }
}
