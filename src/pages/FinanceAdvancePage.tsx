import { useState, useMemo } from 'react'
import {
  Zap, Calculator, Download, CheckCircle2, Clock, Landmark,
  Percent, ShieldCheck, ArrowRight, X, Building2, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  advancesSeed, bankAccountsSeed, financeSummary,
  type AdvanceContract
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceAdvancePage({ events, notify, onNavigate }: Props) {
  const [advanceAmount, setAdvanceAmount] = useState(50000)
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.title || 'Geral')
  const [selectedBankId, setSelectedBankId] = useState(bankAccountsSeed[0].id)
  const [contractList, setContractList] = useState<AdvanceContract[]>(advancesSeed)

  const limitPreApproved = 350000.00
  const rate = 3.5
  const fee = advanceAmount * (rate / 100)
  const net = advanceAmount - fee

  const handleContractAdvance = () => {
    const bank = bankAccountsSeed.find(b => b.id === Number(selectedBankId))
    const newContract: AdvanceContract = {
      id: contractList.length + 401,
      contractNumber: `ANT-2026-${Date.now().toString().slice(-4)}`,
      event: selectedEvent,
      producer: 'Produtora Parceira',
      contractDate: new Date().toLocaleDateString('pt-BR'),
      grossAmount: advanceAmount,
      feeRate: rate,
      feeAmount: fee,
      netAmount: net,
      bankAccount: bank ? `${bank.bankName} (${bank.bankCode}) Ag. ${bank.agency}` : 'Conta Principal',
      status: 'Aprovado'
    }

    setContractList([newContract, ...contractList])
    notify(`Antecipação de ${brl(net)} contratada com sucesso! Depósito PIX programado.`)
  }

  const exportAdvancesCSV = () => {
    const headers = ['Contrato', 'Data', 'Evento', 'Produtora', 'Valor Bruto (R$)', 'Taxa (%)', 'Desconto Taxa (R$)', 'Valor Liquido (R$)', 'Conta Creditada', 'Status']
    const rows = [headers.join(';')]
    contractList.forEach(c => {
      rows.push([
        `"${c.contractNumber}"`,
        `"${c.contractDate}"`,
        `"${c.event}"`,
        `"${c.producer}"`,
        c.grossAmount.toFixed(2).replace('.', ','),
        c.feeRate.toFixed(1).replace('.', ','),
        c.feeAmount.toFixed(2).replace('.', ','),
        c.netAmount.toFixed(2).replace('.', ','),
        `"${c.bankAccount}"`,
        `"${c.status}"`
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_antecipacoes_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    notify('Histórico de Antecipações exportado em CSV com sucesso!')
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
          <span className="eyebrow">LIQUIDEZ IMEDIATA & CAPITAL DE GIRO</span>
          <div className="finance-title-row">
            <h1>Antecipações de Receitas</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Limite Pré-Aprovado Disponível
            </span>
          </div>
          <p className="page-subtitle">
            Antecipe o saldo de vendas parceladas em cartão de crédito e lotes futuros com liberação via PIX em até 2 horas úteis.
          </p>
        </div>

        <div className="finance-header-controls">
          <button className="tool-btn" onClick={exportAdvancesCSV} title="Exportar CSV">
            <Download size={15} /> Exportar Histórico
          </button>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Zap size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Limite Pré-Aprovado</span>
            <strong className="kpi-value">{brl(limitPreApproved)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">100% Liberado</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Percent size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Taxa Fixa Exclusiva</span>
            <strong className="kpi-value">3,5% a.m.</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Sem IOF adicional</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Clock size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Prazo de Crédito</span>
            <strong className="kpi-value">Até 2 Horas</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Via PIX Direto</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Total Já Contratado</span>
            <strong className="kpi-value">{brl(155000.00)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">3 contratos</span>
            </div>
          </div>
        </article>
      </section>

      {/* Simulator Section */}
      <section className="finance-chart-box card-surface" style={{ border: "1px solid var(--disk-color-info-border)", background: "var(--disk-bg-muted)" }}>
        <div className="card-heading">
          <div>
            <h3>Simulador de Antecipação de Receitas</h3>
            <p>Escolha o valor que deseja adiantar e veja o valor líquido exato a ser depositado na sua conta</p>
          </div>
          <Calculator size={22} className="text-blue" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", marginBottom: '8px' }}>
              Valor a Antecipar:
              <input
                type="range"
                min={5000}
                max={limitPreApproved}
                step={5000}
                value={advanceAmount}
                onChange={e => setAdvanceAmount(Number(e.target.value))}
                style={{ width: '100%', margin: '14px 0' }}
              />
              <strong style={{ display: 'block', fontSize: '32px', color: "var(--disk-text-primary)", fontWeight: 800 }}>
                {brl(advanceAmount)}
              </strong>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
              <label style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 700 }}>
                Evento Vinculado:
                <select
                  value={selectedEvent}
                  onChange={e => setSelectedEvent(e.target.value)}
                  style={{ width: '100%', height: '36px', marginTop: '4px', border: "1px solid var(--disk-border-default)", borderRadius: '6px' }}
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.title}>{ev.title}</option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 700 }}>
                Conta para Depósito:
                <select
                  value={selectedBankId}
                  onChange={e => setSelectedBankId(Number(e.target.value))}
                  style={{ width: '100%', height: '36px', marginTop: '4px', border: "1px solid var(--disk-border-default)", borderRadius: '6px' }}
                >
                  {bankAccountsSeed.map(b => (
                    <option key={b.id} value={b.id}>{b.bankName} ({b.agency})</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="card-surface" style={{ padding: '20px', border: "1px solid var(--disk-border-default)", borderRadius: '10px', background: "var(--disk-bg-surface)" }}>
            <span className="eyebrow">RESUMO DA OPERAÇÃO</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: "var(--disk-text-muted)" }}>Valor Bruto Solicitado</span>
                <strong>{brl(advanceAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: "var(--disk-text-muted)" }}>Taxa de Antecipação (3,5%)</span>
                <strong style={{ color: '#EF4444' }}>- {brl(fee)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: "var(--disk-text-muted)" }}>Encargos / Tarifas Bancárias</span>
                <strong style={{ color: '#10B981' }}>R$ 0,00 (Gratuito)</strong>
              </div>
              <div style={{ borderTop: "1px solid var(--disk-border-default)", paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
                <span style={{ fontWeight: 800, color: "var(--disk-text-primary)" }}>Valor Líquido na Conta</span>
                <strong style={{ color: '#10B981', fontSize: '20px' }}>{brl(net)}</strong>
              </div>
            </div>

            <button
              className="primary-btn"
              style={{ width: '100%', height: '42px', justifyContent: 'center', fontSize: '13px' }}
              onClick={handleContractAdvance}
            >
              <Zap size={16} /> Contratar Antecipação Imediata
            </button>
          </div>
        </div>
      </section>

      {/* Contracts History Table */}
      <section className="finance-table-section card-surface">
        <div className="table-header-tabs">
          <div className="card-heading">
            <div>
              <h3>Histórico de Antecipações Contratadas</h3>
              <p>Contratos firmados, borderôs de liquidação e comprovantes de crédito</p>
            </div>
          </div>
        </div>

        <div className="lots-table-wrap">
          <table className="lots-table finance-table">
            <thead>
              <tr>
                <th>Contrato</th>
                <th>Data</th>
                <th>Evento Vinculado</th>
                <th>Conta de Depósito</th>
                <th style={{ textAlign: 'right' }}>Valor Bruto</th>
                <th style={{ textAlign: 'right' }}>Taxa (3,5%)</th>
                <th style={{ textAlign: 'right' }}>Valor Líquido</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contractList.map(c => (
                <tr key={c.id}>
                  <td><b>{c.contractNumber}</b></td>
                  <td>{c.contractDate}</td>
                  <td className="event-name-cell">{c.event}</td>
                  <td><span className="bank-account-tag">{c.bankAccount}</span></td>
                  <td style={{ textAlign: 'right' }}>{brl(c.grossAmount)}</td>
                  <td style={{ textAlign: 'right', color: '#EF4444' }}>- {brl(c.feeAmount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <strong style={{ color: '#10B981', fontSize: '14px' }}>{brl(c.netAmount)}</strong>
                  </td>
                  <td>
                    <span className={`finance-status ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {c.status}
                    </span>
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
