import { NextRequest, NextResponse } from 'next/server';
import { db, recordingSlots, recordingApplications } from '@/db';
import { eq } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { updateSlotSchema } from '@/lib/validations';

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
    const parsed = updateSlotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(recordingSlots)
      .set(parsed.data)
      .where(eq(recordingSlots.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update slot:', error);
    return NextResponse.json(
      { error: 'Failed to update slot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check slot exists and is available
    const [slot] = await db
      .select()
      .from(recordingSlots)
      .where(eq(recordingSlots.id, id));

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (slot.status !== 'available') {
      return NextResponse.json(
        { error: 'Booked slots cannot be deleted' },
        { status: 400 }
      );
    }

    // Decouple any applications from this slot
    await db
      .update(recordingApplications)
      .set({ slotId: null })
      .where(eq(recordingApplications.slotId, id));

    await db
      .delete(recordingSlots)
      .where(eq(recordingSlots.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete slot' },
      { status: 500 }
    );
  }
}
