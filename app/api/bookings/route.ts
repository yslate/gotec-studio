import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, recordingSessions } from '@/db';
import { eq, and, sql, or } from 'drizzle-orm';
import { createBookingSchema, lookupBookingsSchema } from '@/lib/validations';
import { sendBookingConfirmation } from '@/lib/email';

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, cardNumber, guestName, guestEmail, guestPhone } = validationResult.data;

    // Get the card
    const card = await db
      .select()
      .from(blackCards)
      .where(eq(blackCards.cardNumber, cardNumber))
      .limit(1);

    if (!card.length) {
      return NextResponse.json(
        { error: 'Ungültige Kartennummer' },
        { status: 400 }
      );
    }

    const cardData = card[0];

    // Check if card is active
    if (cardData.status !== 'active') {
      const statusMessage = cardData.status === 'locked'
        ? 'Diese Karte ist gesperrt'
        : 'Diese Karte ist suspendiert';
      return NextResponse.json(
        { error: statusMessage },
        { status: 400 }
      );
    }

    // Check if card is suspended
    if (cardData.suspendedUntil && new Date(cardData.suspendedUntil) > new Date()) {
      return NextResponse.json(
        { error: 'Diese Karte ist vorübergehend suspendiert' },
        { status: 400 }
      );
    }

    // Get the session
    const session = await db
      .select()
      .from(recordingSessions)
      .where(
        and(
          eq(recordingSessions.id, sessionId),
          eq(recordingSessions.isPublished, true),
          eq(recordingSessions.isCancelled, false)
        )
      )
      .limit(1);

    if (!session.length) {
      return NextResponse.json(
        { error: 'Session nicht gefunden oder nicht verfügbar' },
        { status: 404 }
      );
    }

    const sessionData = session[0];

    // Check if session date is in the future
    const sessionDate = new Date(sessionData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      return NextResponse.json(
        { error: 'Diese Session ist bereits vorbei' },
        { status: 400 }
      );
    }

    // Check if card already has a booking for this session
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          eq(bookings.cardId, cardData.id),
          or(
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'waitlist'),
            eq(bookings.status, 'checked_in')
          )
        )
      )
      .limit(1);

    if (existingBooking.length) {
      return NextResponse.json(
        { error: 'Du hast bereits eine Buchung für diese Session' },
        { status: 400 }
      );
    }

    // Count current confirmed bookings
    const confirmedCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          or(
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'checked_in')
          )
        )
      );

    const currentConfirmed = confirmedCount[0]?.count || 0;

    // Count current waitlist
    const waitlistCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          eq(bookings.status, 'waitlist')
        )
      );

    const currentWaitlist = waitlistCount[0]?.count || 0;

    // Determine booking status
    let bookingStatus: 'confirmed' | 'waitlist';
    let position: number | null = null;

    if (currentConfirmed < sessionData.maxCardholders) {
      bookingStatus = 'confirmed';
    } else if (currentWaitlist < sessionData.maxWaitlist) {
      bookingStatus = 'waitlist';
      position = currentWaitlist + 1;
    } else {
      return NextResponse.json(
        { error: 'Diese Session ist leider voll' },
        { status: 400 }
      );
    }

    // Create the booking - email is required, phone is optional
    const newBooking = await db
      .insert(bookings)
      .values({
        sessionId,
        cardId: cardData.id,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        status: bookingStatus,
        position,
      })
      .returning();

    // Send confirmation email (required - email is mandatory now)
    sendBookingConfirmation({
      to: guestEmail,
      guestName,
      sessionTitle: sessionData.title,
      artistName: sessionData.artistName,
      date: sessionData.date,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      cardNumber,
      status: bookingStatus,
      position: position ?? undefined,
    }).catch(err => console.error('[API] Email send failed:', err));

    return NextResponse.json({
      booking: newBooking[0],
      message: bookingStatus === 'confirmed'
        ? 'Buchung erfolgreich bestätigt!'
        : `Du bist auf der Warteliste (Position ${position})`,
    });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json(
      { error: 'Buchung konnte nicht erstellt werden' },
      { status: 500 }
    );
  }
}

// GET /api/bookings?email=xxx - Get bookings by email address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse erforderlich' },
        { status: 400 }
      );
    }

    const validationResult = lookupBookingsSchema.safeParse({ email });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    const normalizedEmail = validationResult.data.email.toLowerCase();

    const userBookings = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        position: bookings.position,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        createdAt: bookings.createdAt,
        session: {
          id: recordingSessions.id,
          title: recordingSessions.title,
          artistName: recordingSessions.artistName,
          date: recordingSessions.date,
          startTime: recordingSessions.startTime,
          endTime: recordingSessions.endTime,
        },
        card: {
          cardNumber: blackCards.cardNumber,
        },
      })
      .from(bookings)
      .innerJoin(recordingSessions, eq(bookings.sessionId, recordingSessions.id))
      .innerJoin(blackCards, eq(bookings.cardId, blackCards.id))
      .where(eq(bookings.guestEmail, normalizedEmail))
      .orderBy(recordingSessions.date);

    return NextResponse.json(userBookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json(
      { error: 'Buchungen konnten nicht abgerufen werden' },
      { status: 500 }
    );
  }
}
