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

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError)
          }

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
      } catch (error) {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

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
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

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
    await supabase.auth.signOut()
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
