'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { ProjectRow } from '@/types/database'
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([])

  useEffect(() => {
    const fetchRecentProjects = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (data) {
        setRecentProjects(data)
      }
    }

    fetchRecentProjects()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        recentProjects={recentProjects}
      />

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16'
        )}
      >
        {/* Header */}
        <Header
          user={profile}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}
