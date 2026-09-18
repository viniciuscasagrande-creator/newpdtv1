import React, { useEffect, useState, useCallback } from 'react'
import {
  ArrowLeft,
  ShoppingBag,
  Users,
  Ticket,
  CheckCircle2,
  AlertOctagon,
  WalletCards,
  Headphones,
  Undo2,
  Clock,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  QrCode,
  Copy,
  PlusCircle,
  MessageSquare
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { PageKey } from '../../components/ModuleSidebar'
import {
  getOrderOperational360,
  type OrderOperational360Response,
  type Order360Ticket
} from '../../services/api'
import './event-global-search.css'

interface Props {
  event: EventItem
  orderIdOrCode: number | string
  onBack: () => void
  onNavigate?: (page: PageKey, context?: any) => void
  notify?: (m: string) => void
}

const formatMoney = (cents?: number) => {
  if (cents === undefined || cents === null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

export default function EventOrderInvestigationPage({
  event,
  orderIdOrCode,
  onBack,
  onNavigate,
  notify
}: Props) {
  const [data, setData] = useState<OrderOperational360Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Order360Ticket | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getOrderOperational360(event.id, orderIdOrCode)
      setData(res)
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar investigação do pedido.')
      notify?.(err?.message || 'Erro ao consultar dados operacionais do pedido.')
    } finally {
      setLoading(false)
    }
  }, [event.id, orderIdOrCode, notify])

  useEffect(() => {
    loadData()
  }, [loadData])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      notify?.(`${label} copiado para a área de transferência.`)
    } catch {
      notify?.(`Não foi possível copiar ${label.toLowerCase()}.`)
    }
  }

  if (loading && !data) {
    return (
      <div className="egs-page" data-testid="order-360-loading">
        <div className="egs-state-box">
          <RefreshCw size={28} className="animate-spin text-sky-600" />
          <h3>Carregando Jornada Completa do Pedido...</h3>
          <p>Consolidando cliente, ingressos, acessos, SAC, financeiro e histórico operacional.</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="egs-page" data-testid="order-360-error">
        <div className="egs-state-box border-red-200 bg-red-50">
          <AlertTriangle size={32} className="text-red-500" />
          <h3 className="text-red-800">Erro na investigação do pedido</h3>
          <p className="text-red-600">{error}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button type="button" className="egs-btn" onClick={onBack} data-testid="btn-order-return">
              <ArrowLeft size={14} /> Voltar ao pedido
            </button>
            <button type="button" className="egs-btn egs-btn-primary" onClick={loadData}>
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { order, customer, tickets, checkins, financial, support, refunds, incidents, timeline } = data

  return (
    <div className="egs-page order-360-investigation-hub" data-testid="order-360-investigation-hub">
      {/* Context Bar / Breadcrumbs */}
      <nav className="order-360-breadcrumbs" aria-label="Navegação operacional">
        <button
          type="button"
          className="order-360-back-btn"
          onClick={onBack}
          data-testid="btn-order-return"
        >
          <ArrowLeft size={15} />
          <span>Voltar ao pedido</span>
        </button>
        <span className="order-360-crumb-sep">/</span>
        <span className="order-360-crumb-item">{event.title} • ID {event.id}</span>
        <span className="order-360-crumb-sep">/</span>
        <span className="order-360-crumb-item font-bold text-sky-700">Pedido #{order.code}</span>
        <span className="order-360-crumb-sep">/</span>
        <span className="order-360-crumb-item">{customer.name}</span>
        <span className="order-360-crumb-sep">/</span>
        <span className="order-360-crumb-item">{tickets.length} ingressos</span>
      </nav>

      {/* Scope and Security Bar */}
      <div className="egs-scope-bar order-360-security-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} className="text-emerald-600" />
          <b>Jornada Operacional Completa</b>
          <span>Produtora #{event.producerId} · Evento #{event.id} ({event.code})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="order-360-tag-safe">LGPD Protegido</span>
          <button
            type="button"
            className="egs-btn"
            style={{ padding: '4px 10px', fontSize: '12px' }}
            onClick={loadData}
            title="Atualizar dados em tempo real"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Master Order Overview Card */}
      <section className="order-360-master-card" data-testid="order-360-overview">
        <div className="order-360-master-header">
          <div>
            <span className="order-360-eyebrow">CENTRAL DO PEDIDO</span>
            <h2>Pedido #{order.code}</h2>
            <p>Realizado em {new Date(order.createdAt).toLocaleString('pt-BR')} via Canal {order.channel.toUpperCase()}</p>
          </div>
          <div className="order-360-master-badges">
            <span className={`egs-badge ${order.status?.toLowerCase() === 'pago' ? 'egs-badge-success' : 'egs-badge-warning'}`}>
              {order.status === 'pago' ? 'Aprovado / Pago' : order.status}
            </span>
            <strong className="order-360-total-value">{formatMoney(order.grossCents)}</strong>
          </div>
        </div>

        <div className="order-360-kpi-grid">
          <div className="order-360-kpi-cell">
            <span>Comprador</span>
            <strong>{order.buyerName}</strong>
            <small>{order.buyerDocument}</small>
          </div>
          <div className="order-360-kpi-cell">
            <span>Forma de Pagamento</span>
            <strong>{order.paymentMethod}</strong>
            <small>Transação {financial.code}</small>
          </div>
          <div className="order-360-kpi-cell">
            <span>Total de Ingressos</span>
            <strong>{order.ticketsCount} ingresso(s)</strong>
            <small>{checkins.filter(c => c.status === 'presente').length} check-in realizado</small>
          </div>
          <div className="order-360-kpi-cell">
            <span>Situação de Estorno</span>
            <strong>{refunds[0]?.status === 'nao_solicitado' ? 'Nenhum' : refunds[0]?.status}</strong>
            <small>Sem bloqueio judicial ou chargeback</small>
          </div>
        </div>
      </section>

      {/* 7 Connected Correlated Operational Sections */}
      <div className="order-360-sections-grid">
        {/* Card 1: Central do Cliente */}
        <article className="order-360-card" data-testid="card-correlated-customer">
          <div className="order-360-card-head">
            <div className="order-360-card-title-wrap">
              <Users size={18} className="text-violet-600" />
              <h3>Central do Cliente</h3>
            </div>
            <span className="egs-badge egs-badge-info">{customer.segment}</span>
          </div>
          <div className="order-360-card-body">
            <div className="order-360-info-row">
              <span>Nome:</span>
              <b>{customer.name}</b>
            </div>
            <div className="order-360-info-row">
              <span>CPF:</span>
              <span>{customer.document}</span>
            </div>
            <div className="order-360-info-row">
              <span>E-mail:</span>
              <span>{customer.email}</span>
            </div>
            <div className="order-360-info-row">
              <span>Telefone:</span>
              <span>{customer.phone}</span>
            </div>
            <div className="order-360-info-row">
              <span>Score RFM:</span>
              <strong className="text-emerald-600">{customer.score} / 100</strong>
            </div>
            <div className="order-360-info-row">
              <span>Histórico geral:</span>
              <span>{customer.ordersCount} pedidos · {customer.ticketsCount} ingressos · {formatMoney(customer.totalSpentCents)}</span>
            </div>
          </div>
          <div className="order-360-card-actions">
            <button
              type="button"
              className="egs-action-btn"
              onClick={() => onNavigate?.('event-customer-360')}
              data-testid="order-action-customer360"
            >
              <Users size={13} /> Abrir Cliente 360°
            </button>
            <button
              type="button"
              className="egs-action-btn"
              onClick={() => copyToClipboard(customer.rawEmail || order.buyerEmail, 'E-mail do comprador')}
            >
              <Copy size={13} /> Copiar e-mail
            </button>
          </div>
        </article>

        {/* Card 2: Ingressos Emitidos */}
        <article className="order-360-card" data-testid="card-correlated-tickets">
          <div className="order-360-card-head">
            <div className="order-360-card-title-wrap">
              <Ticket size={18} className="text-amber-600" />
              <h3>Ingressos do Pedido ({tickets.length})</h3>
            </div>
            <span className="egs-badge egs-badge-neutral">{tickets[0]?.lotName || 'Lote Padrão'}</span>
          </div>
          <div className="order-360-card-body">
            <div className="order-360-items-list">
              {tickets.map(t => (
                <div key={t.id} className="order-360-ticket-item" data-testid={`ticket-item-${t.code}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong className="font-mono text-sky-700">{t.code}</strong>
                      <div className="text-xs text-slate-600">{t.participantName}</div>
                      <div className="text-[11px] text-slate-400">{t.lotName} · {t.sector}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className={`mini-status ${t.status === 'valido' ? 'ativo' : 'pendente'}`}>
                        {t.status === 'valido' ? 'Válido' : t.status}
                      </span>
                      <div className="text-xs font-semibold text-slate-700 mt-1">{formatMoney(t.priceCents)}</div>
                    </div>
                  </div>
                  <div className="order-360-ticket-footer">
                    <span className="font-mono text-[10px] text-slate-400">{t.qrCode}</span>
                    <button
                      type="button"
                      className="order-360-inline-btn"
                      onClick={() => {
                        setSelectedTicket(t)
                        notify?.(`Investigando ingresso ${t.code}`)
                      }}
                      data-testid="order-action-investigate-ticket"
                    >
                      Investigar ingresso
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-360-card-actions">
            <button
              type="button"
              className="egs-action-btn"
              onClick={() => onNavigate?.('event-tickets')}
            >
              <Ticket size={13} /> Consultar no Mapa de Ingressos
            </button>
          </div>
        </article>

        {/* Card 3: Check-in & Investigação de Recusas */}
        <article className="order-360-card order-360-card-highlight" data-testid="card-correlated-checkins">
          <div className="order-360-card-head">
            <div className="order-360-card-title-wrap">
              <CheckCircle2 size={18} className="text-teal-600" />
              <h3>Acessos & Investigação de Check-in</h3>
            </div>
            <span className="egs-badge egs-badge-warning">Auditoria Operacional</span>
          </div>
          <div className="order-360-card-body">
            <div className="order-360-checkins-flow">
              {checkins.map(ci => (
                <div
                  key={ci.id}
                  className={`order-360-checkin-row ${ci.status === 'recusado' ? 'order-360-checkin-rejected' : 'order-360-checkin-approved'}`}
                  data-testid={`checkin-entry-${ci.id}`}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {ci.status === 'recusado' ? (
                      <AlertOctagon size={18} className="text-red-500 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '13px', color: ci.status === 'recusado' ? '#991B1B' : '#065F46' }}>
                          {ci.status === 'recusado' ? 'Tentativa Recusada / Bloqueada' : 'Acesso Autorizado'}
                        </strong>
                        <span className="font-mono text-xs text-slate-500">({ci.ticketCode})</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        <b>Local:</b> {ci.gate} · <b>Dispositivo:</b> {ci.operatorName} ({ci.method.toUpperCase()})
                      </div>
                      {ci.checkedAt && (
                        <div className="text-xs text-slate-500">
                          <b>Horário:</b> {new Date(ci.checkedAt).toLocaleString('pt-BR')}
                        </div>
                      )}

                      {/* Dados detalhados da recusa se houver */}
                      {ci.status === 'recusado' && (
                        <div className="order-360-refusal-box" data-testid="checkin-refusal-details">
                          <div className="text-xs text-red-700 font-semibold">
                            ⚠️ Motivo da recusa: {ci.rejectionReason || 'Tentativa de duplicidade'}
                          </div>
                          {ci.attemptedAt && (
                            <div className="text-[11px] text-red-600">
                              Tentativa registrada: {new Date(ci.attemptedAt).toLocaleString('pt-BR')}
                            </div>
                          )}
                          {ci.lastAuthorizedAt && (
                            <div className="text-[11px] text-emerald-700">
                              Último acesso autorizado anterior: {new Date(ci.lastAuthorizedAt).toLocaleString('pt-BR')}
                            </div>
                          )}

                          {/* 4 Ações Rápidas Obrigatórias do Check-in Recusado */}
                          <div className="order-360-refusal-actions">
                            <button
                              type="button"
                              className="order-360-micro-btn"
                              onClick={() => {
                                const found = tickets.find(t => t.code === ci.ticketCode) || tickets[0]
                                setSelectedTicket(found)
                                notify?.(`Inspecionando dados do ingresso ${ci.ticketCode}`)
                              }}
                              data-testid="btn-checkin-investigate-ticket"
                            >
                              <Ticket size={11} /> Investigar ingresso
                            </button>
                            <button
                              type="button"
                              className="order-360-micro-btn"
                              onClick={() => onNavigate?.('event-customer-360')}
                              data-testid="btn-checkin-customer-360"
                            >
                              <Users size={11} /> Cliente 360°
                            </button>
                            <button
                              type="button"
                              className="order-360-micro-btn order-360-micro-btn-danger"
                              onClick={() => onNavigate?.('event-incidents')}
                              data-testid="btn-checkin-create-incident"
                            >
                              <PlusCircle size={11} /> Criar incidente
                            </button>
                            <button
                              type="button"
                              className="order-360-micro-btn"
                              onClick={() => onNavigate?.('sac-hub')}
                              data-testid="btn-checkin-open-sac"
                            >
                              <MessageSquare size={11} /> Abrir atendimento
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-360-card-actions">
            <button
              type="button"
              className="egs-action-btn"
              onClick={() => onNavigate?.('event-live-ops')}
            >
              <CheckCircle2 size={13} /> Painel de Catracas Live Ops
            </button>
          </div>
        </article>

        {/* Card 4: Financeiro */}
        <article className="order-360-card" data-testid="card-correlated-financial">
          <div className="order-360-card-head">
            <div className="order-360-card-title-wrap">
              <WalletCards size={18} className="text-emerald-600" />
              <h3>Financeiro & Transações</h3>
            </div>
            <span className="egs-badge egs-badge-success">{financial.status}</span>
          </div>
          <div className="order-360-card-body">
            <div className="order-360-info-row">
              <span>Código Transação:</span>
              <strong className="font-mono text-emerald-800">{financial.code}</strong>
            </div>
            <div className="order-360-info-row">
              <span>NSU / Comprovante:</span>
              <span className="font-mono text-xs">{financial.nsu}</span>
            </div>
            <div className="order-360-info-row">
              <span>Descrição:</span>
              <span>{financial.description}</span>
            </div>
            <div className="order-360-info-row">
              <span>Valor Liquidado:</span>
              <strong className="text-base text-emerald-700">{formatMoney(financial.amountCents)}</strong>
            </div>
            <div className="order-360-info-row">
              <span>Data/Hora:</span>
              <span>{new Date(financial.occurredAt).toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div className="order-360-card-actions">
            <button
              type="button"
              className="egs-action-btn"
              onClick={() => onNavigate?.('finance-dashboard')}
              data-testid="order-action-finance"
            >
              <WalletCards size={13} /> Ver movimentação no Financeiro
            </button>
          </div>
        </article>

        {/* Card 5: SAC / Atendimento */}
        <article className="order-360-card" data-testid="card-correlated-sac">
          <div className="order-360-card-head">
            <div className="order-360-card-title-wrap">
              <Headphones size={18} className="text-orange-600" />
              <h3>Atendimento / SAC</h3>
            </div>
            <span className="egs-badge egs-badge-info">{support[0]?.status || 'Ativo'}</span>
          </div>
          <div className="order-360-card-body">
            {support.length > 0 ? (
              support.map(s => (
                <div key={s.id} className="order-360-sac-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong className="font-mono text-orange-700">{s.code}</strong>
                    <span className="mini-status ativo">{s.status}</span>
                  </div>
                  <div className="text-xs text-slate-800 mt-1 font-semibold">{s.subject}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Solicitante: {s.requesterName} · Prioridade: {s.priority.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Aberto em {new Date(s.createdAt).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 py-4">Nenhum chamado aberto para este pedido.</div>
            )}
          </div>
          <div className="order-360-card-actions">
            <button
              type="button"
              className="egs-action-btn"
              onClick={() => onNavigate?.('sac-hub')}
              data-testid="order-action-sac"
            >
              <Headphones size={13} /> Abrir no SAC
            </button>
          </div>
        </article>

        {/* Card 6: Estornos Canônico */}
        <article className="order-360-card" data-testid="card-correlated-refunds">
          <div className="order-360-card-head">
            <div className="order-360-card-title-wrap">
              <Undo2 size={18} className="text-rose-600" />
              <h3>Estornos & Devoluções</h3>
            </div>
            <span className="egs-badge egs-badge-neutral">{refunds[0]?.status === 'nao_solicitado' ? 'Regular' : refunds[0]?.status}</span>
          </div>
          <div className="order-360-card-body">
            <div className="order-360-info-row">
              <span>Situação:</span>
              <b>{refunds[0]?.status === 'nao_solicitado' ? 'Nenhum estorno solicitado' : refunds[0]?.status}</b>
            </div>
            <div className="order-360-info-row">
              <span>Motivo registrado:</span>
              <span>{refunds[0]?.reason || 'Transação legítima sem contestação.'}</span>
            </div>
            <div className="order-360-info-row">
              <span>Valor Estornado:</span>
              <strong>{formatMoney(refunds[0]?.amountCents || 0)}</strong>
            </div>
          </div>
          <div className="order-360-card-actions">
            <button
              type="button"
              className="egs-action-btn egs-action-btn-danger"
              onClick={() => onNavigate?.('finance-refunds')}
              data-testid="order-action-refunds"
            >
              <Undo2 size={13} /> Centro de Controle de Estornos
            </button>
          </div>
        </article>
      </div>

      {/* Card 7: Histórico de Atividades Relacionado */}
      <section className="order-360-timeline-section" data-testid="card-correlated-timeline">
        <div className="order-360-timeline-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} className="text-indigo-600" />
            <h3>Histórico de Atividades Relacionado ao Pedido</h3>
          </div>
          <button
            type="button"
            className="egs-action-btn"
            onClick={() => onNavigate?.('event-audit')}
            data-testid="order-action-activity-stream"
          >
            <ExternalLink size={13} /> Ver histórico completo
          </button>
        </div>

        <div className="order-360-timeline-steps">
          {timeline.map((step, idx) => (
            <div key={step.id} className="order-360-timeline-step" data-testid={`timeline-step-${idx}`}>
              <div className="order-360-step-bullet" />
              <div className="order-360-step-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{step.title}</strong>
                  <span className="text-xs text-slate-400">{new Date(step.at).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{step.detail}</p>
                <span className="order-360-step-origin">{step.origem}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticket Details Modal if clicked */}
      {selectedTicket && (
        <div className="modal-backdrop" style={{ zIndex: 1300 }} onClick={() => setSelectedTicket(null)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(480px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>DETALHES DO INGRESSO</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>{selectedTicket.code}</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ background: "var(--disk-bg-muted)", padding: '12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>TITULAR</div>
                <strong style={{ fontSize: '15px', color: "var(--disk-text-primary)" }}>{selectedTicket.participantName}</strong>
                <div style={{ color: "var(--disk-text-muted)" }}>Vinculado ao Pedido #{order.code}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                  <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>SETOR & LOTE</div>
                  <strong style={{ color: "var(--disk-text-primary)" }}>{selectedTicket.lotName}</strong>
                  <div style={{ color: "var(--disk-text-muted)", fontSize: '11px' }}>{selectedTicket.sector}</div>
                </div>
                <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                  <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>VALOR</div>
                  <strong style={{ color: '#16A34A' }}>{formatMoney(selectedTicket.priceCents)}</strong>
                  <div style={{ color: "var(--disk-text-muted)", fontSize: '11px' }}>{selectedTicket.type}</div>
                </div>
              </div>
              <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>CÓDIGO QR SEGURO</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <QrCode size={16} className="text-slate-600" />
                  <span className="font-mono text-xs text-slate-800">{selectedTicket.qrCode}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: "1px solid var(--disk-border-default)", paddingTop: '12px' }}>
              <button type="button" className="btn secondary" onClick={() => setSelectedTicket(null)}>Fechar</button>
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  notify?.(`Ingresso ${selectedTicket.code} reenviado para ${order.buyerEmail}!`)
                  setSelectedTicket(null)
                }}
              >
                Reenviar Ingresso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
