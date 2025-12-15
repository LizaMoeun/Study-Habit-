/**
 * Study Sessions API Functions
 * Handles all study session operations
 */

import { supabase } from '../supabase'

export interface StudySession {
  id: string
  user_id: string
  subject: string
  duration_hours: number
  notes: string | null
  session_date: string
  created_at: string
  updated_at: string
}

export interface StudyStats {
  totalHours: number
  totalSessions: number
  averageHours: number
  topSubject: string
  weeklyHours: number
  monthlyHours: number
}

// Create a new study session
export async function createStudySession(data: {
  userId: string
  subject: string
  durationHours: number
  notes?: string
  sessionDate?: string
}) {
  const { data: session, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: data.userId,
      subject: data.subject,
      duration_hours: data.durationHours,
      notes: data.notes || null,
      session_date: data.sessionDate || new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return session as StudySession
}

// Get all study sessions for a user
export async function getUserStudySessions(userId: string, limit?: number) {
  let query = supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('session_date', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data as StudySession[]
}

// Get study sessions for date range
export async function getStudySessionsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('session_date', startDate)
    .lte('session_date', endDate)
    .order('session_date', { ascending: true })

  if (error) throw error
  return data as StudySession[]
}

// Get study statistics for a user
export async function getUserStudyStats(userId: string): Promise<StudyStats> {
  const { data: sessions, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error

  const totalHours = sessions.reduce((sum, s) => sum + Number(s.duration_hours), 0)
  const totalSessions = sessions.length
  const averageHours = totalSessions > 0 ? totalHours / totalSessions : 0

  // Calculate top subject
  const subjectHours: { [key: string]: number } = {}
  sessions.forEach(s => {
    subjectHours[s.subject] = (subjectHours[s.subject] || 0) + Number(s.duration_hours)
  })
  const topSubject = Object.entries(subjectHours).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

  // Calculate weekly hours (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklyHours = sessions
    .filter(s => new Date(s.session_date) >= weekAgo)
    .reduce((sum, s) => sum + Number(s.duration_hours), 0)

  // Calculate monthly hours (last 30 days)
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const monthlyHours = sessions
    .filter(s => new Date(s.session_date) >= monthAgo)
    .reduce((sum, s) => sum + Number(s.duration_hours), 0)

  return {
    totalHours,
    totalSessions,
    averageHours,
    topSubject,
    weeklyHours,
    monthlyHours
  }
}

// Get leaderboard data for an organization
export async function getOrganizationLeaderboard(organizationId: string, limit = 10) {
  // Get all users in the organization
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('organization_id', organizationId)
    .eq('role', 'student')

  if (profilesError) throw profilesError

  // Get study sessions for all users
  const leaderboardData = await Promise.all(
    profiles.map(async (profile) => {
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('duration_hours')
        .eq('user_id', profile.id)

      if (error) throw error

      const totalHours = sessions.reduce((sum, s) => sum + Number(s.duration_hours), 0)

      return {
        userId: profile.id,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        totalHours,
        sessionsCount: sessions.length
      }
    })
  )

  // Sort by total hours and limit
  return leaderboardData
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, limit)
}

// Update a study session
export async function updateStudySession(
  sessionId: string,
  updates: Partial<Pick<StudySession, 'subject' | 'duration_hours' | 'notes'>>
) {
  const { data, error } = await supabase
    .from('study_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw error
  return data as StudySession
}

// Delete a study session
export async function deleteStudySession(sessionId: string) {
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw error
}

// Get chart data for weekly progress
export async function getWeeklyChartData(userId: string) {
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 6)

  const sessions = await getStudySessionsByDateRange(
    userId,
    weekAgo.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  )

  // Create array for last 7 days
  const chartData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayHours = sessions
      .filter(s => s.session_date.startsWith(dateStr))
      .reduce((sum, s) => sum + Number(s.duration_hours), 0)

    chartData.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      hours: dayHours
    })
  }

  return chartData
}