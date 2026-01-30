'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Construction } from 'lucide-react'

export default function TeamsPage() {
  return (
    <div>
      <PageHeader
        title="팀 관리"
        description="시공팀을 관리합니다."
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Construction className="h-4 w-4" />
            <span className="text-sm font-medium">개발 예정</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            팀 관리 기능은 Phase 2에서 개발될 예정입니다.
            <br />
            본사 팀, 외주 팀, 협력사를 등록하고 관리할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
