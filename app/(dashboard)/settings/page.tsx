'use client'

import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Settings, Construction } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="설정"
        description="시스템 설정을 관리합니다."
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Construction className="h-4 w-4" />
            <span className="text-sm font-medium">개발 예정</span>
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            설정 기능은 Phase 2에서 개발될 예정입니다.
            <br />
            프로필 수정, 알림 설정, 시스템 설정을 관리할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
