import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, ChevronRight, CircleDollarSign, CreditCard, Download, Filter, Landmark, ReceiptText, Search, TrendingUp, WalletCards, X, CheckCircle2, ArrowLeft } from 'lucide-react'
import { cashFlow, payouts as seedPayouts, transactions as seedTransactions, type FinancialTransaction } from '../data/finance'
import type { EventItem } from '../data/events'

type FinanceTab = 'overview' | 'sales' | 'payouts' | 'cashflow' | 'statement'
type Props = { events: EventItem[]; initialTab?: FinanceTab; notify: (message: string) => void; onNavigate?: (page: any) => void }

const money = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinancePage({ events, initialTab = 'overview', notify, onNavigate }: Props) {
  const [tab, setTab] = useState<FinanceTab>(initialTab)
  const [query, setQuery] = useState('')
  const [event, setEvent] = useState('Todos os eventos')
  const [period, setPeriod] = useState('Últimos 30 dias')
  const [payoutList, setPayoutList] = useState(seedPayouts)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutEvent, setPayoutEvent] = useState(events[0]?.title || 'Festival Curitiba 2026')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutPix, setPayoutPix] = useState('financeiro@produtora.com.br')
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null)

  const tx = useMemo(() => seedTransactions.filter(t => {
    const matchesQuery = (t.event + ' ' + t.description + ' ' + t.type).toLowerCase().includes(query.toLowerCase())
    const matchesEvent = event === 'Todos os eventos' || t.event === event
    return matchesQuery && matchesEvent
  }), [query, event])

  const available = 15265.60, receivable = 72410.80, sold = 148750.00, paid = 57546.80

  const handleExportCsv = (type: string, rows: any[]) => {
    if (!rows.length) {
      notify('Sem dados para exportar.')
      return
    }
    const keys = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object')
    const esc = (v: any) => `"${String(v ?? '').replaceAll('"', '""')}"`
    const csv = [keys.join(';'), ...rows.map(r => keys.map(k => esc(r[k])).join(';'))].join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify(`Arquivo CSV de ${type} gerado e baixado com sucesso.`)
  }

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault()
    const gross = Number(payoutAmount.replace(',', '.')) || 5000
    const fees = gross * 0.02
    const net = gross - fees

    const newP = {
      id: payoutList.length + 1,
      event: payoutEvent,
      requestedAt: new Date().toLocaleDateString('pt-BR'),
      scheduledFor: new Date(Date.now() + 86400000 * 2).toLocaleDateString('pt-BR'),
      gross,
      fees,
      net,
      status: 'Processando' as const
    }

    setPayoutList([newP, ...payoutList])
    setShowPayoutModal(false)
    setPayoutAmount('')
    notify(`Solicitação de repasse no valor de ${money(net)} criada com sucesso!`)
  }

  return <div className="finance-page">
    <div className="flex items-center gap-2 mb-3">
      <button
        onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
      >
        <ArrowLeft size={14} className="text-[#06B6D4]" />
        <span>Voltar ao Dashboard Financeiro</span>
      </button>
    </div>
    <div className="page-head finance-head">
      <div>
        <p className="eyebrow">GESTÃO FINANCEIRA</p>
        <h1>Financeiro</h1>
        <p className="page-subtitle">Acompanhe saldo, vendas, recebimentos, repasses e fluxo de caixa.</p>
      </div>
      <div className="toolbar">
        <button className="tool-btn" onClick={() => handleExportCsv('financeiro-geral', tx)}>
          <Download size={16} />Exportar
        </button>
        <button className="primary-btn" onClick={() => setShowPayoutModal(true)}>
          <Banknote size={16} />Solicitar repasse
        </button>
      </div>
    </div>

    <div className="finance-tabs">
      {[['overview', 'Visão geral'], ['sales', 'Vendas'], ['payouts', 'Repasses'], ['cashflow', 'Fluxo de Caixa'], ['statement', 'Extrato']].map(([key, label]) => (
        <button key={key} onClick={() => setTab(key as FinanceTab)} className={tab === key ? 'active' : ''}>{label}</button>
      ))}
    </div>

    <div className="finance-filterbar card-surface">
      <div className="small-search wide">
        <Search size={15} />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar pedido, evento ou lançamento..." />
      </div>
      <select value={event} onChange={e => setEvent(e.target.value)}>
        <option>Todos os eventos</option>
        {events.map(e => <option key={e.id}>{e.title}</option>)}
      </select>
      <select value={period} onChange={e => setPeriod(e.target.value)}>
        <option>Hoje</option>
        <option>Últimos 7 dias</option>
        <option>Últimos 30 dias</option>
        <option>Este ano</option>
      </select>
      <button className="filter-icon-btn"><Filter size={16} /></button>
    </div>

    {tab === 'overview' && <>
      <div className="finance-kpis">
        <Kpi icon={<WalletCards />} label="Saldo disponível" value={money(available)} meta="Liberado para repasse" tone="blue" />
        <Kpi icon={<CalendarDays />} label="A receber" value={money(receivable)} meta="Próximos 30 dias" tone="cyan" />
        <Kpi icon={<TrendingUp />} label="Vendas no período" value={money(sold)} meta="+12,4% vs. período anterior" tone="green" />
        <Kpi icon={<Landmark />} label="Total repassado" value={money(paid)} meta="4 repasses concluídos" tone="purple" />
      </div>
      <div className="finance-grid-main">
        <section className="card-surface finance-chart-card">
          <div className="card-heading">
            <div>
              <h2>Receita e saídas</h2>
              <p>Movimentação financeira dos últimos 7 dias</p>
            </div>
            <span className="mini-badge">{period}</span>
          </div>
          <CashFlowChart />
        </section>
        <section className="card-surface balance-card">
          <div className="card-heading">
            <div>
              <h2>Composição do saldo</h2>
              <p>Visão consolidada da carteira</p>
            </div>
            <CircleDollarSign size={20} />
          </div>
          <div className="balance-big">
            <span>Saldo total</span>
            <strong>{money(available + receivable)}</strong>
          </div>
          <BalanceLine label="Disponível" value={available} total={available + receivable} />
          <BalanceLine label="A receber" value={receivable} total={available + receivable} />
          <div className="balance-footer">
            <span>Taxas estimadas</span>
            <strong>{money(4820.30)}</strong>
          </div>
        </section>
      </div>
      <section className="card-surface">
        <div className="table-toolbar">
          <div>
            <strong>Movimentações recentes</strong>
            <span className="table-subtitle">Últimos lançamentos financeiros</span>
          </div>
          <button className="text-action" onClick={() => setTab('statement')}>Ver extrato completo <ChevronRight size={15} /></button>
        </div>
        <TransactionsTable rows={tx.slice(0, 6)} />
      </section>
    </>}

    {tab === 'sales' && <section className="card-surface">
      <div className="section-banner">
        <div>
          <ReceiptText size={21} />
          <div>
            <h2>Vendas e recebimentos</h2>
            <p>Controle financeiro dos pedidos aprovados, pendentes e estornados.</p>
          </div>
        </div>
        <div className="compact-metrics">
          <span><b>{money(148750)}</b> faturamento</span>
          <span><b>428</b> pedidos</span>
          <span><b>{money(347.55)}</b> ticket médio</span>
        </div>
      </div>
      <TransactionsTable rows={tx.filter(t => t.type === 'Venda' || t.type === 'Estorno')} />
    </section>}

    {tab === 'payouts' && <section className="card-surface">
      <div className="section-banner">
        <div>
          <Landmark size={21} />
          <div>
            <h2>Repasses</h2>
            <p>Valores disponíveis, agendados, em processamento e pagos.</p>
          </div>
        </div>
        <button className="primary-btn compact-btn" onClick={() => setShowPayoutModal(true)}>
          <Banknote size={15} />Novo repasse
        </button>
      </div>
      <PayoutTable rows={payoutList} onDetails={p => setSelectedPayout(p)} />
    </section>}

    {tab === 'cashflow' && <div className="finance-grid-main cashflow-layout">
      <section className="card-surface finance-chart-card">
        <div className="card-heading">
          <div>
            <h2>Fluxo de Caixa</h2>
            <p>Entradas e saídas consolidadas</p>
          </div>
          <span className="mini-badge">7 dias</span>
        </div>
        <CashFlowChart large />
      </section>
      <section className="card-surface cash-summary">
        <h2>Resumo do período</h2>
        <div><ArrowDownLeft /><span>Entradas<strong>{money(cashFlow.reduce((a, b) => a + b.entry, 0))}</strong></span></div>
        <div><ArrowUpRight /><span>Saídas<strong>{money(cashFlow.reduce((a, b) => a + b.exit, 0))}</strong></span></div>
        <div className="net-result"><span>Resultado líquido</span><strong>{money(cashFlow.reduce((a, b) => a + b.entry - b.exit, 0))}</strong></div>
      </section>
    </div>}

    {tab === 'statement' && <section className="card-surface">
      <div className="section-banner">
        <div>
          <CreditCard size={21} />
          <div>
            <h2>Extrato financeiro</h2>
            <p>Histórico completo de entradas, saídas, taxas e estornos.</p>
          </div>
        </div>
        <button className="tool-btn compact-btn" onClick={() => handleExportCsv('extrato-financeiro', tx)}>
          <Download size={15} />Exportar extrato
        </button>
      </div>
      <TransactionsTable rows={tx} />
    </section>}

    {/* Modal Solicitar Repasse */}
    {showPayoutModal && (
      <div className="modal-backdrop">
        <div className="user-modal">
          <button className="modal-close" onClick={() => setShowPayoutModal(false)}><X size={18} /></button>
          <h3>Solicitar Repasse de Saldo</h3>
          <p>Informe o valor e os dados bancários para transferência via PIX / TED.</p>
          <form onSubmit={handleCreatePayout} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label>
              Evento de Origem
              <select value={payoutEvent} onChange={e => setPayoutEvent(e.target.value)}>
                {events.map(ev => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
              </select>
            </label>
            <label>
              Valor a Transferir (R$)
              <input
                type="number"
                step="0.01"
                required
                value={payoutAmount}
                onChange={e => setPayoutAmount(e.target.value)}
                placeholder="Ex: 5000.00"
              />
            </label>
            <label>
              Chave PIX de Destino
              <input
                type="text"
                required
                value={payoutPix}
                onChange={e => setPayoutPix(e.target.value)}
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <button type="button" className="secondary-btn" onClick={() => setShowPayoutModal(false)}>Cancelar</button>
              <button type="submit" className="primary-btn">Confirmar Repasse</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal Detalhes do Repasse */}
    {selectedPayout && (
      <div className="modal-backdrop">
        <div className="user-modal">
          <button className="modal-close" onClick={() => setSelectedPayout(null)}><X size={18} /></button>
          <h3>Detalhes do Repasse #{selectedPayout.id}</h3>
          <p>Comprovante e rastreamento da liquidação bancária.</p>
          <div style={{ background: "var(--disk-bg-muted)", padding: 14, borderRadius: 8, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <div><b>Evento:</b> {selectedPayout.event}</div>
            <div><b>Data de Solicitação:</b> {selectedPayout.requestedAt}</div>
            <div><b>Previsão de Crédito:</b> {selectedPayout.scheduledFor}</div>
            <div><b>Valor Bruto:</b> {money(selectedPayout.gross)}</div>
            <div><b>Taxas e Retenções:</b> {money(selectedPayout.fees)}</div>
            <div><b>Valor Líquido:</b> <strong style={{ color: '#10b981' }}>{money(selectedPayout.net)}</strong></div>
            <div><b>Status Bancário:</b> <span className={`finance-status ${selectedPayout.status.toLowerCase()}`}>{selectedPayout.status}</span></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="primary-btn" onClick={() => setSelectedPayout(null)}>Fechar</button>
          </div>
        </div>
      </div>
    )}
  </div>
}

function Kpi({ icon, label, value, meta, tone }: { icon: React.ReactNode, label: string, value: string, meta: string, tone: string }) {
  return <div className="finance-kpi card-surface">
    <span className={`finance-kpi-icon ${tone}`}>{icon}</span>
    <div>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{meta}</em>
    </div>
  </div>
}

function CashFlowChart({ large = false }: { large?: boolean }) {
  const max = Math.max(...cashFlow.flatMap(d => [d.entry, d.exit]))
  return <div className={`cash-chart ${large ? 'large' : ''}`}>
    <div className="chart-legend">
      <span><i className="entry-dot" />Entradas</span>
      <span><i className="exit-dot" />Saídas</span>
    </div>
    <div className="bar-chart">
      {cashFlow.map(d => (
        <div className="bar-day" key={d.day}>
          <div className="bar-pair">
            <i className="entry-bar" style={{ height: `${Math.max(8, d.entry / max * 100)}%` }} title={money(d.entry)} />
            <i className="exit-bar" style={{ height: `${Math.max(8, d.exit / max * 100)}%` }} title={money(d.exit)} />
          </div>
          <span>{d.day}</span>
        </div>
      ))}
    </div>
  </div>
}

function BalanceLine({ label, value, total }: { label: string, value: number, total: number }) {
  return <div className="balance-line">
    <div>
      <span>{label}</span>
      <b>{money(value)}</b>
    </div>
    <div className="balance-track">
      <i style={{ width: `${value / total * 100}%` }} />
    </div>
  </div>
}

function TransactionsTable({ rows }: { rows: FinancialTransaction[] }) {
  return <div className="lots-table-wrap">
    <table className="lots-table finance-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th>Evento</th>
          <th>Forma</th>
          <th>Status</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(t => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>
              <div className="transaction-desc">
                <span className={`transaction-icon ${t.value >= 0 ? 'in' : 'out'}`}>
                  {t.value >= 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </span>
                <div>
                  <strong>{t.description}</strong>
                  <small>{t.type}</small>
                </div>
              </div>
            </td>
            <td className="event-name-cell">{t.event}</td>
            <td>{t.method}</td>
            <td>
              <span className={`finance-status ${t.status.toLowerCase()}`}>{t.status}</span>
            </td>
            <td className={t.value >= 0 ? 'money-positive' : 'money-negative'}>
              {t.value >= 0 ? '+ ' : ''}{money(t.value)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
}

function PayoutTable({ rows, onDetails }: { rows: any[], onDetails: (p: any) => void }) {
  return <div className="lots-table-wrap">
    <table className="lots-table finance-table">
      <thead>
        <tr>
          <th>Evento</th>
          <th>Solicitado em</th>
          <th>Previsão</th>
          <th>Bruto</th>
          <th>Taxas</th>
          <th>Líquido</th>
          <th>Status</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(p => (
          <tr key={p.id}>
            <td className="event-name-cell">
              <strong>{p.event}</strong>
            </td>
            <td>{p.requestedAt}</td>
            <td>{p.scheduledFor}</td>
            <td>{money(p.gross)}</td>
            <td>{money(p.fees)}</td>
            <td>
              <strong>{money(p.net)}</strong>
            </td>
            <td>
              <span className={`finance-status ${p.status.toLowerCase()}`}>{p.status}</span>
            </td>
            <td>
              <button className="text-action" onClick={() => onDetails(p)}>Detalhes</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
}

