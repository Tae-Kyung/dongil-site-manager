'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { formatRelativeTime, PROCESS_STEPS } from '@/lib/constants'
import {
  FolderKanban,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  RefreshCw,
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
  const [error, setError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchDashboardData = async () => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return
    fetchingRef.current = true

    try {
      const supabase = createClient()

      // First check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession()

      if (authError || !session) {
        if (mountedRef.current) {
          setError('인증이 필요합니다. 다시 로그인해주세요.')
          setIsLoading(false)
        }
        fetchingRef.current = false
        return
      }

      // Fetch all data
      const [statsResult, projectsResult, stepsResult, insightsResult, logsResult] = await Promise.all([
        // Stats queries
        Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('projects').select('*', { count: 'exact', head: true })
            .eq('status', 'completed')
            .gte('updated_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          supabase.from('documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('ai_insights').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
        ]),
        // Recent projects
        supabase.from('projects').select('*').eq('status', 'active').order('updated_at', { ascending: false }).limit(5),
        // Projects by step
        supabase.from('projects').select('process_step').eq('status', 'active'),
        // Recent insights
        supabase.from('ai_insights').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(3),
        // Recent logs
        supabase.from('site_logs').select('*, projects(name)').order('created_at', { ascending: false }).limit(5),
      ])

      if (!mountedRef.current) {
        fetchingRef.current = false
        return
      }

      const [activeRes, completedRes, pendingRes, insightsCountRes] = statsResult

      setStats({
        activeProjects: activeRes.count || 0,
        completedThisMonth: completedRes.count || 0,
        pendingDocuments: pendingRes.count || 0,
        unresolvedInsights: insightsCountRes.count || 0,
      })

      setRecentProjects(projectsResult.data || [])

      const stepCounts: Record<string, number> = {}
      PROCESS_STEPS.forEach(step => { stepCounts[step.key] = 0 })
      stepsResult.data?.forEach(p => {
        stepCounts[p.process_step] = (stepCounts[p.process_step] || 0) + 1
      })
      setProjectsByStep(stepCounts)

      setRecentInsights(insightsResult.data || [])

      setRecentLogs(logsResult.data?.map(log => ({
        ...log,
        project_name: (log.projects as { name: string } | null)?.name
      })) || [])

      setIsLoading(false)
      setError(null)
    } catch (err: unknown) {
      // Ignore abort errors - these happen during navigation or component unmount
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Fetch aborted - this is normal during navigation')
        return
      }

      console.error('Dashboard data fetch error:', err)
      if (mountedRef.current) {
        setError('데이터를 불러오는데 실패했습니다.')
        setIsLoading(false)
      }
    } finally {
      fetchingRef.current = false
    }
  }

  useEffect(() => {
    mountedRef.current = true
    fetchDashboardData()

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setError('데이터 로딩 시간이 초과되었습니다.')
        setIsLoading(false)
      }
    }, 20000)

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
    }
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setError(null)
    fetchingRef.current = false
    fetchDashboardData()
  }

  if (isLoading) {
    return <LoadingPage />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">연결 오류</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
          <Button onClick={() => window.location.href = '/login'}>
            다시 로그인
          </Button>
        </div>
      </div>
    )
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
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  프로젝트가 없습니다.
                </p>
              ) : (
                recentProjects.map(project => (
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
                ))
              )}
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
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                현장 로그가 없습니다.
              </p>
            ) : (
              recentLogs.map(log => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
