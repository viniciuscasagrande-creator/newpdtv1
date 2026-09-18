import { useState, useEffect, useMemo, type FormEvent } from 'react'
import {
  LayoutDashboard, Ticket, AlertTriangle, BookOpen, Users, Clock3, Plus, Search,
  RefreshCw, CheckCircle2, MessageCircle, Mail, Phone, Globe, ShieldAlert,
  Send, UserCheck, Sparkles, Filter, ChevronRight, ArrowRight, ExternalLink,
  Flame, HelpCircle, FileText, CheckCheck, PlayCircle, XCircle, AlertCircle, Headphones, Link2, Sparkle,
  Layers3, ArrowRightLeft, UserPlus, CheckSquare, Gauge, Calendar, BellRing, SlidersHorizontal, Zap,
  BarChart3, Activity, ShieldCheck, LifeBuoy, MessagesSquare, Tag, ShoppingBag, WalletCards, ScanLine,
  UserRound, CalendarDays, Workflow, Play, PauseCircle, Server, Radio, Wrench, Shield, Siren, Bug, Lightbulb,
  ClipboardCheck, MessageSquareText, GitBranch, Target, Star, Smile, Heart, MessageCircleWarning, TrendingUp,
  ThumbsUp, ThumbsDown, Eye, Archive, TicketCheck, LineChart, PieChart, Bot, Brain, Copy, DoorOpen, WifiOff,
  CalendarClock, ChartNoAxesCombined, Bell, ChevronLeft, ChevronDown, ListFilter, Grid, LayoutGrid, Download,
  RotateCcw, ShoppingCart, SendHorizontal, Paperclip, Check, AlertOctagon, Terminal, Award, X, QrCode, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import {
  DiskPageHeader,
  DiskKpiCard
} from '../components/ui/disk'

export type ServiceTab =
  | 'hub'
  | 'search360'
  | 'bi'
  | 'tickets'
  | 'inbox'
  | 'sla'
  | 'teams'
  | 'client360'
  | 'incidents'
  | 'problems'
  | 'major'
  | 'knowledge'
  | 'csat'
  | 'copilot'
  | 'predictive'
  | 'workflows'
  | 'new'

interface Customer360Data {
  customer: {
    id: number
    name: string
    cpfMasked: string
    phoneMasked: string
    emailMasked: string
    city: string
    state: string
    memberSince: string
    tags: string[]
  }
  metrics: {
    orders: number
    ingressos: number
    totalSpent: number
    sacTickets: number
  }
  orders: Array<{
    id: number
    order_number: string
    event_name: string
    status: string
    total_amount: number
    ingresso_count: number
    checkin_count: number
    payment_method: string
    payment_status: string
    created_at: string
  }>
  ingressos: Array<{
    id: number
    ticket_code: string
    order_number: string
    event_name: string
    status: string
    checkin_status: string
  }>
  payments: Array<{
    id: number
    order_number: string
    method: string
    status: string
    amount: number
  }>
  sacTickets: Array<{
    id: number
    ticket_number: string
    subject: string
    priority: string
    status: string
  }>
  timeline: Array<{
    id: number
    title: string
    description: string
    occurred_at: string
  }>
}

const mockCustomer360: Customer360Data = {
  customer: {
    id: 1284,
    name: 'João Silva Oliveira',
    cpfMasked: '***.***.***-00',
    phoneMasked: '(41) *****-8899',
    emailMasked: 'jo***@email.com',
    city: 'Curitiba',
    state: 'PR',
    memberSince: '12/03/2024',
    tags: ['VIP Diamond', 'Recorrente', 'Comprador Fiel']
  },
  metrics: {
    orders: 3,
    ingressos: 6,
    totalSpent: 1280.0,
    sacTickets: 2
  },
  orders: [
    {
      id: 984221,
      order_number: 'DI-984221',
      event_name: 'Festival XPTO 2026',
      status: 'PAID',
      total_amount: 480.0,
      ingresso_count: 2,
      checkin_count: 0,
      payment_method: 'PIX',
      payment_status: 'APROVADO',
      created_at: 'Hoje às 10:30'
    },
    {
      id: 983110,
      order_number: 'DI-983110',
      event_name: 'Rock Arena Festival 2026',
      status: 'PAID',
      total_amount: 520.0,
      ingresso_count: 2,
      checkin_count: 2,
      payment_method: 'CARTAO_CREDITO',
      payment_status: 'APROVADO',
      created_at: '15/07/2026'
    }
  ],
  ingressos: [
    { id: 88101, ticket_code: 'ING-88101', order_number: 'DI-984221', event_name: 'Festival XPTO 2026', status: 'ACTIVE', checkin_status: 'NÃO UTILIZADO' },
    { id: 88102, ticket_code: 'ING-88102', order_number: 'DI-984221', event_name: 'Festival XPTO 2026', status: 'ACTIVE', checkin_status: 'NÃO UTILIZADO' },
    { id: 87401, ticket_code: 'ING-87401', order_number: 'DI-983110', event_name: 'Rock Arena Festival 2026', status: 'USED', checkin_status: 'VALIDADO PORTÃO A' }
  ],
  payments: [
    { id: 1, order_number: 'DI-984221', method: 'PIX (Efí Bank)', status: 'APROVADO', amount: 480.0 },
    { id: 2, order_number: 'DI-983110', method: 'Cartão de Crédito Visa', status: 'APROVADO', amount: 520.0 }
  ],
  sacTickets: [
    { id: 1, ticket_number: 'DS-2026-984221', subject: 'Ingresso não recebido após aprovação Pix', priority: 'P2', status: 'EM_ATENDIMENTO' },
    { id: 2, ticket_number: 'DS-2026-981044', subject: 'Dúvida sobre meia-entrada estudante', priority: 'P3', status: 'RESOLVIDO' }
  ],
  timeline: [
    { id: 1, title: 'Compra realizada via Pix', description: 'Pedido #DI-984221 no valor de R$ 480,00 aprovado no gateway Efí.', occurred_at: 'Hoje às 10:30' },
    { id: 2, title: 'QR Code emitido no sistema', description: '2 ingressos gerados (ING-88101 e ING-88102) na carteira digital.', occurred_at: 'Hoje às 10:31' },
    { id: 3, title: 'Contato do cliente no SAC via WhatsApp', description: 'Cliente informou que o e-mail não chegou na caixa de entrada.', occurred_at: 'Hoje às 10:45' },
    { id: 4, title: 'Atendimento iniciado por Lucas Atendente (N1)', description: 'Diagnóstico Disk Copilot confirmou pagamento e gerou disparo por WhatsApp.', occurred_at: 'Hoje às 10:48' }
  ]
}

const mockTicketsList = [
  { id: 1, code: 'DS-2026-001', customer: 'Mariana Costa', channel: 'WhatsApp', subject: 'Dificuldade para acessar QR Code no app', priority: 'P1', status: 'EM_ATENDIMENTO', agent: 'Lucas SAC', slaDue: '18 min', event: 'Festival XPTO 2026' },
  { id: 2, code: 'DS-2026-002', customer: 'Rodrigo Mendonça', channel: 'Email', subject: 'Comprovante de meia-entrada enviado', priority: 'P3', status: 'EM_ABERTO', agent: 'Fila N1', slaDue: '1h 45m', event: 'Rock Arena Festival 2026' },
  { id: 3, code: 'DS-2026-003', customer: 'Camila Alencar', channel: 'Chat', subject: 'Pedido cancelado e estorno solicitado', priority: 'P2', status: 'EM_ATENDIMENTO', agent: 'Beatriz N2', slaDue: '32 min', event: 'Festival XPTO 2026' },
  { id: 4, code: 'DS-2026-004', customer: 'Felipe Santana', channel: 'WhatsApp', subject: 'Dúvida sobre validação de voucher meia-entrada', priority: 'P2', status: 'ATRASADO', agent: 'Fila N1', slaDue: 'Atrasado 12m', event: 'Festival XPTO 2026' },
  { id: 5, code: 'DS-2026-005', customer: 'Juliana Paes', channel: 'Instagram', subject: 'Dúvidas sobre horário de abertura dos portões', priority: 'P4', status: 'RESOLVIDO', agent: 'Fernando SAC', slaDue: 'Concluído', event: 'Rock Arena Festival 2026' },
]

const mockConversations = [
  { id: 1, customer: 'João Silva', channel: 'WhatsApp', phone: '(41) 99999-8899', lastMsg: 'Meu e-mail não chegou com o ingresso...', time: '10:48', unread: 1, status: 'OPEN' },
  { id: 2, customer: 'Mariana Costa', channel: 'WhatsApp', phone: '(41) 98888-7711', lastMsg: 'Consegui abrir o voucher, muito obrigada!', time: '10:42', unread: 0, status: 'RESOLVED' },
  { id: 3, customer: 'Carlos Eduardo', channel: 'Email', phone: 'carlos@empresa.com', lastMsg: 'Solicito alteração de titularidade do lote 3', time: '10:15', unread: 2, status: 'OPEN' },
  { id: 4, customer: 'Ana Paula Souza', channel: 'Chat', phone: 'anapaula@gmail.com', lastMsg: 'Como funciona o acesso PCD no evento?', time: '09:50', unread: 0, status: 'OPEN' },
]

const mockIncidents = [
  { id: 1, code: 'INC-2026-089', title: 'Instabilidade na emissão de PIX Efí Bank', priority: 'P1', status: 'INVESTIGANDO', impact: 'Crítico (Vendas)', affected: 'Checkout Web / Pix', ticketsLinked: 14, startedAt: 'Hoje 10:12' },
  { id: 2, code: 'INC-2026-088', title: 'Atraso na sincronização de pagamentos com cartão', priority: 'P2', status: 'EM_CORRECAO', impact: 'Médio (Transações)', affected: 'Gateway Cartão', ticketsLinked: 3, startedAt: 'Hoje 09:30' },
  { id: 3, code: 'INC-2026-087', title: 'Atraso na fila de disparo de e-mails SES', priority: 'P2', status: 'RESOLVIDO', impact: 'Médio (Notificações)', affected: 'Serviço de Envio SES', ticketsLinked: 8, startedAt: 'Hoje 08:00' },
]

const mockProblems = [
  { id: 1, code: 'PRB-2026-012', title: 'Falha no envio de comprovantes em lotes massivos de ingressos', category: 'Notificações/Email', status: 'RCA_CONCLUIDA', rootCause: 'Timeout no buffer de disparos simultâneos para mais de 500 destinatários.', workaround: 'Fracionamento automático dos lotes em batches de 50 mensagens.', actionPlan: 'Implementação de fila assíncrona Redis BullMQ.' },
  { id: 2, code: 'PRB-2026-011', title: 'Duplicidade de Webhook Efí Pix em picos de concorrência', category: 'Integrações Gateway', status: 'EM_INVESTIGACAO', rootCause: 'Falta de lock transacional distribuído por chave E2E no backend.', workaround: 'Tabela de deduplicação com idempotência TTL de 30 minutos.', actionPlan: 'Implementação de Mutex Redis na rota de callback.' },
]

const mockKnowledge = [
  { id: 1, title: 'Como solicitar segunda via de ingresso ou QR Code?', category: 'Ingressos & Vouchers', views: 1420, helpful: 312, unhelpful: 4, updated: '28/08/2026', tags: ['QR Code', 'Reenvio', 'WhatsApp', 'Email'] },
  { id: 2, title: 'Regras de Meia-Entrada para Estudantes, Idosos e PCD', category: 'Meia-Entrada', views: 2890, helpful: 540, unhelpful: 8, updated: '15/08/2026', tags: ['Meia-Entrada', 'DNE', 'Documentos'] },
  { id: 3, title: 'Política de Cancelamento e Reembolso em até 7 dias', category: 'Pagamentos & Reembolso', views: 3200, helpful: 680, unhelpful: 12, updated: '01/08/2026', tags: ['Reembolso', 'CDC', 'Estorno', 'Pix'] },
  { id: 4, title: 'Procedimento para alteração de titularidade de ingresso', category: 'Ingressos & Vouchers', views: 1120, helpful: 260, unhelpful: 3, updated: '22/08/2026', tags: ['Titularidade', 'Troca', 'Transferência'] },
]

type Props = {
  events: EventItem[]
  producerId: number | null
  producerName: string
  mode?: string
  notify: (m: string) => void
  onNavigate: (key: any) => void
}

export default function SupportPage({ events, producerId, producerName, mode = 'hub', notify, onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<ServiceTab>('hub')
  const [viewMode, setViewMode] = useState<'grade' | 'lista'>('grade')

  // Search 360 / Busca ID State
  const [globalSearchInput, setGlobalSearchInput] = useState('')
  const [detectedType, setDetectedType] = useState<string>('NOME')
  const [customer360, setCustomer360] = useState<Customer360Data | null>(mockCustomer360)
  const [searchLoading, setSearchLoading] = useState(false)

  // Order Details Modal State
  const [selectedOrderModal, setSelectedOrderModal] = useState<any | null>(null)

  // Submodules Filter States
  const [ticketFilter, setTicketFilter] = useState<'TODOS' | 'P1' | 'ABERTOS' | 'ATRASADOS' | 'RESOLVIDOS'>('TODOS')
  const [selectedConv, setSelectedConv] = useState(mockConversations[0])
  const [chatInput, setChatInput] = useState('')
  const [selectedKnowledgeCat, setSelectedKnowledgeCat] = useState('TODAS')
  const [autoRouting, setAutoRouting] = useState(true)

  const scrollLauncher = (direction: 'left' | 'right') => {
    const el = document.getElementById('ds-launcher-scroll-container')
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -260 : 260, behavior: 'smooth' })
    }
  }

  const handleGlobalSearch = (queryOverride?: string) => {
    const q = (queryOverride !== undefined ? queryOverride : globalSearchInput).trim()
    if (!q) {
      setActiveTab('search360')
      return
    }

    setSearchLoading(true)
    let type = 'NOME'
    const cleanNum = q.replace(/\D/g, '')

    if (q.startsWith('DI-') || q.startsWith('di-') || (/^\d{5,7}$/.test(cleanNum) && q.length < 9)) {
      type = 'PEDIDO'
    } else if (cleanNum.length === 11) {
      type = 'CPF'
    } else if (cleanNum.length >= 10 && cleanNum.length <= 13) {
      type = 'TELEFONE'
    } else if (q.includes('@')) {
      type = 'EMAIL'
    } else if (q.toUpperCase().startsWith('ING-')) {
      type = 'INGRESSO'
    }

    setDetectedType(type)

    setTimeout(() => {
      setCustomer360(mockCustomer360)
      setSearchLoading(false)
      setActiveTab('search360')
      notify(`Busca ID localizada para "${q}" (Tipo detectado: ${type}) em 140ms!`)
    }, 200)
  }

  const handleOperatorAction = (action: string, orderData?: any) => {
    if (action === 'OPEN_TICKET') {
      setActiveTab('new')
    } else if (action === 'SEND_WHATSAPP') {
      notify(`Disparando mensagem com voucher e QR Code no WhatsApp de ${customer360?.customer.name}!`)
    } else if (action === 'RESEND_EMAIL') {
      notify(`Reenviando voucher PDF com QR Code para ${customer360?.customer.emailMasked}!`)
    } else if (action === 'VIEW_CHECKIN') {
      notify(`Status de Check-in: 2 ingressos do pedido #DI-984221 ativos e prontos para uso!`)
    } else if (action === 'REQUEST_REFUND') {
      notify('Solicitação de estorno protocolada no gateway Efí Pix com sucesso!')
    } else if (action === 'VIEW_ORDER') {
      const orderToOpen = orderData || customer360?.orders[0] || mockCustomer360.orders[0]
      setSelectedOrderModal(orderToOpen)
      notify(`Detalhes do pedido #${orderToOpen.order_number} abertos na tela!`)
    }
  }

  useEffect(() => {
    if (!mode) return
    if (mode === 'hub') setActiveTab('hub')
    else if (mode === 'search360') setActiveTab('search360')
    else if (mode === 'bi' || mode === 'reports' || mode === 'dashboard') setActiveTab('bi')
    else if (mode === 'predictive') setActiveTab('predictive')
    else if (mode === 'copilot') setActiveTab('copilot')
    else if (mode === 'csat') setActiveTab('csat')
    else if (mode === 'inbox' || mode === 'integrations') setActiveTab('inbox')
    else if (mode === 'tickets') setActiveTab('tickets')
    else if (mode === 'major') setActiveTab('major')
    else if (mode === 'incidents') setActiveTab('incidents')
    else if (mode === 'problems') setActiveTab('problems')
    else if (mode === 'client360') setActiveTab('search360')
    else if (mode === 'workflows') setActiveTab('workflows')
    else if (mode === 'sla') setActiveTab('sla')
    else if (mode === 'knowledge') setActiveTab('knowledge')
    else if (mode === 'teams') setActiveTab('teams')
  }, [mode])

  return (
    <LimitlessPage className="p-4 md:p-6 space-y-6">
      <DiskPageHeader
        title={`Cockpit SAC & Atendimento — ${producerName || 'Disk Service'}`}
        description="Visão integrada, gestão de chamados, conformidade SLA e inteligência operacional"
        breadcrumbs={['DiskIngressos', 'SAC', 'Cockpit Operacional']}
        badge="SAC 360°"
        badgeTone="info"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('profile-dashboard')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition cursor-pointer"
                title="Voltar ao Painel Principal"
              >
                <ArrowLeft size={14} className="text-cyan-400" />
                <span className="hidden sm:inline">Painel</span>
              </button>
            )}

            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Buscar CPF, pedido, nome, fone..."
                value={globalSearchInput}
                onChange={e => setGlobalSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
                className="h-8 pl-8 pr-16 text-xs bg-slate-900/60 text-slate-100 border border-slate-700/60 rounded-md focus:outline-hidden focus:border-cyan-500 w-44 sm:w-60 md:w-72"
              />
              <Search size={14} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => handleGlobalSearch()}
                className="absolute right-1 px-2 py-0.5 text-[10px] font-bold bg-sky-600 hover:bg-sky-500 text-white rounded cursor-pointer"
              >
                Buscar
              </button>
            </div>

            <button
              type="button"
              onClick={() => notify('12 notificações ativas: 1 War Room P1, 3 alertas de SLA e 8 novos chamados')}
              className="relative p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer"
              title="Notificações"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-600 text-white">12</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('knowledge')}
              className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer"
              title="Base de Conhecimento"
            >
              <HelpCircle size={16} />
            </button>

            <div
              className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-600/30 text-cyan-400 font-bold text-xs border border-cyan-500/40 cursor-pointer"
              onClick={() => notify('Perfil operacional: Vinicius Casagrande (Admin Master)')}
              title="Perfil Operacional"
            >
              {producerName ? producerName.slice(0, 2).toUpperCase() : 'VC'}
            </div>
          </div>
        }
      />

      <div className="disk-service-shell" style={{ padding: 0, background: 'transparent' }}>
        <div className="disk-service-inner" style={{ padding: 0 }}>

        {/* Top Launcher Carousel com Controles de Navegação (Sem Live Ops) */}
        <div className="ds-launcher-wrapper">
          <button className="ds-launcher-scroll-btn left" onClick={() => scrollLauncher('left')} title="Rolar para a esquerda">
            <ChevronLeft size={16} />
          </button>

          <div className="ds-launcher-bar" id="ds-launcher-scroll-container">
            <button className={`ds-launcher-item ${activeTab === 'hub' ? 'active' : ''}`} onClick={() => setActiveTab('hub')}>
              <div className="ds-launcher-circle">
                <LifeBuoy size={22} />
              </div>
              <span className="ds-launcher-label">Hub Geral</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'search360' ? 'active' : ''}`} onClick={() => setActiveTab('search360')}>
              <div className="ds-launcher-circle" style={{ borderColor: activeTab === 'search360' ? '#2563eb' : '#cbd5e1' }}>
                <Search size={22} style={{ color: '#2563eb' }} />
                <span className="ds-mini-tag blue">ID</span>
              </div>
              <span className="ds-launcher-label" style={{ color: '#2563eb', fontWeight: 800 }}>Busca ID</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
              <div className="ds-launcher-circle">
                <Ticket size={22} />
                <span className="ds-mini-tag blue">5</span>
              </div>
              <span className="ds-launcher-label">Tickets</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
              <div className="ds-launcher-circle">
                <MessagesSquare size={22} />
                <span className="ds-mini-tag purple">3 novos</span>
              </div>
              <span className="ds-launcher-label">Omnichannel</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'bi' ? 'active' : ''}`} onClick={() => setActiveTab('bi')}>
              <div className="ds-launcher-circle">
                <BarChart3 size={22} />
              </div>
              <span className="ds-launcher-label">Dashboard & BI</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'copilot' ? 'active' : ''}`} onClick={() => setActiveTab('copilot')}>
              <div className="ds-launcher-circle">
                <Bot size={22} />
                <span className="ds-mini-tag purple">96%</span>
              </div>
              <span className="ds-launcher-label">Disk Copilot IA</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'major' ? 'active' : ''}`} onClick={() => setActiveTab('major')}>
              <div className="ds-launcher-circle">
                <Siren size={22} />
                <span className="ds-mini-tag red">War Room</span>
              </div>
              <span className="ds-launcher-label">Major Incidents</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'incidents' ? 'active' : ''}`} onClick={() => setActiveTab('incidents')}>
              <div className="ds-launcher-circle">
                <AlertTriangle size={22} />
                <span className="ds-mini-tag red">3</span>
              </div>
              <span className="ds-launcher-label">Incidentes</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>
              <div className="ds-launcher-circle">
                <Bug size={22} />
              </div>
              <span className="ds-launcher-label">Problems (RCA)</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'csat' ? 'active' : ''}`} onClick={() => setActiveTab('csat')}>
              <div className="ds-launcher-circle">
                <Smile size={22} />
              </div>
              <span className="ds-launcher-label">CSAT + NPS</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'sla' ? 'active' : ''}`} onClick={() => setActiveTab('sla')}>
              <div className="ds-launcher-circle">
                <Clock3 size={22} />
              </div>
              <span className="ds-launcher-label">Gestão de SLA</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'teams' ? 'active' : ''}`} onClick={() => setActiveTab('teams')}>
              <div className="ds-launcher-circle">
                <Users size={22} />
              </div>
              <span className="ds-launcher-label">Filas & Agentes</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
              <div className="ds-launcher-circle">
                <BookOpen size={22} />
              </div>
              <span className="ds-launcher-label">Base Conhecimento</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'predictive' ? 'active' : ''}`} onClick={() => setActiveTab('predictive')}>
              <div className="ds-launcher-circle">
                <Brain size={22} />
              </div>
              <span className="ds-launcher-label">Analytics Preditivo</span>
            </button>

            <button className={`ds-launcher-item ${activeTab === 'workflows' ? 'active' : ''}`} onClick={() => setActiveTab('workflows')}>
              <div className="ds-launcher-circle">
                <Workflow size={22} />
              </div>
              <span className="ds-launcher-label">Automações</span>
            </button>
          </div>

          <button className="ds-launcher-scroll-btn right" onClick={() => scrollLauncher('right')} title="Rolar para a direita">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ========================================================
            TELA 1: HUB GERAL (OPERACIONAL)
            ======================================================== */}
        {activeTab === 'hub' && (
          <>
            <div className="ds-section-header">
              <h2 className="ds-section-title">MÓDULOS PRINCIPAIS</h2>
              <div className="ds-view-toggles">
                <button className={`ds-view-btn ${viewMode === 'grade' ? 'active' : ''}`} onClick={() => setViewMode('grade')}>
                  <LayoutGrid size={14} /> Grade
                </button>
                <button className={`ds-view-btn ${viewMode === 'lista' ? 'active' : ''}`} onClick={() => setViewMode('lista')}>
                  <ListFilter size={14} /> Lista
                </button>
                <button className="ds-view-btn" onClick={() => notify('Configurações personalizadas salvas')}>
                  Personalizar <ChevronDown size={14} />
                </button>
              </div>
            </div>

            <div className="ds-modules-grid">
              <div className="ds-module-card" onClick={() => setActiveTab('search360')} style={{ border: '2px solid #2563eb', background: "var(--disk-color-info-subtle)" }}>
                <div className="ds-card-icon-wrap blue"><Search size={22} /></div>
                <div className="ds-card-text"><h4>Busca ID</h4><p>Localização rápida por CPF, pedido, nome, fone ou ingresso</p></div>
                <ChevronRight size={18} className="ds-card-chevron" style={{ color: '#2563eb' }} />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('tickets')}>
                <div className="ds-card-icon-wrap green"><TicketCheck size={22} /></div>
                <div className="ds-card-text"><h4>Tickets</h4><p>Chamados, atendimentos e resoluções</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('inbox')}>
                <div className="ds-card-icon-wrap cyan"><MessagesSquare size={22} /></div>
                <div className="ds-card-text"><h4>Omnichannel</h4><p>WhatsApp, Email, Chat, Instagram e mais</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('sla')}>
                <div className="ds-card-icon-wrap purple"><Clock3 size={22} /></div>
                <div className="ds-card-text"><h4>SLA & Metas</h4><p>Acordos, metas e conformidade de SLA</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('teams')}>
                <div className="ds-card-icon-wrap yellow"><Users size={22} /></div>
                <div className="ds-card-text"><h4>Filas & Agentes</h4><p>Distribuição, agentes e carga de trabalho</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('incidents')}>
                <div className="ds-card-icon-wrap red"><AlertTriangle size={22} /></div>
                <div className="ds-card-text"><h4>Incidentes</h4><p>Registro, impacto, prioridade e resolução</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('problems')}>
                <div className="ds-card-icon-wrap purple"><Bug size={22} /></div>
                <div className="ds-card-text"><h4>Problems (RCA)</h4><p>Gestão de problemas, causas e planos</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('major')}>
                <div className="ds-card-icon-wrap red"><Siren size={22} /></div>
                <div className="ds-card-text"><h4>Major Incidents (P1)</h4><p>Incidentes críticos e War Room</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('knowledge')}>
                <div className="ds-card-icon-wrap blue"><BookOpen size={22} /></div>
                <div className="ds-card-text"><h4>Base de Conhecimento</h4><p>Artigos, manuais e soluções inteligentes</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('csat')}>
                <div className="ds-card-icon-wrap green"><Smile size={22} /></div>
                <div className="ds-card-text"><h4>CSAT + NPS</h4><p>Satisfação do cliente e experiência</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('copilot')}>
                <div className="ds-card-icon-wrap purple"><Bot size={22} /></div>
                <div className="ds-card-text"><h4>Disk Copilot IA</h4><p>IA aplicada ao atendimento com sugestões</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('bi')}>
                <div className="ds-card-icon-wrap cyan"><BarChart3 size={22} /></div>
                <div className="ds-card-text"><h4>Dashboard & BI</h4><p>Indicadores, métricas e análises em tempo real</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('predictive')}>
                <div className="ds-card-icon-wrap teal"><Brain size={22} /></div>
                <div className="ds-card-text"><h4>Analytics Preditivo</h4><p>Previsões, riscos e recomendações</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>

              <div className="ds-module-card" onClick={() => setActiveTab('workflows')}>
                <div className="ds-card-icon-wrap orange"><Workflow size={22} /></div>
                <div className="ds-card-text"><h4>Automações</h4><p>Gatilhos inteligentes e fluxos de auto-atendimento</p></div>
                <ChevronRight size={18} className="ds-card-chevron" />
              </div>
            </div>

            {/* VISÃO GERAL DA OPERAÇÃO SAC */}
            <div className="ds-section-header">
              <h2 className="ds-section-title">VISÃO GERAL DA OPERAÇÃO SAC</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <DiskKpiCard
                icon={<Ticket size={20} />}
                label="Tickets Abertos"
                value="128"
                note="-12% vs ontem"
                accent="info"
              />
              <DiskKpiCard
                icon={<Clock3 size={20} />}
                label="Atrasados (SLA)"
                value="18"
                note="+4% vs ontem"
                accent="warning"
              />
              <DiskKpiCard
                icon={<Smile size={20} />}
                label="CSAT (Hoje)"
                value="4.6/5"
                note="+0.3 vs ontem"
                accent="success"
              />
              <DiskKpiCard
                icon={<TrendingUp size={20} />}
                label="NPS (Hoje)"
                value="53+"
                note="+5 vs ontem"
                accent="success"
              />
              <DiskKpiCard
                icon={<Clock3 size={20} />}
                label="Conformidade SLA"
                value="92.4%"
                note="Meta: 90%"
                accent="sky"
              />
              <DiskKpiCard
                icon={<Shield size={20} />}
                label="P1 Ativos"
                value="3"
                note="+1 vs ontem"
                accent="danger"
              />
            </div>

            {/* ACESSOS RÁPIDOS */}
            <div className="ds-section-header">
              <h2 className="ds-section-title">ACESSOS RÁPIDOS</h2>
            </div>

            <div className="ds-quick-actions-bar">
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')}><Plus size={14} style={{ color: '#059669' }} /> Novo Ticket</button>
              <button className="ds-quick-action-pill" onClick={() => onNavigate('customer-search-hub')} style={{ background: "var(--disk-color-purple-subtle)", borderColor: "var(--disk-color-purple-border)", color: "var(--disk-color-purple-text)", fontWeight: 'bold' }}><Users size={14} style={{ color: '#7c3aed' }} /> Central de Clientes</button>
              <button className="ds-quick-action-pill" onClick={() => onNavigate('tickets-hub')}><Ticket size={14} style={{ color: '#2563eb' }} /> Ingressos & QR</button>
              <button className="ds-quick-action-pill" onClick={() => onNavigate('access-control-hub')}><ScanLine size={14} style={{ color: '#059669' }} /> Disk Acesso</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('incidents')}><AlertTriangle size={14} style={{ color: '#dc2626' }} /> Novo Incidente</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('major')}><Siren size={14} style={{ color: '#dc2626' }} /> War Room</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Disparo de broadcast de suporte')}><Radio size={14} style={{ color: '#d97706' }} /> Broadcast</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('bi')}><BarChart3 size={14} style={{ color: '#0284c7' }} /> Relatório Executivo</button>
              <button className="ds-quick-action-pill" onClick={() => notify('Exportação de relatórios gerada em Excel!')}><Download size={14} style={{ color: '#7c3aed' }} /> Exportar Dados</button>
              <button className="ds-quick-action-pill" onClick={() => setActiveTab('sla')}><SlidersHorizontal size={14} /> Configurações</button>
            </div>
          </>
        )}

        {/* ========================================================
            TELA 2: BUSCA ID (CONSULTA INTEGRADA DE CLIENTES)
            ======================================================== */}
        {activeTab === 'search360' && (
          <div className="ds-search360-container">
            <div className="ds-search360-bar">
              <Search size={22} style={{ color: '#2563eb' }} />
              <input
                className="ds-search360-input"
                type="text"
                placeholder="Buscar CPF, pedido, nome, telefone, e-mail ou ingresso..."
                value={globalSearchInput}
                onChange={e => setGlobalSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGlobalSearch()}
                autoFocus
              />
              <button className="ds-search360-btn" onClick={() => handleGlobalSearch()}>
                {searchLoading ? <RefreshCw className="spin" size={16} /> : <Search size={16} />}
                Buscar ID
              </button>
            </div>

            <div className="ds-search360-hints">
              <span>Exemplos rápidos:</span>
              <code onClick={() => { setGlobalSearchInput('123.456.789-00'); handleGlobalSearch('123.456.789-00'); }}>123.456.789-00 (CPF)</code>
              <code onClick={() => { setGlobalSearchInput('DI-984221'); handleGlobalSearch('DI-984221'); }}>DI-984221 (Pedido)</code>
              <code onClick={() => { setGlobalSearchInput('João Silva'); handleGlobalSearch('João Silva'); }}>João Silva (Nome)</code>
              <code onClick={() => { setGlobalSearchInput('(41) 99999-8888'); handleGlobalSearch('(41) 99999-8888'); }}>(41) 99999-8888 (Fone)</code>
              <code onClick={() => { setGlobalSearchInput('ING-88101'); handleGlobalSearch('ING-88101'); }}>ING-88101 (Ingresso)</code>
            </div>

            {customer360 && (
              <>
                <div className="ds-cockpit-header">
                  <div className="ds-cockpit-profile">
                    <div className="ds-cockpit-avatar">
                      {customer360.customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="ds-cockpit-name-block">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ background: '#2563eb', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>CLIENTE IDENTIFICADO</span>
                        <span style={{ background: "var(--disk-color-info-subtle)", color: '#2563eb', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', border: "1px solid var(--disk-color-info-border)" }}>Busca via {detectedType}</span>
                      </div>
                      <h2>{customer360.customer.name}</h2>
                      <p>
                        CPF: <b>{customer360.customer.cpfMasked}</b> · Fone: <b>{customer360.customer.phoneMasked}</b> · E-mail: <b>{customer360.customer.emailMasked}</b> · {customer360.customer.city}/{customer360.customer.state}
                      </p>
                    </div>
                  </div>

                  <div className="ds-cockpit-metrics">
                    <div className="ds-cockpit-metric-item">
                      <span>Pedidos</span>
                      <strong>{customer360.metrics.orders}</strong>
                    </div>
                    <div className="ds-cockpit-metric-item">
                      <span>Ingressos</span>
                      <strong>{customer360.metrics.ingressos}</strong>
                    </div>
                    <div className="ds-cockpit-metric-item">
                      <span>Total Comprado</span>
                      <strong style={{ color: '#059669' }}>R$ {customer360.metrics.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="ds-cockpit-metric-item">
                      <span>Tickets SAC</span>
                      <strong style={{ color: '#d97706' }}>{customer360.metrics.sacTickets}</strong>
                    </div>
                  </div>
                </div>

                <div className="ds-operator-actions">
                  <button className="ds-operator-btn primary" onClick={() => handleOperatorAction('OPEN_TICKET')}>
                    <MessageSquareText size={15} /> Abrir Ticket
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('SEND_WHATSAPP')}>
                    <Phone size={15} style={{ color: '#16a34a' }} /> Enviar WhatsApp
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('RESEND_EMAIL')}>
                    <Mail size={15} style={{ color: '#2563eb' }} /> Reenviar Ingresso & QR Code
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('VIEW_CHECKIN')}>
                    <ShieldCheck size={15} style={{ color: '#059669' }} /> Consultar Ingressos
                  </button>
                  <button className="ds-operator-btn" onClick={() => handleOperatorAction('REQUEST_REFUND')}>
                    <RotateCcw size={15} style={{ color: '#dc2626' }} /> Solicitar Reembolso
                  </button>
                </div>

                <div style={{ background: "var(--disk-color-purple-subtle)", border: "1px solid var(--disk-color-purple-border)", borderRadius: '14px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={18} style={{ color: '#7c3aed' }} />
                      <strong style={{ color: "var(--disk-color-purple-text)", fontSize: '14px' }}>Diagnóstico Disk Copilot IA (SAC Integrado)</strong>
                    </div>
                    <span className="ds-mini-tag purple" style={{ position: 'static' }}>96% Confiança</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4c1d95', lineHeight: 1.5 }}>
                    <b>Diagnóstico:</b> O pedido #DI-984221 está com pagamento PIX aprovado e 2 ingressos ativos (não utilizados). Houve falha na entrega do e-mail de notificação. <b>Next Best Action:</b> Clique em "Enviar WhatsApp" para disparar os vouchers atualizados com QR Code direto no celular do comprador.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><ShoppingCart size={18} style={{ color: '#2563eb' }} /> Pedidos & Ingressos</h3>
                    </div>

                    {customer360.orders.map(o => (
                      <div key={o.id} className="ds-cockpit-order">
                        <div className="ds-cockpit-order-header">
                          <div>
                            <strong>#{o.order_number}</strong>
                            <span>{o.event_name}</span>
                          </div>
                          <span className="status-pill green">{o.payment_status}</span>
                        </div>

                        <div className="ds-cockpit-order-stats">
                          <span><Ticket size={14} /> {o.ingresso_count} ingressos</span>
                          <span><WalletCards size={14} /> R$ {o.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({o.payment_method})</span>
                          <span><CheckCircle2 size={14} /> {o.checkin_count}/{o.ingresso_count} check-ins</span>
                        </div>

                        <div className="ds-cockpit-order-actions">
                          <button onClick={() => handleOperatorAction('VIEW_ORDER', o)}>Ver pedido</button>
                          <button onClick={() => handleOperatorAction('SEND_WHATSAPP')}>Enviar WhatsApp</button>
                          <button onClick={() => handleOperatorAction('RESEND_EMAIL')}>Reenviar Ingressos</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><Ticket size={18} style={{ color: '#059669' }} /> Ingressos & Validação</h3>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--disk-border-default)", color: "var(--disk-text-muted)", textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Ingresso</th>
                          <th style={{ padding: '8px' }}>Evento</th>
                          <th style={{ padding: '8px' }}>Status</th>
                          <th style={{ padding: '8px' }}>Check-in</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer360.ingressos.map(ing => (
                          <tr key={ing.id} style={{ borderBottom: "1px solid var(--disk-border-default)" }}>
                            <td style={{ padding: '8px' }}><b>{ing.ticket_code}</b></td>
                            <td style={{ padding: '8px' }}>{ing.event_name}</td>
                            <td style={{ padding: '8px' }}><span className="status-pill green">{ing.status}</span></td>
                            <td style={{ padding: '8px' }}><span style={{ color: ing.checkin_status.includes('VALIDADO') ? '#059669' : '#d97706', fontWeight: 700 }}>{ing.checkin_status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px' }}>
                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><MessageSquareText size={18} style={{ color: '#d97706' }} /> Atendimentos Anteriores</h3>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--disk-border-default)", color: "var(--disk-text-muted)", textAlign: 'left' }}>
                          <th style={{ padding: '8px' }}>Protocolo</th>
                          <th style={{ padding: '8px' }}>Assunto</th>
                          <th style={{ padding: '8px' }}>Pri.</th>
                          <th style={{ padding: '8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer360.sacTickets.map(st => (
                          <tr key={st.id} style={{ borderBottom: "1px solid var(--disk-border-default)" }}>
                            <td style={{ padding: '8px' }}><b>{st.ticket_number}</b></td>
                            <td style={{ padding: '8px' }}>{st.subject}</td>
                            <td style={{ padding: '8px' }}><span className="priority-tag P1">{st.priority}</span></td>
                            <td style={{ padding: '8px' }}><span className="status-pill green">{st.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <h3 className="ds-bi-card-title"><Clock3 size={18} style={{ color: '#7c3aed' }} /> Linha do Tempo de Interações</h3>
                    </div>

                    <div className="ds-cockpit-timeline">
                      {customer360.timeline.map(tl => (
                        <div key={tl.id} className="ds-timeline-entry">
                          <strong>{tl.title}</strong>
                          <p>{tl.description}</p>
                          <small>{tl.occurred_at}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================
            TELA 3: DASHBOARD & BI (COMPLETO DE INFORMAÇÕES & GRÁFICOS)
            ======================================================== */}
        {activeTab === 'bi' && (
          <div style={{ marginTop: '10px' }}>
            {/* 6 Scorecards com Sparklines */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon blue"><Ticket size={20} /></div><div className="ds-spark-header-text"><span>Tickets Abertos</span><div className="ds-spark-value-row"><strong className="ds-spark-value">128</strong><small className="ds-stat-delta green">-12% vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,25 Q15,5 30,20 T60,10 T90,22 L100,15" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon red"><Shield size={20} /></div><div className="ds-spark-header-text"><span>P1 Ativos</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#dc2626' }}>3</strong><small className="ds-stat-delta red">+1 vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,22 Q20,28 40,12 T70,25 T90,5 L100,18" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon orange"><Clock3 size={20} /></div><div className="ds-spark-header-text"><span>Atrasados (SLA)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#d97706' }}>18</strong><small className="ds-stat-delta orange">+4% vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,20 Q25,25 45,8 T75,22 T95,14 L100,18" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon green"><Smile size={20} /></div><div className="ds-spark-header-text"><span>CSAT (Hoje)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#059669' }}>4.6/5</strong><small className="ds-stat-delta green">+0.3 vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,24 Q20,10 40,22 T70,8 T90,16 L100,10" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon teal"><TrendingUp size={20} /></div><div className="ds-spark-header-text"><span>NPS (Hoje)</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#0d9488' }}>53</strong><small className="ds-stat-delta green">+5 vs ontem</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,22 Q25,26 50,14 T80,18 T95,6 L100,10" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
              <div className="ds-spark-card"><div className="ds-spark-top"><div className="ds-spark-icon cyan"><Clock3 size={20} /></div><div className="ds-spark-header-text"><span>SLA Médio</span><div className="ds-spark-value-row"><strong className="ds-spark-value" style={{ color: '#0891b2' }}>92.4%</strong><small className="ds-stat-delta green">Meta 90%</small></div></div></div><svg className="ds-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,26 Q20,18 45,22 T70,10 T90,8 L100,5" fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" /></svg></div>
            </div>

            {/* Linha 1: Volume de Tickets, Donut de Canais e Alertas */}
            <div className="ds-bi-row three-col" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><BarChart3 size={18} style={{ color: '#2563eb' }} /> Volume de Tickets</h3>
                  <select className="ds-filter-select"><option>Últimos 7 dias</option></select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '10px 0', borderBottom: "1px solid var(--disk-border-default)" }}>
                  {[
                    { day: '13/05', open: 280, closed: 210 },
                    { day: '14/05', open: 310, closed: 260 },
                    { day: '15/05', open: 295, closed: 245 },
                    { day: '16/05', open: 340, closed: 290 },
                    { day: '17/05', open: 260, closed: 215 },
                    { day: '18/05', open: 285, closed: 190 },
                    { day: '19/05', open: 250, closed: 180 }
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '130px' }}>
                        <div style={{ width: '12px', background: '#2563eb', height: `${(d.open / 350) * 125}px`, borderRadius: '3px 3px 0 0' }} />
                        <div style={{ width: '12px', background: '#059669', height: `${(d.closed / 350) * 125}px`, borderRadius: '3px 3px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><PieChart size={18} style={{ color: '#ea580c' }} /> Tickets por Canal</h3>
                  <select className="ds-filter-select"><option>Hoje</option></select>
                </div>
                <div className="ds-donut-wrapper">
                  <div className="ds-donut-circle-wrap">
                    <svg viewBox="0 0 36 36" style={{ width: '130px', height: '130px', transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.5" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="4.5" strokeDasharray="45.7 100" strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#ea580c" strokeWidth="4.5" strokeDasharray="18.5 100" strokeDashoffset="-45.7" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#d97706" strokeWidth="4.5" strokeDasharray="10.5 100" strokeDashoffset="-64.2" />
                    </svg>
                    <div className="ds-donut-center-text">
                      <strong>1.245</strong>
                      <small>Total</small>
                    </div>
                  </div>
                  <div className="ds-donut-legend">
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#2563eb' }} /> WhatsApp</div><strong>52%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#ea580c' }} /> Email</div><strong>21%</strong></div>
                    <div className="ds-legend-item"><div className="ds-legend-left"><span className="ds-legend-dot" style={{ background: '#d97706' }} /> Chat</div><strong>12%</strong></div>
                  </div>
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><AlertTriangle size={18} style={{ color: '#dc2626' }} /> Alertas Críticos</h3>
                  <span style={{ fontSize: '11px', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }}>Ver todos</span>
                </div>
                <div className="ds-alerts-list">
                  <div className="ds-alert-item"><div className="ds-alert-icon p1"><ShieldAlert size={16} /></div><div className="ds-alert-content"><div className="ds-alert-title-row"><span className="ds-alert-tag p1">P1</span><span className="ds-alert-title">Falha no Webhook Efí Pix</span></div><p className="ds-alert-sub">Reconciliação automática ativa</p></div><span className="ds-alert-time">Agora</span></div>
                  <div className="ds-alert-item"><div className="ds-alert-icon p1"><Clock3 size={16} /></div><div className="ds-alert-content"><div className="ds-alert-title-row"><span className="ds-alert-tag p1">P2</span><span className="ds-alert-title">3 Chamados com SLA a vencer</span></div><p className="ds-alert-sub">Fila N1 - Atribuição Pendente</p></div><span className="ds-alert-time">5 min</span></div>
                </div>
              </div>
            </div>

            {/* Linha 2: SLA Gauge, Ranking de Agentes e Categorias */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '16px' }}>
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Gauge size={18} style={{ color: '#059669' }} /> SLA Compliance</h3>
                  <span className="ds-badge green">Meta: 90%</span>
                </div>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '42px', fontWeight: 800, color: '#059669' }}>92.4%</div>
                  <p style={{ margin: '4px 0 0', color: "var(--disk-text-muted)", fontSize: '13px' }}>110 de 128 chamados resolvidos dentro do prazo</p>
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Users size={18} style={{ color: '#2563eb' }} /> Top Agentes por Conformidade</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Lucas SAC', count: 48, sla: '98.5%' },
                    { name: 'Beatriz N2', count: 36, sla: '96.2%' },
                    { name: 'Fernando Atendente', count: 28, sla: '94.0%' },
                  ].map((ag, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                      <div>
                        <strong>{ag.name}</strong>
                        <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{ag.count} chamados resolvidos</div>
                      </div>
                      <span className="ds-badge green">{ag.sla} SLA</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Tag size={18} style={{ color: '#7c3aed' }} /> Chamados por Categoria</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { cat: 'Dúvidas sobre QR Code', pct: '42%' },
                    { cat: 'Comprovante Meia-Entrada', pct: '28%' },
                    { cat: 'Cancelamento & Reembolso', pct: '18%' },
                    { cat: 'Alteração Cadastral', pct: '12%' },
                  ].map((ct, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: "var(--disk-text-secondary)" }}>{ct.cat}</span>
                      <strong style={{ color: "var(--disk-text-primary)" }}>{ct.pct}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            TELA 4: TICKETS (CENTRAL COMPLETA DE ATENDIMENTO)
            ======================================================== */}
        {activeTab === 'tickets' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-sub-toolbar">
              <div className="ds-filter-tabs">
                <button className={`ds-filter-tab-btn ${ticketFilter === 'TODOS' ? 'active' : ''}`} onClick={() => setTicketFilter('TODOS')}>
                  Todos <span className="badge-pill">5</span>
                </button>
                <button className={`ds-filter-tab-btn ${ticketFilter === 'P1' ? 'active' : ''}`} onClick={() => setTicketFilter('P1')}>
                  P1 Críticos <span className="badge-pill" style={{ color: '#dc2626' }}>2</span>
                </button>
                <button className={`ds-filter-tab-btn ${ticketFilter === 'ABERTOS' ? 'active' : ''}`} onClick={() => setTicketFilter('ABERTOS')}>
                  Em Aberto <span className="badge-pill">3</span>
                </button>
                <button className={`ds-filter-tab-btn ${ticketFilter === 'ATRASADOS' ? 'active' : ''}`} onClick={() => setTicketFilter('ATRASADOS')}>
                  Atrasados SLA <span className="badge-pill" style={{ color: '#d97706' }}>1</span>
                </button>
                <button className={`ds-filter-tab-btn ${ticketFilter === 'RESOLVIDOS' ? 'active' : ''}`} onClick={() => setTicketFilter('RESOLVIDOS')}>
                  Resolvidos <span className="badge-pill">1</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="ds-quick-action-pill" onClick={() => setActiveTab('new')} style={{ background: '#2563eb', color: '#fff', border: 0 }}>
                  <Plus size={14} /> Novo Chamado
                </button>
                <button className="ds-quick-action-pill" onClick={() => notify('Exportação de tickets concluída')}>
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
            </div>

            <div className="ds-data-table-wrap">
              <table className="ds-data-table">
                <thead>
                  <tr>
                    <th>Protocolo</th>
                    <th>Cliente / Solicitante</th>
                    <th>Canal</th>
                    <th>Assunto</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>Atribuído</th>
                    <th>SLA Restante</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTicketsList
                    .filter(t => {
                      if (ticketFilter === 'P1') return t.priority === 'P1'
                      if (ticketFilter === 'ABERTOS') return t.status === 'EM_ABERTO' || t.status === 'EM_ATENDIMENTO'
                      if (ticketFilter === 'ATRASADOS') return t.status === 'ATRASADO'
                      if (ticketFilter === 'RESOLVIDOS') return t.status === 'RESOLVIDO'
                      return true
                    })
                    .map(t => (
                      <tr key={t.id}>
                        <td><strong>{t.code}</strong></td>
                        <td>
                          <b>{t.customer}</b>
                          <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{t.event}</div>
                        </td>
                        <td>
                          <span className="ds-badge blue">{t.channel}</span>
                        </td>
                        <td>{t.subject}</td>
                        <td>
                          <span className={`ds-badge ${t.priority === 'P1' ? 'red' : t.priority === 'P2' ? 'yellow' : 'blue'}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`ds-badge ${t.status === 'RESOLVIDO' ? 'green' : t.status === 'ATRASADO' ? 'red' : 'yellow'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>{t.agent}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: t.slaDue.includes('Atrasado') ? '#dc2626' : '#059669' }}>
                            {t.slaDue}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => {
                                setGlobalSearchInput(t.customer)
                                handleGlobalSearch(t.customer)
                              }}
                              className="ds-operator-btn"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              <Search size={12} /> 360º
                            </button>
                            <button
                              onClick={() => notify(`Chamado ${t.code} resolvido e notificação enviada para ${t.customer}!`)}
                              className="ds-operator-btn"
                              style={{ padding: '4px 8px', fontSize: '11px', background: "var(--disk-color-success-subtle)", color: '#059669', borderColor: "var(--disk-color-success-border)" }}
                            >
                              <Check size={12} /> Resolver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 5: OMNICHANNEL INBOX (WHATSAPP, EMAIL, CHAT)
            ======================================================== */}
        {activeTab === 'inbox' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-inbox-grid">
              
              {/* Painel 1: Lista de Conversas */}
              <div className="ds-inbox-conversations-panel">
                <div style={{ padding: '14px 16px', borderBottom: "1px solid var(--disk-border-default)", background: "var(--disk-bg-muted)" }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>Caixa de Entrada Omnichannel</strong>
                    <span className="ds-badge blue">4 ativas</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Filtrar conversas..."
                    style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '6px 10px', fontSize: '12px' }}
                  />
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {mockConversations.map(c => (
                    <div
                      key={c.id}
                      className={`ds-conv-item ${selectedConv.id === c.id ? 'active' : ''}`}
                      onClick={() => setSelectedConv(c)}
                    >
                      <div className="ds-conv-top">
                        <span className="ds-conv-name">
                          {c.channel === 'WhatsApp' ? <Phone size={13} style={{ color: '#16a34a' }} /> : <Mail size={13} style={{ color: '#2563eb' }} />}
                          {c.customer}
                        </span>
                        <small style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{c.time}</small>
                      </div>
                      <span className="ds-conv-preview">{c.lastMsg}</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>{c.phone}</span>
                        {c.unread > 0 && <span className="ds-badge-count-pill" style={{ position: 'static' }}>{c.unread}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Painel 2: Chat / Histórico de Mensagens */}
              <div className="ds-inbox-chat-panel">
                <div style={{ padding: '14px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: "var(--disk-bg-surface)" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', color: "var(--disk-text-primary)" }}>{selectedConv.customer}</h3>
                    <span style={{ fontSize: '12px', color: "var(--disk-text-muted)" }}>Canal: {selectedConv.channel} ({selectedConv.phone})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setGlobalSearchInput(selectedConv.customer)
                        handleGlobalSearch(selectedConv.customer)
                      }}
                      className="ds-operator-btn"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <Search size={13} /> Abrir Busca ID
                    </button>
                    <button
                      onClick={() => setActiveTab('new')}
                      className="ds-operator-btn primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      <Ticket size={13} /> Converter em Ticket
                    </button>
                  </div>
                </div>

                <div className="ds-chat-messages-area">
                  <div className="ds-chat-bubble customer">
                    <strong>{selectedConv.customer}</strong>
                    <p style={{ margin: '4px 0 0' }}>{selectedConv.lastMsg}</p>
                    <small style={{ fontSize: '10px', color: "var(--disk-text-muted)", display: 'block', marginTop: '4px' }}>10:48 • Recebido via {selectedConv.channel}</small>
                  </div>

                  <div className="ds-chat-bubble agent">
                    <strong>Atendente Lucas (Disk Service)</strong>
                    <p style={{ margin: '4px 0 0' }}>Olá {selectedConv.customer}! Identificamos seu pedido #DI-984221 com pagamento aprovado. Estou reenviando o voucher e QR Code em PDF diretamente por aqui!</p>
                    <small style={{ fontSize: '10px', color: '#bfdbfe', display: 'block', marginTop: '4px' }}>10:49 • Entregue e Lido ✓✓</small>
                  </div>
                </div>

                <div className="ds-chat-input-bar">
                  <button className="ds-icon-btn" onClick={() => notify('Voucher PDF anexado com sucesso!')}>
                    <Paperclip size={16} />
                  </button>
                  <input
                    className="ds-chat-input"
                    type="text"
                    placeholder="Digite a resposta ou use modelos rápidos..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        notify(`Mensagem enviada com sucesso no canal ${selectedConv.channel}!`)
                        setChatInput('')
                      }
                    }}
                  />
                  <button
                    className="ds-search360-btn"
                    onClick={() => {
                      if (chatInput.trim()) {
                        notify(`Mensagem enviada com sucesso no canal ${selectedConv.channel}!`)
                        setChatInput('')
                      }
                    }}
                  >
                    <SendHorizontal size={15} /> Enviar
                  </button>
                </div>
              </div>

              {/* Painel 3: Contexto 360 Lateral */}
              <div className="ds-inbox-context-panel">
                <div style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 800, textTransform: 'uppercase' }}>Perfil do Solicitante</span>
                  <h4 style={{ margin: '4px 0 2px', fontSize: '16px', color: "var(--disk-text-primary)" }}>{selectedConv.customer}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: "var(--disk-text-muted)" }}>Cliente desde 2024 • 3 pedidos • VIP</p>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 800, textTransform: 'uppercase' }}>Modelos Rápidos de Resposta</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    <button
                      onClick={() => setChatInput('Olá! Seu pedido já está aprovado e os ingressos estão disponíveis no app Disk Ingressos.')}
                      className="ds-operator-btn"
                      style={{ fontSize: '11px', padding: '6px 10px', textAlign: 'left' }}
                    >
                      🎟️ Confirmar Ingressos
                    </button>
                    <button
                      onClick={() => setChatInput('Seu estorno foi solicitado junto ao gateway Pix e será creditado em até 24h.')}
                      className="ds-operator-btn"
                      style={{ fontSize: '11px', padding: '6px 10px', textAlign: 'left' }}
                    >
                      💰 Informar Reembolso
                    </button>
                    <button
                      onClick={() => setChatInput('Olá! Segue a orientação detalhada sobre as regras de documentação para meia-entrada.')}
                      className="ds-operator-btn"
                      style={{ fontSize: '11px', padding: '6px 10px', textAlign: 'left' }}
                    >
                      📄 Regras Meia-Entrada
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TELA 6: GESTÃO DE INCIDENTES (ITIL INCIDENT MANAGEMENT)
            ======================================================== */}
        {activeTab === 'incidents' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-sub-toolbar">
              <div className="ds-filter-tabs">
                <button className="ds-filter-tab-btn active">Incidentes Ativos <span className="badge-pill">3</span></button>
                <button className="ds-filter-tab-btn">P1 Críticos <span className="badge-pill" style={{ color: '#dc2626' }}>1</span></button>
                <button className="ds-filter-tab-btn">Histórico Resolvidos</button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="ds-quick-action-pill" onClick={() => notify('Formulário de abertura de Incidente')} style={{ background: '#dc2626', color: '#fff', border: 0 }}>
                  <AlertTriangle size={14} /> Registrar Incidente
                </button>
                <button className="ds-quick-action-pill" onClick={() => setActiveTab('major')}>
                  <Siren size={14} style={{ color: '#dc2626' }} /> War Room P1
                </button>
              </div>
            </div>

            <div className="ds-data-table-wrap">
              <table className="ds-data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Incidente</th>
                    <th>Prioridade</th>
                    <th>Serviço Afetado</th>
                    <th>Impacto</th>
                    <th>Tickets Vinculados</th>
                    <th>Status</th>
                    <th>Início</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {mockIncidents.map(inc => (
                    <tr key={inc.id}>
                      <td><strong>{inc.code}</strong></td>
                      <td><b>{inc.title}</b></td>
                      <td><span className={`ds-badge ${inc.priority === 'P1' ? 'red' : 'yellow'}`}>{inc.priority}</span></td>
                      <td><code>{inc.affected}</code></td>
                      <td>{inc.impact}</td>
                      <td><span className="ds-badge blue">{inc.ticketsLinked} chamados</span></td>
                      <td><span className={`ds-badge ${inc.status === 'RESOLVIDO' ? 'green' : 'red'}`}>{inc.status}</span></td>
                      <td>{inc.startedAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => notify(`Broadcast push emitido para os ${inc.ticketsLinked} clientes afetados pelo incidente ${inc.code}!`)} className="ds-operator-btn" style={{ padding: '4px 8px', fontSize: '11px' }}>
                            <Radio size={12} /> Broadcast
                          </button>
                          <button onClick={() => notify(`Incidente ${inc.code} marcado como RESOLVIDO!`)} className="ds-operator-btn" style={{ padding: '4px 8px', fontSize: '11px', background: "var(--disk-color-success-subtle)", color: '#059669', borderColor: "var(--disk-color-success-border)" }}>
                            <Check size={12} /> Resolver
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 7: MAJOR INCIDENTS & WAR ROOM P1 (COMMAND CENTER)
            ======================================================== */}
        {activeTab === 'major' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-warroom-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="ds-warroom-commander-tag">WAR ROOM P1 ATIVA</span>
                  <span className="ds-badge red">INCIDENT COMMANDER: Fernando SAC</span>
                </div>
                <h2 style={{ margin: 0, fontSize: '20px', color: "var(--disk-text-primary)" }}>INC-2026-089 — Instabilidade no Gateway Efí Pix</h2>
                <p style={{ margin: '4px 0 0', color: "var(--disk-text-muted)", fontSize: '13px' }}>
                  Impacto estimado: 3.420 compradores • R$ 48.200 em transações com callback atrasado
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 800, textTransform: 'uppercase' }}>Tempo em Downtime</span>
                  <div className="ds-warroom-timer">00:42:15</div>
                </div>
                <button
                  onClick={() => notify('War Room encerrada e relatório post-mortem gerado!')}
                  className="ds-search360-btn"
                  style={{ background: '#059669' }}
                >
                  <CheckCircle2 size={16} /> Encerrar War Room
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Terminal size={18} style={{ color: '#dc2626' }} /> Linha de Comando & Timeline Técnica</h3>
                </div>
                <div className="ds-cockpit-timeline">
                  <div className="ds-timeline-entry">
                    <strong>10:12 — Alerta Automático Z-Score Disparado</strong>
                    <p>Detectada queda de 45% nas confirmações de Pix no gateway Efí.</p>
                  </div>
                  <div className="ds-timeline-entry">
                    <strong>10:15 — Incident Commander Assumiu a Ponte</strong>
                    <p>Fernando SAC escalonou Engenharia N3 e gateway vendor.</p>
                  </div>
                  <div className="ds-timeline-entry">
                    <strong>10:28 — Fallback Ativado para Polling Manual</strong>
                    <p>Serviço de reconciliação de pagamentos processou 210 pedidos pendentes.</p>
                  </div>
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Users size={18} style={{ color: '#2563eb' }} /> Equipe de Resposta & Comitê</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <span><b>Incident Commander:</b> Fernando SAC</span>
                    <span className="ds-badge green">Online</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <span><b>Tech Lead:</b> Vinicius Casagrande (Eng)</span>
                    <span className="ds-badge green">Online</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <span><b>Comunicação Solicitantes:</b> Lucas Atendente</span>
                    <span className="ds-badge blue">Emitindo Broadcast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 8: GESTÃO DE PROBLEMAS & RCA (PROBLEM MANAGEMENT)
            ======================================================== */}
        {activeTab === 'problems' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-sub-toolbar">
              <div className="ds-filter-tabs">
                <button className="ds-filter-tab-btn active">Problemas Conhecidos (KEDB) <span className="badge-pill">2</span></button>
                <button className="ds-filter-tab-btn">Em Investigação RCA</button>
                <button className="ds-filter-tab-btn">Planos Corretivos Concluídos</button>
              </div>

              <button className="ds-quick-action-pill" onClick={() => notify('Abertura de nova Investigação de Problema')} style={{ background: '#7c3aed', color: '#fff', border: 0 }}>
                <Plus size={14} /> Novo Problem (RCA)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {mockProblems.map(p => (
                <div key={p.id} className="ds-bi-card">
                  <div className="ds-bi-card-header">
                    <div>
                      <span className="ds-badge purple" style={{ marginBottom: '4px' }}>{p.code}</span>
                      <h3 className="ds-bi-card-title">{p.title}</h3>
                    </div>
                    <span className="ds-badge green">{p.status}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: "var(--disk-text-secondary)", display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div style={{ background: "var(--disk-bg-muted)", padding: '10px 12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                      <strong style={{ color: '#dc2626', display: 'block', marginBottom: '2px' }}>🔍 Causa Raiz (RCA):</strong>
                      {p.rootCause}
                    </div>

                    <div style={{ background: "var(--disk-color-info-subtle)", padding: '10px 12px', borderRadius: '8px', border: "1px solid var(--disk-color-info-border)" }}>
                      <strong style={{ color: '#2563eb', display: 'block', marginBottom: '2px' }}>⚡ Contorno Provisório (Workaround):</strong>
                      {p.workaround}
                    </div>

                    <div style={{ background: "var(--disk-color-success-subtle)", padding: '10px 12px', borderRadius: '8px', border: "1px solid var(--disk-color-success-border)" }}>
                      <strong style={{ color: '#059669', display: 'block', marginBottom: '2px' }}>🛠️ Plano de Ação Definitivo:</strong>
                      {p.actionPlan}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: "1px solid var(--disk-border-default)" }}>
                    <button onClick={() => notify(`Workaround de ${p.code} publicado na Base de Conhecimento!`)} className="ds-operator-btn" style={{ fontSize: '11px', padding: '6px 12px' }}>
                      <BookOpen size={12} /> Publicar na Base
                    </button>
                    <button onClick={() => notify(`Plano de Ação de ${p.code} validado!`)} className="ds-operator-btn primary" style={{ fontSize: '11px', padding: '6px 12px' }}>
                      <CheckCircle2 size={12} /> Concluir Fix
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 9: BASE DE CONHECIMENTO (KNOWLEDGE BASE & KEDB)
            ======================================================== */}
        {activeTab === 'knowledge' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-sub-toolbar">
              <div className="ds-filter-tabs">
                {['TODAS', 'Ingressos & Vouchers', 'Meia-Entrada', 'Pagamentos & Reembolso'].map(cat => (
                  <button
                    key={cat}
                    className={`ds-filter-tab-btn ${selectedKnowledgeCat === cat ? 'active' : ''}`}
                    onClick={() => setSelectedKnowledgeCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button className="ds-quick-action-pill" onClick={() => notify('Novo artigo criado na Base de Conhecimento!')} style={{ background: '#2563eb', color: '#fff', border: 0 }}>
                <Plus size={14} /> Novo Artigo
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              {mockKnowledge
                .filter(k => selectedKnowledgeCat === 'TODAS' || k.category === selectedKnowledgeCat)
                .map(k => (
                  <div key={k.id} className="ds-bi-card">
                    <div className="ds-bi-card-header">
                      <div>
                        <span className="ds-badge blue" style={{ marginBottom: '4px' }}>{k.category}</span>
                        <h3 className="ds-bi-card-title">{k.title}</h3>
                      </div>
                      <small style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{k.views} views</small>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', margin: '10px 0', flexWrap: 'wrap' }}>
                      {k.tags.map(tag => (
                        <span key={tag} style={{ background: "var(--disk-bg-muted)", color: "var(--disk-text-secondary)", fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: "1px solid var(--disk-border-default)" }}>
                      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: "var(--disk-text-muted)" }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsUp size={13} style={{ color: '#059669' }} /> {k.helpful}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ThumbsDown size={13} style={{ color: '#dc2626' }} /> {k.unhelpful}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => notify(`Solução copiada para a área de transferência!`)} className="ds-operator-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>
                          <Copy size={12} /> Copiar Resposta
                        </button>
                        <button onClick={() => notify(`Artigo aberto para edição!`)} className="ds-operator-btn primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                          <ExternalLink size={12} /> Ler Artigo
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 10: CSAT + NPS (VOICE OF CUSTOMER & DETRACTOR RECOVERY)
            ======================================================== */}
        {activeTab === 'csat' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-stats-strip">
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Smile size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">CSAT Geral</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#059669' }}>4.6 / 5.0</span><span className="ds-stat-delta green">92% Positivo</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><TrendingUp size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">NPS Score</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#059669' }}>+53</span><span className="ds-stat-delta green">Zona de Excelência</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Award size={20} style={{ color: '#0284c7' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Promotores</span><div className="ds-stat-val-row"><span className="ds-stat-val">68%</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Users size={20} style={{ color: '#d97706' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Neutros</span><div className="ds-stat-val-row"><span className="ds-stat-val">21%</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><AlertOctagon size={20} style={{ color: '#dc2626' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Detratores</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#dc2626' }}>11%</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><RotateCcw size={20} style={{ color: '#7c3aed' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Taxa Recuperação</span><div className="ds-stat-val-row"><span className="ds-stat-val">84%</span></div></div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><MessageSquareText size={18} style={{ color: '#059669' }} /> Últimas Avaliações Recebidas dos Compradores</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { name: 'Gabriel S.', score: 5, comment: 'Atendimento muito rápido no WhatsApp! O Lucas resolveu meu voucher em 2 minutos.', time: 'Há 12 min', tag: 'POSITIVO' },
                    { name: 'Letícia R.', score: 4, comment: 'Tudo certo com o ingresso, apenas achei o app um pouco lento no primeiro login.', time: 'Há 35 min', tag: 'NEUTRO' },
                    { name: 'Marcos V.', score: 1, comment: 'Fiquei com dúvida sobre documentação de meia-entrada e precisei de ajuda.', time: 'Há 1h', tag: 'DETRATOR' },
                  ].map((feed, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: "var(--disk-bg-muted)", borderRadius: '10px', border: "1px solid var(--disk-border-default)" }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{feed.name}</strong>
                          <span style={{ marginLeft: '8px', color: '#d97706', fontWeight: 800 }}>{'★'.repeat(feed.score)}{'☆'.repeat(5 - feed.score)}</span>
                        </div>
                        <span className={`ds-badge ${feed.tag === 'POSITIVO' ? 'green' : feed.tag === 'NEUTRO' ? 'yellow' : 'red'}`}>{feed.tag}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '13px', color: "var(--disk-text-secondary)" }}>"{feed.comment}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <small style={{ color: "var(--disk-text-muted)" }}>{feed.time}</small>
                        {feed.tag === 'DETRATOR' && (
                          <button onClick={() => notify(`Chamado de recuperação imediata aberto para ${feed.name}!`)} className="ds-operator-btn" style={{ padding: '2px 8px', fontSize: '11px', background: "var(--disk-color-danger-subtle)", color: '#dc2626', borderColor: "var(--disk-color-danger-border)" }}>
                            <RotateCcw size={11} /> Abrir Loop de Recuperação
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Workflow size={18} style={{ color: '#2563eb' }} /> Configurações de Pesquisa de Satisfação</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <div><strong>Disparo automático pós-resolução</strong><p style={{ margin: 0, fontSize: '11px', color: "var(--disk-text-muted)" }}>Enviar CSAT via WhatsApp 5 minutos após fechar o chamado</p></div>
                    <span className="ds-badge green">Ativo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <div><strong>Alerta imediato para Detratores (1 e 2 estrelas)</strong><p style={{ margin: 0, fontSize: '11px', color: "var(--disk-text-muted)" }}>Criar ticket com prioridade P2 para a equipe de qualidade</p></div>
                    <span className="ds-badge green">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 11: DISK COPILOT IA (INTELIGÊNCIA ARTIFICIAL)
            ======================================================== */}
        {activeTab === 'copilot' && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)', border: "1px solid var(--disk-color-purple-border)", borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#7c3aed', color: '#fff', display: 'grid', placeItems: 'center' }}>
                    <Bot size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#4c1d95' }}>Disk Copilot IA — Inteligência Ativa no SAC</h2>
                    <p style={{ margin: 0, fontSize: '13px', color: "var(--disk-color-purple-text)" }}>Conectado a Tickets + Pedidos + Clientes + KEDB + Incidentes</p>
                  </div>
                </div>
                <span className="ds-badge purple" style={{ fontSize: '13px', padding: '6px 12px' }}>Modelo Ativo: GPT-4o Optimized</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Sparkles size={18} style={{ color: '#7c3aed' }} /> Next Best Action Recomendações em Tempo Real</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: "var(--disk-text-primary)" }}>Sugestão: Reenvio Automático de QR Code</strong>
                      <span className="ds-badge green">96% Confiança</span>
                    </div>
                    <p style={{ margin: '4px 0 8px', fontSize: '12px', color: "var(--disk-text-muted)" }}>Aplicável para 4 clientes que entraram em contato com dúvida sobre recebimento de e-mail.</p>
                    <button onClick={() => notify('Recomendação do Copilot aplicada para todos os 4 chamados em lote!')} className="ds-operator-btn primary" style={{ fontSize: '11px', padding: '4px 10px' }}>
                      Aplicar em Lote (4)
                    </button>
                  </div>

                  <div style={{ background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '10px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong style={{ color: "var(--disk-text-primary)" }}>Sugestão: Resposta Padrão sobre Regras de Meia-Entrada</strong>
                      <span className="ds-badge yellow">92% Confiança</span>
                    </div>
                    <p style={{ margin: '4px 0 8px', fontSize: '12px', color: "var(--disk-text-muted)" }}>Aplicar modelo explicativo da Lei Federal 12.933/2013 e DNE para 3 chamados pendentes.</p>
                    <button onClick={() => notify('Modelo de Meia-Entrada enviado aos chamados!')} className="ds-operator-btn" style={{ fontSize: '11px', padding: '4px 10px' }}>
                      Aplicar Resposta
                    </button>
                  </div>
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><SlidersHorizontal size={18} style={{ color: '#2563eb' }} /> Parâmetros de Confiança e Ações Autônomas</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <div><strong>Auto-Resposta com Confiança &gt; 95%</strong><p style={{ margin: 0, fontSize: '11px', color: "var(--disk-text-muted)" }}>Enviar resposta sem intervenção humana para dúvidas comuns</p></div>
                    <span className="ds-badge green">Habilitado</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <div><strong>Análise de Sentimento em Tempo Real</strong><p style={{ margin: 0, fontSize: '11px', color: "var(--disk-text-muted)" }}>Priorizar automaticamente clientes irritados para nível P1</p></div>
                    <span className="ds-badge green">Habilitado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 12: SLA & CONFORMIDADE (ITIL SLA POLICIES)
            ======================================================== */}
        {activeTab === 'sla' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-stats-strip">
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Gauge size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Conformidade SLA</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#059669' }}>92.4%</span><span className="ds-stat-delta green">Meta: 90%</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Clock3 size={20} style={{ color: '#0284c7' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Primeira Resposta (FRT)</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#0284c7' }}>2h 38m</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><CheckCheck size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Tempo Resolução (MTTR)</span><div className="ds-stat-val-row"><span className="ds-stat-val">8h 41m</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><AlertTriangle size={20} style={{ color: '#d97706' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Em Risco de Quebra</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#d97706' }}>3</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><CheckCircle2 size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Dentro do Prazo</span><div className="ds-stat-val-row"><span className="ds-stat-val">110</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><XCircle size={20} style={{ color: '#dc2626' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Violados Hoje</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#dc2626' }}>18</span></div></div></div>
            </div>

            <div className="ds-data-table-wrap" style={{ marginTop: '16px' }}>
              <div style={{ padding: '16px', borderBottom: "1px solid var(--disk-border-default)", background: "var(--disk-bg-muted)" }}>
                <strong style={{ fontSize: '15px', color: "var(--disk-text-primary)" }}>Matriz de Políticas de SLA por Prioridade (ITIL)</strong>
              </div>
              <table className="ds-data-table">
                <thead>
                  <tr>
                    <th>Prioridade</th>
                    <th>Meta 1ª Resposta (FRT)</th>
                    <th>Meta Solução (MTTR)</th>
                    <th>Horário Contabilizado</th>
                    <th>Escalonamento Automático</th>
                    <th>Conformidade Atual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="ds-badge red">P1 — Crítico</span></td>
                    <td><b>15 minutos</b></td>
                    <td><b>2 horas</b></td>
                    <td>24/7 (Ininterrupto)</td>
                    <td>Após 10m sem aceite $\to$ Incident Commander</td>
                    <td><span className="ds-badge green">95.2%</span></td>
                  </tr>
                  <tr>
                    <td><span className="ds-badge yellow">P2 — Alto</span></td>
                    <td><b>1 hora</b></td>
                    <td><b>8 horas</b></td>
                    <td>Comercial</td>
                    <td>Após 45m $\to$ Fila N2 Sênior</td>
                    <td><span className="ds-badge green">91.8%</span></td>
                  </tr>
                  <tr>
                    <td><span className="ds-badge blue">P3 — Médio</span></td>
                    <td><b>4 horas</b></td>
                    <td><b>24 horas</b></td>
                    <td>08:00 às 20:00</td>
                    <td>Após 3h $\to$ Fila Geral N1</td>
                    <td><span className="ds-badge green">93.4%</span></td>
                  </tr>
                  <tr>
                    <td><span className="ds-badge purple">P4 — Baixo</span></td>
                    <td><b>8 horas</b></td>
                    <td><b>48 horas</b></td>
                    <td>Dias úteis</td>
                    <td>Fila padrão</td>
                    <td><span className="ds-badge green">96.0%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 13: FILAS & AGENTES (ROUTING & CAPACITY)
            ======================================================== */}
        {activeTab === 'teams' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-sub-toolbar">
              <div className="ds-filter-tabs">
                <button className="ds-filter-tab-btn active">Visão de Filas Ativas <span className="badge-pill">3</span></button>
                <button className="ds-filter-tab-btn">Agentes & Capacidade <span className="badge-pill">8 online</span></button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: "var(--disk-text-secondary)", fontWeight: 600 }}>Roteamento Round-Robin Automático:</span>
                <button
                  onClick={() => {
                    setAutoRouting(!autoRouting)
                    notify(`Roteamento automático ${!autoRouting ? 'ATIVADO' : 'DESATIVADO'}!`)
                  }}
                  className={`ds-badge ${autoRouting ? 'green' : 'red'}`}
                  style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }}
                >
                  {autoRouting ? '● ATIVADO' : '○ DESATIVADO'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
              {[
                { name: 'Fila N1 — SAC Geral & Dúvidas', tickets: 18, wait: '4 min', agents: 4, lead: 'Lucas SAC', color: '#2563eb' },
                { name: 'Fila N2 — Financeiro & Reembolsos', tickets: 6, wait: '14 min', agents: 2, lead: 'Beatriz N2', color: '#7c3aed' },
                { name: 'Fila N3 — Casos Complexos & Ouvidoria', tickets: 3, wait: '8 min', agents: 2, lead: 'Fernando SAC', color: '#dc2626' },
              ].map((q, i) => (
                <div key={i} className="ds-bi-card">
                  <div className="ds-bi-card-header">
                    <h3 className="ds-bi-card-title">{q.name}</h3>
                    <span className="ds-badge blue">{q.tickets} chamados</span>
                  </div>

                  <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: "var(--disk-text-muted)" }}>Tempo Médio de Espera:</span>
                      <strong>{q.wait}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: "var(--disk-text-muted)" }}>Atendentes Escalados:</span>
                      <strong>{q.agents} ativos</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: "var(--disk-text-muted)" }}>Supervisor da Fila:</span>
                      <strong>{q.lead}</strong>
                    </div>
                  </div>

                  <button onClick={() => notify(`Carga rebalanceada na ${q.name}!`)} className="ds-operator-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
                    <ArrowRightLeft size={13} /> Rebalancear Carga
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 14: ANALYTICS PREDITIVO (FORECAST & ANOMALIAS)
            ======================================================== */}
        {activeTab === 'predictive' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-stats-strip">
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Brain size={20} style={{ color: '#7c3aed' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Previsão 7 Dias</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#7c3aed' }}>584</span><span className="ds-stat-delta green">±4% Erro MAPE</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><AlertTriangle size={20} style={{ color: '#d97706' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Risco Sobrecarga</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#d97706' }}>Moderado</span><span className="ds-stat-delta orange">Fila N1 Sexta-feira</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><Activity size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Detecção Z-Score</span><div className="ds-stat-val-row"><span className="ds-stat-val" style={{ color: '#059669' }}>Normal</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><TrendingUp size={20} style={{ color: '#0284c7' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Pico Estimado</span><div className="ds-stat-val-row"><span className="ds-stat-val">19/05 (18:00)</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><CheckCircle2 size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">Melhorias CSI Ativas</span><div className="ds-stat-val-row"><span className="ds-stat-val">4</span></div></div></div>
              <div className="ds-stat-card"><div className="ds-stat-icon-wrap"><ShieldCheck size={20} style={{ color: '#059669' }} /></div><div className="ds-stat-content"><span className="ds-stat-label">SLA Preventivo</span><div className="ds-stat-val-row"><span className="ds-stat-val">94.8%</span></div></div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><LineChart size={18} style={{ color: '#2563eb' }} /> Previsão de Demanda de Chamados (7 Dias)</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', padding: '10px 0', borderBottom: "1px solid var(--disk-border-default)" }}>
                  {[
                    { day: 'Hoje', count: 95, color: '#2563eb' },
                    { day: 'Amanhã', count: 82, color: '#2563eb' },
                    { day: 'Quinta', count: 110, color: '#2563eb' },
                    { day: 'Sexta (Pico)', count: 185, color: '#dc2626' },
                    { day: 'Sábado', count: 140, color: '#d97706' },
                    { day: 'Domingo', count: 62, color: '#2563eb' },
                    { day: 'Segunda', count: 70, color: '#2563eb' },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: d.color }}>{d.count}</span>
                      <div style={{ width: '18px', background: d.color, height: `${(d.count / 200) * 120}px`, borderRadius: '4px 4px 0 0' }} />
                      <span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ds-bi-card">
                <div className="ds-bi-card-header">
                  <h3 className="ds-bi-card-title"><Target size={18} style={{ color: '#059669' }} /> Backlog de Melhoria Contínua (CSI / PDCA)</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <strong>CSI-01: Redução de 22% nas dúvidas sobre meia-entrada</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>Banner informativo adicionado no checkout durante a seleção de lote.</p>
                  </div>
                  <div style={{ padding: '10px 12px', background: "var(--disk-bg-muted)", borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                    <strong>CSI-02: Auto-reparo de Webhooks Pix atrasados</strong>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>Job cron a cada 2 minutos consultando transações pendentes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 15: AUTOMAÇÕES & WORKFLOWS
            ======================================================== */}
        {activeTab === 'workflows' && (
          <div style={{ marginTop: '10px' }}>
            <div className="ds-sub-toolbar">
              <div className="ds-filter-tabs">
                <button className="ds-filter-tab-btn active">Gatilhos Ativos <span className="badge-pill">4</span></button>
                <button className="ds-filter-tab-btn">Histórico de Execuções (1.420 hoje)</button>
              </div>

              <button className="ds-quick-action-pill" onClick={() => notify('Assistente de criação de novo workflow iniciado!')} style={{ background: '#2563eb', color: '#fff', border: 0 }}>
                <Plus size={14} /> Novo Workflow
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { title: 'Reenvio de QR Code após Falha de E-mail', trigger: 'Gatilho: Bounce / Falha SES no envio de voucher', action: 'Ação: Disparar mensagem WhatsApp com PDF e QR Code em 30s', runs: 342, status: true },
                { title: 'Escalonamento Automático de Chamados P1', trigger: 'Gatilho: Chamado P1 sem primeira resposta em 15 minutos', action: 'Ação: Alerta push no Slack + Atribuir para Incident Commander', runs: 8, status: true },
                { title: 'Disparo de Pesquisa CSAT Pós-Resolução', trigger: 'Gatilho: Status do ticket alterado para RESOLVIDO', action: 'Ação: Enviar enquete de 1 a 5 estrelas no WhatsApp após 5 min', runs: 890, status: true },
                { title: 'Loop de Recuperação de Cliente Detrator', trigger: 'Gatilho: Avaliação CSAT recebida com nota 1 ou 2', action: 'Ação: Abrir ticket P2 com tag [RECOVERY] para supervisão', runs: 12, status: true },
              ].map((wf, i) => (
                <div key={i} className="ds-bi-card">
                  <div className="ds-bi-card-header">
                    <h3 className="ds-bi-card-title">{wf.title}</h3>
                    <span className={`ds-badge ${wf.status ? 'green' : 'red'}`}>{wf.status ? 'Ativo' : 'Inativo'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '12px 0', fontSize: '13px' }}>
                    <div style={{ background: "var(--disk-bg-muted)", padding: '8px 12px', borderRadius: '6px', border: "1px solid var(--disk-border-default)" }}>
                      <span style={{ color: '#2563eb', fontWeight: 700 }}>⚡ {wf.trigger}</span>
                    </div>
                    <div style={{ background: "var(--disk-color-success-subtle)", padding: '8px 12px', borderRadius: '6px', border: "1px solid var(--disk-color-success-border)" }}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>🎯 {wf.action}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: "1px solid var(--disk-border-default)" }}>
                    <small style={{ color: "var(--disk-text-muted)" }}>Executado <b>{wf.runs} vezes</b> hoje</small>
                    <button onClick={() => notify(`Workflow "${wf.title}" testado com sucesso!`)} className="ds-operator-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      <Play size={12} /> Testar Regra
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TELA 16: NOVO TICKET / CHAMADO (PROTOCOLO)
            ======================================================== */}
        {activeTab === 'new' && (
          <div style={{ marginTop: '10px' }}>
            <button className="ds-quick-action-pill" onClick={() => setActiveTab('tickets')} style={{ marginBottom: '16px' }}>
              <ChevronLeft size={16} /> Voltar aos Tickets
            </button>

            <form
              onSubmit={e => {
                e.preventDefault()
                notify('Novo chamado protocolado com sucesso sob protocolo #DS-2026-984222!')
                setActiveTab('tickets')
              }}
              style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '14px', padding: '24px', maxWidth: '800px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
            >
              <h3 style={{ margin: '0 0 16px', color: "var(--disk-text-primary)", fontSize: '18px' }}>Protocolar Novo Chamado no Disk Service</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>Nome do Solicitante</label>
                  <input type="text" placeholder="Nome completo" required style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>E-mail ou Telefone</label>
                  <input type="text" placeholder="joao@email.com ou (41) 99999-8888" required style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>Canal de Entrada</label>
                  <select style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }}>
                    <option>WhatsApp</option>
                    <option>E-mail</option>
                    <option>Chat Web</option>
                    <option>Telefone / Presencial</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>Prioridade (SLA)</label>
                  <select style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }}>
                    <option>P2 — Alto (1h FRT / 8h MTTR)</option>
                    <option>P1 — Crítico (15m FRT / 2h MTTR)</option>
                    <option>P3 — Médio (4h FRT / 24h MTTR)</option>
                    <option>P4 — Baixo (8h FRT / 48h MTTR)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>Evento Vinculado</label>
                  <select style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }}>
                    <option>Festival XPTO 2026</option>
                    <option>Rock Arena Festival 2026</option>
                    <option>Seu Jorge — Turnê Exclusiva</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>Assunto do Chamado</label>
                <input type="text" placeholder="Ex: Dificuldade no recebimento de QR Code Pix" required style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-secondary)", display: 'block', marginBottom: '4px' }}>Descrição Detalhada do Problema</label>
                <textarea placeholder="Relate as informações fornecidas pelo cliente..." rows={4} required style={{ width: '100%', background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '10px 12px', color: "var(--disk-text-primary)" }} />
              </div>

              <button type="submit" className="ds-search360-btn" style={{ background: '#2563eb', padding: '12px 24px' }}>
                <Plus size={16} /> Protocolar Chamado com SLA Ativo
              </button>
            </form>
          </div>
        )}

        {/* ========================================================
            MODAL DE DETALHES DO PEDIDO
            ======================================================== */}
        {selectedOrderModal && (
          <div className="ds-modal-backdrop" onClick={() => setSelectedOrderModal(null)}>
            <div className="ds-order-modal" onClick={e => e.stopPropagation()}>
              
              <div className="ds-order-modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="status-pill green">{selectedOrderModal.payment_status || 'APROVADO'}</span>
                    <span className="ds-badge blue">Pedido #{selectedOrderModal.order_number}</span>
                  </div>
                  <h2>Detalhes do Pedido #{selectedOrderModal.order_number}</h2>
                  <p>{selectedOrderModal.event_name} • Realizado {selectedOrderModal.created_at || 'Hoje às 10:30'}</p>
                </div>
                <button className="ds-order-modal-close" onClick={() => setSelectedOrderModal(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="ds-order-modal-body">
                {/* 1. Dados do Comprador */}
                <div>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Titular da Compra</span>
                  <div className="ds-order-info-grid">
                    <div className="ds-order-info-box">
                      <span>Nome Completo</span>
                      <strong>{customer360?.customer.name || 'João Silva Oliveira'}</strong>
                    </div>
                    <div className="ds-order-info-box">
                      <span>CPF / Documento</span>
                      <strong>{customer360?.customer.cpfMasked || '***.***.***-00'}</strong>
                    </div>
                    <div className="ds-order-info-box">
                      <span>Telefone & E-mail</span>
                      <strong>{customer360?.customer.phoneMasked || '(41) *****-8899'}</strong>
                      <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>{customer360?.customer.emailMasked || 'jo***@email.com'}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Ingressos do Pedido */}
                <div>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Vouchers & Ingressos Emitidos ({selectedOrderModal.ingresso_count || 2})</span>
                  <div className="ds-order-tickets-list">
                    {(customer360?.ingressos.filter(i => i.order_number === selectedOrderModal.order_number) || [
                      { id: 1, ticket_code: 'ING-88101', event_name: selectedOrderModal.event_name, status: 'ACTIVE', checkin_status: 'NÃO UTILIZADO' },
                      { id: 2, ticket_code: 'ING-88102', event_name: selectedOrderModal.event_name, status: 'ACTIVE', checkin_status: 'NÃO UTILIZADO' }
                    ]).map(ing => (
                      <div key={ing.id} className="ds-order-ticket-row">
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>{ing.ticket_code}</strong>
                            <span className="ds-badge green">{ing.status}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: "var(--disk-text-muted)", marginTop: '2px' }}>Pista Premium • Inteira • Check-in: <b>{ing.checkin_status}</b></div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => notify(`Visualizando QR Code em alta resolução para ${ing.ticket_code}!`)} className="ds-operator-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>
                            <QrCode size={13} /> Ver QR Code
                          </button>
                          <button onClick={() => notify(`Voucher ${ing.ticket_code} enviado para o WhatsApp!`)} className="ds-operator-btn primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
                            <Phone size={13} /> Enviar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Extrato Financeiro & Gateway */}
                <div>
                  <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Extrato Financeiro da Transação</span>
                  <div className="ds-order-info-grid">
                    <div className="ds-order-info-box">
                      <span>Método de Pagamento</span>
                      <strong>{selectedOrderModal.payment_method || 'PIX (Efí Bank)'}</strong>
                    </div>
                    <div className="ds-order-info-box">
                      <span>ID da Transação E2E</span>
                      <strong style={{ fontSize: '11px', fontFamily: 'monospace' }}>E00416968202609011030a8f9b2c3d4e5</strong>
                    </div>
                    <div className="ds-order-info-box">
                      <span>Valor Total Pago</span>
                      <strong style={{ fontSize: '16px', color: '#059669' }}>R$ {(selectedOrderModal.total_amount || 480).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>

              </div>

              <div className="ds-order-modal-footer">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => notify(`Ingressos do pedido #${selectedOrderModal.order_number} reenviados por WhatsApp!`)} className="ds-operator-btn" style={{ color: '#16a34a', borderColor: "var(--disk-color-success-border)", background: "var(--disk-color-success-subtle)" }}>
                    <Phone size={14} /> Reenviar WhatsApp
                  </button>
                  <button onClick={() => notify(`Ingressos do pedido #${selectedOrderModal.order_number} reenviados por e-mail!`)} className="ds-operator-btn" style={{ color: '#2563eb', borderColor: "var(--disk-color-info-border)", background: "var(--disk-color-info-subtle)" }}>
                    <Mail size={14} /> Reenviar E-mail
                  </button>
                  <button onClick={() => notify(`Download do lote de vouchers PDF iniciado!`)} className="ds-operator-btn">
                    <Download size={14} /> Baixar PDF
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => notify(`Estorno integral solicitado para o pedido #${selectedOrderModal.order_number}!`)} className="ds-operator-btn" style={{ color: '#dc2626', borderColor: "var(--disk-color-danger-border)", background: "var(--disk-color-danger-subtle)" }}>
                    <RotateCcw size={14} /> Solicitar Reembolso
                  </button>
                  <button onClick={() => setSelectedOrderModal(null)} className="ds-search360-btn" style={{ background: '#475569' }}>
                    Fechar
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
    </LimitlessPage>
  )
}
