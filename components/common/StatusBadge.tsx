import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  PROJECT_STATUS,
  DOC_STATUS,
  RISK_LEVELS,
  PRIORITY,
  PROCESS_STEPS,
  LOG_TYPES,
} from '@/lib/constants'

type BadgeType = 'status' | 'docStatus' | 'risk' | 'priority' | 'step' | 'logType'

interface StatusBadgeProps {
  type: BadgeType
  value: string
  className?: string
}

const colorMap: Record<string, string> = {
  // Project Status
  active: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  on_hold: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  completed: 'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-100',

  // Doc Status
  draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  approved: 'bg-green-100 text-green-800 hover:bg-green-100',
  rejected: 'bg-red-100 text-red-800 hover:bg-red-100',

  // Risk Levels
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  critical: 'bg-red-100 text-red-800 hover:bg-red-100',

  // Priority
  low: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  medium: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  high: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  urgent: 'bg-red-100 text-red-800 hover:bg-red-100',

  // Process Steps
  visit: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  estimate: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  assign: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-100',
  order: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  install: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  settle: 'bg-green-100 text-green-800 hover:bg-green-100',

  // Log Types
  daily: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  issue: 'bg-red-100 text-red-800 hover:bg-red-100',
  progress: 'bg-green-100 text-green-800 hover:bg-green-100',
  photo: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  const getLabel = () => {
    switch (type) {
      case 'status':
        return PROJECT_STATUS[value as keyof typeof PROJECT_STATUS]?.label || value
      case 'docStatus':
        return DOC_STATUS[value as keyof typeof DOC_STATUS]?.label || value
      case 'risk':
        return RISK_LEVELS[value as keyof typeof RISK_LEVELS]?.label || value
      case 'priority':
        return PRIORITY[value as keyof typeof PRIORITY]?.label || value
      case 'step':
        return PROCESS_STEPS.find(s => s.key === value)?.label || value
      case 'logType':
        return LOG_TYPES[value as keyof typeof LOG_TYPES]?.label || value
      default:
        return value
    }
  }

  return (
    <Badge
      variant="secondary"
      className={cn(colorMap[value] || 'bg-gray-100 text-gray-800', className)}
    >
      {getLabel()}
    </Badge>
  )
}
