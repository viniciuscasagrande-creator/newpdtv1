import { useState, useMemo } from 'react'
import {
  ReceiptText, Clock, CheckCircle2, Search, Plus, Filter,
  Download, X, Calendar, Landmark, DollarSign, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  expensesSeed, type ExpenseItem
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceExpensesPage({ events, notify, onNavigate }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('Todos')
  const [category, setCategory] = useState('Todas')
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>(expensesSeed)
  const [showAddModal, setShowAddModal] = useState(false)

  // New expense form
  const [formData, setFormData] = useState({
    supplier: '',
    category: 'Infraestrutura' as ExpenseItem['category'],
    event: 'Corporativo',
    document: '',
    amount: '',
    paymentMethod: 'PIX'
  })

  const total = expensesList.reduce((a, x) => a + x.amount, 0)
  const pending = expensesList.filter(x => x.status === 'Pendente').reduce((a, x) => a + x.amount, 0)
  const paid = expensesList.filter(x => x.status === 'Pago').reduce((a, x) => a + x.amount, 0)

  const rows = useMemo(() => {
    const q = query.toLowerCase().trim()
    return expensesList.filter(x => {
      const matchStatus = status === 'Todos' || x.status === status
      const matchCat = category === 'Todas' || x.category === category
      const matchQuery =
        !q ||
        x.supplier.toLowerCase().includes(q) ||
        x.category.toLowerCase().includes(q) ||
        x.event.toLowerCase().includes(q)
      return matchStatus && matchCat && matchQuery
    })
  }, [expensesList, query, status, category])

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(formData.amount)
    if (isNaN(val) || val <= 0) {
      notify('Informe um valor válido.')
      return
    }

    const newItem: ExpenseItem = {
      id: expensesList.length + 1,
      date: new Date().toLocaleDateString('pt-BR'),
      supplier: formData.supplier || 'Fornecedor',
      category: formData.category,
      event: formData.event,
      document: formData.document || `NF-${Date.now().toString().slice(-5)}`,
      amount: val,
      status: 'Pendente',
      paymentMethod: formData.paymentMethod
    }

    setExpensesList([newItem, ...expensesList])
    setShowAddModal(false)
    notify(`Despesa de ${brl(val)} registrada com sucesso!`)
  }

  const exportExpensesCSV = () => {
    const headers = ['ID', 'Data', 'Fornecedor', 'Categoria', 'Evento', 'Documento', 'Forma', 'Valor (R$)', 'Status']
    const rowsCSV = [headers.join(';')]
    rows.forEach(r => {
      rowsCSV.push([
        r.id,
        `"${r.date}"`,
        `"${r.supplier}"`,
        `"${r.category}"`,
        `"${r.event}"`,
        `"${r.document}"`,
        `"${r.paymentMethod}"`,
        r.amount.toFixed(2).replace('.', ','),
        `"${r.status}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rowsCSV.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `despesas_operacionais_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Relatório de Despesas exportado em CSV com sucesso!')
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
          <span className="eyebrow">CONTROLE DE CUSTOS</span>
          <div className="finance-title-row">
            <h1>Despesas Operacionais</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Gestão de Custos Ativa
            </span>
          </div>
          <p className="page-subtitle">
            Gerencie despesas operacionais, infraestrutura cloud, marketing digital e custos vinculados a eventos.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportExpensesCSV} title="Exportar CSV">
              <Download size={15} /> Exportar CSV
            </button>
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Nova Despesa
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <ReceiptText size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total de Despesas</span>
            <strong className="kpi-value">{brl(total)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Lançamentos do período</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Clock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Pendentes de Quitação</span>
            <strong className="kpi-value">{brl(pending)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Aguardando pagamento</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Despesas Quitadas</span>
            <strong className="kpi-value">{brl(paid)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">100% Baixadas</span>
            </div>
          </div>
        </article>
      </section>

      {/* Table Section */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="table-tools-right" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className="small-search" style={{ width: '320px' }}>
              <Search size={14} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar fornecedor, categoria ou evento..."
              />
              {query && (
                <button onClick={() => setQuery('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="type-filter-select">
                <Filter size={13} />
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Todas">Todas as categorias</option>
                  <option value="Infraestrutura">Infraestrutura</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operacional">Operacional</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Evento">Evento</option>
                </select>
              </div>

              <div className="type-filter-select">
                <Clock size={13} />
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Todos">Todos os status</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Agendado">Agendado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Fornecedor</th>
                <th>Categoria</th>
                <th>Evento Vinculado</th>
                <th>Documento Fiscal</th>
                <th>Forma de Pagamento</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(item => (
                <tr key={item.id}>
                  <td><span className="tx-date">{item.date}</span></td>
                  <td><strong>{item.supplier}</strong></td>
                  <td><span className="bank-account-tag">{item.category}</span></td>
                  <td className="event-name-cell">{item.event}</td>
                  <td><code style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{item.document}</code></td>
                  <td><span className="badge-method">{item.paymentMethod}</span></td>
                  <td>
                    <span className={`finance-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#F43F5E', fontSize: '14px' }}>{brl(item.amount)}</strong>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhuma despesa localizada para os critérios informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Nova Despesa */}
      {showAddModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">NOVO LANÇAMENTO</span>
                <h3>Cadastrar Nova Despesa</h3>
                <p>Insira os dados fiscais e o comprovante da despesa.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-form-grid">
                <label>
                  Nome do Fornecedor *
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Ex: AWS Brasil, Google Ads, Locadora de Palco..."
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Categoria *
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    >
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Operacional">Operacional</option>
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Evento">Evento</option>
                    </select>
                  </label>

                  <label>
                    Evento de Origem *
                    <select
                      value={formData.event}
                      onChange={e => setFormData({ ...formData, event: e.target.value })}
                    >
                      <option value="Corporativo">Corporativo / Geral</option>
                      {events.map(ev => (
                        <option key={ev.id} value={ev.title}>{ev.title}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Número do Documento / NF *
                    <input
                      type="text"
                      value={formData.document}
                      onChange={e => setFormData({ ...formData, document: e.target.value })}
                      placeholder="Ex: NF-99241, FAT-1029"
                      required
                    />
                  </label>

                  <label>
                    Forma de Pagamento *
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="PIX">PIX</option>
                      <option value="Boleto">Boleto Bancário</option>
                      <option value="TED">TED</option>
                      <option value="Cartão corporativo">Cartão Corporativo</option>
                      <option value="Débito automático">Débito Automático</option>
                    </select>
                  </label>
                </div>

                <label>
                  Valor da Despesa (R$) *
                  <div className="input-money-wrap">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </label>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Plus size={15} /> Gravar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
