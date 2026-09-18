import React, { useState } from 'react'
import {
  Headphones,
  Radio,
  Wifi,
  Printer,
  QrCode,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Activity,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { formatNumber, formatDateTime } from '../../utils/formatters'
import { Link } from 'react-router-dom'

interface IncidentItem {
  id: string
  code: string
  title: string
  location: string
  severity: 'alta' | 'media' | 'baixa'
  assignedTo: string
  openedAt: string
  status: 'aberto' | 'em_andamento' | 'resolvido'
}

const mockIncidents: IncidentItem[] = [
  {
    id: 'inc-1',
    code: 'INC-8812',
    title: 'Falha de comunicação no Leitor de QR Code #07 - Portão Principal',
    location: 'Pedreira Paulo Leminski - Portão 2',
    severity: 'alta',
    assignedTo: 'Equipe de TI Local (Marcos)',
    openedAt: '2026-09-18T13:35:00',
    status: 'em_andamento',
  },
  {
    id: 'inc-2',
    code: 'INC-8813',
    title: 'Falta de bobina térmica na Impressora de Bilheteria #02',
    location: 'Bilheteria Central - Guichê 4',
    severity: 'media',
    assignedTo: 'Suporte Bilheteria (Julia)',
    openedAt: '2026-09-18T13:40:00',
    status: 'aberto',
  },
  {
    id: 'inc-3',
    code: 'INC-8810',
    title: 'Tentativa de reentrada com ingresso já validado no Setor Camarote',
    location: 'Catraca VIP Acesso 1',
    severity: 'baixa',
    assignedTo: 'Segurança / Coordenação',
    openedAt: '2026-09-18T13:10:00',
    status: 'resolvido',
  },
]

export function SuporteEventosDashboard() {
  const { selectedEvent, events } = useGlobalContext()
  const activeEvent = selectedEvent || events[0]
  const [isLiveMode, setIsLiveMode] = useState(true)

  const incidentColumns: Column<IncidentItem>[] = [
    {
      key: 'code',
      header: 'Protocolo',
      width: '120px',
      render: (item) => (
        <span className="font-mono font-bold text-slate-800">{item.code}</span>
      ),
    },
    {
      key: 'title',
      header: 'Ocorrência / Local',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.title}</div>
          <div className="text-[10px] text-slate-400">{item.location}</div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Gravidade',
      render: (item) => (
        <StatusBadge
          variant={item.severity === 'alta' ? 'rose' : item.severity === 'media' ? 'amber' : 'slate'}
          size="sm"
        >
          {item.severity.toUpperCase()}
        </StatusBadge>
      ),
    },
    {
      key: 'assignedTo',
      header: 'Responsável',
      render: (item) => <span className="text-slate-700">{item.assignedTo}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'resolvido' ? 'emerald' : item.status === 'em_andamento' ? 'blue' : 'amber'}
          dot
          size="sm"
        >
          {item.status === 'resolvido' ? 'Resolvido' : item.status === 'em_andamento' ? 'Em Ação' : 'Aberto'}
        </StatusBadge>
      ),
    },
    {
      key: 'openedAt',
      header: 'Abertura',
      align: 'right',
      render: (item) => (
        <span className="text-[11px] font-mono text-slate-400">
          {formatDateTime(item.openedAt)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Module Title & Modo Evento Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Central Operacional de Suporte a Eventos
            </h1>
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                isLiveMode
                  ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              {isLiveMode ? 'MODO EVENTO AO VIVO' : 'Modo Padrão'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de catracas, bilheterias presenciais, hardware de leitura, PDVs e ocorrências operacionais do produtor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/suporte-eventos/modo-evento"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Activity className="h-4 w-4 text-emerald-400" /> Painel de Controle de Catracas
          </Link>
          <Link
            to="/suporte-eventos/incidentes"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Abrir Chamado
          </Link>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Torniquetes & Catracas"
          value="24 / 24 Online"
          subtext="100% de conectividade de rede"
          icon={Wifi}
          iconColor="emerald"
        />
        <StatCard
          title="Tempo Médio de Leitura"
          value="0.8s"
          trend={{ value: 'Meta < 1.5s', isPositive: true }}
          icon={QrCode}
          iconColor="blue"
        />
        <StatCard
          title="PDVs & Impressoras Ativas"
          value="18 unidades"
          subtext="1 alerta de bobina baixa"
          icon={Printer}
          iconColor="amber"
        />
        <StatCard
          title="Incidentes Não Resolvidos"
          value="2"
          trend={{ value: '1 com SLA crítico', isPositive: false }}
          icon={ShieldAlert}
          iconColor="rose"
        />
      </div>

      {/* Operational Health & Check-in Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gate status breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Status dos Portões de Acesso</h3>
              <p className="text-xs text-slate-400">Fluxo de público por hora em {activeEvent.name}</p>
            </div>
            <StatusBadge variant="emerald" dot>
              Operação Estável
            </StatusBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Portão 01 — Pista</span>
                <StatusBadge variant="emerald" size="sm">Normal</StatusBadge>
              </div>
              <div className="text-xl font-bold text-slate-900">4.210 check-ins</div>
              <p className="text-[11px] text-slate-500">8 leitores ativos • 0.7s/leitura</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Portão 02 — Premium</span>
                <StatusBadge variant="amber" size="sm">Fila Leve</StatusBadge>
              </div>
              <div className="text-xl font-bold text-slate-900">2.140 check-ins</div>
              <p className="text-[11px] text-slate-500">6 leitores ativos • 1.1s/leitura</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Portão VIP & Imprensa</span>
                <StatusBadge variant="emerald" size="sm">Fluido</StatusBadge>
              </div>
              <div className="text-xl font-bold text-slate-900">890 check-ins</div>
              <p className="text-[11px] text-slate-500">4 leitores ativos • 0.5s/leitura</p>
            </div>
          </div>
        </div>

        {/* Quick Contacts / Escalation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Escalonamento & Plantão</h3>
            <p className="text-xs text-slate-400">Responsáveis técnicos no local</p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Marcos Vinícius</div>
                <div className="text-[10px] text-slate-500">Líder TI / Conectividade</div>
              </div>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                Ramal #401
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Juliana Castilho</div>
                <div className="text-[10px] text-slate-500">Coordenadora Bilheteria PDV</div>
              </div>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                Ramal #402
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Centro de Operações Disk</div>
                <div className="text-[10px] text-slate-500">NOC Central 24/7</div>
              </div>
              <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                (41) 3315-0900
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Fila de Ocorrências e Chamados Técnicos</h3>
            <p className="text-xs text-slate-400">Priorização por SLA e criticidade operacional</p>
          </div>
          <Link
            to="/suporte-eventos/incidentes"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Ver todos os incidentes →
          </Link>
        </div>

        <DataTable
          columns={incidentColumns}
          data={mockIncidents}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  )
}
