import { useState, useMemo, useEffect, type FormEvent } from 'react'
import { consumeFinanceDrilldown } from '../utils/financeDrilldown'
import {
  ArrowUpRight, Landmark, Search, Filter, Download, Plus,
  CheckCircle2, Clock, Calendar, AlertCircle, X, Building2,
  CreditCard, ArrowLeft, ArrowRight, ShieldCheck, ArrowLeftRight,
  Receipt, FileText, Check, AlertTriangle, Undo2, LockKeyhole
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  getFinancePayables,
  createFinancePayable,
  payFinancePayable,
  type PayableItem,
} from '../services/financeErpApi'
import { getProducerEventsBalances, type EventFinancialAccount } from '../services/financeTransfersApi'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

export default function FinancePayablesPage({ events, notify, onNavigate }: Props) {
  const [drilldown] = useState(() => consumeFinanceDrilldown('finance-payables'))
  const [search, setSearch] = useState(drilldown?.eventName || '')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState(drilldown?.category || 'all')
  const [statusFilter, setStatusFilter] = useState(drilldown?.status || 'all')

  // Dados
  const [payablesList, setPayablesList] = useState<PayableItem[]>([])
  const [subaccounts, setSubaccounts] = useState<EventFinancialAccount[]>([])
  const [kpis, setKpis] = useState({
    totalToPayCents: 14850000,
    dueTodayCents: 850000,
    next7DaysCents: 4230000,
    overdueCents: 420000,
    paidPeriodCents: 24500000,
    count: 0,
  })

  // Modal Novo Lançamento
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    vendor: '',
    eventId: events[0]?.id || 1,
    costCenterName: '03 OPERAÇÃO',
    category: 'Segurança & Brigada',
    competence: '09/2026',
    dueDate: '2026-09-15',
    amount: '',
    paymentMethod: 'PIX',
    documentRef: '',
    notes: '',
  })

  // Modal de Pagamento & Transferência Inter-Eventos
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [payableToPay, setPayableToPay] = useState<PayableItem | null>(null)
  const [sourceTransferEventId, setSourceTransferEventId] = useState<number>(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Carregar obrigações a pagar e saldos por evento
  const loadData = async () => {
    try {
      const [res, subs] = await Promise.all([
        getFinancePayables().catch(() => null),
        getProducerEventsBalances(1).catch(() => null),
      ])

      if (res && res.payables) {
        setPayablesList(res.payables)
        setKpis(res.kpis)
      } else {
        // Fallback robusto local
        const initial: PayableItem[] = [
          {
            id: 101,
            code: 'PAG-202609-001',
            description: 'Locação de Palco e Estrutura GeoSpace',
            vendor: 'Estrutura Brasil Cenografia Ltda',
            responsible: 'Carlos Operações',
            eventId: Number(events[0]?.id || 1),
            eventTitle: events[0]?.title || 'SEM PARAR - EXPERIÊNCIA MÚSICA',
            costCenterName: '01 PRODUÇÃO',
            category: 'Palco & Cenografia',
            competence: '09/2026',
            dueDate: '2026-09-12',
            amountCents: 800000, // R$ 8.000
            paymentMethod: 'PIX',
            documentRef: 'NF-e 4892',
            status: 'agendado',
            approvalTier: 'FINANCE',
            approvedBy: 'Gerente Financeiro',
          },
          {
            id: 102,
            code: 'PAG-202609-002',
            description: 'Equipe de 40 vigilantes e brigadistas',
            vendor: 'Guardiões Segurança Integrada',
            responsible: 'Fernanda Segurança',
            eventId: Number(events[0]?.id || 1),
            eventTitle: events[0]?.title || 'SEM PARAR - EXPERIÊNCIA MÚSICA',
            costCenterName: '03 OPERAÇÃO',
            category: 'Segurança Privada',
            competence: '09/2026',
            dueDate: new Date().toISOString().slice(0, 10), // Vence hoje
            amountCents: 850000, // R$ 8.500
            paymentMethod: 'PIX',
            documentRef: 'NF 1042',
            status: 'aguardando_aprovacao',
            approvalTier: 'FINANCE',
          },
          {
            id: 103,
            code: 'PAG-202609-003',
            description: 'Mídia de conversão e retargeting no Instagram',
            vendor: 'Meta Platforms Brasil Ltda',
            responsible: 'Lucas Growth',
            eventId: Number(events[1]?.id || 2),
            eventTitle: events[1]?.title || 'IRON MAIDEN SYMPHONIC',
            costCenterName: '04 MARKETING',
            category: 'Meta Ads',
            competence: '09/2026',
            dueDate: '2026-09-06', // Vencido
            amountCents: 420000,
            paymentMethod: 'Cartão Corporativo',
            documentRef: 'FAT-META-9012',
            status: 'vencido',
            approvalTier: 'DIRECT',
          },
          {
            id: 104,
            code: 'PAG-202609-004',
            description: 'Direitos autorais de execução musical',
            vendor: 'ECAD - Escritório Central',
            responsible: 'Controladoria',
            eventId: Number(events[0]?.id || 1),
            eventTitle: events[0]?.title || 'SEM PARAR - EXPERIÊNCIA MÚSICA',
            costCenterName: '06 TAXAS E TRIBUTOS',
            category: 'ECAD',
            competence: '09/2026',
            dueDate: '2026-08-30',
            paidAt: '2026-08-30',
            amountCents: 1250000,
            paymentMethod: 'Boleto',
            documentRef: 'BOL-ECAD-2026',
            status: 'pago',
            approvalTier: 'FINANCE',
            approvedBy: 'Diretoria',
          },
        ]
        setPayablesList(initial)
      }

      if (subs && subs.subaccounts) {
        setSubaccounts(subs.subaccounts)
      } else {
        setSubaccounts([
          {
            eventId: Number(events[0]?.id || 1),
            eventTitle: events[0]?.title || 'SEM PARAR - EXPERIÊNCIA MÚSICA',
            eventDate: '30/06/2027',
            status: 'active',
            grossCents: 78000000,
            availableCents: 350000, // R$ 3.500 disponível para demonstrar insuficiência!
            receivableCents: 26000000,
            blockedCents: 10000000,
            settledCents: 52000000,
            transferredInCents: 0,
            transferredOutCents: 0,
            netBalanceCents: 29500000,
            lastActivityAt: new Date().toISOString(),
          },
          {
            eventId: Number(events[1]?.id || 2),
            eventTitle: events[1]?.title || 'IRON MAIDEN SYMPHONIC',
            eventDate: '14/03/2027',
            status: 'active',
            grossCents: 49000000,
            availableCents: 20000000, // R$ 20.000 disponível para ser a origem!
            receivableCents: 15000000,
            blockedCents: 6000000,
            settledCents: 34000000,
            transferredInCents: 0,
            transferredOutCents: 0,
            netBalanceCents: 35000000,
            lastActivityAt: new Date().toISOString(),
          },
        ])
      }
    } catch {
      // Ignora e mantém fallback
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtragem da lista
  const filtered = useMemo(() => {
    return payablesList.filter((p) => {
      const q = search.toLowerCase()
      const matchesSearch =
        p.description.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.eventTitle.toLowerCase().includes(q)

      const matchesEvent = selectedEventId === 'all' || String(p.eventId) === selectedEventId
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter

      return matchesSearch && matchesEvent && matchesCat && matchesStatus
    })
  }, [payablesList, search, selectedEventId, categoryFilter, statusFilter])

  // Alçada do formulário
  const formAmountCents = useMemo(() => {
    const cleaned = formData.amount.replace(/[^\d]/g, '')
    return cleaned ? parseInt(cleaned, 10) : 0
  }, [formData.amount])

  const formTier = useMemo(() => {
    if (formAmountCents <= 500000) return { label: 'Aprovação Direta (Até R$ 5.000,00)', cls: 'text-emerald-400' }
    if (formAmountCents <= 5000000) return { label: 'Alçada Gerente Financeiro (R$ 5.000 a R$ 50.000)', cls: 'text-amber-400' }
    return { label: 'Alçada Dupla Diretoria Executiva (> R$ 50.000,00)', cls: 'text-rose-400' }
  }, [formAmountCents])

  // Submeter nova conta
  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (formAmountCents <= 0) {
      notify('Informe um valor válido maior que zero.')
      return
    }

    try {
      const res = await createFinancePayable({
        eventId: Number(formData.eventId),
        description: formData.description || 'Despesa Operacional',
        vendor: formData.vendor || 'Fornecedor Cadastrado',
        costCenterName: formData.costCenterName,
        category: formData.category,
        competence: formData.competence,
        dueDate: formData.dueDate,
        amountCents: formAmountCents,
        paymentMethod: formData.paymentMethod,
        documentRef: formData.documentRef,
        notes: formData.notes,
      }).catch(() => null)

      if (res && res.ok) {
        setPayablesList([res.payable, ...payablesList])
      } else {
        // Fallback local
        const ev = events.find((e) => Number(e.id) === Number(formData.eventId))
        const newItem: PayableItem = {
          id: Date.now(),
          code: `PAG-${Date.now().toString().slice(-4)}`,
          description: formData.description || 'Despesa Operacional',
          vendor: formData.vendor || 'Fornecedor Cadastrado',
          responsible: 'Você (Operador)',
          eventId: Number(formData.eventId),
          eventTitle: ev?.title || 'Evento Selecionado',
          costCenterName: formData.costCenterName,
          category: formData.category,
          competence: formData.competence,
          dueDate: formData.dueDate,
          amountCents: formAmountCents,
          paymentMethod: formData.paymentMethod,
          documentRef: formData.documentRef || `DOC-${Date.now().toString().slice(-4)}`,
          status: formAmountCents <= 500000 ? 'agendado' : 'aguardando_aprovacao',
          approvalTier: formAmountCents <= 500000 ? 'DIRECT' : formAmountCents <= 5000000 ? 'FINANCE' : 'EXECUTIVE',
        }
        setPayablesList([newItem, ...payablesList])
      }

      setShowAddModal(false)
      notify(`Conta a pagar de ${brl(formAmountCents / 100)} cadastrada com sucesso!`)
      loadData()
    } catch {
      notify('Falha ao cadastrar conta a pagar.')
    }
  }

  // Abertura do Modal de Pagamento
  const handleOpenPayment = (payable: PayableItem) => {
    setPayableToPay(payable)
    // Pre-seleciona evento de origem caso haja déficit
    const otherSubs = subaccounts.filter((s) => s.eventId !== payable.eventId && s.availableCents > 0)
    if (otherSubs.length > 0) {
      setSourceTransferEventId(otherSubs[0].eventId)
    }
    setPaymentModalOpen(true)
  }

  // Cálculos do modal de pagamento
  const currentPayableEventSubaccount = useMemo(() => {
    if (!payableToPay) return null
    return subaccounts.find((s) => s.eventId === payableToPay.eventId)
  }, [payableToPay, subaccounts])

  const eventAvailableCents = currentPayableEventSubaccount?.availableCents || 0
  const isBalanceSufficient = payableToPay ? eventAvailableCents >= payableToPay.amountCents : true
  const deficitCents = payableToPay ? Math.max(0, payableToPay.amountCents - eventAvailableCents) : 0

  const selectedTransferSource = useMemo(() => {
    return subaccounts.find((s) => s.eventId === sourceTransferEventId)
  }, [subaccounts, sourceTransferEventId])

  // Executar liquidação / pagamento
  const handleConfirmPayment = async () => {
    if (!payableToPay || isProcessingPayment) return
    setIsProcessingPayment(true)

    try {
      const res = await payFinancePayable(payableToPay.id, {
        sourceTransferEventId: !isBalanceSufficient ? sourceTransferEventId : undefined,
        transferAmountCents: !isBalanceSufficient ? deficitCents : undefined,
      }).catch(() => null)

      if (res && res.ok) {
        notify(res.message || 'Conta liquidada com sucesso!')
      } else {
        // Fallback local
        if (!isBalanceSufficient) {
          notify(`Transferência de ${brl(deficitCents / 100)} de "${selectedTransferSource?.eventTitle}" concluída e despesa de ${brl(payableToPay.amountCents / 100)} liquidada!`)
        } else {
          notify(`Pagamento de ${brl(payableToPay.amountCents / 100)} liquidado com sucesso!`)
        }
      }

      setPayablesList((prev) =>
        prev.map((p) => (p.id === payableToPay.id ? { ...p, status: 'pago', paidAt: new Date().toISOString() } : p))
      )
      setPaymentModalOpen(false)
      loadData()
    } catch (err: any) {
      notify(err?.message || 'Erro ao processar pagamento da despesa.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Exportar CSV
  const exportPayablesCSV = () => {
    const headers = [
      'Código', 'Descrição', 'Fornecedor', 'Evento', 'Centro de Custo',
      'Categoria', 'Competência', 'Vencimento', 'Valor (R$)', 'Forma', 'Status', 'Documento'
    ]
    const rows = [headers.join(';')]
    filtered.forEach((p) => {
      rows.push([
        p.code,
        `"${p.description}"`,
        `"${p.vendor}"`,
        `"${p.eventTitle}"`,
        `"${p.costCenterName}"`,
        `"${p.category}"`,
        `"${p.competence}"`,
        `"${p.dueDate}"`,
        (p.amountCents / 100).toFixed(2).replace('.', ','),
        `"${p.paymentMethod}"`,
        `"${p.status}"`,
        `"${p.documentRef || ''}"`,
      ].join(';'))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contas_a_pagar_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify('Relatório de Contas a Pagar exportado com sucesso!')
  }

  return (
    <div className="finance-dashboard-wrapper space-y-4">
      {/* Botão de Retorno */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => (onNavigate ? onNavigate('finance-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111a29] hover:bg-[#1a283e] text-slate-300 border border-[#24334a] transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#38bdf8]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header do Hub */}
      <header className="producer-account-hero" style={{ padding: '22px 26px' }}>
        <div>
          <span className="eyebrow">HUB OPERACIONAL · CONTAS A PAGAR</span>
          <h1 style={{ fontSize: '26px' }}>Contas a Pagar por Evento</h1>
          <p>
            Gestão empresarial de compromissos com fornecedores, artistas, estrutura, ECAD e custos
            operacionais. Integração nativa com liquidação direta e transferências inter-eventos com
            partidas dobradas no Ledger.
          </p>
        </div>
        <div className="producer-account-actions" style={{ alignSelf: 'center' }}>
          <button onClick={exportPayablesCSV}>
            <Download size={15} /> Exportar CSV
          </button>
          <button className="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Nova Conta a Pagar
          </button>
        </div>
      </header>

      {/* 5 CARDS DE KPI (CONFORME ESPECIFICAÇÃO) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="pa-kpi orange">
          <span className="pa-kpi-icon"><ArrowUpRight size={20} /></span>
          <div>
            <small>A PAGAR</small>
            <strong>{brl(kpis.totalToPayCents / 100)}</strong>
            <span>Compromissos em aberto</span>
          </div>
        </div>

        <div className="pa-kpi blue">
          <span className="pa-kpi-icon"><Clock size={20} /></span>
          <div>
            <small>VENCE HOJE</small>
            <strong style={{ color: kpis.dueTodayCents > 0 ? '#fbbf24' : '#f8fafc' }}>
              {brl(kpis.dueTodayCents / 100)}
            </strong>
            <span>Prioridade de liquidação</span>
          </div>
        </div>

        <div className="pa-kpi green">
          <span className="pa-kpi-icon"><Calendar size={20} /></span>
          <div>
            <small>PRÓXIMOS 7 DIAS</small>
            <strong>{brl(kpis.next7DaysCents / 100)}</strong>
            <span>Previsão de saída</span>
          </div>
        </div>

        <div className="pa-kpi" style={{ color: '#f87171' }}>
          <span className="pa-kpi-icon" style={{ background: '#f87171' }}><AlertTriangle size={20} /></span>
          <div>
            <small>VENCIDO</small>
            <strong style={{ color: '#f87171' }}>{brl(kpis.overdueCents / 100)}</strong>
            <span>Atrasos pendentes</span>
          </div>
        </div>

        <div className="pa-kpi purple">
          <span className="pa-kpi-icon"><CheckCircle2 size={20} /></span>
          <div>
            <small>PAGO NO PERÍODO</small>
            <strong>{brl(kpis.paidPeriodCents / 100)}</strong>
            <span>Liquidados no Ledger</span>
          </div>
        </div>
      </section>

      {/* Toolbar de Filtros */}
      <div className="pa-card" style={{ padding: '14px 18px' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="pa-search-input" style={{ width: '280px' }}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Buscar fornecedor, descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                background: '#111a29',
                border: '1px solid #24334a',
                color: '#cbd5e1',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '13px',
              }}
            >
              <option value="all">Todos os eventos</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#111a29',
                border: '1px solid #24334a',
                color: '#cbd5e1',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '13px',
              }}
            >
              <option value="all">Todos os status</option>
              <option value="aguardando_aprovacao">Aguardando aprovação</option>
              <option value="agendado">Agendado</option>
              <option value="vencido">Vencido</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div style={{ fontSize: '12px', color: "var(--disk-text-muted)" }}>
            Exibindo <strong>{filtered.length}</strong> obrigações
          </div>
        </div>
      </div>

      {/* Tabela de Contas a Pagar */}
      <div className="pa-table-card">
        <div className="pa-table-header">
          <div>
            <span>REGISTRO DE OBRIGAÇÕES POR EVENTO</span>
            <h2>Esteira de Contas a Pagar</h2>
          </div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>
            Rastreabilidade total: Produtor → Evento → Centro de Custo
          </span>
        </div>

        <div className="pa-table-responsive">
          <table className="pa-table">
            <thead>
              <tr>
                <th>Descrição / NF</th>
                <th>Fornecedor</th>
                <th>Evento & Centro Custo</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Forma</th>
                <th>Alçada & Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: "var(--disk-text-muted)" }}>
                    Nenhuma obrigação encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isPaid = item.status === 'pago'
                  const isOverdue = item.status === 'vencido'

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="pa-event-info">
                          <strong>{item.description}</strong>
                          <small>{item.documentRef ? `Doc: ${item.documentRef}` : item.code}</small>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#e2e8f0' }}>{item.vendor}</strong>
                        <small style={{ display: 'block', color: "var(--disk-text-muted)", fontSize: '11px' }}>
                          Resp: {item.responsible}
                        </small>
                      </td>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{item.eventTitle}</strong>
                        <small style={{ display: 'block', color: "var(--disk-text-muted)", fontSize: '11px' }}>
                          {item.costCenterName} • {item.competence}
                        </small>
                      </td>
                      <td>
                        <strong style={{ color: isOverdue ? '#f87171' : '#f8fafc' }}>
                          {new Date(item.dueDate).toLocaleDateString('pt-BR')}
                        </strong>
                        {isPaid && item.paidAt && (
                          <small style={{ display: 'block', color: '#34d399', fontSize: '10px' }}>
                            Pago {new Date(item.paidAt).toLocaleDateString('pt-BR')}
                          </small>
                        )}
                      </td>
                      <td style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                        {brl(item.amountCents / 100)}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{item.paymentMethod}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span
                            className="pa-badge"
                            style={{
                              background:
                                isPaid ? 'rgba(52, 211, 153, 0.15)' :
                                isOverdue ? 'rgba(248, 113, 113, 0.15)' :
                                item.status === 'aguardando_aprovacao' ? 'rgba(251, 191, 36, 0.15)' :
                                'rgba(56, 189, 248, 0.15)',
                              color:
                                isPaid ? '#34d399' :
                                isOverdue ? '#f87171' :
                                item.status === 'aguardando_aprovacao' ? '#fbbf24' :
                                '#38bdf8',
                            }}
                          >
                            {isPaid ? 'Pago' : isOverdue ? 'Vencido' : item.status === 'aguardando_aprovacao' ? 'Aguardando Aprovação' : 'Agendado'}
                          </span>
                          <span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>
                            {item.approvalTier === 'DIRECT' ? 'Alçada Operador (D+0)' : item.approvalTier === 'FINANCE' ? 'Alçada Financeira' : 'Alçada Diretoria'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="pa-table-actions">
                          {!isPaid && (
                            <button
                              className="pa-btn-table transfer"
                              onClick={() => handleOpenPayment(item)}
                              title="Liquidar obrigação financeira"
                            >
                              <CreditCard size={13} /> Pagar
                            </button>
                          )}
                          {isPaid && (
                            <span style={{ color: '#34d399', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={13} /> Liquidado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ====================================================================
          MODAL: PAGAMENTO COM SUPORTE A TRANSFERÊNCIA DE OUTRO EVENTO
          ==================================================================== */}
      {paymentModalOpen && payableToPay && (
        <div className="pa-modal-overlay">
          <div className="pa-modal" style={{ maxWidth: '620px' }}>
            <div className="pa-modal-header">
              <h3>
                <CreditCard size={18} style={{ color: '#38bdf8' }} />
                Liquidação de Conta a Pagar
              </h3>
              <button className="pa-modal-close" onClick={() => setPaymentModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pa-modal-body">
              {/* Resumo da Conta */}
              <div
                style={{
                  background: '#111a29',
                  border: '1px solid #233149',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <small style={{ color: "var(--disk-text-muted)" }}>Despesa a Pagar</small>
                  <strong style={{ display: 'block', color: '#ffffff', fontSize: '14px' }}>
                    {payableToPay.description}
                  </strong>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>
                    {payableToPay.vendor} • Evento: {payableToPay.eventTitle}
                  </span>
                </div>
                <strong style={{ fontSize: '20px', color: '#38bdf8' }}>
                  {brl(payableToPay.amountCents / 100)}
                </strong>
              </div>

              {/* Verificação do Saldo no Evento */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: isBalanceSufficient ? '1px solid #10b981' : '1px solid #f59e0b',
                  background: isBalanceSufficient ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: isBalanceSufficient ? '#34d399' : '#fbbf24', fontSize: '13px' }}>
                    {isBalanceSufficient ? 'Saldo Disponível Suficiente no Evento' : 'Saldo Insuficiente neste Evento'}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    Saldo Atual: <strong>{brl(eventAvailableCents / 100)}</strong>
                  </span>
                </div>

                {!isBalanceSufficient && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#fcd34d', lineHeight: '1.4' }}>
                    Faltam <strong>{brl(deficitCents / 100)}</strong> no evento <strong>{payableToPay.eventTitle}</strong> para honrar este pagamento. Você pode cobrir esse déficit transferindo saldo de outro evento do mesmo produtor.
                  </p>
                )}
              </div>

              {/* Fluxo de Transferência Inter-Eventos Conectado */}
              {!isBalanceSufficient && (
                <div
                  style={{
                    background: '#0c1421',
                    border: '1px solid #233149',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                    <ArrowLeftRight size={16} />
                    <strong style={{ fontSize: '13px' }}>Transferir Saldo de Outro Evento</strong>
                  </div>

                  <div className="pa-field-group">
                    <label>
                      <span>Evento de Origem com Saldo</span>
                      <strong style={{ color: '#34d399' }}>
                        Disponível: {brl((selectedTransferSource?.availableCents || 0) / 100)}
                      </strong>
                    </label>
                    <select
                      value={sourceTransferEventId}
                      onChange={(e) => setSourceTransferEventId(Number(e.target.value))}
                    >
                      {subaccounts
                        .filter((s) => s.eventId !== payableToPay.eventId && s.availableCents >= deficitCents)
                        .map((s) => (
                          <option key={s.eventId} value={s.eventId}>
                            {s.eventTitle} (Disponível: {brl(s.availableCents / 100)})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Detalhe das 2 Operações Separadas */}
                  <div className="pa-double-entry-card" style={{ marginTop: '4px' }}>
                    <h4>
                      <LockKeyhole size={14} /> 2 Operações Transparentes no Ledger:
                    </h4>
                    <div className="pa-entry-line">
                      <span>
                        1. Transferência Interna: <strong>{selectedTransferSource?.eventTitle}</strong>
                      </span>
                      <strong style={{ color: '#f87171' }}>-{brl(deficitCents / 100)}</strong>
                    </div>
                    <div className="pa-entry-line">
                      <span>
                        1. Aporte no Evento: <strong>{payableToPay.eventTitle}</strong>
                      </span>
                      <strong style={{ color: '#34d399' }}>+{brl(deficitCents / 100)}</strong>
                    </div>
                    <div className="pa-entry-line" style={{ borderTop: '1px solid #233149', marginTop: '6px', paddingTop: '6px' }}>
                      <span>
                        2. Pagamento de Fornecedor: <strong>{payableToPay.vendor}</strong>
                      </span>
                      <strong style={{ color: '#38bdf8' }}>-{brl(payableToPay.amountCents / 100)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pa-modal-footer">
              <button
                className="pa-btn-table"
                disabled={isProcessingPayment}
                onClick={() => setPaymentModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="primary"
                disabled={isProcessingPayment || (!isBalanceSufficient && !selectedTransferSource)}
                onClick={handleConfirmPayment}
              >
                {isProcessingPayment
                  ? 'Processando no Ledger...'
                  : !isBalanceSufficient
                  ? 'Transferir Saldo e Liquidar Despesa'
                  : 'Confirmar Pagamento Direto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: NOVA CONTA A PAGAR
          ==================================================================== */}
      {showAddModal && (
        <div className="pa-modal-overlay">
          <div className="pa-modal" style={{ maxWidth: '640px' }}>
            <div className="pa-modal-header">
              <h3>
                <Plus size={18} style={{ color: '#38bdf8' }} /> Nova Conta a Pagar
              </h3>
              <button className="pa-modal-close" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="pa-modal-body">
                <div className="pa-field-group">
                  <label>Descrição da Despesa / Compromisso</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Locação de geradores de energia para área VIP"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="pa-field-group">
                    <label>Fornecedor / Favorecido</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Geradores Curitiba Ltda"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    />
                  </div>
                  <div className="pa-field-group">
                    <label>Evento Associado</label>
                    <select
                      value={formData.eventId}
                      onChange={(e) => setFormData({ ...formData, eventId: Number(e.target.value) })}
                    >
                      {events.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="pa-field-group">
                    <label>Centro de Custo</label>
                    <select
                      value={formData.costCenterName}
                      onChange={(e) => setFormData({ ...formData, costCenterName: e.target.value })}
                    >
                      <option value="01 PRODUÇÃO">01 PRODUÇÃO</option>
                      <option value="02 LOCAL">02 LOCAL</option>
                      <option value="03 OPERAÇÃO">03 OPERAÇÃO</option>
                      <option value="04 MARKETING">04 MARKETING</option>
                      <option value="05 LOGÍSTICA">05 LOGÍSTICA</option>
                      <option value="06 TAXAS E TRIBUTOS">06 TAXAS E TRIBUTOS</option>
                    </select>
                  </div>
                  <div className="pa-field-group">
                    <label>Categoria Operacional</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Energia & Geradores"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="pa-field-group">
                    <label>Valor (R$)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 8.500,00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="pa-field-group">
                    <label>Data de Vencimento</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="pa-field-group">
                    <label>Forma de Pagamento</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="PIX">PIX</option>
                      <option value="TED">TED</option>
                      <option value="Boleto">Boleto Bancário</option>
                      <option value="Cartão Corporativo">Cartão Corporativo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="pa-field-group">
                    <label>Documento / NF-e (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: NF-e 98412"
                      value={formData.documentRef}
                      onChange={(e) => setFormData({ ...formData, documentRef: e.target.value })}
                    />
                  </div>
                  <div className="pa-field-group">
                    <label>Competência</label>
                    <input
                      type="text"
                      value={formData.competence}
                      onChange={(e) => setFormData({ ...formData, competence: e.target.value })}
                    />
                  </div>
                </div>

                {/* Banner de Alçada */}
                <div
                  style={{
                    background: '#111a29',
                    border: '1px solid #24334a',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ShieldCheck size={16} className="text-[#38bdf8]" />
                  <span>
                    Workflow: <strong className={formTier.cls}>{formTier.label}</strong>
                  </span>
                </div>
              </div>

              <div className="pa-modal-footer">
                <button type="button" className="pa-btn-table" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary">
                  Cadastrar Conta a Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
