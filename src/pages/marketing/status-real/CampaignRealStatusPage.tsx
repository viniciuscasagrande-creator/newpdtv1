import React, { useState, useEffect, useMemo } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Headphones,
  HelpCircle,
  Info,
  Layers,
  ListTree,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
  XCircle,
  Zap
} from 'lucide-react'
import type { EventItem } from '../../../data/events'
import {
  type MonitoredCampaignDeliveryItem,
  type MonitoredChannelKey,
  type CampaignDeliveryStatus,
  DELIVERY_STATUS_DICTIONARY
} from '../../../domain/marketing/campaignDeliveryMonitoring'
import { CampaignDeliveryService } from '../../../services/campaignDeliveryService'

interface CampaignRealStatusPageProps {
  events: EventItem[]
  producerName?: string
  producerId?: number | null
  selectedEventId?: string | number
  notify?: (msg: string) => void
  onNavigate?: (page: any) => void
}

export const CampaignRealStatusPage: React.FC<CampaignRealStatusPageProps> = ({
  events = [],
  producerName,
  producerId,
  selectedEventId,
  notify = () => {},
  onNavigate
}) => {
  const [campaigns, setCampaigns] = useState<MonitoredCampaignDeliveryItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<MonitoredChannelKey | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<CampaignDeliveryStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<MonitoredCampaignDeliveryItem | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [activeEventId, setActiveEventId] = useState<string>(selectedEventId ? String(selectedEventId) : 'all')

  const parsedEventId = activeEventId === 'all' ? undefined : Number(activeEventId)

  const reloadData = () => {
    const data = CampaignDeliveryService.getMonitoredCampaigns({
      channel: selectedChannel,
      deliveryStatus: selectedStatus,
      eventId: parsedEventId
    })
    setCampaigns(data)
  }

  useEffect(() => {
    reloadData()
  }, [selectedChannel, selectedStatus, activeEventId])

  const kpis = useMemo(() => {
    return CampaignDeliveryService.getSummaryKpis(parsedEventId)
  }, [campaigns, parsedEventId])

  const formatBrl = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      const updated = await CampaignDeliveryService.syncAllCampaigns()
      setCampaigns(
        updated.filter(c => {
          if (selectedChannel !== 'ALL' && c.channel !== selectedChannel) return false
          if (selectedStatus !== 'ALL' && c.deliveryStatus !== selectedStatus) return false
          if (parsedEventId && c.eventId && c.eventId !== parsedEventId) return false
          return true
        })
      )
      notify('Telemetria atualizada com sucesso nas 4 plataformas oficiais de mídia!')
    } catch {
      notify('Erro ao sincronizar campanhas.')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSyncSingle = async (item: MonitoredCampaignDeliveryItem) => {
    setSyncingId(item.id)
    try {
      const updated = await CampaignDeliveryService.syncSingleCampaign(item.id)
      if (updated) {
        setCampaigns(prev => prev.map(c => (c.id === item.id ? updated : c)))
        if (selectedDiagnostic && selectedDiagnostic.id === item.id) {
          setSelectedDiagnostic(updated)
        }
        notify(`Status de "${item.campaignName}" atualizado com sucesso!`)
      }
    } catch {
      notify('Erro ao sincronizar campanha.')
    } finally {
      setSyncingId(null)
    }
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (!search.trim()) return true
      const s = search.toLowerCase()
      return (
        c.campaignName.toLowerCase().includes(s) ||
        (c.eventName && c.eventName.toLowerCase().includes(s)) ||
        (c.externalCampaignId && c.externalCampaignId.toLowerCase().includes(s))
      )
    })
  }, [campaigns, search])

  const channelIcon = (channel: MonitoredChannelKey) => {
    switch (channel) {
      case 'META':
        return <Target size={14} style={{ color: '#0081FB' }} />
      case 'GOOGLE':
        return <ListTree size={14} style={{ color: '#EA4335' }} />
      case 'TIKTOK':
        return <Play size={14} style={{ color: '#000000' }} />
      case 'SPOTIFY':
        return <Headphones size={14} style={{ color: '#1DB954' }} />
    }
  }

  const channelBadgeStyle = (channel: MonitoredChannelKey) => {
    switch (channel) {
      case 'META':
        return { background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }
      case 'GOOGLE':
        return { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
      case 'TIKTOK':
        return { background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1' }
      case 'SPOTIFY':
        return { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' }
    }
  }

  const deliveryBadgeStyle = (status: CampaignDeliveryStatus) => {
    switch (status) {
      case 'ACTIVE_DELIVERING':
        return { background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', dot: '#16A34A' }
      case 'ACTIVE_NO_DELIVERY':
        return { background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D', dot: '#F59E0B' }
      case 'PENDING_REVIEW':
        return { background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD', dot: '#3B82F6' }
      case 'REJECTED':
        return { background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', dot: '#EF4444' }
      case 'PAUSED':
        return { background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', dot: '#64748B' }
    }
  }

  return (
    <div className="campaign-real-status-page" style={{ padding: '0 4px 40px', background: 'transparent' }}>
      {/* 1. Header & Operational Breadcrumbs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '16px',
          borderBottom: "1px solid var(--disk-border-default)"
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <button
              onClick={() => onNavigate ? onNavigate('marketing-dashboard') : window.history.back()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563EB',
                background: "var(--disk-color-info-subtle)",
                border: "1px solid var(--disk-color-info-border)",
                padding: '3px 8px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={13} />
              Voltar ao Dashboard Marketing
            </button>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>/</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: "var(--disk-text-primary)" }}>Status Real das Campanhas</span>
          </div>

          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: "var(--disk-text-primary)" }}>
            Central de Status Real & Telemetria de Entrega
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: "var(--disk-text-muted)" }}>
            Auditoria contínua de entrega e diagnóstico de causa-raiz para <b>Meta Ads</b>, <b>Google Ads</b>, <b>TikTok Ads</b> e <b>Spotify Ads</b>.
          </p>
        </div>

        {/* Action Controls & Event Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {events.length > 0 && (
            <select
              value={activeEventId}
              onChange={e => setActiveEventId(e.target.value)}
              style={{
                height: '36px',
                padding: '0 12px',
                fontSize: '12px',
                fontWeight: 700,
                background: "var(--disk-bg-surface)",
                color: "var(--disk-text-primary)",
                border: "1px solid var(--disk-border-default)",
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <option value="all">Todos os Eventos (Geral)</option>
              {events.map(ev => (
                <option key={ev.id} value={String(ev.id)}>
                  {ev.title}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing}
            style={{
              height: '36px',
              padding: '0 14px',
              fontSize: '12px',
              fontWeight: 700,
              background: '#2563EB',
              color: '#FFFFFF',
              border: 0,
              borderRadius: '8px',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)'
            }}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Sincronizando Plataformas...' : 'Sincronizar Agora'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Fase 28.13.1) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          marginBottom: '18px'
        }}
      >
        {/* 1. Entregando */}
        <div
          onClick={() => setSelectedStatus('ACTIVE_DELIVERING')}
          style={{
            background: selectedStatus === 'ACTIVE_DELIVERING' ? '#ECFDF5' : '#FFFFFF',
            border: selectedStatus === 'ACTIVE_DELIVERING' ? '2px solid #10B981' : '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: "var(--disk-color-success-text)", textTransform: 'uppercase' }}>
              Ativas e Entregando
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <strong style={{ fontSize: '26px', fontWeight: 900, color: "var(--disk-text-primary)" }}>
              {kpis.deliveringCount}
            </strong>
            <small style={{ fontSize: '11px', color: "var(--disk-color-success-text)", fontWeight: 700 }}>● Saudável</small>
          </div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block', marginTop: '4px' }}>
            Impressões e cliques ativos nas últimas 6 horas
          </span>
        </div>

        {/* 2. Sem Entrega */}
        <div
          onClick={() => setSelectedStatus('ACTIVE_NO_DELIVERY')}
          style={{
            background: selectedStatus === 'ACTIVE_NO_DELIVERY' ? '#FFFBEB' : '#FFFFFF',
            border: selectedStatus === 'ACTIVE_NO_DELIVERY' ? '2px solid #F59E0B' : '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: "var(--disk-color-warning-text)", textTransform: 'uppercase' }}>
              Ativas sem Entrega
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <strong style={{ fontSize: '26px', fontWeight: 900, color: '#D97706' }}>
              {kpis.noDeliveryCount}
            </strong>
            <small style={{ fontSize: '11px', color: "var(--disk-color-warning-text)", fontWeight: 700 }}>⚠️ Atenção</small>
          </div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block', marginTop: '4px' }}>
            Ativa na plataforma porém sem impressões geradas
          </span>
        </div>

        {/* 3. Em Análise */}
        <div
          onClick={() => setSelectedStatus('PENDING_REVIEW')}
          style={{
            background: selectedStatus === 'PENDING_REVIEW' ? '#EFF6FF' : '#FFFFFF',
            border: selectedStatus === 'PENDING_REVIEW' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: "var(--disk-color-info-text)", textTransform: 'uppercase' }}>
              Em Análise / Fila
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <strong style={{ fontSize: '26px', fontWeight: 900, color: '#2563EB' }}>
              {kpis.inReviewCount}
            </strong>
            <small style={{ fontSize: '11px', color: "var(--disk-color-info-text)", fontWeight: 700 }}>⏳ Moderação</small>
          </div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block', marginTop: '4px' }}>
            Aguardando validação algorítmica e humana
          </span>
        </div>

        {/* 4. Com Problemas */}
        <div
          onClick={() => setSelectedStatus('REJECTED')}
          style={{
            background: selectedStatus === 'REJECTED' ? '#FEF2F2' : '#FFFFFF',
            border: selectedStatus === 'REJECTED' ? '2px solid #EF4444' : '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '14px 16px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: "var(--disk-color-danger-text)", textTransform: 'uppercase' }}>
              Com Problemas / Erro
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <strong style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626' }}>
              {kpis.rejectedCount}
            </strong>
            <small style={{ fontSize: '11px', color: "var(--disk-color-danger-text)", fontWeight: 700 }}>🚨 Ação necessária</small>
          </div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block', marginTop: '4px' }}>
            Criativos reprovados, saldo esgotado ou conta bloqueada
          </span>
        </div>
      </div>

      {/* 3. Filter Tools Bar (Channel + Status + Search) */}
      <div
        style={{
          background: "var(--disk-bg-surface)",
          border: "1px solid var(--disk-border-default)",
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          {/* Channel Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { key: 'ALL', label: 'Todos os Canais', count: 48 },
              { key: 'META', label: 'Meta Ads', count: 18, icon: <Target size={13} /> },
              { key: 'GOOGLE', label: 'Google Ads', count: 12, icon: <ListTree size={13} /> },
              { key: 'TIKTOK', label: 'TikTok Ads', count: 8, icon: <Play size={13} /> },
              { key: 'SPOTIFY', label: 'Spotify Ads', count: 10, icon: <Headphones size={13} /> }
            ].map(tab => {
              const active = selectedChannel === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedChannel(tab.key as any)}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: active ? '#0F172A' : '#F1F5F9',
                    color: active ? '#FFFFFF' : '#475569',
                    border: active ? '1px solid #0F172A' : '1px solid #CBD5E1',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: "var(--disk-text-muted)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar campanha, evento ou ID..."
              style={{
                width: '100%',
                height: '34px',
                padding: '0 10px 0 32px',
                fontSize: '12px',
                background: "var(--disk-bg-muted)",
                border: "1px solid var(--disk-border-default)",
                borderRadius: '6px',
                color: "var(--disk-text-primary)",
                outline: 'none'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '9px',
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: "var(--disk-text-muted)"
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', paddingTop: '8px', borderTop: "1px solid var(--disk-border-default)" }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: "var(--disk-text-muted)", marginRight: '4px' }}>Status:</span>
          {[
            { key: 'ALL', label: 'Todos os Status' },
            { key: 'ACTIVE_DELIVERING', label: '🟢 Entregando' },
            { key: 'ACTIVE_NO_DELIVERY', label: '🟡 Sem Entrega' },
            { key: 'PENDING_REVIEW', label: '🔵 Em Análise' },
            { key: 'REJECTED', label: '🔴 Com Problemas' },
            { key: 'PAUSED', label: '⏸️ Pausadas' }
          ].map(st => {
            const active = selectedStatus === st.key
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setSelectedStatus(st.key as any)}
                style={{
                  height: '26px',
                  padding: '0 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: active ? 800 : 600,
                  cursor: 'pointer',
                  background: active ? '#2563EB' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#475569',
                  border: active ? '1px solid #2563EB' : '1px solid #E2E8F0',
                  transition: 'all 0.15s ease'
                }}
              >
                {st.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Campaigns Table */}
      <div
        style={{
          background: "var(--disk-bg-surface)",
          border: "1px solid var(--disk-border-default)",
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            background: "var(--disk-bg-muted)",
            borderBottom: "1px solid var(--disk-border-default)",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)" }}>
            {filteredCampaigns.length} campanhas monitoradas
          </span>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>
            Telemetria direta das APIs Graph, Google Ads, TikTok e Spotify v3
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: "var(--disk-bg-muted)", borderBottom: "1px solid var(--disk-border-default)", color: "var(--disk-text-muted)", textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Canal</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Campanha & Evento</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status Plataforma</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Status Real (Entrega)</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Impressões 6h</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Cliques</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>Gasto 6h</th>
                <th style={{ padding: '10px 14px', fontWeight: 700 }}>Diagnóstico / Causa</th>
                <th style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map(c => {
                const badge = deliveryBadgeStyle(c.deliveryStatus)
                const chBadge = channelBadgeStyle(c.channel)
                const isItemSyncing = syncingId === c.id

                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid var(--disk-border-default)",
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Canal */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          ...chBadge
                        }}
                      >
                        {channelIcon(c.channel)}
                        {c.channel}
                      </span>
                    </td>

                    {/* Campanha & Evento */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <strong style={{ display: 'block', color: "var(--disk-text-primary)", fontSize: '13px' }}>
                        {c.campaignName}
                      </strong>
                      <small style={{ color: "var(--disk-text-muted)" }}>
                        {c.eventName} • <code>{c.externalCampaignId}</code>
                      </small>
                    </td>

                    {/* Status Plataforma */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: "var(--disk-bg-muted)",
                          color: "var(--disk-text-secondary)"
                        }}
                      >
                        {c.platformStatusLabelPtBr}
                      </span>
                    </td>

                    {/* Status Real de Entrega */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: badge.background,
                          color: badge.color,
                          border: badge.border
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: badge.dot
                          }}
                        />
                        {c.deliveryMeta.label}
                      </span>
                    </td>

                    {/* Impressões 6h */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <strong style={{ color: c.impressionsLast6h > 0 ? '#0F172A' : '#94A3B8' }}>
                        {c.impressionsLast6h.toLocaleString('pt-BR')}
                      </strong>
                    </td>

                    {/* Cliques */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <strong style={{ color: c.clicksLast6h > 0 ? '#0F172A' : '#94A3B8' }}>
                        {c.clicksLast6h.toLocaleString('pt-BR')}
                      </strong>
                    </td>

                    {/* Gasto 6h */}
                    <td style={{ padding: '12px 14px', textAlign: 'right', verticalAlign: 'middle' }}>
                      <strong style={{ color: c.spendLast6hCents > 0 ? '#15803D' : '#94A3B8' }}>
                        {formatBrl(c.spendLast6hCents)}
                      </strong>
                    </td>

                    {/* Diagnóstico / Causa */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', maxWidth: '280px' }}>
                      {c.issueReason ? (
                        <div style={{ fontSize: '11px', color: "var(--disk-color-warning-text)", display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                          <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ lineHeight: '1.3' }}>{c.issueReason}</span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} />
                          <span>Entrega contínua e normal</span>
                        </div>
                      )}
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDiagnostic(c)}
                          title="Ver Diagnóstico Automatizado de Causa-Raiz (Fase 28.13.2)"
                          style={{
                            height: '28px',
                            padding: '0 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: "var(--disk-color-info-subtle)",
                            color: '#2563EB',
                            border: "1px solid var(--disk-color-info-border)",
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Sparkles size={12} />
                          <span>Diagnóstico</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSyncSingle(c)}
                          disabled={isItemSyncing}
                          title="Sincronizar telemetria desta campanha agora"
                          style={{
                            height: '28px',
                            width: '28px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: "var(--disk-bg-muted)",
                            color: "var(--disk-text-secondary)",
                            border: "1px solid var(--disk-border-default)",
                            borderRadius: '6px',
                            cursor: isItemSyncing ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <RefreshCw size={12} className={isItemSyncing ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Fase 28.13.2 — Root Cause Diagnostic Drawer */}
      {selectedDiagnostic && (
        <div
          className="diagnostic-modal-backdrop"
          onClick={() => setSelectedDiagnostic(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <aside
            onClick={e => e.stopPropagation()}
            style={{
              width: '560px',
              maxWidth: '90vw',
              height: '100%',
              background: "var(--disk-bg-surface)",
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              padding: '24px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '16px' }}>
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#2563EB',
                    background: "var(--disk-color-info-subtle)",
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  DIAGNÓSTICO AUTOMATIZADO · FASE 28.13.2
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: '18px', fontWeight: 800, color: "var(--disk-text-primary)" }}>
                  {selectedDiagnostic.campaignName}
                </h3>
                <small style={{ color: "var(--disk-text-muted)" }}>
                  Canal: <b>{selectedDiagnostic.channel}</b> • Evento: <b>{selectedDiagnostic.eventName}</b>
                </small>
              </div>

              <button
                onClick={() => setSelectedDiagnostic(null)}
                style={{
                  background: 'none',
                  border: 0,
                  fontSize: '18px',
                  color: "var(--disk-text-muted)",
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Diagnostic Status Card */}
            <div
              style={{
                background: selectedDiagnostic.deliveryStatus === 'ACTIVE_DELIVERING' ? '#F0FDF4' : '#FFFBEB',
                border: `1px solid ${selectedDiagnostic.deliveryStatus === 'ACTIVE_DELIVERING' ? '#BBF7D0' : '#FDE68A'}`,
                borderRadius: '8px',
                padding: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: "var(--disk-text-primary)" }}>
                  Avaliação da Telemetria:
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    ...deliveryBadgeStyle(selectedDiagnostic.deliveryStatus)
                  }}
                >
                  {selectedDiagnostic.deliveryMeta.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: "var(--disk-text-secondary)" }}>
                {selectedDiagnostic.issueReason || 'A campanha possui entrega ativa e contínua, com telemetria confirmada na plataforma oficial.'}
              </p>
            </div>

            {/* Why This Happened & Step-by-Step Resolution */}
            <div style={{ background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '14px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, color: "var(--disk-text-primary)" }}>
                📋 Análise de Causa-Raiz & Ação Sugerida
              </h4>

              {selectedDiagnostic.deliveryStatus === 'ACTIVE_NO_DELIVERY' && (
                <div style={{ fontSize: '12px', color: "var(--disk-text-secondary)", display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>
                    <b>Motivo identificado:</b> A campanha está habilitada na plataforma externa, mas nenhuma impressão foi registrada nas últimas 6 horas.
                  </p>
                  <div style={{ background: "var(--disk-bg-surface)", padding: '10px', borderRadius: '6px', border: "1px solid var(--disk-border-default)" }}>
                    <strong style={{ color: "var(--disk-color-warning-text)", display: 'block', marginBottom: '4px' }}>Como resolver:</strong>
                    <ol style={{ margin: 0, paddingLeft: '18px' }}>
                      <li>Verifique se o lance de lance mínimo (CPC/CPA) do leilão foi atingido.</li>
                      <li>Confirme se o saldo pré-pago ou limite de crédito da conta foi esgotado.</li>
                      <li>No caso de Meta Ads, certifique-se de que os Conjuntos de Anúncios (Ad Sets) não estão pausados.</li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedDiagnostic.deliveryStatus === 'REJECTED' && (
                <div style={{ fontSize: '12px', color: "var(--disk-text-secondary)", display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>
                    <b>Motivo identificado:</b> O anúncio ou criativo foi reprovado pela política de publicidade da plataforma parceira.
                  </p>
                  <div style={{ background: "var(--disk-bg-surface)", padding: '10px', borderRadius: '6px', border: "1px solid var(--disk-border-default)" }}>
                    <strong style={{ color: "var(--disk-color-danger-text)", display: 'block', marginBottom: '4px' }}>Como resolver:</strong>
                    <ol style={{ margin: 0, paddingLeft: '18px' }}>
                      <li>Substitua a imagem ou áudio do anúncio adequando aos padrões da plataforma.</li>
                      <li>Solicite reanálise no painel de moderação da ferramenta (Meta / Google / Spotify).</li>
                    </ol>
                  </div>
                </div>
              )}

              {selectedDiagnostic.deliveryStatus === 'PENDING_REVIEW' && (
                <div style={{ fontSize: '12px', color: "var(--disk-text-secondary)", display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0 }}>
                    <b>Motivo identificado:</b> O anúncio está na fila de moderação padrão.
                  </p>
                  <div style={{ background: "var(--disk-bg-surface)", padding: '10px', borderRadius: '6px', border: "1px solid var(--disk-border-default)" }}>
                    <span style={{ color: "var(--disk-color-info-text)" }}>Tempo médio de espera: entre 30 e 90 minutos para aprovação.</span>
                  </div>
                </div>
              )}

              {selectedDiagnostic.deliveryStatus === 'ACTIVE_DELIVERING' && (
                <div style={{ fontSize: '12px', color: "var(--disk-color-success-text)" }}>
                  Campanha funcionando com excelência. ROAS atual: <b>{selectedDiagnostic.roas || '5.5'}x</b>. Nenhuma ação corretiva necessária.
                </div>
              )}
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>Impressões (6h)</span>
                <strong style={{ display: 'block', fontSize: '16px', color: "var(--disk-text-primary)" }}>{selectedDiagnostic.impressionsLast6h.toLocaleString('pt-BR')}</strong>
              </div>
              <div style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>Gasto (6h)</span>
                <strong style={{ display: 'block', fontSize: '16px', color: "var(--disk-color-success-text)" }}>{formatBrl(selectedDiagnostic.spendLast6hCents)}</strong>
              </div>
            </div>

            {/* Drawer Actions */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSelectedDiagnostic(null)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: "var(--disk-bg-muted)",
                  color: "var(--disk-text-secondary)",
                  border: "1px solid var(--disk-border-default)",
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => handleSyncSingle(selectedDiagnostic)}
                style={{
                  height: '34px',
                  padding: '0 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 0,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={13} />
                <span>Sincronizar Novamente</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
