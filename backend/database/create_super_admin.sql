-- Create super admin user
-- Password hash for 'admin' using bcrypt with salt rounds 10
INSERT INTO users (
    name, 
    email, 
    password_hash, 
    role, 
    date_of_birth,
    security_question_1,
    security_answer_1,
    security_question_2,
    security_answer_2,
    preferences,
    account_status,
    created_at, 
    last_login
)
VALUES (
    'Super Administrator',
    'admin@smartmeeting.com',
    '$2b$10$v9UFn6kp5J3P/ngNg.PkE.yjAjM4kkpkoHuOKuYMJsVKAmB5.VMgK', -- bcrypt hash for 'admin'
    'admin',
    '1990-01-01',
    'What is your favorite programming language?',
    '$2b$10$hwImQ.wNIwCIKSa8vnxvhOb2VMQUuR6IQ2S4CK7L1vgWfCCZPFgZu', -- bcrypt hash for 'javascript'
    'What is the name of your first pet?',
    '$2b$10$FagVJqU3sbhbpIGtHxtzr.G7sqUIjDoelCCr/5bGwGe3M8L2KWAXK', -- bcrypt hash for 'buddy'
    '{
        "defaultPriority": "high",
        "emailNotifications": true,
        "calendarIntegration": true
    }'::jsonb,
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    date_of_birth = EXCLUDED.date_of_birth,
    security_question_1 = EXCLUDED.security_question_1,
    security_answer_1 = EXCLUDED.security_answer_1,
    security_question_2 = EXCLUDED.security_question_2,
    security_answer_2 = EXCLUDED.security_answer_2,
    preferences = EXCLUDED.preferences,
    account_status = EXCLUDED.account_status,
    last_login = NOW();

-- Verify the super admin user was created
SELECT 
    id, 
    name, 
    email, 
    role, 
    account_status,
    created_at,
    security_question_1,
    security_question_2
FROM users 
WHERE email = 'admin@smartmeeting.com';

-- Show all users in the system
SELECT 
    id, 
    name, 
    email, 
    role, 
    account_status,
    created_at
FROM users 
ORDER BY created_at DESC;
