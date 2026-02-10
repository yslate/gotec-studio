import { NextRequest, NextResponse } from 'next/server';
import { db, bookings, recordingSessions, blackCards, guestListTickets } from '@/db';
import { eq, and, sql } from 'drizzle-orm';
import { sendSessionReminder } from '@/lib/email';

// Verify cron secret to prevent unauthorized calls
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no secret configured, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET /api/cron/send-reminders - Send reminder emails for sessions tomorrow
export async function GET(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find sessions happening tomorrow
    const sessionsData = await db
      .select({
        id: recordingSessions.id,
        title: recordingSessions.title,
        artistName: recordingSessions.artistName,
        date: recordingSessions.date,
        startTime: recordingSessions.startTime,
        endTime: recordingSessions.endTime,
      })
      .from(recordingSessions)
      .where(
        and(
          eq(recordingSessions.date, tomorrowStr),
          eq(recordingSessions.isCancelled, false)
        )
      );

    if (sessionsData.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No sessions tomorrow',
        stats: { sessions: 0, cardholderReminders: 0, glReminders: 0 },
      });
    }

    let cardholderReminders = 0;
    let glReminders = 0;
    const errors: string[] = [];

    for (const session of sessionsData) {
      // Get confirmed bookings for this session
      const confirmedBookings = await db
        .select({
          guestName: bookings.guestName,
          guestEmail: bookings.guestEmail,
          cardNumber: blackCards.cardNumber,
        })
        .from(bookings)
        .innerJoin(blackCards, eq(bookings.cardId, blackCards.id))
        .where(
          and(
            eq(bookings.sessionId, session.id),
            eq(bookings.status, 'confirmed')
          )
        );

      // Send reminders to cardholders
      for (const booking of confirmedBookings) {
        try {
          await sendSessionReminder({
            to: booking.guestEmail,
            guestName: booking.guestName,
            sessionTitle: session.title,
            artistName: session.artistName,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            cardNumber: booking.cardNumber,
            type: 'cardholder',
          });
          cardholderReminders++;
        } catch (error) {
          errors.push(`Cardholder ${booking.guestEmail}: ${error}`);
        }
      }

      // Get valid guest list tickets for this session
      const glTickets = await db
        .select({
          guestName: guestListTickets.guestName,
          guestEmail: guestListTickets.guestEmail,
          code: guestListTickets.code,
        })
        .from(guestListTickets)
        .where(
          and(
            eq(guestListTickets.sessionId, session.id),
            eq(guestListTickets.status, 'valid')
          )
        );

      // Send reminders to guest list
      for (const ticket of glTickets) {
        if (!ticket.guestEmail) continue;

        try {
          await sendSessionReminder({
            to: ticket.guestEmail,
            guestName: ticket.guestName || 'Guest',
            sessionTitle: session.title,
            artistName: session.artistName,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            ticketCode: ticket.code,
            type: 'guest_list',
          });
          glReminders++;
        } catch (error) {
          errors.push(`GL ${ticket.guestEmail}: ${error}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminders sent`,
      stats: {
        sessions: sessionsData.length,
        cardholderReminders,
        glReminders,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Failed to send reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}
