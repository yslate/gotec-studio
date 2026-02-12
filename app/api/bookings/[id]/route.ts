import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, recordingSessions, blackCards } from '@/db';
import { eq, and } from 'drizzle-orm';
import { sendCancellationNotification, sendWaitlistPromotion, fireAndForgetEmail } from '@/lib/email';

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email address required' },
        { status: 400 }
      );
    }

    // Get the booking with session and card details
    const booking = await db
      .select({
        id: bookings.id,
        sessionId: bookings.sessionId,
        guestName: bookings.guestName,
        guestEmail: bookings.guestEmail,
        status: bookings.status,
        session: {
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
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking.length) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = booking[0];

    // Verify email matches (case-insensitive)
    const normalizedEmail = email.toLowerCase();
    if (bookingData.guestEmail?.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (bookingData.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    // Check if session is in the past
    const sessionDate = new Date(bookingData.session.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      return NextResponse.json(
        { error: 'Past bookings cannot be cancelled' },
        { status: 400 }
      );
    }

    // Cancel the booking
    await db
      .update(bookings)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id));

    // Send cancellation email
    if (bookingData.guestEmail) {
      fireAndForgetEmail(
        sendCancellationNotification({
          to: bookingData.guestEmail,
          guestName: bookingData.guestName,
          sessionTitle: bookingData.session.title,
          artistName: bookingData.session.artistName,
          date: bookingData.session.date,
          cancelledByUser: true,
        }),
        `Cancellation notification to ${bookingData.guestEmail}`
      );
    }

    // If the cancelled booking was confirmed, promote the first waitlisted booking
    if (bookingData.status === 'confirmed') {
      const firstWaitlist = await db
        .select({
          id: bookings.id,
          guestName: bookings.guestName,
          guestEmail: bookings.guestEmail,
          cardId: bookings.cardId,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.sessionId, bookingData.sessionId),
            eq(bookings.status, 'waitlist')
          )
        )
        .orderBy(bookings.position)
        .limit(1);

      if (firstWaitlist.length) {
        const promotedBooking = firstWaitlist[0];

        // Get card number for the promoted booking
        const promotedCard = await db
          .select({ cardNumber: blackCards.cardNumber })
          .from(blackCards)
          .where(eq(blackCards.id, promotedBooking.cardId))
          .limit(1);

        await db
          .update(bookings)
          .set({
            status: 'confirmed',
            position: null,
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, promotedBooking.id));

        // Send waitlist promotion email
        if (promotedBooking.guestEmail) {
          fireAndForgetEmail(
            sendWaitlistPromotion({
              to: promotedBooking.guestEmail,
              guestName: promotedBooking.guestName,
              sessionTitle: bookingData.session.title,
              artistName: bookingData.session.artistName,
              date: bookingData.session.date,
              startTime: bookingData.session.startTime,
              endTime: bookingData.session.endTime,
              cardNumber: promotedCard[0]?.cardNumber || 0,
            }),
            `Waitlist promotion to ${promotedBooking.guestEmail}`
          );
        }

        // Update positions of remaining waitlist
        const remainingWaitlist = await db
          .select({ id: bookings.id, position: bookings.position })
          .from(bookings)
          .where(
            and(
              eq(bookings.sessionId, bookingData.sessionId),
              eq(bookings.status, 'waitlist')
            )
          )
          .orderBy(bookings.position);

        for (let i = 0; i < remainingWaitlist.length; i++) {
          await db
            .update(bookings)
            .set({
              position: i + 1,
              updatedAt: new Date(),
            })
            .where(eq(bookings.id, remainingWaitlist[i].id));
        }
      }
    }

    return NextResponse.json({
      message: 'Booking successfully cancelled',
    });
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    return NextResponse.json(
      { error: 'Booking could not be cancelled' },
      { status: 500 }
    );
  }
}
