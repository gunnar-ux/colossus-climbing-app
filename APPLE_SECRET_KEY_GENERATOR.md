# Generate Apple OAuth Secret Key for Supabase

## Step-by-Step Instructions

### Step 1: Get Current Timestamp

Open JavaScript console in your browser and run:

```javascript
Math.floor(Date.now() / 1000)
```

Copy this number (it's your `iat` - issued at time).

Calculate expiry: Add 15552000 (180 days in seconds) to the number above.

Example:
- Current: 1732673280
- Expiry: 1732673280 + 15552000 = 1748225280

### Step 2: Go to https://jwt.io/

### Step 3: Configure the HEADER (left side, top section)

Replace with:

```json
{
  "alg": "ES256",
  "kid": "FLBWYB5LD8"
}
```

### Step 4: Configure the PAYLOAD (left side, middle section)

Replace with (use YOUR timestamps from Step 1):

```json
{
  "iss": "C358VQ3C9W",
  "iat": YOUR_CURRENT_TIMESTAMP_HERE,
  "exp": YOUR_EXPIRY_TIMESTAMP_HERE,
  "aud": "https://appleid.apple.com",
  "sub": "com.gunnarautterson.pogo.signin"
}
```

**IMPORTANT:** Replace the timestamp numbers!

### Step 5: Add Your Private Key (bottom section)

In the "Verify Signature" section at the bottom:

1. Select "ES256" algorithm (if not already selected)
2. In the public key box, paste your **ENTIRE .p8 file contents**

Your private key looks like:
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
(many more lines)
...
-----END PRIVATE KEY-----
```

**Include the BEGIN and END lines!**

### Step 6: Copy the JWT

Once you paste your private key, the left side will show the encoded JWT (starting with `eyJ...`).

Copy the ENTIRE thing (it's long - usually 300+ characters).

### Step 7: Update Supabase

1. Go to Supabase Dashboard
2. Authentication → Providers → Apple
3. Paste the JWT into "Secret Key (for OAuth)" field
4. Click **Save**

### Step 8: Test Again

```bash
cd /Users/gunnarautterson/Desktop/Colossus
npx cap sync ios
npx cap open ios
```

Build and run in Xcode.

---

## If You Don't Have Your .p8 File

You'll need to:
1. Go to Apple Developer Console
2. Create a NEW private key
3. Download the new .p8 file
4. Note the new Key ID
5. Update Supabase with the new Key ID AND new secret key

---

## Quick Checklist

Before testing:
- [ ] Generated fresh timestamps (iat and exp)
- [ ] Used YOUR actual private key from .p8 file
- [ ] Copied the ENTIRE JWT from jwt.io (starting with eyJ...)
- [ ] Pasted into Supabase "Secret Key" field
- [ ] Clicked Save in Supabase
- [ ] Synced iOS: `npx cap sync ios`

---

## Your Configuration Summary

Copy this for reference:

```
Team ID: C358VQ3C9W
Key ID: FLBWYB5LD8
Services ID (sub): com.gunnarautterson.pogo.signin
Client IDs in Supabase: com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo
Audience (aud): https://appleid.apple.com
```

Make sure these EXACTLY match what's in Supabase!

