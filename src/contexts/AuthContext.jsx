// Authentication context for managing user state across the app
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      setLoading(false)
      
      if (session?.user) {
        // Try to load user profile
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (data && !error) {
            setProfile(data)
          } else {
            setProfile(null)
            
            // Check if there's pending profile data to create
            await createPendingProfile(session.user.id)
          }
        } catch (error) {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Auth methods
  const signUp = async (email, password) => {
    try {

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      // Ensure required fields are present
      const safeUpdates = {
        email: user.email, // Always include email for database constraint
        name: updates.name || 'Climber', // Ensure name is never empty
        ...updates
      }
      
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          ...safeUpdates
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      setProfile(data)
      return { success: true, user: data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateEmail = async (newEmail) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updatePassword = async (newPassword) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Helper function to create profile from pending data stored in localStorage
  const createPendingProfile = async (userId) => {
    try {
      const pendingData = localStorage.getItem('pendingProfileData')
      if (!pendingData) return
      
      const profileData = JSON.parse(pendingData)
      
      // Get the current user's email from Supabase auth
      const { data: authUser } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: authUser?.user?.email, // Include email for database constraint
          name: profileData.name || 'Climber', // Ensure name is never empty
          ...profileData
        })
        .select()
        .single()
      
      if (error) {
        console.error('Profile creation error:', error)
        return
      }
      
      setProfile(data)
      
      // Clean up pending data
      localStorage.removeItem('pendingProfileData')
    } catch (error) {
      // Silently handle errors in profile creation
      console.error('createPendingProfile error:', error)
    }
  }

  const value = {
    // State
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    
    // Methods
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
