import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, recordingSessions, emailVerificationCodes } from '@/db';
import { eq, and, or } from 'drizzle-orm';
import { requestVerificationSchema } from '@/lib/validations';
import { sendVerificationCode } from '@/lib/email';

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/bookings/request-verification - Step 1: Request verification code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = requestVerificationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, cardCode, guestName, guestEmail, guestPhone } = validationResult.data;
    const normalizedEmail = guestEmail.toLowerCase();

    // Get the card by code
    const card = await db
      .select()
      .from(blackCards)
      .where(eq(blackCards.code, cardCode))
      .limit(1);

    if (!card.length) {
      return NextResponse.json(
        { error: 'Invalid card code' },
        { status: 400 }
      );
    }

    const cardData = card[0];

    // Check if card is active
    if (cardData.status !== 'active') {
      const statusMessage = cardData.status === 'locked'
        ? 'This card is locked'
        : 'This card is suspended';
      return NextResponse.json(
        { error: statusMessage },
        { status: 400 }
      );
    }

    // Check if card is suspended
    if (cardData.suspendedUntil && new Date(cardData.suspendedUntil) > new Date()) {
      return NextResponse.json(
        { error: 'This card is temporarily suspended' },
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
        { error: 'Session not found or not available' },
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
        { error: 'This session has already passed' },
        { status: 400 }
      );
    }

    // Check if card already has a booking for this session
    const existingCardBooking = await db
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

    if (existingCardBooking.length) {
      return NextResponse.json(
        { error: 'This card already has a booking for this session' },
        { status: 400 }
      );
    }

    // Check if email already has a booking for this session (duplicate prevention)
    const existingEmailBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.sessionId, sessionId),
          eq(bookings.guestEmail, normalizedEmail),
          or(
            eq(bookings.status, 'confirmed'),
            eq(bookings.status, 'waitlist'),
            eq(bookings.status, 'checked_in')
          )
        )
      )
      .limit(1);

    if (existingEmailBooking.length) {
      return NextResponse.json(
        { error: 'This email address already has a booking for this session' },
        { status: 400 }
      );
    }

    // Delete any existing pending verification codes for this email+session
    await db
      .delete(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, normalizedEmail),
          eq(emailVerificationCodes.sessionId, sessionId),
          eq(emailVerificationCodes.verified, false)
        )
      );

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create verification record
    const verificationRecord = await db
      .insert(emailVerificationCodes)
      .values({
        email: normalizedEmail,
        code,
        sessionId,
        cardId: cardData.id,
        guestName,
        guestPhone: guestPhone || null,
        expiresAt,
      })
      .returning();

    // Send verification email
    sendVerificationCode({
      to: normalizedEmail,
      guestName,
      sessionTitle: sessionData.title,
      artistName: sessionData.artistName,
      date: sessionData.date,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      verificationCode: code,
      cardCode,
    }).catch(err => console.error('[API] Verification email failed:', err));

    return NextResponse.json({
      verificationId: verificationRecord[0].id,
      message: 'Verification code has been sent to your email',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Failed to request verification:', error);
    return NextResponse.json(
      { error: 'Verification could not be started' },
      { status: 500 }
    );
  }
}
