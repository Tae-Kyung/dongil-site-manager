'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageUploader } from './ImageUploader'
import { useImageUpload, type CreateSiteLogInput } from '@/hooks/useSiteLogs'
import { LOG_TYPES } from '@/lib/constants'
import { Loader2 } from 'lucide-react'

interface SiteLogFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSiteLogInput) => Promise<{ success: boolean; error?: string }>
}

interface FormData {
  content: string
  log_type: 'daily' | 'issue' | 'progress' | 'photo'
  weather: string
  work_date: string
}

const WEATHER_OPTIONS = ['맑음', '흐림', '비', '눈']

export function SiteLogForm({ open, onOpenChange, onSubmit }: SiteLogFormProps) {
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { uploadImages, isUploading } = useImageUpload()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      content: '',
      log_type: 'daily',
      weather: '',
      work_date: new Date().toISOString().split('T')[0],
    },
  })

  const logType = watch('log_type')

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    const result = await onSubmit({
      content: data.content,
      log_type: data.log_type,
      images: images,
      weather: data.weather || undefined,
      work_date: data.work_date,
    })

    setIsSubmitting(false)

    if (result.success) {
      reset()
      setImages([])
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    reset()
    setImages([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>현장 로그 작성</DialogTitle>
          <DialogDescription>
            현장 작업 내용을 기록하고 사진을 첨부할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Log Type */}
            <div className="space-y-2">
              <Label>로그 유형</Label>
              <Select
                value={logType}
                onValueChange={(value) =>
                  setValue('log_type', value as FormData['log_type'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LOG_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Date */}
            <div className="space-y-2">
              <Label htmlFor="work_date">작업일</Label>
              <Input
                id="work_date"
                type="date"
                {...register('work_date', { required: true })}
              />
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-2">
            <Label>날씨 (선택)</Label>
            <div className="flex gap-2 flex-wrap">
              {WEATHER_OPTIONS.map((weather) => (
                <Button
                  key={weather}
                  type="button"
                  variant={watch('weather') === weather ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setValue('weather', watch('weather') === weather ? '' : weather)
                  }
                >
                  {weather}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              placeholder="작업 내용을 입력하세요..."
              rows={4}
              {...register('content', {
                required: '내용을 입력해주세요.',
                minLength: { value: 5, message: '최소 5자 이상 입력해주세요.' },
              })}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>사진 첨부 (선택)</Label>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
              onUpload={uploadImages}
              isUploading={isUploading}
              maxFiles={10}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
