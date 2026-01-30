import { cn } from '@/lib/utils'
import { FolderOpen, FileText, Users, Calendar, AlertCircle } from 'lucide-react'

type EmptyType = 'projects' | 'documents' | 'logs' | 'schedule' | 'default'

interface EmptyStateProps {
  type?: EmptyType
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

const icons: Record<EmptyType, React.ReactNode> = {
  projects: <FolderOpen className="h-12 w-12" />,
  documents: <FileText className="h-12 w-12" />,
  logs: <AlertCircle className="h-12 w-12" />,
  schedule: <Calendar className="h-12 w-12" />,
  default: <FolderOpen className="h-12 w-12" />,
}

const defaultMessages: Record<EmptyType, { title: string; description: string }> = {
  projects: {
    title: '프로젝트가 없습니다',
    description: '새 프로젝트를 생성하여 현장 관리를 시작하세요.',
  },
  documents: {
    title: '문서가 없습니다',
    description: '견적서, 계약서 등의 문서를 등록하세요.',
  },
  logs: {
    title: '현장 로그가 없습니다',
    description: '현장 사진과 작업 내용을 기록하세요.',
  },
  schedule: {
    title: '일정이 없습니다',
    description: '새 일정을 등록하세요.',
  },
  default: {
    title: '데이터가 없습니다',
    description: '표시할 내용이 없습니다.',
  },
}

export function EmptyState({
  type = 'default',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const message = defaultMessages[type]

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="text-muted-foreground/50 mb-4">
        {icons[type]}
      </div>
      <h3 className="text-lg font-semibold mb-1">
        {title || message.title}
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-4">
        {description || message.description}
      </p>
      {action}
    </div>
  )
}
