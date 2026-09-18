import React, { useState } from 'react'
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  User,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatDateTime } from '../../utils/formatters'
import type { AuditLogItem } from '../../types/core'

export function AuditoriaPage() {
  const { auditLogs } = useCoreEventBus()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('todos')

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.operatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.targetId ? log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    const matchesModule = selectedModule === 'todos' || log.module === selectedModule
    return matchesSearch && matchesModule
  })

  const columns: Column<AuditLogItem>[] = [
    {
      key: 'timestamp',
      header: 'Horário & IP',
      width: '150px',
      render: (item) => (
        <div>
          <div className="font-mono text-xs font-semibold text-slate-800">
            {formatDateTime(item.timestamp)}
          </div>
          <div className="font-mono text-[10px] text-slate-400">IP: {item.ip}</div>
        </div>
      ),
    },
    {
      key: 'operatorName',
      header: 'Operador / Função',
      render: (item) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{item.operatorName}</div>
          <div className="text-[10px] text-slate-500">{item.role}</div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Ação Registrada',
      render: (item) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
            {item.action}
          </span>
          <div className="text-[10px] uppercase font-semibold text-slate-400 mt-1">
            Módulo: {item.module}
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Detalhamento Operacional',
      render: (item) => (
        <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
          {item.details}
        </p>
      ),
    },
    {
      key: 'targetId',
      header: 'Identificador Alvo',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-[11px] font-bold text-emerald-700">
          {item.targetId || '-'}
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
              <ShieldCheck className="h-3 w-3" /> Trilha Imutável de Auditoria
            </span>
            <span className="text-xs text-slate-400 font-mono">LGPD & Compliance ISO 27001</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Logs de Segurança & Auditoria Core
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Registro de todas as ações administrativas, repasses financeiros, estornos, alterações de lotes e disparos de automações no sistema.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Download do relatório criptografado em formato CSV/JSON iniciado.')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" /> Exportar Trilha
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Eventos Auditados"
          value={auditLogs.length.toString()}
          subtext="Histórico completo em tempo real"
          icon={Activity}
          iconColor="blue"
        />
        <StatCard
          title="Integridade Criptográfica"
          value="100% SHA-256"
          trend={{ value: 'Nenhuma violação detectada', isPositive: true }}
          icon={Lock}
          iconColor="emerald"
        />
        <StatCard
          title="Operadores Conectados"
          value="4 ativos"
          subtext="Sessões autenticadas com 2FA"
          icon={User}
          iconColor="indigo"
        />
        <StatCard
          title="Ações Críticas (24h)"
          value="8 registros"
          subtext="Repasses, estornos e alterações de preço"
          icon={AlertCircle}
          iconColor="amber"
        />
      </div>

      {/* Filter and Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por operador, ação, pedido, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-slate-700 font-medium focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="todos">Todos os Módulos</option>
              <option value="financeiro">Financeiro</option>
              <option value="comercial">Comercial</option>
              <option value="estorno">Estorno</option>
              <option value="sac">SAC</option>
              <option value="remarketing">Remarketing</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={filteredLogs}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>
    </div>
  )
}
