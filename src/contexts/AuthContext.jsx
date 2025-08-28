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
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    // Check for existing local user session
    try {
      const storedUser = localStorage.getItem('currentUser')
      const isAuth = localStorage.getItem('isAuthenticated')
      
      if (isAuth === 'true' && storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setProfile(userData)
      }
    } catch (error) {
      console.log('Error loading stored user:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Simple local auth methods
  const signUp = async (userData) => {
    try {
      const user = {
        id: userData.id || `user_${Date.now()}`,
        name: userData.name || '', // Optional name field
        email: userData.email,
        createdAt: new Date().toISOString()
      }
      
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('isAuthenticated', 'true')
      
      setUser(user)
      setProfile(user)
      
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signIn = async (userData) => {
    // For now, sign in and sign up do the same thing
    return signUp(userData)
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('currentUser')
      localStorage.removeItem('isAuthenticated')
      
      setUser(null)
      setProfile(null)
      setIsDemo(false)
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    
    try {
      const updatedUser = {
        ...user,
        ...updates
      }
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setProfile(updatedUser)
      
      return { success: true, user: updatedUser }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateEmail = async (newEmail) => {
    return updateProfile({ email: newEmail })
  }

  const updatePassword = async (newPassword) => {
    // For testing, we don't store passwords
    return { success: true }
  }

  // Helper function to create profile from pending data stored in localStorage
  const createPendingProfile = async () => {
    try {
      const pendingData = localStorage.getItem('pendingProfileData')
      if (!pendingData) return
      
      const profileData = JSON.parse(pendingData)
      await updateProfile(profileData)
      
      // Clean up pending data
      localStorage.removeItem('pendingProfileData')
    } catch (error) {
      console.error('createPendingProfile error:', error)
    }
  }

  const value = {
    // State
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isDemo,
    
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
