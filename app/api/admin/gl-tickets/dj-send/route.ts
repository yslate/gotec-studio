import { NextRequest, NextResponse } from 'next/server';
import { db, guestListTickets, recordingSessions } from '@/db';
import { eq, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { sendDJGuestListSchema } from '@/lib/validations';
import { generateTicketCode } from '@/lib/ticket-utils';
import { sendDJGuestListEmail } from '@/lib/email';
import QRCode from 'qrcode';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// POST /api/admin/gl-tickets/dj-send
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = sendDJGuestListSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, djEmail, ticketCount } = validationResult.data;

    // Load session
    const sessionData = await db
      .select()
      .from(recordingSessions)
      .where(eq(recordingSessions.id, sessionId))
      .limit(1);

    if (!sessionData.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionInfo = sessionData[0];

    // Check capacity
    const currentCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(guestListTickets)
      .where(eq(guestListTickets.sessionId, sessionId));

    const available = sessionInfo.maxGuestList - (currentCount[0]?.count || 0);

    if (ticketCount > available) {
      return NextResponse.json(
        { error: `Only ${available} guest list spots remaining` },
        { status: 400 }
      );
    }

    // Create tickets
    const ticketValues = Array.from({ length: ticketCount }, (_, i) => ({
      sessionId,
      code: generateTicketCode(),
      guestName: `Guest of ${sessionInfo.artistName} #${i + 1}`,
      guestEmail: djEmail,
      allocatedBy: sessionInfo.artistName,
    }));

    const newTickets = await db
      .insert(guestListTickets)
      .values(ticketValues)
      .returning();

    // Generate QR codes and send consolidated email
    const ticketsWithQR = await Promise.all(
      newTickets.map(async (ticket) => {
        const ticketUrl = `${APP_URL}/gl/${ticket.code}`;
        const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
        return {
          code: ticket.code,
          guestName: ticket.guestName,
          qrDataUrl,
        };
      })
    );

    sendDJGuestListEmail({
      to: djEmail,
      artistName: sessionInfo.artistName,
      sessionTitle: sessionInfo.title,
      date: sessionInfo.date,
      startTime: sessionInfo.startTime,
      endTime: sessionInfo.endTime,
      tickets: ticketsWithQR,
    }).catch(err => console.error('[API] DJ guest list email failed:', err));

    return NextResponse.json({
      success: true,
      ticketCount: newTickets.length,
      tickets: newTickets,
    });
  } catch (error) {
    console.error('Failed to send DJ guest list:', error);
    return NextResponse.json(
      { error: 'Failed to create DJ guest list' },
      { status: 500 }
    );
  }
}
