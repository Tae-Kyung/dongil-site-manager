'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  onUpload: (files: File[]) => Promise<{ urls: string[]; error?: string }>
  isUploading?: boolean
  maxFiles?: number
  disabled?: boolean
}

export function ImageUploader({
  images,
  onImagesChange,
  onUpload,
  isUploading = false,
  maxFiles = 10,
  disabled = false,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const remainingSlots = maxFiles - images.length
      const filesToUpload = acceptedFiles.slice(0, remainingSlots)

      if (filesToUpload.length < acceptedFiles.length) {
        setError(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`)
      } else {
        setError(null)
      }

      const result = await onUpload(filesToUpload)

      if (result.error) {
        setError(result.error)
      } else if (result.urls.length > 0) {
        onImagesChange([...images, ...result.urls])
      }
    },
    [images, maxFiles, onImagesChange, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isUploading || images.length >= maxFiles,
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0]
      if (firstError?.code === 'file-too-large') {
        setError('파일 크기가 10MB를 초과합니다.')
      } else if (firstError?.code === 'file-invalid-type') {
        setError('이미지 파일만 업로드할 수 있습니다.')
      } else {
        setError('파일 업로드에 실패했습니다.')
      }
    },
  })

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)
    setError(null)
  }

  return (
    <div className="space-y-3">
      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, index) => (
            <div key={url} className="relative aspect-square group">
              <img
                src={url}
                alt={`업로드 이미지 ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
            isDragActive && 'border-primary bg-primary/5',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed',
            !isDragActive && !disabled && 'hover:border-primary/50'
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              {isDragActive ? (
                <>
                  <Upload className="h-6 w-6 text-primary" />
                  <p className="text-sm text-primary">여기에 놓으세요</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    클릭하거나 이미지를 드래그하세요
                  </p>
                  <p className="text-xs text-muted-foreground">
                    최대 {maxFiles}개, 10MB 이하
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
