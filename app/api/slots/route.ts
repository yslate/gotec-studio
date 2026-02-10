import { NextResponse } from 'next/server';
import { db, recordingSlots } from '@/db';
import { eq, gte, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const slots = await db
      .select({
        id: recordingSlots.id,
        date: recordingSlots.date,
        startTime: recordingSlots.startTime,
        endTime: recordingSlots.endTime,
      })
      .from(recordingSlots)
      .where(
        eq(recordingSlots.status, 'available'),
      )
      .orderBy(asc(recordingSlots.date), asc(recordingSlots.startTime));

    // Filter for dates >= today in JS since drizzle date comparison can be tricky
    const filtered = slots.filter((s) => s.date >= today);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Failed to fetch available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}
