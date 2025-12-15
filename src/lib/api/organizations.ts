/**
 * Organization API Functions
 * Handles organization and admin setup
 */

import { supabase } from '../supabase'

export interface Organization {
  id: string
  organization_name: string
  organization_type: string
  expected_students: string
  subscription_plan: 'monthly' | 'yearly'
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled'
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'student'
  organization_id: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Create organization and admin account
export async function createOrganizationAndAdmin(data: {
  organizationType: string
  organizationName: string
  expectedStudents: string
  adminName: string
  adminEmail: string
  adminPassword: string
}) {
  // Step 1: Create the admin user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.adminEmail,
    password: data.adminPassword,
    options: {
      data: {
        full_name: data.adminName,
        role: 'admin'
      }
    }
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create admin account')

  // Step 2: Create the organization
  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14) // 14 day trial

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      organization_name: data.organizationName,
      organization_type: data.organizationType,
      expected_students: data.expectedStudents,
      subscription_plan: 'monthly',
      subscription_status: 'trial',
      trial_ends_at: trialEndsAt.toISOString()
    })
    .select()
    .single()

  if (orgError) throw orgError

  // Step 3: Update admin profile with organization_id
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ organization_id: org.id })
    .eq('id', authData.user.id)

  if (profileError) throw profileError

  return {
    organization: org as Organization,
    admin: authData.user
  }
}

// Get organization by ID
export async function getOrganization(organizationId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (error) throw error
  return data as Organization
}

// Update organization
export async function updateOrganization(
  organizationId: string,
  updates: Partial<Pick<Organization, 'organization_name' | 'organization_type' | 'expected_students' | 'subscription_plan'>>
) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single()

  if (error) throw error
  return data as Organization
}

// Update subscription status
export async function updateSubscriptionStatus(
  organizationId: string,
  status: 'active' | 'inactive' | 'trial' | 'cancelled'
) {
  const { data, error } = await supabase
    .from('organizations')
    .update({ subscription_status: status })
    .eq('id', organizationId)
    .select()
    .single()

  if (error) throw error
  return data as Organization
}

// Get all users in an organization
export async function getOrganizationUsers(organizationId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

// Get organization statistics
export async function getOrganizationStats(organizationId: string) {
  // Get all users
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('organization_id', organizationId)

  if (usersError) throw usersError

  const totalUsers = users.length
  const adminCount = users.filter(u => u.role === 'admin').length
  const studentCount = users.filter(u => u.role === 'student').length

  // Get all study sessions for this organization
  const studentIds = users.filter(u => u.role === 'student').map(u => u.id)
  
  if (studentIds.length === 0) {
    return {
      totalUsers,
      adminCount,
      studentCount,
      totalStudyHours: 0,
      totalSessions: 0,
      averageHoursPerStudent: 0
    }
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('study_sessions')
    .select('duration_hours')
    .in('user_id', studentIds)

  if (sessionsError) throw sessionsError

  const totalStudyHours = sessions.reduce((sum, s) => sum + Number(s.duration_hours), 0)
  const totalSessions = sessions.length
  const averageHoursPerStudent = studentCount > 0 ? totalStudyHours / studentCount : 0

  return {
    totalUsers,
    adminCount,
    studentCount,
    totalStudyHours,
    totalSessions,
    averageHoursPerStudent
  }
}

// Delete user from organization (admin only)
export async function removeUserFromOrganization(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ organization_id: null })
    .eq('id', userId)

  if (error) throw error
}
