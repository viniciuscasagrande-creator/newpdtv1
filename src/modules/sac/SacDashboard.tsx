import React, { useState } from 'react'
import {
  MessageSquareText,
  Search,
  User,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Mail,
  Send,
  HelpCircle,
  Smile,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import { Link } from 'react-router-dom'

interface TicketItem {
  id: string
  protocol: string
  customerName: string
  customerCpf: string
  channel: 'whatsapp' | 'email' | 'chat'
  subject: string
  orderNumber: string
  eventName: string
  status: 'aberto' | 'em_atendimento' | 'resolvido'
  waitingTime: string
  agent: string
}

const mockTickets: TicketItem[] = [
  {
    id: 't-1',
    protocol: 'SAC-2026-9011',
    customerName: 'Renata Albuquerque Silva',
    customerCpf: '091.244.512-88',
    channel: 'whatsapp',
    subject: 'Não recebi o PDF com QR Code do meu ingresso no e-mail',
    orderNumber: '#PED-983650',
    eventName: 'Festival Rock 2026',
    status: 'em_atendimento',
    waitingTime: '3 min',
    agent: 'Rafael Nogueira',
  },
  {
    id: 't-2',
    protocol: 'SAC-2026-9012',
    customerName: 'Felipe Augusto Diniz',
    customerCpf: '142.339.771-00',
    channel: 'chat',
    subject: 'Dúvida sobre documento exigido para comprovação de Meia-Entrada',
    orderNumber: '#PED-983699',
    eventName: 'Festival de Verão Curitiba',
    status: 'aberto',
    waitingTime: '7 min',
    agent: 'Fila Geral',
  },
  {
    id: 't-3',
    protocol: 'SAC-2026-9008',
    customerName: 'Carolina Meireles',
    customerCpf: '018.992.341-21',
    channel: 'email',
    subject: 'Solicitação de troca de titularidade do ingresso',
    orderNumber: '#PED-982104',
    eventName: 'Turnê Acústica MPB',
    status: 'resolvido',
    waitingTime: '12 min',
    agent: 'Ana Paula Reis',
  },
]

export function SacDashboard() {
  const [universalSearch, setUniversalSearch] = useState('')
  const [searchedCustomer, setSearchedCustomer] = useState<{
    name: string
    cpf: string
    email: string
    phone: string
    ordersCount: number
    totalSpent: number
    lastEvent: string
  } | null>(null)

  const handleUniversalSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!universalSearch.trim()) return

    // Simulate dossier return
    setSearchedCustomer({
      name: 'Renata Albuquerque Silva',
      cpf: '091.244.512-88',
      email: 'renata.albuquerque@gmail.com',
      phone: '(41) 99882-1420',
      ordersCount: 4,
      totalSpent: 1480.0,
      lastEvent: 'Festival Rock 2026 (#PED-983650)',
    })
  }

  const ticketColumns: Column<TicketItem>[] = [
    {
      key: 'protocol',
      header: 'Protocolo',
      width: '140px',
      render: (item) => (
        <span className="font-mono font-bold text-slate-800">{item.protocol}</span>
      ),
    },
    {
      key: 'customerName',
      header: 'Cliente / Canal',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-md ${
              item.channel === 'whatsapp'
                ? 'bg-emerald-50 text-emerald-600'
                : item.channel === 'chat'
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {item.channel === 'whatsapp' && <MessageCircle className="h-3.5 w-3.5" />}
            {item.channel === 'chat' && <MessageSquareText className="h-3.5 w-3.5" />}
            {item.channel === 'email' && <Mail className="h-3.5 w-3.5" />}
          </div>
          <div>
            <div className="font-semibold text-slate-900">{item.customerName}</div>
            <div className="text-[10px] text-slate-400 font-mono">{item.customerCpf}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      header: 'Assunto / Pedido',
      render: (item) => (
        <div>
          <div className="text-slate-800 font-medium line-clamp-1">{item.subject}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {item.orderNumber} • {item.eventName}
          </div>
        </div>
      ),
    },
    {
      key: 'agent',
      header: 'Atendente',
      render: (item) => <span className="text-slate-700">{item.agent}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'resolvido' ? 'emerald' : item.status === 'em_atendimento' ? 'blue' : 'amber'}
          dot
          size="sm"
        >
          {item.status === 'resolvido' ? 'Resolvido' : item.status === 'em_atendimento' ? 'Em Atendimento' : 'Na Fila'}
        </StatusBadge>
      ),
    },
    {
      key: 'waitingTime',
      header: 'Espera',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-[11px] text-slate-500">{item.waitingTime}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Atendimento SAC ao Comprador
            </h1>
            <StatusBadge variant="blue" dot>
              Canais Omnichannel Ativos
            </StatusBadge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central de atendimento integrada com WhatsApp Oficial, Chat, E-mail e Busca Universal de Compradores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/sac/inbox"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <MessageSquareText className="h-4 w-4" /> Caixa de Entrada Unificada
          </Link>
          <Link
            to="/sac/respostas-rapidas"
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Respostas Rápidas
          </Link>
        </div>
      </div>

      {/* Universal Search Tool requested by user: CPF, nome, telefone, email, pedido, ingresso */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3">
          <div>
            <h3 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <Search className="h-4 w-4 text-blue-600" /> Busca Universal de Atendimento SAC
            </h3>
            <p className="text-xs text-blue-700">
              Consulte instantaneamente por: <strong>CPF • Nome • Telefone • E-mail • Nº do Pedido • Código do Ingresso</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleUniversalSearch} className="flex gap-2.5 mt-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Digite o CPF (ex: 091.244...), pedido (#PED-983650) ou nome do cliente..."
              value={universalSearch}
              onChange={(e) => setUniversalSearch(e.target.value)}
              className="w-full rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" /> Consultar Ficha
          </button>
        </form>

        {/* Client Dossier Card if searched */}
        {searchedCustomer && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4 shadow-xs animate-in fade-in-0 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  RA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{searchedCustomer.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    CPF: {searchedCustomer.cpf} • {searchedCustomer.email} • {searchedCustomer.phone}
                  </p>
                </div>
              </div>
              <StatusBadge variant="emerald" size="sm">Comprador VIP / Frequente</StatusBadge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-[10.5px] text-slate-400">Total de Pedidos Realizados</span>
                <div className="font-bold text-slate-800">{searchedCustomer.ordersCount} compras</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-[10.5px] text-slate-400">Valor Total Investido</span>
                <div className="font-bold text-emerald-700">{formatCurrency(searchedCustomer.totalSpent)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50">
                <span className="text-[10.5px] text-slate-400">Último Ingresso Adquirido</span>
                <div className="font-bold text-slate-800 truncate">{searchedCustomer.lastEvent}</div>
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2 text-xs">
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium text-slate-700">
                Reenviar PDF por E-mail
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                Enviar Ingresso via WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SAC KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fila de Espera Atual"
          value="4 chamados"
          trend={{ value: 'TME Médio 2.4 min', isPositive: true }}
          icon={Clock}
          iconColor="blue"
        />
        <StatCard
          title="Índice CSAT Satisfação"
          value="96.4%"
          trend={{ value: 'Meta > 90%', isPositive: true }}
          icon={Smile}
          iconColor="emerald"
        />
        <StatCard
          title="Atendimentos Hoje"
          value="142 finalizados"
          subtext="88 via WhatsApp, 34 Chat, 20 E-mail"
          icon={CheckCircle2}
          iconColor="indigo"
        />
        <StatCard
          title="SLA de 1ª Resposta"
          value="98.7%"
          trend={{ value: '< 5 min', isPositive: true }}
          icon={AlertCircle}
          iconColor="amber"
        />
      </div>

      {/* Tickets Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tickets e Conversas em Aberto</h3>
            <p className="text-xs text-slate-400">Filas organizadas por prioridade e canal</p>
          </div>
          <Link
            to="/sac/tickets"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver todos os tickets →
          </Link>
        </div>

        <DataTable
          columns={ticketColumns}
          data={mockTickets}
          keyExtractor={(item) => item.id}
        />
      </div>
    </div>
  )
}
