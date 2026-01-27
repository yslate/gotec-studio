import { auth } from './auth';
import { headers } from 'next/headers';

export async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Check if user has admin or staff role
  const role = (session.user as { role?: string }).role;
  if (!role || !['admin', 'staff'].includes(role)) {
    return null;
  }

  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
