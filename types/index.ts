import type {
  ProcessStep,
  ProjectStatus,
  DocType,
  DocStatus,
  RiskLevel,
  UserRole,
  LogType,
  Priority,
} from '@/lib/constants'

// Base types with timestamps
export interface BaseEntity {
  id: string
  created_at: string
  updated_at?: string
}

// User
export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  department?: string
  avatar_url?: string
}

// Team
export interface Team extends BaseEntity {
  name: string
  leader_id?: string
  leader?: User
  contact?: string
  specialty?: string
  is_external: boolean
}

// Project
export interface Project extends BaseEntity {
  code: string
  name: string
  client_name?: string
  location?: string
  status: ProjectStatus
  process_step: ProcessStep
  priority: Priority
  start_date?: string
  end_date?: string
  team_id?: string
  team?: Team
  manager_id?: string
  manager?: User
  description?: string
}

// Project Member
export interface ProjectMember extends BaseEntity {
  project_id: string
  user_id: string
  user?: User
  role: string
  joined_at: string
}

// Site Log
export interface SiteLog extends BaseEntity {
  project_id: string
  author_id: string
  author?: User
  content: string
  log_type: LogType
  images: string[]
  weather?: string
  work_date: string
}

// Document
export interface Document extends BaseEntity {
  project_id: string
  doc_type: DocType
  doc_number?: string
  title: string
  amount: number
  status: DocStatus
  file_url?: string
  issued_date?: string
  approved_by?: string
  approver?: User
  approved_at?: string
  notes?: string
}

// AI Insight
export interface AiInsight extends BaseEntity {
  project_id: string
  insight_type: 'risk' | 'recommendation' | 'summary'
  message: string
  risk_level: RiskLevel
  source_data?: Record<string, unknown>
  is_resolved: boolean
  resolved_at?: string
}

// Schedule
export interface Schedule extends BaseEntity {
  project_id: string
  title: string
  description?: string
  event_type: 'milestone' | 'meeting' | 'inspection' | 'delivery'
  start_datetime: string
  end_datetime?: string
  is_all_day: boolean
  assigned_to?: string
  assignee?: User
}

// Project with relations
export interface ProjectWithRelations extends Project {
  team?: Team
  manager?: User
  members?: ProjectMember[]
  site_logs?: SiteLog[]
  documents?: Document[]
  ai_insights?: AiInsight[]
  schedules?: Schedule[]
}

// Dashboard Stats
export interface DashboardStats {
  active_projects: number
  completed_this_month: number
  pending_documents: number
  unresolved_insights: number
  projects_by_step: Record<ProcessStep, number>
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Form types
export interface ProjectFormData {
  name: string
  code?: string
  client_name?: string
  location?: string
  status: ProjectStatus
  process_step: ProcessStep
  priority: Priority
  start_date?: string
  end_date?: string
  team_id?: string
  manager_id?: string
  description?: string
}

export interface SiteLogFormData {
  project_id: string
  content: string
  log_type: LogType
  images: string[]
  weather?: string
  work_date: string
}

export interface DocumentFormData {
  project_id: string
  doc_type: DocType
  doc_number?: string
  title: string
  amount: number
  file_url?: string
  issued_date?: string
  notes?: string
}

// Filter types
export interface ProjectFilters {
  status?: ProjectStatus
  process_step?: ProcessStep
  priority?: Priority
  manager_id?: string
  team_id?: string
  search?: string
}
