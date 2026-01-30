'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { PROJECT_STATUS, PROCESS_STEPS, PRIORITY } from '@/lib/constants'
import type { ProjectRow, TeamRow, UserRow } from '@/types/database'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectFormProps {
  project?: ProjectRow
  isEdit?: boolean
}

export function ProjectForm({ project, isEdit = false }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [users, setUsers] = useState<UserRow[]>([])

  const [formData, setFormData] = useState({
    name: project?.name || '',
    code: project?.code || '',
    client_name: project?.client_name || '',
    location: project?.location || '',
    status: project?.status || 'active',
    process_step: project?.process_step || 'visit',
    priority: project?.priority || 'medium',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
    team_id: project?.team_id || '',
    manager_id: project?.manager_id || '',
    description: project?.description || '',
  })

  useEffect(() => {
    const fetchOptions = async () => {
      const supabase = createClient()

      const [teamsRes, usersRes] = await Promise.all([
        supabase.from('teams').select('*').order('name'),
        supabase.from('users').select('*').in('role', ['admin', 'manager']).order('name'),
      ])

      setTeams(teamsRes.data || [])
      setUsers(usersRes.data || [])
    }

    fetchOptions()
  }, [])

  // Generate project code
  useEffect(() => {
    if (!isEdit && !formData.code) {
      const year = new Date().getFullYear()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      setFormData(prev => ({ ...prev, code: `${year}-${random}` }))
    }
  }, [isEdit, formData.code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('프로젝트명을 입력해주세요.')
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    const payload = {
      ...formData,
      team_id: formData.team_id || null,
      manager_id: formData.manager_id || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
    }

    if (isEdit && project) {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id)

      if (error) {
        toast.error('수정에 실패했습니다.')
        setIsLoading(false)
        return
      }

      toast.success('프로젝트가 수정되었습니다.')
      router.push(`/projects/${project.id}`)
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select()
        .single()

      if (error) {
        toast.error('생성에 실패했습니다.')
        setIsLoading(false)
        return
      }

      toast.success('프로젝트가 생성되었습니다.')
      router.push(`/projects/${data.id}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">프로젝트명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="청주 오송 2공장"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">프로젝트 코드</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="2024-001"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">고객/발주처</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="OO전자"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">현장 위치</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="충북 청주시 흥덕구 오송읍"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as typeof formData.status }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>진행 단계</Label>
              <Select
                value={formData.process_step}
                onValueChange={(value) => setFormData(prev => ({ ...prev, process_step: value as typeof formData.process_step }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROCESS_STEPS.map((step) => (
                    <SelectItem key={step.key} value={step.key}>{step.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>우선순위</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as typeof formData.priority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">시작일</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">종료 예정일</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Team & Manager */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>시공팀</Label>
              <Select
                value={formData.team_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="시공팀 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">미지정</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} {team.is_external && '(외주)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>담당자</Label>
              <Select
                value={formData.manager_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="담당자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">미지정</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.department || user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="프로젝트에 대한 상세 설명을 입력하세요."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? '수정' : '생성'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
