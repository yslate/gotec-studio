import { NextRequest, NextResponse } from 'next/server';
import { db, contactInquiries } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
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

    const [inquiry] = await db
      .insert(contactInquiries)
      .values({
        name: String(name).slice(0, 255),
        email: String(email).slice(0, 255),
        subject: String(subject).slice(0, 255),
        message: String(message),
      })
      .returning();

    return NextResponse.json({ id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to save contact inquiry:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Anfrage' },
      { status: 500 }
    );
  }
}
