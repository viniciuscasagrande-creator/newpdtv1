import React from 'react'
import {
  Calendar,
  Ticket,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  MapPin,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface LoteItem {
  id: string
  name: string
  sector: string
  price: number
  total: number
  sold: number
  status: 'aberto' | 'esgotado' | 'fechado'
}

const mockLotes: LoteItem[] = [
  { id: 'l1', name: '1º Lote Meia Promocional', sector: 'Pista', price: 120, total: 5000, sold: 5000, status: 'esgotado' },
  { id: 'l2', name: '2º Lote Inteira / Meia', sector: 'Pista', price: 180, total: 8000, sold: 6840, status: 'aberto' },
  { id: 'l3', name: '1º Lote Premium Open Bar', sector: 'Pista Premium', price: 340, total: 3000, sold: 3000, status: 'esgotado' },
  { id: 'l4', name: '2º Lote Premium Open Bar', sector: 'Pista Premium', price: 420, total: 4000, sold: 2000, status: 'aberto' },
  { id: 'l5', name: 'Camarote Corporativo Exclusivo', sector: 'Camarotes', price: 800, total: 500, sold: 380, status: 'aberto' },
]

const sectorChartData = [
  { setor: 'Pista Comum', capacidade: 13000, vendidos: 11840 },
  { setor: 'Pista Premium', capacidade: 7000, vendidos: 5000 },
  { setor: 'Camarotes', capacidade: 1500, vendidos: 1100 },
  { setor: 'Área PCD & Cortesias', capacidade: 500, vendidos: 420 },
]

export function EventosDashboard() {
  const { selectedEvent, events } = useGlobalContext()
  const activeEvent = selectedEvent || events[0]

  const occupancy = activeEvent.totalCapacity > 0
    ? (activeEvent.ticketsSold / activeEvent.totalCapacity) * 100
    : 0

  const ticketsLeft = activeEvent.totalCapacity - activeEvent.ticketsSold

  const loteColumns: Column<LoteItem>[] = [
    {
      key: 'name',
      header: 'Lote / Categoria',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-[10px] text-slate-400">{item.sector}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Valor Unitário',
      render: (item) => (
        <span className="font-mono font-medium text-slate-800">
          {formatCurrency(item.price)}
        </span>
      ),
    },
    {
      key: 'sold',
      header: 'Vendidos / Total',
      render: (item) => {
        const pct = (item.sold / item.total) * 100
        return (
          <div className="space-y-1 w-36">
            <div className="flex justify-between text-[11px]">
              <span className="font-bold text-slate-800">{formatNumber(item.sold)}</span>
              <span className="text-slate-400">{formatNumber(item.total)} ({pct.toFixed(0)}%)</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 100 ? 'bg-slate-400' : 'bg-emerald-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'aberto' ? 'emerald' : item.status === 'esgotado' ? 'slate' : 'amber'}
          size="sm"
        >
          {item.status === 'aberto' ? 'Em Venda' : item.status === 'esgotado' ? 'Esgotado' : 'Fechado'}
        </StatusBadge>
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
              Dashboard de Eventos
            </h1>
            <StatusBadge variant="emerald" dot>
              {activeEvent.status === 'em_venda' ? 'Vendas Abertas' : 'Em Operação'}
            </StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Evento ativo: <strong>{activeEvent.name}</strong> (#{activeEvent.code})</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {activeEvent.venue}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/eventos/novo"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Criar Novo Evento
          </Link>
          <Link
            to="/eventos/configuracao"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Configurações
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita do Evento"
          value={formatCurrency(activeEvent.totalRevenue)}
          subtext="Total faturado até o momento"
          icon={Ticket}
          iconColor="emerald"
        />
        <StatCard
          title="Ingressos Vendidos"
          value={formatNumber(activeEvent.ticketsSold)}
          subtext={`${formatNumber(ticketsLeft)} disponíveis`}
          icon={Users}
          iconColor="blue"
        />
        <StatCard
          title="Ocupação Atual"
          value={`${occupancy.toFixed(1)}%`}
          trend={{ value: `${formatNumber(activeEvent.totalCapacity)} capacidade total`, isNeutral: true }}
          icon={Layers}
          iconColor="indigo"
        />
        <StatCard
          title="Check-ins Realizados"
          value={formatNumber(activeEvent.checkinsCount)}
          subtext={activeEvent.status === 'em_operacao' ? 'Catracas em leitura ao vivo' : 'Aguardando abertura de portões'}
          icon={CheckCircle2}
          iconColor="amber"
        />
      </div>

      {/* Sector Breakdown & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Capacidade e Ocupação por Setor</h3>
              <p className="text-xs text-slate-400">Distribuição de ingressos alocados</p>
            </div>
            <Link to="/eventos/setores" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Gerenciar Setores →
            </Link>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="setor" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatNumber(Number(val)),
                    name === 'capacidade' ? 'Capacidade Total' : 'Ingressos Vendidos',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="capacidade" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vendidos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Alerts Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Alertas do Evento</h3>
            <p className="text-xs text-slate-400">Verificações automáticas do Core</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span>2º Lote Pista próximo ao esgotamento</span>
              </div>
              <p className="text-amber-800 text-[11.5px]">
                Restam menos de 1.160 ingressos para liberação automática do 3º Lote.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Alvarás & Termos de Uso Aprovados</span>
              </div>
              <p className="text-emerald-800 text-[11.5px]">
                Corpo de Bombeiros e documentação municipal validados pelo Jurídico.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>Próxima Sessão / Abertura de Portões</span>
              </div>
              <p className="text-slate-600 text-[11.5px]">
                Abertura programada para {formatDate(activeEvent.startDate)} às 14:00.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lotes Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Lotes & Categorias de Preço</h3>
            <p className="text-xs text-slate-400">Controle de cotas de meia-entrada e lotes vigentes</p>
          </div>
          <Link
            to="/eventos/lotes"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Ver todos os lotes →
          </Link>
        </div>

        <DataTable
          columns={loteColumns}
          data={mockLotes}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  )
}
