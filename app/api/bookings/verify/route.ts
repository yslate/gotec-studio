import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, blackCards, recordingSessions, emailVerificationCodes } from '@/db';
import { eq, and, sql, or } from 'drizzle-orm';
import { verifyAndBookSchema } from '@/lib/validations';
import { sendBookingConfirmation, fireAndForgetEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// POST /api/bookings/verify - Step 2: Verify code and complete booking
export async function POST(request: NextRequest) {
  try {
    // Rate limit: max 10 verify attempts per IP per 15 minutes (brute-force protection)
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`verify:${ip}`, { maxRequests: 10, windowSeconds: 900 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      );
    }

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

    // Use a transaction with row-level lock to prevent race conditions
    // This ensures capacity check + insert are atomic
    const txResult = await db.transaction(async (tx) => {
      // Lock the session row to serialize concurrent booking attempts
      const lockedSession = await tx.execute(
        sql`SELECT * FROM ${recordingSessions} WHERE id = ${verificationData.sessionId} FOR UPDATE LIMIT 1`
      );

      if (!lockedSession.rows.length) {
        return { error: 'Session not found', status: 404 } as const;
      }

      const lockedSessionData = lockedSession.rows[0] as typeof sessionData;

      // Re-check for duplicate bookings within transaction
      const existingBooking = await tx
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
        return { error: 'A booking already exists for this card or email', status: 400 } as const;
      }

      // Count current confirmed bookings
      const confirmedCount = await tx
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
      const waitlistCount = await tx
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

      if (currentConfirmed < lockedSessionData.maxCardholders) {
        bookingStatus = 'confirmed';
      } else if (currentWaitlist < lockedSessionData.maxWaitlist) {
        bookingStatus = 'waitlist';
        position = currentWaitlist + 1;
      } else {
        return { error: 'This session is unfortunately full', status: 400 } as const;
      }

      // Create the booking
      const newBooking = await tx
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
      await tx
        .update(emailVerificationCodes)
        .set({ verified: true })
        .where(eq(emailVerificationCodes.id, verificationId));

      return { booking: newBooking[0], bookingStatus, position } as const;
    });

    // Handle transaction errors
    if ('error' in txResult) {
      return NextResponse.json(
        { error: txResult.error },
        { status: txResult.status }
      );
    }

    const { booking: newBooking, bookingStatus, position } = txResult;

    // Send confirmation email
    fireAndForgetEmail(
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
      }),
      `Booking confirmation to ${verificationData.email}`
    );

    return NextResponse.json({
      booking: newBooking,
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
