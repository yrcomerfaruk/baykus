import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (typeof window === 'undefined') {
    // Server-side: return a dummy client
    return createClient('https://placeholder.supabase.co', 'placeholder')
  }
  
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase env variables not set')
    }
    
    supabaseInstance = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder'
    )
  }
  
  return supabaseInstance
}

export const supabase = getSupabase()
