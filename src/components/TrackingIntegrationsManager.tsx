import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Plus,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Layers,
  Table2,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react'
import type { EventItem } from '../data/events'
import '../styles/tracking-premium.css'
import {
  getTrackingIntegrations,
  createTrackingIntegration,
  updateTrackingIntegration,
  deleteTrackingIntegration,
  testTrackingIntegration,
  getTrackingIntegrationLogs,
  getEventTrackingAssignments,
  updateEventTrackingAssignment,
  deleteEventTrackingAssignment,
  getEventTrackingOverview,
  setPrimaryTrackingAssignment,
  unassignTrackingIntegrationFromEvent,
  type TrackingIntegration,
  type TrackingIntegrationEvent,
  type TrackingDeliveryLog,
  type TrackingOverviewResponse
} from '../services/api'
import {
  integrationByKey,
  marketingIntegrationCatalog,
  MARKETING_INTEGRATIONS_RELEASE,
  friendlyIntegrationTypeLabel,
  TRACKING_MODE_LABELS,
  type TrackingMode
} from '../domain/marketing/integrations'
import { UNIVERSAL_CONVERSION_RELEASE } from '../domain/marketing/conversionEngine'

import EventTrackingSelector from './tracking/EventTrackingSelector'
import TrackingOverviewKpis from './tracking/TrackingOverviewKpis'
import TrackingHealthSummary from './tracking/TrackingHealthSummary'
import TrackingProviderCard from './tracking/TrackingProviderCard'
import TrackingConversionMatrix from './tracking/TrackingConversionMatrix'
import TrackingIntegrationList from './tracking/TrackingIntegrationList'
import TrackingIntegrationDrawer from './tracking/TrackingIntegrationDrawer'
import TrackingAssignmentModal from './tracking/TrackingAssignmentModal'
import TrackingRecentActivity from './tracking/TrackingRecentActivity'
import TrackingAlertCard from './tracking/TrackingAlertCard'

type Props = {
  producerId: number | null
  events: EventItem[]
  fixedEventId?: number
  notify: (m: string) => void
}

export default function TrackingIntegrationsManager({
  producerId,
  events,
  fixedEventId,
  notify
}: Props) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    fixedEventId || events[0]?.id || null
  )

  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'conversions' | 'activity'>('overview')
  const [loading, setLoading] = useState(false)
  const [refreshingHealth, setRefreshingHealth] = useState(false)

  // Data from backend
  const [overview, setOverview] = useState<TrackingOverviewResponse | null>(null)
  const [allProducerIntegrations, setAllProducerIntegrations] = useState<TrackingIntegration[]>([])

  // Drawer and Modal states
  const [drawerData, setDrawerData] = useState<{
    integration: TrackingIntegration
    assignment?: TrackingIntegrationEvent
    initialTab?: string
    logs?: TrackingDeliveryLog[]
  } | null>(null)

  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [modalInitialProvider, setModalInitialProvider] = useState<string | undefined>(undefined)

  const currentEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0]
  }, [events, selectedEventId])

  const effectiveProducerId = producerId || currentEvent?.producerId || 1

  const load = async () => {
    if (!selectedEventId) return
    setLoading(true)
    try {
      const [ov, allIntegrations] = await Promise.all([
        getEventTrackingOverview(selectedEventId).catch(() => null),
        getTrackingIntegrations(producerId || undefined).catch(() => [])
      ])

      if (ov) {
        setOverview(ov)
      }
      setAllProducerIntegrations(allIntegrations)
    } catch (e: any) {
      notify(e.message || 'Erro ao carregar dados de tracking.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fixedEventId) {
      setSelectedEventId(fixedEventId)
    }
  }, [fixedEventId])

  useEffect(() => {
    load()
  }, [selectedEventId, producerId])

  // Handlers for Drawer & Actions
  const handleOpenDrawer = async (
    integration: TrackingIntegration,
    assignment?: TrackingIntegrationEvent,
    initialTab = 'rules'
  ) => {
    let logs: TrackingDeliveryLog[] = []
    try {
      logs = await getTrackingIntegrationLogs(integration.id).catch(() => [])
    } catch {
      logs = []
    }
    setDrawerData({ integration, assignment, initialTab, logs })
  }

  const handleTest = async (integration: TrackingIntegration) => {
    try {
      const out = await testTrackingIntegration(integration.id)
      notify(out.message)
      await load()
      if (drawerData && drawerData.integration.id === integration.id) {
        const updatedLogs = await getTrackingIntegrationLogs(integration.id).catch(() => [])
        setDrawerData(prev => prev ? { ...prev, logs: updatedLogs } : null)
      }
    } catch (e: any) {
      notify(e.message || 'Falha ao testar conexão.')
    }
  }

  const handleSetPrimary = async (integrationId: number) => {
    if (!selectedEventId) return
    try {
      await setPrimaryTrackingAssignment(selectedEventId, integrationId)
      notify('Integração definida como principal com sucesso.')
      await load()
      if (drawerData) {
        setDrawerData(prev => prev ? {
          ...prev,
          assignment: prev.assignment ? { ...prev.assignment, isPrimary: true } : prev.assignment
        } : null)
      }
    } catch (e: any) {
      notify(e.message || 'Falha ao definir como principal.')
    }
  }

  const handleToggleAssignmentEnabled = async (assignment: TrackingIntegrationEvent, enabled: boolean) => {
    if (!selectedEventId) return
    try {
      await updateEventTrackingAssignment(selectedEventId, assignment.integrationId, { enabled })
      notify(enabled ? 'Integração ativada neste evento.' : 'Integração desativada neste evento.')
      await load()
      if (drawerData && drawerData.assignment) {
        setDrawerData({
          ...drawerData,
          assignment: { ...drawerData.assignment, enabled }
        })
      }
    } catch (e: any) {
      notify(e.message || 'Erro ao alterar status da associação.')
    }
  }

  const handleSaveRules = async (
    assignment: TrackingIntegrationEvent,
    rules: Array<{ eventName: string; enabled: boolean; browserEnabled: boolean; serverEnabled: boolean }>
  ) => {
    if (!selectedEventId) return
    await updateEventTrackingAssignment(selectedEventId, assignment.integrationId, { rules })
    await load()
  }

  const handleUnassign = async (integrationId: number) => {
    if (!selectedEventId) return
    try {
      await unassignTrackingIntegrationFromEvent(selectedEventId, integrationId)
      notify('Integração desvinculada deste evento.')
      setDrawerData(null)
      await load()
    } catch (e: any) {
      notify(e.message || 'Erro ao desvincular integração.')
    }
  }

  const handleAssignExisting = async (
    integrationId: number,
    options: { trackingMode: TrackingMode; isPrimary: boolean }
  ) => {
    if (!selectedEventId) return
    await updateEventTrackingAssignment(selectedEventId, integrationId, {
      enabled: true,
      trackingMode: options.trackingMode,
      isPrimary: options.isPrimary
    })
    await load()
  }

  const handleCreateNew = async (data: any) => {
    await createTrackingIntegration(data)
    await load()
  }

  const handleRefreshHealth = async () => {
    setRefreshingHealth(true)
    await load()
    setRefreshingHealth(false)
    notify('Status de saúde e telemetria atualizados.')
  }

  const assignments = overview?.assignments || []
  const summary = overview?.summary || {
    totalIntegrations: 0,
    activeIntegrations: 0,
    problemIntegrations: 0,
    receivingEvents: 0,
    eventsSent24h: 0,
    healthScore: 100,
    healthStatusText: 'Aguardando configurações',
    healthBreakdown: { configurationPct: 0, connectivityPct: 100, recentEventsPct: 0, failurePct: 0 }
  }

  const defaultProviders = [
    { key: 'meta', name: 'Meta', total: 0, active: 0, problems: 0, receivingEvents: false, integrations: [] },
    { key: 'google', name: 'Google', total: 0, active: 0, problems: 0, receivingEvents: false, integrations: [] },
    { key: 'tiktok', name: 'TikTok', total: 0, active: 0, problems: 0, receivingEvents: false, integrations: [] },
    { key: 'spotify', name: 'Spotify', total: 0, active: 0, problems: 0, receivingEvents: false, integrations: [] }
  ]

  const providers = (overview?.providers && overview.providers.length > 0) ? overview.providers : defaultProviders
  const alerts = overview?.alerts || []
  const recentActivity = overview?.recentActivity || []

  return (
    <div
      className="tracking-premium-hub multi-tracking"
      data-release={MARKETING_INTEGRATIONS_RELEASE}
      data-conversion-release={UNIVERSAL_CONVERSION_RELEASE}
    >
      {/* Header Premium */}
      <div className="tracking-header-wrap">
        <div>
          <p className="eyebrow">INTEGRAÇÕES DE MARKETING · DISK CORE</p>
          <h2>Pixels e Conversões</h2>
          <p>
            Gerencie Pixels, APIs de conversão (CAPI) e regras granulares de rastreamento individualmente por evento.
          </p>
        </div>

        <div className="tracking-header-actions">
          <button
            className="btn secondary"
            onClick={handleRefreshHealth}
            disabled={loading || refreshingHealth}
            style={{ fontSize: '13px' }}
          >
            <RefreshCw size={14} className={refreshingHealth ? 'spin' : ''} />
            Atualizar Status
          </button>

          <button
            className="btn primary"
            onClick={() => {
              setModalInitialProvider(undefined)
              setAssignmentModalOpen(true)
            }}
            style={{ fontSize: '13px' }}
          >
            <Plus size={15} /> Nova integração
          </button>
        </div>
      </div>

      {/* Event Context Bar */}
      <EventTrackingSelector
        events={events}
        selectedEventId={selectedEventId}
        onSelectEvent={id => setSelectedEventId(id)}
      />

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map(alert => (
            <TrackingAlertCard
              key={alert.id}
              alert={alert}
              onAction={a => {
                if (a.id === 'no-purchase-rule' || a.id === 'multi-meta-purchase') {
                  setActiveTab('conversions')
                } else if (a.integrationId) {
                  const target = assignments.find(x => x.integration.id === a.integrationId)
                  if (target) handleOpenDrawer(target.integration, target, 'health')
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="tracking-tab-nav">
        <button
          type="button"
          className={`tracking-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Sparkles size={15} /> Visão Geral
        </button>
        <button
          type="button"
          className={`tracking-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Layers size={15} /> Integrações ({assignments.length})
        </button>
        <button
          type="button"
          className={`tracking-tab-btn ${activeTab === 'conversions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversions')}
        >
          <Table2 size={15} /> Matriz de Conversões
        </button>
        <button
          type="button"
          className={`tracking-tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <Clock size={15} /> Telemetria & Atividade
        </button>
      </div>

      {/* Tab 1: Visão Geral */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TrackingOverviewKpis summary={summary} />

          <TrackingHealthSummary
            healthScore={summary.healthScore}
            healthStatusText={summary.healthStatusText}
            breakdown={summary.healthBreakdown}
            onRefresh={handleRefreshHealth}
            busy={refreshingHealth}
          />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                Plataformas de Mídia do Evento
              </h4>
              <button
                type="button"
                className="btn link"
                style={{ fontSize: '13px', padding: 0 }}
                onClick={() => setActiveTab('integrations')}
              >
                Ver todas as integrações →
              </button>
            </div>

            <TrackingProviderCard
              providers={providers}
              onManage={() => setActiveTab('integrations')}
              onAdd={providerKey => {
                setModalInitialProvider(providerKey)
                setAssignmentModalOpen(true)
              }}
            />
          </div>

          {/* Quick preview of conversion matrix */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                Resumo da Matriz de Conversões
              </h4>
              <button
                type="button"
                className="btn link"
                style={{ fontSize: '13px', padding: 0 }}
                onClick={() => setActiveTab('conversions')}
              >
                Abrir matriz completa →
              </button>
            </div>
            <TrackingConversionMatrix
              assignments={assignments}
              onOpenDrawer={handleOpenDrawer}
            />
          </div>

          {/* Quick preview of recent activity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                Últimos Disparos de Conversão
              </h4>
              <button
                type="button"
                className="btn link"
                style={{ fontSize: '13px', padding: 0 }}
                onClick={() => setActiveTab('activity')}
              >
                Ver histórico detalhado →
              </button>
            </div>
            <TrackingRecentActivity
              activity={recentActivity.slice(0, 5)}
              eventId={selectedEventId || undefined}
              outboxStats={overview?.outboxStats}
              notify={notify}
              onRefresh={load}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Integrações */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                Integrações Associadas a este Evento
              </h3>
              <small style={{ color: "var(--disk-text-muted)" }}>
                Pixels, tags e APIs autorizados a receber telemetria de navegação e compras deste evento.
              </small>
            </div>

            <button
              className="btn primary"
              onClick={() => {
                setModalInitialProvider(undefined)
                setAssignmentModalOpen(true)
              }}
            >
              <Plus size={15} /> Adicionar ao Evento
            </button>
          </div>

          <TrackingIntegrationList
            assignments={assignments}
            onOpenDrawer={handleOpenDrawer}
            onTest={handleTest}
            onSetPrimary={handleSetPrimary}
            onToggleEnabled={handleToggleAssignmentEnabled}
            onUnassign={handleUnassign}
          />
        </div>
      )}

      {/* Tab 3: Conversões (Matriz) */}
      {activeTab === 'conversions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TrackingConversionMatrix
            assignments={assignments}
            onOpenDrawer={handleOpenDrawer}
          />
        </div>
      )}

      {/* Tab 4: Atividade & Telemetria */}
      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TrackingRecentActivity
            activity={recentActivity}
            eventId={selectedEventId || undefined}
            outboxStats={overview?.outboxStats}
            notify={notify}
            onRefresh={load}
          />
        </div>
      )}

      {/* Drawer Lateral */}
      {drawerData && (
        <TrackingIntegrationDrawer
          integration={drawerData.integration}
          assignment={drawerData.assignment}
          initialTab={drawerData.initialTab}
          logs={drawerData.logs}
          onClose={() => setDrawerData(null)}
          onSaveRules={handleSaveRules}
          onTest={handleTest}
          onSetPrimary={handleSetPrimary}
          onToggleAssignmentEnabled={handleToggleAssignmentEnabled}
          onUnassign={handleUnassign}
          notify={notify}
        />
      )}

      {/* Modal Wizard de Associação */}
      {assignmentModalOpen && selectedEventId && (
        <TrackingAssignmentModal
          eventId={selectedEventId}
          producerId={effectiveProducerId}
          availableIntegrations={allProducerIntegrations}
          alreadyAssignedIds={assignments.map(a => a.integration.id)}
          initialProvider={modalInitialProvider}
          onClose={() => setAssignmentModalOpen(false)}
          onAssignExisting={handleAssignExisting}
          onCreateNew={handleCreateNew}
          notify={notify}
        />
      )}
    </div>
  )
}
