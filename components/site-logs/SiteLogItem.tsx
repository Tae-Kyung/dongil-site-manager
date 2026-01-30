'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/constants'
import { Trash2, Cloud, Sun, CloudRain, CloudSnow } from 'lucide-react'
import type { SiteLogRow } from '@/types/database'

interface SiteLogItemProps {
  log: SiteLogRow
  onDelete?: (id: string) => Promise<void>
  onImageClick?: (images: string[], index: number) => void
}

const weatherIcons: Record<string, React.ReactNode> = {
  '맑음': <Sun className="h-3 w-3" />,
  '흐림': <Cloud className="h-3 w-3" />,
  '비': <CloudRain className="h-3 w-3" />,
  '눈': <CloudSnow className="h-3 w-3" />,
}

export function SiteLogItem({ log, onDelete, onImageClick }: SiteLogItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const images = (log.images || []) as string[]

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    await onDelete(log.id)
    setIsDeleting(false)
    setShowDeleteDialog(false)
  }

  return (
    <div className="p-3 bg-muted rounded-lg group relative">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <StatusBadge type="logType" value={log.log_type} />
          <span className="text-xs text-muted-foreground">
            {formatDate(log.work_date)}
          </span>
          {log.weather && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {weatherIcons[log.weather] || null}
              {log.weather}
            </span>
          )}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      <p className="text-sm whitespace-pre-wrap">{log.content}</p>

      {images.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              onClick={() => onImageClick?.(images, i)}
              className="relative w-16 h-16 rounded overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            >
              <img
                src={img}
                alt={`현장 사진 ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
                  +{images.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="현장 로그 삭제"
        description="이 현장 로그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
