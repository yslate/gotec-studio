import { NextRequest, NextResponse } from 'next/server';
import { db, recordingApplications, recordingSlots } from '@/db';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { reassignApplicationSchema } from '@/lib/validations';

export async function POST(
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
    const parsed = reassignApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Check slot exists and is available
    const [slot] = await db
      .select()
      .from(recordingSlots)
      .where(eq(recordingSlots.id, parsed.data.slotId));

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot not found' },
        { status: 404 }
      );
    }

    if (slot.status !== 'available') {
      return NextResponse.json(
        { error: 'Slot is no longer available' },
        { status: 400 }
      );
    }

    // Update the application's slotId
    const [updated] = await db
      .update(recordingApplications)
      .set({ slotId: parsed.data.slotId })
      .where(eq(recordingApplications.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...updated,
      slotDate: slot.date,
      slotStartTime: slot.startTime,
      slotEndTime: slot.endTime,
      slotStatus: slot.status,
    });
  } catch (error) {
    console.error('Failed to reassign application:', error);
    return NextResponse.json(
      { error: 'Failed to reassign application' },
      { status: 500 }
    );
  }
}
