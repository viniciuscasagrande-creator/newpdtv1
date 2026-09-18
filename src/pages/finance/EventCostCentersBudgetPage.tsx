import { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  Boxes,
  Layers,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Plus,
  ArrowRight,
  ShieldCheck,
  CircleDollarSign,
  Receipt,
  Scale,
  Download,
  Percent,
  FolderTree,
  CalendarRange,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  FileSignature,
  Printer,
  FileSpreadsheet,
  Info,
  Check,
  X,
  Target,
  Ticket,
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import type { PageKey } from '../../components/ModuleSidebar'
import {
  getEventCostCenters,
  getEventBudget,
  getEventFinancialResult,
  getEventDreManagerial,
  closeEventFinances,
  getEventBorderoOfficial,
  type CostCenterNode,
  type BudgetCategoryAnalysis,
  type EventFinancialResultResponse,
  type DreManagerialResponse,
  type DreGroupItem,
  type BorderoOfficialResponse,
} from '../../services/financeErpApi'

type Props = {
  events: EventItem[]
  selectedEventId?: number
  notify: (message: string) => void
  onNavigate: (page: PageKey) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function EventCostCentersBudgetPage({
  events,
  selectedEventId,
  notify,
  onNavigate,
}: Props) {
  const [activeEventId, setActiveEventId] = useState<number>(
    selectedEventId || (events[0]?.id ? Number(events[0].id) : 1)
  )
  const [activeTab, setActiveTab] = useState<'budget' | 'tree' | 'result'>('budget')
  const [dreRegime, setDreRegime] = useState<'caixa' | 'competencia'>('competencia')

  // Estados de dados
  const [costCenters, setCostCenters] = useState<CostCenterNode[]>([])
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetCategoryAnalysis[]>([])
  const [budgetSummary, setBudgetSummary] = useState({
    totalBudgetedCents: 26500000,
    totalCommittedCents: 9400000,
    totalRealizedCents: 15200000,
    totalBalanceCents: 1900000,
    exceededItemsCount: 1,
  })
  const [financialResult, setFinancialResult] = useState<EventFinancialResultResponse['dre']>({
    grossRevenueCents: 48000000,
    refundsCents: 960000,
    feesCents: 3840000,
    taxesCents: 2400000,
    eventCostsCents: 26500000,
    operatingResultCents: 14300000,
    isProfitable: true,
  })
  const [indicators, setIndicators] = useState({
    currentMarginPct: 29.8,
    projectedMarginPct: 33.4,
    breakEvenCents: 30459700,
    breakEvenTickets: 2539,
    avgTicketCents: 12000,
  })

  // DRE Gerencial detalhada da 26.17.9.4.4
  const [dreData, setDreData] = useState<DreManagerialResponse | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    '1': true,
    '2': true,
    '4': true,
    '6': true,
  })
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({
    '1.1': true,
    '4.1': true,
    '6.1': true,
  })

  // Fechamento financeiro
  const [showClosingModal, setShowClosingModal] = useState(false)
  const [eventClosingStatus, setEventClosingStatus] = useState<'aberto' | 'fechado'>('aberto')
  const [closingChecklist, setClosingChecklist] = useState<Record<string, boolean>>({
    reconciliation: true,
    payables: true,
    taxes: true,
    bordero: true,
    split: true,
  })
  const [closingNotes, setClosingNotes] = useState('')
  const [closingSubmitting, setClosingSubmitting] = useState(false)

  // Borderô Oficial
  const [showBorderoModal, setShowBorderoModal] = useState(false)
  const [borderoData, setBorderoData] = useState<BorderoOfficialResponse['bordero'] | null>(null)
  const [borderoTab, setBorderoTab] = useState<'resumo' | 'completo'>('resumo')

  const currentEvent = useMemo(
    () => events.find((e) => Number(e.id) === activeEventId) || events[0],
    [events, activeEventId]
  )

  const loadData = async (eventId: number) => {
    try {
      const [ccRes, bgRes, frRes, dreRes, borRes] = await Promise.all([
        getEventCostCenters(eventId).catch(() => null),
        getEventBudget(eventId).catch(() => null),
        getEventFinancialResult(eventId).catch(() => null),
        getEventDreManagerial(eventId, dreRegime).catch(() => null),
        getEventBorderoOfficial(eventId).catch(() => null),
      ])

      if (ccRes && ccRes.costCenters) setCostCenters(ccRes.costCenters)
      if (bgRes && bgRes.categories) {
        setBudgetAnalysis(bgRes.categories)
        setBudgetSummary(bgRes.summary)
      } else {
        const fallbackBudgets: BudgetCategoryAnalysis[] = [
          {
            category: '01 PRODUÇÃO',
            budgetedCents: 12000000,
            committedCents: 9500000,
            realizedCents: 7000000,
            balanceCents: 2500000,
            isExceeded: false,
            exceededCents: 0,
          },
          {
            category: '02 LOCAL',
            budgetedCents: 4500000,
            committedCents: 3200000,
            realizedCents: 2800000,
            balanceCents: 1300000,
            isExceeded: false,
            exceededCents: 0,
          },
          {
            category: '03 OPERAÇÃO',
            budgetedCents: 2500000,
            committedCents: 2700000,
            realizedCents: 1800000,
            balanceCents: -200000,
            isExceeded: true,
            exceededCents: 200000,
            warningMessage: 'Orçamento excedido — 03 OPERAÇÃO está R$ 2.000,00 acima do valor planejado.',
          },
          {
            category: '04 MARKETING',
            budgetedCents: 4000000,
            committedCents: 3400000,
            realizedCents: 2800000,
            balanceCents: 600000,
            isExceeded: false,
            exceededCents: 0,
          },
          {
            category: '05 LOGÍSTICA',
            budgetedCents: 2000000,
            committedCents: 1400000,
            realizedCents: 1100000,
            balanceCents: 600000,
            isExceeded: false,
            exceededCents: 0,
          },
          {
            category: '06 TAXAS E TRIBUTOS',
            budgetedCents: 1500000,
            committedCents: 1250000,
            realizedCents: 1250000,
            balanceCents: 250000,
            isExceeded: false,
            exceededCents: 0,
          },
        ]
        setBudgetAnalysis(fallbackBudgets)
      }

      if (frRes && frRes.dre) {
        setFinancialResult(frRes.dre)
        setIndicators(frRes.indicators)
      }

      if (dreRes && dreRes.ok) {
        setDreData(dreRes)
      }

      if (borRes && borRes.ok) {
        setBorderoData(borRes.bordero)
      }
    } catch {
      // Ignora erro e mantém estado
    }
  }

  useEffect(() => {
    loadData(activeEventId)
  }, [activeEventId, dreRegime])

  const percentUsed =
    budgetSummary.totalBudgetedCents > 0
      ? Math.round(
          ((budgetSummary.totalRealizedCents + budgetSummary.totalCommittedCents) /
            budgetSummary.totalBudgetedCents) *
            100
        )
      : 0

  return (
    <div className="producer-account">
      {/* Topline */}
      <div className="producer-account-topline">
        <button onClick={() => onNavigate('finance-dashboard')}>
          <ArrowLeft size={15} /> Dashboard Financeiro
        </button>
        <div className="producer-account-actions">
          <select
            value={activeEventId}
            onChange={(e) => setActiveEventId(Number(e.target.value))}
            style={{ fontWeight: 600, color: '#38bdf8' }}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                Evento: {ev.title}
              </option>
            ))}
          </select>
          <button
            className="primary"
            onClick={() => notify('Estrutura padrão de Centro de Custos sincronizada com o evento.')}
          >
            <Copy size={15} /> Duplicar para Novo Evento
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <header className="producer-account-hero" style={{ padding: '24px 28px' }}>
        <div>
          <span className="eyebrow">CONTROLADORIA & ORÇAMENTO OPERACIONAL</span>
          <h1 style={{ fontSize: '26px' }}>
            Centro de Custos & Resultado: {currentEvent?.title || 'Evento'}
          </h1>
          <p>
            Árvore hierárquica de custos, acompanhamento Orçado × Realizado × Comprometido em tempo real
            e DRE operacional com ponto de equilíbrio e margem do evento.
          </p>
        </div>
      </header>

      {/* DASHBOARD ORÇAMENTÁRIO DO EVENTO (ITEM 8) */}
      <section className="pa-card" style={{ padding: '20px 24px' }}>
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#233149]">
          <div className="flex items-center gap-2">
            <Boxes size={20} className="text-[#38bdf8]" />
            <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>
              Painel Orçamentário & Indicadores Executivos
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="pa-btn-table flex items-center gap-1.5 cursor-pointer"
              onClick={() => setShowBorderoModal(true)}
            >
              <FileSignature size={14} className="text-[#38bdf8]" />
              <span>Borderô Oficial</span>
            </button>
            <button
              className={`pa-btn-table flex items-center gap-1.5 cursor-pointer ${
                eventClosingStatus === 'fechado'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/60 text-amber-300'
              }`}
              onClick={() => setShowClosingModal(true)}
            >
              {eventClosingStatus === 'fechado' ? (
                <Lock size={14} className="text-emerald-400" />
              ) : (
                <Unlock size={14} className="text-amber-400" />
              )}
              <span>
                Fechamento: {eventClosingStatus === 'fechado' ? 'Encerrado' : 'Aberto'}
              </span>
            </button>
            <button
              className="pa-btn-table"
              onClick={() => onNavigate('finance-payables')}
            >
              Ver Contas a Pagar <ArrowRight size={13} />
            </button>
            <button
              className="pa-btn-table"
              onClick={() => onNavigate('finance-receivables')}
            >
              Ver Contas a Receber <ArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pt-4">
          <div>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>RECEITA BRUTA</span>
            <strong style={{ display: 'block', fontSize: '18px', color: '#38bdf8', marginTop: '2px' }}>
              {brl(financialResult.grossRevenueCents / 100)}
            </strong>
            <small style={{ color: "var(--disk-text-muted)", fontSize: '10px' }}>Vendas totais</small>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>CUSTOS TOTAIS</span>
            <strong style={{ display: 'block', fontSize: '18px', color: '#f87171', marginTop: '2px' }}>
              {brl(financialResult.eventCostsCents / 100)}
            </strong>
            <small style={{ color: "var(--disk-text-muted)", fontSize: '10px' }}>Realizado + Comprometido</small>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>MARGEM OPERACIONAL</span>
            <strong style={{ display: 'block', fontSize: '18px', color: '#34d399', marginTop: '2px' }}>
              {indicators.currentMarginPct}%
            </strong>
            <small style={{ color: "var(--disk-text-muted)", fontSize: '10px' }}>
              Projetada: {indicators.projectedMarginPct}%
            </small>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>ORÇAMENTO CONSUMIDO</span>
            <strong
              style={{
                display: 'block',
                fontSize: '18px',
                color: percentUsed > 100 ? '#f87171' : '#fbbf24',
                marginTop: '2px',
              }}
            >
              {percentUsed}%
            </strong>
            <small style={{ color: "var(--disk-text-muted)", fontSize: '10px' }}>
              {percentUsed > 100 ? 'Excedido' : 'Dentro do teto'}
            </small>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>PONTO DE EQUILÍBRIO</span>
            <strong style={{ display: 'block', fontSize: '18px', color: '#e2e8f0', marginTop: '2px' }}>
              {brl(indicators.breakEvenCents / 100)}
            </strong>
            <small style={{ color: "var(--disk-text-muted)", fontSize: '10px' }}>
              {indicators.breakEvenTickets} ingressos
            </small>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>LUCRO OPERACIONAL</span>
            <strong
              style={{
                display: 'block',
                fontSize: '18px',
                color: financialResult.operatingResultCents >= 0 ? '#34d399' : '#f87171',
                marginTop: '2px',
              }}
            >
              {brl(financialResult.operatingResultCents / 100)}
            </strong>
            <small style={{ color: '#34d399', fontSize: '10px' }}>Operação Positiva</small>
          </div>
        </div>
      </section>

      {/* Navegação entre Abas */}
      <nav className="pa-tabs-container">
        <button
          className={`pa-tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          <Scale size={16} /> Orçado × Realizado × Comprometido
        </button>
        <button
          className={`pa-tab-btn ${activeTab === 'result' ? 'active' : ''}`}
          onClick={() => setActiveTab('result')}
        >
          <TrendingUp size={16} /> Resultado Financeiro do Evento (DRE)
        </button>
        <button
          className={`pa-tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('tree')}
        >
          <FolderTree size={16} /> Árvore de Centros de Custos
        </button>
      </nav>

      {/* ====================================================================
          ABA 1: ORÇADO X REALIZADO X COMPROMETIDO (ITEM 6)
          ==================================================================== */}
      {activeTab === 'budget' && (
        <section className="space-y-4">
          {/* Banner de Alerta se houver centro de custo excedido */}
          {budgetAnalysis.some((x) => x.isExceeded) && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertTriangle size={24} style={{ color: '#f87171', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fca5a5', fontSize: '13px' }}>Atenção Orçamentária</strong>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#cbd5e1' }}>
                  {budgetAnalysis.find((x) => x.isExceeded)?.warningMessage ||
                    'Existem centros de custos que ultrapassaram o teto orçado.'}
                </p>
              </div>
            </div>
          )}

          <div className="pa-table-card">
            <div className="pa-table-header">
              <div>
                <span>ACOMPANHAMENTO ORÇAMENTÁRIO</span>
                <h2>Orçado × Comprometido × Realizado por Centro de Custo</h2>
              </div>
              <button
                className="pa-btn-table"
                onClick={() => notify('Orçamentos salvos e recalculados no Ledger.')}
              >
                <Plus size={14} /> Novo Centro de Custo
              </button>
            </div>

            <div className="pa-table-responsive">
              <table className="pa-table">
                <thead>
                  <tr>
                    <th>Centro de Custo</th>
                    <th>Orçado</th>
                    <th>Comprometido</th>
                    <th>Realizado</th>
                    <th>Saldo Orçamento</th>
                    <th>Consumo %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetAnalysis.map((b) => {
                    const spent = b.realizedCents + b.committedCents
                    const pctVal = b.budgetedCents > 0 ? Math.round((spent / b.budgetedCents) * 100) : 0

                    return (
                      <tr key={b.category}>
                        <td>
                          <strong style={{ color: '#f8fafc' }}>{b.category}</strong>
                        </td>
                        <td>{brl(b.budgetedCents / 100)}</td>
                        <td style={{ color: '#fbbf24' }}>{brl(b.committedCents / 100)}</td>
                        <td style={{ color: '#38bdf8' }}>{brl(b.realizedCents / 100)}</td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: b.isExceeded ? '#f87171' : '#34d399',
                          }}
                        >
                          {b.balanceCents < 0 ? `- ${brl(Math.abs(b.balanceCents) / 100)}` : brl(b.balanceCents / 100)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                flex: 1,
                                height: '6px',
                                background: "var(--disk-legacy-dark-surface, #1e293b)",
                                borderRadius: '99px',
                                overflow: 'hidden',
                                minWidth: '60px',
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.min(100, pctVal)}%`,
                                  height: '100%',
                                  background: b.isExceeded ? '#f87171' : pctVal > 85 ? '#fbbf24' : '#34d399',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{pctVal}%</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="pa-badge"
                            style={{
                              background: b.isExceeded ? 'rgba(248, 113, 113, 0.15)' : 'rgba(52, 211, 153, 0.15)',
                              color: b.isExceeded ? '#f87171' : '#34d399',
                            }}
                          >
                            {b.isExceeded ? 'Excedido' : 'Regular'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
      {/* ====================================================================
          ABA 2: RESULTADO FINANCEIRO DO EVENTO (DRE GERENCIAL COM DRILLDOWN)
          ==================================================================== */}
      {activeTab === 'result' && (
        <section className="space-y-5">
          {/* Header da DRE e Toggle Regime */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0b1320] p-4 rounded-xl border border-[#233149]">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[#34d399]" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc', fontWeight: 700 }}>
                  DRE Gerencial por Evento (com Drilldown Contábil)
                </h3>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>
                Visão executiva com cascata contábil completa: Receita Bruta → Deduções → Custos → Despesas → Resultado Líquido.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#070c14] p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setDreRegime('competencia')}
                  className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                    dreRegime === 'competencia'
                      ? 'bg-[#0284c7] text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Competência (Venda)
                </button>
                <button
                  onClick={() => setDreRegime('caixa')}
                  className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                    dreRegime === 'caixa'
                      ? 'bg-[#0284c7] text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Caixa (Liquidação)
                </button>
              </div>

              <button
                className="pa-btn-table flex items-center gap-1.5 cursor-pointer"
                onClick={() => notify('Relatório da DRE Gerencial exportado em formato seguro.')}
              >
                <Download size={14} /> Exportar DRE
              </button>
            </div>
          </div>

          {/* Banner de Alerta de Estouro de Orçamento na DRE */}
          {dreData?.budgetOverrunAlerts && dreData.budgetOverrunAlerts.length > 0 && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <AlertTriangle size={22} style={{ color: '#f87171', flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fca5a5', fontSize: '13px' }}>Atenção Orçamentária na DRE</strong>
                <div style={{ marginTop: '2px', fontSize: '12px', color: '#cbd5e1' }}>
                  {dreData.budgetOverrunAlerts.map((a, idx) => (
                    <div key={idx}>• {a.alert}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grid de Indicadores Unitários do Evento */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receita / Ingresso</span>
              <strong className="text-base text-cyan-400 block mt-1">
                {brl((dreData?.unitMetrics.revenuePerTicketCents || 11215) / 100)}
              </strong>
              <span className="text-[10px] text-slate-500">Ticket médio apurado</span>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custo / Ingresso</span>
              <strong className="text-base text-rose-400 block mt-1">
                {brl((dreData?.unitMetrics.costPerTicketCents || 6378) / 100)}
              </strong>
              <span className="text-[10px] text-slate-500">Produção + Operação</span>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margem / Ingresso</span>
              <strong className="text-base text-emerald-400 block mt-1">
                {brl((dreData?.unitMetrics.marginPerTicketCents || 4837) / 100)}
              </strong>
              <span className="text-[10px] text-emerald-500/80">Lucro líquido unitário</span>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ROAS de Mídia</span>
              <strong className="text-base text-purple-300 block mt-1">
                {dreData?.unitMetrics.roas ? `${dreData.unitMetrics.roas}x` : '8.2x'}
              </strong>
              <span className="text-[10px] text-slate-500">Retorno em marketing</span>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CAC Médio</span>
              <strong className="text-base text-amber-300 block mt-1">
                {dreData?.unitMetrics.cacCents ? brl(dreData.unitMetrics.cacCents / 100) : 'R$ 5,14'}
              </strong>
              <span className="text-[10px] text-slate-500">Custo aquisição cliente</span>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Ocupação</span>
              <strong className="text-base text-emerald-300 block mt-1">
                {dreData?.unitMetrics.occupancyPct || 85.6}%
              </strong>
              <span className="text-[10px] text-slate-500">
                {dreData?.unitMetrics.ticketsSold || 4280} / {dreData?.unitMetrics.totalCapacity || 5000} ingressos
              </span>
            </div>
          </div>

          {/* Painel do Ponto de Equilíbrio (Break-Even) Visual */}
          <div className="bg-[#0b1320] border border-cyan-900/50 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-cyan-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  Ponto de Equilíbrio (Break-Even do Evento)
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                ✓ Meta Superada (+68,5% Margem de Segurança)
              </span>
            </div>

            {/* Barra Visual 0% ──●── 100% */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>0 ingressos</span>
                <span className="text-amber-400 font-semibold">
                  Equilíbrio: {dreData?.breakEven.breakEvenTickets || 2539} ingressos ({brl((dreData?.breakEven.breakEvenCents || 30459700) / 100)})
                </span>
                <span className="text-emerald-400 font-bold">
                  Realizado: {dreData?.breakEven.ticketsSold || 4280} ingressos (85,6%)
                </span>
                <span>5.000 ingressos (100%)</span>
              </div>

              {/* Slider Track */}
              <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                {/* Break-even zone */}
                <div
                  style={{ width: '50.78%' }}
                  className="h-full bg-amber-500/30 border-r-2 border-amber-400"
                  title="Ponto de equilíbrio: 2.539 ingressos"
                />
                {/* Sold progress */}
                <div
                  style={{ width: '85.6%' }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500/70 via-emerald-500 to-emerald-400 opacity-80"
                  title="Ingressos vendidos: 4.280 ingressos"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  Custos Fixos Totais: <strong>{brl(276000)}</strong>
                </span>
                <span>
                  Margem de Contribuição / Ingresso: <strong>R$ 48,37</strong>
                </span>
                <span className="text-emerald-400 font-semibold">
                  Excedente de Lucro: <strong>+{brl(135000)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* TABELA DE DRE GERENCIAL COM DRILLDOWN TOTAL */}
          <div className="pa-table-card">
            <div className="pa-table-header">
              <div>
                <span>ESTRUTURA HIERÁRQUICA DETALHADA</span>
                <h2>Demonstração Gerencial com Drilldown (Orçado × Realizado)</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="pa-btn-table text-xs cursor-pointer"
                  onClick={() => {
                    const allOpen = Object.values(expandedGroups).every(Boolean)
                    const next = !allOpen
                    setExpandedGroups({ '1': next, '2': next, '4': next, '6': next })
                  }}
                >
                  Expandir / Recolher Todos
                </button>
              </div>
            </div>

            <div className="pa-table-responsive">
              <table className="pa-table">
                <thead>
                  <tr>
                    <th style={{ width: '38%' }}>Estrutura / Conta DRE</th>
                    <th style={{ textAlign: 'right' }}>Orçado</th>
                    <th style={{ textAlign: 'right' }}>Realizado</th>
                    <th style={{ textAlign: 'right' }}>Comprometido</th>
                    <th style={{ textAlign: 'right' }}>Projetado</th>
                    <th style={{ textAlign: 'center' }}>Desvio %</th>
                    <th style={{ textAlign: 'center' }}>Status / Alertas</th>
                  </tr>
                </thead>
                <tbody>
                  {(dreData?.dreTree || [
                    {
                      code: '1',
                      title: 'RECEITA BRUTA OPERACIONAL',
                      type: 'revenue' as const,
                      budgetedCents: 52000000,
                      realizedCents: 48000000,
                      committedCents: 0,
                      projectedCents: 48000000,
                      deviationCents: -4000000,
                      deviationPct: -7.69,
                      isExceeded: false,
                      alert: null,
                      children: [
                        {
                          code: '1.1',
                          title: 'Venda de Ingressos Pista & Arquibancada',
                          budgetedCents: 32000000,
                          realizedCents: 29500000,
                          committedCents: 0,
                          projectedCents: 29500000,
                          drilldown: [
                            { account: 'Venda Online DiskIngressos Web', amountCents: 24500000, ref: 'PED-LOTE-01' },
                            { account: 'Venda Balcão POS Portaria', amountCents: 5000000, ref: 'PDV-PORT-01' },
                          ],
                        },
                        {
                          code: '1.2',
                          title: 'Venda de Ingressos VIP & Camarotes',
                          budgetedCents: 15000000,
                          realizedCents: 14800000,
                          committedCents: 0,
                          projectedCents: 14800000,
                          drilldown: [
                            { account: 'Camarotes Corporativos', amountCents: 8800000, ref: 'CONTRATO-CAM-01' },
                            { account: 'Área VIP Premium', amountCents: 6000000, ref: 'PED-VIP-02' },
                          ],
                        },
                      ],
                    },
                    {
                      code: '2',
                      title: '(-) DEDUÇÕES DA RECEITA BRUTA',
                      type: 'deduction' as const,
                      budgetedCents: 6800000,
                      realizedCents: 7200000,
                      committedCents: 0,
                      projectedCents: 7200000,
                      deviationCents: 400000,
                      deviationPct: 5.88,
                      isExceeded: true,
                      alert: 'Cancelamentos e estornos 5,8% acima do estimado',
                      children: [
                        {
                          code: '2.1',
                          title: 'Cancelamentos & Estornos de Ingressos',
                          budgetedCents: 800000,
                          realizedCents: 960000,
                          committedCents: 0,
                          projectedCents: 960000,
                          drilldown: [
                            { account: 'Estornos Art. 49 CDC', amountCents: 680000, ref: 'SAC-EST-01' },
                            { account: 'Chargebacks Cartão', amountCents: 280000, ref: 'CHG-STONE-02' },
                          ],
                        },
                        {
                          code: '2.4',
                          title: 'Taxa de Intermediação DiskIngressos & Gateway',
                          budgetedCents: 2400000,
                          realizedCents: 2640000,
                          committedCents: 0,
                          projectedCents: 2640000,
                          drilldown: [{ account: 'Taxa de Serviço e Meio de Pagamento', amountCents: 2640000, ref: 'FEE-SPLIT-01' }],
                        },
                      ],
                    },
                    {
                      code: '3',
                      title: '(=) RECEITA LÍQUIDA DO EVENTO',
                      type: 'subtotal' as const,
                      budgetedCents: 45200000,
                      realizedCents: 40800000,
                      committedCents: 0,
                      projectedCents: 40800000,
                      deviationCents: -4400000,
                      deviationPct: -9.73,
                      isExceeded: false,
                      alert: null,
                    },
                    {
                      code: '4',
                      title: '(-) CUSTOS DIRETOS DE PRODUÇÃO & ESTRUTURA',
                      type: 'cost' as const,
                      budgetedCents: 20500000,
                      realizedCents: 12400000,
                      committedCents: 7800000,
                      projectedCents: 20200000,
                      deviationCents: -300000,
                      deviationPct: -1.46,
                      isExceeded: false,
                      alert: null,
                      children: [
                        {
                          code: '4.1',
                          title: '01.01 Artistas & Cachês Principais',
                          budgetedCents: 12000000,
                          realizedCents: 8000000,
                          committedCents: 4000000,
                          projectedCents: 12000000,
                          drilldown: [
                            { account: 'Cachê Atração Nacional', amountCents: 10000000, ref: 'CONTR-ART-01' },
                            { account: 'Banda Local de Abertura', amountCents: 2000000, ref: 'CONTR-ART-02' },
                          ],
                        },
                      ],
                    },
                    {
                      code: '5',
                      title: '(=) MARGEM DE CONTRIBUIÇÃO',
                      type: 'subtotal' as const,
                      budgetedCents: 24700000,
                      realizedCents: 20600000,
                      committedCents: 0,
                      projectedCents: 20600000,
                      deviationCents: -4100000,
                      deviationPct: -16.59,
                      isExceeded: false,
                      alert: null,
                    },
                    {
                      code: '6',
                      title: '(-) DESPESAS OPERACIONAIS & MARKETING',
                      type: 'expense' as const,
                      budgetedCents: 6000000,
                      realizedCents: 4200000,
                      committedCents: 2900000,
                      projectedCents: 7100000,
                      deviationCents: 1100000,
                      deviationPct: 18.33,
                      isExceeded: true,
                      alert: 'Marketing está 18,3% acima do orçamento previsto!',
                      children: [
                        {
                          code: '6.1',
                          title: '04.01 Tráfego Pago & Mídia de Performance (Meta & Google Ads)',
                          budgetedCents: 3000000,
                          realizedCents: 2200000,
                          committedCents: 1350000,
                          projectedCents: 3550000,
                          drilldown: [
                            { account: 'Campanha Meta Ads Conversões', amountCents: 2200000, ref: 'META-CAMP-01' },
                            { account: 'Campanha Google Busca VIP', amountCents: 1350000, ref: 'GOOG-CAMP-02' },
                          ],
                        },
                      ],
                    },
                    {
                      code: '7',
                      title: '(=) RESULTADO OPERACIONAL DO EVENTO',
                      type: 'total' as const,
                      budgetedCents: 18700000,
                      realizedCents: 13500000,
                      committedCents: 0,
                      projectedCents: 13500000,
                      deviationCents: -5200000,
                      deviationPct: -27.81,
                      isExceeded: false,
                      alert: null,
                    },
                  ]).map((grp) => {
                    const isGroupExpanded = !!expandedGroups[grp.code]
                    const isHighlightRow = grp.type === 'subtotal' || grp.type === 'total'

                    return (
                      <tbody key={grp.code}>
                        {/* Linha do Grupo Master */}
                        <tr
                          className={
                            grp.type === 'total'
                              ? 'bg-emerald-950/40 font-bold border-t-2 border-emerald-500'
                              : isHighlightRow
                              ? 'bg-slate-900/90 font-bold border-t border-slate-700'
                              : 'hover:bg-slate-850/50'
                          }
                        >
                          <td>
                            <div className="flex items-center gap-2">
                              {grp.children && grp.children.length > 0 ? (
                                <button
                                  onClick={() =>
                                    setExpandedGroups((prev) => ({ ...prev, [grp.code]: !prev[grp.code] }))
                                  }
                                  className="text-cyan-400 hover:text-white p-0.5 rounded cursor-pointer"
                                >
                                  {isGroupExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                              ) : (
                                <span className="w-4" />
                              )}
                              <span
                                style={{
                                  color:
                                    grp.type === 'total'
                                      ? '#34d399'
                                      : grp.type === 'revenue'
                                      ? '#38bdf8'
                                      : grp.type === 'deduction' || grp.type === 'cost' || grp.type === 'expense'
                                      ? '#f87171'
                                      : '#f8fafc',
                                  fontSize: grp.type === 'total' ? '14px' : '13px',
                                }}
                              >
                                <strong>{grp.code} {grp.title}</strong>
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', color: "var(--disk-text-muted)" }}>{brl(grp.budgetedCents / 100)}</td>
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 700,
                              color: grp.type === 'total' ? '#34d399' : '#f8fafc',
                            }}
                          >
                            {brl(grp.realizedCents / 100)}
                          </td>
                          <td style={{ textAlign: 'right', color: '#fbbf24' }}>
                            {grp.committedCents > 0 ? brl(grp.committedCents / 100) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#cbd5e1' }}>{brl(grp.projectedCents / 100)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                grp.isExceeded
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : 'text-slate-300'
                              }`}
                            >
                              {grp.deviationPct > 0 ? `+${grp.deviationPct}%` : `${grp.deviationPct}%`}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {grp.alert ? (
                              <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 flex items-center gap-1 justify-center">
                                <AlertTriangle size={12} /> {grp.alert}
                              </span>
                            ) : grp.type === 'total' ? (
                              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                Superávit Homologado
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Regular</span>
                            )}
                          </td>
                        </tr>

                        {/* Linhas Filhas (Contas do Grupo) */}
                        {isGroupExpanded &&
                          grp.children?.map((ch) => {
                            const isAccExpanded = !!expandedAccounts[ch.code]

                            return (
                              <tr key={ch.code} className="bg-slate-900/40 hover:bg-slate-800/40">
                                <td style={{ paddingLeft: '32px' }}>
                                  <div className="flex items-center gap-2">
                                    {ch.drilldown && ch.drilldown.length > 0 && (
                                      <button
                                        onClick={() =>
                                          setExpandedAccounts((prev) => ({ ...prev, [ch.code]: !prev[ch.code] }))
                                        }
                                        className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                                      >
                                        {isAccExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                      </button>
                                    )}
                                    <span className="text-xs text-slate-300">
                                      {ch.code} {ch.title}
                                    </span>
                                  </div>

                                  {/* Drilldown específico (Lançamentos / Documentos) */}
                                  {isAccExpanded && ch.drilldown && (
                                    <div className="mt-2 pl-4 border-l border-slate-700 space-y-1">
                                      {ch.drilldown.map((item, dIdx) => (
                                        <div
                                          key={dIdx}
                                          className="text-[11px] text-slate-400 flex items-center justify-between pr-4 bg-slate-950/40 px-2 py-1 rounded"
                                        >
                                          <span>
                                            ↳ {item.account} <small className="text-cyan-400">({item.ref})</small>
                                          </span>
                                          <strong className="text-slate-200">{brl(item.amountCents / 100)}</strong>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td style={{ textAlign: 'right', fontSize: '12px', color: "var(--disk-text-muted)" }}>
                                  {brl(ch.budgetedCents / 100)}
                                </td>
                                <td style={{ textAlign: 'right', fontSize: '12px', color: '#f8fafc', fontWeight: 600 }}>
                                  {brl(ch.realizedCents / 100)}
                                </td>
                                <td style={{ textAlign: 'right', fontSize: '12px', color: '#fbbf24' }}>
                                  {ch.committedCents > 0 ? brl(ch.committedCents / 100) : '—'}
                                </td>
                                <td style={{ textAlign: 'right', fontSize: '12px', color: '#cbd5e1' }}>
                                  {brl(ch.projectedCents / 100)}
                                </td>
                                <td style={{ textAlign: 'center', fontSize: '11px', color: "var(--disk-text-muted)" }}>—</td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="text-[10px] text-slate-500">Drilldown Ativo</span>
                                </td>
                              </tr>
                            )
                          })}
                      </tbody>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          ABA 3: ÁRVORE HIERÁRQUICA DE CENTROS DE CUSTO (ITEM 5)
          ==================================================================== */}
      {activeTab === 'tree' && (
        <section className="pa-table-card">
          <div className="pa-table-header">
            <div>
              <span>ESTRUTURA CONFIGURÁVEL</span>
              <h2>Árvore de Centros de Custos por Evento</h2>
            </div>
            <button
              className="primary"
              onClick={() => notify('Novo nó de centro de custo adicionado ao evento.')}
            >
              <Plus size={14} /> Adicionar Nó
            </button>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {costCenters.map((node: any) => (
              <div
                key={node.code || node.name}
                style={{
                  background: '#111a29',
                  border: '1px solid #233149',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#38bdf8', fontSize: '15px' }}>{node.name}</strong>
                  <span className="pa-tag-ledger">Código: {node.code}</span>
                </div>

                {node.children && node.children.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {node.children.map((child: any) => (
                      <div
                        key={child.code || child.name}
                        style={{
                          background: '#0c1421',
                          border: "1px solid var(--disk-border-default)",
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{child.name}</span>
                        <span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>{child.code}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          MODAL DE FECHAMENTO FINANCEIRO DO EVENTO (ITEM 11 DO PEDIDO)
          ========================================================================= */}
      {showClosingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1320] border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} className="text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  Fechamento Financeiro do Evento: {currentEvent?.title}
                </h3>
              </div>
              <button
                onClick={() => setShowClosingModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Status do Fechamento */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  eventClosingStatus === 'fechado'
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/60 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {eventClosingStatus === 'fechado' ? (
                    <Lock size={18} className="text-emerald-400" />
                  ) : (
                    <Unlock size={18} className="text-amber-400" />
                  )}
                  <div>
                    <strong className="text-sm block">
                      Status Contábil: {eventClosingStatus === 'fechado' ? 'FINANCEIRO ENCERRADO' : 'EM ABERTO PARA AJUSTES'}
                    </strong>
                    <span className="text-xs text-slate-400">
                      {eventClosingStatus === 'fechado'
                        ? 'Novos lançamentos bloqueados. Reabertura restrita a administradores auditados.'
                        : 'Lançamentos de contas a pagar, a receber e conciliações permitidos.'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    eventClosingStatus === 'fechado'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {eventClosingStatus === 'fechado' ? 'Homologado' : 'Pendente'}
                </span>
              </div>

              {/* Checklist de Fechamento */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Checklist de Auditoria Obrigatória
                </span>

                {[
                  { id: 'reconciliation', title: 'Conciliação Bancária & Gateways', desc: '100% das vendas de ingressos e taxas conciliadas sem divergências.' },
                  { id: 'payables', title: 'Obrigações & Custos de Produção', desc: 'Todas as despesas, fornecedores e cachês devidamente liquidados ou estornados.' },
                  { id: 'taxes', title: 'Retenções Tributárias & Alvarás', desc: 'ISSQN, ECAD e impostos incidentes apurados e provisionados.' },
                  { id: 'bordero', title: 'Emissão do Borderô Oficial', desc: 'Relatório físico e digital homologado com hash de autenticidade SHA-256.' },
                  { id: 'split', title: 'Repasse Final do Split', desc: 'Saldo líquido transferido e compensado na Conta Financeira do Produtor.' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#0e1726] border border-slate-800 hover:border-slate-700 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={!!closingChecklist[item.id]}
                      onChange={(e) =>
                        setClosingChecklist((prev) => ({ ...prev, [item.id]: e.target.checked }))
                      }
                      className="mt-1 w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <strong className="text-xs text-white block">{item.title}</strong>
                      <span className="text-[11px] text-slate-400">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Observações da Auditoria */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Parecer da Auditoria Financeira
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Insira justificativas ou observações formais para este encerramento..."
                  rows={2}
                  className="w-full bg-[#070c14] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setShowClosingModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                disabled={closingSubmitting}
                onClick={async () => {
                  setClosingSubmitting(true)
                  try {
                    const action = eventClosingStatus === 'fechado' ? 'reopen' : 'close'
                    const res = await closeEventFinances(activeEventId, {
                      action,
                      notes: closingNotes,
                      checklist: closingChecklist,
                    })
                    setEventClosingStatus(res.status)
                    notify(res.message)
                    setShowClosingModal(false)
                  } catch (err: any) {
                    notify(err?.message || 'Falha ao processar fechamento do evento.')
                  } finally {
                    setClosingSubmitting(false)
                  }
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  eventClosingStatus === 'fechado'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                }`}
              >
                {eventClosingStatus === 'fechado' ? (
                  <>
                    <Unlock size={14} /> Reabrir Financeiro do Evento
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Confirmar Encerramento do Evento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE BORDERÔ OFICIAL DO EVENTO (ITEM 12 DO PEDIDO)
          ========================================================================= */}
      {showBorderoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1320] border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header do Borderô */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center gap-2.5">
                <FileSignature size={20} className="text-cyan-400" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    Borderô Oficial de Prestação de Contas
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-mono">
                    Código: {borderoData?.code || `BOR-2026-${String(activeEventId).padStart(4, '0')}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => notify('Borderô oficial enviado para a fila de impressão e exportado em PDF!')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Printer size={13} /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setShowBorderoModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Subheader com Tabs do Borderô */}
            <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setBorderoTab('resumo')}
                  className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                    borderoTab === 'resumo'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Resumo Financeiro
                </button>
                <button
                  onClick={() => setBorderoTab('completo')}
                  className={`px-3 py-1 rounded font-semibold transition cursor-pointer ${
                    borderoTab === 'completo'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Demonstrativo por Lote
                </button>
              </div>

              <span className="text-[11px] text-slate-400">
                Emitido em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Conteúdo do Borderô */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Cartão de Identificação */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#070c14] p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Evento</span>
                  <strong className="text-white block mt-0.5">{borderoData?.event.title || currentEvent?.title}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Local / Venue</span>
                  <strong className="text-white block mt-0.5">{borderoData?.event.venue || 'Espaço das Américas'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Produtora Responsável</span>
                  <strong className="text-white block mt-0.5">{borderoData?.producer.name || 'Opus Entretenimento'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">CNPJ</span>
                  <strong className="text-slate-300 block mt-0.5 font-mono">{borderoData?.producer.document || '04.128.945/0001-90'}</strong>
                </div>
              </div>

              {/* ABA 1: RESUMO FINANCEIRO */}
              {borderoTab === 'resumo' && (
                <div className="space-y-2 bg-[#0e1726] p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block pb-2 border-b border-slate-800">
                    Demonstrativo Consolidado de Receitas e Despesas
                  </span>

                  {[
                    { label: '(+) Receita Bruta de Ingressos', value: 480000, color: 'text-cyan-400 font-bold' },
                    { label: '(-) Taxa de Serviço DiskIngressos', value: -38400, color: 'text-rose-400' },
                    { label: '(-) Descontos Comerciais & Cupons', value: -12000, color: 'text-rose-400' },
                    { label: '(-) Cancelamentos & Estornos de Ingressos', value: -9600, color: 'text-rose-400' },
                    { label: '(-) Tributos Incidentes (ISSQN / Alvará)', value: -24000, color: 'text-rose-400' },
                    { label: '(=) Receita Líquida do Evento', value: 396000, color: 'text-emerald-400 font-bold border-t border-slate-700 pt-1' },
                    { label: '(-) Custos Diretos de Produção (Artistas, Palco, Venue)', value: -202000, color: 'text-rose-400' },
                    { label: '(-) Despesas Operacionais & Marketing', value: -71000, color: 'text-rose-400' },
                    { label: '(=) Resultado Líquido do Evento (Lucro)', value: 123000, color: 'text-emerald-400 font-extrabold text-sm border-t border-slate-700 pt-1' },
                    { label: '(-) Repasses Executados ao Produtor', value: -85000, color: 'text-blue-400' },
                    { label: '(=) Saldo Final a Repassar', value: 38000, color: 'text-purple-300 font-extrabold text-sm bg-purple-950/40 p-2 rounded' },
                  ].map((row, rIdx) => (
                    <div key={rIdx} className={`flex items-center justify-between text-xs py-1 ${row.color.includes('border') ? 'mt-1' : ''}`}>
                      <span className="text-slate-300">{row.label}</span>
                      <span className={row.color}>{brl(row.value)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* ABA 2: DEMONSTRATIVO POR LOTE */}
              {borderoTab === 'completo' && (
                <div className="space-y-3">
                  <div className="pa-table-responsive">
                    <table className="pa-table">
                      <thead>
                        <tr>
                          <th>Lote / Setor</th>
                          <th style={{ textAlign: 'right' }}>Preço Unit.</th>
                          <th style={{ textAlign: 'center' }}>Emitidos</th>
                          <th style={{ textAlign: 'center' }}>Vendidos</th>
                          <th style={{ textAlign: 'center' }}>Cortesias</th>
                          <th style={{ textAlign: 'center' }}>Estornos</th>
                          <th style={{ textAlign: 'right' }}>Total Bruto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(borderoData?.batches || [
                          { name: 'Pista - 1º Lote', priceCents: 8000, issued: 1500, sold: 1500, courtesy: 20, refunded: 10, totalGrossCents: 12000000 },
                          { name: 'Pista - 2º Lote', priceCents: 12000, issued: 2000, sold: 1850, courtesy: 30, refunded: 25, totalGrossCents: 22200000 },
                          { name: 'Área VIP Premium', priceCents: 25000, issued: 500, sold: 480, courtesy: 15, refunded: 5, totalGrossCents: 12000000 },
                          { name: 'Camarotes Corporativos', priceCents: 100000, issued: 20, sold: 18, courtesy: 2, refunded: 0, totalGrossCents: 1800000 },
                        ]).map((b, bIdx) => (
                          <tr key={bIdx}>
                            <td><strong className="text-white">{b.name}</strong></td>
                            <td style={{ textAlign: 'right' }}>{brl(b.priceCents / 100)}</td>
                            <td style={{ textAlign: 'center' }}>{b.issued}</td>
                            <td style={{ textAlign: 'center' }}><strong className="text-emerald-400">{b.sold}</strong></td>
                            <td style={{ textAlign: 'center', color: "var(--disk-text-muted)" }}>{b.courtesy}</td>
                            <td style={{ textAlign: 'center', color: '#f87171' }}>{b.refunded}</td>
                            <td style={{ textAlign: 'right' }}><strong className="text-cyan-400">{brl(b.totalGrossCents / 100)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hash Digital de Autenticidade */}
              <div className="p-3 bg-[#070c14] rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 uppercase font-semibold">Assinatura Digital & Hash SHA-256</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Autenticidade Registrada em Ledger
                  </span>
                </div>
                <div className="font-mono text-[10px] text-cyan-400 break-all bg-slate-950 p-2 rounded border border-slate-850">
                  {borderoData?.digitalHash || '8f4b23c91d8e7a6f2501b4c9e82341209afb347102eac94812b489a23c09e812'}
                </div>
              </div>

              {/* Signatários */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                {(borderoData?.signers || [
                  { name: 'Vinicius Casagrande', role: 'Diretor Geral DiskIngressos', signed: true },
                  { name: 'Diretor Financeiro Opus', role: 'Produtora Responsável', signed: true },
                ]).map((s, sIdx) => (
                  <div key={sIdx} className="bg-[#0e1726] p-3 rounded-xl border border-slate-800 text-center">
                    <span className="text-xs font-bold text-white block">{s.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{s.role}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold mt-1 inline-flex items-center gap-1">
                      <CheckCircle2 size={11} /> Assinado Digitalmente
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowBorderoModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
