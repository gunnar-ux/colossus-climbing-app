#!/usr/bin/env node

/**
 * Generate Apple OAuth Secret Key for Supabase
 * 
 * Usage: node generate-apple-secret.js
 * 
 * You'll need:
 * - Team ID (from Apple Developer Console)
 * - Key ID (from your .p8 key)
 * - Private Key content (the .p8 file contents)
 * - Services ID (your client ID)
 */

const crypto = require('crypto');

// Configuration - REPLACE THESE VALUES
const TEAM_ID = 'C358VQ3C9W';  // Your Team ID
const KEY_ID = 'FLBWYB5LD8';    // Your Key ID
const CLIENT_ID = 'com.gunnarautterson.pogo.signin';  // Your Services ID

// Your private key from .p8 file (include the BEGIN/END lines)
const PRIVATE_KEY = `
-----BEGIN PRIVATE KEY-----
[PASTE YOUR PRIVATE KEY HERE]
-----END PRIVATE KEY-----
`;

function generateAppleSecret() {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + (180 * 24 * 60 * 60); // 180 days

  const payload = {
    iss: TEAM_ID,
    iat: now,
    exp: expiry,
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID
  };

  const header = {
    alg: 'ES256',
    kid: KEY_ID
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  
  const sign = crypto.createSign('SHA256');
  sign.update(signatureInput);
  sign.end();
  
  const signature = sign.sign(PRIVATE_KEY, 'base64url');
  
  const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
  
  console.log('\n=== Apple OAuth Secret Key for Supabase ===\n');
  console.log('Copy this into Supabase Dashboard > Auth > Providers > Apple > "Secret Key":');
  console.log('\n' + jwt + '\n');
  console.log('Valid until:', new Date(expiry * 1000).toISOString());
  console.log('\nMake sure this matches in Supabase:');
  console.log('- Team ID:', TEAM_ID);
  console.log('- Key ID:', KEY_ID);
  console.log('- Client ID:', CLIENT_ID);
  console.log('\n');
}

try {
  generateAppleSecret();
} catch (error) {
  console.error('Error generating secret:', error.message);
  console.log('\nMake sure:');
  console.log('1. You have pasted your private key correctly (with BEGIN/END lines)');
  console.log('2. All configuration values are correct');
  console.log('3. Node.js crypto module is available');
}

