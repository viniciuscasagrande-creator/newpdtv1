import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { Producer, EventItem, PeriodPreset } from '../types/core'
import { mockProducers } from '../data/mockProducers'
import { mockEvents } from '../data/mockEvents'

interface GlobalContextType {
  producers: Producer[]
  events: EventItem[]
  selectedProducerId: string | 'todos'
  selectedEventId: string | 'todos'
  selectedProducer: Producer | null
  selectedEvent: EventItem | null
  filteredEvents: EventItem[]
  setSelectedProducerId: (id: string | 'todos') => void
  setSelectedEventId: (id: string | 'todos') => void
  selectedPeriod: PeriodPreset
  setSelectedPeriod: (period: PeriodPreset) => void
  periodLabel: string
  updateEventStats: (eventId: string, deltaTickets: number, deltaRevenue: number) => void
  resetFilters: () => void
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

const PERIOD_LABELS: Record<PeriodPreset, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  ultimos_7_dias: 'Últimos 7 dias',
  ultimos_30_dias: 'Últimos 30 dias',
  este_mes: 'Este mês',
  ano_atual: 'Ano atual (2026)',
  todo_periodo: 'Todo o período',
}

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [producers] = useState<Producer[]>(mockProducers)
  const [events, setEvents] = useState<EventItem[]>(mockEvents)
  const [selectedProducerId, setSelectedProducerIdState] = useState<string | 'todos'>('todos')
  // Default to the first major event: Festival Rock 2026 (EVT-5842) as shown in user prompt
  const [selectedEventId, setSelectedEventIdState] = useState<string | 'todos'>('evt-5842')
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('ultimos_30_dias')

  // Events filtered by selected producer
  const filteredEvents = useMemo(() => {
    if (selectedProducerId === 'todos') {
      return events
    }
    return events.filter((e) => e.producerId === selectedProducerId)
  }, [events, selectedProducerId])

  // Active producer object
  const selectedProducer = useMemo(() => {
    if (selectedProducerId === 'todos') return null
    return producers.find((p) => p.id === selectedProducerId) || null
  }, [producers, selectedProducerId])

  // Active event object
  const selectedEvent = useMemo(() => {
    if (selectedEventId === 'todos') return null
    return events.find((e) => e.id === selectedEventId) || null
  }, [events, selectedEventId])

  const setSelectedProducerId = (id: string | 'todos') => {
    setSelectedProducerIdState(id)
    // If an event is selected that doesn't belong to the newly chosen producer, reset event to 'todos'
    if (id !== 'todos' && selectedEventId !== 'todos') {
      const evt = events.find((e) => e.id === selectedEventId)
      if (evt && evt.producerId !== id) {
        setSelectedEventIdState('todos')
      }
    }
  }

  const setSelectedEventId = (id: string | 'todos') => {
    setSelectedEventIdState(id)
    // If selecting a specific event, auto-sync producer if not matching
    if (id !== 'todos') {
      const evt = events.find((e) => e.id === id)
      if (evt && selectedProducerId !== 'todos' && evt.producerId !== selectedProducerId) {
        setSelectedProducerIdState(evt.producerId)
      }
    }
  }

  const updateEventStats = (eventId: string, deltaTickets: number, deltaRevenue: number) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          return {
            ...e,
            ticketsSold: e.ticketsSold + deltaTickets,
            totalRevenue: e.totalRevenue + deltaRevenue,
          }
        }
        return e
      })
    )
  }

  const resetFilters = () => {
    setSelectedProducerIdState('todos')
    setSelectedEventIdState('todos')
    setSelectedPeriod('ultimos_30_dias')
  }

  return (
    <GlobalContext.Provider
      value={{
        producers,
        events,
        selectedProducerId,
        selectedEventId,
        selectedProducer,
        selectedEvent,
        filteredEvents,
        setSelectedProducerId,
        setSelectedEventId,
        selectedPeriod,
        setSelectedPeriod,
        periodLabel: PERIOD_LABELS[selectedPeriod],
        updateEventStats,
        resetFilters,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobalContext() {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobalContext deve ser usado dentro de um GlobalProvider')
  }
  return context
}
