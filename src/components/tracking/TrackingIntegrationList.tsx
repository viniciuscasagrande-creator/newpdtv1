import React, { useState, useMemo } from 'react'
import {
  Sliders,
  Star,
  Activity,
  Trash2,
  Settings,
  CheckCircle2,
  AlertCircle,
  Power,
  ShieldCheck,
  Search
} from 'lucide-react'
import type { TrackingIntegration, TrackingIntegrationEvent } from '../../services/api'
import {
  friendlyIntegrationTypeLabel,
  TRACKING_MODE_LABELS
} from '../../domain/marketing/integrations'

type AssignmentWithIntegration = TrackingIntegrationEvent & { integration: TrackingIntegration }

type Props = {
  assignments: AssignmentWithIntegration[]
  onOpenDrawer: (integration: TrackingIntegration, assignment: TrackingIntegrationEvent, tab?: string) => void
  onTest: (integration: TrackingIntegration) => Promise<void>
  onSetPrimary: (integrationId: number) => Promise<void>
  onToggleEnabled: (assignment: TrackingIntegrationEvent, enabled: boolean) => Promise<void>
  onUnassign: (integrationId: number) => Promise<void>
}

export default function TrackingIntegrationList({
  assignments,
  onOpenDrawer,
  onTest,
  onSetPrimary,
  onToggleEnabled,
  onUnassign
}: Props) {
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      if (providerFilter !== 'all' && a.integration.provider.toLowerCase() !== providerFilter) return false
      if (statusFilter === 'active' && (!a.enabled || a.integration.status !== 'ativo')) return false
      if (statusFilter === 'disabled' && (a.enabled && a.integration.status === 'ativo')) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          a.integration.name.toLowerCase().includes(q) ||
          a.integration.provider.toLowerCase().includes(q) ||
          a.integration.pixelId.includes(q)
        )
      }
      return true
    })
  }, [assignments, providerFilter, statusFilter, search])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${providerFilter === 'all' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setProviderFilter('all')}
          >
            Todas ({assignments.length})
          </button>
          <button
            type="button"
            className={`btn ${providerFilter === 'meta' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setProviderFilter('meta')}
          >
            Meta
          </button>
          <button
            type="button"
            className={`btn ${providerFilter === 'google' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setProviderFilter('google')}
          >
            Google
          </button>
          <button
            type="button"
            className={`btn ${providerFilter === 'tiktok' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setProviderFilter('tiktok')}
          >
            TikTok
          </button>
          <button
            type="button"
            className={`btn ${providerFilter === 'spotify' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setProviderFilter('spotify')}
          >
            Spotify
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: "var(--disk-text-muted)" }} />
          <input
            type="text"
            placeholder="Filtrar por nome ou ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '32px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: "var(--disk-text-muted)", background: "var(--disk-bg-surface)", borderRadius: '12px', border: "1px solid var(--disk-border-default)" }}>
          Nenhuma integração encontrada com os filtros selecionados.
        </div>
      ) : (
        <div className="multi-tracking-grid">
          {filtered.map(a => {
            const int = a.integration
            const isHealthy = int.status === 'ativo' && int.lastTestStatus !== 'erro'
            const modeInfo = TRACKING_MODE_LABELS[a.trackingMode || 'HYBRID']

            return (
              <article className="growth-panel integration-card" key={a.id}>
                <div className="integration-card-head">
                  <span className="integration-icon">
                    <Sliders size={20} />
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '15px', color: "var(--disk-text-primary)" }}>{int.name}</strong>
                      {a.isPrimary && (
                        <span className="status-badge green" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          ★ Principal
                        </span>
                      )}
                    </div>
                    <small style={{ color: "var(--disk-text-muted)" }}>
                      {int.provider.toUpperCase()} · {friendlyIntegrationTypeLabel(int.integrationType)}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <span className="status-badge blue" style={{ fontSize: '10px' }}>
                      {modeInfo?.badge || a.trackingMode}
                    </span>
                    <span className={`status-badge ${a.enabled && int.status === 'ativo' ? 'green' : 'gray'}`}>
                      {a.enabled && int.status === 'ativo' ? 'Ativo' : 'Desativado'}
                    </span>
                  </div>
                </div>

                <dl>
                  <div>
                    <dt>Pixel ID</dt>
                    <dd><code>{int.pixelId}</code></dd>
                  </div>
                  <div>
                    <dt>Credencial CAPI</dt>
                    <dd>{int.apiTokenMasked ? `Protegido (${int.apiTokenMasked})` : 'Apenas navegador'}</dd>
                  </div>
                  <div>
                    <dt>Conectividade</dt>
                    <dd>
                      {isHealthy ? (
                        <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Funcionando
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={13} /> Verificar conexão
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="integration-events">
                  <small>Regras ativas no evento ({a.rules?.filter(r => r.enabled).length || 0})</small>
                  <div>
                    {a.rules && a.rules.length > 0 ? (
                      a.rules.filter(r => r.enabled).map(r => (
                        <span key={r.eventName}>
                          {r.eventName}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "var(--disk-text-muted)", fontStyle: 'italic' }}>Regras padrão ativas</span>
                    )}
                  </div>
                </div>

                <div className="editor-actions" style={{ marginTop: 'auto', paddingTop: '12px', borderTop: "1px solid var(--disk-border-default)", display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    onClick={() => onOpenDrawer(int, a, 'rules')}
                  >
                    <Sliders size={13} /> Regras
                  </button>

                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    onClick={() => onTest(int)}
                    title="Testar Conexão"
                  >
                    <Activity size={13} /> Testar
                  </button>

                  {!a.isPrimary && (
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ fontSize: '12px', padding: '6px 10px' }}
                      onClick={() => onSetPrimary(int.id)}
                      title="Definir como Principal"
                    >
                      <Star size={13} /> Tornar Principal
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    onClick={() => onToggleEnabled(a, !a.enabled)}
                    title={a.enabled ? 'Desativar neste evento' : 'Habilitar neste evento'}
                  >
                    <Power size={13} /> {a.enabled ? 'Desativar' : 'Habilitar'}
                  </button>

                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    onClick={() => onOpenDrawer(int, a, 'overview')}
                  >
                    <Settings size={13} /> Detalhes
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
