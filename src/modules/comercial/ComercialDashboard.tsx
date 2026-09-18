import React from 'react'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Target,
  Clock,
  Zap,
  ArrowUpRight,
  Flame,
  Award,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatCurrency, formatNumber, formatDateTime } from '../../utils/formatters'
import { Link } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SaleTransactionEvent } from '../../types/core'

const hourlySalesData = [
  { hour: '08:00', receita: 18400, pedidos: 52 },
  { hour: '10:00', receita: 42000, pedidos: 118 },
  { hour: '12:00', receita: 89000, pedidos: 245 },
  { hour: '13:00', receita: 145000, pedidos: 380 },
  { hour: '14:00', receita: 198000, pedidos: 490 },
]

export function ComercialDashboard() {
  const { selectedEvent, events, periodLabel } = useGlobalContext()
  const { transactions, dispatchSale } = useCoreEventBus()

  const activeEvent = selectedEvent || events[0]
  const targetRevenue = 5000000.0 // R$ 5M meta
  const currentRevenue = activeEvent.totalRevenue
  const metaPercentage = (currentRevenue / targetRevenue) * 100
  const ticketMedio = activeEvent.ticketsSold > 0 ? currentRevenue / activeEvent.ticketsSold : 0

  const ordersColumns: Column<SaleTransactionEvent>[] = [
    {
      key: 'orderNumber',
      header: 'Pedido',
      width: '130px',
      render: (item) => (
        <span className="font-mono font-bold text-slate-800">{item.orderNumber}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Comprador',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.customerName}</div>
          <div className="text-[10px] text-slate-400 font-mono">{item.customerCpf}</div>
        </div>
      ),
    },
    {
      key: 'ticketType',
      header: 'Ingresso / Lote',
      render: (item) => (
        <div>
          <div className="text-slate-800">{item.ticketType}</div>
          <div className="text-[10px] text-slate-400">{item.ticketsCount} unidade(s)</div>
        </div>
      ),
    },
    {
      key: 'gateway',
      header: 'Gateway & Canal',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge variant="slate" size="sm">
            {item.paymentMethod.toUpperCase()}
          </StatusBadge>
          <span className="text-[11px] text-slate-400">{item.gateway}</span>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Valor Total',
      align: 'right',
      render: (item) => (
        <span className="font-bold text-emerald-700">
          {formatCurrency(item.grossAmount)}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Horário',
      align: 'right',
      render: (item) => (
        <span className="text-[11px] font-mono text-slate-400">
          {formatDateTime(item.timestamp)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Module Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Dashboard Comercial & Centro de Receita
            </h1>
            <StatusBadge variant="emerald" dot>
              Transações Ao Vivo
            </StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoramento de receita bruta, velocidade de vendas, canais de distribuição e metas operacionais.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => dispatchSale()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Zap className="h-4 w-4" /> Nova Venda Rápida
          </button>
          <Link
            to="/comercial/tempo-real"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Feed Tempo Real
          </Link>
        </div>
      </div>

      {/* 9 Metrics requested: Receita hoje | Vendas | Ticket médio | Conversão | Meta | Pedidos/minuto | Eventos líderes | Canais | Curva de vendas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Receita Hoje"
          value={formatCurrency(currentRevenue * 0.08)}
          trend={{ value: '+24.6%', isPositive: true }}
          icon={DollarSign}
          iconColor="emerald"
        />
        <StatCard
          title="Vendas Totais"
          value={formatNumber(activeEvent.ticketsSold)}
          trend={{ value: 'Acumulado', isNeutral: true }}
          icon={ShoppingCart}
          iconColor="blue"
        />
        <StatCard
          title="Ticket Médio"
          value={formatCurrency(ticketMedio)}
          trend={{ value: '+R$ 15,20', isPositive: true }}
          icon={TrendingUp}
          iconColor="indigo"
        />
        <StatCard
          title="Conversão Checkout"
          value="4.8%"
          trend={{ value: '+0.6% vs benchmark', isPositive: true }}
          icon={Percent}
          iconColor="amber"
        />
        <StatCard
          title="Atingimento da Meta"
          value={`${metaPercentage.toFixed(1)}%`}
          subtext={`Meta: ${formatCurrency(targetRevenue)}`}
          icon={Target}
          iconColor="emerald"
        />
        <StatCard
          title="Velocidade Atual"
          value="18.4 ped/m"
          trend={{ value: 'Pico às 13:40', isPositive: true }}
          icon={Clock}
          iconColor="rose"
        />
      </div>

      {/* Real-time Sales Curve & Top Leader Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time hourly curve */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Curva de Vendas do Dia (Horária)</h3>
              <p className="text-xs text-slate-400">Volume transacionado nos gateways em tempo real</p>
            </div>
            <StatusBadge variant="emerald" dot>
              {periodLabel}
            </StatusBadge>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
                <Tooltip
                  formatter={(v: any) => [formatCurrency(Number(v)), 'Receita']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHour)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Leader Events */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Eventos Líderes de Faturamento</h3>
            </div>
            <p className="text-xs text-slate-400">Ranking consolidado da semana</p>
          </div>

          <div className="space-y-3 my-3">
            {events.slice(0, 4).map((evt, idx) => (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{evt.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">#{evt.code}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-700">{formatCurrency(evt.totalRevenue)}</div>
                  <div className="text-[10px] text-slate-400">{formatNumber(evt.ticketsSold)} ing.</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/comercial/comparativo"
            className="w-full text-center py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 border-t border-slate-100"
          >
            Ver Comparativo Completo de Eventos →
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Últimos Pedidos Transacionados</h3>
            <p className="text-xs text-slate-400">
              Fluxo atualizado via API REST e WebSocket
            </p>
          </div>
          <Link
            to="/comercial/pedidos"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Ver todos os pedidos →
          </Link>
        </div>

        <DataTable
          columns={ordersColumns}
          data={transactions}
          keyExtractor={(item) => item.orderId}
        />
      </div>
    </div>
  )
}
