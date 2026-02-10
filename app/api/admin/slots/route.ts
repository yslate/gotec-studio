import { NextRequest, NextResponse } from 'next/server';
import { db, recordingSlots, recordingApplications } from '@/db';
import { desc, eq, sql } from 'drizzle-orm';
import { getAdminSession } from '@/lib/admin-auth';
import { createSlotSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slots = await db
      .select({
        id: recordingSlots.id,
        date: recordingSlots.date,
        startTime: recordingSlots.startTime,
        endTime: recordingSlots.endTime,
        status: recordingSlots.status,
        createdAt: recordingSlots.createdAt,
        applicationCount: sql<number>`(
          SELECT COUNT(*)::int FROM recording_applications
          WHERE recording_applications.slot_id = ${recordingSlots.id}
        )`,
      })
      .from(recordingSlots)
      .orderBy(desc(recordingSlots.date), desc(recordingSlots.startTime));

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Failed to fetch slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSlotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [slot] = await db
      .insert(recordingSlots)
      .values(parsed.data)
      .returning();

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('Failed to create slot:', error);
    return NextResponse.json(
      { error: 'Failed to create slot' },
      { status: 500 }
    );
  }
}
