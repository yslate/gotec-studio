-- Migration: Add security features
-- 1. Add unique code column to black_cards
-- 2. Add holder_email to black_cards
-- 3. Create email_verification_codes table

-- Step 1: Add code column to black_cards
ALTER TABLE black_cards ADD COLUMN IF NOT EXISTS code VARCHAR(20);

-- Step 2: Add holder_email column to black_cards
ALTER TABLE black_cards ADD COLUMN IF NOT EXISTS holder_email VARCHAR(255);

-- Step 3: Generate unique codes for existing cards that don't have one
-- This generates codes in format BC-XXXXXX with random alphanumeric characters
DO $$
DECLARE
    card_record RECORD;
    new_code VARCHAR(20);
    chars VARCHAR(32) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code_exists BOOLEAN;
BEGIN
    FOR card_record IN SELECT id FROM black_cards WHERE code IS NULL
    LOOP
        LOOP
            -- Generate a random code
            new_code := 'BC-';
            FOR i IN 1..6 LOOP
                new_code := new_code || substr(chars, floor(random() * 32 + 1)::int, 1);
            END LOOP;

            -- Check if code already exists
            SELECT EXISTS(SELECT 1 FROM black_cards WHERE code = new_code) INTO code_exists;
            EXIT WHEN NOT code_exists;
        END LOOP;

        -- Update the card with the new code
        UPDATE black_cards SET code = new_code WHERE id = card_record.id;
    END LOOP;
END $$;

-- Step 4: Make code column NOT NULL and UNIQUE after all codes are generated
ALTER TABLE black_cards ALTER COLUMN code SET NOT NULL;

-- Only add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'black_cards_code_unique'
    ) THEN
        ALTER TABLE black_cards ADD CONSTRAINT black_cards_code_unique UNIQUE (code);
    END IF;
END $$;

-- Step 5: Create email_verification_codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    session_id UUID NOT NULL REFERENCES recording_sessions(id) ON DELETE CASCADE,
    card_id INTEGER NOT NULL REFERENCES black_cards(id),
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Step 6: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_session ON email_verification_codes(session_id);

-- Done!
SELECT 'Migration completed successfully' AS status;
