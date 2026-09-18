import { useState } from 'react'
import {
  FileSignature, Download, CheckCircle2, Clock, AlertCircle,
  FileSpreadsheet, ShieldCheck, Printer, X, Sparkles, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  borderosSeed, type BorderoItem
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinanceBorderoPage({ events, notify, onNavigate }: Props) {
  const [borderosList, setBorderosList] = useState<BorderoItem[]>(borderosSeed)
  const [signingItem, setSigningItem] = useState<BorderoItem | null>(null)
  const [signerName, setSignerName] = useState('Vinicius Casagrande')
  const [signerDocument, setSignerDocument] = useState('18.942.112/0001-09')

  const totalGross = borderosList.reduce((a, b) => a + b.grossRevenue, 0)
  const totalNet = borderosList.reduce((a, b) => a + b.netRevenue, 0)
  const totalProducer = borderosList.reduce((a, b) => a + b.producerShare, 0)
  const totalPlatform = borderosList.reduce((a, b) => a + b.platformShare, 0)

  const handleSignConfirm = () => {
    if (!signingItem) return
    setBorderosList(prev =>
      prev.map(b => b.id === signingItem.id ? { ...b, status: 'Assinado' } : b)
    )
    notify(`Borderô do evento "${signingItem.event}" assinado digitalmente com sucesso!`)
    setSigningItem(null)
  }

  const downloadBorderoPDF = (item: BorderoItem) => {
    notify(`Download do Borderô Oficial em PDF iniciado para "${item.event}".`)
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
          <span className="eyebrow">FECHAMENTO OFICIAL & ASSINATURA</span>
          <div className="finance-title-row">
            <h1>Borderô Financeiro de Eventos</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Validação Jurídica e Fiscal Ativa
            </span>
          </div>
          <p className="page-subtitle">
            Consolidação oficial de receita bruta, taxas, estornos, receita líquida e partilha de valores entre produtora e plataforma DiskIngressos.
          </p>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <FileSpreadsheet size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Receita Bruta Total</span>
            <strong className="kpi-value">{brl(totalGross)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">Volume consolidado</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Partilha Produtora (80%)</span>
            <strong className="kpi-value">{brl(totalProducer)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Valores destinados</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <Sparkles size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Partilha Plataforma (20%)</span>
            <strong className="kpi-value">{brl(totalPlatform)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag warning">Taxa DiskIngressos</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <FileSignature size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Receita Líquida Total</span>
            <strong className="kpi-value">{brl(totalNet)}</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Após deduções</span>
            </div>
          </div>
        </article>
      </section>

      {/* Borderô Cards */}
      <section className="finance-table-section" style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {borderosList.map(item => (
          <article key={item.id} className="card-surface" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: "var(--disk-text-primary)", margin: 0 }}>
                    {item.event}
                  </h2>
                  <span
                    className={[
                      'finance-status',
                      item.status === 'Assinado' ? 'pago' :
                      item.status === 'Em conferência' ? 'pendente' : 'agendado'
                    ].join(' ')}
                  >
                    {item.status}
                  </span>
                </div>
                <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', marginTop: '4px' }}>
                  Demonstrativo contábil e prestação de contas do evento encerrado.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="tool-btn"
                  onClick={() => downloadBorderoPDF(item)}
                  title="Baixar Borderô em PDF"
                >
                  <Download size={16} /> Baixar PDF
                </button>
                {item.status !== 'Assinado' && (
                  <button
                    className="primary-btn"
                    onClick={() => setSigningItem(item)}
                    title="Assinar Borderô Digitalmente"
                  >
                    <FileSignature size={16} /> Assinar Digitalmente
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                background: "var(--disk-bg-muted)",
                borderRadius: '8px',
                border: "1px solid var(--disk-border-default)",
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '16px'
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Receita Bruta</span>
                <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>{brl(item.grossRevenue)}</strong>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Taxas Plataforma</span>
                <strong style={{ fontSize: '14px', color: '#EF4444' }}>- {brl(item.fees)}</strong>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Estornos & Reembolsos</span>
                <strong style={{ fontSize: '14px', color: '#EF4444' }}>- {brl(item.refunds)}</strong>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Receita Líquida</span>
                <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>{brl(item.netRevenue)}</strong>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Repasse Produtora</span>
                <strong style={{ fontSize: '14px', color: '#1C79EF' }}>{brl(item.producerShare)}</strong>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Retenção DiskIngressos</span>
                <strong style={{ fontSize: '14px', color: '#10B981' }}>{brl(item.platformShare)}</strong>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", display: 'block' }}>Conformidade</span>
                <strong style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> Auditado
                </strong>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Digital Signature Modal */}
      {signingItem && (
        <div className="utm-modal-backdrop" onClick={() => setSigningItem(null)}>
          <div className="utm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">ASSINATURA ELETRÔNICA ICP-BRASIL</span>
                <h3>Assinar Borderô do Evento</h3>
                <p>{signingItem.event}</p>
              </div>
              <button className="icon-action" onClick={() => setSigningItem(null)}>✕</button>
            </div>

            <div className="advance-simulation-body">
              <div className="advance-breakdown-card">
                <div className="breakdown-line">
                  <span>Receita Líquida do Evento:</span>
                  <strong>{brl(signingItem.netRevenue)}</strong>
                </div>
                <div className="breakdown-line">
                  <span>Valor Líquido da Produtora:</span>
                  <strong style={{ color: '#1C79EF' }}>{brl(signingItem.producerShare)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                <label>
                  Nome do Responsável Legal:
                  <input
                    type="text"
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </label>

                <label>
                  CNPJ / CPF do Representante:
                  <input
                    type="text"
                    value={signerDocument}
                    onChange={e => setSignerDocument(e.target.value)}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: "var(--disk-color-success-subtle)", borderRadius: '8px', border: "1px solid var(--disk-color-success-border)", marginTop: '14px' }}>
                <ShieldCheck size={20} style={{ color: '#059669' }} />
                <span style={{ fontSize: '12px', color: "var(--disk-color-success-text)" }}>
                  Certificado digital padrão ICP-Brasil e log de auditoria com carimbo do tempo criptografado.
                </span>
              </div>
            </div>

            <div className="utm-modal-actions">
              <button className="btn secondary" onClick={() => setSigningItem(null)}>Cancelar</button>
              <button className="btn primary" onClick={handleSignConfirm}>
                <FileSignature size={15} /> Confirmar Assinatura Digital
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
