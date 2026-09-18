/**
 * @newpdt/menu-manager
 * Módulo de orquestração e contratos de menus do PDT DiskIngressos.
 */

export interface MenuItemCommand {
  id: string
  label: string
  pageKey: string
  path?: string
  icon?: string
  badge?: string
  badgeTone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  disabled?: boolean
  permissions?: string[]
  subItems?: MenuItemCommand[]
}

export interface MenuNavigationEvent {
  targetKey: string
  previousKey?: string
  timestamp: string
}

export class MenuManager {
  private static instance: MenuManager
  private items: Map<string, MenuItemCommand> = new Map()

  private constructor() {}

  public static getInstance(): MenuManager {
    if (!MenuManager.instance) {
      MenuManager.instance = new MenuManager()
    }
    return MenuManager.instance
  }

  public register(item: MenuItemCommand): void {
    this.items.set(item.pageKey, item)
  }

  public getItem(pageKey: string): MenuItemCommand | undefined {
    return this.items.get(pageKey)
  }

  public getAll(): MenuItemCommand[] {
    return Array.from(this.items.values())
  }
}
