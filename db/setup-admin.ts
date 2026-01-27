import 'dotenv/config';

async function setupAdmin() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx tsx db/setup-admin.ts <password>');
    console.error('Example: npx tsx db/setup-admin.ts mein-sicheres-passwort');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  const baseURL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  const email = 'admin@gotec-records.de';
  const name = 'Admin';

  console.log('Setting up admin user via Better Auth API...');
  console.log(`Base URL: ${baseURL}`);

  try {
    // First try to sign up the user
    const signUpResponse = await fetch(`${baseURL}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': baseURL,
      },
      body: JSON.stringify({
        email,
        password,
        name,
      }),
    });

    const signUpText = await signUpResponse.text();
    console.log('Sign up response:', signUpResponse.status, signUpText);

    let signUpData;
    try {
      signUpData = JSON.parse(signUpText);
    } catch {
      signUpData = { raw: signUpText };
    }

    if (signUpResponse.ok) {
      console.log('\nAdmin user created successfully!');
      console.log(`Email: ${email}`);
      console.log('You can now login at /login');
    } else if (signUpData.message?.includes('already exists') || signUpData.code === 'USER_ALREADY_EXISTS') {
      console.log('\nAdmin user already exists.');
      console.log('If you need to reset the password, delete the user from the database first.');
    } else {
      console.error('\nFailed to create admin:', signUpData);
    }
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

setupAdmin();
