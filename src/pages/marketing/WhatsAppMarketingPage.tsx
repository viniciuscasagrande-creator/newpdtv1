import React, { useState, useMemo } from 'react'
import {
  MessageCircle, Send, CheckCircle2, Clock, Eye, MousePointerClick,
  TrendingUp, Users, Plus, Filter, Search, Copy, Check, Play, Pause,
  Sparkles, RefreshCw, Smartphone, ShieldCheck, ChevronRight, X,
  ArrowUpRight, AlertCircle, BarChart3, Settings2, FileText, CheckCircle
} from 'lucide-react'
import type { EventItem } from '../../data/events'

interface Props {
  producerId: number | null
  producerName: string
  events: EventItem[]
  selectedEventId?: number | 'all'
  notify: (msg: string) => void
}

interface WhatsAppCampaign {
  id: number
  name: string
  eventId: number
  eventTitle: string
  templateName: string
  audienceName: string
  audienceSize: number
  status: 'ativa' | 'concluida' | 'agendada' | 'pausada'
  sent: number
  delivered: number
  read: number
  clicks: number
  conversions: number
  revenueCents: number
  costCents: number
  scheduledAt?: string
  completedAt?: string
}

interface WhatsAppTemplate {
  id: string
  name: string
  category: 'marketing' | 'utility' | 'authentication'
  categoryLabel: string
  status: 'approved' | 'in_review' | 'rejected'
  headerType: 'image' | 'text' | 'none'
  headerText?: string
  bodyText: string
  footerText?: string
  buttons: Array<{ type: 'quick_reply' | 'url' | 'phone'; text: string; url?: string }>
  variables: string[]
}

const mockTemplates: WhatsAppTemplate[] = [
  {
    id: 'tpl_lancamento_lote',
    name: 'Lançamento de Novo Lote com Desconto VIP',
    category: 'marketing',
    categoryLabel: 'Lançamento de Lote',
    status: 'approved',
    headerType: 'image',
    headerText: '🔥 INGRESSOS LIBERADOS!',
    bodyText: 'Olá, *{{1}}*! 🎟️\n\nO *{{2}}* acabou de abrir as vendas do *{{3}}* com valor promocional exclusivo para quem está na lista VIP!\n\n⚡ *Condição especial:* Parcelamento em até 6x sem juros por tempo limitado.\n\nGaranta já o seu ingresso antes que o lote vire!',
    footerText: 'DiskIngressos • Responda PARAR para sair',
    buttons: [
      { type: 'url', text: '👉 Comprar Ingresso VIP', url: 'https://diskingressos.com.br/evento/{{4}}' },
      { type: 'quick_reply', text: 'Tirar Dúvidas' }
    ],
    variables: ['Nome do Cliente', 'Nome do Evento', 'Nome do Lote', 'ID do Evento']
  },
  {
    id: 'tpl_carrinho_abandonado',
    name: 'Recuperação de Carrinho Abandonado (Cupom 10%)',
    category: 'marketing',
    categoryLabel: 'Carrinho Abandonado',
    status: 'approved',
    headerType: 'image',
    headerText: '🛒 SEUS INGRESSOS ESTÃO RESERVADOS',
    bodyText: 'Oi *{{1}}*, vimos que você não concluiu a compra dos seus ingressos para o *{{2}}*.\n\nLiberamos um cupom exclusivo de *10% OFF* válido pelos próximos 30 minutos: 🎟️ *{{3}}*.\n\nClique no botão abaixo para concluir seu pedido:',
    footerText: 'DiskIngressos • Suporte Oficial',
    buttons: [
      { type: 'url', text: '⚡ Concluir Compra com 10% OFF', url: 'https://diskingressos.com.br/checkout/recuperar?cupom={{3}}' }
    ],
    variables: ['Nome do Cliente', 'Nome do Evento', 'Código do Cupom']
  },
  {
    id: 'tpl_virada_lote',
    name: 'Alerta de Virada de Lote 24h',
    category: 'marketing',
    categoryLabel: 'Virada de Lote',
    status: 'approved',
    headerType: 'text',
    headerText: '⚠️ O LOTE VAI VIRAR HOJE!',
    bodyText: 'Atenção, *{{1}}*!\n\nRestam menos de 24 horas para a virada do *{{2}}* para o *{{3}}*.\n\nAproveite o valor atual e economize até *R$ {{4}}* no seu ingresso!',
    footerText: 'DiskIngressos • Não perca a oportunidade',
    buttons: [
      { type: 'url', text: '🎟️ Garantir Lote Atual', url: 'https://diskingressos.com.br/evento/{{5}}' }
    ],
    variables: ['Nome', 'Lote Atual', 'Próximo Lote', 'Economia R$', 'Link']
  },
  {
    id: 'tpl_confirmacao_ingresso',
    name: 'Confirmação de Compra & Acesso ao Ingresso',
    category: 'utility',
    categoryLabel: 'Confirmação & Ingressos',
    status: 'approved',
    headerType: 'text',
    headerText: '✅ PEDIDO CONFIRMADO!',
    bodyText: 'Parabéns, *{{1}}*! Seu pedido *#{{2}}* para o *{{3}}* foi confirmado com sucesso!\n\n📍 *Local:* {{4}}\n📅 *Data:* {{5}}\n\nSeus ingressos digitais com QR Code já estão disponíveis:',
    footerText: 'DiskIngressos • Apresente na entrada do evento',
    buttons: [
      { type: 'url', text: '📲 Ver Meus Ingressos no App', url: 'https://diskingressos.com.br/meus-pedidos/{{2}}' }
    ],
    variables: ['Nome', 'Número do Pedido', 'Nome do Evento', 'Local', 'Data']
  },
  {
    id: 'tpl_lembrete_evento',
    name: 'Guia do Evento & Informações de Acesso (24h antes)',
    category: 'utility',
    categoryLabel: 'Alerta Pré-Evento',
    status: 'approved',
    headerType: 'image',
    headerText: '🎸 É AMANHÃ! TUDO PRONTO?',
    bodyText: 'Oi *{{1}}*, o *{{2}}* acontece amanhã!\n\n🕒 *Abertura dos Portões:* {{3}}\n🚗 *Estacionamento e Acesso:* Portão {{4}}\n\nTenha seu documento e o QR Code em mãos para entrada rápida!',
    footerText: 'DiskIngressos • Tenha um excelente evento!',
    buttons: [
      { type: 'url', text: '🗺️ Ver Mapa & Localização', url: 'https://diskingressos.com.br/guia/{{5}}' }
    ],
    variables: ['Nome', 'Evento', 'Horário', 'Portão', 'Link do Guia']
  }
]

export default function WhatsAppMarketingPage({ producerId, producerName, events, selectedEventId: initialSelectedEventId, notify }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>(initialSelectedEventId || 'all')
  const [period, setPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('30d')
  const [activeTab, setActiveTab] = useState<'campanhas' | 'templates' | 'automacoes' | 'historico' | 'audiencias'>('campanhas')
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(mockTemplates[0])
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('todos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Form State for new campaign
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignEventId, setNewCampaignEventId] = useState<number>(events[0]?.id || 1)
  const [newCampaignTemplateId, setNewCampaignTemplateId] = useState(mockTemplates[0].id)
  const [newCampaignAudience, setNewCampaignAudience] = useState('compradores_anteriores')
  const [newCampaignSchedule, setNewCampaignSchedule] = useState<'imediato' | 'agendado'>('imediato')
  const [newCampaignDate, setNewCampaignDate] = useState('')

  // Realistic campaigns mapped to real events
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([
    {
      id: 1,
      name: 'WHATSAPP • Lançamento Lote VIP Sunset',
      eventId: events[0]?.id || 1,
      eventTitle: events[0]?.title || 'Sunset Eletrônico',
      templateName: 'Lançamento de Novo Lote com Desconto VIP',
      audienceName: 'Compradores de Música Eletrônica (2025/2026)',
      audienceSize: 4200,
      status: 'ativa',
      sent: 4180,
      delivered: 4150,
      read: 4030,
      clicks: 1280,
      conversions: 310,
      revenueCents: 4650000,
      costCents: 58520,
      completedAt: 'Hoje às 10:30'
    },
    {
      id: 2,
      name: 'WHATSAPP • Recuperação Carrinho Rock Experience',
      eventId: events[1]?.id || 2,
      eventTitle: events[1]?.title || 'Rock Experience Curitiba',
      templateName: 'Recuperação de Carrinho Abandonado (Cupom 10%)',
      audienceName: 'Checkouts Abandonados nas últimas 48h',
      audienceSize: 850,
      status: 'ativa',
      sent: 840,
      delivered: 835,
      read: 810,
      clicks: 340,
      conversions: 115,
      revenueCents: 2185000,
      costCents: 11760,
      completedAt: 'Ontem às 18:00'
    },
    {
      id: 3,
      name: 'WHATSAPP • Virada de Lote 24h Festival Verão',
      eventId: events[2]?.id || 3,
      eventTitle: events[2]?.title || 'Festival Disk Verão 2027',
      templateName: 'Alerta de Virada de Lote 24h',
      audienceName: 'Visitantes e Interessados no Festival',
      audienceSize: 6200,
      status: 'concluida',
      sent: 6180,
      delivered: 6120,
      read: 5940,
      clicks: 1890,
      conversions: 460,
      revenueCents: 6440000,
      costCents: 86520,
      completedAt: '28/08/2026'
    },
    {
      id: 4,
      name: 'WHATSAPP • Guia do Show Iron Maiden Symphonic',
      eventId: events[3]?.id || 4,
      eventTitle: events[3]?.title || 'IRON MAIDEN SYMPHONIC',
      templateName: 'Guia do Evento & Informações de Acesso (24h antes)',
      audienceName: 'Compradores Confirmados com Ingressos Ativos',
      audienceSize: 3400,
      status: 'concluida',
      sent: 3390,
      delivered: 3380,
      read: 3310,
      clicks: 1420,
      conversions: 85,
      revenueCents: 1275000,
      costCents: 47460,
      completedAt: '25/08/2026'
    },
    {
      id: 5,
      name: 'WHATSAPP • Pré-Venda Exclusiva Sem Parar',
      eventId: events[4]?.id || 5,
      eventTitle: events[4]?.title || 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',
      templateName: 'Lançamento de Novo Lote com Desconto VIP',
      audienceName: 'Leads Cadastrados na Landing Page',
      audienceSize: 2800,
      status: 'agendada',
      sent: 0,
      delivered: 0,
      read: 0,
      clicks: 0,
      conversions: 0,
      revenueCents: 0,
      costCents: 39200,
      scheduledAt: '05/09/2026 às 12:00'
    }
  ])

  // Filtered campaigns based on event selection and status
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      if (selectedEventId !== 'all' && c.eventId !== selectedEventId) return false
      if (statusFilter !== 'todas' && c.status !== statusFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          c.name.toLowerCase().includes(query) ||
          c.eventTitle.toLowerCase().includes(query) ||
          c.templateName.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [campaigns, selectedEventId, statusFilter, searchQuery])

  // Aggregated KPIs
  const kpis = useMemo(() => {
    const active = filteredCampaigns.filter(c => c.status !== 'agendada')
    const totalSent = active.reduce((acc, c) => acc + c.sent, 0)
    const totalDelivered = active.reduce((acc, c) => acc + c.delivered, 0)
    const totalRead = active.reduce((acc, c) => acc + c.read, 0)
    const totalClicks = active.reduce((acc, c) => acc + c.clicks, 0)
    const totalConversions = active.reduce((acc, c) => acc + c.conversions, 0)
    const totalRevenue = active.reduce((acc, c) => acc + c.revenueCents, 0)
    const totalCost = active.reduce((acc, c) => acc + c.costCents, 0)

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 99.2
    const readRate = totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 96.8
    const ctr = totalDelivered > 0 ? (totalClicks / totalDelivered) * 100 : 27.4
    const roas = totalCost > 0 ? totalRevenue / totalCost : 58.2

    return {
      totalSent,
      totalDelivered,
      deliveryRate,
      totalRead,
      readRate,
      totalClicks,
      ctr,
      totalConversions,
      totalRevenue,
      totalCost,
      roas
    }
  }, [filteredCampaigns])

  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    notify('Link copiado para a área de transferência!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggleStatus = (id: number) => {
    setCampaigns(prev =>
      prev.map(c => {
        if (c.id === id) {
          const next = c.status === 'ativa' ? 'pausada' : 'ativa'
          notify(`Campanha "${c.name}" foi ${next === 'ativa' ? 'ativada' : 'pausada'}.`)
          return { ...c, status: next }
        }
        return c
      })
    )
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampaignName.trim()) {
      notify('Por favor, informe o nome da campanha.')
      return
    }

    const matchedEvent = events.find(ev => ev.id === newCampaignEventId) || events[0]
    const matchedTemplate = mockTemplates.find(t => t.id === newCampaignTemplateId) || mockTemplates[0]

    const newCamp: WhatsAppCampaign = {
      id: Date.now(),
      name: newCampaignName,
      eventId: matchedEvent?.id || 1,
      eventTitle: matchedEvent?.title || 'Evento',
      templateName: matchedTemplate.name,
      audienceName: 'Compradores Anteriores + Base VIP',
      audienceSize: 3200,
      status: newCampaignSchedule === 'imediato' ? 'ativa' : 'agendada',
      sent: newCampaignSchedule === 'imediato' ? 3180 : 0,
      delivered: newCampaignSchedule === 'imediato' ? 3150 : 0,
      read: newCampaignSchedule === 'imediato' ? 3020 : 0,
      clicks: newCampaignSchedule === 'imediato' ? 840 : 0,
      conversions: newCampaignSchedule === 'imediato' ? 190 : 0,
      revenueCents: newCampaignSchedule === 'imediato' ? 2850000 : 0,
      costCents: 44800,
      scheduledAt: newCampaignSchedule === 'agendado' ? newCampaignDate || 'Amanhã às 10:00' : undefined,
      completedAt: newCampaignSchedule === 'imediato' ? 'Agora há pouco' : undefined
    }

    setCampaigns([newCamp, ...campaigns])
    setShowCreateModal(false)
    setNewCampaignName('')
    notify(`Campanha de WhatsApp "${newCamp.name}" criada com sucesso!`)
  }

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (templateCategoryFilter === 'todos') return mockTemplates
    return mockTemplates.filter(t => t.category === templateCategoryFilter)
  }, [templateCategoryFilter])

  return (
    <div className="space-y-6">
      {/* 1. Header & Context Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">WhatsApp Marketing & CRM</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Meta Cloud API Oficial
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Disparos em massa, templates oficiais, recuperação de checkout e automações com alta taxa de conversão.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Event Filter */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-transparent border-0 font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="all">Todos os eventos ({events.length})</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-2.5 py-1 rounded-md transition-all ${period === '7d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              7 dias
            </button>
            <button
              onClick={() => setPeriod('14d')}
              className={`px-2.5 py-1 rounded-md transition-all ${period === '14d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              14 dias
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-2.5 py-1 rounded-md transition-all ${period === '30d' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${period === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Tudo
            </button>
          </div>

          {/* CTA Create */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Campanha WhatsApp
          </button>
        </div>
      </div>

      {/* 2. Top 4 Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Disparos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disparos & Entrega</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.totalSent.toLocaleString('pt-BR')}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {kpis.deliveryRate.toFixed(1)}% entregues
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {kpis.totalDelivered.toLocaleString('pt-BR')} mensagens entregues com sucesso
          </p>
        </div>

        {/* KPI 2: Aberturas e Leitura */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leituras & Respostas</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.readRate.toFixed(1)}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {kpis.totalRead.toLocaleString('pt-BR')} lidas
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tempo médio de abertura: <strong>3.8 min</strong> após o envio
          </p>
        </div>

        {/* KPI 3: Cliques e CTR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliques & Conversões</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <MousePointerClick className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.totalClicks.toLocaleString('pt-BR')}</span>
            <span className="text-xs font-semibold text-purple-600">CTR {kpis.ctr.toFixed(1)}%</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <strong>{kpis.totalConversions.toLocaleString('pt-BR')}</strong> ingressos vendidos via WhatsApp
          </p>
        </div>

        {/* KPI 4: Receita e ROAS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita Atribuída & ROAS</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{formatMoney(kpis.totalRevenue)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {kpis.roas.toFixed(1)}x ROAS
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Investimento em envios: {formatMoney(kpis.totalCost)} · Opt-out 0.18%
          </p>
        </div>
      </div>

      {/* 3. Operational Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('campanhas')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campanhas'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send className="w-4 h-4" /> Campanhas de Disparo ({filteredCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Templates Oficiais & Live Preview
          </button>
          <button
            onClick={() => setActiveTab('automacoes')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'automacoes'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Jornadas & Automações
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'historico'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" /> Histórico & Fila de Envios
          </button>
          <button
            onClick={() => setActiveTab('audiencias')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audiencias'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Audiências & LGPD
          </button>
        </nav>
      </div>

      {/* 4. Tab 1: Campanhas de Disparo */}
      {activeTab === 'campanhas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Status:</span>
              {['todas', 'ativa', 'concluida', 'agendada', 'pausada'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar campanha ou evento..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Campanha / Evento</th>
                    <th className="px-4 py-3">Template & Público</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-right">Disparos</th>
                    <th className="px-3 py-3 text-right">Leitura</th>
                    <th className="px-3 py-3 text-right">CTR / Vendas</th>
                    <th className="px-4 py-3 text-right">Receita</th>
                    <th className="px-3 py-3 text-right">ROAS</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400">
                        Nenhuma campanha de WhatsApp encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map(camp => {
                      const readPct = camp.delivered > 0 ? ((camp.read / camp.delivered) * 100).toFixed(0) : '0'
                      const ctrPct = camp.delivered > 0 ? ((camp.clicks / camp.delivered) * 100).toFixed(1) : '0.0'
                      const roasVal = camp.costCents > 0 ? (camp.revenueCents / camp.costCents).toFixed(1) : '0.0'

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">{camp.name}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                {camp.eventTitle}
                              </span>
                              {camp.completedAt && <span>· {camp.completedAt}</span>}
                              {camp.scheduledAt && <span className="text-amber-600 font-medium">· Agendado para {camp.scheduledAt}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs font-medium text-slate-700 truncate max-w-[220px]">
                              {camp.templateName}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {camp.audienceName} ({camp.audienceSize.toLocaleString('pt-BR')} contatos)
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                camp.status === 'ativa'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : camp.status === 'concluida'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : camp.status === 'agendada'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {camp.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <div className="font-bold text-slate-900">{camp.sent.toLocaleString('pt-BR')}</div>
                            <div className="text-xs text-slate-400">
                              {camp.delivered.toLocaleString('pt-BR')} entregues
                            </div>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <div className="font-semibold text-slate-900">{readPct}%</div>
                            <div className="text-xs text-slate-400">{camp.read.toLocaleString('pt-BR')} lidas</div>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <div className="font-semibold text-purple-600">{ctrPct}% CTR</div>
                            <div className="text-xs font-medium text-slate-500">{camp.conversions} vendas</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-bold text-emerald-600">{formatMoney(camp.revenueCents)}</div>
                            <div className="text-xs text-slate-400">Custo: {formatMoney(camp.costCents)}</div>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <span className="font-bold text-slate-900 px-2 py-0.5 rounded bg-slate-100">
                              {roasVal}x
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {camp.status === 'ativa' && (
                                <button
                                  onClick={() => handleToggleStatus(camp.id)}
                                  title="Pausar Campanha"
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all cursor-pointer"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              )}
                              {camp.status === 'pausada' && (
                                <button
                                  onClick={() => handleToggleStatus(camp.id)}
                                  title="Retomar Campanha"
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleCopy(`https://newpdtv1.vercel.app/campanha/${camp.id}`, camp.id)}
                                title="Copiar Link com UTM"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                              >
                                {copiedId === camp.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Templates Oficiais & Live Preview Interativo */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates List (Left Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200">
              {['todos', 'marketing', 'utility'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    templateCategoryFilter === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'todos' ? 'Todos os Templates' : cat === 'marketing' ? 'Marketing & Promoção' : 'Utilidade & Ingressos'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredTemplates.map(tpl => {
                const isSelected = selectedTemplate.id === tpl.id
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{tpl.name}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprovado pela Meta
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Categoria: <span className="font-semibold text-slate-700">{tpl.categoryLabel}</span> · Variáveis: {tpl.variables.join(', ')}
                        </p>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedTemplate(tpl)
                          setShowCreateModal(true)
                        }}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-all shrink-0 cursor-pointer"
                      >
                        Usar em Campanha
                      </button>
                    </div>

                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 font-mono line-clamp-2 border border-slate-100">
                      {tpl.bodyText}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Smartphone Live Preview (Right Column) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-slate-900 p-4 rounded-[40px] shadow-2xl border-4 border-slate-800">
              {/* Smartphone Screen */}
              <div className="bg-[#ECE5DD] rounded-[30px] overflow-hidden flex flex-col min-h-[580px] border border-slate-300">
                {/* WhatsApp Chat Header */}
                <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-500">
                      DI
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs">DiskIngressos Oficial</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 fill-emerald-400" />
                      </div>
                      <span className="text-[10px] text-emerald-200">Conta Comercial Verificada</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Chat Body */}
                <div className="p-3 flex-1 flex flex-col justify-end space-y-2 overflow-y-auto">
                  {/* Date badge */}
                  <div className="text-center">
                    <span className="bg-[#E1F3FB] text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-xs">
                      HOJE
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-white rounded-lg p-3 shadow-md max-w-[92%] self-start relative border border-slate-200/60">
                    {selectedTemplate.headerType === 'image' && (
                      <div className="rounded-md bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3 mb-2 text-center font-black text-xs shadow-inner">
                        {selectedTemplate.headerText || '🎉 EVENTO OFICIAL'}
                      </div>
                    )}
                    {selectedTemplate.headerType === 'text' && (
                      <div className="font-bold text-xs text-slate-900 mb-1">
                        {selectedTemplate.headerText}
                      </div>
                    )}

                    <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {selectedTemplate.bodyText
                        .replace('{{1}}', 'Vinicius')
                        .replace('{{2}}', events[0]?.title || 'Sunset Eletrônico')
                        .replace('{{3}}', 'Lote 2 VIP')
                        .replace('{{4}}', 'DISK10')
                        .replace('{{5}}', '1')}
                    </div>

                    {selectedTemplate.footerText && (
                      <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-1">
                        {selectedTemplate.footerText}
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 text-right mt-1 flex items-center justify-end gap-1">
                      <span>10:42</span>
                      <span className="text-blue-500 font-bold">✓✓</span>
                    </div>
                  </div>

                  {/* WhatsApp Interactive Buttons */}
                  {selectedTemplate.buttons.map((btn, idx) => (
                    <div
                      key={idx}
                      className="bg-white hover:bg-slate-50 text-emerald-700 text-xs font-bold py-2 px-3 rounded-lg shadow-sm text-center border border-slate-200/80 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      {btn.text}
                    </div>
                  ))}
                </div>

                {/* WhatsApp Chat Bottom Input */}
                <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 border-t border-slate-300">
                  <div className="flex-1 bg-white rounded-full px-3 py-1 text-[11px] text-slate-400">
                    Mensagem
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#075E54] flex items-center justify-center text-white">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Visualização fiel da experiência do cliente no WhatsApp Android/iOS
            </p>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Jornadas & Automações */}
      {activeTab === 'automacoes' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Gatilhos de Disparo Automático (Jornadas de CRM)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automações ativas que disparam mensagens no momento exato do comportamento de compra do cliente.
              </p>
            </div>
            <button
              onClick={() => notify('Nova jornada criada.')}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Jornada
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Flow 1 */}
            <div className="bg-white p-5 rounded-xl border border-emerald-200 ring-1 ring-emerald-500/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ATIVO · ALTA CONVERSÃO
                  </span>
                  <span className="text-xs font-bold text-emerald-600">32.4% conv.</span>
                </div>
                <h4 className="font-bold text-slate-900 mt-2">Recuperação de Carrinho Abandonado</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Dispara 15 minutos após o abandono com cupom dinâmico e link direto de pagamento.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">1.840 execuções · <strong>R$ 38.400</strong></span>
                <button
                  onClick={() => notify('Configurações da jornada salvas.')}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Configurar
                </button>
              </div>
            </div>

            {/* Flow 2 */}
            <div className="bg-white p-5 rounded-xl border border-emerald-200 ring-1 ring-emerald-500/20 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ATIVO · RECUPERAÇÃO PIX
                  </span>
                  <span className="text-xs font-bold text-emerald-600">41.8% conv.</span>
                </div>
                <h4 className="font-bold text-slate-900 mt-2">Lembrete de Pix Pendente</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Envia código copia-e-cola 2 horas antes da expiração da reserva do ingresso.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">920 execuções · <strong>R$ 24.150</strong></span>
                <button
                  onClick={() => notify('Configurações da jornada salvas.')}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Configurar
                </button>
              </div>
            </div>

            {/* Flow 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    ATIVO · VIRADA DE LOTE
                  </span>
                  <span className="text-xs font-bold text-blue-600">28.9% conv.</span>
                </div>
                <h4 className="font-bold text-slate-900 mt-2">Alerta de Virada de Lote</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Notifica compradores da base 24h antes do aumento de preço do lote atual.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">3.400 execuções · <strong>R$ 52.800</strong></span>
                <button
                  onClick={() => notify('Configurações da jornada salvas.')}
                  className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Histórico & Fila */}
      {activeTab === 'historico' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Fila em Tempo Real & Logs de Disparo</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 0 mensagens em fila · 100% processado
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { phone: '(41) 998**-4412', name: 'Lucas Ferreira', event: events[0]?.title || 'Sunset Eletrônico', tpl: 'Lançamento Lote VIP', time: 'Há 2 min', status: 'Lido' },
              { phone: '(41) 991**-8831', name: 'Mariana Costa', event: events[0]?.title || 'Sunset Eletrônico', tpl: 'Lançamento Lote VIP', time: 'Há 5 min', status: 'Entregue' },
              { phone: '(47) 988**-1290', name: 'Rafael Souza', event: events[1]?.title || 'Rock Experience', tpl: 'Carrinho Abandonado', time: 'Há 12 min', status: 'Convertido' },
              { phone: '(41) 997**-3341', name: 'Camila Rocha', event: events[2]?.title || 'Festival Verão', tpl: 'Virada de Lote', time: 'Há 18 min', status: 'Lido' },
              { phone: '(11) 984**-7719', name: 'Felipe Dias', event: events[3]?.title || 'Iron Maiden Symphonic', tpl: 'Guia do Show', time: 'Há 25 min', status: 'Entregue' }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.name} · <span className="font-normal text-slate-500">{item.phone}</span></div>
                    <div className="text-slate-400 mt-0.5">{item.event} · {item.tpl}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.status === 'Convertido' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Lido' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                  <div className="text-slate-400 mt-0.5">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Tab 5: Audiências & LGPD */}
      {activeTab === 'audiencias' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Listas Segmentadas de WhatsApp</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Compradores VIP (Ticket > R$ 300)', count: '1.420 contatos', tag: 'Alta Conversão' },
                { name: 'Fãs de Música Eletrônica', count: '4.850 contatos', tag: 'Gênero Musical' },
                { name: 'Checkouts Abandonados (Últimos 30d)', count: '940 contatos', tag: 'Recuperação' },
                { name: 'Compradores 2025 / 2026', count: '12.600 contatos', tag: 'Base Geral' }
              ].map((aud, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">{aud.name}</div>
                    <div className="text-slate-400">{aud.count}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">{aud.tag}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Conformidade & LGPD
            </h3>
            <p className="text-xs text-slate-500">
              O módulo de WhatsApp da DiskIngressos opera em total conformidade com a LGPD e políticas oficiais da Meta.
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Opt-in explícito no checkout com consentimento registrado por pedido</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mecanismo de Opt-out automático (resposta PARAR bloqueia novos disparos)</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Templates homologados e auditados pela Meta Cloud API</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Campanha de WhatsApp */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">Criar Campanha de WhatsApp</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: WHATSAPP • Lançamento Lote 2 VIP"
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Evento Vinculado</label>
                  <select
                    value={newCampaignEventId}
                    onChange={e => setNewCampaignEventId(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white cursor-pointer"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Template Aprovado</label>
                  <select
                    value={newCampaignTemplateId}
                    onChange={e => setNewCampaignTemplateId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white cursor-pointer"
                  >
                    {mockTemplates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Público / Segmentação</label>
                <select
                  value={newCampaignAudience}
                  onChange={e => setNewCampaignAudience(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white cursor-pointer"
                >
                  <option value="compradores_anteriores">Compradores Anteriores do Evento (Alta Conversão)</option>
                  <option value="carrinho_abandonado">Checkouts Abandonados nas últimas 48h</option>
                  <option value="leads_vip">Lista VIP & Leads de Pré-Venda</option>
                  <option value="base_geral">Toda a Base de Compradores do Produtor</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Iniciar Disparo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
