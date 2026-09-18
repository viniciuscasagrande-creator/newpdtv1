import React, { useState } from 'react'
import {
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Activity,
  Send,
  Trash2,
  ShieldCheck,
  Star,
  Check,
  Power
} from 'lucide-react'
import type { TrackingIntegration, TrackingIntegrationEvent, TrackingDeliveryLog } from '../../services/api'
import {
  friendlyIntegrationTypeLabel,
  TRACKING_MODE_LABELS,
  type TrackingMode
} from '../../domain/marketing/integrations'

type Props = {
  integration: TrackingIntegration
  assignment?: TrackingIntegrationEvent
  initialTab?: string
  logs?: TrackingDeliveryLog[]
  onClose: () => void
  onSaveRules: (assignment: TrackingIntegrationEvent, rules: Array<{ eventName: string; enabled: boolean; browserEnabled: boolean; serverEnabled: boolean }>) => Promise<void>
  onTest: (integration: TrackingIntegration) => Promise<void>
  onSetPrimary: (integrationId: number) => Promise<void>
  onToggleAssignmentEnabled: (assignment: TrackingIntegrationEvent, enabled: boolean) => Promise<void>
  onUnassign: (integrationId: number) => Promise<void>
  notify: (msg: string) => void
}

const STAGES = [
  { key: 'PageView', label: 'Visualização de página' },
  { key: 'ViewContent', label: 'Visualização do evento' },
  { key: 'SelectTicket', label: 'Ingresso selecionado' },
  { key: 'AddToCart', label: 'Adicionar ao carrinho' },
  { key: 'InitiateCheckout', label: 'Iniciar checkout' },
  { key: 'Purchase', label: 'Compra aprovada' },
  { key: 'Refund', label: 'Estorno' }
]

export default function TrackingIntegrationDrawer({
  integration,
  assignment,
  initialTab = 'rules',
  logs = [],
  onClose,
  onSaveRules,
  onTest,
  onSetPrimary,
  onToggleAssignmentEnabled,
  onUnassign,
  notify
}: Props) {
  const [tab, setTab] = useState<'overview' | 'rules' | 'health' | 'logs'>(initialTab as any)
  const [busy, setBusy] = useState(false)

  // Local state for rules to allow batch editing and save
  const [rules, setRules] = useState(() => {
    const existing = assignment?.rules || []
    return STAGES.map(stage => {
      const found = existing.find(r => r.eventName.toLowerCase() === stage.key.toLowerCase())
      return {
        eventName: stage.key,
        enabled: found ? found.enabled : true,
        browserEnabled: found ? found.browserEnabled : true,
        serverEnabled: found ? found.serverEnabled : true
      }
    })
  })
  const [dirty, setDirty] = useState(false)

  const handleToggle = (stageKey: string, field: 'enabled' | 'browserEnabled' | 'serverEnabled', val: boolean) => {
    setRules(prev =>
      prev.map(r => (r.eventName === stageKey ? { ...r, [field]: val } : r))
    )
    setDirty(true)
  }

  const applyPreset = (preset: 'full' | 'conversion') => {
    if (preset === 'full') {
      setRules(prev => prev.map(r => ({ ...r, enabled: true, browserEnabled: true, serverEnabled: true })))
    } else if (preset === 'conversion') {
      setRules(prev =>
        prev.map(r => ({
          ...r,
          enabled: r.eventName === 'Purchase',
          browserEnabled: r.eventName === 'Purchase',
          serverEnabled: r.eventName === 'Purchase'
        }))
      )
    }
    setDirty(true)
    notify(`Preset "${preset === 'full' ? 'Rastreamento Completo' : 'Somente Conversão'}" aplicado. Salve para confirmar.`)
  }

  const handleSave = async () => {
    if (!assignment) return
    setBusy(true)
    try {
      await onSaveRules(assignment, rules)
      setDirty(false)
      notify('Regras de conversão salvas com sucesso.')
    } catch (e: any) {
      notify(e.message || 'Erro ao salvar regras.')
    } finally {
      setBusy(false)
    }
  }

  const isAssigned = Boolean(assignment)
  const isAssignmentEnabled = assignment ? assignment.enabled : false

  return (
    <div className="tracking-drawer-backdrop" onClick={onClose}>
      <div className="tracking-drawer-panel" onClick={e => e.stopPropagation()}>
        <div className="tracking-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="integration-icon">
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                {integration.name}
              </h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '3px' }}>
                <span style={{ fontSize: '12px', color: "var(--disk-text-muted)" }}>
                  ID: ••••••{integration.pixelId ? integration.pixelId.slice(-4) : '****'}
                </span>
                <span className={`status-badge ${integration.status === 'ativo' ? 'green' : 'gray'}`}>
                  {integration.status === 'ativo' ? 'Ativo' : 'Desativado'}
                </span>
                {assignment?.isPrimary && (
                  <span className="status-badge green" style={{ fontSize: '10px' }}>
                    Principal
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn icon-btn"
            onClick={onClose}
            aria-label="Fechar painel"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} style={{ color: "var(--disk-text-muted)" }} />
          </button>
        </div>

        <div className="tracking-tab-nav" style={{ padding: '0 24px', background: "var(--disk-bg-muted)" }}>
          <button
            className={`tracking-tab-btn ${tab === 'rules' ? 'active' : ''}`}
            onClick={() => setTab('rules')}
          >
            Eventos e Regras
          </button>
          <button
            className={`tracking-tab-btn ${tab === 'overview' ? 'active' : ''}`}
            onClick={() => setTab('overview')}
          >
            Visão Geral
          </button>
          <button
            className={`tracking-tab-btn ${tab === 'health' ? 'active' : ''}`}
            onClick={() => setTab('health')}
          >
            Saúde & Teste
          </button>
          <button
            className={`tracking-tab-btn ${tab === 'logs' ? 'active' : ''}`}
            onClick={() => setTab('logs')}
          >
            Logs ({logs.length})
          </button>
        </div>

        <div className="tracking-drawer-body">
          {tab === 'rules' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isAssigned && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '10px' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)", display: 'block' }}>
                      Integração ativa neste evento
                    </strong>
                    <small style={{ color: "var(--disk-text-muted)" }}>
                      Desligar interrompe o envio de sinais apenas para este evento, sem excluir a integração.
                    </small>
                  </div>
                  <button
                    type="button"
                    className={`btn ${isAssignmentEnabled ? 'primary' : 'secondary'}`}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                    onClick={() => assignment && onToggleAssignmentEnabled(assignment, !isAssignmentEnabled)}
                  >
                    <Power size={13} /> {isAssignmentEnabled ? 'Habilitada' : 'Desabilitada'}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: "var(--disk-text-secondary)" }}>
                  Modelos Rápidos (Presets):
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => applyPreset('full')}
                  >
                    Rastreamento Completo
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                    onClick={() => applyPreset('conversion')}
                  >
                    Somente Compra
                  </button>
                </div>
              </div>

              {dirty && (
                <div style={{ padding: '10px 14px', background: "var(--disk-color-warning-subtle)", border: "1px solid var(--disk-color-warning-border)", borderRadius: '8px', color: "var(--disk-color-warning-text)", fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Você possui alterações não salvas.</span>
                  <button
                    className="btn primary"
                    style={{ padding: '4px 12px', fontSize: '11px' }}
                    onClick={handleSave}
                    disabled={busy}
                  >
                    Salvar Alterações
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rules.map(r => {
                  const stageMeta = STAGES.find(s => s.key === r.eventName)
                  return (
                    <div
                      key={r.eventName}
                      style={{
                        padding: '12px 14px',
                        background: "var(--disk-bg-surface)",
                        border: "1px solid var(--disk-border-default)",
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={e => handleToggle(r.eventName, 'enabled', e.target.checked)}
                          id={`toggle-${r.eventName}`}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor={`toggle-${r.eventName}`} style={{ fontSize: '13px', fontWeight: 600, color: "var(--disk-text-primary)", cursor: 'pointer' }}>
                          {stageMeta?.label || r.eventName}
                        </label>
                      </div>

                      {r.enabled && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: "var(--disk-text-secondary)" }}>
                            <input
                              type="checkbox"
                              checked={r.browserEnabled}
                              onChange={e => handleToggle(r.eventName, 'browserEnabled', e.target.checked)}
                            />
                            Navegador
                          </label>
                          <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: "var(--disk-text-secondary)" }}>
                            <input
                              type="checkbox"
                              checked={r.serverEnabled}
                              onChange={e => handleToggle(r.eventName, 'serverEnabled', e.target.checked)}
                            />
                            Servidor (CAPI)
                          </label>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn primary"
                  disabled={!dirty || busy}
                  onClick={handleSave}
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          )}

          {tab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', fontSize: '13px' }}>
                <span style={{ color: "var(--disk-text-muted)" }}>Plataforma:</span>
                <strong style={{ textTransform: 'capitalize' }}>{integration.provider}</strong>

                <span style={{ color: "var(--disk-text-muted)" }}>Tipo da Integração:</span>
                <span>{friendlyIntegrationTypeLabel(integration.integrationType)}</span>

                <span style={{ color: "var(--disk-text-muted)" }}>Pixel ID:</span>
                <code>{integration.pixelId}</code>

                <span style={{ color: "var(--disk-text-muted)" }}>Token Server-Side:</span>
                <span>{integration.apiTokenMasked ? `Configurado (${integration.apiTokenMasked})` : 'Não configurado'}</span>

                <span style={{ color: "var(--disk-text-muted)" }}>Modo de Disparo:</span>
                <span>{TRACKING_MODE_LABELS[assignment?.trackingMode || 'HYBRID']?.label || 'Híbrido'}</span>

                <span style={{ color: "var(--disk-text-muted)" }}>Pixel Principal:</span>
                <span>{assignment?.isPrimary ? 'Sim, é o pixel principal deste evento.' : 'Não'}</span>

                <span style={{ color: "var(--disk-text-muted)" }}>Cadastrado em:</span>
                <span>{new Date(integration.createdAt).toLocaleString('pt-BR')}</span>
              </div>

              <div style={{ borderTop: "1px solid var(--disk-border-default)", paddingTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {!assignment?.isPrimary && (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => onSetPrimary(integration.id)}
                    style={{ fontSize: '12px' }}
                  >
                    <Star size={13} /> Definir como Principal
                  </button>
                )}

                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onTest(integration)}
                  style={{ fontSize: '12px' }}
                >
                  <Activity size={13} /> Testar Conexão
                </button>

                {isAssigned && (
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => {
                      if (confirm(`Remover "${integration.name}" deste evento? A integração continuará existindo para os demais eventos.`)) {
                        onUnassign(integration.id)
                      }
                    }}
                    style={{ fontSize: '12px', marginLeft: 'auto' }}
                  >
                    <Trash2 size={13} /> Desvincular do Evento
                  </button>
                )}
              </div>
            </div>
          )}

          {tab === 'health' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {integration.lastTestStatus === 'ok' ? (
                    <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: '#f59e0b' }} />
                  )}
                  <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>
                    {integration.lastTestStatus === 'ok' ? 'Conexão e Autenticação Válidas' : 'Aguardando Teste / Atenção'}
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: "var(--disk-text-muted)" }}>
                  {integration.lastError || 'As credenciais criptografadas AES-256 e o identificador do provedor estão em conformidade.'}
                </p>
                {integration.lastTestAt && (
                  <small style={{ display: 'block', marginTop: '8px', color: "var(--disk-text-muted)" }}>
                    Último teste realizado em: {new Date(integration.lastTestAt).toLocaleString('pt-BR')}
                  </small>
                )}
              </div>

              <button
                type="button"
                className="btn primary"
                onClick={() => onTest(integration)}
                style={{ alignSelf: 'flex-start' }}
              >
                <Activity size={14} /> Executar Teste Agora
              </button>
            </div>
          )}

          {tab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {logs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: "var(--disk-text-muted)", background: "var(--disk-bg-muted)", borderRadius: '8px' }}>
                  Nenhum log registrado recentemente para esta integração.
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '10px 14px',
                      background: "var(--disk-bg-surface)",
                      border: "1px solid var(--disk-border-default)",
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <b style={{ color: "var(--disk-text-primary)", display: 'block' }}>{log.eventName}</b>
                      <span style={{ color: "var(--disk-text-muted)" }}>{log.message || 'Disparo registrado'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`status-badge ${log.status === 'ok' ? 'green' : 'red'}`}>
                        {log.status === 'ok' ? 'Sucesso' : 'Erro'}
                      </span>
                      <small style={{ display: 'block', color: "var(--disk-text-muted)", marginTop: '2px' }}>
                        {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
