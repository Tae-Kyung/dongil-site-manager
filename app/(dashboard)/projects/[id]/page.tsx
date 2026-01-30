'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useProject } from '@/hooks/useProjects'
import { useSiteLogs } from '@/hooks/useSiteLogs'
import { PageHeader } from '@/components/common/PageHeader'
import { ProcessTimeline } from '@/components/projects/ProcessTimeline'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SiteLogItem, SiteLogForm, ImageGallery } from '@/components/site-logs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency, formatRelativeTime, PROCESS_STEPS } from '@/lib/constants'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Building2,
  AlertTriangle,
  FileText,
  Camera,
  Plus,
} from 'lucide-react'
import type { DocumentRow, AiInsightRow } from '@/types/database'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const { project, isLoading, error, refetch } = useProject(projectId)
  const { siteLogs, createSiteLog, deleteSiteLog, refetch: refetchLogs } = useSiteLogs({ projectId, limit: 10 })
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [insights, setInsights] = useState<AiInsightRow[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showLogForm, setShowLogForm] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    if (!projectId) return

    const fetchProjectData = async () => {
      const supabase = createClient()

      const [docsRes, insightsRes] = await Promise.all([
        supabase
          .from('documents')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('ai_insights')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_resolved', false)
          .order('created_at', { ascending: false }),
      ])

      setDocuments(docsRes.data || [])
      setInsights(insightsRes.data || [])
    }

    fetchProjectData()
  }, [projectId])

  const handleStepChange = async (newStep: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .update({ process_step: newStep })
      .eq('id', projectId)

    if (error) {
      toast.error('단계 변경에 실패했습니다.')
    } else {
      toast.success('단계가 변경되었습니다.')
      refetch()
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (error) {
      toast.error('삭제에 실패했습니다.')
      setIsDeleting(false)
    } else {
      toast.success('프로젝트가 삭제되었습니다.')
      router.push('/projects')
    }
  }

  // Calculate totals
  const estimateTotal = documents
    .filter(d => d.doc_type === 'estimate' && d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0)

  const orderTotal = documents
    .filter(d => d.doc_type === 'order' && d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0)

  if (isLoading) {
    return <LoadingPage />
  }

  if (error || !project) {
    return (
      <EmptyState
        title="프로젝트를 찾을 수 없습니다"
        description="요청하신 프로젝트가 존재하지 않거나 삭제되었습니다."
        action={
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로젝트 목록
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-muted-foreground">프로젝트</span>
      </div>

      <PageHeader title={project.name}>
        <div className="flex items-center gap-2">
          <StatusBadge type="status" value={project.status} />
          <StatusBadge type="priority" value={project.priority} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${projectId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Project Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">고객:</span>
              <span className="font-medium">{project.client_name || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">위치:</span>
              <span className="font-medium truncate">{project.location || '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">기간:</span>
              <span className="font-medium">
                {project.start_date ? formatDate(project.start_date) : '-'}
                {project.end_date && ` ~ ${formatDate(project.end_date)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">시공팀:</span>
              <span className="font-medium">{project.team?.name || '-'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Timeline */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">진행 단계</CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessTimeline
            currentStep={project.process_step}
            onStepClick={handleStepChange}
            isEditable={true}
          />
        </CardContent>
      </Card>

      {/* 3-Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Site Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              현장 로그
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowLogForm(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {siteLogs.length === 0 ? (
              <EmptyState type="logs" className="py-6" />
            ) : (
              <div className="space-y-3">
                {siteLogs.map(log => (
                  <SiteLogItem
                    key={log.id}
                    log={log}
                    onDelete={async (id) => {
                      const result = await deleteSiteLog(id)
                      if (result.success) {
                        toast.success('현장 로그가 삭제되었습니다.')
                      } else {
                        toast.error(result.error || '삭제에 실패했습니다.')
                      }
                    }}
                    onImageClick={(images, index) => {
                      setGalleryImages(images)
                      setGalleryIndex(index)
                      setShowGallery(true)
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Center - Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              문서 / 금액
            </CardTitle>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Amount Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground">견적</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(estimateTotal)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-muted-foreground">발주</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(orderTotal)}
                </p>
              </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
              <EmptyState type="documents" className="py-6" />
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 5).map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge type="docStatus" value={doc.doc_type} className="shrink-0" />
                      <span className="text-sm truncate">{doc.title}</span>
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {formatCurrency(doc.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right - AI Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              AI 인사이트
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">미해결 알림이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map(insight => (
                  <div
                    key={insight.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      insight.risk_level === 'critical'
                        ? 'bg-red-50 border-red-500'
                        : insight.risk_level === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge type="risk" value={insight.risk_level} />
                    </div>
                    <p className="text-sm">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(insight.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="프로젝트 삭제"
        description={`"${project.name}" 프로젝트를 삭제하시겠습니까? 관련된 모든 데이터(현장 로그, 문서 등)가 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

      {/* Site Log Form Dialog */}
      <SiteLogForm
        open={showLogForm}
        onOpenChange={setShowLogForm}
        onSubmit={async (data) => {
          const result = await createSiteLog(data)
          if (result.success) {
            toast.success('현장 로그가 등록되었습니다.')
          } else {
            toast.error(result.error || '등록에 실패했습니다.')
          }
          return result
        }}
      />

      {/* Image Gallery */}
      <ImageGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        open={showGallery}
        onOpenChange={setShowGallery}
      />
    </div>
  )
}
