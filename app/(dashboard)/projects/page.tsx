'use client'

import { Suspense, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { EmptyState } from '@/components/common/EmptyState'
import { LoadingPage } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { useProjects } from '@/hooks/useProjects'
import { Plus, LayoutGrid, List } from 'lucide-react'

function ProjectsContent() {
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState('')
  const [step, setStep] = useState('')
  const [priority, setPriority] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { projects, isLoading, error } = useProjects({
    search: search || undefined,
    status: status && status !== 'all' ? status : undefined,
    process_step: step && step !== 'all' ? step : undefined,
  })

  // Filter by priority client-side
  const filteredProjects = useMemo(() => {
    if (!priority || priority === 'all') return projects
    return projects.filter(p => p.priority === priority)
  }, [projects, priority])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('')
    setStep('')
    setPriority('')
  }

  if (isLoading) {
    return <LoadingPage />
  }

  return (
    <div>
      <PageHeader
        title="프로젝트"
        description={`총 ${filteredProjects.length}개의 프로젝트`}
      >
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              새 프로젝트
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ProjectFilters
        search={search}
        status={status}
        step={step}
        priority={priority}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onStepChange={setStep}
        onPriorityChange={setPriority}
        onClear={handleClearFilters}
      />

      {error && (
        <div className="text-center py-8 text-destructive">
          오류가 발생했습니다: {error}
        </div>
      )}

      {!error && filteredProjects.length === 0 ? (
        <EmptyState
          type="projects"
          action={
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                새 프로젝트 생성
              </Link>
            </Button>
          }
        />
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ProjectsContent />
    </Suspense>
  )
}
