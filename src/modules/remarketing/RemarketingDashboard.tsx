import React, { useState } from 'react'
import {
  Repeat,
  ShoppingCart,
  MessageCircle,
  Mail,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Send,
  Sparkles,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatCurrency, formatDateTime } from '../../utils/formatters'

interface AbandonedCartItem {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  eventName: string
  ticketInfo: string
  cartValue: number
  abandonedAt: string
  recoveryChannel: 'whatsapp' | 'email' | 'ambos'
  recoveryStatus: 'disparado' | 'aguardando' | 'convertido'
}

const mockCarts: AbandonedCartItem[] = [
  {
    id: 'cart-1',
    customerName: 'Beatriz Vasconcelos',
    customerPhone: '(41) 99281-3321',
    customerEmail: 'beatriz.vasc@gmail.com',
    eventName: 'Festival Rock 2026',
    ticketInfo: '2x Pista Premium (2º Lote)',
    cartValue: 480.0,
    abandonedAt: '2026-09-18T13:10:00',
    recoveryChannel: 'whatsapp',
    recoveryStatus: 'disparado',
  },
  {
    id: 'cart-2',
    customerName: 'Rodrigo Santoro Paes',
    customerPhone: '(41) 98842-1099',
    customerEmail: 'rodrigo.spaes@outlook.com',
    eventName: 'Festival Rock 2026',
    ticketInfo: '1x Camarote Open Bar',
    cartValue: 350.0,
    abandonedAt: '2026-09-18T13:25:00',
    recoveryChannel: 'ambos',
    recoveryStatus: 'aguardando',
  },
  {
    id: 'cart-3',
    customerName: 'Patricia Linhares',
    customerPhone: '(41) 99112-8874',
    customerEmail: 'patricia.linhares@uol.com.br',
    eventName: 'Festival de Verão Curitiba',
    ticketInfo: '4x Pista Geral Meia',
    cartValue: 480.0,
    abandonedAt: '2026-09-18T12:50:00',
    recoveryChannel: 'whatsapp',
    recoveryStatus: 'convertido',
  },
  {
    id: 'cart-4',
    customerName: 'Gabriel Medeiros',
    customerPhone: '(41) 99760-4412',
    customerEmail: 'gmedeiros.dev@gmail.com',
    eventName: 'Teatro Musical Broadway Curitiba',
    ticketInfo: '2x Balcão Nobre',
    cartValue: 260.0,
    abandonedAt: '2026-09-18T11:40:00',
    recoveryChannel: 'email',
    recoveryStatus: 'convertido',
  },
]

export function RemarketingDashboard() {
  const { selectedEvent, events } = useGlobalContext()
  const { addAuditLog } = useCoreEventBus()
  const activeEvent = selectedEvent || events[0]
  const [carts, setCarts] = useState<AbandonedCartItem[]>(mockCarts)
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false)

  const handleTriggerRecovery = (id: string, customerName: string) => {
    setCarts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, recoveryStatus: 'disparado' } : c))
    )
    addAuditLog({
      operatorName: 'Automador Remarketing',
      operatorEmail: 'bot@diskingressos.com.br',
      role: 'Sistema / Automação',
      action: 'REMARKETING_DISPARO',
      module: 'remarketing',
      targetId: id,
      details: `Disparo imediato de cupom de 5% off no WhatsApp para ${customerName} (recuperação de checkout).`,
      ip: '127.0.0.1',
    })
    setDispatchedSuccess(true)
    setTimeout(() => setDispatchedSuccess(false), 4000)
  }

  const columns: Column<AbandonedCartItem>[] = [
    {
      key: 'customerName',
      header: 'Cliente & Contato',
      render: (item) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{item.customerName}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {item.customerPhone} • {item.customerEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'ticketInfo',
      header: 'Itens Abandonados',
      render: (item) => (
        <div>
          <div className="text-xs text-slate-800 font-medium">{item.ticketInfo}</div>
          <div className="text-[10px] text-slate-400">{item.eventName}</div>
        </div>
      ),
    },
    {
      key: 'cartValue',
      header: 'Valor do Carrinho',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          {formatCurrency(item.cartValue)}
        </span>
      ),
    },
    {
      key: 'recoveryChannel',
      header: 'Canal Régua',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-1">
          {item.recoveryChannel === 'whatsapp' || item.recoveryChannel === 'ambos' ? (
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
          ) : null}
          {item.recoveryChannel === 'email' || item.recoveryChannel === 'ambos' ? (
            <Mail className="h-3.5 w-3.5 text-blue-600" />
          ) : null}
          <span className="text-[11px] uppercase font-semibold text-slate-600">
            {item.recoveryChannel}
          </span>
        </div>
      ),
    },
    {
      key: 'recoveryStatus',
      header: 'Status de Recuperação',
      align: 'center',
      render: (item) => {
        if (item.recoveryStatus === 'convertido') {
          return <StatusBadge variant="emerald" dot>Recuperado (Pago)</StatusBadge>
        }
        if (item.recoveryStatus === 'disparado') {
          return <StatusBadge variant="blue">Mensagem Enviada</StatusBadge>
        }
        return <StatusBadge variant="amber">Aguardando Régua</StatusBadge>
      },
    },
    {
      key: 'actions',
      header: 'Ação',
      align: 'right',
      render: (item) => (
        item.recoveryStatus === 'aguardando' ? (
          <button
            onClick={() => handleTriggerRecovery(item.id, item.customerName)}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Send className="h-3 w-3" /> Disparar Agora
          </button>
        ) : (
          <span className="text-[10px] font-mono text-slate-400">Em andamento</span>
        )
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
              <Repeat className="h-3 w-3" /> Automação de Remarketing & Carrinhos
            </span>
            <span className="text-xs text-slate-400 font-mono">WhatsApp Official API • Webhooks</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Recuperação de Vendas Abandonadas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Régua inteligente em 15min, 2h e 24h via WhatsApp e E-mail com links de checkout direto sem necessidade de refazer a seleção de ingressos.
          </p>
        </div>
      </div>

      {dispatchedSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Mensagem de recuperação enviada com sucesso ao cliente!
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taxa de Recuperação"
          value="28.4%"
          trend={{ value: 'Referência de mercado: 15%', isPositive: true }}
          icon={Repeat}
          iconColor="emerald"
        />
        <StatCard
          title="Receita Recuperada no Mês"
          value={formatCurrency(182400)}
          subtext="Vendas salvas via WhatsApp & E-mail"
          icon={TrendingUp}
          iconColor="blue"
        />
        <StatCard
          title="Carrinhos Abandonados (24h)"
          value="142"
          subtext="Volume total em acompanhamento"
          icon={ShoppingCart}
          iconColor="amber"
        />
        <StatCard
          title="Taxa de Leitura WhatsApp"
          value="96.2%"
          trend={{ value: 'Templates aprovados Meta', isPositive: true }}
          icon={MessageCircle}
          iconColor="indigo"
        />
      </div>

      {/* Carts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Fluxo Ativo de Carrinhos em Recuperação
            </h3>
            <p className="text-xs text-slate-400">
              Checkouts iniciados e não concluídos nos últimos 60 minutos
            </p>
          </div>
          <StatusBadge variant="emerald" dot>Régua Ativa</StatusBadge>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={carts}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>
    </div>
  )
}
