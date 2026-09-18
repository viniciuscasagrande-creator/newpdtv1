import { useState, useMemo } from 'react'
import {
  BookOpenText, Download, Search, Filter, CheckCircle2,
  Calendar, Layers, Scale, Sparkles, X, ShieldCheck, Printer, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  accountingEntriesSeed, type AccountingEntry
} from '../data/accounting'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function AccountingJournalPage({ events, notify, onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('08/2026')
  const [originFilter, setOriginFilter] = useState('all')
  const [showTermModal, setShowTermModal] = useState(false)

  const entriesList = accountingEntriesSeed

  const filtered = useMemo(() => {
    return entriesList.filter(entry => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        entry.entryCode.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.debitAccount.toLowerCase().includes(q) ||
        entry.creditAccount.toLowerCase().includes(q) ||
        (entry.document || '').toLowerCase().includes(q)

      const matchesOrigin = originFilter === 'all' || entry.origin === originFilter

      return matchesSearch && matchesOrigin
    })
  }, [entriesList, search, originFilter])

  const totalDebits = filtered.reduce((a, b) => a + b.amount, 0)
  const totalCredits = filtered.reduce((a, b) => a + b.amount, 0)
  const balanceCheck = totalDebits - totalCredits

  const exportJournalCSV = () => {
    const headers = ['Lancamento', 'Data', 'Origem', 'Conta Debitada [D]', 'Conta Creditada [C]', 'Historico', 'Centro de Custo', 'Valor (R$)']
    const rows = [headers.join(';')]
    filtered.forEach(entry => {
      rows.push([
        `"${entry.entryCode}"`,
        `"${entry.date}"`,
        `"${entry.origin}"`,
        `"${entry.debitCode} - ${entry.debitAccount}"`,
        `"${entry.creditCode} - ${entry.creditAccount}"`,
        `"${entry.description}"`,
        `"${entry.costCenter || ''}"`,
        entry.amount.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `livro_diario_${period.replace('/', '_')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Livro Diário Oficial exportado em CSV com sucesso!')
  }

  return (
    <div className="finance-dashboard-wrapper">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => (onNavigate ? onNavigate('accounting-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Menu Contabilidade</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">ESCRITURAÇÃO OFICIAL & SPED ECD</span>
          <div className="finance-title-row">
            <h1>Livro Diário Geral</h1>
            <span className="pipeline-status-badge" style={{ background: "var(--disk-color-info-subtle)", color: "var(--disk-color-info-text)", borderColor: "var(--disk-color-info-border)" }}>
              <ShieldCheck size={13} /> Autenticação Digital SPED (I200 / I250)
            </span>
          </div>
          <p className="page-subtitle">
            Registro cronológico individualizado de todas as operações econômico-financeiras em partidas dobradas e ordem estrita de datas.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-select-group">
            <span>Exercício</span>
            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="08/2026">Agosto de 2026</option>
              <option value="07/2026">Julho de 2026</option>
              <option value="2026">Exercício Completo 2026</option>
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="tool-btn" onClick={() => setShowTermModal(true)} title="Termo de Abertura">
              <Printer size={15} /> Termo SPED
            </button>
            <button className="primary-btn" onClick={exportJournalCSV} title="Exportar Diário">
              <Download size={15} /> Exportar Livro Diário
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <BookOpenText size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Débitos no Livro</span>
            <strong className="kpi-value">{brl(totalDebits)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Aplicações [D]</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Layers size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Créditos no Livro</span>
            <strong className="kpi-value">{brl(totalCredits)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Origens [C]</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Scale size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Diferença de Partidas</span>
            <strong className="kpi-value">{brl(balanceCheck)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">100% Equilibrado</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Status da Escrituração</span>
            <strong className="kpi-value">Em Dia</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Sem pendências</span>
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
                placeholder="Buscar por lançamento, histórico ou conta..."
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
                  <option value="Venda">Vendas de Ingressos</option>
                  <option value="Gateway">Taxas e Gateways</option>
                  <option value="Repasse">Repasses a Produtoras</option>
                  <option value="Despesa">Despesas Operacionais</option>
                  <option value="Estorno">Estornos e Devoluções</option>
                  <option value="Manual">Lançamentos Manuais</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Lançamento</th>
                <th style={{ width: '120px' }}>Data</th>
                <th>Partidas Dobradas (Débito e Crédito)</th>
                <th>Histórico Contábil</th>
                <th>Centro de Custo</th>
                <th style={{ textAlign: 'right' }}>Valor Débito</th>
                <th style={{ textAlign: 'right' }}>Valor Crédito</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id}>
                  <td>
                    <div>
                      <strong style={{ color: '#1C79EF', fontSize: '12px' }}>{entry.entryCode}</strong>
                      <span
                        className={[
                          'bank-account-tag',
                          entry.origin === 'Venda' ? 'positive' :
                          entry.origin === 'Repasse' ? 'active' :
                          entry.origin === 'Despesa' ? 'warning' : 'neutral'
                        ].join(' ')}
                        style={{ marginTop: '3px', display: 'inline-block' }}
                      >
                        {entry.origin}
                      </span>
                    </div>
                  </td>
                  <td><span className="tx-date">{entry.date}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
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
                    <div className="transaction-desc">
                      <strong>{entry.description}</strong>
                      <small>Ref: {entry.document || 'DOC Interno'}</small>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11px', color: "var(--disk-text-secondary)" }}>
                      {entry.costCenter || 'Geral'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#059669', fontSize: '13px' }}>{brl(entry.amount)}</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#DC2626', fontSize: '13px' }}>{brl(entry.amount)}</strong>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    Nenhum lançamento localizado no Livro Diário para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: "var(--disk-bg-muted)", fontWeight: 800 }}>
                  <td colSpan={5} style={{ textAlign: 'right', fontSize: '13px' }}>TOTAIS DO LIVRO DIÁRIO:</td>
                  <td style={{ textAlign: 'right', color: '#059669', fontSize: '14px' }}>{brl(totalDebits)}</td>
                  <td style={{ textAlign: 'right', color: '#DC2626', fontSize: '14px' }}>{brl(totalCredits)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>

      {/* Modal: Termo de Abertura / Encerramento SPED */}
      {showTermModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowTermModal(false)}>
          <div className="utm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">TERMO DE ESCRITURAÇÃO SPED</span>
                <h3>Livro Diário Geral Digital (ECD)</h3>
                <p>Disk Produções e Eventos Ltda • CNPJ 44.821.902/0001-38</p>
              </div>
              <button className="icon-action" onClick={() => setShowTermModal(false)}>✕</button>
            </div>

            <div className="advance-simulation-body">
              <div style={{ background: "var(--disk-bg-muted)", padding: '16px', borderRadius: '8px', border: "1px solid var(--disk-border-default)", fontSize: '12px', lineHeight: '1.7', color: "var(--disk-text-secondary)" }}>
                <strong style={{ display: 'block', color: "var(--disk-text-primary)", fontSize: '13px', marginBottom: '8px' }}>
                  TERMO DE AUTENTICAÇÃO DIGITAL
                </strong>
                Contém este Livro Diário Geral o número de <strong>1.842 lançamentos</strong> escriturados em conformidade com as Normas Brasileiras de Contabilidade (NBC TG) e a Instrução Normativa RFB nº 2.003/2021.
                <br /><br />
                <strong>Hash de Autenticação ICP-Brasil:</strong><br />
                <code style={{ fontSize: '10px', color: '#1C79EF' }}>9f82a10b4c2e7182903847291a8e2b1029c8471928374a91b2c3d4e5f6a7b8c9</code>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setShowTermModal(false)}>Fechar</button>
              <button className="btn primary" onClick={() => { setShowTermModal(false); notify('Certificado SPED emitido com sucesso!') }}>
                <Printer size={15} /> Imprimir Termo de Abertura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
