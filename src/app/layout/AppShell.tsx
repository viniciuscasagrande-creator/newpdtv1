// ==============================================================================
// FASE 29.14.1.2 — DESIGN SYSTEM KOMPOSO / DISKINGRESSOS
// Container Mestre Global da Plataforma DiskIngressos (AppShell)
// Controla: Sidebar Global, Header Global, Gaveta Mobile, Dimensões e Tokens
// ==============================================================================

import React, { useState, useEffect, type ReactNode } from 'react'
import type { AppUser, Producer } from '../../auth/model'
import type { HeaderEventItem } from '../../components/Header'
import type { PageKey, ModuleKey } from '../../components/ModuleSidebar'
import type { BreadcrumbCrumb } from '../navigation/navigation.types'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { MobileNavigation } from './MobileNavigation'
import { MainContent } from './MainContent'
import { NAVIGATION_GROUPS } from '../navigation/navigation.config'
import { filterNavigation } from '../navigation/navigation.utils'
import type { EventItem } from '../../data/events'
import type { ProducerEvent } from '../../types/context.types'

export interface AppShellProps {
  children: ReactNode
  module: ModuleKey
  page: PageKey
  user: AppUser | null
  producers?: Producer[]
  selectedProducerId?: number | 'all'
  onSelectProducer?: (producerId: number | 'all') => void
  events?: HeaderEventItem[]
  selectedEventId?: number | null
  selectedEvent?: EventItem | null
  onSelectEvent?: (eventId: number | null) => void
  onNavigate: (page: PageKey) => void
  onBackToProducer: () => void
  onSelectOtherEvent?: (event: ProducerEvent) => void
  onHome: () => void
  onLogout?: () => void
  searchQuery?: string
  onSearchChange?: (val: string) => void
  breadcrumbs?: BreadcrumbCrumb[]
  inEventContext?: boolean
  canAdmin?: boolean
  fullWidthContent?: boolean
  sidebarCollapsed?: boolean
  onSidebarCollapsedChange?: (collapsed: boolean) => void
  mobileNavOpen?: boolean
  onToggleMobileNav?: () => void
  onCloseMobileNav?: () => void
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  module,
  page,
  user,
  producers = [],
  selectedProducerId = 'all',
  onSelectProducer,
  events = [],
  selectedEventId = null,
  selectedEvent = null,
  onSelectEvent,
  onNavigate,
  onBackToProducer,
  onSelectOtherEvent,
  onHome,
  onLogout,
  searchQuery = '',
  onSearchChange = () => {},
  breadcrumbs = [],
  inEventContext = false,
  canAdmin = true,
  fullWidthContent = false,
  sidebarCollapsed: controlledSidebarCollapsed,
  onSidebarCollapsedChange,
  mobileNavOpen: controlledMobileNavOpen,
  onToggleMobileNav,
  onCloseMobileNav
}) => {
  // Estado interno da Sidebar colapsada com sincronização de localStorage
  const [internalSidebarCollapsed, setInternalSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return (
      window.localStorage.getItem('disk-sidebar-collapsed') === 'true' ||
      window.localStorage.getItem('safesaff.sidebar.collapsed') === 'true'
    )
  })

  // Estado interno da gaveta mobile
  const [internalMobileNavOpen, setInternalMobileNavOpen] = useState(false)

  const isSidebarControlled = typeof controlledSidebarCollapsed === 'boolean'
  const effectiveSidebarCollapsed = isSidebarControlled
    ? controlledSidebarCollapsed
    : internalSidebarCollapsed

  const handleCollapsedChange = (collapsed: boolean) => {
    if (!isSidebarControlled) {
      setInternalSidebarCollapsed(collapsed)
    }
    onSidebarCollapsedChange?.(collapsed)
  }

  const isMobileNavControlled = typeof controlledMobileNavOpen === 'boolean'
  const effectiveMobileNavOpen = isMobileNavControlled
    ? controlledMobileNavOpen
    : internalMobileNavOpen

  const handleToggleMobileNav = () => {
    if (onToggleMobileNav) {
      onToggleMobileNav()
    } else {
      setInternalMobileNavOpen((prev) => !prev)
    }
  }

  const handleCloseMobileNav = () => {
    if (onCloseMobileNav) {
      onCloseMobileNav()
    } else {
      setInternalMobileNavOpen(false)
    }
  }

  // Sincroniza persistência de colapso
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('disk-sidebar-collapsed', String(effectiveSidebarCollapsed))
      window.localStorage.setItem('safesaff.sidebar.collapsed', String(effectiveSidebarCollapsed))
    }
  }, [effectiveSidebarCollapsed])

  // Fecha o drawer mobile ao trocar de página se não for controlado externamente
  useEffect(() => {
    document.getElementById('main-app-content')?.scrollTo({ top: 0, left: 0 })
    if (!isMobileNavControlled) {
      setInternalMobileNavOpen(false)
    }
  }, [page, isMobileNavControlled])

  // Grupos de navegação filtrados para o drawer mobile
  const filteredGroups = filterNavigation(NAVIGATION_GROUPS, {
    user,
    scope: selectedEventId ? 'event' : 'producer',
    producerId: selectedProducerId === 'all' ? null : selectedProducerId,
    eventId: selectedEventId
  })

  const currentProducer =
    selectedProducerId !== 'all'
      ? producers.find((p) => p.id === selectedProducerId)
      : null
  const producerDisplayName = currentProducer ? currentProducer.name : null
  const currentEventItem = events.find((e) => e.id === selectedEventId)
  const eventDisplayName = currentEventItem ? currentEventItem.title : null

  return (
    <div
      className={`app-shell min-h-screen bg-background text-foreground flex flex-col font-sans antialiased transition-colors w-full max-w-full overflow-x-hidden ${
        effectiveSidebarCollapsed && !inEventContext ? 'sidebar-collapsed' : ''
      } ${effectiveMobileNavOpen ? 'mobile-nav-open sidebar-mobile-expanded' : ''}`}
      data-testid="disk-app-shell"
      data-visual-contract="disk-limitless-shell-v6"
      style={
        {
          '--sidebar-width': '15rem',
          '--sidebar-collapsed-width': '4rem',
          '--header-height': '3.75rem',
          '--content-max-width': '110rem'
        } as React.CSSProperties
      }
    >
      {/* Header Global Unificado */}
      <AppHeader
        user={user}
        producers={producers}
        selectedProducerId={selectedProducerId}
        onSelectProducer={onSelectProducer}
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={onSelectEvent}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onToggleMobileNav={handleToggleMobileNav}
        isMobileNavOpen={effectiveMobileNavOpen}
        breadcrumbs={breadcrumbs}
        onLogout={onLogout}
      />

      <button
        type="button"
        className="mobile-nav-backdrop"
        data-testid="mobile-nav-backdrop"
        aria-label="Fechar navegação"
        onClick={handleCloseMobileNav}
      />

      {/* Área Central: Sidebar Global + Conteúdo Principal */}
      <div className="disk-shell-body flex flex-1 relative w-full overflow-x-hidden">
        {/* Sidebar Global Fixa / Recolhível */}
        <AppSidebar
          module={module}
          page={page}
          selectedEvent={selectedEvent}
          onNavigate={(p) => {
            onNavigate(p)
            handleCloseMobileNav()
          }}
          onBackToProducer={onBackToProducer}
          onSelectOtherEvent={onSelectOtherEvent}
          onHome={onHome}
          canAdmin={canAdmin}
          user={user}
          onCollapsedChange={handleCollapsedChange}
          mobileNavOpen={effectiveMobileNavOpen}
          inEventContext={inEventContext}
        />

        {/* Conteúdo Principal do Módulo Ativo */}
        <MainContent fullWidth={fullWidthContent}>
          {children}
        </MainContent>
      </div>

      {/* Gaveta de Navegação Mobile (Vertical, sem carrossel) */}
      <MobileNavigation
        isOpen={effectiveMobileNavOpen}
        onClose={handleCloseMobileNav}
        groups={filteredGroups}
        currentPage={page}
        onNavigate={(p) => {
          onNavigate(p)
          handleCloseMobileNav()
        }}
        producerName={producerDisplayName}
        eventName={eventDisplayName}
      />
    </div>
  )
}
export default AppShell
