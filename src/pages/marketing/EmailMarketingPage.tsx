import React, { useState, useMemo } from 'react'
import {
  Mail, Send, CheckCircle2, Clock, Eye, MousePointerClick,
  TrendingUp, Users, Plus, Filter, Search, Copy, Check, Play, Pause,
  Sparkles, RefreshCw, Smartphone, Monitor, ShieldCheck, ChevronRight, X,
  ArrowUpRight, AlertCircle, BarChart3, Settings2, FileText, CheckCircle,
  Split, Inbox, ExternalLink
} from 'lucide-react'
import type { EventItem } from '../../data/events'

interface Props {
  producerId: number | null
  producerName: string
  events: EventItem[]
  selectedEventId?: number | 'all'
  notify: (msg: string) => void
}

interface EmailCampaign {
  id: number
  name: string
  subject: string
  previewText: string
  eventId: number
  eventTitle: string
  templateName: string
  audienceName: string
  audienceSize: number
  status: 'ativa' | 'concluida' | 'agendada' | 'pausada'
  sent: number
  delivered: number
  opened: number
  clicks: number
  conversions: number
  revenueCents: number
  bounceCount: number
  unsubscribeCount: number
  scheduledAt?: string
  completedAt?: string
}

interface EmailTemplate {
  id: string
  name: string
  category: 'lancamento' | 'recuperacao' | 'virada' | 'newsletter' | 'pos_evento'
  categoryLabel: string
  subjectSuggestion: string
  previewSnippet: string
  contentTitle: string
  bodyHtmlPreview: string
  ctaText: string
  ctaUrl: string
}

const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'tpl_email_lancamento',
    name: 'Lançamento Oficial de Vendas (Lote Promocional)',
    category: 'lancamento',
    categoryLabel: 'Lançamento de Lote',
    subjectSuggestion: '🎟️ Abertura Oficial: Garanta seu ingresso para {{evento}} com desconto!',
    previewSnippet: 'Lote promocional exclusivo liberado para compra em até 6x...',
    contentTitle: 'AS VENDAS ESTÃO OFICIALMENTE ABERTAS!',
    bodyHtmlPreview: 'Olá, {{nome}}!\n\nO momento mais aguardado chegou: os ingressos para o {{evento}} já estão disponíveis com preço promocional exclusivo de primeiro lote.\n\n⚡ Vagas limitadas por setor. Não deixe para a última hora!\n\nData: {{data}} • Local: {{local}}',
    ctaText: 'COMPRAR INGRESSO AGORA',
    ctaUrl: 'https://diskingressos.com.br/evento/{{id}}'
  },
  {
    id: 'tpl_email_virada_24h',
    name: 'Alerta de Virada de Lote (Últimas 24 Horas)',
    category: 'virada',
    categoryLabel: 'Virada de Lote',
    subjectSuggestion: '⚠️ ÚLTIMAS 24H: O lote do {{evento}} vai virar hoje à meia-noite!',
    previewSnippet: 'Economize até R$ 80,00 garantindo seu ingresso no valor atual...',
    contentTitle: 'RESTAM POUCAS HORAS NO LOTE ATUAL!',
    bodyHtmlPreview: 'Atenção, {{nome}}!\n\nHoje é o último dia para garantir seu ingresso para o {{evento}} com o valor promocional do lote atual.\n\nÀs 23h59 os preços sofrerão reajuste em todos os setores.',
    ctaText: 'GARANTIR ANTES DA VIRADA',
    ctaUrl: 'https://diskingressos.com.br/evento/{{id}}'
  },
  {
    id: 'tpl_email_carrinho',
    name: 'Recuperação de Checkout com Cupom VIP 10%',
    category: 'recuperacao',
    categoryLabel: 'Carrinho Abandonado',
    subjectSuggestion: '🛒 {{nome}}, seus ingressos para {{evento}} ainda estão reservados (+ 10% OFF)',
    previewSnippet: 'Use o cupom DISK10 e conclua seu pedido com desconto especial...',
    contentTitle: 'SEUS INGRESSOS ESTÃO RESERVADOS!',
    bodyHtmlPreview: 'Oi {{nome}}, notamos que você não finalizou sua compra para o {{evento}}.\n\nPara te ajudar a não ficar de fora, liberamos um cupom especial de 10% de desconto:\n\n🎟️ Cupom: DISK10 (Válido por 2 horas)',
    ctaText: 'CONCLUIR MINHA COMPRA COM 10% OFF',
    ctaUrl: 'https://diskingressos.com.br/checkout/recuperar?cupom=DISK10'
  },
  {
    id: 'tpl_email_newsletter',
    name: 'Line-up Completo & Atrações Confirmadas',
    category: 'newsletter',
    categoryLabel: 'Newsletter de Atrações',
    subjectSuggestion: '🔥 LINE-UP CONFIRMADO: Confira todas as atrações do {{evento}}!',
    previewSnippet: 'Veja os horários dos shows, mapa do evento e novidades...',
    contentTitle: 'CONFIRA A PROGRAMAÇÃO COMPLETA!',
    bodyHtmlPreview: 'Prepare o coração! O line-up oficial do {{evento}} acaba de ser divulgado com grandes nomes da música nacional e internacional.\n\nConfira todos os artistas e horários das apresentações.',
    ctaText: 'VER PROGRAMAÇÃO & INGRESSOS',
    ctaUrl: 'https://diskingressos.com.br/evento/{{id}}'
  },
  {
    id: 'tpl_email_pos_evento',
    name: 'Agradecimento & Pesquisa de Satisfação Pós-Show',
    category: 'pos_evento',
    categoryLabel: 'Pós-Evento & Fidelidade',
    subjectSuggestion: '❤️ Obrigado por fazer história no {{evento}}! Conte-nos como foi',
    previewSnippet: 'Avalie sua experiência e ganhe 15% de desconto no próximo evento...',
    contentTitle: 'MUITO OBRIGADO POR ESTAR CONOSCO!',
    bodyHtmlPreview: 'Foi inesquecível! Agradecemos imensamente sua presença no {{evento}}.\n\nQueremos continuar melhorando cada detalhe. Responda nossa rápida pesquisa de satisfação de 1 minuto e receba um voucher para seu próximo evento.',
    ctaText: 'AVALIAR EXPERIÊNCIA & GANHAR VOUCHER',
    ctaUrl: 'https://diskingressos.com.br/pesquisa/{{id}}'
  }
]

export default function EmailMarketingPage({ producerId, producerName, events, selectedEventId: initialSelectedEventId, notify }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>(initialSelectedEventId || 'all')
  const [period, setPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('30d')
  const [activeTab, setActiveTab] = useState<'campanhas' | 'templates' | 'testes_ab' | 'historico' | 'segmentacao'>('campanhas')
  const [statusFilter, setStatusFilter] = useState<string>('todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(mockEmailTemplates[0])
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Form State for new campaign
  const [newCampaignName, setNewCampaignName] = useState('')
  const [newCampaignSubject, setNewCampaignSubject] = useState('')
  const [newCampaignEventId, setNewCampaignEventId] = useState<number>(events[0]?.id || 1)
  const [newCampaignTemplateId, setNewCampaignTemplateId] = useState(mockEmailTemplates[0].id)
  const [newCampaignAudience, setNewCampaignAudience] = useState('compradores_anteriores')
  const [newCampaignSchedule, setNewCampaignSchedule] = useState<'imediato' | 'agendado'>('imediato')
  const [newCampaignDate, setNewCampaignDate] = useState('')

  // Realistic email campaigns mapped to real events
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([
    {
      id: 1,
      name: 'EMAIL • Lançamento Lote 1 Sunset Eletrônico',
      subject: '🎟️ Lote 1 Liberado: Sunset Eletrônico com condições VIP',
      previewText: 'Garanta seu ingresso em até 6x sem juros por tempo limitado...',
      eventId: events[0]?.id || 1,
      eventTitle: events[0]?.title || 'Sunset Eletrônico',
      templateName: 'Lançamento Oficial de Vendas (Lote Promocional)',
      audienceName: 'Público de Festivais & Música Eletrônica (Base PR/SC)',
      audienceSize: 14200,
      status: 'ativa',
      sent: 14120,
      delivered: 14050,
      opened: 6180,
      clicks: 2420,
      conversions: 480,
      revenueCents: 7200000,
      bounceCount: 52,
      unsubscribeCount: 14,
      completedAt: 'Hoje às 09:00'
    },
    {
      id: 2,
      name: 'EMAIL • Recuperação de Carrinho Rock Experience',
      subject: '🛒 Seus ingressos para Rock Experience estão reservados (+ 10% OFF)',
      previewText: 'Utilize o cupom DISK10 e conclua seu pedido com desconto...',
      eventId: events[1]?.id || 2,
      eventTitle: events[1]?.title || 'Rock Experience Curitiba',
      templateName: 'Recuperação de Checkout com Cupom VIP 10%',
      audienceName: 'Checkouts Abandonados (Últimas 72h)',
      audienceSize: 2100,
      status: 'ativa',
      sent: 2080,
      delivered: 2065,
      opened: 1140,
      clicks: 620,
      conversions: 215,
      revenueCents: 4085000,
      bounceCount: 12,
      unsubscribeCount: 2,
      completedAt: 'Ontem às 15:30'
    },
    {
      id: 3,
      name: 'EMAIL • Alerta 24h Virada de Lote Festival Verão',
      subject: '⚠️ O lote do Festival Disk Verão vai virar hoje à meia-noite!',
      previewText: 'Aproveite a economia de até R$ 80 por ingresso...',
      eventId: events[2]?.id || 3,
      eventTitle: events[2]?.title || 'Festival Disk Verão 2027',
      templateName: 'Alerta de Virada de Lote (Últimas 24 Horas)',
      audienceName: 'Todos os Compradores de Eventos de Verão',
      audienceSize: 18500,
      status: 'concluida',
      sent: 18420,
      delivered: 18310,
      opened: 7690,
      clicks: 2980,
      conversions: 620,
      revenueCents: 8680000,
      bounceCount: 88,
      unsubscribeCount: 21,
      completedAt: '27/08/2026'
    },
    {
      id: 4,
      name: 'EMAIL • Line-up & Guia Iron Maiden Symphonic',
      subject: '🔥 Programação Oficial e Horários: Iron Maiden Symphonic',
      previewText: 'Confira a abertura dos portões, setores e mapa do evento...',
      eventId: events[3]?.id || 4,
      eventTitle: events[3]?.title || 'IRON MAIDEN SYMPHONIC',
      templateName: 'Line-up Completo & Atrações Confirmadas',
      audienceName: 'Compradores Confirmados com Ingressos Ativos',
      audienceSize: 8900,
      status: 'concluida',
      sent: 8850,
      delivered: 8810,
      opened: 4950,
      clicks: 1890,
      conversions: 145,
      revenueCents: 2175000,
      bounceCount: 31,
      unsubscribeCount: 6,
      completedAt: '22/08/2026'
    },
    {
      id: 5,
      name: 'EMAIL • Abertura de Vendas Sem Parar Experiência',
      subject: '🌿 Convite VIP: SEM PARAR Música e Natureza 2027',
      previewText: 'Uma experiência imersiva na natureza com lote exclusivo...',
      eventId: events[4]?.id || 5,
      eventTitle: events[4]?.title || 'SEM PARAR - EXPERIÊNCIA MÚSICA E NATUREZA',
      templateName: 'Lançamento Oficial de Vendas (Lote Promocional)',
      audienceName: 'Leads Pré-Cadastrados no Site',
      audienceSize: 5600,
      status: 'agendada',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicks: 0,
      conversions: 0,
      revenueCents: 0,
      bounceCount: 0,
      unsubscribeCount: 0,
      scheduledAt: '06/09/2026 às 10:00'
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
          c.subject.toLowerCase().includes(query) ||
          c.eventTitle.toLowerCase().includes(query)
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
    const totalOpened = active.reduce((acc, c) => acc + c.opened, 0)
    const totalClicks = active.reduce((acc, c) => acc + c.clicks, 0)
    const totalConversions = active.reduce((acc, c) => acc + c.conversions, 0)
    const totalRevenue = active.reduce((acc, c) => acc + c.revenueCents, 0)
    const totalBounces = active.reduce((acc, c) => acc + c.bounceCount, 0)
    const totalUnsubscribes = active.reduce((acc, c) => acc + c.unsubscribeCount, 0)

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 99.4
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 42.6
    const ctr = totalDelivered > 0 ? (totalClicks / totalDelivered) * 100 : 16.2
    const ctor = totalOpened > 0 ? (totalClicks / totalOpened) * 100 : 38.0

    return {
      totalSent,
      totalDelivered,
      deliveryRate,
      totalOpened,
      openRate,
      totalClicks,
      ctr,
      ctor,
      totalConversions,
      totalRevenue,
      totalBounces,
      totalUnsubscribes
    }
  }, [filteredCampaigns])

  const formatMoney = (cents: number) => {
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    notify('Link UTM copiado para a área de transferência!')
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
    if (!newCampaignName.trim() || !newCampaignSubject.trim()) {
      notify('Por favor, informe o nome e o assunto do e-mail.')
      return
    }

    const matchedEvent = events.find(ev => ev.id === newCampaignEventId) || events[0]
    const matchedTemplate = mockEmailTemplates.find(t => t.id === newCampaignTemplateId) || mockEmailTemplates[0]

    const newCamp: EmailCampaign = {
      id: Date.now(),
      name: newCampaignName,
      subject: newCampaignSubject,
      previewText: 'Aproveite as condições exclusivas...',
      eventId: matchedEvent?.id || 1,
      eventTitle: matchedEvent?.title || 'Evento',
      templateName: matchedTemplate.name,
      audienceName: 'Compradores Anteriores + Base VIP',
      audienceSize: 8400,
      status: newCampaignSchedule === 'imediato' ? 'ativa' : 'agendada',
      sent: newCampaignSchedule === 'imediato' ? 8350 : 0,
      delivered: newCampaignSchedule === 'imediato' ? 8290 : 0,
      opened: newCampaignSchedule === 'imediato' ? 3640 : 0,
      clicks: newCampaignSchedule === 'imediato' ? 1420 : 0,
      conversions: newCampaignSchedule === 'imediato' ? 280 : 0,
      revenueCents: newCampaignSchedule === 'imediato' ? 4200000 : 0,
      bounceCount: newCampaignSchedule === 'imediato' ? 35 : 0,
      unsubscribeCount: newCampaignSchedule === 'imediato' ? 8 : 0,
      scheduledAt: newCampaignSchedule === 'agendado' ? newCampaignDate || 'Amanhã às 09:00' : undefined,
      completedAt: newCampaignSchedule === 'imediato' ? 'Agora há pouco' : undefined
    }

    setCampaigns([newCamp, ...campaigns])
    setShowCreateModal(false)
    setNewCampaignName('')
    setNewCampaignSubject('')
    notify(`Campanha de E-mail "${newCamp.name}" criada com sucesso!`)
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">E-mail Marketing & CRM</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Servidor SMTP Dedicado
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Disparos segmentados, testes A/B, templates responsivos e alta entregabilidade com DKIM/SPF homologados.
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Disparo de E-mail
          </button>
        </div>
      </div>

      {/* 2. Top 4 Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Disparos e Entrega */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-mails Disparados</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Send className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.totalSent.toLocaleString('pt-BR')}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {kpis.deliveryRate.toFixed(1)}% entregabilidade
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {kpis.totalDelivered.toLocaleString('pt-BR')} e-mails entregues na caixa de entrada
          </p>
        </div>

        {/* KPI 2: Taxa de Abertura */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa de Abertura (Open Rate)</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.openRate.toFixed(1)}%</span>
            <span className="text-xs font-semibold text-emerald-600">
              {kpis.totalOpened.toLocaleString('pt-BR')} aberturas únicas
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Tempo médio de abertura: <strong>2.4 horas</strong> pós-disparo
          </p>
        </div>

        {/* KPI 3: Cliques e CTR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliques & CTR (CTOR)</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <MousePointerClick className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{kpis.ctr.toFixed(1)}%</span>
            <span className="text-xs font-semibold text-purple-600">
              {kpis.totalClicks.toLocaleString('pt-BR')} cliques ({kpis.ctor.toFixed(1)}% CTOR)
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <strong>{kpis.totalConversions.toLocaleString('pt-BR')}</strong> ingressos convertidos por e-mail
          </p>
        </div>

        {/* KPI 4: Receita Atribuída */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receita & Vendas</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{formatMoney(kpis.totalRevenue)}</span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {kpis.totalConversions} pedidos
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Bounces: {kpis.totalBounces} · Descadastros: {kpis.totalUnsubscribes} (0.08%)
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('campanhas')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'campanhas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Send className="w-4 h-4" /> Campanhas de E-mail ({filteredCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Inbox className="w-4 h-4" /> Templates Responsivos & Preview
          </button>
          <button
            onClick={() => setActiveTab('testes_ab')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'testes_ab'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Split className="w-4 h-4" /> Testes A/B & Automações
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'historico'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" /> Logs SMTP & Entregabilidade
          </button>
          <button
            onClick={() => setActiveTab('segmentacao')}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'segmentacao'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Segmentação de Leads
          </button>
        </nav>
      </div>

      {/* 4. Tab 1: Campanhas de E-mail */}
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
                placeholder="Buscar campanha, assunto..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-full sm:w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Campanha / Assunto</th>
                    <th className="px-4 py-3">Evento & Público</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-right">Disparados</th>
                    <th className="px-3 py-3 text-right">Aberturas</th>
                    <th className="px-3 py-3 text-right">Cliques (CTR)</th>
                    <th className="px-4 py-3 text-right">Receita</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        Nenhuma campanha de e-mail encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map(camp => {
                      const openPct = camp.delivered > 0 ? ((camp.opened / camp.delivered) * 100).toFixed(1) : '0.0'
                      const ctrPct = camp.delivered > 0 ? ((camp.clicks / camp.delivered) * 100).toFixed(1) : '0.0'

                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">{camp.name}</div>
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                              {camp.subject}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              {camp.completedAt && <span>Disparado: {camp.completedAt}</span>}
                              {camp.scheduledAt && <span className="text-amber-600 font-medium">Agendado para: {camp.scheduledAt}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-xs mb-1">
                              {camp.eventTitle}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-[200px]">
                              {camp.audienceName} ({camp.audienceSize.toLocaleString('pt-BR')})
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
                            <div className="font-bold text-slate-900">{openPct}%</div>
                            <div className="text-xs text-slate-400">{camp.opened.toLocaleString('pt-BR')} únicos</div>
                          </td>
                          <td className="px-3 py-4 text-right">
                            <div className="font-semibold text-purple-600">{ctrPct}% CTR</div>
                            <div className="text-xs font-medium text-slate-500">{camp.conversions} vendas</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="font-bold text-emerald-600">{formatMoney(camp.revenueCents)}</div>
                            <div className="text-xs text-slate-400">{camp.conversions} ingressos</div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {camp.status === 'ativa' && (
                                <button
                                  onClick={() => handleToggleStatus(camp.id)}
                                  title="Pausar Envio"
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all cursor-pointer"
                                >
                                  <Pause className="w-4 h-4" />
                                </button>
                              )}
                              {camp.status === 'pausada' && (
                                <button
                                  onClick={() => handleToggleStatus(camp.id)}
                                  title="Retomar Envio"
                                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all cursor-pointer"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleCopy(`https://newpdtv1.vercel.app/email/${camp.id}`, camp.id)}
                                title="Copiar Link UTM"
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                              >
                                {copiedId === camp.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
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

      {/* 5. Tab 2: Templates Responsivos & Preview */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Templates Selector (Left) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Biblioteca de Templates Homologados</h3>
            <div className="space-y-3">
              {mockEmailTemplates.map(tpl => {
                const isSelected = selectedTemplate.id === tpl.id
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{tpl.name}</h4>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mt-1">
                          {tpl.categoryLabel}
                        </span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          setSelectedTemplate(tpl)
                          setNewCampaignSubject(tpl.subjectSuggestion)
                          setShowCreateModal(true)
                        }}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-all shrink-0 cursor-pointer"
                      >
                        Usar
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">
                      "{tpl.subjectSuggestion}"
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Email Live Preview (Right) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Visualização em Tempo Real</h4>
                <p className="text-xs text-slate-500">Renderização responsiva do e-mail com tags dinâmicas</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Visualização Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Visualização Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Email Client Container */}
            <div className="flex justify-center bg-slate-100 p-6 rounded-2xl border border-slate-200">
              <div
                className={`bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all ${
                  previewDevice === 'mobile' ? 'w-[360px]' : 'w-full max-w-[620px]'
                }`}
              >
                {/* Email Client Header */}
                <div className="bg-slate-50 p-3.5 border-b border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>De: <strong>DiskIngressos</strong> &lt;ingressos@diskingressos.com.br&gt;</span>
                    <span>Hoje, 10:15</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedTemplate.subjectSuggestion.replace('{{evento}}', events[0]?.title || 'Sunset Eletrônico').replace('{{nome}}', 'Vinicius')}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Para: <strong>vinicius@diskingressos.com.br</strong>
                  </div>
                </div>

                {/* Email Template Body */}
                <div className="p-6 space-y-5">
                  {/* Brand Header */}
                  <div className="text-center pb-4 border-b border-slate-100">
                    <div className="inline-block bg-slate-900 text-white font-black px-4 py-1.5 rounded-lg text-sm tracking-wider">
                      DISKINGRESSOS
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div className="w-full h-36 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-center p-4 shadow-inner">
                    <h3 className="font-black text-lg md:text-xl uppercase tracking-wide leading-tight">
                      {selectedTemplate.contentTitle}
                    </h3>
                  </div>

                  {/* Body Text */}
                  <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedTemplate.bodyHtmlPreview
                      .replace('{{nome}}', 'Vinicius')
                      .replace('{{evento}}', events[0]?.title || 'Sunset Eletrônico')
                      .replace('{{data}}', '18 de Outubro de 2026')
                      .replace('{{local}}', 'Pedreira Paulo Leminski - Curitiba')}
                  </div>

                  {/* Big CTA Button */}
                  <div className="text-center py-2">
                    <a
                      href="#preview"
                      onClick={e => e.preventDefault()}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-md transition-all uppercase tracking-wider"
                    >
                      {selectedTemplate.ctaText}
                    </a>
                  </div>

                  {/* Email Footer */}
                  <div className="pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
                    <p>© 2026 DiskIngressos • Plataforma Oficial de Vendas de Ingressos</p>
                    <p>Você recebeu este e-mail porque está cadastrado na nossa base de eventos.</p>
                    <p className="text-blue-500 underline cursor-pointer">Descadastrar-se / Preferências de E-mail</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Testes A/B & Automações */}
      {activeTab === 'testes_ab' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Testes A/B de Alta Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Envie duas variações de assunto para 20% da base. A versão com maior taxa de abertura é enviada automaticamente aos 80% restantes.
              </p>
            </div>
            <button
              onClick={() => notify('Novo teste A/B criado.')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Criar Teste A/B
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  TESTE CONCLUÍDO · VENCEDOR B
                </span>
                <span className="text-xs text-slate-400">Sunset Eletrônico</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Disparo de Lançamento de Lote</h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Variação A (Normal):</span>
                    <span>36.2% abertura</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">"Ingressos liberados para o Sunset Eletrônico 2026"</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Variação B (Emoji + Urgência) 🏆:</span>
                    <span>48.9% abertura (+35%)</span>
                  </div>
                  <p className="text-emerald-700 mt-0.5">"🔥 LOTE 1 LIBERADO: Garanta seu ingresso VIP antes que esgote!"</p>
                </div>
              </div>
            </div>

            {/* Test 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  TESTE CONCLUÍDO · VENCEDOR A
                </span>
                <span className="text-xs text-slate-400">Rock Experience</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Recuperação de Carrinho</h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Variação A (Personalizado) 🏆:</span>
                    <span>52.4% abertura (+22%)</span>
                  </div>
                  <p className="text-emerald-700 mt-0.5">"Vinicius, seu ingresso para o Rock Experience está te esperando"</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Variação B (Genérico):</span>
                    <span>42.8% abertura</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">"Você esqueceu ingressos no seu carrinho - Conclua agora"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Logs SMTP */}
      {activeTab === 'historico' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Relatório de Entregabilidade SMTP (Amazon SES / SendGrid)</h3>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> 99.4% Entregabilidade · 0 Falhas críticas
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {[
              { email: 'lucas.ferreira@gmail.com', event: events[0]?.title || 'Sunset Eletrônico', subject: 'Lote 1 Liberado com Condição VIP', time: 'Há 4 min', status: 'Aberto', ip: 'Amazon SES (sa-east-1)' },
              { email: 'mariana.costa@hotmail.com', event: events[0]?.title || 'Sunset Eletrônico', subject: 'Lote 1 Liberado com Condição VIP', time: 'Há 9 min', status: 'Clicado', ip: 'Amazon SES (sa-east-1)' },
              { email: 'rafael.souza@uol.com.br', event: events[1]?.title || 'Rock Experience', subject: 'Recuperação de Carrinho 10% OFF', time: 'Há 15 min', status: 'Convertido', ip: 'Amazon SES (sa-east-1)' },
              { email: 'camila.rocha@outlook.com', event: events[2]?.title || 'Festival Verão', subject: 'Alerta de Virada de Lote 24h', time: 'Há 22 min', status: 'Entregue', ip: 'Amazon SES (sa-east-1)' }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.email}</div>
                    <div className="text-slate-400 mt-0.5">{item.subject} · <span className="text-slate-500 font-medium">{item.event}</span></div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    item.status === 'Convertido' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Clicado' ? 'bg-purple-100 text-purple-800' : item.status === 'Aberto' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                  <div className="text-slate-400 mt-0.5">{item.time} · {item.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Tab 5: Segmentação de Leads */}
      {activeTab === 'segmentacao' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Segmentos de Contatos Disponíveis</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Compradores VIP (Ticket Médio > R$ 250)', count: '3.140 contatos', tag: 'Ticket Alto' },
                { name: 'Participantes de Festivais de Música', count: '18.400 contatos', tag: 'Interesse Geral' },
                { name: 'Checkouts Abandonados nos últimos 30 dias', count: '1.820 contatos', tag: 'Recuperação' },
                { name: 'Base Completa de Compradores do Produtor', count: '48.900 contatos', tag: 'Base Global' }
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
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Reputação & Entregabilidade
            </h3>
            <p className="text-xs text-slate-500">
              Métricas de saúde dos domínios e servidores de disparo da DiskIngressos.
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 bg-blue-50 rounded border border-blue-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>SPF, DKIM e DMARC 100% configurados e alinhados</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded border border-blue-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Reputação de IP: 99/100 (Google Postmaster & Microsoft SNDS)</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded border border-blue-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Limpeza automática de Hard Bounces e descadastros instantâneos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Disparo de E-mail */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">Novo Disparo de E-mail Marketing</h3>
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
                <label className="block font-bold text-slate-700 mb-1">Nome Interno da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: EMAIL • Abertura Lote 1 Sunset"
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assunto do E-mail</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 🎟️ Ingressos Liberados: Garanta seu lugar no Sunset com desconto!"
                  value={newCampaignSubject}
                  onChange={e => setNewCampaignSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block font-bold text-slate-700 mb-1">Template de Design</label>
                  <select
                    value={newCampaignTemplateId}
                    onChange={e => setNewCampaignTemplateId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white cursor-pointer"
                  >
                    {mockEmailTemplates.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lista de Destinatários</label>
                <select
                  value={newCampaignAudience}
                  onChange={e => setNewCampaignAudience(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white cursor-pointer"
                >
                  <option value="compradores_anteriores">Compradores Anteriores do Evento (Alta Conversão)</option>
                  <option value="carrinho_abandonado">Checkouts Abandonados nos últimos 7 dias</option>
                  <option value="leads_vip">Lista VIP & Participantes de Edições Passadas</option>
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Agendar / Disparar E-mails
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
