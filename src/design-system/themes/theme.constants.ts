import type { ThemeMode, ThemeOption } from './theme.types'

export const THEME_STORAGE_KEY = 'disk-theme'

export const DEFAULT_THEME: ThemeMode = 'dark'

export const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    description: 'Interface clara com alto contraste e elegância'
  },
  {
    value: 'dark',
    label: 'Escuro',
    description: 'Interface escura profissional inspirada no Komposo'
  },
  {
    value: 'system',
    label: 'Sistema',
    description: 'Sincroniza automaticamente com a preferência do dispositivo'
  }
] as const
