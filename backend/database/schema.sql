-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
    preferences JSONB DEFAULT '{
        "defaultPriority": "medium",
        "emailNotifications": true,
        "calendarIntegration": false
    }'::jsonb,
    meetings UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 0,
    participants JSONB DEFAULT '[]'::jsonb,
    transcript JSONB NOT NULL,
    processed_data JSONB DEFAULT '{
        "minutesOfMeeting": {
            "keyPoints": [],
            "decisions": [],
            "discussions": []
        },
        "actionItems": [],
        "todos": []
    }'::jsonb,
    reports JSONB DEFAULT '{
        "summaryGenerated": false,
        "reportPath": null,
        "generatedAt": null
    }'::jsonb,
    calendar_events JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_meetings_updated_at 
    BEFORE UPDATE ON meetings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policies for meetings table  
CREATE POLICY "Users can view all meetings" ON meetings
    FOR SELECT USING (true);

CREATE POLICY "Users can create meetings" ON meetings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update meetings" ON meetings
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete meetings" ON meetings
    FOR DELETE USING (true);
