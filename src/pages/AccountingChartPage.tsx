import { useState, useMemo } from 'react'
import {
  ListTree, Plus, Download, Search, Filter, CheckCircle2,
  FolderTree, FileText, ChevronRight, X, Sparkles, Building2
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  chartOfAccountsSeed, type AccountNode, type AccountGroup
} from '../data/accounting'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function AccountingChartPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [chartList, setChartList] = useState<AccountNode[]>(chartOfAccountsSeed)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Analítica' as AccountNode['type'],
    nature: 'Devedora' as AccountNode['nature'],
    group: 'Ativo' as AccountGroup,
    balance: ''
  })

  const filtered = useMemo(() => {
    return chartList.filter(acc => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        acc.code.toLowerCase().includes(q) ||
        acc.name.toLowerCase().includes(q)

      const matchesGroup = groupFilter === 'all' || acc.group === groupFilter
      const matchesType = typeFilter === 'all' || acc.type === typeFilter

      return matchesSearch && matchesGroup && matchesType
    })
  }, [chartList, search, groupFilter, typeFilter])

  const syntheticCount = chartList.filter(a => a.type === 'Sintética').length
  const analyticalCount = chartList.filter(a => a.type === 'Analítica').length

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.name) {
      notify('Informe o código e o nome da conta.')
      return
    }

    const val = parseFloat(formData.balance) || 0
    const level = formData.code.split('.').length

    const newAccount: AccountNode = {
      id: chartList.length + 1,
      code: formData.code,
      name: formData.name,
      type: formData.type,
      nature: formData.nature,
      group: formData.group,
      level,
      balance: val
    }

    setChartList([...chartList, newAccount])
    setShowAddModal(false)
    notify(`Conta contábil ${formData.code} — ${formData.name} adicionada ao plano de contas!`)
  }

  const exportChartCSV = () => {
    const headers = ['Codigo', 'Nome da Conta', 'Tipo', 'Natureza', 'Grupo', 'Nivel', 'Saldo Atual (R$)']
    const rows = [headers.join(';')]
    filtered.forEach(acc => {
      rows.push([
        `"${acc.code}"`,
        `"${acc.name}"`,
        `"${acc.type}"`,
        `"${acc.nature}"`,
        `"${acc.group}"`,
        acc.level,
        acc.balance.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plano_de_contas_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Plano de Contas exportado com sucesso em CSV!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">ESTRUTURA SOCIETÁRIA & SPED</span>
          <div className="finance-title-row">
            <h1>Plano de Contas Estruturado</h1>
            <span className="pipeline-status-badge" style={{ background: "var(--disk-color-info-subtle)", color: "var(--disk-color-info-text)", borderColor: "var(--disk-color-info-border)" }}>
              <Sparkles size={13} /> Padrão SPED Contábil ECD (I050)
            </span>
          </div>
          <p className="page-subtitle">
            Estrutura contábil padronizada em 5 níveis hierárquicos: Ativo, Passivo, Patrimônio Líquido, Receitas e Custos/Despesas.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={exportChartCSV} title="Exportar CSV">
              <Download size={15} /> Exportar Plano
            </button>
            <button className="primary-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Nova Conta Contábil
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <ListTree size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total de Contas</span>
            <strong className="kpi-value">{chartList.length} contas</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Estrutura 5 Grupos</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <FolderTree size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Contas Sintéticas (Grupo)</span>
            <strong className="kpi-value">{syntheticCount} sintéticas</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Agrupadoras</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <FileText size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Contas Analíticas</span>
            <strong className="kpi-value">{analyticalCount} analíticas</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Recebem lançamentos</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Building2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo Consolidado Ativo</span>
            <strong className="kpi-value">{brl(1840250.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">100% Equilibrado</span>
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
                placeholder="Buscar por código (ex: 1.1.01) ou nome..."
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
                <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
                  <option value="all">Todos os grupos</option>
                  <option value="Ativo">1. Ativo</option>
                  <option value="Passivo">2. Passivo</option>
                  <option value="Patrimônio Líquido">3. Patrimônio Líquido</option>
                  <option value="Receitas">4. Receitas</option>
                  <option value="Custos & Despesas">5. Custos & Despesas</option>
                </select>
              </div>

              <div className="type-filter-select">
                <FolderTree size={13} />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">Todos os tipos</option>
                  <option value="Sintética">Sintéticas (Agrupadoras)</option>
                  <option value="Analítica">Analíticas (Lançamentos)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th style={{ width: '140px' }}>Código</th>
                <th>Nome da Conta Contábil</th>
                <th>Grupo</th>
                <th>Tipo</th>
                <th>Natureza</th>
                <th style={{ textAlign: 'right' }}>Saldo Atual</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(acc => {
                const indentPx = (acc.level - 1) * 20
                const isSynthetic = acc.type === 'Sintética'

                return (
                  <tr
                    key={acc.id}
                    style={{
                      background: acc.level === 1 ? '#F1F5F9' : acc.level === 2 ? '#F8FAFC' : '#FFFFFF',
                      fontWeight: isSynthetic ? 700 : 400
                    }}
                  >
                    <td>
                      <code
                        style={{
                          fontSize: '12px',
                          color: acc.level === 1 ? '#0F172A' : '#1C79EF',
                          fontWeight: isSynthetic ? 800 : 600
                        }}
                      >
                        {acc.code}
                      </code>
                    </td>
                    <td>
                      <div style={{ paddingLeft: `${indentPx}px`, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isSynthetic ? (
                          <FolderTree size={14} style={{ color: "var(--disk-text-muted)", flexShrink: 0 }} />
                        ) : (
                          <FileText size={14} style={{ color: '#059669', flexShrink: 0 }} />
                        )}
                        <span style={{ color: isSynthetic ? '#0F172A' : '#334155' }}>
                          {acc.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="bank-account-tag">{acc.group}</span>
                    </td>
                    <td>
                      <span
                        className={[
                          'kpi-tag',
                          isSynthetic ? 'neutral' : 'positive'
                        ].join(' ')}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: acc.nature === 'Devedora' ? '#059669' : '#1C79EF', fontSize: '12px', fontWeight: 600 }}>
                        {acc.nature}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong
                        style={{
                          color: acc.balance >= 0 ? '#0F172A' : '#EF4444',
                          fontSize: isSynthetic ? '14px' : '13px'
                        }}
                      >
                        {brl(acc.balance)}
                      </strong>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhuma conta contábil localizada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal: Nova Conta Contábil */}
      {showAddModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">PLANO DE CONTAS</span>
                <h3>Cadastrar Nova Conta Contábil</h3>
                <p>Estruture uma nova conta sintética ou analítica no plano oficial.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-form-grid">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <label>
                    Código da Conta (Hierárquico) *
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Ex: 1.1.02.04"
                      required
                    />
                  </label>

                  <label>
                    Nome da Conta Contábil *
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Contas a Receber — PicPay / Boleto"
                      required
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <label>
                    Grupo Contábil *
                    <select
                      value={formData.group}
                      onChange={e => setFormData({ ...formData, group: e.target.value as any })}
                    >
                      <option value="Ativo">1. Ativo</option>
                      <option value="Passivo">2. Passivo</option>
                      <option value="Patrimônio Líquido">3. Patrimônio Líquido</option>
                      <option value="Receitas">4. Receitas</option>
                      <option value="Custos & Despesas">5. Custos & Despesas</option>
                    </select>
                  </label>

                  <label>
                    Tipo de Conta *
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                    >
                      <option value="Analítica">Analítica (Recebe Lançamentos)</option>
                      <option value="Sintética">Sintética (Grupo/Totais)</option>
                    </select>
                  </label>

                  <label>
                    Natureza do Saldo *
                    <select
                      value={formData.nature}
                      onChange={e => setFormData({ ...formData, nature: e.target.value as any })}
                    >
                      <option value="Devedora">Devedora [D]</option>
                      <option value="Credora">Credora [C]</option>
                    </select>
                  </label>
                </div>

                <label>
                  Saldo Inicial de Implantação (R$)
                  <div className="input-money-wrap">
                    <span>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.balance}
                      onChange={e => setFormData({ ...formData, balance: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                </label>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Plus size={15} /> Cadastrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
