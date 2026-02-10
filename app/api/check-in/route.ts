import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, guestListTickets, checkIns, recordingSessions } from '@/db';
import { eq, and, or } from 'drizzle-orm';
import { checkInSchema } from '@/lib/validations';

// POST /api/check-in - Check in via card number or QR code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = checkInSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    let { code } = validationResult.data;
    const { sessionId } = validationResult.data;

    // Extract ticket code from URL if QR code contains a full URL (e.g. https://example.com/gl/GL-XXXXXXXX)
    const glUrlMatch = code.match(/\/gl\/(GL-[A-Z0-9]+)$/i);
    if (glUrlMatch) {
      code = glUrlMatch[1].toUpperCase();
    }

    // Verify session exists and is today
    const session = await db
      .select()
      .from(recordingSessions)
      .where(eq(recordingSessions.id, sessionId))
      .limit(1);

    if (!session.length) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = session[0];
    const today = new Date().toISOString().split('T')[0];

    if (sessionData.date !== today) {
      return NextResponse.json(
        { error: 'This session is not scheduled for today' },
        { status: 400 }
      );
    }

    // Try to parse as card number first
    const cardNumber = parseInt(code, 10);

    if (!isNaN(cardNumber) && cardNumber >= 1 && cardNumber <= 100) {
      // Check in as cardholder
      return handleCardholderCheckIn(cardNumber, sessionId);
    }

    // Otherwise treat as QR code for guest list
    return handleGuestListCheckIn(code, sessionId);
  } catch (error) {
    console.error('Check-in failed:', error);
    return NextResponse.json(
      { error: 'Check-in failed' },
      { status: 500 }
    );
  }
}

async function handleCardholderCheckIn(cardNumber: number, sessionId: string) {
  // Find the card
  const card = await db
    .select()
    .from(blackCards)
    .where(eq(blackCards.cardNumber, cardNumber))
    .limit(1);

  if (!card.length) {
    return NextResponse.json(
      { error: 'Invalid card number' },
      { status: 400 }
    );
  }

  const cardData = card[0];

  // Find the booking for this card and session
  const booking = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.sessionId, sessionId),
        eq(bookings.cardId, cardData.id),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'waitlist')
        )
      )
    )
    .limit(1);

  if (!booking.length) {
    return NextResponse.json(
      { error: 'No booking found for this card' },
      { status: 404 }
    );
  }

  const bookingData = booking[0];

  // Check if already checked in
  if (bookingData.status === 'checked_in') {
    return NextResponse.json(
      { error: 'Already checked in' },
      { status: 400 }
    );
  }

  // Check if on waitlist
  if (bookingData.status === 'waitlist') {
    return NextResponse.json(
      { error: 'You are on the waitlist. Please wait for confirmation.' },
      { status: 400 }
    );
  }

  // Update booking status
  await db
    .update(bookings)
    .set({
      status: 'checked_in',
      checkedInAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingData.id));

  // Create check-in record
  await db.insert(checkIns).values({
    sessionId,
    bookingId: bookingData.id,
    type: 'cardholder',
  });

  return NextResponse.json({
    success: true,
    type: 'cardholder',
    guestName: bookingData.guestName,
    cardNumber,
    message: `Welcome, ${bookingData.guestName}!`,
  });
}

async function handleGuestListCheckIn(code: string, sessionId: string) {
  // Find the guest list ticket
  const ticket = await db
    .select()
    .from(guestListTickets)
    .where(
      and(
        eq(guestListTickets.code, code),
        eq(guestListTickets.sessionId, sessionId)
      )
    )
    .limit(1);

  if (!ticket.length) {
    return NextResponse.json(
      { error: 'Invalid QR code' },
      { status: 404 }
    );
  }

  const ticketData = ticket[0];

  // Check ticket status
  if (ticketData.status === 'used') {
    return NextResponse.json(
      { error: 'This ticket has already been used' },
      { status: 400 }
    );
  }

  if (ticketData.status === 'expired') {
    return NextResponse.json(
      { error: 'This ticket has expired' },
      { status: 400 }
    );
  }

  // Mark ticket as used
  await db
    .update(guestListTickets)
    .set({
      status: 'used',
      usedAt: new Date(),
    })
    .where(eq(guestListTickets.id, ticketData.id));

  // Create check-in record
  await db.insert(checkIns).values({
    sessionId,
    ticketId: ticketData.id,
    type: 'guest_list',
  });

  return NextResponse.json({
    success: true,
    type: 'guest_list',
    guestName: ticketData.guestName,
    allocatedBy: ticketData.allocatedBy,
    message: `Welcome, ${ticketData.guestName}!`,
  });
}
