import { useState, useMemo } from 'react'
import {
  NotebookTabs, Plus, Download, Search, Filter, CheckCircle2,
  Sparkles, Layers, ArrowLeftRight, X, Scale, FileText
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  accountingEntriesSeed, chartOfAccountsSeed,
  type AccountingEntry
} from '../data/accounting'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function AccountingEntriesPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [originFilter, setOriginFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [entriesList, setEntriesList] = useState<AccountingEntry[]>(accountingEntriesSeed)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    origin: 'Manual' as AccountingEntry['origin'],
    debitCode: '5.5',
    debitAccount: 'Despesas Administrativas e Tributos',
    creditCode: '1.1.01.02',
    creditAccount: 'Banco Itaú S.A. Movimento',
    amount: '',
    costCenter: 'CC-000 — Corporativo',
    document: ''
  })

  const filtered = useMemo(() => {
    return entriesList.filter(entry => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        entry.entryCode.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        (entry.document || '').toLowerCase().includes(q) ||
        (entry.costCenter || '').toLowerCase().includes(q)

      const matchesOrigin = originFilter === 'all' || entry.origin === originFilter
      const matchesStatus = statusFilter === 'all' || entry.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesOrigin && matchesStatus
    })
  }, [entriesList, search, originFilter, statusFilter])

  const totalAmount = entriesList.reduce((a, b) => a + b.amount, 0)
  const autoCount = entriesList.filter(e => e.status === 'Automático').length
  const manualCount = entriesList.filter(e => e.status === 'Manual').length

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(formData.amount)
    if (isNaN(val) || val <= 0) {
      notify('Informe um valor válido para o lançamento.')
      return
    }

    const newEntry: AccountingEntry = {
      id: entriesList.length + 1,
      entryCode: `LCT-2026-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5),
      origin: formData.origin,
      description: formData.description || 'Lançamento Contábil Manual',
      debitCode: formData.debitCode,
      debitAccount: formData.debitAccount,
      creditCode: formData.creditCode,
      creditAccount: formData.creditAccount,
      amount: val,
      status: 'Manual',
      costCenter: formData.costCenter,
      document: formData.document || `MAN-${Date.now().toString().slice(-4)}`
    }

    setEntriesList([newEntry, ...entriesList])
    setShowAddModal(false)
    notify(`Lançamento manual ${newEntry.entryCode} escriturado com sucesso!`)
  }

  const exportEntriesCSV = () => {
    const headers = ['Codigo', 'Data', 'Origem', 'Descricao', 'Conta Debito [D]', 'Conta Credito [C]', 'Centro de Custo', 'Documento', 'Valor (R$)', 'Status']
    const rows = [headers.join(';')]
    filtered.forEach(entry => {
      rows.push([
        `"${entry.entryCode}"`,
        `"${entry.date}"`,
        `"${entry.origin}"`,
        `"${entry.description}"`,
        `"${entry.debitCode} - ${entry.debitAccount}"`,
        `"${entry.creditCode} - ${entry.creditAccount}"`,
        `"${entry.costCenter || ''}"`,
        `"${entry.document || ''}"`,
        entry.amount.toFixed(2).replace('.', ','),
        `"${entry.status}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lancamentos_contabeis_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Livro de Lançamentos Contábeis exportado em CSV!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">ESCRITURAÇÃO & PARTIDAS DOBRADAS</span>
          <div className="finance-title-row">
            <h1>Lançamentos Contábeis Integrados</h1>
            <span className="pipeline-status-badge" style={{ background: "var(--disk-color-info-subtle)", color: "var(--disk-color-info-text)", borderColor: "var(--disk-color-info-border)" }}>
              <Sparkles size={13} /> Geração Automática por Venda / Repasse
            </span>
          </div>
          <p className="page-subtitle">
            Escrituração contábil em partidas dobradas sincronizada em tempo real com bilheteria, retenções de taxas, liquidações e fornecedores.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportEntriesCSV} title="Exportar CSV">
              <Download size={15} /> Exportar Lançamentos
            </button>
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Novo Lançamento Manual
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <NotebookTabs size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total de Lançamentos</span>
            <strong className="kpi-value">1.842 lançamentos</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">{entriesList.length} recentes</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Sparkles size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Lançamentos Automáticos</span>
            <strong className="kpi-value">99,7%</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Vendas + Repasses</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Scale size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Equilíbrio Débito / Crédito</span>
            <strong className="kpi-value">100% Batido</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">D = C (Sem desvios)</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Layers size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Lançamentos Manuais</span>
            <strong className="kpi-value">{manualCount} registros</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Ajustes auditados</span>
            </div>
          </div>
        </article>
      </section>

      {/* Table Section */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="table-tools-right" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className="small-search" style={{ width: '340px' }}>
              <Search size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar código, descrição ou centro de custo..."
              />
              {search && (
                <button onClick={() => setSearch('')} className="icon-clear">
                  <X size={12} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="type-filter-select">
                <Filter size={13} />
                <select value={originFilter} onChange={e => setOriginFilter(e.target.value)}>
                  <option value="all">Todas as origens</option>
                  <option value="Venda">Venda de Ingresso</option>
                  <option value="Gateway">Taxa / Gateway</option>
                  <option value="Repasse">Repasse a Produtor</option>
                  <option value="Despesa">Despesa Operacional</option>
                  <option value="Estorno">Estorno / Reembolso</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div className="type-filter-select">
                <CheckCircle2 size={13} />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="all">Todos os status</option>
                  <option value="automático">Automático</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Código / Data</th>
                <th>Origem</th>
                <th>Histórico do Lançamento</th>
                <th>Partidas Dobradas (Débito e Crédito)</th>
                <th>Centro de Custo</th>
                <th style={{ textAlign: 'right' }}>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div>
                      <strong style={{ color: '#1C79EF', fontSize: '12px' }}>{entry.entryCode}</strong>
                      <small style={{ display: 'block', color: "var(--disk-text-muted)" }}>{entry.date}</small>
                    </div>
                  </td>
                  <td>
                    <span
                      className={[
                        'bank-account-tag',
                        entry.origin === 'Venda' ? 'positive' :
                        entry.origin === 'Repasse' ? 'active' :
                        entry.origin === 'Despesa' ? 'warning' : 'neutral'
                      ].join(' ')}
                    >
                      {entry.origin}
                    </span>
                  </td>
                  <td>
                    <div className="transaction-desc">
                      <strong>{entry.description}</strong>
                      <small>{entry.document || 'Sem Documento'}</small>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                      <div>
                        <span style={{ color: '#059669', fontWeight: 800 }}>[D]</span>{' '}
                        <code>{entry.debitCode}</code> {entry.debitAccount}
                      </div>
                      <div>
                        <span style={{ color: '#DC2626', fontWeight: 800 }}>[C]</span>{' '}
                        <code>{entry.creditCode}</code> {entry.creditAccount}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: "var(--disk-text-secondary)" }}>
                      {entry.costCenter || 'Geral'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: "var(--disk-text-primary)", fontSize: '14px' }}>{brl(entry.amount)}</strong>
                  </td>
                  <td>
                    <span className={`finance-status ${entry.status.toLowerCase()}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum lançamento contábil localizado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Novo Lançamento Manual */}
      {showAddModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">LANÇAMENTO CONTÁBIL</span>
                <h3>Novo Lançamento Manual (Partidas Dobradas)</h3>
                <p>Insira a conta de Débito [D] e a conta de Crédito [C] com o mesmo valor.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-form-grid">
                <label>
                  Histórico Contábil / Descrição *
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Ajuste contábil de conciliação bancária..."
                    required
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Conta a Debitar [D] (Aplicação) *
                    <select
                      value={formData.debitCode}
                      onChange={e => {
                        const code = e.target.value
                        const acc = chartOfAccountsSeed.find(a => a.code === code)
                        setFormData({
                          ...formData,
                          debitCode: code,
                          debitAccount: acc ? acc.name : ''
                        })
                      }}
                    >
                      {chartOfAccountsSeed.filter(a => a.type === 'Analítica').map(a => (
                        <option key={a.id} value={a.code}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Conta a Creditar [C] (Origem) *
                    <select
                      value={formData.creditCode}
                      onChange={e => {
                        const code = e.target.value
                        const acc = chartOfAccountsSeed.find(a => a.code === code)
                        setFormData({
                          ...formData,
                          creditCode: code,
                          creditAccount: acc ? acc.name : ''
                        })
                      }}
                    >
                      {chartOfAccountsSeed.filter(a => a.type === 'Analítica').map(a => (
                        <option key={a.id} value={a.code}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Centro de Custo
                    <select
                      value={formData.costCenter}
                      onChange={e => setFormData({ ...formData, costCenter: e.target.value })}
                    >
                      <option value="CC-000 — Corporativo">CC-000 — Corporativo / Geral</option>
                      <option value="CC-001 — Show Iron Maiden">CC-001 — Show Iron Maiden</option>
                      <option value="CC-002 — Sem Parar">CC-002 — Sem Parar</option>
                      <option value="CC-003 — 4 Amigos 2026">CC-003 — 4 Amigos 2026</option>
                      <option value="CC-004 — Conferência Espírita">CC-004 — Conferência Espírita</option>
                    </select>
                  </label>

                  <label>
                    Documento de Referência
                    <input
                      type="text"
                      value={formData.document}
                      onChange={e => setFormData({ ...formData, document: e.target.value })}
                      placeholder="Ex: DOC-AJU-0826"
                    />
                  </label>
                </div>

                <label>
                  Valor do Lançamento (R$) *
                  <div className="input-money-wrap">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
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
                  <Plus size={15} /> Gravar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
