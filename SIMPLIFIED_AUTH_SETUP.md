# Simplified Authentication Setup for Pogo

## 🚀 Quick Setup for Testing

### 1. Disable Email Confirmation (IMPORTANT for Testing)

To test without email confirmation hassles:

1. **Go to your Supabase dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Go to Authentication → Settings**
3. **Find "Email" section**
4. **DISABLE "Enable email confirmations"**
5. **Click "Save"**

> **Note**: This allows immediate login after signup. Re-enable for production.

### 2. Disable Anonymous Authentication

1. **Go to Authentication → Providers**
2. **Find "Anonymous Sign-Ins" and toggle it OFF**
3. **Click "Save"**

### 3. Get Your Supabase Credentials

1. **Go to Settings → API**
2. **Copy these values**:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 4. Create Environment File

Create a `.env` file in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### 5. Run Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the entire contents** of `/database/setup.sql`
3. **Paste and run** in the SQL editor
4. **Look for success messages**:
   - ✅ Database setup complete!
   - ℹ️ This is a simplified schema for email/password authentication only
   - ⚠️ Make sure email confirmation is disabled in Supabase for testing

> **Note**: This script will DROP all existing tables if they exist, so only run it if you want to start fresh!

## 📱 Testing the Simplified Flow

### Sign Up Flow:
1. Open app → redirected to `/onboarding`
2. Enter email & password (6+ characters)
3. Click "Create Account"
4. Fill personal info → Continue
5. Fill physical stats → Complete Setup
6. Redirected to dashboard with data saved to Supabase

### Sign In Flow:
1. Open app → redirected to `/onboarding`
2. Click "Already have an account? Log in"
3. Enter email & password
4. Click "Sign In"
5. Redirected to dashboard with all data loaded

### Sign Out:
1. Go to Account page (bottom nav)
2. Click "Sign Out" button in profile card
3. Redirected to `/onboarding`

## 🔍 Verify Data Persistence

1. **Create account and log some climbs**
2. **Check Supabase dashboard**:
   - Authentication → Users (should see your user)
   - Table Editor → users (should see profile data)
   - Table Editor → sessions (should see climbing sessions)
   - Table Editor → climbs (should see individual climbs)
3. **Hard close the app on iPhone**
4. **Reopen app** - should remain logged in with all data

## 🐛 Troubleshooting

### "Email not confirmed" error
- Make sure you disabled email confirmations in Supabase settings

### Data not persisting
- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Check Supabase dashboard logs

### Can't create profile
- Ensure database schema has been run
- Check that RLS policies are in place
- Verify user table has all required columns

## 🚀 Next Steps

Once basic auth is working:
1. Re-enable email confirmation for production
2. Add password reset functionality
3. Consider adding OAuth providers (Google, Apple)
4. Implement proper error handling
5. Add loading states during auth operations

## 🔐 Production Checklist

Before going live:
- [ ] Re-enable email confirmation
- [ ] Set up custom SMTP for branded emails
- [ ] Add rate limiting
- [ ] Enable ReCAPTCHA
- [ ] Set up proper error tracking
- [ ] Test on multiple devices
