import { NextRequest, NextResponse } from 'next/server';
import { db, recordingApplications } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, artistName, genre, artistOrigin, instagramUrl, soundcloudUrl, message } = body;

    if (!email || !artistName || !genre || !artistOrigin || !message) {
      return NextResponse.json(
        { error: 'Alle Pflichtfelder müssen ausgefüllt werden' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
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
      })
      .returning();

    return NextResponse.json({ id: application.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save recording application:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Bewerbung' },
      { status: 500 }
    );
  }
}
