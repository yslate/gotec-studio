import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const email = 'admin@gotec-records.de';
    const name = 'Admin';

    // Use Better Auth's internal API to create user
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
