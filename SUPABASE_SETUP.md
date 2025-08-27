# Supabase Setup Guide for Colossus

## 🚀 Quick Setup Steps

### 1. Get Your Supabase Credentials

1. **Go to your Supabase dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select your project** (or create a new one)
3. **Go to Settings → API**
4. **Copy these values**:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Create Environment File

Create a `.env` file in your project root:

```bash
# In /Users/gunnarautterson/Desktop/Colossus/.env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
```

**Replace the values** with your actual Supabase credentials.

### 3. Set Up Database Schema

1. **Go to Supabase dashboard → SQL Editor**
2. **Copy the entire contents** of `database/schema.sql`
3. **Paste and run** in the SQL editor
4. **Verify tables created**: Go to Table Editor to see your new tables

### 4. Configure Authentication

1. **Go to Authentication → Settings**
2. **Enable Email authentication**
3. **Optional: Enable Google OAuth**:
   - Go to Authentication → Providers
   - Enable Google
   - Add your Google OAuth credentials

### 5. Test the Integration

```bash
# Start your development server
npm run dev
```

Your app will now:
- ✅ Connect to Supabase
- ✅ Handle user authentication  
- ✅ Store climbs in PostgreSQL
- ✅ Calculate real metrics
- ✅ Sync across devices

## 🔧 Environment Variables Explained

```bash
# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-ref.supabase.co

# Public anon key (safe to expose in frontend)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: For production deployment
VITE_APP_ENV=production
```

## 📊 Database Tables Created

- **users**: User profiles (name, age, climbing stats)
- **sessions**: Climbing sessions (start/end time, gym location)
- **climbs**: Individual climb records (grade, RPE, attempts)
- **crs_scores**: Cached CRS calculations
- **load_ratios**: Load monitoring data

## 🛡️ Security Features

- **Row Level Security (RLS)**: Users can only see their own data
- **Authentication required**: All operations require valid user session
- **Data validation**: Server-side validation for all climb data
- **Rate limiting**: Built-in Supabase rate limiting

## 🔄 Data Migration from localStorage

Your app will automatically:
1. **Check for existing localStorage data**
2. **Offer to sync** when user signs up/in
3. **Migrate sessions and climbs** to Supabase
4. **Keep localStorage as backup** (offline support)

## 🎯 Testing Your Setup

### Quick Test Checklist:

1. **Environment variables loaded**: Check browser dev tools → Network tab for Supabase requests
2. **Database connection**: Try creating an account
3. **Data persistence**: Log a climb, refresh page, verify it's still there
4. **Real-time updates**: Open two browser tabs, log climb in one, see update in other
5. **Metrics calculation**: Verify CRS updates with new data

### Debug Common Issues:

**🚨 "Invalid API key" error:**
- Check your `.env` file exists and has correct values
- Restart dev server after creating `.env`
- Verify anon key is the public key, not service role key

**🚨 "Failed to create user" error:**
- Check if SQL schema was run correctly
- Verify RLS policies are enabled
- Check Supabase logs in dashboard

**🚨 "Not authenticated" errors:**
- Clear browser localStorage/cookies
- Check authentication flow in browser dev tools
- Verify user signup completed successfully

## 📱 Next Steps

Once Supabase is working:

1. **Deploy to production**: Your environment variables will work on Netlify/Vercel
2. **Enable real-time features**: Live session updates for gym buddies
3. **Add social features**: Friend connections, leaderboards
4. **Scale with confidence**: Supabase handles 50K users on free tier

---

**Ready to connect to Supabase!** 🎯

Your climbing app now has a production-ready backend that scales from 1 to 50,000 users.
