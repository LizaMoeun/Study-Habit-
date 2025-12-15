/**
 * Quick localStorage wrapper for when Supabase isn't set up yet
 * Just stores everything in browser storage
 */

const STORAGE_KEYS = {
  users: 'local_users',
  sessions: 'local_sessions',
  invitations: 'local_invitations',
  orgs: 'local_organizations',
  currentUser: 'local_current_user',
  version: 'local_storage_version'
}

const CURRENT_VERSION = '2.1' // Increment this to force a reset

// Helper to get/set from localStorage
const getStorage = (key: string) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

const setStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// Initialize with a default admin if nothing exists
const initDefaults = () => {
  const storedVersion = localStorage.getItem(STORAGE_KEYS.version)
  
  // Force reset if version mismatch or no users exist
  if (storedVersion !== CURRENT_VERSION || getStorage(STORAGE_KEYS.users).length === 0) {
    console.log('Initializing local storage with demo accounts...')
    
    const now = new Date().toISOString()
    
    setStorage(STORAGE_KEYS.orgs, [{
      id: 'org-1',
      organization_name: 'Demo Organization',
      organization_type: 'University',
      expected_students: '50-100',
      subscription_plan: 'monthly',
      subscription_status: 'active',
      trial_ends_at: null,
      created_at: now,
      updated_at: now
    }])

    setStorage(STORAGE_KEYS.users, [
      {
        id: 'admin-1',
        email: 'admin@studyhabit.com',
        full_name: 'Admin User',
        role: 'admin',
        organization_id: 'org-1',
        avatar_url: null,
        password: 'admin123',
        created_at: now,
        updated_at: now
      },
      {
        id: 'student-1',
        email: 'student@studyhabit.com',
        full_name: 'Demo Student',
        role: 'student',
        organization_id: 'org-1',
        avatar_url: null,
        password: 'student123',
        created_at: now,
        updated_at: now
      }
    ])
    
    // Add some demo study sessions for the student
    const today = new Date()
    const sessions = []
    
    for (let i = 0; i < 14; i++) {
      const sessionDate = new Date(today)
      sessionDate.setDate(today.getDate() - i)
      
      sessions.push({
        id: `session-${i}`,
        user_id: 'student-1',
        subject: ['Math', 'Science', 'History', 'English'][Math.floor(Math.random() * 4)],
        duration_hours: parseFloat((Math.random() * 3 + 0.5).toFixed(1)),
        notes: 'Demo session',
        session_date: sessionDate.toISOString(),
        created_at: now,
        updated_at: now
      })
    }
    
    setStorage(STORAGE_KEYS.sessions, sessions)
    setStorage(STORAGE_KEYS.invitations, [])
    
    // Set version
    localStorage.setItem(STORAGE_KEYS.version, CURRENT_VERSION)
    
    console.log('Demo accounts created:', [
      'Admin: admin@studyhabit.com / admin123',
      'Student: student@studyhabit.com / student123'
    ])
  }
}

initDefaults()

let currentUser = localStorage.getItem(STORAGE_KEYS.currentUser) 
  ? JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser)!) 
  : null

// Auth methods
const auth = {
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const users = getStorage(STORAGE_KEYS.users)
    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Users in storage:', users.length)
    console.log('All users:', users.map((u: any) => ({ email: u.email, password: u.password, role: u.role })))
    
    const user = users.find((u: any) => u.email === email && u.password === password)

    if (!user) {
      console.log('❌ Login failed - user not found or wrong password')
      console.log('Looking for:', { email, password })
      throw new Error('Invalid email or password')
    }

    console.log('✅ Login successful for:', user.email, 'Role:', user.role)
    currentUser = user
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user))

    return {
      data: {
        user: { id: user.id, email: user.email },
        session: { access_token: 'local-token' }
      },
      error: null
    }
  },

  signUp: async ({ email, password, options }: any) => {
    const users = getStorage(STORAGE_KEYS.users)
    
    if (users.find((u: any) => u.email === email)) {
      return {
        data: { user: null, session: null },
        error: { message: 'User already exists', status: 400 }
      }
    }

    const now = new Date().toISOString()
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      full_name: options?.data?.full_name || email.split('@')[0],
      role: options?.data?.role || 'student',
      organization_id: options?.data?.organization_id || null,
      avatar_url: null,
      created_at: now,
      updated_at: now
    }

    users.push(newUser)
    setStorage(STORAGE_KEYS.users, users)

    return {
      data: {
        user: { id: newUser.id, email: newUser.email },
        session: { access_token: 'local-token' }
      },
      error: null
    }
  },

  signOut: async () => {
    currentUser = null
    localStorage.removeItem(STORAGE_KEYS.currentUser)
    return { error: null }
  },

  getUser: async () => {
    if (!currentUser) {
      return { data: { user: null }, error: null }
    }
    return {
      data: { user: { id: currentUser.id, email: currentUser.email } },
      error: null
    }
  },

  updateUser: async ({ password }: { password?: string }) => {
    if (!currentUser) {
      return { data: { user: null }, error: { message: 'Not authenticated' } }
    }

    const users = getStorage(STORAGE_KEYS.users)
    const idx = users.findIndex((u: any) => u.id === currentUser.id)
    
    if (idx !== -1 && password) {
      users[idx].password = password
      users[idx].updated_at = new Date().toISOString()
      setStorage(STORAGE_KEYS.users, users)
      currentUser = users[idx]
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser))
    }

    return { data: { user: currentUser }, error: null }
  },

  resetPasswordForEmail: async (email: string) => {
    const users = getStorage(STORAGE_KEYS.users)
    if (!users.find((u: any) => u.email === email)) {
      return { data: null, error: { message: 'User not found' } }
    }
    console.log('Password reset email would be sent to:', email)
    return { data: {}, error: null }
  },

  onAuthStateChange: (callback: any) => {
    if (currentUser) {
      setTimeout(() => callback('SIGNED_IN', { user: currentUser }), 0)
    }
    return {
      data: {
        subscription: { unsubscribe: () => {} }
      }
    }
  }
}

// Database query builder
const buildQuery = (table: string, operation: string, data?: any) => {
  let filters: any = {}
  let orderBy: any = null
  let limitVal: number | null = null
  let inFilters: any[] = []

  const runQuery = async () => {
    let storageKey = STORAGE_KEYS.users
    
    if (table === 'study_sessions') storageKey = STORAGE_KEYS.sessions
    else if (table === 'invitations') storageKey = STORAGE_KEYS.invitations
    else if (table === 'organizations') storageKey = STORAGE_KEYS.orgs
    else if (table === 'profiles') storageKey = STORAGE_KEYS.users

    let items = getStorage(storageKey)

    if (operation === 'select') {
      // Apply filters
      Object.keys(filters).forEach(key => {
        if (key.endsWith('_gte')) {
          const col = key.replace('_gte', '')
          items = items.filter((item: any) => item[col] >= filters[key])
        } else if (key.endsWith('_lte')) {
          const col = key.replace('_lte', '')
          items = items.filter((item: any) => item[col] <= filters[key])
        } else {
          items = items.filter((item: any) => item[key] === filters[key])
        }
      })

      // Apply 'in' filters
      inFilters.forEach(({ column, values }) => {
        items = items.filter((item: any) => values.includes(item[column]))
      })

      // Sort
      if (orderBy) {
        items.sort((a: any, b: any) => {
          const aVal = a[orderBy.column]
          const bVal = b[orderBy.column]
          return orderBy.ascending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
        })
      }

      // Limit
      if (limitVal) items = items.slice(0, limitVal)

      return { data: items, error: null }
    }

    if (operation === 'insert') {
      const now = new Date().toISOString()
      const newItem = {
        id: `${table}-${Date.now()}`,
        created_at: now,
        updated_at: now,
        ...data
      }
      items.push(newItem)
      setStorage(storageKey, items)
      return { data: [newItem], error: null }
    }

    if (operation === 'update') {
      const idKey = filters.id ? 'id' : filters.invitation_code ? 'invitation_code' : null
      const idVal = filters[idKey]
      
      if (idKey && idVal) {
        const idx = items.findIndex((item: any) => item[idKey] === idVal)
        if (idx !== -1) {
          items[idx] = { ...items[idx], ...data, updated_at: new Date().toISOString() }
          setStorage(storageKey, items)
          
          // Update current user if needed
          if (table === 'profiles' && currentUser?.id === items[idx].id) {
            currentUser = items[idx]
            localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser))
          }
          
          return { data: [items[idx]], error: null }
        }
      }
      return { data: null, error: { message: 'Not found' } }
    }

    if (operation === 'delete' && filters.id) {
      items = items.filter((item: any) => item.id !== filters.id)
      setStorage(storageKey, items)
      return { data: null, error: null }
    }

    return { data: [], error: null }
  }

  const query = {
    eq: (column: string, value: any) => {
      filters[column] = value
      return query
    },
    gte: (column: string, value: any) => {
      filters[`${column}_gte`] = value
      return query
    },
    lte: (column: string, value: any) => {
      filters[`${column}_lte`] = value
      return query
    },
    in: (column: string, values: any[]) => {
      inFilters.push({ column, values })
      return query
    },
    order: (column: string, options: { ascending: boolean }) => {
      orderBy = { column, ascending: options.ascending }
      return query
    },
    limit: (value: number) => {
      limitVal = value
      return query
    },
    single: async () => {
      const result = await runQuery()
      if (result.error) return result
      return {
        data: result.data?.[0] || null,
        error: result.data?.length === 0 ? { message: 'No rows found', code: 'PGRST116' } : null
      }
    },
    select: () => query,
    then: async (resolve: any) => {
      const result = await runQuery()
      resolve(result)
      return result
    }
  }

  return query
}

const from = (table: string) => ({
  select: (columns = '*') => buildQuery(table, 'select', columns),
  insert: (data: any) => buildQuery(table, 'insert', data),
  update: (data: any) => buildQuery(table, 'update', data),
  delete: () => buildQuery(table, 'delete')
})

export const localStorageAdapter = { auth, from }