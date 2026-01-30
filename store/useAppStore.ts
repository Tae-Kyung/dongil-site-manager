import { create } from 'zustand'
import type { User, Project } from '@/types'

interface AppState {
  // Sidebar
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // Current user
  user: User | null
  setUser: (user: User | null) => void

  // Selected project (for quick access)
  selectedProject: Project | null
  setSelectedProject: (project: Project | null) => void

  // Recent projects (for sidebar quick list)
  recentProjects: Project[]
  setRecentProjects: (projects: Project[]) => void
  addRecentProject: (project: Project) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

export const useAppStore = create<AppState>((set) => ({
  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Current user
  user: null,
  setUser: (user) => set({ user }),

  // Selected project
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),

  // Recent projects
  recentProjects: [],
  setRecentProjects: (projects) => set({ recentProjects: projects }),
  addRecentProject: (project) =>
    set((state) => {
      const filtered = state.recentProjects.filter((p) => p.id !== project.id)
      return { recentProjects: [project, ...filtered].slice(0, 5) }
    }),

  // Loading
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
