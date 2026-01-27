import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blackCards, users } from './schema';
import 'dotenv/config';

// Generate a unique card code like "BC-X7K9M2"
function generateCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars (0/O, 1/I/L)
  let code = 'BC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate unique codes for all cards
function generateUniqueCodes(count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateCardCode());
  }
  return Array.from(codes);
}

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Seeding database...');

  // Generate unique codes for 100 cards
  console.log('Generating unique card codes...');
  const uniqueCodes = generateUniqueCodes(100);

  // Create 100 black cards with unique codes
  console.log('Creating 100 black cards...');
  const cardData = Array.from({ length: 100 }, (_, i) => ({
    cardNumber: i + 1,
    code: uniqueCodes[i],
    status: 'active' as const,
  }));

  await db.insert(blackCards).values(cardData).onConflictDoNothing();
  console.log('Black cards created with unique codes.');

  // Create initial admin user (for Better Auth, this will be linked later)
  console.log('Creating initial admin user...');
  await db.insert(users).values({
    email: 'admin@gotec-records.de',
    name: 'Admin',
    role: 'admin',
  }).onConflictDoNothing();
  console.log('Admin user created.');

  console.log('Seeding complete!');

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
