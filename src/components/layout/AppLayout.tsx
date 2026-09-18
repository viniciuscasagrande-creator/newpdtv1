import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumb, type BreadcrumbItem } from '../common/Breadcrumb'
import { GlobalSearchModal } from './GlobalSearchModal'
import { NotificationsDrawer } from './NotificationsDrawer'
import { AuditDrawer } from './AuditDrawer'
import { SimulateSaleModal } from '../events/SimulateSaleModal'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { NAVIGATION_MODULES } from '../../app/navigation'
import { Calendar, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export function AppLayout() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Global modals and drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAuditOpen, setIsAuditOpen] = useState(false)
  const [isSimulateSaleOpen, setIsSimulateSaleOpen] = useState(false)

  const { selectedEvent } = useGlobalContext()
  const { activeToast, dismissToast } = useCoreEventBus()

  // Generate dynamic breadcrumbs based on pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname
    if (path === '/' || path === '/overview') {
      return [{ label: 'Visão Geral Consolidada' }]
    }

    if (path === '/auditoria') {
      return [{ label: 'Auditoria & Logs de Segurança' }]
    }

    if (path === '/configuracoes') {
      return [{ label: 'Configurações Globais Core' }]
    }

    // Match module
    for (const mod of NAVIGATION_MODULES) {
      if (path === mod.path) {
        return [{ label: mod.title }]
      }
      if (path.startsWith(`${mod.path}/`)) {
        const sub = mod.subItems.find((s) => s.path === path)
        return [
          { label: mod.title, path: mod.path },
          { label: sub ? sub.title : path.split('/').pop() || '' },
        ]
      }
    }

    return [{ label: 'Página' }]
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <Header
          onToggleMobileSidebar={() => setIsMobileOpen(true)}
          onOpenGlobalSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenSimulateSale={() => setIsSimulateSaleOpen(true)}
        />

        {/* Subheader: Breadcrumbs & Active Event Context Bar */}
        <div className="border-b border-slate-200/90 bg-white px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <Breadcrumb items={breadcrumbs} />

          {/* Current Event Context Pill */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-slate-600 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">
                {selectedEvent ? selectedEvent.name : 'Todos os Eventos'}
              </span>
              {selectedEvent && (
                <span className="font-mono text-[10px] bg-slate-200/70 text-slate-700 px-1 py-0.2 rounded">
                  #{selectedEvent.code}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Page View Outlet */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Real-time Sales Toast (Core Event Bus) */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 pr-1">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-white">{activeToast.title}</h4>
                <span className="text-[9.5px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-medium">
                  {formatCurrency(activeToast.grossAmount)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                {activeToast.message}
              </p>
              <div className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Propagado nos 9 módulos em tempo real
              </div>
            </div>
            <button
              onClick={dismissToast}
              className="rounded p-1 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AuditDrawer
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
      />

      <SimulateSaleModal
        isOpen={isSimulateSaleOpen}
        onClose={() => setIsSimulateSaleOpen(false)}
      />
    </div>
  )
}
