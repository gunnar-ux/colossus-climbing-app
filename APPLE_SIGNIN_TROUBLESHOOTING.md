# Apple Sign In - Troubleshooting "Nonces Mismatch" Error

## Current Status
- ✅ Apple Developer Console configured
- ✅ Supabase provider enabled  
- ❌ Getting "nonces mismatch" error

## Critical Configuration Checklist

### 1. Supabase Dashboard Configuration

Go to **Supabase Dashboard** → **Authentication** → **Providers** → **Apple**

**CRITICAL: The "Client ID" field should contain BOTH IDs separated by comma:**

```
com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo
```

**Breakdown:**
- `com.gunnarautterson.pogo.signin` = Services ID (for web OAuth)
- `com.gunnarautterson.pogo` = App ID/Bundle ID (for native iOS)

**Why both?** Supabase needs to accept tokens from:
1. Native iOS app (uses App ID)
2. Web OAuth flow (uses Services ID)

### 2. Verify Your Configuration

In Supabase Apple Provider settings, you should have:

| Field | Value |
|-------|-------|
| **Client ID** | `com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo` |
| **Team ID** | `C358VQ3C9W` (your Apple Team ID) |
| **Key ID** | `FLBWYB5LD8` (from your .p8 key) |
| **Secret Key** | The JWT secret you generated |

### 3. Common Causes of "Nonces Mismatch"

1. **Missing App ID in Supabase Client IDs**
   - ❌ Only Services ID: `com.gunnarautterson.pogo.signin`
   - ✅ Both IDs: `com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo`

2. **Incorrect nonce hashing**
   - Apple expects: SHA256 hashed nonce
   - Supabase expects: Raw (unhashed) nonce
   - Must pass DIFFERENT values to each

3. **Wrong Client ID in native code**
   - Native iOS should use App ID: `com.gunnarautterson.pogo`
   - NOT the Services ID

4. **Supabase library version**
   - Must be @supabase/supabase-js v2.56.0 or later
   - Earlier versions had issues with Apple's issuer URL change

### 4. Verification Steps

#### Step 1: Check Supabase Configuration

```bash
# In Supabase Dashboard, verify:
# 1. Apple provider is enabled (toggle is ON)
# 2. Client ID field contains BOTH IDs (comma-separated)
# 3. All credentials (Team ID, Key ID, Secret Key) are entered
# 4. Click "Save" after any changes
```

#### Step 2: Verify iOS Configuration

```bash
# Open Xcode
open ios/App/App.xcworkspace

# Verify:
# 1. Bundle Identifier: com.gunnarautterson.pogo
# 2. Signing & Capabilities → "Sign in with Apple" is added
# 3. Team is set to your Apple Developer account
```

#### Step 3: Check Code Implementation

The code should:
1. Generate a raw nonce (random string)
2. Hash it with SHA256 
3. Send **hashed** nonce to Apple
4. Send **raw** nonce to Supabase

```javascript
const rawNonce = generateRandomString()
const hashedNonce = await sha256(rawNonce)

// To Apple
SignInWithApple.authorize({
  clientId: 'com.gunnarautterson.pogo',  // App ID, not Services ID
  nonce: hashedNonce  // Hashed version
})

// To Supabase
supabase.auth.signInWithIdToken({
  provider: 'apple',
  token: identityToken,
  nonce: rawNonce  // Raw version
})
```

### 5. Alternative Approach: Skip Nonce (Let Supabase Handle It)

If nonce handling continues to fail, try OAuth redirect flow:

```javascript
// This approach lets Supabase manage the entire OAuth flow
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'apple',
  options: {
    redirectTo: window.location.origin
  }
})
```

**Trade-off:** User gets redirected out of app (browser opens), then back.

### 6. Debug Logging

Add this to your code to see what's happening:

```javascript
console.log('Raw nonce:', rawNonce)
console.log('Hashed nonce:', hashedNonce)
console.log('Identity token present:', !!result.response.identityToken)
console.log('User:', result.response.user)
```

### 7. Test in This Order

1. **Clean build**
   ```bash
   npx cap sync ios
   cd ios/App && pod install && cd ../..
   ```

2. **Build in Xcode**
   ```bash
   open ios/App/App.xcworkspace
   # Product → Clean Build Folder
   # Product → Build
   # Run on simulator
   ```

3. **Check console logs** for:
   - Nonce generation
   - Apple Sign-In success
   - Supabase token exchange

### 8. Known Issues

- **Apple changed issuer URL** (Nov 2024)
  - Old: `https://appleid.apple.com`
  - New: `https://account.apple.com`
  - Fix: Update Supabase libraries to latest version

- **Capacitor plugin version**
  - Need @capacitor-community/apple-sign-in v7.1.0+
  - Check: `npm list @capacitor-community/apple-sign-in`

### 9. Still Not Working?

Try this diagnostic:

1. **Test with email/password** - Does that work?
   - If NO → Supabase connection issue
   - If YES → Apple Sign-In specific issue

2. **Check Supabase logs**
   - Dashboard → Logs
   - Look for Apple auth attempts
   - Check error messages

3. **Verify in Apple Developer**
   - App ID has "Sign in with Apple" enabled
   - Services ID has correct callback URL
   - Private key is not expired

4. **Re-generate Secret Key**
   - Use JWT generation tool again
   - Update in Supabase
   - Try again

### 10. Contact Support

If still stuck, gather this info:

- Supabase project ID
- @supabase/supabase-js version
- @capacitor-community/apple-sign-in version
- iOS version (simulator/device)
- Console logs showing the error
- Screenshot of Supabase Apple provider config

---

## Quick Fix Checklist

- [ ] Supabase Client ID has BOTH IDs (comma-separated)
- [ ] Using App ID in native code, not Services ID
- [ ] Passing hashed nonce to Apple, raw nonce to Supabase
- [ ] @supabase/supabase-js is v2.56.0+
- [ ] Clean build and fresh install
- [ ] Xcode has "Sign in with Apple" capability
- [ ] Team ID, Key ID, Secret Key all correct in Supabase

