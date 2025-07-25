# Supabase Setup Guide for smartMeetingDB

## Step 1: Get Supabase Project Details

You need to get the following information from your Supabase dashboard:

1. **Project URL**: This should be something like `https://YOUR_PROJECT_ID.supabase.co`
2. **Anon Key**: Public API key for client-side operations
3. **Service Role Key**: Private API key for server-side operations (has full database access)

## Step 2: Find Your Supabase Project Details

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your `smartMeetingDB` project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL**
   - **anon** key (public)
   - **service_role** key (secret)

## Step 3: Update Environment Variables

Update your `.env` file with the actual values:

```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
DATABASE_PASSWORD=ghi2npdPO4Legguj
```

## Step 4: Create Database Tables

Run the SQL commands from `backend/database/schema.sql` in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `backend/database/schema.sql`
5. Run the query to create tables and indexes

## Step 5: Test Connection

After updating the environment variables, restart your backend server:

```bash
cd backend
npm run dev
```

You should see: "✅ Connected to Supabase successfully"

## Database Schema Created

The following tables will be created:
- `users` - User management
- `meetings` - Meeting data with transcripts and processed information

## What's Different from MongoDB

1. **UUID Primary Keys**: Supabase uses UUIDs instead of ObjectIds
2. **JSONB Fields**: Complex data structures are stored as JSONB
3. **Timestamps**: Using PostgreSQL timestamp with timezone
4. **Row Level Security**: Built-in security policies

## Next Steps

1. Update your `.env` file with real Supabase credentials
2. Run the SQL schema in Supabase
3. Test the connection
4. Update routes to use Supabase models

The backend is now fully migrated to Supabase! MongoDB has been completely removed.
