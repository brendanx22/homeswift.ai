# Supabase Setup Instructions

## Current Issue
The application is showing Supabase configuration errors because the environment variables are missing.

## Solution

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be set up

### 2. Get Your Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public** key

### 3. Create Environment File
Create a `.env` file in your project root with the following content:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjQ2NDQwMCwiZXhwIjoxOTYyMDQwNDAwfQ.example_signature_here
```

### 4. Restart Development Server
After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Database Setup
The project includes database migrations in the `database/migrations/` folder. You can run these in your Supabase SQL editor to set up the required tables.

## Current Status
- ✅ Application runs without crashing (mock client implemented)
- ⚠️ Authentication features will show "Supabase not configured" errors
- ⚠️ Database operations will not work until proper configuration

## Next Steps
1. Set up your Supabase project
2. Add the environment variables
3. Run the database migrations
4. Test the authentication features


