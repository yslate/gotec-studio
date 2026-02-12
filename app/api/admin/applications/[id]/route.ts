import { NextRequest, NextResponse } from 'next/server';
import { db, recordingApplications, recordingSlots, recordingSessions } from '@/db';
import { eq, and, ne } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { acceptApplicationSchema } from '@/lib/validations';
import { sendApplicationAccepted, sendApplicationRejected, sendSlotTaken, fireAndForgetEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['new', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Load the application
    const [application] = await db
      .select()
      .from(recordingApplications)
      .where(eq(recordingApplications.id, id));

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // --- ACCEPT ---
    if (status === 'accepted') {
      const parsed = acceptApplicationSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      // Load slot if assigned
      let slotDate = body.date;
      let slotStartTime = body.startTime;
      let slotEndTime = body.endTime;

      if (application.slotId) {
        const [slot] = await db
          .select()
          .from(recordingSlots)
          .where(eq(recordingSlots.id, application.slotId));

        if (slot) {
          slotDate = slot.date;
          slotStartTime = slot.startTime;
          slotEndTime = slot.endTime;

          // Mark slot as booked
          await db
            .update(recordingSlots)
            .set({ status: 'booked' })
            .where(eq(recordingSlots.id, slot.id));

          // Notify other applicants for the same slot
          const otherApplicants = await db
            .select()
            .from(recordingApplications)
            .where(
              and(
                eq(recordingApplications.slotId, slot.id),
                ne(recordingApplications.id, id)
              )
            );

          // Detach other applicants from slot and send notifications
          for (const other of otherApplicants) {
            await db
              .update(recordingApplications)
              .set({ slotId: null })
              .where(eq(recordingApplications.id, other.id));

            fireAndForgetEmail(
              sendSlotTaken({
                to: other.email,
                artistName: other.artistName,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
              }),
              `Slot taken notification to ${other.email}`
            );
          }
        }
      }

      if (!slotDate || !slotStartTime || !slotEndTime) {
        return NextResponse.json(
          { error: 'No slot assigned and no date/time data provided' },
          { status: 400 }
        );
      }

      // Create recording session
      const [newSession] = await db
        .insert(recordingSessions)
        .values({
          title: parsed.data.title,
          artistName: application.artistName,
          date: slotDate,
          startTime: slotStartTime,
          endTime: slotEndTime,
          maxCardholders: parsed.data.maxCardholders,
          maxWaitlist: parsed.data.maxWaitlist,
          maxGuestList: parsed.data.maxGuestList,
          description: parsed.data.description || null,
          isPublished: false,
        })
        .returning();

      // Update application status
      const [updated] = await db
        .update(recordingApplications)
        .set({ status: 'accepted' })
        .where(eq(recordingApplications.id, id))
        .returning();

      // Send acceptance email
      fireAndForgetEmail(
        sendApplicationAccepted({
          to: application.email,
          artistName: application.artistName,
          sessionTitle: parsed.data.title,
          date: slotDate,
          startTime: slotStartTime,
          endTime: slotEndTime,
          sessionId: newSession.id,
        }),
        `Application accepted to ${application.email}`
      );

      return NextResponse.json({ ...updated, sessionId: newSession.id });
    }

    // --- REJECT ---
    if (status === 'rejected') {
      const [updated] = await db
        .update(recordingApplications)
        .set({ status: 'rejected' })
        .where(eq(recordingApplications.id, id))
        .returning();

      fireAndForgetEmail(
        sendApplicationRejected({
          to: application.email,
          artistName: application.artistName,
        }),
        `Application rejected to ${application.email}`
      );

      return NextResponse.json(updated);
    }

    // --- OTHER STATUS UPDATES (new, reviewed) ---
    const [updated] = await db
      .update(recordingApplications)
      .set({ status })
      .where(eq(recordingApplications.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
