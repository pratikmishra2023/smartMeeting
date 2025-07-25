-- Insert super admin user
INSERT INTO users (name, email, role, preferences, created_at, last_login)
VALUES (
    'Administrator',
    'admin@smartmeeting.com',
    'admin',
    '{
        "defaultPriority": "high",
        "emailNotifications": true,
        "calendarIntegration": true
    }'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    preferences = EXCLUDED.preferences,
    last_login = NOW();

-- Verify the admin user was created
SELECT id, name, email, role, created_at FROM users WHERE email = 'admin@smartmeeting.com';
