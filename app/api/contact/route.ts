import { NextRequest, NextResponse } from 'next/server';
import { db, contactInquiries } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
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
      { error: 'Failed to save inquiry' },
      { status: 500 }
    );
  }
}
