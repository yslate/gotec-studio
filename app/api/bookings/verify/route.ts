import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, recordingSessions, emailVerificationCodes } from '@/db';
import { eq, and, sql, or } from 'drizzle-orm';
import { verifyAndBookSchema } from '@/lib/validations';
import { sendBookingConfirmation } from '@/lib/email';

// POST /api/bookings/verify - Step 2: Verify code and complete booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = verifyAndBookSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { verificationId, code } = validationResult.data;

    // Get the verification record
    const verification = await db
      .select({
        id: emailVerificationCodes.id,
        email: emailVerificationCodes.email,
        code: emailVerificationCodes.code,
        sessionId: emailVerificationCodes.sessionId,
        cardId: emailVerificationCodes.cardId,
        guestName: emailVerificationCodes.guestName,
        guestPhone: emailVerificationCodes.guestPhone,
        verified: emailVerificationCodes.verified,
        expiresAt: emailVerificationCodes.expiresAt,
      })
      .from(emailVerificationCodes)
      .where(eq(emailVerificationCodes.id, verificationId))
      .limit(1);

    if (!verification.length) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    const verificationData = verification[0];

    // Check if already verified
    if (verificationData.verified) {
      return NextResponse.json(
        { error: 'This verification has already been used' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(verificationData.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (verificationData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Get card info
    const card = await db
      .select()
      .from(blackCards)
      .where(eq(blackCards.id, verificationData.cardId))
      .limit(1);

    if (!card.length) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 400 }
      );
    }

    const cardData = card[0];

    // Re-check card status (might have changed since verification request)
    if (cardData.status !== 'active') {
      return NextResponse.json(
        { error: 'This card is no longer active' },
        { status: 400 }
      );
    }

    // Get session info
    const session = await db
      .select()
      .from(recordingSessions)
      .where(eq(recordingSessions.id, verificationData.sessionId))
      .limit(1);

    if (!session.length) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = session[0];

    // Re-check for duplicate bookings (might have changed since verification request)
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, verificationData.sessionId),
          or(
            eq(bookings.cardId, cardData.id),
            eq(bookings.guestEmail, verificationData.email)
          ),
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
        { error: 'A booking already exists for this card or email' },
        { status: 400 }
      );
    }

    // Count current confirmed bookings
    const confirmedCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, verificationData.sessionId),
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
          eq(bookings.sessionId, verificationData.sessionId),
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
        { error: 'This session is unfortunately full' },
        { status: 400 }
      );
    }

    // Create the booking
    const newBooking = await db
      .insert(bookings)
      .values({
        sessionId: verificationData.sessionId,
        cardId: cardData.id,
        guestName: verificationData.guestName,
        guestEmail: verificationData.email,
        guestPhone: verificationData.guestPhone,
        status: bookingStatus,
        position,
      })
      .returning();

    // Mark verification as used
    await db
      .update(emailVerificationCodes)
      .set({ verified: true })
      .where(eq(emailVerificationCodes.id, verificationId));

    // Send confirmation email
    sendBookingConfirmation({
      to: verificationData.email,
      guestName: verificationData.guestName,
      sessionTitle: sessionData.title,
      artistName: sessionData.artistName,
      date: sessionData.date,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      cardNumber: cardData.cardNumber,
      status: bookingStatus,
      position: position ?? undefined,
    }).catch(err => console.error('[API] Email send failed:', err));

    return NextResponse.json({
      booking: newBooking[0],
      message: bookingStatus === 'confirmed'
        ? 'Booking successfully confirmed!'
        : `You are on the waitlist (position ${position})`,
    });
  } catch (error) {
    console.error('Failed to verify and create booking:', error);
    return NextResponse.json(
      { error: 'Booking could not be created' },
      { status: 500 }
    );
  }
}
