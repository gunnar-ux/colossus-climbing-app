// Authentication context for managing user state across the app
import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'
import { supabase, auth, database } from '../lib/supabase.js'
import { calculateSessionStats } from '../utils/sessionCalculations.js'
import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { Capacitor } from '@capacitor/core'

const AuthContext = createContext({})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  
  // Data state
  const [sessions, setSessions] = useState([])
  const [userData, setUserData] = useState({
    totalSessions: 0,
    totalClimbs: 0
  })
  
  // Single loading flag for entire initialization
  const [isInitializing, setIsInitializing] = useState(true)

  // Helper functions for data transformation (from useDataHydration)
  const transformDatabaseSessions = (dbSessions) => {
    const SESSION_GAP_THRESHOLD = 2 * 60 * 60 * 1000 // 2 hours
    
    return dbSessions.map(session => {
      const rawClimbs = session.climbs || []
      const transformedClimbs = rawClimbs.map(transformClimb)
      const sessionStats = calculateSessionStats(transformedClimbs)
      
      let endTime = session.end_time ? new Date(session.end_time).getTime() : null
      let sessionDate = formatSessionDate(session.start_time)
      
      if (!session.end_time && transformedClimbs.length > 0) {
        const lastClimbTime = Math.max(...transformedClimbs.map(climb => climb.timestamp))
        const timeSinceLastClimb = Date.now() - lastClimbTime
        
        if (timeSinceLastClimb > SESSION_GAP_THRESHOLD) {
          endTime = lastClimbTime
          sessionDate = formatSessionDate(session.start_time)
        } else {
          sessionDate = "Now"
        }
      }
      
      return {
        id: session.id,
        date: sessionDate,
        timestamp: new Date(session.start_time).getTime(),
        startTime: new Date(session.start_time).getTime(),
        endTime: endTime,
        duration: calculateDuration(session.start_time, endTime ? new Date(endTime).toISOString() : null),
        climbs: rawClimbs.length,
        medianGrade: session.median_grade || calculateMedianGrade(rawClimbs),
        avgRPE: session.avg_rpe || calculateAvgRPE(rawClimbs),
        climbList: transformedClimbs,
        totalXP: session.total_xp || sessionStats.totalXP || 0,
        ...sessionStats
      }
    })
  }

  const transformClimb = (climb) => ({
    id: climb.id,
    timestamp: new Date(climb.timestamp).getTime(),
    grade: climb.grade,
    style: normalizeStyle(climb.style),
    styles: [normalizeStyle(climb.style)],
    angle: normalizeAngle(climb.wall_angle),
    wall: normalizeAngle(climb.wall_angle),
    rpe: climb.rpe,
    attempts: climb.attempts,
    type: climb.climb_type || 'BOULDER'
  })

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return "Now"
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const calculateDuration = (startTime, endTime) => {
    if (!endTime) return "Active"
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diffMs = end - start
    const diffMins = Math.floor(diffMs / (1000 * 60))
    if (diffMins < 60) return `${diffMins}m`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}m`
  }

  const calculateMedianGrade = (climbs) => {
    if (climbs.length === 0) return 'V0'
    const gradeValues = climbs.map(climb => 
      parseInt(climb.grade.replace('V', '')) || 0
    ).sort((a, b) => a - b)
    const median = gradeValues[Math.floor(gradeValues.length / 2)]
    return `V${median}`
  }

  const calculateAvgRPE = (climbs) => {
    if (climbs.length === 0) return 0
    const total = climbs.reduce((sum, climb) => sum + (climb.rpe || 0), 0)
    return Math.round((total / climbs.length) * 2) / 2
  }

  const normalizeStyle = (style) => {
    if (style === 'POWERFUL') return 'Power'
    if (style === 'TECHNICAL') return 'Technical'
    if (style === 'SIMPLE') return 'Simple'
    return style
  }

  const normalizeAngle = (angle) => {
    if (!angle) return 'Vertical'
    if (angle === 'SLAB') return 'Slab'
    if (angle === 'VERTICAL') return 'Vertical'
    if (angle === 'OVERHANG') return 'Overhang'
    return angle
  }

  // Load user data (sessions and userData)
  const loadUserData = async (userId) => {
    try {
      console.log('📊 Loading user sessions from database...')
      const { data: dbSessions, error: sessionsError } = await database.sessions.getByUserId(userId, 50)
      
      if (sessionsError) {
        console.error('📊 Error loading sessions:', sessionsError)
        return
      }

      console.log('📊 Loaded sessions:', dbSessions?.length || 0)
      const transformedSessions = transformDatabaseSessions(dbSessions || [])
      setSessions(transformedSessions)
      console.log('📊 Sessions loaded successfully')
    } catch (error) {
      console.error('📊 Failed to load user data:', error)
    }
  }

  // Track if this is the initial mount (to prevent duplicate loading)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Initialize auth and listen for changes
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('🔐 Existing session found:', session.user.email)
          setUser(session.user)
          
          // Load user data immediately on app open
          try {
            console.log('🔐 Loading existing user data...')
            
            // Step 1: Load profile
            const { data: profileData, error: profileError } = await database.users.getById(session.user.id)
            
            if (profileError || !profileData) {
              console.log('🔐 No profile found')
              setProfile(null)
              setIsInitializing(false)
              isInitialMount.current = false
              return
            }
            
            console.log('🔐 Profile loaded:', profileData.name)
            setProfile(profileData)
            localStorage.setItem('userProfile', JSON.stringify(profileData))
            
            // Step 2: Load sessions
            await loadUserData(session.user.id)
            
            // Step 3: Update userData
            setUserData({
              totalSessions: profileData.total_sessions || 0,
              totalClimbs: profileData.total_climbs || 0
            })
            
            console.log('🔐 ✅ Existing user loaded successfully')
          } catch (loadError) {
            console.error('🔐 Failed to load existing user:', loadError)
          } finally {
            setIsInitializing(false)
            isInitialMount.current = false
          }
        } else {
          console.log('🔐 No active session')
          setIsInitializing(false)
          isInitialMount.current = false
        }
      } catch (error) {
        console.error('🔐 Auth init error:', error)
        setIsInitializing(false)
        isInitialMount.current = false
      }
    }

    initAuth()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth event:', event, 'User:', session?.user?.email, 'isInitialMount:', isInitialMount.current)

        // ALWAYS skip on initial mount - initAuth handles it
        if (isInitialMount.current) {
          console.log('🔐 Initial mount - auth listener skipping, initAuth is handling')
          return
        }

        // Handle signed out
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🔐 User signed out - clearing all state')
          setUser(null)
          setProfile(null)
          setSessions([])
          setUserData({ totalSessions: 0, totalClimbs: 0 })
          setIsInitializing(false)
          localStorage.removeItem('userProfile')
          return
        }

        // Handle sign-ins (only for NEW logins, not initial app load)
        if (session?.user && event === 'SIGNED_IN') {
          console.log('🔐 New login detected, loading user data for:', session.user.email)
          setUser(session.user)
          
          try {
            // Step 1: Load profile
            console.log('🔐 Step 1/3: Loading profile...')
            const { data: profileData, error: profileError } = await database.users.getById(session.user.id)
            
            if (profileError) {
              console.error('🔐 Profile error:', profileError)
              setProfile(null)
              setIsInitializing(false)
              return
            }
            
            if (!profileData) {
              console.log('🔐 No profile found - needs onboarding')
              setProfile(null)
              setIsInitializing(false)
              return
            }
            
            console.log('🔐 Profile loaded:', profileData.name)
            setProfile(profileData)
            localStorage.setItem('userProfile', JSON.stringify(profileData))
            
            // Step 2: Load sessions
            console.log('🔐 Step 2/3: Loading sessions...')
            await loadUserData(session.user.id)
            
            // Step 3: Update userData from profile
            console.log('🔐 Step 3/3: Syncing userData...')
            setUserData({
              totalSessions: profileData.total_sessions || 0,
              totalClimbs: profileData.total_climbs || 0
            })
            
            console.log('🔐 ✅ Complete! User fully initialized')
            setIsInitializing(false)
            
          } catch (error) {
            console.error('🔐 Failed to initialize user:', error)
            setIsInitializing(false)
          }
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  // Profile loading is now handled in auth state change above
  // This function is kept for compatibility but should not be needed
  const loadProfile = async (userId) => {
    console.log('🔐 loadProfile called (should not be needed anymore):', userId)
    // Profile loading is now handled automatically in auth state change
  }

  // Manual profile refresh - used after onboarding completes
  const refreshProfile = async (forceUserId = null) => {
    const targetUserId = forceUserId || user?.id
    
    if (!targetUserId) {
      console.warn('🔐 refreshProfile: No user ID available')
      return { success: false, error: 'No user ID' }
    }
    
    try {
      console.log('🔐 Refreshing profile for user:', targetUserId)
      
      // Step 1: Load profile
      const { data: profileData, error: profileError } = await database.users.getById(targetUserId)
      
      if (profileError || !profileData) {
        console.error('🔐 Profile refresh error:', profileError)
        return { success: false, error: profileError }
      }
      
      console.log('🔐 Profile refreshed:', profileData.name, 'Onboarding completed:', profileData.onboarding_completed)
      setProfile(profileData)
      localStorage.setItem('userProfile', JSON.stringify(profileData))
      
      // Step 2: Load sessions
      await loadUserData(targetUserId)
      
      // Step 3: Update userData
      setUserData({
        totalSessions: profileData.total_sessions || 0,
        totalClimbs: profileData.total_climbs || 0
      })
      
      console.log('🔐 ✅ Profile refresh complete')
      return { success: true, profile: profileData }
    } catch (error) {
      console.error('🔐 Failed to refresh profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Supabase auth methods
  const signUp = async (email, password) => {
    try {
      console.log('🔐 REAL AUTH: SignUp attempt for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation for testing
        }
      })
      
      console.log('🔐 SignUp response:', { data, error })
      
      if (error) {
        console.error('🔐 SignUp error:', error.message)
        return { success: false, error: error.message }
      }
      
      if (data.user) {
        console.log('🔐 SignUp SUCCESS! User created:', data.user.id)
        
        // Create minimal user profile in database
        try {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              onboarding_completed: false,
              name: '' // Optional, can be filled later
            })
          
          if (profileError) {
            console.error('🔐 Failed to create user profile:', profileError)
            // Continue anyway - profile creation can be retried
          } else {
            console.log('🔐 Minimal user profile created')
          }
        } catch (profileError) {
          console.error('🔐 Profile creation exception:', profileError)
          // Continue anyway
        }
        
        return { success: true, user: data.user }
      }
      
      return { success: false, error: 'Unknown signup error' }
      
    } catch (error) {
      console.error('🔐 SignUp exception:', error)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔐 REAL AUTH: SignIn attempt for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      
      console.log('🔐 SignIn response:', { data, error })
      
      if (error) {
        console.error('🔐 SignIn error:', error.message)
        return { success: false, error: error.message }
      }
      
      if (data.user) {
        console.log('🔐 SignIn SUCCESS! User logged in:', data.user.id)
        return { success: true, user: data.user }
      }
      
      return { success: false, error: 'Unknown signin error' }
      
    } catch (error) {
      console.error('🔐 SignIn exception:', error)
      return { success: false, error: error.message }
    }
  }

  const signInWithApple = async () => {
    try {
      console.log('🍎 Apple Sign In starting')
      
      const isNative = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
      
      if (isNative) {
        console.log('🍎 Native iOS flow')
        
        // Generate random nonce
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
        
        // SHA256 hash
        const sha256 = async (str) => {
          const encoder = new TextEncoder()
          const data = encoder.encode(str)
          const hashBuffer = await crypto.subtle.digest('SHA-256', data)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        }
        
        const rawNonce = generateNonce()
        const hashedNonce = await sha256(rawNonce)
        
        console.log('🍎 Nonce generated')
        
        // Call native Apple Sign In with hashed nonce
        const result = await SignInWithApple.authorize({
          clientId: 'com.gunnarautterson.pogo',
          redirectURI: 'https://jamyscybvyyfnzqqiovi.supabase.co/auth/v1/callback',
          scopes: 'email name',
          nonce: hashedNonce
        })
        
        console.log('🍎 Apple auth complete')
        
        if (!result.response.identityToken) {
          return { success: false, error: 'No identity token' }
        }
        
        // Exchange with Supabase using raw nonce
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: result.response.identityToken,
          nonce: rawNonce
        })
        
        if (error) {
          console.error('🍎 Supabase error:', error.message)
          return { success: false, error: error.message }
        }
        
        console.log('🍎 Success!')
        return { success: true, user: data.user }
        
      } else {
        // Web OAuth fallback
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}`
          }
        })
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        return { success: true }
      }
      
    } catch (error) {
      console.error('🍎 Error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...')
      
      // Clear all state immediately
      setUser(null)
      setProfile(null)
      setSessions([])
      setUserData({ totalSessions: 0, totalClimbs: 0 })
      localStorage.removeItem('userProfile')
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      console.log('🚪 Sign out successful')
      return { success: true }
    } catch (error) {
      console.error('🚪 Signout error:', error)
      // State already cleared, so user experience is still good
      return { success: false, error: error.message }
    }
  }

  const createProfile = async (profileData) => {
    // Allow profileData to contain id and email if user is not yet loaded
    const userId = profileData.id || user?.id
    const userEmail = profileData.email || user?.email
    
    if (!userId) return { success: false, error: 'No user ID available' }
    
    try {
      const userData = {
        id: userId,
        email: userEmail,
        ...profileData
      }
      
      console.log('🔐 Creating/updating profile with userData:', userData)
      
      // First try to create new profile
      let { data, error } = await database.users.create(userData)
      console.log('🔐 Database create result:', { data, error })
      
      // If user already exists, update instead
      if (error && error.message?.includes('duplicate key')) {
        console.log('🔐 User exists, updating profile instead...')
        const updateResult = await database.users.update(userId, userData)
        data = updateResult.data
        error = updateResult.error
        console.log('🔐 Database update result:', { data, error })
      }
      
      if (error) throw error
      
      setProfile(data)
      console.log('🔐 Profile created/updated successfully!')
      return { success: true, profile: data }
    } catch (error) {
      console.error('🔐 Create/update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      console.log('🔐 Updating profile for user:', user.id, 'Updates:', updates)
      const { data, error } = await database.users.update(user.id, updates)
      console.log('🔐 Profile update result:', { data, error })
      
      if (error) throw error
      
      setProfile(data)
      console.log('🔐 Profile updated successfully!')
      return { success: true, profile: data }
    } catch (error) {
      console.error('🔐 Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  const updateEmail = async (newEmail) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Update email error:', error)
      return { success: false, error: error.message }
    }
  }

  const updatePassword = async (newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Update password error:', error)
      return { success: false, error: error.message }
    }
  }

  // Debug auth state
  console.log('🔐 AuthContext - User:', !!user, 'Profile:', !!profile, 'Sessions:', sessions.length, 'Initializing:', isInitializing)
  
  const value = useMemo(() => ({
    // Auth state
    user,
    profile,
    isAuthenticated: !!user,
    hasProfile: !!profile && profile.onboarding_completed,
    
    // Data state
    sessions,
    userData,
    setSessions,
    setUserData,
    
    // Loading state
    isInitializing,
    
    // Backwards compatibility (deprecated)
    loading: isInitializing,
    profileLoading: false,
    dataLoading: false,
    
    // Methods
    signUp,
    signIn,
    signInWithApple,
    signOut,
    createProfile,
    updateProfile,
    updateEmail,
    updatePassword,
    loadProfile,
    refreshProfile
  }), [user, profile, sessions, userData, isInitializing])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
