// Climbing-specific service layer for Supabase integration
import { supabase, database } from '../lib/supabase.js'
import { validateClimbData } from '../utils/validation.js'

export class ClimbingService {
  constructor() {
    this.currentUser = null
    this.isOnline = navigator.onLine
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null
      console.log('ClimbingService - Auth state changed:', event, session?.user?.email)
    })
    
    // Listen for online/offline
    window.addEventListener('online', () => { this.isOnline = true })
    window.addEventListener('offline', () => { this.isOnline = false })
  }

  // Auth methods
  async signUp(email, password, userData = {}) {
    try {
      console.log('ClimbingService - Attempting signup:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData // Additional user metadata
        }
      })
      
      if (error) {
        console.error('ClimbingService - Signup error:', error)
        throw error
      }
      
      console.log('ClimbingService - Signup successful:', data.user?.email)
      
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      
      this.currentUser = data.user
      return { success: true, user: data.user }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      this.currentUser = null
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  // User profile methods
  async createUserProfile(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          ...userData
        })
        .select()
        .single()
      
      if (error) throw error
      
      return { success: true, user: data }
    } catch (error) {
      console.error('Create profile error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserProfile(userId = this.currentUser?.id) {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      
      return { success: true, user: data }
    } catch (error) {
      console.error('Get profile error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateUserProfile(updates, userId = this.currentUser?.id) {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      console.log('ClimbingService - Updating profile for user:', userId, updates)
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          ...updates
        })
        .select()
        .single()
      
      if (error) {
        console.error('ClimbingService - Update profile error:', error)
        throw error
      }
      
      console.log('ClimbingService - Profile updated successfully:', data)
      return { success: true, user: data }
    } catch (error) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  // Session methods
  async createSession(sessionData) {
    const userId = this.currentUser?.id
    if (!userId) return { success: false, error: 'Not authenticated' }
    
    try {
      const sessionPayload = {
        user_id: userId,
        start_time: new Date(sessionData.startTime || Date.now()).toISOString(),
        end_time: sessionData.endTime ? new Date(sessionData.endTime).toISOString() : null,
        duration_minutes: sessionData.durationMinutes,
        gym_location: sessionData.gymLocation,
        notes: sessionData.notes
      }
      
      const { data, error } = await database.sessions.create(sessionPayload)
      if (error) throw error
      
      return { success: true, session: data }
    } catch (error) {
      console.error('Create session error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserSessions(limit = 50, userId = this.currentUser?.id) {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      const { data, error } = await database.sessions.getByUserId(userId, limit)
      if (error) throw error
      
      return { success: true, sessions: data }
    } catch (error) {
      console.error('Get sessions error:', error)
      return { success: false, error: error.message }
    }
  }

  async updateSession(sessionId, updates) {
    try {
      const { data, error } = await database.sessions.update(sessionId, updates)
      if (error) throw error
      
      return { success: true, session: data }
    } catch (error) {
      console.error('Update session error:', error)
      return { success: false, error: error.message }
    }
  }

  // Climb methods
  async logClimb(climbData, sessionId = null) {
    const userId = this.currentUser?.id
    if (!userId) return { success: false, error: 'Not authenticated' }
    
    // Validate climb data
    const validation = validateClimbData(climbData)
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') }
    }
    
    try {
      // Create session if none provided
      let currentSessionId = sessionId
      if (!currentSessionId) {
        const sessionResult = await this.createSession({
          startTime: Date.now(),
          gymLocation: 'Gym Session'
        })
        if (!sessionResult.success) throw new Error(sessionResult.error)
        currentSessionId = sessionResult.session.id
      }
      
      const climbPayload = {
        session_id: currentSessionId,
        user_id: userId,
        grade: climbData.grade,
        wall_angle: climbData.wall || climbData.angle,
        style: climbData.styles?.[0] || climbData.style,
        rpe: climbData.rpe,
        attempts: climbData.attempts,
        climb_type: climbData.type || 'BOULDER',
        timestamp: new Date(climbData.timestamp || Date.now()).toISOString()
      }
      
      const { data, error } = await database.climbs.create(climbPayload)
      if (error) throw error
      
      return { success: true, climb: data, sessionId: currentSessionId }
    } catch (error) {
      console.error('Log climb error:', error)
      return { success: false, error: error.message }
    }
  }

  async getUserClimbs(limit = 200, userId = this.currentUser?.id) {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      const { data, error } = await database.climbs.getByUserId(userId, limit)
      if (error) throw error
      
      return { success: true, climbs: data }
    } catch (error) {
      console.error('Get climbs error:', error)
      return { success: false, error: error.message }
    }
  }

  // Metrics methods
  async calculateAndCacheMetrics(userId = this.currentUser?.id) {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      // Get user data
      const userResult = await this.getUserProfile(userId)
      if (!userResult.success) throw new Error(userResult.error)
      
      // Get sessions with climbs
      const sessionsResult = await this.getUserSessions(100, userId)
      if (!sessionsResult.success) throw new Error(sessionsResult.error)
      
      const sessions = sessionsResult.sessions || []
      const user = userResult.user
      
      // Calculate CRS
      const crsData = calculateCRS(user.total_sessions, user.total_climbs, sessions)
      
      // Calculate load ratio
      const loadRatioData = calculateLoadRatio(sessions)
      
      // Cache CRS score
      if (crsData) {
        await database.crsScores.create({
          user_id: userId,
          score: crsData.score,
          status: crsData.status,
          confidence: crsData.confidence,
          components: crsData.components || {},
          session_count: user.total_sessions,
          climb_count: user.total_climbs
        })
      }
      
      // Get recommendations
      const recommendations = getRecommendedTraining(crsData, loadRatioData, sessions.slice(0, 7))
      
      return {
        success: true,
        metrics: {
          crs: crsData,
          loadRatio: loadRatioData,
          recommendations
        }
      }
    } catch (error) {
      console.error('Calculate metrics error:', error)
      return { success: false, error: error.message }
    }
  }

  async getLatestCRS(userId = this.currentUser?.id) {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      const { data, error } = await database.crsScores.getLatest(userId)
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
      
      return { success: true, crs: data }
    } catch (error) {
      console.error('Get CRS error:', error)
      return { success: false, error: error.message }
    }
  }

  // Data sync methods
  async syncLocalData(localSessions) {
    const userId = this.currentUser?.id
    if (!userId) return { success: false, error: 'Not authenticated' }
    
    try {
      let syncedCount = 0
      
      for (const localSession of localSessions) {
        // Check if session already exists
        const existingResult = await this.getUserSessions(100, userId)
        const existingSessions = existingResult.sessions || []
        
        const exists = existingSessions.some(s => 
          Math.abs(new Date(s.start_time) - new Date(localSession.timestamp)) < 60000 // Within 1 minute
        )
        
        if (!exists) {
          // Create session
          const sessionResult = await this.createSession({
            startTime: localSession.timestamp || localSession.startTime,
            endTime: localSession.endTime,
            durationMinutes: this.parseDuration(localSession.duration),
            gymLocation: 'Synced Session'
          })
          
          if (sessionResult.success && localSession.climbList) {
            // Add climbs
            for (const climb of localSession.climbList) {
              await this.logClimb(climb, sessionResult.session.id)
            }
            syncedCount++
          }
        }
      }
      
      return { success: true, syncedSessions: syncedCount }
    } catch (error) {
      console.error('Sync error:', error)
      return { success: false, error: error.message }
    }
  }

  // Utility methods
  parseDuration(duration) {
    if (typeof duration === 'number') return duration
    if (typeof duration !== 'string') return null
    
    const match = duration.match(/(\d+)h?\s*(\d+)?m?/)
    if (!match) return null
    
    const hours = parseInt(match[1]) || 0
    const minutes = parseInt(match[2]) || 0
    return hours * 60 + minutes
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser
  }
  
  // Check if app is online
  isOnlineMode() {
    return this.isOnline
  }
}

// Export singleton instance
export const climbingService = new ClimbingService()
export default climbingService
