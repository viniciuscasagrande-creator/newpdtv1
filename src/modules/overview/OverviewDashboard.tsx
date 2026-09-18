import React from 'react'
import {
  TrendingUp,
  DollarSign,
  Users,
  Ticket,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { StatCard } from '../../components/common/StatCard'
import { DataTable, type Column } from '../../components/common/DataTable'
import { StatusBadge } from '../../components/common/StatusBadge'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatCurrency, formatNumber, formatDateTime } from '../../utils/formatters'
import { NAVIGATION_MODULES } from '../../app/navigation'
import { Link } from 'react-router-dom'
import type { SaleTransactionEvent } from '../../types/core'

const chartData = [
  { day: '01/09', receita: 125000, ingressos: 620 },
  { day: '05/09', receita: 210000, ingressos: 1050 },
  { day: '10/09', receita: 380000, ingressos: 1840 },
  { day: '15/09', receita: 490000, ingressos: 2350 },
  { day: '18/09', receita: 620000, ingressos: 2980 },
]

const channelData = [
  { name: 'Site Web Desktop', value: 45, color: '#10b981' },
  { name: 'App DiskIngressos', value: 35, color: '#3b82f6' },
  { name: 'Bilheteria & PDVs', value: 15, color: '#f59e0b' },
  { name: 'Parceiros & Afiliados', value: 5, color: '#8b5cf6' },
]

export function OverviewDashboard() {
  const { selectedEvent, events, periodLabel } = useGlobalContext()
  const { transactions, dispatchSale } = useCoreEventBus()

  const totalRevenue = selectedEvent
    ? selectedEvent.totalRevenue
    : events.reduce((acc, e) => acc + e.totalRevenue, 0)

  const totalTickets = selectedEvent
    ? selectedEvent.ticketsSold
    : events.reduce((acc, e) => acc + e.ticketsSold, 0)

  const totalCapacity = selectedEvent
    ? selectedEvent.totalCapacity
    : events.reduce((acc, e) => acc + e.totalCapacity, 0)

  const occupancyRate = totalCapacity > 0 ? (totalTickets / totalCapacity) * 100 : 0

  const recentSalesColumns: Column<SaleTransactionEvent>[] = [
    {
      key: 'orderNumber',
      header: 'Pedido',
      width: '120px',
      render: (item) => (
        <span className="font-mono font-bold text-slate-800">{item.orderNumber}</span>
      ),
    },
    {
      key: 'eventName',
      header: 'Evento',
      render: (item) => (
        <div>
          <div className="font-medium text-slate-900">{item.eventName}</div>
          <div className="text-[10px] text-slate-400">{item.ticketType}</div>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Cliente / CPF',
      render: (item) => (
        <div>
          <div className="text-slate-800 font-medium">{item.customerName}</div>
          <div className="font-mono text-[10px] text-slate-400">{item.customerCpf}</div>
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Pagamento',
      render: (item) => (
        <StatusBadge variant="slate" size="sm">
          {item.paymentMethod.toUpperCase()}
        </StatusBadge>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Valor Bruto',
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-emerald-700">
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
      {/* Top Banner / Core Platform Introduction */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md border border-slate-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" /> Plataforma Operacional DiskIngressos
              </span>
              <span className="text-xs text-slate-400 font-mono">Fase 1.1 — Arquitetura Core</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Visão Geral Executiva do Sistema
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Um único sistema com 9 módulos interdependentes, contexto compartilhado de evento ({selectedEvent ? selectedEvent.name : 'Todos os Eventos'}) e banco de dados unificado.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => dispatchSale()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4" /> Simular Transação Global
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Consolidada"
          value={formatCurrency(totalRevenue)}
          trend={{ value: '+18.4%', isPositive: true, label: `vs ${periodLabel}` }}
          icon={DollarSign}
          iconColor="emerald"
        />
        <StatCard
          title="Ingressos Vendidos"
          value={formatNumber(totalTickets)}
          trend={{ value: '+12.1%', isPositive: true, label: 'ritmo acelerado' }}
          icon={Ticket}
          iconColor="blue"
        />
        <StatCard
          title="Taxa Média de Ocupação"
          value={`${occupancyRate.toFixed(1)}%`}
          subtext={`${formatNumber(totalCapacity)} capacidade total planejada`}
          icon={Users}
          iconColor="indigo"
        />
        <StatCard
          title="SLA SAC & Incidentes"
          value="98.2%"
          trend={{ value: 'Tempo médio 4.2m', isPositive: true }}
          icon={CheckCircle}
          iconColor="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Curve */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Curva de Faturamento & Vendas
              </h3>
              <p className="text-xs text-slate-400">
                Evolução no período selecionado ({periodLabel})
              </p>
            </div>
            <StatusBadge variant="emerald" dot>
              Tempo Real
            </StatusBadge>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R$${v / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Receita']}
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
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Vendas por Canal</h3>
            <p className="text-xs text-slate-400">Participação de receita da plataforma</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {channelData.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <span className="font-bold text-slate-800">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 9 Modules Grid Navigator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Módulos Integrados da Plataforma
            </h3>
            <p className="text-xs text-slate-400">
              Navegue pelos 9 módulos autônomos que operam sobre a mesma base de dados
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">9 Módulos Ativos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-4">
          {NAVIGATION_MODULES.map((mod) => (
            <Link
              key={mod.id}
              to={mod.path}
              className="group flex flex-col justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {mod.title}
                </span>
                {mod.badge && (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
                    {mod.badge}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {mod.description}
              </p>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-emerald-600 font-semibold">
                <span>{mod.subItems.length} subrotas estruturadas</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Real-time Transactions Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fluxo Central de Vendas (Core Stream)
            </h3>
            <p className="text-xs text-slate-400">
              Transações emitidas pelo módulo Comercial e replicadas instantaneamente no ecossistema
            </p>
          </div>
          <button
            onClick={() => dispatchSale()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Zap className="h-3.5 w-3.5" /> Emitir Nova Venda
          </button>
        </div>

        <DataTable
          columns={recentSalesColumns}
          data={transactions}
          keyExtractor={(item) => item.orderId}
        />
      </div>
    </div>
  )
}
