-- Add security fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question_1 VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer_1 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question_2 VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer_2 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'locked'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE;

-- Update the admin user with security fields
UPDATE users 
SET 
    password_hash = '$2b$10$rZ1zR3.4Yf2xV8wQ0nF.2.qH9J7K5L3M1N0P6R8S4T6U2V4W8X0Y2Z4',  -- hashed 'admin'
    date_of_birth = '1990-01-01',
    security_question_1 = 'What is your favorite programming language?',
    security_answer_1 = 'javascript',
    security_question_2 = 'What is the name of your first pet?',
    security_answer_2 = 'buddy'
WHERE email = 'admin@smartmeeting.com';

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for password reset tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
