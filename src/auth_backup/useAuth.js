// Single, simple authentication system
import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, database } from '../lib/supabase.js'

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
    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
          await loadProfile(session.user.id)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)
      
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const { data } = await database.users.getById(userId)
      setProfile(data)
      console.log('Profile loaded:', data)
    } catch (error) {
      console.error('Failed to load profile:', error)
      setProfile(null)
    }
  }

  // Simple auth methods
  const signUp = async (email, password) => {
    try {
      console.log('Creating account for:', email)
      const { data, error } = await auth.signUp(email, password)
      
      if (error) throw error
      
      console.log('Account created successfully')
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: error.message }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Signing in:', email)
      const { data, error } = await auth.signIn(email, password)
      
      if (error) throw error
      
      console.log('Signed in successfully')
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Signin error:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    try {
      await auth.signOut()
      return { success: true }
    } catch (error) {
      console.error('Signout error:', error)
      return { success: false, error: error.message }
    }
  }

  // Single profile creation method
  const createProfile = async (profileData) => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      console.log('Creating profile for user:', user.id)
      console.log('Profile data:', profileData)

      const fullProfileData = {
        id: user.id,
        email: user.email,
        ...profileData,
        total_sessions: 0,
        total_climbs: 0
      }

      const { data, error } = await database.users.create(fullProfileData)
      
      if (error) {
        console.error('Profile creation failed:', error)
        return { success: false, error: error.message }
      }

      console.log('Profile created successfully:', data)
      setProfile(data)
      return { success: true, profile: data }
    } catch (error) {
      console.error('Profile creation error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    // State
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    hasProfile: !!profile,
    
    // Methods
    signUp,
    signIn,
    signOut,
    createProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
