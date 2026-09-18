import React, { useState } from 'react'
import {
  FileSpreadsheet,
  BookOpen,
  Scale,
  Building2,
  CheckCircle2,
  FileText,
  DollarSign,
  PieChart as PieIcon,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
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

interface AccountingEntry {
  id: string
  code: string
  accountDebit: string
  accountCredit: string
  description: string
  amount: number
  costCenter: string
  status: 'conciliado' | 'pendente'
  date: string
}

const mockEntries: AccountingEntry[] = [
  {
    id: 'ct-1',
    code: '#LCT-901',
    accountDebit: '1.1.1.02 - Conta Vinculada Produtores (Itaú)',
    accountCredit: '2.1.2.01 - Valores a Repassar a Produtores',
    description: 'Reconhecimento de custódia de ingressos vendidos - Rock 2026',
    amount: 540000.0,
    costCenter: 'CC-EVT-5842',
    status: 'conciliado',
    date: '2026-09-18T10:00:00',
  },
  {
    id: 'ct-2',
    code: '#LCT-902',
    accountDebit: '1.1.1.01 - Conta Movimento DiskIngressos',
    accountCredit: '3.1.1.01 - Receita Própria com Taxas de Conveniência',
    description: 'Apropriação da taxa de intermediação de serviço (10%)',
    amount: 60000.0,
    costCenter: 'CC-PLATAFORMA',
    status: 'conciliado',
    date: '2026-09-18T10:05:00',
  },
  {
    id: 'ct-3',
    code: '#LCT-903',
    accountDebit: '2.1.2.01 - Valores a Repassar a Produtores',
    accountCredit: '1.1.1.02 - Conta Vinculada Produtores (Itaú)',
    description: 'Liquidação de repasse bancário via PIX Produtora Rock',
    amount: 250000.0,
    costCenter: 'CC-EVT-5842',
    status: 'conciliado',
    date: '2026-09-17T17:35:00',
  },
  {
    id: 'ct-4',
    code: '#LCT-904',
    accountDebit: '3.1.2.05 - Dedução da Receita (Estornos)',
    accountCredit: '1.1.1.01 - Conta Movimento DiskIngressos',
    description: 'Estorno contábil de taxa de conveniência pedido #PED-979402',
    amount: 52.0,
    costCenter: 'CC-PLATAFORMA',
    status: 'pendente',
    date: '2026-09-17T16:45:00',
  },
]

const balanceData = [
  { group: 'Custódia Produtores (90%)', valor: 6660000 },
  { group: 'Receita Própria Disk (10%)', valor: 740000 },
  { group: 'Repasses já Liquidados', valor: 4200000 },
  { group: 'Receita Diferida (A Realizar)', valor: 2460000 },
]

export function ContabilidadeDashboard() {
  const { selectedEvent, events } = useGlobalContext()
  const activeEvent = selectedEvent || events[0]

  const columns: Column<AccountingEntry>[] = [
    {
      key: 'code',
      header: 'Partida',
      width: '110px',
      render: (item) => (
        <span className="font-mono font-bold text-slate-800 text-xs">{item.code}</span>
      ),
    },
    {
      key: 'description',
      header: 'Histórico Contábil & Centro de Custo',
      render: (item) => (
        <div>
          <div className="text-xs font-semibold text-slate-800">{item.description}</div>
          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
            D: {item.accountDebit}
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            C: {item.accountCredit}
          </div>
        </div>
      ),
    },
    {
      key: 'costCenter',
      header: 'Centro Resultado',
      render: (item) => (
        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {item.costCenter}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {formatCurrency(item.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'conciliado' ? 'emerald' : 'amber'}
          dot
        >
          {item.status === 'conciliado' ? 'Conciliado' : 'Pendente'}
        </StatusBadge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/30">
              <FileSpreadsheet className="h-3 w-3" /> Segregação Contábil & Compliance
            </span>
            <span className="text-xs text-slate-400 font-mono">Normas CFC / CPC 47</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Controladoria & Livro Razão
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Isolamento contábil absoluto: os valores de ingressos pertencem aos produtores e não transitam na receita da DiskIngressos. Apenas a comissão/taxa de serviço é faturada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-slate-800/80 px-4 py-2 border border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Competência Ativa</span>
            <span className="text-xs font-bold text-white">Setembro / 2026 (Aberto)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita da Plataforma (10%)"
          value={formatCurrency(740000)}
          trend={{ value: '+14.2% vs ago', isPositive: true }}
          icon={DollarSign}
          iconColor="emerald"
        />
        <StatCard
          title="Passivo de Custódia (Produtores)"
          value={formatCurrency(6660000)}
          subtext="Contas vinculadas de terceiros (não é receita)"
          icon={Scale}
          iconColor="blue"
        />
        <StatCard
          title="Taxa de Conciliação Contábil"
          value="99.8%"
          trend={{ value: 'Auditado diariamente', isPositive: true }}
          icon={CheckCircle2}
          iconColor="emerald"
        />
        <StatCard
          title="Receita Diferida (A Reconhecer)"
          value={formatCurrency(2460000)}
          subtext="Eventos futuros com liquidação no pós-show"
          icon={BookOpen}
          iconColor="amber"
        />
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Distribuição Contábil das Massas Financeiras
              </h3>
              <p className="text-xs text-slate-400">Segregação patrimonial na competência 2026</p>
            </div>
            <StatusBadge variant="blue">CPC 47</StatusBadge>
          </div>

          <div className="h-60 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={balanceData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => `R$${v / 1000000}M`} stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="group" stroke="#94a3b8" fontSize={11} width={160} />
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
                <Bar dataKey="valor" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fiscal Notes & SPED Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Obrigações Fiscais & SPED</h3>
            <p className="text-xs text-slate-400">NFS-e de corretagem de serviço emitida por lote</p>
          </div>

          <div className="space-y-3 py-3">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">NFS-e Prefeitura Curitiba</span>
                <StatusBadge variant="emerald" size="sm">Emitidas (100%)</StatusBadge>
              </div>
              <div className="mt-2 text-xs font-mono text-slate-700">
                Série 2026-A • ISSQN 5% retido
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">ECD / ECF Contábil</span>
                <StatusBadge variant="blue" size="sm">Em Dia</StatusBadge>
              </div>
              <div className="mt-2 text-xs font-mono text-slate-700">
                Transmissão anual automática via ReceitaNet
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            Certificado Digital A1 ativo (Validade até 2027)
          </div>
        </div>
      </div>

      {/* Accounting Entries Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Livro Diário / Lançamentos das Partidas Dobradas
            </h3>
            <p className="text-xs text-slate-400">
              Movimentações contábeis rastreáveis vinculadas ao evento {activeEvent.name}
            </p>
          </div>
          <StatusBadge variant="emerald">Auditável</StatusBadge>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={mockEntries}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>
    </div>
  )
}
