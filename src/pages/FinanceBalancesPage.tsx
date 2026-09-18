import { useState, useMemo } from 'react'
import {
  WalletCards, Landmark, Banknote, ShieldCheck, Download, Plus, Search,
  CalendarRange, ArrowUpRight, ArrowDownLeft, Eye, RefreshCw, CheckCircle2,
  Lock, Percent, CircleDollarSign, ChevronRight, HelpCircle, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  eventBalances, financeSummary, bankAccountsSeed, payouts,
  type EventBalance, type Payout
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceBalancesPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [selectedEventForPayout, setSelectedEventForPayout] = useState<EventBalance | null>(null)

  const filteredBalances = useMemo(() => {
    return eventBalances.filter(b => {
      const matchesSearch = `${b.eventName} ${b.producer}`.toLowerCase().includes(search.toLowerCase())
      const matchesSelect = selectedEventId === 'all' || String(b.eventId) === selectedEventId
      return matchesSearch && matchesSelect
    })
  }, [search, selectedEventId])

  const totalAvailable = financeSummary.availableBalance
  const totalReceivable = financeSummary.receivable
  const totalBlocked = financeSummary.blockedBalance
  const totalGross = financeSummary.grossRevenue

  const handleOpenPayout = (b?: EventBalance) => {
    setSelectedEventForPayout(b || null)
    setShowPayoutModal(true)
  }

  const exportBalancesCSV = () => {
    const headers = ['ID', 'Evento', 'Produtora', 'Vendas Brutas (R$)', 'Taxas (R$)', 'Saldo Disponivel (R$)', 'A Receber (R$)', 'Bloqueado (R$)', 'Repassado (R$)']
    const rows = [headers.join(';')]
    filteredBalances.forEach(b => {
      rows.push([
        b.eventId,
        `"${b.eventName}"`,
        `"${b.producer}"`,
        b.grossSales.toFixed(2).replace('.', ','),
        b.fees.toFixed(2).replace('.', ','),
        b.available.toFixed(2).replace('.', ','),
        b.receivable.toFixed(2).replace('.', ','),
        b.blocked.toFixed(2).replace('.', ','),
        b.paidOut.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `saldos_consolidados_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório de Saldos exportado em CSV com sucesso!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">PATRIMÔNIO & CARTEIRA</span>
          <div className="finance-title-row">
            <h1>Saldos Consolidados</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Custódia Segura DiskIngressos
            </span>
          </div>
          <p className="page-subtitle">
            Acompanhe o saldo total acumulado, valores liberados para saque imediato, lançamentos a receber e reservas de garantia por evento.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-select-group">
            <span>Evento</span>
            <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
              <option value="all">Todos os eventos</option>
              {eventBalances.map(ev => (
                <option key={ev.eventId} value={ev.eventId}>{ev.eventName}</option>
              ))}
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportBalancesCSV} title="Exportar CSV">
              <Download size={15} /> Exportar
            </button>
            <button className="primary-btn" onClick={() => handleOpenPayout()}>
              <Banknote size={16} /> Solicitar Repasse
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <WalletCards size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo Disponível</span>
            <strong className="kpi-value">{brl(totalAvailable)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Liberado p/ Saque</span>
              <small>PIX em D+0 / TED em D+1</small>
            </div>
          </div>
          <button className="kpi-quick-btn" onClick={() => handleOpenPayout()}>
            Sacar <ChevronRight size={14} />
          </button>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <ArrowDownLeft size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Valores a Receber</span>
            <strong className="kpi-value">{brl(totalReceivable)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Vendas Parceladas</span>
              <small>Liquidação gradativa</small>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Lock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Reserva de Garantia</span>
            <strong className="kpi-value">{brl(totalBlocked)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Garantia Legal</span>
              <small>Retenção preventiva (5%)</small>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <CircleDollarSign size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Faturamento Bruto</span>
            <strong className="kpi-value">{brl(totalGross)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Total Processado</span>
              <small>4.820 ingressos</small>
            </div>
          </div>
        </article>
      </section>

      {/* Events Balance Breakdown Table */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <h3>Demonstrativo de Saldos por Evento</h3>
              <p>Valores segregados por centro de custo e lote de realização</p>
            </div>
          </div>

          <div className="table-tools-right">
            <div className="small-search">
              <Search size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por evento ou produtora..."
              />
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Evento / Espetáculo</th>
                <th>Produtora Responsável</th>
                <th style={{ textAlign: 'right' }}>Vendas Brutas</th>
                <th style={{ textAlign: 'right' }}>Taxa Plataforma</th>
                <th style={{ textAlign: 'right' }}>Saldo Disponível</th>
                <th style={{ textAlign: 'right' }}>A Receber</th>
                <th style={{ textAlign: 'right' }}>Bloqueado</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBalances.map(b => (
                <tr key={b.eventId}>
                  <td>
                    <div className="event-name-cell">
                      <strong>{b.eventName}</strong>
                      <small>ID: #{b.eventId}</small>
                    </div>
                  </td>
                  <td>
                    <span className="bank-account-tag">{b.producer}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>{brl(b.grossSales)}</strong>
                  </td>
                  <td style={{ textAlign: 'right', color: '#EF4444' }}>
                    <small>- {brl(b.fees)}</small>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#10B981', fontSize: '14px' }}>{brl(b.available)}</strong>
                  </td>
                  <td style={{ textAlign: 'right', color: '#1C79EF' }}>
                    <b>{brl(b.receivable)}</b>
                  </td>
                  <td style={{ textAlign: 'right', color: '#F59E0B' }}>
                    <span>{brl(b.blocked)}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="primary-btn compact-btn"
                      onClick={() => handleOpenPayout(b)}
                      title="Solicitar Repasse deste Evento"
                    >
                      <Banknote size={13} /> Sacar
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredBalances.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum saldo localizado para os critérios informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowPayoutModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">TRANSFERÊNCIA DE SALDOS</span>
                <h3>Solicitar Repasse de Saldo Disponível</h3>
                <p>
                  {selectedEventForPayout
                    ? `Transferência para o evento: ${selectedEventForPayout.eventName}`
                    : 'Transferência de valores disponíveis consolidados'}
                </p>
              </div>
              <button className="icon-action" onClick={() => setShowPayoutModal(false)}>✕</button>
            </div>

            <div className="modal-form-grid" style={{ padding: '10px 0' }}>
              <label>
                Conta de Destino:
                <select defaultValue={bankAccountsSeed[0].id}>
                  {bankAccountsSeed.map(b => (
                    <option key={b.id} value={b.id}>{b.bankName} — Ag. {b.agency} C/C {b.accountNumber} ({b.pixKey})</option>
                  ))}
                </select>
              </label>

              <label>
                Valor Solicitado (R$):
                <div className="input-money-wrap">
                  <span>R$</span>
                  <input
                    type="number"
                    defaultValue={selectedEventForPayout ? selectedEventForPayout.available : totalAvailable}
                    max={selectedEventForPayout ? selectedEventForPayout.available : totalAvailable}
                    step="0.01"
                  />
                </div>
                <small style={{ color: "var(--disk-text-muted)", marginTop: '4px', display: 'block' }}>
                  Saldo disponível: <b>{brl(selectedEventForPayout ? selectedEventForPayout.available : totalAvailable)}</b>
                </small>
              </label>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setShowPayoutModal(false)}>Cancelar</button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowPayoutModal(false)
                  notify('Solicitação de repasse bancário enviada com sucesso para aprovação!')
                }}
              >
                <Banknote size={15} /> Confirmar Repasse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
