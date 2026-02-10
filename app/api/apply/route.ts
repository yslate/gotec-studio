import { NextRequest, NextResponse } from 'next/server';
import { db, recordingApplications, recordingSlots } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, artistName, genre, artistOrigin, instagramUrl, soundcloudUrl, message, slotId } = body;

    if (!email || !artistName || !genre || !artistOrigin || !message || !slotId) {
      return NextResponse.json(
        { error: 'All required fields must be filled out' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate slotId if provided
    if (slotId) {
      const [slot] = await db
        .select()
        .from(recordingSlots)
        .where(eq(recordingSlots.id, slotId));

      if (!slot) {
        return NextResponse.json(
          { error: 'Selected slot does not exist' },
          { status: 400 }
        );
      }

      if (slot.status !== 'available') {
        return NextResponse.json(
          { error: 'Selected slot is no longer available' },
          { status: 400 }
        );
      }
    }

    const [application] = await db
      .insert(recordingApplications)
      .values({
        email: String(email).slice(0, 255),
        artistName: String(artistName).slice(0, 255),
        genre: String(genre).slice(0, 255),
        artistOrigin: String(artistOrigin).slice(0, 255),
        instagramUrl: instagramUrl ? String(instagramUrl).slice(0, 500) : null,
        soundcloudUrl: soundcloudUrl ? String(soundcloudUrl).slice(0, 500) : null,
        message: String(message),
        slotId: slotId || null,
      })
      .returning();

    return NextResponse.json({ id: application.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save recording application:', error);
    return NextResponse.json(
      { error: 'Failed to save application' },
      { status: 500 }
    );
  }
}
