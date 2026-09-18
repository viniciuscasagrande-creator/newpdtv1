import React, { useState } from 'react'
import {
  RotateCcw,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowDownRight,
  Filter,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

interface RefundRequest {
  id: string
  protocol: string
  orderNumber: string
  eventName: string
  customerName: string
  customerCpf: string
  amount: number
  reason: string
  gateway: string
  type: 'total' | 'parcial'
  status: 'pendente' | 'aprovado' | 'rejeitado'
  requestedAt: string
}

const initialRefunds: RefundRequest[] = [
  {
    id: 'ref-01',
    protocol: 'EST-2026-042',
    orderNumber: '#PED-982104',
    eventName: 'Festival Rock 2026',
    customerName: 'Mariana Duarte Souza',
    customerCpf: '112.449.882-01',
    amount: 360.0,
    reason: 'Desistência no prazo legal de 7 dias (Art. 49 CDC)',
    gateway: 'Pagar.me V5',
    type: 'total',
    status: 'pendente',
    requestedAt: '2026-09-18T10:15:00',
  },
  {
    id: 'ref-02',
    protocol: 'EST-2026-043',
    orderNumber: '#PED-981940',
    eventName: 'Teatro Musical Broadway Curitiba',
    customerName: 'Lucas Eduardo Silveira',
    customerCpf: '083.551.920-43',
    amount: 180.0,
    reason: 'Compra duplicada por oscilação de conexão no PDV web',
    gateway: 'Cielo 3.0',
    type: 'parcial',
    status: 'pendente',
    requestedAt: '2026-09-18T11:30:22',
  },
  {
    id: 'ref-03',
    protocol: 'EST-2026-041',
    orderNumber: '#PED-979402',
    eventName: 'Festival de Verão Curitiba',
    customerName: 'Juliana Paes Fontes',
    customerCpf: '054.129.831-77',
    amount: 520.0,
    reason: 'Cancelamento de setor VIP com estorno integral solicitado',
    gateway: 'Rede',
    type: 'total',
    status: 'aprovado',
    requestedAt: '2026-09-17T16:40:11',
  },
  {
    id: 'ref-04',
    protocol: 'EST-2026-039',
    orderNumber: '#PED-978110',
    eventName: 'Stand-up Comedy Brasil',
    customerName: 'Thiago Martins Costa',
    customerCpf: '032.991.442-12',
    amount: 140.0,
    reason: 'Solicitação fora do prazo de cancelamento (evento já ocorrido)',
    gateway: 'Mercado Pago',
    type: 'total',
    status: 'rejeitado',
    requestedAt: '2026-09-16T14:20:00',
  },
]

export function EstornoDashboard() {
  const { selectedEvent } = useGlobalContext()
  const { addAuditLog } = useCoreEventBus()
  const [refunds, setRefunds] = useState<RefundRequest[]>(initialRefunds)
  const [filterStatus, setFilterStatus] = useState<string>('todos')

  const filteredRefunds = refunds.filter((item) => {
    if (selectedEvent && item.eventName !== selectedEvent.name) return false
    if (filterStatus === 'todos') return true
    return item.status === filterStatus
  })

  const totalPending = refunds.filter((r) => r.status === 'pendente').reduce((sum, r) => sum + r.amount, 0)
  const pendingCount = refunds.filter((r) => r.status === 'pendente').length

  const handleApprove = (id: string, orderNumber: string, amount: number) => {
    setRefunds((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'aprovado' } : item))
    )
    addAuditLog({
      operatorName: 'Operador Financeiro',
      operatorEmail: 'financeiro@diskingressos.com.br',
      role: 'Financeiro / Compliance',
      action: 'ESTORNO_APROVADO',
      module: 'estorno',
      targetId: orderNumber,
      details: `Estorno de ${formatCurrency(amount)} aprovado e enviado ao gateway de pagamento.`,
      ip: '187.55.120.44',
    })
  }

  const handleReject = (id: string, orderNumber: string) => {
    setRefunds((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejeitado' } : item))
    )
    addAuditLog({
      operatorName: 'Operador Financeiro',
      operatorEmail: 'financeiro@diskingressos.com.br',
      role: 'Financeiro / Compliance',
      action: 'ESTORNO_RECUSADO',
      module: 'estorno',
      targetId: orderNumber,
      details: `Solicitação de estorno recusada com base no regulamento do evento.`,
      ip: '187.55.120.44',
    })
  }

  const columns: Column<RefundRequest>[] = [
    {
      key: 'protocol',
      header: 'Protocolo / Pedido',
      render: (item) => (
        <div>
          <div className="font-mono font-bold text-slate-800 text-xs">{item.protocol}</div>
          <div className="font-mono text-[11px] text-slate-400">{item.orderNumber}</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Cliente / CPF',
      render: (item) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{item.customerName}</div>
          <div className="font-mono text-[10px] text-slate-400">{item.customerCpf}</div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Motivo & Evento',
      render: (item) => (
        <div className="max-w-md">
          <div className="text-xs text-slate-700 font-medium">{item.reason}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{item.eventName} • {item.gateway}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <div className="font-bold text-rose-700 text-xs">{formatCurrency(item.amount)}</div>
          <span className="text-[9.5px] uppercase font-semibold text-slate-400">{item.type}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => {
        if (item.status === 'aprovado') return <StatusBadge variant="emerald">Aprovado</StatusBadge>
        if (item.status === 'rejeitado') return <StatusBadge variant="rose">Recusado</StatusBadge>
        return <StatusBadge variant="amber" dot>Aguardando Análise</StatusBadge>
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          {item.status === 'pendente' ? (
            <>
              <button
                onClick={() => handleApprove(item.id, item.orderNumber, item.amount)}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors"
                title="Aprovar e processar estorno"
              >
                <Check className="h-3 w-3" /> Aprovar
              </button>
              <button
                onClick={() => handleReject(item.id, item.orderNumber)}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                title="Recusar solicitação"
              >
                <X className="h-3 w-3" /> Recusar
              </button>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">Concluído</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400 border border-rose-500/30">
              <RotateCcw className="h-3 w-3" /> Módulo de Estorno & Reembolso
            </span>
            <span className="text-xs text-slate-400 font-mono">Auditoria & SLA</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Gestão de Estornos & Cancelamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Fluxo seguro com aprovação em 2 etapas, comunicação com adquirentes e conciliação automática com o Financeiro do Produtor.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendentes de Aprovação"
          value={formatCurrency(totalPending)}
          subtext={`${pendingCount} solicitações na fila de análise`}
          icon={Clock}
          iconColor="amber"
        />
        <StatCard
          title="Taxa de Chargeback"
          value="0.14%"
          trend={{ value: 'Meta < 0.50%', isPositive: true }}
          icon={ShieldAlert}
          iconColor="emerald"
        />
        <StatCard
          title="Tempo Médio de Resolução"
          value="4.2 horas"
          trend={{ value: '-22% vs mês anterior', isPositive: true }}
          icon={Clock}
          iconColor="blue"
        />
        <StatCard
          title="Estornos Efetivados no Mês"
          value={formatCurrency(28450)}
          subtext="1.1% do faturamento total da plataforma"
          icon={RotateCcw}
          iconColor="indigo"
        />
      </div>

      {/* Table & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fila Operacional de Solicitações
            </h3>
            <p className="text-xs text-slate-400">
              Reembolsos abertos via SAC, portal do cliente ou chargebacks de operadoras
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 font-medium focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Apenas Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="rejeitado">Recusados</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filteredRefunds}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>
    </div>
  )
}
