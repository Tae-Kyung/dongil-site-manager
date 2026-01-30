'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SiteLogRow, InsertTables } from '@/types/database'

interface UseSiteLogsOptions {
  projectId: string
  limit?: number
}

interface UseSiteLogsReturn {
  siteLogs: SiteLogRow[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createSiteLog: (data: CreateSiteLogInput) => Promise<{ success: boolean; error?: string }>
  deleteSiteLog: (id: string) => Promise<{ success: boolean; error?: string }>
}

export interface CreateSiteLogInput {
  content: string
  log_type: 'daily' | 'issue' | 'progress' | 'photo'
  images?: string[]
  weather?: string
  work_date: string
}

export function useSiteLogs({ projectId, limit }: UseSiteLogsOptions): UseSiteLogsReturn {
  const [siteLogs, setSiteLogs] = useState<SiteLogRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  const fetchSiteLogs = useCallback(async () => {
    if (!projectId) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let query = supabase
        .from('site_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('work_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: fetchError } = await query

      if (!mountedRef.current) return

      if (fetchError) {
        setError(new Error(fetchError.message))
      } else {
        setSiteLogs(data || [])
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      if (!mountedRef.current) return
      setError(new Error('데이터를 불러오는데 실패했습니다.'))
    }

    if (mountedRef.current) {
      setIsLoading(false)
    }
  }, [projectId, limit])

  useEffect(() => {
    mountedRef.current = true
    fetchSiteLogs()

    return () => {
      mountedRef.current = false
    }
  }, [fetchSiteLogs])

  const createSiteLog = async (input: CreateSiteLogInput) => {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const newLog: InsertTables<'site_logs'> = {
      project_id: projectId,
      author_id: user.id,
      content: input.content,
      log_type: input.log_type,
      images: input.images || [],
      weather: input.weather || null,
      work_date: input.work_date,
    }

    const { error: insertError } = await supabase
      .from('site_logs')
      .insert(newLog)

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    // Refetch to update the list
    await fetchSiteLogs()
    return { success: true }
  }

  const deleteSiteLog = async (id: string) => {
    const supabase = createClient()

    const { error: deleteError } = await supabase
      .from('site_logs')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Refetch to update the list
    await fetchSiteLogs()
    return { success: true }
  }

  return {
    siteLogs,
    isLoading,
    error,
    refetch: fetchSiteLogs,
    createSiteLog,
    deleteSiteLog,
  }
}

// Hook for uploading images to Supabase Storage
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)

  const uploadImages = async (files: File[]): Promise<{ urls: string[]; error?: string }> => {
    if (files.length === 0) {
      return { urls: [] }
    }

    setIsUploading(true)
    const supabase = createClient()
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `site-logs/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('site-images')
          .upload(filePath, file)

        if (uploadError) {
          throw new Error(uploadError.message)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('site-images')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return { urls: uploadedUrls }
    } catch (error) {
      return {
        urls: uploadedUrls,
        error: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.'
      }
    } finally {
      setIsUploading(false)
    }
  }

  const deleteImage = async (url: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient()

    // Extract file path from URL
    const urlParts = url.split('/site-images/')
    if (urlParts.length < 2) {
      return { success: false, error: '잘못된 이미지 URL입니다.' }
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('site-images')
      .remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  return {
    uploadImages,
    deleteImage,
    isUploading,
  }
}
