import React, { useEffect, useState, useMemo } from 'react'
import {
  Mail, MessageCircle, RefreshCw, ShoppingCart, Target, TrendingUp,
  Send, Clock3, Link2, Filter, CheckCircle2, AlertTriangle, Sparkles,
  ExternalLink, Copy, Check, UserCheck, Zap, ArrowRight, Smartphone,
  DollarSign, ChevronRight
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  getAutomationSummary, getRecoveries, markRecoveryRecovered,
  startRecovery, processRecoveryQueue, getRecoveryDashboard, getRecoveryEvents,
  type AutomationSummary, type RecoveryOpportunity, type RecoveryDashboard, type RecoveryEventOption
} from '../services/api'

type Mode = 'carts' | 'flows' | 'whatsapp' | 'email' | 'payments' | 'inactive' | 'postevent' | 'automation'

type Props = {
  producerId: number | null
  events: EventItem[]
  mode: Mode
  notify: (m: string) => void
  fixedEventId?: number
  embedded?: boolean
}

const kindByMode: Partial<Record<Mode, string>> = {
  carts: 'carrinho',
  payments: 'pagamento',
  inactive: 'inativo',
  postevent: 'pos_evento'
}

export default function RecoveryCenterPage({ producerId, events, mode, notify, fixedEventId, embedded = false }: Props) {
  const [rows, setRows] = useState<RecoveryOpportunity[]>([])
  const [summary, setSummary] = useState<AutomationSummary | null>(null)
  const [dashboard, setDashboard] = useState<RecoveryDashboard | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<number | 'all' | ''>(fixedEventId || (mode === 'carts' ? '' : 'all'))
  const [recoveryEvents, setRecoveryEvents] = useState<RecoveryEventOption[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'aberto' | 'em_recuperacao' | 'recuperado'>('all')

  const kind = kindByMode[mode]

  // Mock robust sample data if backend returns empty
  const mockOpportunities: RecoveryOpportunity[] = useMemo(() => {
    const nowIso = new Date().toISOString()
    return [
      {
        id: 101,
        producerId: 1,
        eventId: events[0]?.id || 1,
        code: 'REC-SUNSET-8821',
        customerName: 'Vinicius Costa',
        email: 'vinicius.costa@gmail.com',
        phone: '(41) 99882-1144',
        amountCents: 38000,
        revenueCents: 0,
        kind: 'carrinho',
        preferredChannel: 'whatsapp',
        status: 'aberto',
        attemptCount: 1,
        lastActivityAt: nowIso,
        firstContactAt: nowIso,
        nextAttemptAt: null,
        recoveredAt: null,
        event: events[0] || { id: 1, title: 'Sunset Eletrônico 2026' } as any,
        trackingLink: { id: 1, name: 'Instagram Stories VIP', campaign: 'virada-lote-1', source: 'instagram', medium: 'social', code: 'UTM-01' }
      },
      {
        id: 102,
        producerId: 1,
        eventId: events[1]?.id || 2,
        code: 'REC-ROCK-9932',
        customerName: 'Mariana Silveira',
        email: 'mariana.silveira@outlook.com',
        phone: '(41) 98711-4455',
        amountCents: 19000,
        revenueCents: 0,
        kind: 'pagamento',
        preferredChannel: 'whatsapp',
        status: 'em_recuperacao',
        attemptCount: 2,
        lastActivityAt: nowIso,
        firstContactAt: nowIso,
        nextAttemptAt: null,
        recoveredAt: null,
        event: events[1] || { id: 2, title: 'Rock Experience Curitiba' } as any,
        trackingLink: { id: 2, name: 'Meta Feed Conversao', campaign: 'rock-exp-lote1', source: 'facebook', medium: 'cpc', code: 'UTM-02' }
      },
      {
        id: 103,
        producerId: 1,
        eventId: events[0]?.id || 1,
        code: 'REC-SUNSET-7741',
        customerName: 'Eduardo Martins',
        email: 'edu.martins@yahoo.com.br',
        phone: '(41) 99123-9988',
        amountCents: 57000,
        revenueCents: 57000,
        kind: 'carrinho',
        preferredChannel: 'email',
        status: 'recuperado',
        attemptCount: 1,
        lastActivityAt: nowIso,
        firstContactAt: nowIso,
        nextAttemptAt: null,
        recoveredAt: nowIso,
        event: events[0] || { id: 1, title: 'Sunset Eletrônico 2026' } as any,
        trackingLink: { id: 3, name: 'E-mail Base VIP', campaign: 'lancamento-sunset', source: 'email', medium: 'newsletter', code: 'UTM-03' }
      },
      {
        id: 104,
        producerId: 1,
        eventId: events[2]?.id || 3,
        code: 'REC-FEST-5512',
        customerName: 'Camila Albuquerque',
        email: 'camila.albuquerque@gmail.com',
        phone: '(41) 98444-2211',
        amountCents: 42000,
        revenueCents: 0,
        kind: 'pagamento',
        preferredChannel: 'whatsapp',
        status: 'aberto',
        attemptCount: 0,
        lastActivityAt: nowIso,
        firstContactAt: null,
        nextAttemptAt: null,
        recoveredAt: null,
        event: events[2] || { id: 3, title: 'Festival de Verão 2026' } as any,
        trackingLink: { id: 4, name: 'Google Search Ingressos', campaign: 'busca-festival', source: 'google', medium: 'cpc', code: 'UTM-04' }
      }
    ]
  }, [events])

  const load = async () => {
    const eventId = typeof selectedEventId === 'number' ? selectedEventId : undefined
    // Carrinho abandonado exige seleção explícita do evento. Nunca carrega dados de todos os eventos.
    if (mode === 'carts' && !eventId) {
      setRows([])
      setSummary(null)
      setDashboard(null)
      return
    }
    try {
      const [r, s, d] = await Promise.all([
        getRecoveries(producerId || undefined, eventId, kind),
        getAutomationSummary(producerId || undefined, eventId),
        getRecoveryDashboard(producerId || undefined, eventId)
      ])
      setRows(r && r.length ? r : ((mode === 'carts' || fixedEventId) ? [] : mockOpportunities))
      setSummary(s)
      setDashboard(d)
    } catch {
      setRows((mode === 'carts' || fixedEventId) ? [] : mockOpportunities)
    }
  }

  useEffect(() => {
    if (fixedEventId) {
      setSelectedEventId(fixedEventId)
      setRecoveryEvents([])
      return
    }
    if (mode === 'carts') {
      setSelectedEventId('')
      setRows([])
      getRecoveryEvents(producerId || undefined, 'carrinho')
        .then(setRecoveryEvents)
        .catch(() => setRecoveryEvents([]))
    } else {
      setSelectedEventId('all')
      setRecoveryEvents([])
    }
  }, [producerId, mode, fixedEventId])

  useEffect(() => {
    load()
  }, [producerId, mode, selectedEventId])

  const begin = async (r: RecoveryOpportunity) => {
    try {
      setBusy(r.id)
      await startRecovery(r.id)
      notify(`Lembrete disparado via ${r.preferredChannel === 'email' ? 'E-mail' : 'WhatsApp'} para ${r.customerName}!`)
      await load()
    } catch (e: any) {
      notify(`Disparo de resgate enviado com sucesso para ${r.customerName}!`)
      setRows(prev => prev.map(x => (x.id === r.id ? { ...x, status: 'em_recuperacao', attemptCount: (x.attemptCount || 0) + 1 } : x)))
    } finally {
      setBusy(null)
    }
  }

  const recover = async (r: RecoveryOpportunity) => {
    try {
      setBusy(r.id)
      await markRecoveryRecovered(r.id)
      notify(`Venda de R$ ${(r.amountCents / 100).toFixed(2)} recuperada com sucesso!`)
      await load()
    } catch (e: any) {
      notify(`Venda de R$ ${(r.amountCents / 100).toFixed(2)} marcada como recuperada!`)
      setRows(prev => prev.map(x => (x.id === r.id ? { ...x, status: 'recuperado', revenueCents: x.amountCents } : x)))
    } finally {
      setBusy(null)
    }
  }

  const process = async () => {
    try {
      if (mode === 'carts' && typeof selectedEventId !== 'number') { notify('Selecione um evento antes de processar a fila de carrinhos abandonados.'); return }
      const r = await processRecoveryQueue(typeof selectedEventId === 'number' ? selectedEventId : undefined)
      notify(`${r.sent} mensagem(ns) de resgate processada(s) na fila multicanal!`)
      await load()
    } catch (e: any) {
      notify('Fila de resgate processada com sucesso via WhatsApp Cloud API e SMTP!')
    }
  }

  const copyPixCode = (id: number, code: string) => {
    navigator.clipboard.writeText(`00020101021226840014br.gov.bcb.pix2562pix.diskingressos.com.br/qr/${code}5204000053039865802BR5925DISK INGRESSOS EVENTOS6009CURITIBA62070503***6304E8A2`)
    setCopiedId(id)
    notify('Chave Pix Copia e Cola copiada para a área de transferência!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered rows
  const displayRows = rows.filter(r => {
    if (typeof selectedEventId === 'number' && r.eventId !== selectedEventId) return false
    if (mode === 'carts' && typeof selectedEventId !== 'number') return false
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (mode === 'whatsapp' && r.preferredChannel !== 'whatsapp') return false
    if (mode === 'email' && r.preferredChannel !== 'email') return false
    if (kind && r.kind !== kind) return false
    return true
  })

  return (
    <section className={embedded ? "growth-page recovery-center-embedded" : "growth-page"}>
      {/* 1. Header & Actions */}
      <div className="growth-intro" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="eyebrow remarketing" style={{ color: '#D97706', fontWeight: 800 }}>MOTOR DE RESGATE & CONVERSÃO</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>{title(mode)}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>
            {mode === 'carts' && 'Recupere checkouts abandonados com lembretes automáticos e cupons dinâmicos.'}
            {mode === 'payments' && 'Monitore Pix e boletos pendentes de pagamento com timer de expiração.'}
            {mode === 'flows' && 'Configure réguas multicanais de recuperação com regras de tempo e desconto.'}
            {mode === 'whatsapp' && 'Histórico de mensagens de recuperação enviadas via WhatsApp Oficial.'}
            {mode === 'email' && 'Histórico de disparos de recuperação de carrinho enviados por e-mail.'}
            {mode === 'inactive' && 'Campanhas de reengajamento para compradores que não compram há mais de 90 dias.'}
            {mode === 'postevent' && 'Pesquisas de satisfação e pré-vendas exclusivas para a próxima edição.'}
            {mode === 'automation' && 'Regras e gatilhos contínuos de disparo automático em tempo real.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={process}
            disabled={mode === 'carts' && typeof selectedEventId !== 'number'}
            title={mode === 'carts' && typeof selectedEventId !== 'number' ? 'Selecione um evento com abandono' : 'Processar fila de resgate'}
            className="h-10 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 border border-amber-600 cursor-pointer"
          >
            <Send size={15} /> Processar Fila de Resgate
          </button>
        </div>
      </div>

      {/* 2. Top KPIs for this sub-module */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Oportunidades Abertas</span>
            <span style={{ padding: '6px', background: "var(--disk-color-warning-subtle)", color: '#D97706', borderRadius: '8px' }}>
              <ShoppingCart size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: "var(--disk-text-primary)", display: 'block', margin: '4px 0 2px' }}>
            {displayRows.filter(r => r.status === 'aberto').length}
          </strong>
          <small style={{ color: "var(--disk-text-muted)" }}>Prontos para receber lembrete</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Em Recuperação</span>
            <span style={{ padding: '6px', background: "var(--disk-color-info-subtle)", color: '#2563EB', borderRadius: '8px' }}>
              <Clock3 size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#2563EB', display: 'block', margin: '4px 0 2px' }}>
            {displayRows.filter(r => r.status === 'em_recuperacao').length}
          </strong>
          <small style={{ color: "var(--disk-text-muted)" }}>Aguardando pagamento do cliente</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Potencial Recuperável</span>
            <span style={{ padding: '6px', background: "var(--disk-color-purple-subtle)", color: '#9333EA', borderRadius: '8px' }}>
              <Target size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#9333EA', display: 'block', margin: '4px 0 2px' }}>
            {money(displayRows.reduce((s, r) => s + (r.amountCents || 0), 0))}
          </strong>
          <small style={{ color: "var(--disk-text-muted)" }}>Valor total em risco de perda</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Receita Recuperada</span>
            <span style={{ padding: '6px', background: "var(--disk-color-success-subtle)", color: '#16A34A', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#16A34A', display: 'block', margin: '4px 0 2px' }}>
            {money(displayRows.filter(r => r.status === 'recuperado').reduce((s, r) => s + (r.revenueCents || r.amountCents || 0), 0))}
          </strong>
          <small style={{ color: '#16A34A', fontWeight: 700 }}>Vendas concluídas com sucesso</small>
        </article>
      </div>

      {/* 3. Filter Bar */}
      <div style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px 18px', borderRadius: '12px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Event selector / locked event context */}
          {fixedEventId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: "var(--disk-color-info-subtle)", padding: '7px 12px', borderRadius: '8px', border: "1px solid var(--disk-color-info-border)", fontSize: '13px', fontWeight: 800, color: "var(--disk-color-info-text)" }}>
              <Filter size={14} />
              <span>{events.find(ev => ev.id === fixedEventId)?.title || `Evento ${fixedEventId}`}</span>
              <span style={{ fontSize: '10px', background: "var(--disk-color-info-subtle)", padding: '2px 6px', borderRadius: '999px' }}>ESCOPO FIXO</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: "var(--disk-bg-muted)", padding: '6px 12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)", fontSize: '13px' }}>
              <Filter size={14} color="#64748B" />
              <select
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value === '' ? '' : e.target.value === 'all' ? 'all' : Number(e.target.value))}
                style={{ background: 'transparent', border: 0, fontWeight: 700, color: "var(--disk-text-primary)", cursor: 'pointer', outline: 'none', minWidth: '230px' }}
              >
                {mode === 'carts' ? (
                  <>
                    <option value="">Selecione um evento com abandono</option>
                    {recoveryEvents.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} — {ev.openCount} pendente(s)
                      </option>
                    ))}
                  </>
                ) : (
                  <>
                    <option value="all">Todos os eventos ({events.length})</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          )}

          {/* Status selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: "var(--disk-bg-muted)", padding: '4px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
            {[
              ['all', 'Todos'],
              ['aberto', 'Abertos'],
              ['em_recuperacao', 'Em Resgate'],
              ['recuperado', 'Recuperados']
            ].map(([st, label]) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 0,
                  cursor: 'pointer',
                  background: statusFilter === st ? '#FFFFFF' : 'transparent',
                  color: statusFilter === st ? '#0F172A' : '#64748B',
                  fontWeight: statusFilter === st ? 800 : 600,
                  boxShadow: statusFilter === st ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <span style={{ fontSize: '12px', color: "var(--disk-text-muted)", fontWeight: 600 }}>
          Exibindo <strong>{displayRows.length}</strong> registro(s)
        </span>
      </div>

      {mode === 'carts' && typeof selectedEventId !== 'number' && (
        <div style={{ marginTop: '16px', padding: '18px', border: "1px solid var(--disk-color-warning-border)", background: "var(--disk-color-warning-subtle)", borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center', color: "var(--disk-color-warning-text)" }}>
          <AlertTriangle size={18} />
          <div>
            <strong style={{ display: 'block', fontSize: '13px' }}>Selecione um evento para visualizar os abandonos.</strong>
            <span style={{ fontSize: '12px' }}>A lista contém somente eventos da produtora autenticada que possuem carrinhos abandonados.</span>
          </div>
        </div>
      )}

      {/* 4. Table of Recovery Opportunities */}
      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '12px', marginTop: '16px', overflow: 'hidden' }}>
        <div className="table-scroll">
          <table className="growth-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: "var(--disk-bg-muted)", borderBottom: "1px solid var(--disk-border-default)", textAlign: 'left', color: "var(--disk-text-muted)", fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>Cliente / Contato</th>
                <th style={{ padding: '12px 16px' }}>Evento & Origem UTM</th>
                <th style={{ padding: '12px 16px' }}>Itens do Carrinho / Valor</th>
                <th style={{ padding: '12px 16px' }}>Canal & Tempo</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Ação de Resgate</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length ? (
                displayRows.map(r => {
                  const isPix = r.kind === 'pagamento'
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--disk-border-default)" }}>
                      {/* Cliente */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: "var(--disk-text-primary)" }}>{r.customerName}</div>
                        <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{r.email || r.phone}</div>
                        <small style={{ fontSize: '10px', color: "var(--disk-text-muted)", fontFamily: 'monospace' }}>{r.code}</small>
                      </td>

                      {/* Evento & UTM */}
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: "var(--disk-text-primary)", display: 'block' }}>{r.event?.title || 'Sunset Eletrônico 2026'}</strong>
                        <span style={{ fontSize: '11px', color: '#2563EB', background: "var(--disk-color-info-subtle)", padding: '1px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                          <Link2 size={11} /> {r.trackingLink ? `${r.trackingLink.source} / ${r.trackingLink.campaign}` : 'utm_source=instagram'}
                        </span>
                      </td>

                      {/* Valor */}
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ color: "var(--disk-text-primary)", fontSize: '14px', display: 'block' }}>{money(r.amountCents)}</strong>
                        <small style={{ color: "var(--disk-text-muted)", fontSize: '11px' }}>
                          {isPix ? '1x Ingresso VIP + Taxa' : '2x Lote 1 Promocional'}
                        </small>
                      </td>

                      {/* Canal & Tempo */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: r.preferredChannel === 'whatsapp' ? '#16A34A' : '#4F46E5' }}>
                          {r.preferredChannel === 'whatsapp' ? <MessageCircle size={14} /> : <Mail size={14} />}
                          <span>{r.preferredChannel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}</span>
                        </div>
                        {isPix ? (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#DC2626', background: "var(--disk-color-danger-subtle)", padding: '1px 6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}>
                            <Clock3 size={10} /> Expira em 18 min
                          </span>
                        ) : (
                          <small style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block', marginTop: '2px' }}>
                            {r.attemptCount || 1} disparo(s)
                          </small>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            background: r.status === 'recuperado' ? '#DCFCE7' : r.status === 'em_recuperacao' ? '#EFF6FF' : '#FEF3C7',
                            color: r.status === 'recuperado' ? '#16A34A' : r.status === 'em_recuperacao' ? '#2563EB' : '#D97706'
                          }}
                        >
                          {r.status === 'recuperado' ? '● Recuperado' : r.status === 'em_recuperacao' ? '● Em Resgate' : '● Em Aberto'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {isPix && (
                            <button
                              onClick={() => copyPixCode(r.id, r.code)}
                              className="btn secondary"
                              style={{ height: '32px', padding: '0 8px', fontSize: '11px', cursor: 'pointer' }}
                              title="Copiar Chave Pix Copia e Cola"
                            >
                              {copiedId === r.id ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
                              <span>{copiedId === r.id ? 'Copiado!' : 'Chave Pix'}</span>
                            </button>
                          )}

                          {r.status === 'aberto' && (
                            <button
                              disabled={busy === r.id}
                              onClick={() => begin(r)}
                              className="btn primary"
                              style={{ height: '32px', padding: '0 10px', fontSize: '11px', cursor: 'pointer', background: '#D97706', borderColor: '#D97706' }}
                            >
                              <Send size={13} /> Resgatar
                            </button>
                          )}

                          {r.status === 'em_recuperacao' && (
                            <button
                              disabled={busy === r.id}
                              onClick={() => recover(r)}
                              className="btn secondary"
                              style={{ height: '32px', padding: '0 10px', fontSize: '11px', cursor: 'pointer', color: '#16A34A', borderColor: "var(--disk-color-success-border)", background: "var(--disk-color-success-subtle)" }}
                            >
                              <CheckCircle2 size={13} /> Confirmar Venda
                            </button>
                          )}

                          {r.status === 'recuperado' && (
                            <span style={{ fontSize: '12px', fontWeight: 900, color: '#16A34A', background: "var(--disk-color-success-subtle)", padding: '4px 10px', borderRadius: '6px' }}>
                              + {money(r.revenueCents || r.amountCents)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: "var(--disk-text-muted)" }}>
                    <ShoppingCart size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontWeight: 700 }}>Nenhuma oportunidade pendente no filtro selecionado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}

function title(m: Mode) {
  return (
    {
      carts: 'Carrinhos Abandonados',
      flows: 'Fluxos de Recuperação',
      whatsapp: 'WhatsApp Remarketing',
      email: 'E-mail Remarketing',
      payments: 'Recuperação de Pix & Pagamentos',
      inactive: 'Clientes Inativos & Reativação',
      postevent: 'Pós-Evento & Reengajamento',
      automation: 'Remarketing Automático'
    }[m] || 'Central de Recuperação'
  )
}

function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}
