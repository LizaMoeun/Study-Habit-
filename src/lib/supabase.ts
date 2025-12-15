/**
 * Supabase Client Configuration
 * Falls back to localStorage when not configured
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'
import { localStorageAdapter } from './local-storage-adapter'

const supabaseUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) 
  || (window as any).__SUPABASE_URL__ 
  || 'https://placeholder.supabase.co'

const supabaseAnonKey = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) 
  || (window as any).__SUPABASE_ANON_KEY__ 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder-key-replace-with-real-key'

const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                      !supabaseAnonKey.includes('placeholder-key-replace-with-real-key')

// Use localStorage if Supabase isn't set up
export const supabase = isConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : (localStorageAdapter as any)

export function isSupabaseConfigured(): boolean {
  return isConfigured
}

export function isUsingLocalStorage(): boolean {
  return !isConfigured
}