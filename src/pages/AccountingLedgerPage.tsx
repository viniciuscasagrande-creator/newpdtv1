import { useState, useMemo } from 'react'
import {
  BookMarked, Download, Search, Filter, CheckCircle2,
  Layers, Scale, Sparkles, ArrowLeftRight, ArrowDownLeft,
  ArrowUpRight, Landmark, Building2, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  chartOfAccountsSeed, sampleLedgerMovements,
  type AccountNode, type LedgerMovement
} from '../data/accounting'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function AccountingLedgerPage({ events, notify, onNavigate }: Props) {
  const analyticalAccounts = useMemo(() => chartOfAccountsSeed.filter(a => a.type === 'Analítica'), [])
  const [selectedCode, setSelectedCode] = useState(analyticalAccounts[1]?.code || '1.1.01.02')
  const [search, setSearch] = useState('')

  const currentAccount = analyticalAccounts.find(a => a.code === selectedCode) || analyticalAccounts[0]

  const movements: LedgerMovement[] = useMemo(() => {
    if (sampleLedgerMovements[selectedCode]) {
      return sampleLedgerMovements[selectedCode]
    }
    // Generate standard ledger movement for any other selected account
    const isDeb = currentAccount.nature === 'Devedora'
    return [
      { id: 1, date: '01/08/2026', entryCode: 'SALDO-ANT', description: 'Saldo Inicial de Transporte do Exercício', counterpart: 'Transporte de Balancete', debit: isDeb ? currentAccount.balance * 0.7 : 0, credit: !isDeb ? currentAccount.balance * 0.7 : 0, balance: currentAccount.balance * 0.7 },
      { id: 2, date: '20/08/2026', entryCode: 'LCT-2026-0881', description: `Movimentação Competência Mês 08 — ${currentAccount.name}`, counterpart: 'Contrapartida Contábil Integrada', debit: isDeb ? currentAccount.balance * 0.3 : 0, credit: !isDeb ? currentAccount.balance * 0.3 : 0, balance: currentAccount.balance }
    ]
  }, [selectedCode, currentAccount])

  const totalDebits = movements.reduce((a, b) => a + b.debit, 0)
  const totalCredits = movements.reduce((a, b) => a + b.credit, 0)

  const exportLedgerCSV = () => {
    const headers = ['Data', 'Lancamento', 'Descricao', 'Contrapartida', 'Debito (R$)', 'Credito (R$)', 'Saldo Acumulado (R$)']
    const rows = [headers.join(';')]
    movements.forEach(m => {
      rows.push([
        `"${m.date}"`,
        `"${m.entryCode}"`,
        `"${m.description}"`,
        `"${m.counterpart}"`,
        m.debit.toFixed(2).replace('.', ','),
        m.credit.toFixed(2).replace('.', ','),
        m.balance.toFixed(2).replace('.', ',')
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `livro_razao_${selectedCode.replace(/\./g, '_')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify(`Livro Razão da conta ${selectedCode} exportado em CSV!`)
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
          <span className="eyebrow">RAZONETES & CONTROLE ANALÍTICO</span>
          <div className="finance-title-row">
            <h1>Livro Razão Analítico</h1>
            <span className="pipeline-status-badge" style={{ background: "var(--disk-color-info-subtle)", color: "var(--disk-color-info-text)", borderColor: "var(--disk-color-info-border)" }}>
              <Sparkles size={13} /> Padrão SPED ECD (Registro I350)
            </span>
          </div>
          <p className="page-subtitle">
            Demonstração analítica individualizada por conta contábil, evidenciando débitos, créditos e evolução progressiva dos saldos.
          </p>
        </div>

        <div className="finance-header-controls">
          <div className="finance-select-group" style={{ minWidth: '320px' }}>
            <span>Conta Analítica</span>
            <select value={selectedCode} onChange={e => setSelectedCode(e.target.value)}>
              {analyticalAccounts.map(acc => (
                <option key={acc.id} value={acc.code}>
                  {acc.code} — {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="finance-action-buttons">
            <button className="primary-btn" onClick={exportLedgerCSV} title="Exportar Razão">
              <Download size={15} /> Exportar Razão
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Strip for Selected Account */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Saldo Atual da Conta</span>
            <strong className="kpi-value">{brl(currentAccount.balance)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">{currentAccount.nature}</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <ArrowDownLeft size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Débitos [D]</span>
            <strong className="kpi-value">{brl(totalDebits)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Entradas / Aplicações</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <ArrowUpRight size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Créditos [C]</span>
            <strong className="kpi-value">{brl(totalCredits)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Saídas / Origens</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Building2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Grupo Contábil</span>
            <strong className="kpi-value" style={{ fontSize: '18px' }}>{currentAccount.group}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Conta Analítica</span>
            </div>
          </div>
        </article>
      </section>

      {/* T-Account Visual Razonete */}
      <section
        className="card-surface"
        style={{
          padding: '24px',
          borderRadius: '12px',
          background: "var(--disk-bg-surface)",
          border: "1px solid var(--disk-border-default)"
        }}
      >
        <div style={{ textAlign: 'center', borderBottom: "2px solid var(--disk-border-default)", paddingBottom: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#1C79EF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            RAZONETE CONTÁBIL EM T
          </span>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: "var(--disk-text-primary)", margin: '4px 0 0 0' }}>
            {currentAccount.code} — {currentAccount.name}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', position: 'relative' }}>
          {/* Left Column: DEBITS */}
          <div style={{ borderRight: "2px solid var(--disk-border-default)", paddingRight: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#059669', fontSize: '14px', marginBottom: '12px' }}>
              <span>DÉBITO [D]</span>
              <span>VALOR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {movements.filter(m => m.debit > 0).map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: "1px dashed var(--disk-border-default)" }}>
                  <div>
                    <strong>{m.entryCode}</strong>
                    <small style={{ display: 'block', color: "var(--disk-text-muted)" }}>{m.description}</small>
                  </div>
                  <strong style={{ color: '#059669' }}>{brl(m.debit)}</strong>
                </div>
              ))}
              {!movements.filter(m => m.debit > 0).length && (
                <div style={{ color: "var(--disk-text-muted)", fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                  Nenhum lançamento a débito.
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '2px solid #059669', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span>TOTAL DÉBITOS:</span>
              <span style={{ color: '#059669' }}>{brl(totalDebits)}</span>
            </div>
          </div>

          {/* Right Column: CREDITS */}
          <div style={{ paddingLeft: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#DC2626', fontSize: '14px', marginBottom: '12px' }}>
              <span>CRÉDITO [C]</span>
              <span>VALOR</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {movements.filter(m => m.credit > 0).map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: "1px dashed var(--disk-border-default)" }}>
                  <div>
                    <strong>{m.entryCode}</strong>
                    <small style={{ display: 'block', color: "var(--disk-text-muted)" }}>{m.description}</small>
                  </div>
                  <strong style={{ color: '#DC2626' }}>{brl(m.credit)}</strong>
                </div>
              ))}
              {!movements.filter(m => m.credit > 0).length && (
                <div style={{ color: "var(--disk-text-muted)", fontSize: '12px', textAlign: 'center', padding: '16px' }}>
                  Nenhum lançamento a crédito.
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '2px solid #DC2626', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <span>TOTAL CRÉDITOS:</span>
              <span style={{ color: '#DC2626' }}>{brl(totalCredits)}</span>
            </div>
          </div>
        </div>

        {/* Footer Balance of the Account */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 20px',
            borderRadius: '8px',
            background: "var(--disk-bg-muted)",
            border: "1px solid var(--disk-border-default)",
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: "var(--disk-text-secondary)" }}>
            SALDO FINAL APURADO DA CONTA:
          </span>
          <strong style={{ fontSize: '18px', color: currentAccount.balance >= 0 ? '#059669' : '#EF4444' }}>
            {brl(currentAccount.balance)} ({currentAccount.nature === 'Devedora' ? 'D' : 'C'})
          </strong>
        </div>
      </section>

      {/* Movement Table */}
      <section className="finance-table-section card-surface" style={{ marginTop: '20px' }}>
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <h3>Extrato Analítico do Livro Razão</h3>
              <p>Histórico completo de lançamentos e evolução do saldo acumulado</p>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Data</th>
                <th style={{ width: '140px' }}>Lançamento</th>
                <th>Histórico / Descrição</th>
                <th>Contrapartida Contábil</th>
                <th style={{ textAlign: 'right' }}>Débito [D]</th>
                <th style={{ textAlign: 'right' }}>Crédito [C]</th>
                <th style={{ textAlign: 'right' }}>Saldo Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id}>
                  <td><span className="tx-date">{m.date}</span></td>
                  <td><strong style={{ color: '#1C79EF' }}>{m.entryCode}</strong></td>
                  <td>
                    <div className="transaction-desc">
                      <strong>{m.description}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="bank-account-tag">{m.counterpart}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {m.debit > 0 ? (
                      <strong style={{ color: '#059669' }}>{brl(m.debit)}</strong>
                    ) : (
                      <span style={{ color: "var(--disk-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {m.credit > 0 ? (
                      <strong style={{ color: '#DC2626' }}>{brl(m.credit)}</strong>
                    ) : (
                      <span style={{ color: "var(--disk-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: "var(--disk-text-primary)", fontSize: '13px' }}>{brl(m.balance)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
