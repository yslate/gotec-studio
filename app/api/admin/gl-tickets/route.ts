import { NextRequest, NextResponse } from 'next/server';
import { db, guestListTickets, recordingSessions } from '@/db';
import { eq, sql, desc } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { createGLTicketSchema, createBulkGLTicketsSchema } from '@/lib/validations';
import { nanoid } from 'nanoid';
import { sendGLTicket } from '@/lib/email';

// Generate a unique QR code
function generateTicketCode(): string {
  return `GL-${nanoid(8).toUpperCase()}`;
}

// GET /api/admin/gl-tickets - Get all GL tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    let query = db
      .select({
        id: guestListTickets.id,
        code: guestListTickets.code,
        guestName: guestListTickets.guestName,
        guestPhone: guestListTickets.guestPhone,
        guestEmail: guestListTickets.guestEmail,
        allocatedBy: guestListTickets.allocatedBy,
        status: guestListTickets.status,
        usedAt: guestListTickets.usedAt,
        createdAt: guestListTickets.createdAt,
        session: {
          id: recordingSessions.id,
          title: recordingSessions.title,
          artistName: recordingSessions.artistName,
          date: recordingSessions.date,
          startTime: recordingSessions.startTime,
          endTime: recordingSessions.endTime,
        },
      })
      .from(guestListTickets)
      .innerJoin(recordingSessions, eq(guestListTickets.sessionId, recordingSessions.id))
      .$dynamic();

    if (sessionId) {
      query = query.where(eq(guestListTickets.sessionId, sessionId));
    }

    const tickets = await query.orderBy(
      desc(recordingSessions.date),
      guestListTickets.createdAt
    );

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Failed to fetch GL tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GL tickets' },
      { status: 500 }
    );
  }
}

// POST /api/admin/gl-tickets - Create GL ticket(s)
export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if it's a bulk request
    if (body.tickets) {
      const validationResult = createBulkGLTicketsSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Ungültige Daten', details: validationResult.error.flatten() },
          { status: 400 }
        );
      }

      const { sessionId, tickets } = validationResult.data;

      // Verify session exists and check capacity
      const sessionData = await db
        .select()
        .from(recordingSessions)
        .where(eq(recordingSessions.id, sessionId))
        .limit(1);

      if (!sessionData.length) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const currentCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(guestListTickets)
        .where(eq(guestListTickets.sessionId, sessionId));

      const available = sessionData[0].maxGuestList - (currentCount[0]?.count || 0);

      if (tickets.length > available) {
        return NextResponse.json(
          { error: `Nur noch ${available} Gästelisten-Plätze verfügbar` },
          { status: 400 }
        );
      }

      // Create tickets (guestEmail is now required)
      const ticketValues = tickets.map((ticket) => ({
        sessionId,
        code: generateTicketCode(),
        guestName: ticket.guestName,
        guestPhone: ticket.guestPhone || null,
        guestEmail: ticket.guestEmail,
        allocatedBy: ticket.allocatedBy,
      }));

      const newTickets = await db
        .insert(guestListTickets)
        .values(ticketValues)
        .returning();

      // Send emails for tickets with email addresses (async, don't wait)
      const sessionInfo = sessionData[0];
      for (const ticket of newTickets) {
        if (ticket.guestEmail) {
          sendGLTicket({
            to: ticket.guestEmail,
            guestName: ticket.guestName,
            sessionTitle: sessionInfo.title,
            artistName: sessionInfo.artistName,
            date: sessionInfo.date,
            startTime: sessionInfo.startTime,
            endTime: sessionInfo.endTime,
            ticketCode: ticket.code,
            allocatedBy: ticket.allocatedBy || undefined,
          }).catch(err => console.error('[API] GL ticket email failed:', err));
        }
      }

      return NextResponse.json(newTickets);
    }

    // Single ticket creation
    const validationResult = createGLTicketSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Ungültige Daten', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { sessionId, guestName, guestPhone, guestEmail, allocatedBy } = validationResult.data;

    // Verify session exists and check capacity
    const sessionData = await db
      .select()
      .from(recordingSessions)
      .where(eq(recordingSessions.id, sessionId))
      .limit(1);

    if (!sessionData.length) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(guestListTickets)
      .where(eq(guestListTickets.sessionId, sessionId));

    if ((currentCount[0]?.count || 0) >= sessionData[0].maxGuestList) {
      return NextResponse.json(
        { error: 'Gästeliste ist voll' },
        { status: 400 }
      );
    }

    const ticketCode = generateTicketCode();

    const newTicket = await db
      .insert(guestListTickets)
      .values({
        sessionId,
        code: ticketCode,
        guestName,
        guestPhone: guestPhone || null,
        guestEmail,
        allocatedBy,
      })
      .returning();

    // Send email (guestEmail is now required)
    if (guestEmail) {
      const sessionInfo = sessionData[0];
      sendGLTicket({
        to: guestEmail,
        guestName,
        sessionTitle: sessionInfo.title,
        artistName: sessionInfo.artistName,
        date: sessionInfo.date,
        startTime: sessionInfo.startTime,
        endTime: sessionInfo.endTime,
        ticketCode,
        allocatedBy: allocatedBy || undefined,
      }).catch(err => console.error('[API] GL ticket email failed:', err));
    }

    return NextResponse.json(newTicket[0]);
  } catch (error) {
    console.error('Failed to create GL ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create GL ticket' },
      { status: 500 }
    );
  }
}
