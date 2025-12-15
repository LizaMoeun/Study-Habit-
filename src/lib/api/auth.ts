/**
 * Authentication API Functions
 * Handles login, logout, and user session management
 */

import { supabase } from '../supabase'

export interface LoginCredentials {
  email: string
  password: string
}

export interface CurrentUser {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'student'
  organizationId: string | null
  avatarUrl: string | null
}

// Login with email and password
export async function login(credentials: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  })

  if (error) throw error
  return data
}

// Logout
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current authenticated user with profile data
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) return null

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    organizationId: profile.organization_id,
    avatarUrl: profile.avatar_url
  }
}

// Update user profile
export async function updateUserProfile(updates: {
  fullName?: string
  avatarUrl?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const profileUpdates: any = {}
  if (updates.fullName) profileUpdates.full_name = updates.fullName
  if (updates.avatarUrl !== undefined) profileUpdates.avatar_url = updates.avatarUrl

  const { data, error } = await supabase
    .from('profiles')
    .update(profileUpdates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Change password
export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error
}

// Reset password (send email)
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  if (error) throw error
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: CurrentUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        const currentUser = await getCurrentUser()
        callback(currentUser)
      } else {
        callback(null)
      }
    }
  )

  return subscription
}