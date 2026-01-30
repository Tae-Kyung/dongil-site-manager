-- =====================================================
-- 동일유리 현장관리 시스템 - Supabase Database Setup
-- =====================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing types if they exist (for clean setup)
DROP TYPE IF EXISTS process_step CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS doc_type CASCADE;
DROP TYPE IF EXISTS doc_status CASCADE;
DROP TYPE IF EXISTS risk_level CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS log_type CASCADE;
DROP TYPE IF EXISTS priority CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS insight_type CASCADE;

-- 3. Create ENUM types
CREATE TYPE process_step AS ENUM ('visit', 'estimate', 'assign', 'order', 'install', 'settle');
CREATE TYPE project_status AS ENUM ('active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE doc_type AS ENUM ('estimate', 'contract', 'order', 'invoice', 'settlement');
CREATE TYPE doc_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE risk_level AS ENUM ('info', 'warning', 'critical');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE log_type AS ENUM ('daily', 'issue', 'progress', 'photo');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE event_type AS ENUM ('milestone', 'meeting', 'inspection', 'delivery');
CREATE TYPE insight_type AS ENUM ('risk', 'recommendation', 'summary');

-- =====================================================
-- 4. Create Tables
-- =====================================================

-- Users table (linked to Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact TEXT,
  specialty TEXT,
  is_external BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT,
  location TEXT,
  status project_status NOT NULL DEFAULT 'active',
  process_step process_step NOT NULL DEFAULT 'visit',
  priority priority NOT NULL DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT '팀원',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Site Logs table
CREATE TABLE site_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  log_type log_type NOT NULL DEFAULT 'daily',
  images JSONB NOT NULL DEFAULT '[]',
  weather TEXT,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  doc_number TEXT,
  title TEXT NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  status doc_status NOT NULL DEFAULT 'draft',
  file_url TEXT,
  issued_date DATE,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Insights table
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  insight_type insight_type NOT NULL DEFAULT 'risk',
  message TEXT NOT NULL,
  risk_level risk_level NOT NULL DEFAULT 'info',
  source_data JSONB,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type NOT NULL DEFAULT 'milestone',
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. Create Indexes for better query performance
-- =====================================================

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_process_step ON projects(process_step);
CREATE INDEX idx_projects_manager_id ON projects(manager_id);
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_site_logs_project_id ON site_logs(project_id);
CREATE INDEX idx_site_logs_work_date ON site_logs(work_date);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_ai_insights_project_id ON ai_insights(project_id);
CREATE INDEX idx_ai_insights_is_resolved ON ai_insights(is_resolved);
CREATE INDEX idx_schedules_project_id ON schedules(project_id);
CREATE INDEX idx_schedules_start_datetime ON schedules(start_datetime);

-- =====================================================
-- 6. Create updated_at trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. Create function to handle new user signup
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'staff'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 8. Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Authenticated users can view teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Projects policies
CREATE POLICY "Authenticated users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins and project managers can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR manager_id = auth.uid()
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Project Members policies
CREATE POLICY "Authenticated users can view project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and project managers can manage members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM projects WHERE id = project_id AND manager_id = auth.uid())
  );

-- Site Logs policies
CREATE POLICY "Authenticated users can view site logs"
  ON site_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create site logs"
  ON site_logs FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own logs"
  ON site_logs FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors and admins can delete logs"
  ON site_logs FOR DELETE
  TO authenticated
  USING (
    author_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Documents policies
CREATE POLICY "Authenticated users can view documents"
  ON documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins and managers can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- AI Insights policies
CREATE POLICY "Authenticated users can view insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can resolve insights"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (true);

-- Schedules policies
CREATE POLICY "Authenticated users can view schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage schedules"
  ON schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- =====================================================
-- 9. Storage Bucket Setup
-- =====================================================

-- Create storage bucket for site images (run in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- =====================================================
-- 10. Dummy Data for Testing
-- =====================================================

-- Note: Users will be created through Supabase Auth
-- After creating auth users, update the users table with roles

-- Dummy Teams
INSERT INTO teams (id, name, contact, specialty, is_external) VALUES
  ('11111111-1111-1111-1111-111111111111', 'A팀 (본사)', '010-1234-5678', '유리 시공 전문', false),
  ('22222222-2222-2222-2222-222222222222', 'B팀 (외주)', '010-9876-5432', '외벽 유리 전문', true),
  ('33333333-3333-3333-3333-333333333333', 'C팀 (협력)', '010-5555-6666', '특수 유리 시공', true);

-- Dummy Projects
INSERT INTO projects (id, code, name, client_name, location, status, process_step, priority, start_date, end_date, team_id, description) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2024-001',
    '청주 오송 2공장',
    'OO전자',
    '충북 청주시 흥덕구 오송읍 오송생명1로 194',
    'active',
    'order',
    'high',
    '2024-01-15',
    '2024-06-30',
    '11111111-1111-1111-1111-111111111111',
    '청주 오송 산업단지 내 OO전자 2공장 유리 외벽 시공 프로젝트'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '2024-002',
    '대전 본점 리모델링',
    '대전백화점',
    '대전광역시 중구 대종로 480',
    'active',
    'estimate',
    'medium',
    '2024-02-01',
    '2024-08-31',
    '22222222-2222-2222-2222-222222222222',
    '대전백화점 본점 1층 쇼윈도우 유리 교체 및 리모델링'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '2024-003',
    '세종 정부청사 보수',
    '세종시청',
    '세종특별자치시 한누리대로 2130',
    'active',
    'visit',
    'urgent',
    '2024-03-01',
    '2024-04-30',
    null,
    '세종 정부청사 외벽 유리 파손 긴급 보수'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '2023-012',
    '천안 아산 물류센터',
    '쿠팡',
    '충남 천안시 서북구 직산읍',
    'completed',
    'settle',
    'medium',
    '2023-06-01',
    '2023-12-31',
    '11111111-1111-1111-1111-111111111111',
    '천안아산 물류센터 신축 유리 시공 (완료)'
  );

-- NOTE: Site Logs require a user to exist first.
-- Run seed-data.sql AFTER creating a user in Supabase Auth.
-- See supabase/seed-data.sql for site_logs dummy data.

-- Dummy Documents (청주 오송 2공장)
INSERT INTO documents (project_id, doc_type, doc_number, title, amount, status, issued_date, notes) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'estimate',
    'EST-2024-001',
    '청주 오송 2공장 견적서',
    150000000,
    'approved',
    '2024-01-10',
    '강화유리 + 시공비 포함'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'contract',
    'CON-2024-001',
    '공사 도급 계약서',
    150000000,
    'approved',
    '2024-01-12',
    '계약금 30% 선지급 조건'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'order',
    'ORD-2024-001',
    '1차 자재 발주서',
    80000000,
    'approved',
    '2024-01-15',
    '강화유리 100장, 실리콘, 부자재'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'order',
    'ORD-2024-002',
    '2차 자재 발주서',
    35000000,
    'pending',
    '2024-01-20',
    '특수 강화유리 50장 추가 발주'
  );

-- Dummy AI Insights (청주 오송 2공장)
INSERT INTO ai_insights (project_id, insight_type, message, risk_level, is_resolved) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'risk',
    '최근 강우로 인해 외부 실리콘 작업 지연이 예상됩니다. 일정 조정을 권장합니다.',
    'warning',
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'risk',
    '2차 자재 납기일이 3일 남았습니다. 입고 일정을 확인해주세요.',
    'info',
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'recommendation',
    '동절기 시공 시 실리콘 경화 시간이 평소보다 2배 이상 소요될 수 있습니다. 작업 일정에 여유를 두세요.',
    'info',
    true
  );

-- Dummy Schedules (청주 오송 2공장)
INSERT INTO schedules (project_id, title, description, event_type, start_datetime, end_datetime, is_all_day) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '중간 점검',
    '발주처 담당자와 현장 중간 점검',
    'inspection',
    '2024-02-01 10:00:00+09',
    '2024-02-01 12:00:00+09',
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2차 자재 납품',
    '특수 강화유리 50장 납품 예정',
    'delivery',
    '2024-01-28 09:00:00+09',
    null,
    true
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '외벽 시공 완료',
    '동측 외벽 유리 시공 완료 목표',
    'milestone',
    '2024-02-15 00:00:00+09',
    null,
    true
  );

-- =====================================================
-- Setup Complete!
-- =====================================================
-- Next steps:
-- 1. Create users through Supabase Auth (Dashboard or API)
-- 2. Update user roles in users table as needed
-- 3. Create storage buckets: 'site-images' (public) and 'documents' (private)
-- 4. Configure storage policies in Supabase Dashboard
