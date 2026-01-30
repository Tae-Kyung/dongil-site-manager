// Supabase Database Types
// This file should be regenerated using Supabase CLI after setup:
// npx supabase gen types typescript --project-id <your-project-id> > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'manager' | 'staff'
          department: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'manager' | 'staff'
          department?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'manager' | 'staff'
          department?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          leader_id: string | null
          contact: string | null
          specialty: string | null
          is_external: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          leader_id?: string | null
          contact?: string | null
          specialty?: string | null
          is_external?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          leader_id?: string | null
          contact?: string | null
          specialty?: string | null
          is_external?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          code: string
          name: string
          client_name: string | null
          location: string | null
          status: 'active' | 'on_hold' | 'completed' | 'cancelled'
          process_step: 'visit' | 'estimate' | 'assign' | 'order' | 'install' | 'settle'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          start_date: string | null
          end_date: string | null
          team_id: string | null
          manager_id: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          client_name?: string | null
          location?: string | null
          status?: 'active' | 'on_hold' | 'completed' | 'cancelled'
          process_step?: 'visit' | 'estimate' | 'assign' | 'order' | 'install' | 'settle'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          team_id?: string | null
          manager_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          client_name?: string | null
          location?: string | null
          status?: 'active' | 'on_hold' | 'completed' | 'cancelled'
          process_step?: 'visit' | 'estimate' | 'assign' | 'order' | 'install' | 'settle'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          start_date?: string | null
          end_date?: string | null
          team_id?: string | null
          manager_id?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      site_logs: {
        Row: {
          id: string
          project_id: string
          author_id: string
          content: string
          log_type: 'daily' | 'issue' | 'progress' | 'photo'
          images: string[]
          weather: string | null
          work_date: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          author_id: string
          content: string
          log_type?: 'daily' | 'issue' | 'progress' | 'photo'
          images?: string[]
          weather?: string | null
          work_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          author_id?: string
          content?: string
          log_type?: 'daily' | 'issue' | 'progress' | 'photo'
          images?: string[]
          weather?: string | null
          work_date?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          doc_type: 'estimate' | 'contract' | 'order' | 'invoice' | 'settlement'
          doc_number: string | null
          title: string
          amount: number
          status: 'draft' | 'pending' | 'approved' | 'rejected'
          file_url: string | null
          issued_date: string | null
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          doc_type: 'estimate' | 'contract' | 'order' | 'invoice' | 'settlement'
          doc_number?: string | null
          title: string
          amount?: number
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          file_url?: string | null
          issued_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          doc_type?: 'estimate' | 'contract' | 'order' | 'invoice' | 'settlement'
          doc_number?: string | null
          title?: string
          amount?: number
          status?: 'draft' | 'pending' | 'approved' | 'rejected'
          file_url?: string | null
          issued_date?: string | null
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          project_id: string
          insight_type: 'risk' | 'recommendation' | 'summary'
          message: string
          risk_level: 'info' | 'warning' | 'critical'
          source_data: Json | null
          is_resolved: boolean
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          insight_type?: 'risk' | 'recommendation' | 'summary'
          message: string
          risk_level?: 'info' | 'warning' | 'critical'
          source_data?: Json | null
          is_resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          insight_type?: 'risk' | 'recommendation' | 'summary'
          message?: string
          risk_level?: 'info' | 'warning' | 'critical'
          source_data?: Json | null
          is_resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          event_type: 'milestone' | 'meeting' | 'inspection' | 'delivery'
          start_datetime: string
          end_datetime: string | null
          is_all_day: boolean
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          event_type?: 'milestone' | 'meeting' | 'inspection' | 'delivery'
          start_datetime: string
          end_datetime?: string | null
          is_all_day?: boolean
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          event_type?: 'milestone' | 'meeting' | 'inspection' | 'delivery'
          start_datetime?: string
          end_datetime?: string | null
          is_all_day?: boolean
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      process_step: 'visit' | 'estimate' | 'assign' | 'order' | 'install' | 'settle'
      project_status: 'active' | 'on_hold' | 'completed' | 'cancelled'
      doc_type: 'estimate' | 'contract' | 'order' | 'invoice' | 'settlement'
      doc_status: 'draft' | 'pending' | 'approved' | 'rejected'
      risk_level: 'info' | 'warning' | 'critical'
      user_role: 'admin' | 'manager' | 'staff'
      log_type: 'daily' | 'issue' | 'progress' | 'photo'
      priority: 'low' | 'medium' | 'high' | 'urgent'
      event_type: 'milestone' | 'meeting' | 'inspection' | 'delivery'
      insight_type: 'risk' | 'recommendation' | 'summary'
    }
  }
}

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Table row types
export type UserRow = Tables<'users'>
export type TeamRow = Tables<'teams'>
export type ProjectRow = Tables<'projects'>
export type ProjectMemberRow = Tables<'project_members'>
export type SiteLogRow = Tables<'site_logs'>
export type DocumentRow = Tables<'documents'>
export type AiInsightRow = Tables<'ai_insights'>
export type ScheduleRow = Tables<'schedules'>
