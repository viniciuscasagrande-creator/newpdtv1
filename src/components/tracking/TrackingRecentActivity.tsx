import React, { useState, useEffect } from 'react'
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Zap,
  RotateCcw,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Layers
} from 'lucide-react'
import {
  getTrackingQueue,
  retryTrackingDispatch,
  cancelTrackingDispatch,
  triggerTrackingWorkerTick,
  type TrackingDispatchItem
} from '../../services/api'

type ActivityItem = {
  id: number
  eventName: string
  status: string
  responseCode: number | null
  message: string | null
  createdAt: string
  integrationName: string
  provider: string
}

type Props = {
  activity: ActivityItem[]
  eventId?: number
  outboxStats?: {
    queued: number
    processing: number
    retrying: number
    completed: number
    deadLetter: number
    circuitBreakers?: Record<string, any>
  }
  notify?: (m: string) => void
  onRefresh?: () => void
}

export default function TrackingRecentActivity({
  activity,
  eventId,
  outboxStats,
  notify,
  onRefresh
}: Props) {
  const [subTab, setSubTab] = useState<'outbox' | 'telemetry'>('outbox')
  const [logFilter, setLogFilter] = useState<'all' | 'ok' | 'error'>('all')
  const [queueFilter, setQueueFilter] = useState<'all' | 'queued' | 'retrying' | 'dead_letter' | 'completed' | 'cancelled'>('all')

  const [queueItems, setQueueItems] = useState<TrackingDispatchItem[]>([])
  const [loadingQueue, setLoadingQueue] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<number | null>(null)
  const [runningTick, setRunningTick] = useState(false)

  const loadQueue = async () => {
    setLoadingQueue(true)
    try {
      const items = await getTrackingQueue({
        eventId,
        status: queueFilter === 'all' ? undefined : queueFilter,
        limit: 50
      })
      setQueueItems(items)
    } catch {
      // Falha silenciosa
    } finally {
      setLoadingQueue(false)
    }
  }

  useEffect(() => {
    if (subTab === 'outbox') {
      loadQueue()
    }
  }, [subTab, queueFilter, eventId])

  const handleRetry = async (dispatchId: number) => {
    setActionInProgress(dispatchId)
    try {
      await retryTrackingDispatch(dispatchId)
      if (notify) notify('Disparo agendado para reprocessamento imediato!')
      await loadQueue()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao reprocessar disparo.')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleCancel = async (dispatchId: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar este disparo de conversão?')) return
    setActionInProgress(dispatchId)
    try {
      await cancelTrackingDispatch(dispatchId, 'Cancelado pelo operador no painel')
      if (notify) notify('Disparo cancelado com sucesso.')
      await loadQueue()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      if (notify) notify(err.message || 'Falha ao cancelar disparo.')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRunTickNow = async () => {
    setRunningTick(true)
    try {
      const result = await triggerTrackingWorkerTick()
      if (notify) {
        notify(`Motor assíncrono executado: ${result.processed} disparo(s) avaliados.`)
      }
      await loadQueue()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      if (notify) notify(err.message || 'Erro ao acionar ciclo do motor.')
    } finally {
      setRunningTick(false)
    }
  }

  const filteredLogs = activity.filter(item => {
    if (logFilter === 'ok') return item.status === 'ok'
    if (logFilter === 'error') return item.status !== 'ok'
    return true
  })

  const circuitBreakers = outboxStats?.circuitBreakers || {}

  const getStatusBadge = (item: TrackingDispatchItem) => {
    switch (item.status) {
      case 'queued':
        return <span className="status-badge yellow" style={{ fontSize: '11px' }}>Na Fila</span>
      case 'processing':
        return <span className="status-badge blue" style={{ fontSize: '11px' }}>Processando</span>
      case 'retrying':
        return (
          <span className="status-badge orange" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <RotateCcw size={10} /> Tentativa {item.attempts}/{item.maxAttempts}
          </span>
        )
      case 'completed':
      case 'ok':
        return <span className="status-badge green" style={{ fontSize: '11px' }}>Entregue</span>
      case 'failed_permanently':
      case 'erro':
        return (
          <span className="status-badge red" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <AlertTriangle size={10} /> Falha Permanente (Dead Letter)
          </span>
        )
      case 'cancelled':
        return <span className="status-badge gray" style={{ fontSize: '11px' }}>Cancelado</span>
      case 'dry_run':
        return <span className="status-badge blue" style={{ fontSize: '11px' }}>Simulação (Dry Run)</span>
      default:
        return <span className="status-badge gray" style={{ fontSize: '11px' }}>{item.status}</span>
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
            Fluxo de Disparos & Telemetria
          </h4>
          <small style={{ color: "var(--disk-text-muted)" }}>
            Motor assíncrono de conversões com Outbox, Circuit Breakers e Dead Letter Queue.
          </small>
        </div>
      </div>

      {/* Top Selector: Fila Assíncrona vs Telemetria */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${subTab === 'outbox' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '13px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setSubTab('outbox')}
          >
            <Layers size={14} /> Fila Assíncrona & Outbox
            {outboxStats && (outboxStats.queued + outboxStats.retrying + outboxStats.deadLetter) > 0 && (
              <span
                style={{
                  background: outboxStats.deadLetter > 0 ? '#ef4444' : '#2563eb',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}
              >
                {outboxStats.queued + outboxStats.retrying + outboxStats.deadLetter}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`btn ${subTab === 'telemetry' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '13px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setSubTab('telemetry')}
          >
            <Activity size={14} /> Histórico de Telemetria ({activity.length})
          </button>
        </div>

        {subTab === 'outbox' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={loadQueue}
              disabled={loadingQueue}
            >
              <RefreshCw size={13} className={loadingQueue ? 'spin' : ''} /> Atualizar
            </button>

            <button
              type="button"
              className="btn primary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', background: "var(--disk-legacy-dark-surface, #0f172a)" }}
              onClick={handleRunTickNow}
              disabled={runningTick}
              title="Processa lotes pendentes imediatamente via worker assíncrono"
            >
              <Zap size={13} style={{ color: '#38bdf8' }} />
              {runningTick ? 'Processando...' : 'Processar Fila Agora'}
            </button>
          </div>
        )}
      </div>

      {/* Subtab 1: Fila Assíncrona & Outbox */}
      {subTab === 'outbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Métricas da Fila */}
          {outboxStats && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}
            >
              <div style={{ background: "var(--disk-bg-surface)", padding: '12px 14px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 600 }}>Na Fila</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: "var(--disk-text-primary)", marginTop: '2px' }}>
                  {outboxStats.queued}
                </div>
              </div>

              <div style={{ background: "var(--disk-bg-surface)", padding: '12px 14px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 600 }}>Em Processamento</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb', marginTop: '2px' }}>
                  {outboxStats.processing}
                </div>
              </div>

              <div style={{ background: "var(--disk-bg-surface)", padding: '12px 14px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 600 }}>Reprocessando (Retry)</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                  {outboxStats.retrying}
                </div>
              </div>

              <div style={{ background: "var(--disk-bg-surface)", padding: '12px 14px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 600 }}>Entregues com Sucesso</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                  {outboxStats.completed}
                </div>
              </div>

              <div
                style={{
                  background: outboxStats.deadLetter > 0 ? '#fef2f2' : '#ffffff',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${outboxStats.deadLetter > 0 ? '#fca5a5' : '#e2e8f0'}`
                }}
              >
                <div style={{ fontSize: '11px', color: outboxStats.deadLetter > 0 ? '#b91c1c' : '#64748b', fontWeight: 600 }}>
                  Dead Letter (Esgotados)
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: outboxStats.deadLetter > 0 ? '#dc2626' : '#64748b', marginTop: '2px' }}>
                  {outboxStats.deadLetter}
                </div>
              </div>
            </div>
          )}

          {/* Circuit Breakers das Plataformas */}
          {Object.keys(circuitBreakers).length > 0 && (
            <div
              style={{
                background: "var(--disk-bg-muted)",
                border: "1px solid var(--disk-border-default)",
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#2563eb' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                    Circuit Breakers por Provedor
                  </div>
                  <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>
                    Proteção de backoff isolada: indisponibilidade em uma plataforma não afeta as demais.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {Object.entries(circuitBreakers).map(([pName, cb]: [string, any]) => {
                  const isOpen = cb.state === 'OPEN'
                  const isHalfOpen = cb.state === 'HALF_OPEN'
                  const stateLabel = isOpen ? 'Proteção Ativa' : isHalfOpen ? 'Testando' : 'Operacional'
                  const stateColor = isOpen ? '#ef4444' : isHalfOpen ? '#f59e0b' : '#10b981'

                  return (
                    <div
                      key={pName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        background: "var(--disk-bg-surface)",
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: "1px solid var(--disk-border-default)"
                      }}
                    >
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: stateColor
                        }}
                      />
                      <b style={{ textTransform: 'capitalize' }}>{pName}</b>:
                      <span style={{ color: stateColor, fontWeight: 600 }}>{stateLabel}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Filtros da Fila */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn ${queueFilter === 'all' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setQueueFilter('all')}
              >
                Todos
              </button>
              <button
                type="button"
                className={`btn ${queueFilter === 'queued' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setQueueFilter('queued')}
              >
                Na Fila
              </button>
              <button
                type="button"
                className={`btn ${queueFilter === 'retrying' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setQueueFilter('retrying')}
              >
                Reprocessando
              </button>
              <button
                type="button"
                className={`btn ${queueFilter === 'dead_letter' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px', color: queueFilter === 'dead_letter' ? '#fff' : '#b91c1c' }}
                onClick={() => setQueueFilter('dead_letter')}
              >
                Dead Letter
              </button>
              <button
                type="button"
                className={`btn ${queueFilter === 'completed' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setQueueFilter('completed')}
              >
                Entregues
              </button>
              <button
                type="button"
                className={`btn ${queueFilter === 'cancelled' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setQueueFilter('cancelled')}
              >
                Cancelados
              </button>
            </div>
          </div>

          {/* Lista de Itens da Fila */}
          {loadingQueue ? (
            <div style={{ padding: '36px', textAlign: 'center', color: "var(--disk-text-muted)" }}>
              Carregando registros da fila de conversão...
            </div>
          ) : queueItems.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: "var(--disk-text-muted)", background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
              Nenhum disparo pendente nesta visualização.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queueItems.map(item => {
                const isFailed = item.status === 'failed_permanently' || item.status === 'erro'
                const isRetrying = item.status === 'retrying'
                const isQueued = item.status === 'queued'
                const date = new Date(item.createdAt)
                const nextDate = item.nextAttemptAt ? new Date(item.nextAttemptAt) : null

                return (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--disk-bg-surface)",
                      border: `1px solid ${isFailed ? '#fca5a5' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: '240px', flex: 1 }}>
                      <div style={{ marginTop: '2px' }}>
                        {getStatusBadge(item)}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <b style={{ fontSize: '13px', color: "var(--disk-text-primary)" }}>
                            {item.providerEventName}
                          </b>
                          <span className="status-badge blue" style={{ fontSize: '10px' }}>
                            {item.integration?.name || item.provider.toUpperCase()}
                          </span>
                          {item.priority === 'HIGH' && (
                            <span className="status-badge purple" style={{ fontSize: '10px' }}>
                              Alta Prioridade
                            </span>
                          )}
                        </div>

                        <small style={{ display: 'block', color: "var(--disk-text-muted)", marginTop: '4px' }}>
                          {item.errorMessageSanitized || item.responseMessage || 'Evento registrado com sucesso.'}
                        </small>

                        {isRetrying && nextDate && (
                          <div style={{ fontSize: '11px', color: '#d97706', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> Próxima tentativa programada para: {nextDate.toLocaleTimeString('pt-BR')} ({nextDate.toLocaleDateString('pt-BR')})
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ textAlign: 'right', fontSize: '11px', color: "var(--disk-text-muted)", marginRight: '6px' }}>
                        <div>{date.toLocaleTimeString('pt-BR')}</div>
                        <div>{date.toLocaleDateString('pt-BR')}</div>
                      </div>

                      {(isFailed || isRetrying) && (
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          disabled={actionInProgress === item.id}
                          onClick={() => handleRetry(item.id)}
                        >
                          <RotateCcw size={11} />
                          {actionInProgress === item.id ? 'Reenviando...' : 'Reprocessar'}
                        </button>
                      )}

                      {(isQueued || isRetrying) && (
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ fontSize: '11px', padding: '4px 8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                          disabled={actionInProgress === item.id}
                          onClick={() => handleCancel(item.id)}
                          title="Cancelar envio"
                        >
                          <XCircle size={11} /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Telemetria de Disparos (Legado/Histórico) */}
      {subTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                Telemetria de Comunicação Externa
              </h4>
              <small style={{ color: "var(--disk-text-muted)" }}>
                Registros técnicos sanitizados das chamadas efetuadas para Meta, Google, TikTok e Spotify.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`btn ${logFilter === 'all' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setLogFilter('all')}
              >
                Todos ({activity.length})
              </button>
              <button
                type="button"
                className={`btn ${logFilter === 'ok' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setLogFilter('ok')}
              >
                Sucessos
              </button>
              <button
                type="button"
                className={`btn ${logFilter === 'error' ? 'primary' : 'secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={() => setLogFilter('error')}
              >
                Falhas
              </button>
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: "var(--disk-text-muted)", background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
              Nenhum registro de telemetria encontrado.
            </div>
          ) : (
            <div className="tracking-activity-timeline">
              {filteredLogs.map(item => {
                const isOk = item.status === 'ok'
                const date = new Date(item.createdAt)

                return (
                  <div className="tracking-activity-item" key={item.id}>
                    <div className="tracking-activity-item-left">
                      {isOk ? (
                        <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                      ) : (
                        <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <b>{item.eventName}</b>
                          <span className="status-badge blue" style={{ fontSize: '10px' }}>
                            {item.integrationName}
                          </span>
                        </div>
                        <small style={{ display: 'block', color: "var(--disk-text-muted)", marginTop: '2px' }}>
                          {item.message || (isOk ? 'Disparo aceito pelo provedor.' : 'Erro de comunicação.')}
                        </small>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className={`status-badge ${isOk ? 'green' : 'red'}`} style={{ fontSize: '10px' }}>
                        {isOk ? 'Aceito (200)' : `Erro ${item.responseCode || ''}`}
                      </span>
                      <div style={{ fontSize: '11px', color: "var(--disk-text-muted)", marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <Clock size={11} /> {date.toLocaleTimeString('pt-BR')} · {date.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
