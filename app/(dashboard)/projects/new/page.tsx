'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/common/PageHeader'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewProjectPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="text-muted-foreground">프로젝트</span>
      </div>

      <PageHeader
        title="새 프로젝트"
        description="새로운 현장 프로젝트를 등록합니다."
      />

      <ProjectForm />
    </div>
  )
}
