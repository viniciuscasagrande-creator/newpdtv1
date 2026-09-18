import type { ReactNode } from 'react'
import type { SystemModuleId } from './core'

export interface SubMenuItem {
  title: string
  path: string
  badge?: string | number
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate'
  description?: string
}

export interface NavigationModule {
  id: SystemModuleId
  title: string
  iconName: string
  path: string
  badge?: string | number
  badgeColor?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate'
  subItems: SubMenuItem[]
  description: string
}
