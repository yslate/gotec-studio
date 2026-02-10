import 'dotenv/config';
import { auth } from '../lib/auth';
import { Pool } from 'pg';

async function createAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log('Usage: npx tsx scripts/create-admin.ts <email> <name> <password> [role]');
    console.log('');
    console.log('Arguments:');
    console.log('  email     Email address for the account');
    console.log('  name      Display name');
    console.log('  password  Password (min. 8 characters)');
    console.log('  role      Optional: "admin" or "staff" (default: "admin")');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx scripts/create-admin.ts admin@gotec-records.com Admin my-password');
    console.log('  npx tsx scripts/create-admin.ts staff@gotec-records.com "John Doe" password123 staff');
    process.exit(1);
  }

  const [email, name, password, role = 'admin'] = args;

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters.');
    process.exit(1);
  }

  if (!['admin', 'staff'].includes(role)) {
    console.error('Error: Role must be "admin" or "staff".');
    process.exit(1);
  }

  console.log(`\nCreating ${role} account...`);
  console.log(`  Email: ${email}`);
  console.log(`  Name:  ${name}`);
  console.log(`  Role:  ${role}`);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if user already exists
    const existing = await pool.query('SELECT id, role FROM "user" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.error(`\nError: An account with the email "${email}" already exists (role: ${existing.rows[0].role}).`);
      console.error('To reset the account, delete it from the database first.');
      await pool.end();
      process.exit(1);
    }

    // Use Better Auth internal API to create user (handles password hashing)
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result?.user) {
      console.error('Error creating user:', result);
      await pool.end();
      process.exit(1);
    }

    // Update role in Better Auth's user table
    await pool.query('UPDATE "user" SET role = $1 WHERE id = $2', [role, result.user.id]);

    await pool.end();

    console.log(`\nAccount successfully created!`);
    console.log(`  ID:    ${result.user.id}`);
    console.log(`  Email: ${email}`);
    console.log(`  Role:  ${role}`);
    console.log('\nYou can log in at /login.');
  } catch (err: any) {
    await pool.end().catch(() => {});

    if (err?.message?.includes('already exists') || err?.body?.code === 'USER_ALREADY_EXISTS') {
      console.error(`\nError: An account with the email "${email}" already exists.`);
    } else {
      console.error('\nError creating account:', err?.message || err);
    }
    process.exit(1);
  }

  process.exit(0);
}

createAdmin();
