// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Gaveta de Navegação Mobile Vertical (MobileNavigation)
// Sem rolagem horizontal, com suporte a Safe Area e fechamento seguro
// ==============================================================================

import React, { useEffect } from 'react'
import { X, ChevronRight, Ticket } from 'lucide-react'
import type { PageKey } from '../../components/ModuleSidebar'
import type { NavigationGroup } from '../navigation/navigation.types'
import { ThemeToggleCompact } from '../../design-system/components/ThemeToggleCompact'

export interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
  groups: NavigationGroup[]
  currentPage: PageKey
  onNavigate: (page: PageKey) => void
  producerName?: string | null
  eventName?: string | null
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
  groups,
  currentPage,
  onNavigate,
  producerName,
  eventName
}) => {
  // Fecha com a tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="disk-mobile-drawer fixed inset-0 z-[100] flex lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de Navegação Principal"
    >
      {/* Backdrop com desfoque suave */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        data-testid="mobile-drawer-backdrop"
      />

      {/* Gaveta Lateral (Drawer Vertical) */}
      <div
        className="relative flex flex-col w-4/5 max-w-sm h-full bg-surface-elevated text-foreground border-r border-border shadow-2xl z-10 pt-[env(safe-area-inset-top,0)] pb-[env(safe-area-inset-bottom,0)] animate-in slide-in-from-left duration-200"
      >
        {/* Cabeçalho da Gaveta */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70">
          <div className="flex items-center gap-2">
            <img src="/logo-diskingressos.png" alt="DiskIngressos" className="h-6 w-auto" />
            <span className="font-bold text-xs tracking-wider uppercase text-foreground">Menu</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggleCompact />
            <button
              type="button"
              onClick={onClose}
              data-testid="mobile-drawer-close"
              aria-label="Fechar menu"
              className="p-1.5 rounded-lg border border-border/70 text-foreground hover:bg-muted/40 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Informações de Contexto Ativo */}
        {(producerName || eventName) && (
          <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 text-xs">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">
              Contexto Ativo
            </div>
            <div className="font-semibold text-foreground truncate">{producerName || 'Visão Global'}</div>
            {eventName && (
              <div className="text-[11px] text-primary truncate mt-0.5 flex items-center gap-1">
                <Ticket size={12} />
                <span>{eventName}</span>
              </div>
            )}
          </div>
        )}

        {/* Lista de Grupos e Links com Rolagem Vertical Estrita */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                {group.icon && <group.icon size={13} className="text-primary" />}
                <span>{group.label}</span>
              </div>

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentPage === item.pageKey
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.pageKey)
                        onClose()
                      }}
                      data-testid={`mobile-nav-${item.pageKey}`}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <Icon size={16} className={isActive ? 'text-primary-foreground' : 'text-primary'} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? 'bg-primary-foreground/20 text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight size={13} className="opacity-50" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Rodapé da Gaveta */}
        <div className="p-3 border-t border-border/70 text-center text-[10px] text-muted-foreground">
          PDT DiskIngressos Enterprise
        </div>
      </div>
    </div>
  )
}
export default MobileNavigation
