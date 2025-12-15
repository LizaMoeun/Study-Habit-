/**
 * Invitation API Functions
 * Handles all invitation-related operations
 */

import { supabase } from '../supabase'

export interface Invitation {
  id: string
  organization_id: string
  invitation_code: string
  student_name: string
  student_email: string
  status: 'pending' | 'accepted' | 'expired'
  created_by: string
  expires_at: string
  accepted_at: string | null
  created_at: string
  updated_at: string
}

// Generate a random invitation code
export function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a new invitation
export async function createInvitation(data: {
  organizationId: string
  studentName: string
  studentEmail: string
  createdBy: string
}) {
  const invitationCode = generateInvitationCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiry

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: data.organizationId,
      invitation_code: invitationCode,
      student_name: data.studentName,
      student_email: data.studentEmail,
      created_by: data.createdBy,
      expires_at: expiresAt.toISOString(),
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return invitation
}

// Get all invitations for an organization
export async function getOrganizationInvitations(organizationId: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Invitation[]
}

// Verify invitation code
export async function verifyInvitationCode(code: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('invitation_code', code)
    .eq('status', 'pending')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Invalid or expired invitation code')
    }
    throw error
  }

  // Check if expired
  const expiresAt = new Date(data.expires_at)
  if (expiresAt < new Date()) {
    await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('id', data.id)
    
    throw new Error('Invitation code has expired')
  }

  return data as Invitation
}

// Accept invitation and create student account
export async function acceptInvitation(
  invitationCode: string,
  password: string
) {
  // Verify invitation
  const invitation = await verifyInvitationCode(invitationCode)

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invitation.student_email,
    password: password,
    options: {
      data: {
        full_name: invitation.student_name,
        role: 'student',
        organization_id: invitation.organization_id
      }
    }
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create user')

  // Update profile with organization
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ organization_id: invitation.organization_id })
    .eq('id', authData.user.id)

  if (profileError) throw profileError

  // Mark invitation as accepted
  const { error: invitationError } = await supabase
    .from('invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitation.id)

  if (invitationError) throw invitationError

  return authData.user
}

// Resend invitation (generates new code)
export async function resendInvitation(invitationId: string) {
  const newCode = generateInvitationCode()
  const newExpiresAt = new Date()
  newExpiresAt.setDate(newExpiresAt.getDate() + 30)

  const { data, error } = await supabase
    .from('invitations')
    .update({
      invitation_code: newCode,
      expires_at: newExpiresAt.toISOString(),
      status: 'pending'
    })
    .eq('id', invitationId)
    .select()
    .single()

  if (error) throw error
  return data as Invitation
}

// Delete invitation
export async function deleteInvitation(invitationId: string) {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)

  if (error) throw error
}