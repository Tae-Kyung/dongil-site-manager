'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { formatCurrency, formatRelativeTime, PROCESS_STEPS } from '@/lib/constants'
import {
  FolderKanban,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react'
import type { ProjectRow, AiInsightRow, SiteLogRow } from '@/types/database'

interface DashboardStats {
  activeProjects: number
  completedThisMonth: number
  pendingDocuments: number
  unresolvedInsights: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProjects, setRecentProjects] = useState<ProjectRow[]>([])
  const [recentInsights, setRecentInsights] = useState<AiInsightRow[]>([])
  const [recentLogs, setRecentLogs] = useState<(SiteLogRow & { project_name?: string })[]>([])
  const [projectsByStep, setProjectsByStep] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createClient()

      // Fetch stats
      const [
        { count: activeCount },
        { count: completedCount },
        { count: pendingDocsCount },
        { count: insightsCount },
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('projects').select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('ai_insights').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
      ])

      setStats({
        activeProjects: activeCount || 0,
        completedThisMonth: completedCount || 0,
        pendingDocuments: pendingDocsCount || 0,
        unresolvedInsights: insightsCount || 0,
      })

      // Fetch recent projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(5)

      setRecentProjects(projects || [])

      // Calculate projects by step
      const { data: allActiveProjects } = await supabase
        .from('projects')
        .select('process_step')
        .eq('status', 'active')

      const stepCounts: Record<string, number> = {}
      PROCESS_STEPS.forEach(step => { stepCounts[step.key] = 0 })
      allActiveProjects?.forEach(p => {
        stepCounts[p.process_step] = (stepCounts[p.process_step] || 0) + 1
      })
      setProjectsByStep(stepCounts)

      // Fetch recent insights
      const { data: insights } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(3)

      setRecentInsights(insights || [])

      // Fetch recent logs with project names
      const { data: logs } = await supabase
        .from('site_logs')
        .select('*, projects(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentLogs(logs?.map(log => ({
        ...log,
        project_name: (log.projects as { name: string } | null)?.name
      })) || [])

      setIsLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div>
      <PageHeader
        title="대시보드"
        description="현장 관리 현황을 한눈에 확인하세요."
      >
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            새 프로젝트
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderKanban className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.activeProjects}</p>
                <p className="text-sm text-muted-foreground">진행중</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.completedThisMonth}</p>
                <p className="text-sm text-muted-foreground">이번 달 완료</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.pendingDocuments}</p>
                <p className="text-sm text-muted-foreground">검토 대기</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.unresolvedInsights}</p>
                <p className="text-sm text-muted-foreground">미해결 알림</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects by Step */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">단계별 프로젝트 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PROCESS_STEPS.map(step => (
              <div
                key={step.key}
                className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
              >
                <span className="text-sm font-medium">{step.label}</span>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                  {projectsByStep[step.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">최근 프로젝트</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                전체 보기 <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProjects.map(project => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                  </div>
                  <StatusBadge type="step" value={project.process_step} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI 인사이트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInsights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  미해결 알림이 없습니다.
                </p>
              ) : (
                recentInsights.map(insight => (
                  <div
                    key={insight.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                  >
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      insight.risk_level === 'critical' ? 'text-red-500' :
                      insight.risk_level === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{insight.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(insight.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">최근 현장 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{log.content.slice(0, 100)}{log.content.length > 100 ? '...' : ''}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{log.project_name}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                </div>
                <StatusBadge type="logType" value={log.log_type} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
