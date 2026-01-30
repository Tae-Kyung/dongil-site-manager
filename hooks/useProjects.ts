'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProjectRow, TeamRow, UserRow } from '@/types/database'

export interface ProjectWithRelations extends ProjectRow {
  team?: TeamRow | null
  manager?: UserRow | null
}

interface UseProjectsOptions {
  status?: string
  process_step?: string
  search?: string
}

export function useProjects(options: UseProjectsOptions = {}) {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    let query = supabase
      .from('projects')
      .select(`
        *,
        team:teams(*),
        manager:users(*)
      `)
      .order('updated_at', { ascending: false })

    if (options.status) {
      query = query.eq('status', options.status)
    }

    if (options.process_step) {
      query = query.eq('process_step', options.process_step)
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,client_name.ilike.%${options.search}%,location.ilike.%${options.search}%`)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
      setProjects([])
    } else {
      setProjects(data || [])
    }

    setIsLoading(false)
  }, [options.status, options.process_step, options.search])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithRelations | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        team:teams(*),
        manager:users(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      setError(fetchError.message)
      setProject(null)
    } else {
      setProject(data)
    }

    setIsLoading(false)
  }, [id])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject,
  }
}
