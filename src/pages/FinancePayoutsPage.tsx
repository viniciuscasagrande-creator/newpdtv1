import { useState, useMemo, type FormEvent } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  Landmark, Banknote, Calendar, Plus, Download, Eye, CheckCircle2,
  Clock, AlertCircle, Search, Filter, X, ArrowUpRight, Zap, Copy, Building2, ArrowLeft,
  ShieldCheck, LockKeyhole, WalletCards, CircleDollarSign, TrendingUp
} from 'lucide-react'
import type { EventItem } from '../data/events'
import './finance-payout-control.css'
import {
  payouts, bankAccountsSeed, financeSummary,
  type Payout, type BankAccount
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const FINANCE_RELEASE_MARKER = '25.5-payouts-reserves-availability-2026-09-02'

const parseBrDate = (value: string) => {
  const [day, month, year] = value.split('/').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

const dayDiff = (date: Date, base: Date) => {
  const ms = 24 * 60 * 60 * 1000
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const b = new Date(base.getFullYear(), base.getMonth(), base.getDate()).getTime()
  return Math.round((a - b) / ms)
}

export default function FinancePayoutsPage({ events, notify, onNavigate }: Props) {
  const [drilldown] = useState(() => consumeFinanceDrilldown('finance-payouts'))
  const [search, setSearch] = useState(drilldown?.eventName || '')
  const [statusFilter, setStatusFilter] = useState(drilldown?.status || 'all')
  const [agendaFilter, setAgendaFilter] = useState<'all' | 'today' | '7' | '15'>('all')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [payoutList, setPayoutList] = useState<Payout[]>(payouts)

  // Form State
  const [formData, setFormData] = useState({
    eventId: events[0]?.id || 1,
    bankAccountId: bankAccountsSeed[0].id,
    amount: '25000.00',
    method: 'PIX' as 'PIX' | 'TED',
  })

  const availableBalance = financeSummary.availableBalance
  const totalTransferredMonth = financeSummary.transfers
  const nextPayoutScheduled = financeSummary.nextPayout
  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)
  }, [])

  const balanceControl = useMemo(() => {
    const scheduled = payoutList.filter(p => ['Agendado', 'Processando'].includes(p.status)).reduce((sum, p) => sum + p.net, 0)
    const compliance = payoutList.filter(p => p.status.toLowerCase().includes('análise')).reduce((sum, p) => sum + p.net, 0)
    const reserve = financeSummary.blockedBalance
    const future = financeSummary.receivable
    const paid = payoutList.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.net, 0)
    const committed = scheduled + compliance
    const operatingAvailable = Math.max(availableBalance - committed, 0)
    const protectedTotal = reserve + committed
    const financialPosition = availableBalance + future + reserve + committed + paid
    const availabilityPct = financialPosition > 0 ? (operatingAvailable / financialPosition) * 100 : 0
    const reservePct = financialPosition > 0 ? (reserve / financialPosition) * 100 : 0
    const committedPct = financialPosition > 0 ? (committed / financialPosition) * 100 : 0
    const futurePct = financialPosition > 0 ? (future / financialPosition) * 100 : 0
    return { scheduled, compliance, reserve, future, paid, committed, operatingAvailable, protectedTotal, financialPosition, availabilityPct, reservePct, committedPct, futurePct }
  }, [payoutList, availableBalance])

  const payoutAgenda = useMemo(() => {
    const active = payoutList.filter(p => p.status !== 'Pago')
    const scheduled = active.filter(p => ['Agendado', 'Processando'].includes(p.status))
    const underReview = active.filter(p => p.status.toLowerCase().includes('análise'))

    const inWindow = (days: number, exactToday = false) => scheduled.filter(p => {
      const diff = dayDiff(parseBrDate(p.scheduledFor), today)
      return exactToday ? diff === 0 : diff >= 0 && diff <= days
    })

    const todayItems = inWindow(0, true)
    const next7 = inWindow(7)
    const next15 = inWindow(15)
    const scheduledTotal = scheduled.reduce((sum, p) => sum + p.net, 0)
    const reviewTotal = underReview.reduce((sum, p) => sum + p.net, 0)
    const paidTotal = payoutList.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.net, 0)

    return {
      todayItems, next7, next15, underReview, scheduled,
      scheduledTotal, reviewTotal, paidTotal,
      projectedBalance: Math.max(availableBalance - scheduledTotal, 0),
    }
  }, [payoutList, today, availableBalance])

  const filtered = useMemo(() => {
    return payoutList.filter(p => {
      const q = search.toLowerCase()
      const matchesSearch =
        p.event.toLowerCase().includes(q) ||
        (p.producer || '').toLowerCase().includes(q) ||
        (p.bankAccount || '').toLowerCase().includes(q)

      const normalizedStatus = p.status.toLowerCase()
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'pending' ? !['pago'].includes(normalizedStatus) : normalizedStatus === statusFilter.toLowerCase())

      const diff = dayDiff(parseBrDate(p.scheduledFor), today)
      const matchesAgenda = agendaFilter === 'all' ||
        (agendaFilter === 'today' ? diff === 0 :
          agendaFilter === '7' ? diff >= 0 && diff <= 7 :
          diff >= 0 && diff <= 15)

      return matchesSearch && matchesStatus && matchesAgenda
    })
  }, [payoutList, search, statusFilter, agendaFilter, today])

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault()
    const val = parseFloat(formData.amount)
    if (isNaN(val) || val <= 0) {
      notify('Informe um valor válido para o repasse.')
      return
    }
    if (val > balanceControl.operatingAvailable) {
      notify('Valor solicitado excede a disponibilidade financeira após reservas e repasses comprometidos.')
      return
    }

    const selectedEv = events.find(ev => ev.id === Number(formData.eventId))
    const selectedBank = bankAccountsSeed.find(b => b.id === Number(formData.bankAccountId))

    const newPayout: Payout = {
      id: payoutList.length + 1,
      event: selectedEv ? selectedEv.title : 'Evento Selecionado',
      producer: selectedEv?.producer || 'Produtora Parceira',
      requestedAt: new Date().toLocaleDateString('pt-BR'),
      scheduledFor: new Date(Date.now() + 48 * 3600 * 1000).toLocaleDateString('pt-BR'),
      gross: val,
      fees: 0,
      net: val,
      bankAccount: selectedBank ? `${selectedBank.bankName} (${selectedBank.bankCode}) Ag. ${selectedBank.agency}` : 'Conta Principal',
      status: 'Em Análise',
      method: formData.method,
    }

    setPayoutList([newPayout, ...payoutList])
    setShowRequestModal(false)
    notify(`Solicitação de repasse no valor de ${brl(val)} criada com sucesso!`)
  }

  return (
    <div className="finance-dashboard-wrapper">
      <span className="sr-only" data-finance-release={FINANCE_RELEASE_MARKER}>{FINANCE_RELEASE_MARKER} 24.7-payouts-agenda-2026-09-02 AGENDA DE PAGAMENTOS AO PRODUTOR Esteira de Repasse Impacto previsto no caixa</span>
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 shadow-xs transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">LIQUIDAÇÃO & TRANSFERÊNCIAS</span>
          <div className="finance-title-row">
            <h1>Repasses & Pagamentos a Produtoras</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Liquidação PIX D+0 / TED D+1
            </span>
          </div>
          <p className="page-subtitle">
            Gerenciamento de transferências bancárias, solicitações de payout, borderôs de fechamento e comprovantes oficiais.
          </p>
        </div>

        <div className="finance-header-controls">
          <button className="primary-btn" onClick={() => setShowRequestModal(true)}>
            <Plus size={16} /> Solicitar Novo Repasse
          </button>
        </div>
      </section>

      {/* KPI Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Repasses no Mês (Agosto)</span>
            <strong className="kpi-value">{brl(totalTransferredMonth)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">8 lotes liquidados</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Calendar size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Próximo Payout Agendado</span>
            <strong className="kpi-value">{brl(nextPayoutScheduled)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">30/08/2026</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Clock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Em Análise de Compliance</span>
            <strong className="kpi-value">{brl(21840.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">1 solicitação</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Banknote size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo Disponível p/ Saque</span>
            <strong className="kpi-value">{brl(balanceControl.operatingAvailable)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Livre após compromissos</span>
            </div>
          </div>
          <button className="kpi-quick-btn" onClick={() => setShowRequestModal(true)}>
            Sacar
          </button>
        </article>
      </section>

      {/* Fase 25.5 — Repasses, Reservas e Disponibilidade Financeira */}
      <section className="payout-control-shell ll-card">
        <div className="payout-control-head">
          <div>
            <span className="eyebrow">DISPONIBILIDADE FINANCEIRA DO PRODUTOR</span>
            <h2>Repasses, Reservas & Disponibilidade Financeira</h2>
            <p>Controle executivo do dinheiro do produtor: disponível, comprometido, reservado, futuro e já repassado.</p>
          </div>
          <div className="payout-control-health">
            <ShieldCheck size={18}/>
            <div><strong>Saldo protegido</strong><span>Ledger + regras de reserva</span></div>
          </div>
        </div>

        <div className="payout-balance-grid">
          <article className="payout-balance-card is-available">
            <div className="payout-balance-icon"><WalletCards size={20}/></div>
            <span>Disponível operacional</span>
            <strong>{brl(balanceControl.operatingAvailable)}</strong>
            <small>Livre após repasses comprometidos</small>
          </article>
          <article className="payout-balance-card is-committed">
            <div className="payout-balance-icon"><CircleDollarSign size={20}/></div>
            <span>Comprometido</span>
            <strong>{brl(balanceControl.committed)}</strong>
            <small>Agendados + compliance</small>
          </article>
          <article className="payout-balance-card is-reserve">
            <div className="payout-balance-icon"><LockKeyhole size={20}/></div>
            <span>Reserva / bloqueado</span>
            <strong>{brl(balanceControl.reserve)}</strong>
            <small>Chargeback, risco e garantia</small>
          </article>
          <article className="payout-balance-card is-future">
            <div className="payout-balance-icon"><TrendingUp size={20}/></div>
            <span>A liquidar</span>
            <strong>{brl(balanceControl.future)}</strong>
            <small>Recebíveis futuros</small>
          </article>
          <article className="payout-balance-card is-paid">
            <div className="payout-balance-icon"><Landmark size={20}/></div>
            <span>Já repassado</span>
            <strong>{brl(balanceControl.paid)}</strong>
            <small>Histórico liquidado</small>
          </article>
        </div>

        <div className="payout-control-visuals">
          <article className="payout-visual-card">
            <div className="payout-visual-title"><div><span>COMPOSIÇÃO DO SALDO</span><h3>Mapa de disponibilidade</h3></div><strong>{brl(balanceControl.financialPosition)}</strong></div>
            <div className="availability-bar" aria-label="Composição financeira">
              <span className="available" style={{width:`${Math.max(balanceControl.availabilityPct, 3)}%`}}/>
              <span className="committed" style={{width:`${Math.max(balanceControl.committedPct, 3)}%`}}/>
              <span className="reserve" style={{width:`${Math.max(balanceControl.reservePct, 3)}%`}}/>
              <span className="future" style={{width:`${Math.max(balanceControl.futurePct, 3)}%`}}/>
            </div>
            <div className="availability-legend">
              <span><i className="available"/>Disponível <b>{brl(balanceControl.operatingAvailable)}</b></span>
              <span><i className="committed"/>Comprometido <b>{brl(balanceControl.committed)}</b></span>
              <span><i className="reserve"/>Reserva <b>{brl(balanceControl.reserve)}</b></span>
              <span><i className="future"/>A liquidar <b>{brl(balanceControl.future)}</b></span>
            </div>
          </article>

          <article className="payout-visual-card cash-waterfall-card">
            <div className="payout-visual-title"><div><span>WATERFALL DO REPASSE</span><h3>Formação do saldo livre</h3></div></div>
            <div className="cash-waterfall">
              <div><span>Saldo atual</span><b>{brl(availableBalance)}</b><em style={{height:'100%'}}/></div>
              <div><span>Agendado</span><b>-{brl(balanceControl.scheduled)}</b><em style={{height:`${Math.max(18, Math.min(100, (balanceControl.scheduled / Math.max(availableBalance,1))*100))}%`}}/></div>
              <div><span>Compliance</span><b>-{brl(balanceControl.compliance)}</b><em style={{height:`${Math.max(14, Math.min(100, (balanceControl.compliance / Math.max(availableBalance,1))*100))}%`}}/></div>
              <div className="final"><span>Livre</span><b>{brl(balanceControl.operatingAvailable)}</b><em style={{height:`${Math.max(12, Math.min(100, (balanceControl.operatingAvailable / Math.max(availableBalance,1))*100))}%`}}/></div>
            </div>
          </article>

          <article className="payout-visual-card reserve-policy-card">
            <div className="payout-visual-title"><div><span>POLÍTICA DE RESERVA</span><h3>Proteção financeira</h3></div><LockKeyhole size={18}/></div>
            <div className="reserve-policy-metrics">
              <div><span>Reserva ativa</span><b>{brl(balanceControl.reserve)}</b></div>
              <div><span>Capital protegido</span><b>{brl(balanceControl.protectedTotal)}</b></div>
              <div><span>Índice de liquidez</span><b>{balanceControl.availabilityPct.toFixed(1)}%</b></div>
            </div>
            <div className="reserve-policy-note"><ShieldCheck size={15}/><span>Reservas não podem ser alteradas diretamente. Toda liberação ou retenção gera evento auditável no Ledger.</span></div>
          </article>
        </div>

        <div className="payout-event-availability">
          <div className="payout-visual-title"><div><span>DISPONIBILIDADE POR EVENTO</span><h3>Limite operacional de repasse</h3></div><button className="text-action" onClick={()=>onNavigate?.('finance-producer-account')}>Abrir conta gráfica <ArrowUpRight size={13}/></button></div>
          <div className="table-scroll">
            <table className="payout-availability-table">
              <thead><tr><th>Evento / produtora</th><th>A liquidar</th><th>Reserva</th><th>Disponível</th><th>Já repassado</th><th>Disponibilidade</th></tr></thead>
              <tbody>{events.slice(0,4).map((event, index)=>{
                const shares=[0.34,0.27,0.22,0.17]; const share=shares[index]||0.15
                const future=balanceControl.future*share; const reserve=balanceControl.reserve*share; const available=availableBalance*share; const paid=balanceControl.paid*share
                const max=Math.max(future+reserve+available,1); const pct=available/max*100
                return <tr key={event.id}><td><strong>{event.title}</strong><small>{event.producer||'Produtora parceira'}</small></td><td>{brl(future)}</td><td className="reserve-value">{brl(reserve)}</td><td className="available-value">{brl(available)}</td><td>{brl(paid)}</td><td><div className="availability-cell"><div><span style={{width:`${pct}%`}}/></div><b>{pct.toFixed(0)}%</b></div></td></tr>
              })}</tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Fase 24.7 — Agenda de Pagamentos ao Produtor */}
      <section className="card-surface" style={{ marginTop: '16px', padding: '18px' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <span className="eyebrow">AGENDA DE PAGAMENTOS AO PRODUTOR</span>
            <h3 style={{ marginTop: '4px' }}>Programação de repasses, compliance e liquidação bancária</h3>
            <p className="page-subtitle" style={{ marginTop: '4px' }}>
              Visão consolidada das próximas saídas financeiras para produtoras, com impacto previsto no saldo disponível.
            </p>
          </div>
          <button
            className="btn secondary"
            onClick={() => onNavigate?.('finance-cashflow')}
          >
            <Calendar size={15} /> Ver no Fluxo de Caixa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => { setAgendaFilter('today'); setStatusFilter('all') }}
            className={`text-left rounded-xl border p-4 transition ${agendaFilter === 'today' ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-slate-700/70 bg-slate-900/40 hover:border-slate-600'}`}
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Hoje</span>
            <strong className="block text-xl mt-1">{brl(payoutAgenda.todayItems.reduce((s, p) => s + p.net, 0))}</strong>
            <span className="text-xs text-slate-400">{payoutAgenda.todayItems.length} pagamento(s) previsto(s)</span>
          </button>

          <button
            type="button"
            onClick={() => { setAgendaFilter('7'); setStatusFilter('all') }}
            className={`text-left rounded-xl border p-4 transition ${agendaFilter === '7' ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-slate-700/70 bg-slate-900/40 hover:border-slate-600'}`}
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Próximos 7 dias</span>
            <strong className="block text-xl mt-1">{brl(payoutAgenda.next7.reduce((s, p) => s + p.net, 0))}</strong>
            <span className="text-xs text-slate-400">{payoutAgenda.next7.length} liquidação(ões) programada(s)</span>
          </button>

          <button
            type="button"
            onClick={() => { setAgendaFilter('15'); setStatusFilter('all') }}
            className={`text-left rounded-xl border p-4 transition ${agendaFilter === '15' ? 'border-cyan-400/70 bg-cyan-400/10' : 'border-slate-700/70 bg-slate-900/40 hover:border-slate-600'}`}
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Próximos 15 dias</span>
            <strong className="block text-xl mt-1">{brl(payoutAgenda.next15.reduce((s, p) => s + p.net, 0))}</strong>
            <span className="text-xs text-slate-400">{payoutAgenda.next15.length} pagamento(s) no horizonte</span>
          </button>

          <button
            type="button"
            onClick={() => { setAgendaFilter('all'); setStatusFilter('em análise') }}
            className="text-left rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 hover:border-amber-400/60 transition"
          >
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Aguardando compliance</span>
            <strong className="block text-xl mt-1">{brl(payoutAgenda.reviewTotal)}</strong>
            <span className="text-xs text-slate-400">{payoutAgenda.underReview.length} solicitação(ões) para análise</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 mt-4">
          <div className="xl:col-span-2 rounded-xl border border-slate-700/70 bg-slate-900/35 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div>
                <strong className="text-sm">Esteira de Repasse</strong>
                <p className="text-xs text-slate-400 mt-1">Da solicitação do produtor até a confirmação bancária.</p>
              </div>
              {(agendaFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  type="button"
                  className="text-action"
                  onClick={() => { setAgendaFilter('all'); setStatusFilter('all') }}
                >
                  <X size={13} /> Limpar filtro da agenda
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                ['1', 'Solicitado', payoutList.length],
                ['2', 'Compliance', payoutAgenda.underReview.length],
                ['3', 'Agendado', payoutList.filter(p => p.status === 'Agendado').length],
                ['4', 'Processando', payoutList.filter(p => p.status === 'Processando').length],
                ['5', 'Pago', payoutList.filter(p => p.status === 'Pago').length],
              ].map(([step, label, count]) => (
                <div key={String(step)} className="rounded-lg border border-slate-700/60 bg-slate-950/35 p-3">
                  <span className="text-[11px] text-cyan-800 font-bold">ETAPA {step}</span>
                  <strong className="block text-sm mt-1">{label}</strong>
                  <span className="text-xs text-slate-400">{count} registro(s)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/70 bg-slate-900/35 p-4">
            <strong className="text-sm">Impacto previsto no caixa</strong>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-400">Saldo disponível</span><strong>{brl(availableBalance)}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-400">Repasses agendados</span><strong>{brl(payoutAgenda.scheduledTotal)}</strong></div>
              <div className="flex justify-between gap-3"><span className="text-slate-400">Em compliance</span><strong>{brl(payoutAgenda.reviewTotal)}</strong></div>
              <div className="border-t border-slate-700/70 pt-2 flex justify-between gap-3"><span className="text-slate-300">Saldo após agendados</span><strong className="text-emerald-700">{brl(payoutAgenda.projectedBalance)}</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <h3>Histórico de Repasses e Transferências</h3>
              <p>Rastreamento de solicitações, pagamentos executados e comprovantes bancários</p>
            </div>
          </div>

          <div className="table-tools-right">
            <div className="small-search">
              <Search size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por evento, produtora ou conta..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="type-filter-select">
              <Filter size={13} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">Todos os status</option>
                <option value="pending">Pendentes do Dashboard</option>
                <option value="pago">Pago</option>
                <option value="agendado">Agendado</option>
                <option value="processando">Processando</option>
                <option value="em análise">Em Análise</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento de Origem</th>
                <th>Produtora</th>
                <th>Conta de Destino</th>
                <th>Solicitado em</th>
                <th>Previsão / Pago em</th>
                <th>Forma</th>
                <th style={{ textAlign: 'right' }}>Valor Líquido</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><b>#{p.id}</b></td>
                  <td className="event-name-cell">
                    <strong>{p.event}</strong>
                  </td>
                  <td>
                    <span>{p.producer || 'Produtora Parceira'}</span>
                  </td>
                  <td>
                    <span className="bank-account-tag">{p.bankAccount}</span>
                  </td>
                  <td>{p.requestedAt}</td>
                  <td><b>{p.scheduledFor}</b></td>
                  <td>
                    <span className="badge-method">{p.method}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#10B981', fontSize: '14px' }}>{brl(p.net)}</strong>
                  </td>
                  <td>
                    <span className={`finance-status ${p.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="text-action"
                      onClick={() => setSelectedPayout(p)}
                      title="Ver Comprovante"
                    >
                      <Eye size={14} /> Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum repasse encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Solicitar Novo Repasse */}
      {showRequestModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowRequestModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">NOVA SOLICITAÇÃO</span>
                <h3>Solicitar Repasse Bancário</h3>
                <p>Transferência de saldo disponível de vendas para a conta bancária do produtor.</p>
              </div>
              <button className="icon-action" onClick={() => setShowRequestModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit}>
              <div className="modal-form-grid">
                <label>
                  Evento de Origem *
                  <select
                    value={formData.eventId}
                    onChange={e => setFormData({ ...formData, eventId: Number(e.target.value) })}
                    required
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} (ID.{ev.code})</option>
                    ))}
                  </select>
                </label>

                <label>
                  Conta Bancária Cadastrada *
                  <select
                    value={formData.bankAccountId}
                    onChange={e => setFormData({ ...formData, bankAccountId: Number(e.target.value) })}
                    required
                  >
                    {bankAccountsSeed.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} — Ag. {b.agency} C/C {b.accountNumber} ({b.holderName})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Forma de Liquidação *
                  <div className="radio-pills">
                    <button
                      type="button"
                      className={`radio-pill ${formData.method === 'PIX' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, method: 'PIX' })}
                    >
                      <Zap size={14} /> PIX Instantâneo (Gratuito)
                    </button>
                    <button
                      type="button"
                      className={`radio-pill ${formData.method === 'TED' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, method: 'TED' })}
                    >
                      <Landmark size={14} /> TED Tradicional (Mesmo dia)
                    </button>
                  </div>
                </label>

                <label>
                  Valor a Transferir (R$) *
                  <div className="input-money-wrap">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="100.00"
                      max={availableBalance}
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <small style={{ color: "var(--disk-text-muted)", marginTop: '4px', display: 'block' }}>
                    Saldo disponível: <b>{brl(availableBalance)}</b>
                  </small>
                </label>
              </div>

              <div className="payout-summary-box">
                <div className="payout-summary-row">
                  <span>Valor Solicitado (Bruto)</span>
                  <strong>{brl(parseFloat(formData.amount) || 0)}</strong>
                </div>
                <div className="payout-summary-row">
                  <span>Taxa de Transferência</span>
                  <strong style={{ color: '#10B981' }}>R$ 0,00 (Gratuito)</strong>
                </div>
                <div className="payout-summary-row total">
                  <span>Valor Líquido Creditado</span>
                  <strong>{brl(parseFloat(formData.amount) || 0)}</strong>
                </div>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowRequestModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Banknote size={15} /> Confirmar Repasse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Repasse */}
      {selectedPayout && (
        <div className="utm-modal-backdrop" onClick={() => setSelectedPayout(null)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">COMPROVANTE DE REPASSE BANCÁRIO</span>
                <h3>Repasse #{selectedPayout.id} — {selectedPayout.event}</h3>
                <p>Informações completas de liquidação, banco creditado e chave PIX.</p>
              </div>
              <button className="icon-action" onClick={() => setSelectedPayout(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="utm-order-detail-grid">
              <div className="utm-order-detail-item">
                <span>Evento de Origem</span>
                <strong>{selectedPayout.event}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Status da Liquidação</span>
                <strong className={`finance-status ${selectedPayout.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedPayout.status}
                </strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Data da Solicitação</span>
                <strong>{selectedPayout.requestedAt}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Previsão / Data Efetiva</span>
                <strong>{selectedPayout.scheduledFor}</strong>
              </div>
              <div className="utm-order-detail-item full">
                <span>Conta Bancária Creditada</span>
                <strong>{selectedPayout.bankAccount}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Método de Transferência</span>
                <strong className="badge-method">{selectedPayout.method}</strong>
              </div>
              <div className="utm-order-detail-item">
                <span>Valor Líquido Transferido</span>
                <strong style={{ color: '#10B981', fontSize: '18px' }}>{brl(selectedPayout.net)}</strong>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setSelectedPayout(null)}>
                Fechar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  notify(`Download do comprovante do repasse #${selectedPayout.id} iniciado!`)
                }}
              >
                <Download size={15} /> Baixar Comprovante PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
