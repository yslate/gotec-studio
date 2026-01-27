import { NextResponse } from 'next/server';
import { db, blackCards, bookings } from '@/db';
import { getAdminSession } from '@/lib/admin-auth';
import { sql } from 'drizzle-orm';

// GET /api/admin/cards - Get all cards with stats
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards = await db
      .select({
        id: blackCards.id,
        cardNumber: blackCards.cardNumber,
        code: blackCards.code,
        holderName: blackCards.holderName,
        holderEmail: blackCards.holderEmail,
        status: blackCards.status,
        createdAt: blackCards.createdAt,
        totalBookings: sql<number>`(
          SELECT COUNT(*) FROM bookings
          WHERE bookings.card_id = black_cards.id
        )::int`,
        activeBookings: sql<number>`(
          SELECT COUNT(*) FROM bookings
          WHERE bookings.card_id = black_cards.id
          AND bookings.status IN ('confirmed', 'waitlist')
        )::int`,
      })
      .from(blackCards)
      .orderBy(blackCards.cardNumber);

    return NextResponse.json(cards);
  } catch (error) {
    console.error('Failed to fetch cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards', details: String(error) },
      { status: 500 }
    );
  }
}
