/**
 * Apple Sign In Debug Utility
 * Use this to test and debug nonce handling
 */

export const testNonceGeneration = async () => {
  console.log('=== Testing Nonce Generation ===')
  
  // Generate raw nonce
  const generateNonce = (length = 32) => {
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._'
    let result = ''
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length]
    }
    return result
  }
  
  // SHA256 hash function
  const sha256 = async (str) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  const rawNonce = generateNonce()
  const hashedNonce = await sha256(rawNonce)
  
  console.log('Raw Nonce:', rawNonce)
  console.log('Raw Nonce Length:', rawNonce.length)
  console.log('Hashed Nonce:', hashedNonce)
  console.log('Hashed Nonce Length:', hashedNonce.length)
  
  return { rawNonce, hashedNonce }
}

export const debugAppleSignInConfig = () => {
  console.log('=== Apple Sign In Configuration ===')
  console.log('App ID (Bundle ID): com.gunnarautterson.pogo')
  console.log('Services ID: com.gunnarautterson.pogo.signin')
  console.log('Supabase URL: https://jamyscybvyyfnzqqiovi.supabase.co')
  console.log('Redirect URI: https://jamyscybvyyfnzqqiovi.supabase.co/auth/v1/callback')
  console.log('')
  console.log('⚠️  Make sure in Supabase Dashboard:')
  console.log('   - Apple provider is enabled')
  console.log('   - Services ID (not App ID) is in the "Client ID" field')
  console.log('   - Team ID, Key ID, and Private Key are all correctly entered')
  console.log('   - BOTH client IDs are listed: com.gunnarautterson.pogo.signin,com.gunnarautterson.pogo')
}

// Call this from console to test
if (typeof window !== 'undefined') {
  window.testAppleSignIn = {
    testNonceGeneration,
    debugAppleSignInConfig
  }
}

