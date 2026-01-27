import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return NextResponse.json({
      hasSession: !!session,
      user: session?.user || null,
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
    });
  }
}
