import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate, formatCurrency, PROCESS_STEPS } from '@/lib/constants'
import { MapPin, Calendar, Users, Building2 } from 'lucide-react'
import type { ProjectWithRelations } from '@/hooks/useProjects'

interface ProjectCardProps {
  project: ProjectWithRelations
}

export function ProjectCard({ project }: ProjectCardProps) {
  const currentStepIndex = PROCESS_STEPS.findIndex(s => s.key === project.process_step)

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {project.client_name || '고객 미지정'}
              </p>
            </div>
            <StatusBadge type="priority" value={project.priority} />
          </div>

          {/* Process Step Progress */}
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              {PROCESS_STEPS.map((step, index) => (
                <div
                  key={step.key}
                  className={`h-1.5 flex-1 rounded-full ${
                    index <= currentStepIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {PROCESS_STEPS[currentStepIndex]?.label} 단계
            </p>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-sm">
            {project.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            )}

            {project.start_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {formatDate(project.start_date)}
                  {project.end_date && ` ~ ${formatDate(project.end_date)}`}
                </span>
              </div>
            )}

            {project.team && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{project.team.name}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <StatusBadge type="status" value={project.status} />
            <span className="text-xs text-muted-foreground">
              {formatDate(project.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
