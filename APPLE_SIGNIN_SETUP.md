# Sign in with Apple - Setup Guide

## Implementation Complete! ✅

The code is ready. Now you need to configure Apple Developer Console and Supabase with the required credentials.

---

## Part 1: Apple Developer Console Setup

### Step 1: Create an App ID with Sign in with Apple
1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → Select your App ID 
4. **Enable "Sign in with Apple"** capability
5. Click **Save**

### Step 2: Create a Services ID (for Web OAuth)
This is what Supabase will use for the OAuth flow.

1. In **Identifiers**, click the **+** button
2. Select **Services IDs** → Click **Continue**
3. Fill in:
   - **Description**: `POGO Sign In with Apple`
   - **Identifier**: `com.gunnarautterson.pogo.signin` (must be unique)
4. Check **"Sign in with Apple"**
5. Click **Configure** next to "Sign in with Apple"
6. In the configuration:
   - **Primary App ID**: Select `com.gunnarautterson.pogo`
   - **Domains and Subdomains**: Add your Supabase project URL
     - Example: `https://jamyscybvyyfnzqqiovi.supabase.co` (get this from your Supabase dashboard)
   - **Return URLs**: Add your Supabase callback URL
     - Example: `https://jamyscybvyyfnzqqiovi.supabase.co/auth/v1/callback`
7. Click **Save** → Click **Continue** → Click **Register**

**🎯 SAVE THIS**: `com.gunnar.colossus.signin` (your Services ID)

### Step 3: Create a Private Key
1. In the left sidebar, click **Keys**
2. Click the **+** button
3. Fill in:
   - **Key Name**: `POGO Apple Sign In Key`
4. Check **"Sign in with Apple"**
5. Click **Configure** → Select your Primary App ID (`com.gunnar.colossus`)
6. Click **Save** → Click **Continue** → Click **Register**
7. **Download the .p8 file** (you can only download this ONCE!)
8. Open the `.p8` file in a text editor and copy the entire contents

**🎯 SAVE THESE VALUES**:
- **Key ID**: Shows on the key details page (looks like `ABC123XYZ`)
- **Private Key**: The entire contents of the `.p8` file (starts with `-----BEGIN PRIVATE KEY-----`)

### Step 4: Get Your Team ID
1. In Apple Developer Console, click your name in the top right
2. View **Membership** details
3. Copy your **Team ID** (looks like `ABCD123456`)

**🎯 SAVE THIS**: Your Team ID

---

## Part 2: Supabase Configuration

### Step 1: Enable Apple OAuth Provider
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Apple** in the list
5. Click to expand it
6. Toggle **"Apple Enabled"** to ON

### Step 2: Fill in the Apple Configuration
You'll need the values you saved from Apple Developer Console:

1. **Services ID**: `com.gunnar.colossus.signin`
2. **Team ID**: Your Apple Team ID (e.g., `ABCD123456`)
3. **Key ID**: Your private key ID (e.g., `ABC123XYZ`)
4. **Private Key**: Paste the ENTIRE contents of your `.p8` file
   - Include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines

5. Click **Save**

### Step 3: Get Your Supabase Redirect URL
1. In the same Apple provider settings, you'll see:
   - **Redirect URL**: Copy this (should be like `https://[your-project].supabase.co/auth/v1/callback`)
2. **Important**: Make sure this EXACT URL is added to your Apple Services ID (from Part 1, Step 2)

---

## Part 3: Update Your Code (One Small Change Needed)

In `/src/contexts/AuthContext.jsx`, update line 435 with your actual Supabase URL:

```javascript
redirectURI: 'https://[YOUR-PROJECT].supabase.co/auth/v1/callback',
```

Replace `[YOUR-PROJECT]` with your actual Supabase project reference.

You can find this in your Supabase Dashboard under **Project Settings** → **API**.

---

## Part 4: Xcode Configuration

1. Open your project in Xcode:
   ```bash
   open ios/App/App.xcworkspace
   ```

2. Select your app target → **Signing & Capabilities**

3. Click **+ Capability**

4. Search for and add **"Sign in with Apple"**

5. Make sure your **Bundle Identifier** matches: `com.gunnar.colossus`

6. Make sure **Team** is set to your Apple Developer account

---

## Part 5: Testing

### Test on iOS Simulator:
1. Build and run in Xcode
2. Tap "Continue with Apple"
3. You'll be prompted to sign in with your Apple ID
4. Complete the authorization

### Test on Web (PWA):
1. Run `npm run dev`
2. Open in browser
3. Click "Continue with Apple"
4. You'll be redirected to Apple's web OAuth flow
5. After authorization, you'll be redirected back to your app

---

## Checklist Summary

### Apple Developer Console:
- [ ] Enabled Sign in with Apple on App ID (`com.gunnar.colossus`)
- [ ] Created Services ID (`com.gunnar.colossus.signin`)
- [ ] Added Supabase domain and callback URL to Services ID
- [ ] Created Private Key and downloaded `.p8` file
- [ ] Noted Key ID and Team ID

### Supabase Dashboard:
- [ ] Enabled Apple OAuth provider
- [ ] Entered Services ID
- [ ] Entered Team ID  
- [ ] Entered Key ID
- [ ] Pasted Private Key contents
- [ ] Verified redirect URL

### Code Updates:
- [ ] Updated redirectURI in AuthContext.jsx with real Supabase URL

### Xcode:
- [ ] Added "Sign in with Apple" capability
- [ ] Verified Bundle ID and Team settings

---

## Values You Need to Get

Here's a quick reference of what you need to obtain:

| Value | Where to Get It | Example |
|-------|----------------|---------|
| **Services ID** | Apple Developer → Create new Services ID | `com.gunnar.colossus.signin` |
| **Team ID** | Apple Developer → Membership | `ABCD123456` |
| **Key ID** | Apple Developer → Keys (after creating key) | `ABC123XYZ` |
| **Private Key** | Downloaded `.p8` file contents | `-----BEGIN PRIVATE KEY-----...` |
| **Supabase URL** | Supabase Dashboard → Settings → API | `https://xyzabc.supabase.co` |
| **Supabase Callback** | Supabase Dashboard → Auth → Providers → Apple | `https://xyzabc.supabase.co/auth/v1/callback` |

---

## Troubleshooting

### "Invalid client" error
- Double-check your Services ID matches exactly
- Verify callback URL in Apple Developer matches Supabase exactly

### "Invalid team" error  
- Verify Team ID is correct in Supabase
- Make sure your Apple Developer account is active

### Native iOS not working
- Ensure "Sign in with Apple" capability is added in Xcode
- Check Bundle ID matches your App ID
- Verify you're signed into iCloud on the simulator/device

### Web OAuth not working
- Verify redirect URL is added to Apple Services ID
- Check Supabase URL is correct in your code
- Make sure Apple provider is enabled in Supabase

---

## Notes

- Apple requires Sign in with Apple if you offer other social login options (App Store requirement)
- Users can choose to hide their email - Apple will provide a proxy email
- The flow is seamless on iOS with Face ID/Touch ID
- Web users get redirected to Apple's OAuth page
- All user data syncs through Supabase regardless of login method

---

## Need Help?

If you get stuck:
1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors
3. Check Xcode console for native errors
4. Verify all IDs and keys are entered correctly (no extra spaces/line breaks)



SECRET KEY: eyJ0eXAiOiJKV1QiLCJraWQiOiJGTEJXWUI1TEQ4IiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJDMzU4VlEzQzlXIiwic3ViIjoiY29tLmd1bm5hcmF1dHRlcnNvbi5wb2dvLnNpZ25pbiIsImlhdCI6MTc2NDE5NzI4OCwiZXhwIjoxNzc5NzQ5Mjg4LCJhdWQiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIn0.b81FH9mX4lWxLKrvSc7aBZ9iesov9czsn3gD1UCcbOU1luT5Gn7bwi4oHWnttAc-35FUdhI61vB4K5isPE0Qhw