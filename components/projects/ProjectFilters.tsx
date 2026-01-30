'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PROJECT_STATUS, PROCESS_STEPS, PRIORITY } from '@/lib/constants'
import { Search, X } from 'lucide-react'

interface ProjectFiltersProps {
  search: string
  status: string
  step: string
  priority: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onStepChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onClear: () => void
}

export function ProjectFilters({
  search,
  status,
  step,
  priority,
  onSearchChange,
  onStatusChange,
  onStepChange,
  onPriorityChange,
  onClear,
}: ProjectFiltersProps) {
  const hasFilters = search || status || step || priority

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="프로젝트명, 고객, 위치 검색..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 상태</SelectItem>
          {Object.entries(PROJECT_STATUS).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Step Filter */}
      <Select value={step} onValueChange={onStepChange}>
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="단계" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 단계</SelectItem>
          {PROCESS_STEPS.map((s) => (
            <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="우선순위" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 우선순위</SelectItem>
          {Object.entries(PRIORITY).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
