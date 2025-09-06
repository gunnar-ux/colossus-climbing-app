# 🧹 Clean Authentication Plan

## The Problem
We have 4 different auth systems fighting each other:
- AuthService (anonymous auth)
- PhysicalStats (profile creation)  
- ClimbingService (another profile system)
- AuthContext (mixed approach)

## The Solution: ONE Simple System

### 1. Single Auth Flow
```
Email/Password → Personal Info → Physical Stats → Dashboard
```

### 2. Single Profile Creation
- Only ONE function creates profiles
- Only ONE place checks for profiles
- Only ONE database schema

### 3. Clean File Structure
```
src/
  auth/
    useAuth.js          // Single auth hook
    authService.js      // Single auth service
  components/
    onboarding/
      SignUp.js         // Email/password only
      PersonalInfo.js   // Name, age, gender
      PhysicalStats.js  // Height, weight, ape index
```

## Implementation Steps

### Step 1: Delete Conflicting Files
- Remove old authService.js
- Remove climbingService.js auth methods
- Remove QuickStart.js (anonymous auth)

### Step 2: Create Simple Auth Hook
```javascript
// auth/useAuth.js
export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  
  const signUp = async (email, password) => {
    // Just create Supabase auth user
  }
  
  const createProfile = async (profileData) => {
    // Just create profile in database
  }
}
```

### Step 3: Simple Onboarding
```javascript
// SignUp → PersonalInfo → PhysicalStats → createProfile() → Dashboard
```

### Step 4: Clean Database
- Use setup.sql (no anonymous columns)
- One users table
- Simple RLS policies

## Result
- ✅ Email/password auth works
- ✅ Profile creation works  
- ✅ Data persists
- ✅ No infinite loops
- ✅ No competing systems
