'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/common/PageHeader'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { useProject } from '@/hooks/useProjects'
import { ArrowLeft } from 'lucide-react'

export default function EditProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const { project, isLoading, error } = useProject(projectId)

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
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-muted-foreground">{project.name}</span>
      </div>

      <PageHeader
        title="프로젝트 수정"
        description="프로젝트 정보를 수정합니다."
      />

      <ProjectForm project={project} isEdit />
    </div>
  )
}
