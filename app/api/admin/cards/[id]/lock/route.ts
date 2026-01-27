import { NextRequest, NextResponse } from 'next/server';
import { db, blackCards } from '@/db';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';

// POST /api/admin/cards/[id]/lock - Lock a card
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || null;

    const cardId = parseInt(id, 10);
    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    const updatedCard = await db
      .update(blackCards)
      .set({
        status: 'locked',
        notes: reason ? `Gesperrt: ${reason}` : blackCards.notes,
        updatedAt: new Date(),
      })
      .where(eq(blackCards.id, cardId))
      .returning();

    if (!updatedCard.length) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCard[0]);
  } catch (error) {
    console.error('Failed to lock card:', error);
    return NextResponse.json(
      { error: 'Failed to lock card' },
      { status: 500 }
    );
  }
}
