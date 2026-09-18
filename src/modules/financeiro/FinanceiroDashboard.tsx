import React, { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Landmark,
  FileCheck,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface FinancialEntry {
  id: string
  reference: string
  eventName: string
  description: string
  type: 'credito' | 'debito'
  amount: number
  balanceAfter: number
  category: 'venda' | 'taxa_plataforma' | 'repasse' | 'estorno'
  date: string
}

const initialEntries: FinancialEntry[] = [
  {
    id: 'fin-01',
    reference: '#LAN-4401',
    eventName: 'Festival Rock 2026',
    description: 'Vendas diárias agregadas - Canal Online / PIX',
    type: 'credito',
    amount: 148500.0,
    balanceAfter: 1336500.0,
    category: 'venda',
    date: '2026-09-18T12:00:00',
  },
  {
    id: 'fin-02',
    reference: '#LAN-4402',
    eventName: 'Festival Rock 2026',
    description: 'Taxa de intermediação de ingressos DiskIngressos (10%)',
    type: 'debito',
    amount: 14850.0,
    balanceAfter: 1321650.0,
    category: 'taxa_plataforma',
    date: '2026-09-18T12:05:00',
  },
  {
    id: 'fin-03',
    reference: '#LAN-4400',
    eventName: 'Festival de Verão Curitiba',
    description: 'Repasse programado - Lote 1 para conta Itaú do Produtor',
    type: 'debito',
    amount: 250000.0,
    balanceAfter: 640000.0,
    category: 'repasse',
    date: '2026-09-17T17:30:00',
  },
  {
    id: 'fin-04',
    reference: '#LAN-4398',
    eventName: 'Teatro Musical Broadway Curitiba',
    description: 'Estorno de 2 ingressos cancelados via SAC',
    type: 'debito',
    amount: 360.0,
    balanceAfter: 284100.0,
    category: 'estorno',
    date: '2026-09-17T11:20:00',
  },
]

const cashFlowData = [
  { mes: 'Mai', entradas: 1200000, repasses: 850000 },
  { mes: 'Jun', entradas: 1850000, repasses: 1300000 },
  { mes: 'Jul', entradas: 2400000, repasses: 1750000 },
  { mes: 'Ago', entradas: 3100000, repasses: 2200000 },
  { mes: 'Set', entradas: 3950000, repasses: 2800000 },
]

export function FinanceiroDashboard() {
  const { selectedEvent, events } = useGlobalContext()
  const { addAuditLog } = useCoreEventBus()

  const activeEvent = selectedEvent || events[0]
  const eventGross = activeEvent.totalRevenue
  const diskFee = eventGross * 0.1 // 10%
  const netProducer = eventGross - diskFee
  const availablePayout = netProducer * 0.75 // 75% disponível, 25% custódia D+2
  const inCustody = netProducer * 0.25

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutSuccess, setPayoutSuccess] = useState(false)

  const handleRequestPayout = () => {
    setIsPayoutModalOpen(false)
    setPayoutSuccess(true)
    addAuditLog({
      operatorName: 'Produtor Financeiro',
      operatorEmail: 'financeiro@produtora.com.br',
      role: 'Produtor / Finanças',
      action: 'SOLICITACAO_REPASSE',
      module: 'financeiro',
      targetId: activeEvent.code,
      details: `Solicitação de repasse bancário no valor de ${formatCurrency(availablePayout)} gerada para liquidação PIX/TED.`,
      ip: '187.55.120.44',
    })
    setTimeout(() => setPayoutSuccess(false), 5000)
  }

  const columns: Column<FinancialEntry>[] = [
    {
      key: 'reference',
      header: 'Lançamento',
      width: '130px',
      render: (item) => (
        <div>
          <span className="font-mono font-bold text-slate-800 text-xs">{item.reference}</span>
          <div className="text-[10px] text-slate-400 font-mono">{formatDateTime(item.date)}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Descrição / Evento',
      render: (item) => (
        <div>
          <div className="text-xs font-medium text-slate-800">{item.description}</div>
          <div className="text-[10px] text-slate-400">{item.eventName}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Categoria',
      render: (item) => {
        if (item.category === 'venda') return <StatusBadge variant="emerald">Receita Venda</StatusBadge>
        if (item.category === 'repasse') return <StatusBadge variant="blue">Repasse Produtor</StatusBadge>
        if (item.category === 'taxa_plataforma') return <StatusBadge variant="purple">Taxa Plataforma</StatusBadge>
        return <StatusBadge variant="rose">Estorno</StatusBadge>
      },
    },
    {
      key: 'amount',
      header: 'Valor',
      align: 'right',
      render: (item) => (
        <span
          className={`font-semibold text-xs ${
            item.type === 'credito' ? 'text-emerald-700' : 'text-slate-800'
          }`}
        >
          {item.type === 'credito' ? '+' : '-'} {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Saldo Restante',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-xs font-semibold text-slate-600">
          {formatCurrency(item.balanceAfter)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <DollarSign className="h-3 w-3" /> Gestão Financeira Segregada
            </span>
            <span className="text-xs text-slate-400 font-mono">Conta #{activeEvent.code}</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Conta do Produtor & Repasses
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Saldos estritamente individualizados por evento com retenção de segurança e conciliação bancária automática.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" /> Solicitar Repasse
          </button>
        </div>
      </div>

      {payoutSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Solicitação de repasse registrada com sucesso no valor de {formatCurrency(availablePayout)}!
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Saldo Líquido Produtor"
          value={formatCurrency(netProducer)}
          subtext={`Após dedução de ${formatCurrency(diskFee)} de taxas`}
          icon={Wallet}
          iconColor="emerald"
        />
        <StatCard
          title="Disponível para Repasse"
          value={formatCurrency(availablePayout)}
          trend={{ value: 'Imediato via PIX', isPositive: true }}
          icon={Landmark}
          iconColor="blue"
        />
        <StatCard
          title="Custódia Garantidora (D+2)"
          value={formatCurrency(inCustody)}
          subtext="Reserva para chargebacks e cancelamentos"
          icon={Clock}
          iconColor="amber"
        />
        <StatCard
          title="Taxas DiskIngressos Retidas"
          value={formatCurrency(diskFee)}
          subtext="10% padrão de intermediação"
          icon={TrendingUp}
          iconColor="indigo"
        />
      </div>

      {/* Chart and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Evolução de Entradas & Repasses
              </h3>
              <p className="text-xs text-slate-400">Fluxo consolidado por competência mensal</p>
            </div>
            <StatusBadge variant="slate">2026</StatusBadge>
          </div>

          <div className="h-60 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000000}M`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value))]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="entradas" name="Entradas Brutas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repasses" name="Repasses Efetuados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Account Info Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Conta de Liquidação Cadastrada</h3>
            <p className="text-xs text-slate-400">Destino oficial dos repasses do produtor</p>
          </div>

          <div className="space-y-3 py-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Landmark className="h-4 w-4 text-blue-600" /> Banco Itaú Unibanco S.A. (341)
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Agência</span>
                  <span className="font-mono font-semibold">1420</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Conta Corrente</span>
                  <span className="font-mono font-semibold">98234-1</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Chave PIX (CNPJ)</span>
                  <span className="font-mono font-semibold">24.588.910/0001-33</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <FileCheck className="h-4 w-4 shrink-0" />
              <span>Titularidade validada com a Receita Federal e CIP.</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Liquidação automática via PIX D+0 em dias úteis até as 16h.
          </div>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Extrato Financeiro da Conta do Evento
            </h3>
            <p className="text-xs text-slate-400">
              Histórico detalhado de movimentações, retenções e transferências
            </p>
          </div>
          <StatusBadge variant="emerald" dot>Conciliado</StatusBadge>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={initialEntries}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Confirmar Solicitação de Repasse</h3>
            <p className="text-xs text-slate-500 mt-1">
              O valor disponível será transferido para a conta bancária cadastrada do produtor.
            </p>

            <div className="my-4 rounded-xl bg-slate-50 p-4 border border-slate-200">
              <div className="flex justify-between text-xs text-slate-600 mb-2">
                <span>Evento:</span>
                <span className="font-semibold text-slate-900">{activeEvent.name}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 mb-2">
                <span>Valor a transferir:</span>
                <span className="font-bold text-emerald-700 text-sm">{formatCurrency(availablePayout)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Chave PIX:</span>
                <span className="font-mono text-slate-800">24.588.910/0001-33</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleRequestPayout}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Confirmar Repasse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
