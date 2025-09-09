// Authentication context for managing user state across the app
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, auth, database } from '../lib/supabase.js'

const AuthContext = createContext({})

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    // Check for existing Supabase session
    const initAuth = async () => {
      try {
        console.log('🔐 Initializing auth...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('🔐 Current session:', session?.user?.id, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          // Profile loading will be handled by auth state change listener
        } else {
          console.log('🔐 No active session found')
          // Clear any stale profile data
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth init error:', error)
        // Clear everything on error
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    // Initialize auth
    initAuth()

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth event:', event, 'User ID:', session?.user?.id, 'Email:', session?.user?.email)

        // Only process INITIAL_SESSION to avoid duplicate loads
        if (event === 'SIGNED_IN' && user !== null) {
          console.log('🔐 Skipping SIGNED_IN - already have user, waiting for INITIAL_SESSION')
          return
        }
        
        console.log('🔐 Processing auth event:', event)

        if (session?.user && session.user.id) {
        console.log('🔐 Valid session found, loading profile for:', session.user.id)
        setUser(session.user)
        setProfileLoading(true)
        
        try {
          // First try to load from localStorage for instant loading
          const storedProfile = localStorage.getItem('userProfile')
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile)
            console.log('🔐 Using cached profile for instant load:', parsedProfile.name)
            setProfile(parsedProfile)
            setProfileLoading(false)
            setLoading(false)
            
            // Still try to refresh from database in background
            database.users.getById(session.user.id).then(({ data, error }) => {
              if (!error && data) {
                console.log('🔐 Updated profile from database:', data.name)
                setProfile(data)
                localStorage.setItem('userProfile', JSON.stringify(data))
              }
            }).catch(err => console.log('🔐 Background profile refresh failed:', err.message))
            
            return
          }
          
          console.log('🔐 Loading user profile from database...')
          
          // Add timeout to prevent hanging - reduced to 5s for faster fallback
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
          );
          
          const result = await Promise.race([
            database.users.getById(session.user.id),
            timeoutPromise
          ]);
          
          const { data: existingProfile, error } = result
          console.log('🔐 Profile query result:', { existingProfile, error })
          
          if (error) {
            console.error('🔐 Profile query error:', error)
            setProfile(null)
          } else if (!existingProfile) {
            console.log('🔐 No profile found - user will need to complete onboarding')
            setProfile(null)
          } else {
            console.log('🔐 Profile loaded successfully:', existingProfile.name)
            setProfile(existingProfile)
            // Store profile in localStorage for persistence
            localStorage.setItem('userProfile', JSON.stringify(existingProfile))
          }
        } catch (error) {
          console.error('🔐 Profile loading failed:', error)
          
          // Try to load from localStorage as fallback
          try {
            const storedProfile = localStorage.getItem('userProfile')
            if (storedProfile) {
              const parsedProfile = JSON.parse(storedProfile)
              console.log('🔐 Using stored profile as fallback:', parsedProfile.name)
              setProfile(parsedProfile)
            } else {
              setProfile(null)
            }
          } catch (storageError) {
            console.error('🔐 Failed to load from localStorage:', storageError)
            setProfile(null)
          }
        } finally {
          setProfileLoading(false)
          setLoading(false)
        }
      } else {
        console.log('🔐 No valid session, clearing auth state')
        setUser(null)
        setProfile(null)
        setLoading(false)
        // Clear stored profile
        localStorage.removeItem('userProfile')
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

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Signout error:', error)
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
  console.log('🔐 AuthContext render - User:', !!user, 'Profile:', !!profile, 'Loading:', loading)
  
  const value = {
    // State
    user,
    profile,
    loading,
    profileLoading,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    
    // Methods
    signUp,
    signIn,
    signOut,
    createProfile,
    updateProfile,
    updateEmail,
    updatePassword,
    loadProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
