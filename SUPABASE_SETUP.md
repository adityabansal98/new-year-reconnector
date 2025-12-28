# Supabase Setup Instructions

To enable CSV persistence, you need to set up Supabase:

## 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free
3. Create a new project

## 2. Create Database Table
Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE user_connections (
  user_id TEXT PRIMARY KEY,
  connections JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_connections_user_id ON user_connections(user_id);
```

## 3. Get API Keys
1. Go to Project Settings → API
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## 4. Add to .env.local
Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. Configure Row Level Security (RLS)
In Supabase SQL Editor, run:

```sql
-- Enable RLS
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own connections
CREATE POLICY "Users can read own connections"
  ON user_connections
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Note: Service role key is used for writes, so no write policy needed
```

That's it! Your app will now save and load connections automatically.

