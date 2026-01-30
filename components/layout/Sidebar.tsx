'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, PROJECT_STATUS } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  Users,
  Settings,
  Building2,
  ChevronLeft,
  Circle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectRow } from '@/types/database'

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" />,
  FolderKanban: <FolderKanban className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  recentProjects?: ProjectRow[]
}

export function Sidebar({ isOpen, onToggle, recentProjects = [] }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        isOpen ? 'w-64' : 'w-0 md:w-16'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          !isOpen && 'md:justify-center'
        )}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <span className="font-bold text-lg text-sidebar-foreground">
                동일유리
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                    !isOpen && 'md:justify-center md:px-2'
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  {iconMap[item.icon]}
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Recent Projects */}
          {isOpen && recentProjects.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="px-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  진행중 프로젝트
                </h4>
                <div className="space-y-1">
                  {recentProjects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                        pathname === `/projects/${project.id}`
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                      )}
                    >
                      <Circle
                        className={cn(
                          'h-2 w-2 fill-current',
                          project.status === 'active' && 'text-blue-500',
                          project.status === 'on_hold' && 'text-yellow-500',
                          project.status === 'completed' && 'text-green-500'
                        )}
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>

        {/* Collapse Button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center',
              isOpen && 'justify-start'
            )}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                !isOpen && 'rotate-180'
              )}
            />
            {isOpen && <span className="ml-2">접기</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
