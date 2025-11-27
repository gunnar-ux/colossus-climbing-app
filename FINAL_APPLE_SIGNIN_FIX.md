# Apple Sign In - Final Troubleshooting Steps

## Current Status
You're getting "nonces mismatch" even with both Client IDs configured correctly in Supabase.

## ✅ What's Confirmed Working:
1. Apple Developer configuration is correct
2. Xcode "Sign in with Apple" capability is added
3. Native Apple authorization is succeeding (getting identity token)
4. Supabase has both Client IDs: `com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo`
5. Package versions are current (@supabase/supabase-js@2.56.0, @capacitor-community/apple-sign-in@7.1.0)

## ❌ What's Failing:
Supabase's `signInWithIdToken` is rejecting the token with "nonces mismatch"

---

## Solution 1: NO NONCE (Current Code - Test This First)

The code has been updated to **not use nonces at all**. This often works with recent Supabase versions.

**Test it:**
```bash
npx cap sync ios
npx cap open ios
# Build and run
```

Watch Xcode console for detailed logs.

---

## Solution 2: Regenerate Your Secret Key

The secret key in Supabase may be expired or incorrect.

### Option A: Use Online JWT Generator

1. Go to: https://jwt.io/

2. Set Header:
```json
{
  "alg": "ES256",
  "kid": "FLBWYB5LD8"
}
```

3. Set Payload:
```json
{
  "iss": "C358VQ3C9W",
  "iat": 1732657280,
  "exp": 1748209280,
  "aud": "https://appleid.apple.com",
  "sub": "com.gunnarautterson.pogo.signin"
}
```

4. Paste your **entire .p8 file contents** in the "Verify Signature" section (including BEGIN/END lines)

5. Copy the generated JWT

6. In Supabase Dashboard → Auth → Providers → Apple:
   - Paste into "Secret Key (for OAuth)" field
   - Click Save

### Option B: Use the Script

I've created `generate-apple-secret.js` for you:

1. Edit the file and paste your private key
2. Run: `node generate-apple-secret.js`
3. Copy the output into Supabase

---

## Solution 3: Use OAuth Redirect Flow Instead

If native `signInWithIdToken` keeps failing, use OAuth redirect:

```javascript
// Fallback approach - uses browser redirect
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: window.location.origin
  }
})
```

**Pros:** Supabase handles everything
**Cons:** User leaves app briefly (redirects to Safari, then back)

---

## Solution 4: Check Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Look for Apple auth attempts
3. Check for detailed error messages

Common issues in logs:
- "Invalid token signature" → Secret key is wrong
- "Token expired" → Secret key is old
- "Invalid audience" → Client IDs don't match
- "Nonces mismatch" → See solutions above

---

## Solution 5: Verify Apple Developer Settings ONE MORE TIME

### In Apple Developer Console:

1. **App ID** (`com.gunnarautterson.pogo`):
   - ✅ "Sign in with Apple" is enabled
   - ✅ Edit → Configure → Set primary app

2. **Services ID** (`com.gunnarautterson.pogo.signin`):
   - ✅ "Sign in with Apple" is checked
   - ✅ Click Configure button
   - ✅ Primary App ID: Select `com.gunnarautterson.pogo`
   - ✅ Website URLs:
     - Domain: `jamyscybvyyfnzqqiovi.supabase.co`
     - Return URL: `https://jamyscybvyyfnzqqiovi.supabase.co/auth/v1/callback`

3. **Private Key**:
   - ✅ Downloaded and saved
   - ✅ Used to generate secret key
   - ✅ Not expired

### In Supabase:

1. **Apple Provider Settings**:
   - ✅ Enabled (toggle is ON)
   - ✅ **Client ID**: `com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo`
     - (BOTH IDs, comma-separated, NO SPACES)
   - ✅ **Team ID**: `C358VQ3C9W`
   - ✅ **Key ID**: `FLBWYB5LD8`
   - ✅ **Secret Key**: The JWT you generated (long string starting with `eyJ...`)

---

## Solution 6: Test Secret Key Validity

Run this in your browser console to check if your secret key is valid:

```javascript
// Decode the JWT (just for inspection, no verification)
const secretKey = 'YOUR_SECRET_KEY_HERE';
const parts = secretKey.split('.');
const payload = JSON.parse(atob(parts[1]));

console.log('JWT Payload:', payload);
console.log('Issued at:', new Date(payload.iat * 1000));
console.log('Expires at:', new Date(payload.exp * 1000));
console.log('Is expired?', Date.now() > payload.exp * 1000);
console.log('Team ID:', payload.iss);
console.log('Client ID:', payload.sub);
console.log('Audience:', payload.aud);
```

Verify:
- Not expired
- `iss` matches your Team ID
- `sub` matches your Services ID
- `aud` is `https://appleid.apple.com`

---

## Solution 7: Nuclear Option - Delete & Recreate

If nothing works, start fresh:

1. **In Apple Developer:**
   - Delete Services ID
   - Delete Private Key
   - Create new Private Key
   - Create new Services ID
   - Configure everything again

2. **In Supabase:**
   - Generate new secret key with new Key ID
   - Update all fields
   - Save

---

## What to Check in Xcode Console

After testing, you should see:

**Success:**
```
🍎 Sign in with Apple attempt...
🍎 Using native Apple Sign-In...
🍎 Method: NO NONCE (let system handle it)
🍎 Apple Sign-In complete
🍎 Identity token: Present ✓
🍎 Exchanging token with Supabase...
🍎 ✅ SUCCESS!
🍎 User email: user@example.com
```

**Failure:**
```
🍎 ❌ Supabase error: [ERROR MESSAGE]
🍎 Error code: [CODE]
🍎 Full error object: [JSON]
```

Copy the full error and we can diagnose further.

---

## Still Stuck?

Share these details:
1. Full Xcode console output (from "🍎 Sign in with Apple attempt" onwards)
2. Supabase logs screenshot
3. Confirmation that secret key is NOT expired
4. Your Supabase project region (some regions had issues with Apple auth)

The issue is likely:
- **90% chance**: Secret key is wrong/expired
- **8% chance**: Services ID configuration issue in Apple Developer
- **2% chance**: Supabase backend issue with Apple auth

