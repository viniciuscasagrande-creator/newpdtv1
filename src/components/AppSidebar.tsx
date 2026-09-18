// ==============================================================================
// FASE 28.15.8.1.2 — SIDEBAR DINÂMICA PRODUTOR × EVENTO (APPSIDEBAR)
// Comuta dinamicamente entre ProducerSidebar (ModuleSidebar) e EventSidebar (EventContextSidebar)
// baseado estritamente no escopo global SafeSaffScope
// ==============================================================================

import React from 'react'
import { useSafeSaffContext } from '../hooks/useSafeSaffContext'
import EventContextSidebar from './EventContextSidebar'
import ModuleSidebar, { type PageKey, type ModuleKey } from './ModuleSidebar'
import type { EventItem } from '../data/events'
import type { AppUser } from '../auth/model'
import type { ProducerEvent } from '../types/context.types'

export interface AppSidebarProps {
  module: ModuleKey
  page: PageKey
  selectedEvent: EventItem | null
  onNavigate: (page: PageKey) => void
  onBackToProducer: () => void
  onSelectOtherEvent?: (event: ProducerEvent) => void
  onHome: () => void
  canAdmin?: boolean
  user: AppUser | null
  onCollapsedChange?: (collapsed: boolean) => void
  mobileNavOpen?: boolean
  inEventContext?: boolean
}

export default function AppSidebar({
  module,
  page,
  selectedEvent,
  onNavigate,
  onBackToProducer,
  onSelectOtherEvent,
  onHome,
  canAdmin = true,
  user,
  onCollapsedChange,
  mobileNavOpen = false,
  inEventContext = false
}: AppSidebarProps) {
  const { scope } = useSafeSaffContext()

  // Se o escopo for EVENT e houver evento selecionado, renderiza a sidebar individual do evento
  if ((scope === 'EVENT' || inEventContext) && selectedEvent) {
    return (
      <EventContextSidebar
        event={selectedEvent}
        page={page}
        onNavigate={onNavigate}
        onBack={onBackToProducer}
        onSelectOtherEvent={onSelectOtherEvent}
        canAdmin={canAdmin}
        onCollapsedChange={onCollapsedChange}
      />
    )
  }

  // Caso contrário, renderiza a sidebar corporativa do produtor (visão consolidada)
  return (
    <ModuleSidebar
      module={module}
      page={page}
      onNavigate={onNavigate}
      onHome={onHome}
      canAdmin={canAdmin}
      user={user || undefined}
      onCollapsedChange={onCollapsedChange}
      mobileNavOpen={mobileNavOpen}
    />
  )
}
