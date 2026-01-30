'use client'

import { cn } from '@/lib/utils'
import { PROCESS_STEPS } from '@/lib/constants'
import { Check } from 'lucide-react'

interface ProcessTimelineProps {
  currentStep: string
  onStepClick?: (step: string) => void
  isEditable?: boolean
}

export function ProcessTimeline({ currentStep, onStepClick, isEditable = false }: ProcessTimelineProps) {
  const currentIndex = PROCESS_STEPS.findIndex(s => s.key === currentStep)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {PROCESS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              {/* Connector */}
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-1 flex-1 -mr-1',
                      isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}

                {/* Step Circle */}
                <button
                  onClick={() => isEditable && onStepClick?.(step.key)}
                  disabled={!isEditable}
                  className={cn(
                    'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isFuture && 'border-muted bg-background text-muted-foreground',
                    isEditable && 'cursor-pointer hover:ring-2 hover:ring-primary/20'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </button>

                {index < PROCESS_STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-1 flex-1 -ml-1',
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
