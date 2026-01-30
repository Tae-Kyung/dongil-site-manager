// Process Steps (6 stages)
export const PROCESS_STEPS = [
  { key: 'visit', label: '현장방문', order: 1 },
  { key: 'estimate', label: '견적', order: 2 },
  { key: 'assign', label: '배정', order: 3 },
  { key: 'order', label: '발주', order: 4 },
  { key: 'install', label: '시공', order: 5 },
  { key: 'settle', label: '정산', order: 6 },
] as const

export type ProcessStep = (typeof PROCESS_STEPS)[number]['key']

// Project Status
export const PROJECT_STATUS = {
  active: { label: '진행중', color: 'bg-blue-500' },
  on_hold: { label: '보류', color: 'bg-yellow-500' },
  completed: { label: '완료', color: 'bg-green-500' },
  cancelled: { label: '취소', color: 'bg-gray-500' },
} as const

export type ProjectStatus = keyof typeof PROJECT_STATUS

// Document Types
export const DOC_TYPES = {
  estimate: { label: '견적서', color: 'bg-purple-500' },
  contract: { label: '계약서', color: 'bg-blue-500' },
  order: { label: '발주서', color: 'bg-orange-500' },
  invoice: { label: '세금계산서', color: 'bg-green-500' },
  settlement: { label: '정산서', color: 'bg-teal-500' },
} as const

export type DocType = keyof typeof DOC_TYPES

// Document Status
export const DOC_STATUS = {
  draft: { label: '초안', color: 'bg-gray-500' },
  pending: { label: '검토중', color: 'bg-yellow-500' },
  approved: { label: '승인', color: 'bg-green-500' },
  rejected: { label: '반려', color: 'bg-red-500' },
} as const

export type DocStatus = keyof typeof DOC_STATUS

// Risk Levels
export const RISK_LEVELS = {
  info: { label: '정보', color: 'bg-blue-500', icon: 'Info' },
  warning: { label: '주의', color: 'bg-yellow-500', icon: 'AlertTriangle' },
  critical: { label: '위험', color: 'bg-red-500', icon: 'AlertCircle' },
} as const

export type RiskLevel = keyof typeof RISK_LEVELS

// User Roles
export const USER_ROLES = {
  admin: { label: '관리자', level: 3 },
  manager: { label: '매니저', level: 2 },
  staff: { label: '직원', level: 1 },
} as const

export type UserRole = keyof typeof USER_ROLES

// Site Log Types
export const LOG_TYPES = {
  daily: { label: '일일보고', color: 'bg-blue-500' },
  issue: { label: '이슈', color: 'bg-red-500' },
  progress: { label: '진행상황', color: 'bg-green-500' },
  photo: { label: '사진', color: 'bg-purple-500' },
} as const

export type LogType = keyof typeof LOG_TYPES

// Priority
export const PRIORITY = {
  low: { label: '낮음', color: 'bg-gray-400' },
  medium: { label: '보통', color: 'bg-blue-400' },
  high: { label: '높음', color: 'bg-orange-400' },
  urgent: { label: '긴급', color: 'bg-red-500' },
} as const

export type Priority = keyof typeof PRIORITY

// Navigation Items
export const NAV_ITEMS = [
  { href: '/', label: '대시보드', icon: 'LayoutDashboard' },
  { href: '/projects', label: '프로젝트', icon: 'FolderKanban' },
  { href: '/schedule', label: '일정', icon: 'Calendar' },
  { href: '/teams', label: '팀 관리', icon: 'Users' },
  { href: '/settings', label: '설정', icon: 'Settings' },
] as const

// Format currency (Korean Won)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date)
  if (format === 'long') {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }).format(d)
  }
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return formatDate(date)
}
