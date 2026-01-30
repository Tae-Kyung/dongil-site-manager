'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRow } from '@/types/database'

interface AuthState {
  user: User | null
  profile: UserRow | null
  isLoading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    // Helper function to update auth state
    const updateAuthState = async (session: { user: User } | null) => {
      if (!isMounted) return

      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!isMounted) return

        setState({
          user: session.user,
          profile: profile || null,
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          error: null,
        })
      }
    }

    // Get initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        updateAuthState(session)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error }
    }

    return { error: null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      setState(prev => ({ ...prev, isLoading: false, error: error.message }))
      return { error }
    }

    return { error: null }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    const supabase = createClient()
    // Use 'local' scope to only sign out this browser, not all sessions
    await supabase.auth.signOut({ scope: 'local' })
    setState({
      user: null,
      profile: null,
      isLoading: false,
      error: null,
    })
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
  }
}
