// Supabase client configuration for Colossus climbing app
import { createClient } from '@supabase/supabase-js'

// Supabase project configuration
// Replace these with your actual Supabase project values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your_supabase_project_url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database table names
export const TABLES = {
  USERS: 'users',
  SESSIONS: 'sessions', 
  CLIMBS: 'climbs',
  CRS_SCORES: 'crs_scores'
}

// Auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Additional user metadata
      }
    })
    return { data, error }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const database = {
  // Users
  users: {
    create: async (userData) => {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert(userData)
        .select()
        .single()
      return { data, error }
    },

    getById: async (userId) => {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    },

    update: async (userId, updates) => {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      return { data, error }
    }
  },

  // Sessions
  sessions: {
    create: async (sessionData) => {
      const { data, error } = await supabase
        .from(TABLES.SESSIONS)
        .insert(sessionData)
        .select()
        .single()
      return { data, error }
    },

    getByUserId: async (userId, limit = 50) => {
      const { data, error } = await supabase
        .from(TABLES.SESSIONS)
        .select(`
          *,
          climbs:climbs(*)
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit)
      return { data, error }
    },

    update: async (sessionId, updates) => {
      const { data, error } = await supabase
        .from(TABLES.SESSIONS)
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()
      return { data, error }
    }
  },

  // Climbs
  climbs: {
    create: async (climbData) => {
      const { data, error } = await supabase
        .from(TABLES.CLIMBS)
        .insert(climbData)
        .select()
        .single()
      return { data, error }
    },

    getBySessionId: async (sessionId) => {
      const { data, error } = await supabase
        .from(TABLES.CLIMBS)
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
      return { data, error }
    },

    getByUserId: async (userId, limit = 200) => {
      const { data, error } = await supabase
        .from(TABLES.CLIMBS)
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit)
      return { data, error }
    }
  },

  // CRS Scores (cached calculations)
  crsScores: {
    create: async (crsData) => {
      const { data, error } = await supabase
        .from(TABLES.CRS_SCORES)
        .insert(crsData)
        .select()
        .single()
      return { data, error }
    },

    getLatest: async (userId) => {
      const { data, error } = await supabase
        .from(TABLES.CRS_SCORES)
        .select('*')
        .eq('user_id', userId)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single()
      return { data, error }
    }
  }
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to climb updates
  subscribeToClimbs: (userId, callback) => {
    return supabase
      .channel(`climbs:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.CLIMBS,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to session updates
  subscribeToSessions: (userId, callback) => {
    return supabase
      .channel(`sessions:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.SESSIONS,
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // Unsubscribe from channel
  unsubscribe: (subscription) => {
    return supabase.removeChannel(subscription)
  }
}

// Export default client for direct usage
export default supabase
