import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertTriangle, BarChart3, CheckCircle2, ChevronDown, CircleDollarSign, Copy,
  Download, ExternalLink, Filter, Link2, MousePointerClick, Plus, QrCode, Radar,
  RefreshCw, Search, ShoppingCart, Sparkles, TrendingUp, UserRoundCheck, X, Eye,
  MessageCircle, Mail, Share2, MoreHorizontal, Users, Target, Clock, ArrowUpRight,
  TrendingDown, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Edit, Trash2, PauseCircle, PlayCircle, Archive, Check, Send, Smartphone, ShieldCheck,
  FileSpreadsheet, FileText, CheckCircle, Scale, Headphones
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  createTrackingLink, getTrackingLinks, getUtmDashboard, sweepUtmAbandonments,
  type TrackingLink, type UtmDashboard, type UtmSummary, type UtmJourneyAction
} from '../services/api'

type Props = { 
  event: EventItem
  events?: EventItem[]
  onSelectEvent?: (event: EventItem) => void
  notify: (message: string) => void 
}

interface TrackingLinkItem {
  id: number
  name: string
  shortUrl: string
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
  destination: string
  visits: number
  added: number
  checkout: number
  abandoned: number
  sales: number
  revenueCents: number
  status: 'ativa' | 'pausada' | 'arquivada'
  shortCode: string
  createdAt: string
}

interface OrderConversion {
  id: number
  code: string
  status: 'Finalizado' | 'Checkout' | 'Abandonou' | 'Adicionou'
  statusKey: 'finalized' | 'checkout' | 'abandoned' | 'added'
  customer: string
  email: string
  phone: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent?: string
  utmTerm?: string
  landingPage: string
  referrer: string
  sessionId: string
  visitorId: string
  firstTouch: string
  lastTouch: string
  tickets: string
  modality: string
  amountCents: number
  dateTime: string
}

interface AbandonedCartItem {
  id: number
  customerName: string
  email: string
  phone: string
  cartValueCents: number
  tickets: string
  abandonedAt: string
  utmSource: string
  status: 'pendente' | 'contatado' | 'recuperado'
  messagesSent: number
}

const initialLinksData: TrackingLinkItem[] = [
  { id: 1, name: 'Instagram — Lançamento 2026', shortUrl: 'disk.ing/4amigos-instagram', source: 'instagram', medium: 'cpc', campaign: 'lancamento_2026', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 1842, added: 326, checkout: 142, abandoned: 18, sales: 87, revenueCents: 1248050, status: 'ativa', shortCode: '4amigos-instagram', createdAt: '2026-05-01T10:00:00Z' },
  { id: 2, name: 'Google Ads — Pesquisa Direta', shortUrl: 'disk.ing/4amigos-google', source: 'google', medium: 'cpc', campaign: 'pesquisa_direta', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 1256, added: 210, checkout: 88, abandoned: 12, sales: 41, revenueCents: 612000, status: 'ativa', shortCode: '4amigos-google', createdAt: '2026-05-02T14:30:00Z' },
  { id: 3, name: 'WhatsApp — Disparo Último Lote', shortUrl: 'disk.ing/4amigos-whatsapp', source: 'whatsapp', medium: 'mensagem', campaign: 'ultimo_lote', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 982, added: 180, checkout: 72, abandoned: 8, sales: 32, revenueCents: 398000, status: 'ativa', shortCode: '4amigos-whatsapp', createdAt: '2026-05-05T09:15:00Z' },
  { id: 4, name: 'TikTok Ads — Vídeo Lineup', shortUrl: 'disk.ing/4amigos-tiktok', source: 'tiktok', medium: 'video', campaign: 'lineup_viral', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 671, added: 98, checkout: 42, abandoned: 6, sales: 19, revenueCents: 261000, status: 'ativa', shortCode: '4amigos-tiktok', createdAt: '2026-05-08T18:00:00Z' },
  { id: 5, name: 'Influencer — Curitiba Cult VIP', shortUrl: 'disk.ing/4amigos-influencer', source: 'influencer', medium: 'stories', campaign: 'curitiba_cult', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 458, added: 74, checkout: 31, abandoned: 4, sales: 15, revenueCents: 215000, status: 'ativa', shortCode: '4amigos-influencer', createdAt: '2026-05-10T12:00:00Z' },
  { id: 6, name: 'E-mail — Newsletter Base Ativa', shortUrl: 'disk.ing/4amigos-email', source: 'email', medium: 'newsletter', campaign: 'base_ativa_maio', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 356, added: 56, checkout: 24, abandoned: 3, sales: 12, revenueCents: 156000, status: 'ativa', shortCode: '4amigos-email', createdAt: '2026-05-12T08:00:00Z' },
  { id: 7, name: 'Facebook Ads — Remarketing Checkout', shortUrl: 'disk.ing/4amigos-fb-remarketing', source: 'facebook', medium: 'cpc', campaign: 'remarketing_checkout', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 198, added: 32, checkout: 16, abandoned: 2, sales: 7, revenueCents: 98000, status: 'ativa', shortCode: '4amigos-fb-remarketing', createdAt: '2026-05-15T16:45:00Z' },
  { id: 8, name: 'Afiliados — Promoters Oficiais', shortUrl: 'disk.ing/4amigos-afiliados', source: 'affiliates', medium: 'promoter', campaign: 'promoters_oficiais', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 79, added: 16, checkout: 9, abandoned: 1, sales: 4, revenueCents: 57000, status: 'ativa', shortCode: '4amigos-afiliados', createdAt: '2026-05-18T11:20:00Z' },
  { id: 9, name: 'Spotify Ads — Áudio Oficial & Companion Banner', shortUrl: 'disk.ing/4amigos-spotify', source: 'spotify', medium: 'audio_ads', campaign: 'lancamento_spotify', destination: 'https://www.diskingressos.com.br/evento/4amigos-2026', visits: 1120, added: 194, checkout: 82, abandoned: 9, sales: 38, revenueCents: 532000, status: 'ativa', shortCode: '4amigos-spotify', createdAt: '2026-05-19T10:00:00Z' },
]

const initialOrdersData: OrderConversion[] = [
  { id: 1, code: '#16355834', status: 'Finalizado', statusKey: 'finalized', customer: 'João Silva', email: 'joao@email.com', phone: '(41) 99841-2291', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'stories_video_1', utmTerm: 'comedia_curitiba', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_9f81a2bc4e', visitorId: 'vis_8829104', firstTouch: '31/05/2026 21:12', lastTouch: '31/05/2026 21:48', tickets: '2x Pista Premium', modality: 'Inteira', amountCents: 36000, dateTime: '31/05/2026 21:48' },
  { id: 2, code: '#16355789', status: 'Checkout', statusKey: 'checkout', customer: 'Maria Santos', email: 'maria@email.com', phone: '(41) 98712-4433', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'banner_feed', utmTerm: 'standup', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_4b22c710fe', visitorId: 'vis_3319024', firstTouch: '31/05/2026 20:15', lastTouch: '31/05/2026 20:33', tickets: '1x Camarote Open Bar', modality: 'Inteira', amountCents: 28000, dateTime: '31/05/2026 20:33' },
  { id: 3, code: '#16355621', status: 'Abandonou', statusKey: 'abandoned', customer: 'Lucas Oliveira', email: 'lucas@email.com', phone: '(41) 99123-8877', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'reels_curitiba', utmTerm: 'ingressos', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_1a890b33da', visitorId: 'vis_5548190', firstTouch: '31/05/2026 18:50', lastTouch: '31/05/2026 19:12', tickets: '2x Pista Premium', modality: 'Inteira', amountCents: 34000, dateTime: '31/05/2026 19:12' },
  { id: 4, code: '#16355509', status: 'Finalizado', statusKey: 'finalized', customer: 'Ana Paula Costa', email: 'ana@email.com', phone: '(41) 99654-1122', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'stories_video_2', utmTerm: '4amigos', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_7c339a11ef', visitorId: 'vis_9918231', firstTouch: '31/05/2026 18:20', lastTouch: '31/05/2026 18:47', tickets: '1x Camarote Frontstage', modality: 'Meia', amountCents: 42000, dateTime: '31/05/2026 18:47' },
  { id: 5, code: '#16355341', status: 'Adicionou', statusKey: 'added', customer: 'Rafael Mendes', email: 'rafael@email.com', phone: '(41) 98455-6677', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'bio_link', utmTerm: 'teatro_positivo', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_3e5510aabb', visitorId: 'vis_1102938', firstTouch: '31/05/2026 16:45', lastTouch: '31/05/2026 17:05', tickets: '1x Pista Premium', modality: 'Inteira', amountCents: 17000, dateTime: '31/05/2026 17:05' },
  { id: 6, code: '#16355219', status: 'Finalizado', statusKey: 'finalized', customer: 'Camila Rocha', email: 'camila@email.com', phone: '(41) 99233-4455', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'stories_video_1', utmTerm: 'comedia', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_8b4412ccdd', visitorId: 'vis_4472910', firstTouch: '31/05/2026 15:10', lastTouch: '31/05/2026 15:38', tickets: '2x Pista Lateral', modality: 'Inteira', amountCents: 24000, dateTime: '31/05/2026 15:38' },
  { id: 7, code: '#16355102', status: 'Abandonou', statusKey: 'abandoned', customer: 'Bruno Henrique', email: 'bruno@email.com', phone: '(41) 98844-9911', utmSource: 'instagram', utmMedium: 'cpc', utmCampaign: 'lancamento_2026', utmContent: 'feed_post', utmTerm: 'quatro_amigos', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://l.instagram.com/', sessionId: 'sess_99a113ddee', visitorId: 'vis_8830192', firstTouch: '31/05/2026 14:00', lastTouch: '31/05/2026 14:22', tickets: '1x Camarote Open Bar', modality: 'Inteira', amountCents: 28000, dateTime: '31/05/2026 14:22' },
  { id: 8, code: '#16355048', status: 'Finalizado', statusKey: 'finalized', customer: 'Eduardo Martins', email: 'eduardo.m@email.com', phone: '(41) 98765-4321', utmSource: 'spotify', utmMedium: 'audio_ads', utmCampaign: 'lancamento_spotify', utmContent: 'spot_30s_lineup', utmTerm: 'streaming_audio', landingPage: 'https://diskingressos.com.br/evento/4amigos', referrer: 'https://open.spotify.com/', sessionId: 'sess_sp_55a109fe2c', visitorId: 'vis_sp_771920', firstTouch: '31/05/2026 13:10', lastTouch: '31/05/2026 13:42', tickets: '2x Pista Premium', modality: 'Inteira', amountCents: 36000, dateTime: '31/05/2026 13:42' },
]

const initialAbandonedCarts: AbandonedCartItem[] = [
  { id: 1, customerName: 'Lucas Oliveira', email: 'lucas@email.com', phone: '(41) 99123-8877', cartValueCents: 34000, tickets: '2x Pista Premium (Inteira)', abandonedAt: 'Há 28 minutos', utmSource: 'Instagram — Lançamento 2026', status: 'pendente', messagesSent: 0 },
  { id: 2, customerName: 'Bruno Henrique', email: 'bruno@email.com', phone: '(41) 98844-9911', cartValueCents: 28000, tickets: '1x Camarote Open Bar', abandonedAt: 'Há 1 hora', utmSource: 'Instagram — Lançamento 2026', status: 'contatado', messagesSent: 1 },
  { id: 3, customerName: 'Juliana Paes', email: 'juliana.p@email.com', phone: '(41) 99776-5544', cartValueCents: 52000, tickets: '2x Camarote Frontstage', abandonedAt: 'Há 2 horas', utmSource: 'Instagram — Lançamento 2026', status: 'recuperado', messagesSent: 2 },
  { id: 4, customerName: 'Fernando Alencar', email: 'fernando@email.com', phone: '(41) 98112-3344', cartValueCents: 17000, tickets: '1x Pista Premium', abandonedAt: 'Há 3 horas', utmSource: 'Instagram — Lançamento 2026', status: 'pendente', messagesSent: 0 },
  { id: 5, customerName: 'Patrícia Souza', email: 'patricia@email.com', phone: '(41) 99344-7788', cartValueCents: 36000, tickets: '2x Pista Lateral', abandonedAt: 'Há 4 horas', utmSource: 'Instagram — Lançamento 2026', status: 'contatado', messagesSent: 1 },
  { id: 6, customerName: 'Renata Silveira', email: 'renata.s@email.com', phone: '(41) 99221-3344', cartValueCents: 36000, tickets: '2x Pista Premium', abandonedAt: 'Há 5 horas', utmSource: 'Spotify Ads — Áudio Oficial', status: 'pendente', messagesSent: 0 },
]

const dailyTimelineMock = [
  { date: '01/05', added: 12, checkout: 6, abandoned: 1, sales: 4, rate: '4,2%' },
  { date: '06/05', added: 28, checkout: 14, abandoned: 2, sales: 8, rate: '4,5%' },
  { date: '11/05', added: 42, checkout: 19, abandoned: 3, sales: 12, rate: '4,8%' },
  { date: '16/05', added: 56, checkout: 26, abandoned: 4, sales: 16, rate: '4,6%' },
  { date: '18/05', added: 68, checkout: 31, abandoned: 14, sales: 11, rate: '4,8%' },
  { date: '21/05', added: 48, checkout: 22, abandoned: 3, sales: 14, rate: '4,9%' },
  { date: '26/05', added: 62, checkout: 28, abandoned: 4, sales: 17, rate: '5,1%' },
  { date: '31/05', added: 78, checkout: 36, abandoned: 5, sales: 22, rate: '5,3%' },
]

const hourlyMock = [
  { hour: '00h', val: 20, count: 18, label: '00h' },
  { hour: '01h', val: 15, count: 12 },
  { hour: '02h', val: 10, count: 8 },
  { hour: '03h', val: 8, count: 6 },
  { hour: '04h', val: 18, count: 14, label: '04h' },
  { hour: '05h', val: 28, count: 22 },
  { hour: '06h', val: 40, count: 32 },
  { hour: '07h', val: 55, count: 48 },
  { hour: '08h', val: 68, count: 64, label: '08h' },
  { hour: '09h', val: 72, count: 70 },
  { hour: '10h', val: 85, count: 82 },
  { hour: '11h', val: 78, count: 75 },
  { hour: '12h', val: 92, count: 90, label: '12h' },
  { hour: '13h', val: 88, count: 86 },
  { hour: '14h', val: 75, count: 72 },
  { hour: '15h', val: 82, count: 80 },
  { hour: '16h', val: 96, count: 94, label: '16h' },
  { hour: '17h', val: 90, count: 88 },
  { hour: '18h', val: 85, count: 82 },
  { hour: '19h', val: 92, count: 89 },
  { hour: '20h', val: 98, count: 96, label: '20h', isPeak: true },
]

export default function UtmConversionsCenter({ event, events = [], onSelectEvent, notify }: Props) {
  const [linksList, setLinksList] = useState<TrackingLinkItem[]>(initialLinksData)
  const [selectedId, setSelectedId] = useState<number>(1)
  const [compareMode, setCompareMode] = useState<boolean>(false)
  const [comparedIds, setComparedIds] = useState<number[]>([1, 2, 3])
  const [ordersList, setOrdersList] = useState<OrderConversion[]>(initialOrdersData)
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartItem[]>(initialAbandonedCarts)

  const [period, setPeriod] = useState('01/05/2026 - 31/05/2026')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [linkSearch, setLinkSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Modals & Drawers State
  const [openNew, setOpenNew] = useState(false)
  const [openShareModal, setOpenShareModal] = useState(false)
  const [openExportModal, setOpenExportModal] = useState(false)
  const [qrModal, setQrModal] = useState<{ name: string; url: string; shortUrl: string } | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderConversion | null>(null)
  const [showRecoveryDrawer, setShowRecoveryDrawer] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null)
  const [hoveredHour, setHoveredHour] = useState<any | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Form State for New/Edit UTM
  const [form, setForm] = useState({
    id: 0,
    name: '',
    source: 'instagram',
    medium: 'cpc',
    campaign: `evento-${event.code}`,
    term: '',
    content: '',
    destination: `https://www.diskingressos.com.br/evento/${event.code}`,
    generateShort: true,
    generateQr: true,
    trackRealtime: true,
    linkPixel: true,
    linkAffiliate: false
  })

  // Selected UTM Item
  const selectedItem = useMemo(() => {
    return linksList.find(l => l.id === selectedId) || linksList[0]
  }, [linksList, selectedId])

  // Filtered links on the left
  const visibleLinks = useMemo(() => {
    return linksList.filter(l => {
      const matchesSource = sourceFilter === 'all' || l.source === sourceFilter
      const matchesSearch = `${l.name} ${l.shortUrl} ${l.source} ${l.medium} ${l.campaign}`.toLowerCase().includes(linkSearch.toLowerCase())
      return matchesSource && matchesSearch
    })
  }, [linksList, sourceFilter, linkSearch])

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      const matchesStatus = filter === 'all' || o.statusKey === filter
      const matchesSearch = `${o.code} ${o.customer} ${o.email} ${o.tickets} ${o.utmCampaign}`.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [ordersList, filter, search])

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredOrders.slice(start, start + itemsPerPage)
  }, [filteredOrders, currentPage, itemsPerPage])

  // Totals across all URLs
  const totals = useMemo(() => {
    const visits = linksList.reduce((acc, l) => acc + l.visits, 0)
    const sales = linksList.reduce((acc, l) => acc + l.sales, 0)
    const revenue = linksList.reduce((acc, l) => acc + l.revenueCents, 0)
    const avgTicket = sales ? Math.round(revenue / sales) : 0
    const convRate = visits ? (sales / visits) * 100 : 0
    return { visits, sales, revenue, avgTicket, convRate, activeLinks: linksList.filter(l => l.status === 'ativa').length }
  }, [linksList])

  // Copy helper
  const copyText = async (text: string, msg = 'Link copiado para a área de transferência!') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
      notify(msg)
    } catch {
      notify('Copie manualmente: ' + text)
    }
  }

  // Create / Save UTM
  const handleSaveUtm = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name) return

    const shortCode = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20)
    const shortUrl = `disk.ing/${shortCode}`

    if (form.id) {
      // Edit existing
      setLinksList(prev => prev.map(l => l.id === form.id ? {
        ...l,
        name: form.name,
        source: form.source,
        medium: form.medium,
        campaign: form.campaign,
        destination: form.destination,
        term: form.term,
        content: form.content
      } : l))
      notify(`UTM "${form.name}" atualizada com sucesso!`)
    } else {
      // New Link
      const newLink: TrackingLinkItem = {
        id: Date.now(),
        name: form.name,
        shortUrl,
        shortCode,
        source: form.source,
        medium: form.medium,
        campaign: form.campaign,
        destination: form.destination,
        term: form.term,
        content: form.content,
        visits: 1,
        added: 0,
        checkout: 0,
        abandoned: 0,
        sales: 0,
        revenueCents: 0,
        status: 'ativa',
        createdAt: new Date().toISOString()
      }
      setLinksList(prev => [newLink, ...prev])
      setSelectedId(newLink.id)
      notify(`Nova UTM "${form.name}" criada e ativada!`)
    }
    setOpenNew(false)
    setForm({
      id: 0,
      name: '',
      source: 'instagram',
      medium: 'cpc',
      campaign: `evento-${event.code}`,
      term: '',
      content: '',
      destination: `https://www.diskingressos.com.br/evento/${event.code}`,
      generateShort: true,
      generateQr: true,
      trackRealtime: true,
      linkPixel: true,
      linkAffiliate: false
    })
  }

  // Duplicate UTM
  const duplicateUtm = (item: TrackingLinkItem) => {
    const copyItem: TrackingLinkItem = {
      ...item,
      id: Date.now(),
      name: `${item.name} (Cópia)`,
      shortUrl: `${item.shortUrl}-copia`,
      shortCode: `${item.shortCode}-copia`,
      visits: 0,
      added: 0,
      checkout: 0,
      abandoned: 0,
      sales: 0,
      revenueCents: 0,
      createdAt: new Date().toISOString()
    }
    setLinksList(prev => [copyItem, ...prev])
    setSelectedId(copyItem.id)
    setMenuOpenId(null)
    notify(`UTM duplicada como "${copyItem.name}"!`)
  }

  // Toggle Status
  const toggleStatus = (id: number) => {
    setLinksList(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'ativa' ? 'pausada' : 'ativa' } : l))
    setMenuOpenId(null)
    notify('Status da UTM atualizado!')
  }

  // Delete UTM
  const deleteUtm = (id: number) => {
    if (confirm('Deseja realmente remover esta URL rastreável?')) {
      setLinksList(prev => prev.filter(l => l.id !== id))
      if (selectedId === id && linksList.length > 1) {
        setSelectedId(linksList[0].id)
      }
      setMenuOpenId(null)
      notify('UTM removida com sucesso.')
    }
  }

  // Remarketing Trigger
  const triggerRecovery = (cartId: number, channel: 'whatsapp' | 'email') => {
    setAbandonedCarts(prev => prev.map(c => c.id === cartId ? {
      ...c,
      status: 'contatado',
      messagesSent: c.messagesSent + 1
    } : c))
    notify(`Mensagem de recuperação enviada via ${channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'} para o cliente!`)
  }

  // Export Reports
  const exportData = (type: 'csv' | 'xlsx' | 'pdf') => {
    if (type === 'csv') {
      const headers = ['ID', 'Campanha', 'Canal', 'Meio', 'URL_Curta', 'Visitas', 'Vendas', 'Receita_RS', 'Conversao_Pct']
      const rows = linksList.map(l => [
        l.id,
        `"${l.name.replace(/"/g, '""')}"`,
        l.source,
        l.medium,
        l.shortUrl,
        l.visits,
        l.sales,
        (l.revenueCents / 100).toFixed(2).replace('.', ','),
        ((l.sales / l.visits) * 100).toFixed(2).replace('.', ',')
      ].join(';'))
      const content = '\uFEFF' + [headers.join(';'), ...rows].join('\n')
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_utms_${event.code}_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      notify('Relatório CSV de UTMs baixado com sucesso!')
    } else {
      notify(`Relatório ${type.toUpperCase()} gerado e pronto para visualização!`)
    }
    setOpenExportModal(false)
  }

  return (
    <div className="utm-center utm-dashboard-v2" style={{ background: '#F8FAFC', color: '#0F172A' }}>
      {/* 1. Header & Operational Context Controls */}
      <section className="utm-dash-header mobile-utm-head" style={{ padding: '8px 0', borderBottom: '1px solid #E2E8F0', marginBottom: '8px' }}>
        <div className="utm-dash-title">
          <h2>Central UTM & Conversões</h2>
          <p>Acompanhe em tempo real a atribuição, jornada e desempenho operacional de cada origem de tráfego.</p>
        </div>
        <div className="utm-dash-controls mobile-utm-controls">
          {/* Event Context */}
          <div className="utm-context-select mobile-utm-context" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
            <span style={{ color: '#64748B' }}>Evento selecionado</span>
            {events.length > 0 && onSelectEvent ? (
              <select
                className="utm-period-select"
                style={{ color: '#0F172A', fontWeight: 700, cursor: 'pointer', maxWidth: '220px' }}
                value={event.id}
                onChange={e => {
                  const ev = events.find(x => x.id === Number(e.target.value))
                  if (ev) {
                    onSelectEvent(ev)
                    notify(`Evento alterado para: ${ev.title}`)
                  }
                }}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            ) : (
              <strong style={{ color: '#0F172A' }}>{event.title}</strong>
            )}
            <small style={{ color: '#16A34A', fontWeight: 700 }}>● Ativo (ID: {event.code})</small>
          </div>

          {/* Date Range Picker */}
          <div className="utm-context-select mobile-utm-context" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
            <span style={{ color: '#64748B' }}>Período</span>
            <select
              className="utm-period-select"
              style={{ color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}
              value={period}
              onChange={e => { setPeriod(e.target.value); notify(`Período alterado para: ${e.target.value}`); }}
            >
              <option value="01/05/2026 - 31/05/2026">01/05/2026 - 31/05/2026 (Maio)</option>
              <option value="Hoje (Últimas 24h)">Hoje (Últimas 24h)</option>
              <option value="Últimos 7 dias">Últimos 7 dias</option>
              <option value="Últimos 30 dias">Últimos 30 dias</option>
              <option value="Últimos 90 dias">Últimos 90 dias</option>
              <option value="Ano 2026 (Consolidado)">Ano 2026 (Consolidado)</option>
            </select>
            <small style={{ color: '#64748B' }}>Dados em tempo real</small>
          </div>

          {/* Action Buttons */}
          <button 
            className={`btn mobile-utm-secondary-action ${compareMode ? 'primary' : 'secondary'}`} 
            onClick={() => {
              setCompareMode(!compareMode)
              notify(compareMode ? 'Modo de comparação desativado.' : 'Modo de comparação ativado: selecione as URLs para comparar lado a lado.')
            }}
            style={{ 
              background: compareMode ? '#2563EB' : '#FFFFFF', 
              borderColor: compareMode ? '#2563EB' : '#CBD5E1', 
              color: compareMode ? '#FFFFFF' : '#0F172A' 
            }} 
            title="Comparar URLs lado a lado"
          >
            <Scale size={15} /> {compareMode ? 'Sair da Comparação' : 'Comparar URLs'}
          </button>
          <button className="btn secondary mobile-utm-secondary-action" onClick={() => setOpenExportModal(true)} title="Exportar dados">
            <Download size={15} /> Exportar <ChevronDown size={13} />
          </button>
          <button className="btn secondary mobile-utm-secondary-action" onClick={() => setOpenShareModal(true)} title="Compartilhar visão">
            <Share2 size={15} /> Compartilhar
          </button>
          <button className="btn primary mobile-utm-primary-action" onClick={() => setOpenNew(true)}>
            <Plus size={16} /> Nova UTM
          </button>
        </div>
      </section>

      {/* 2. Top Consolidated KPI Strip (6 Cards) */}
      <section className="utm-dash-kpis">
        <DashKpi
          tone="purple"
          icon={<Link2 size={20} />}
          label="URLs rastreáveis"
          value={String(totals.activeLinks)}
          delta="● Ativas"
          isNeutral
        />
        <DashKpi
          tone="blue"
          icon={<Users size={20} />}
          label="Visitas atribuídas"
          value={totals.visits.toLocaleString('pt-BR')}
          delta="↑ 18,6% vs período anterior"
        />
        <DashKpi
          tone="green"
          icon={<ShoppingCart size={20} />}
          label="Vendas atribuídas"
          value={totals.sales.toLocaleString('pt-BR')}
          delta="↑ 23,4% vs período anterior"
        />
        <DashKpi
          tone="orange"
          icon={<CircleDollarSign size={20} />}
          label="Receita atribuída"
          value={`R$ ${(totals.revenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          delta="↑ 27,8% vs período anterior"
        />
        <DashKpi
          tone="pink"
          icon={<TrendingUp size={20} />}
          label="Ticket médio"
          value={`R$ ${(totals.avgTicket / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          delta="↑ 3,6% vs período anterior"
        />
        <DashKpi
          tone="cyan"
          icon={<Target size={20} />}
          label="Conversão geral"
          value={`${totals.convRate.toFixed(2).replace('.', ',')}%`}
          delta="↑ 0,4 p.p. vs período anterior"
        />
      </section>

      {/* 2.1. Executive Performance Insights Strip (Fase 16.10) */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '10px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '12px 0 16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>🏆 Melhor Canal</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#16A34A', marginTop: '2px' }}>WhatsApp (14,2% conv.)</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>💰 Maior Receita</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#0F172A', marginTop: '2px' }}>Instagram (R$ 12.480,50)</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>🎯 Melhor Conversão</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#2563EB', marginTop: '2px' }}>WhatsApp (9,8%)</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>🚀 Mais Tráfego</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#7C3AED', marginTop: '2px' }}>Instagram (1.842 vis.)</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>⚠️ Maior Abandono</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#EA580C', marginTop: '2px' }}>Google Ads (12 carr.)</strong>
        </div>
        <div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>💡 Receita Potencial</span>
          <strong style={{ display: 'block', fontSize: '13px', color: '#059669', marginTop: '2px' }}>R$ 2.840,00</strong>
        </div>
      </section>

      {/* 3. Main 2-Column Section */}
      <section className="utm-dash-main-grid">
        {/* Left Column: List of all UTMs */}
        <aside className="utm-dash-panel utm-link-list-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="utm-panel-head">
            <div>
              <h3 style={{ color: '#0F172A' }}>Todas as URLs rastreáveis do evento</h3>
            </div>
            <span className="utm-count-badge" style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>
              {linksList.length} URLs cadastradas
            </span>
          </div>

          {/* Search & Channel Filter */}
          <div className="utm-list-tools" style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '8px', marginBottom: '12px' }}>
            <div className="utm-search dark" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
              <Search size={14} style={{ color: '#64748B' }} />
              <input
                value={linkSearch}
                onChange={e => setLinkSearch(e.target.value)}
                placeholder="Pesquisar URL ou canal..."
                style={{ color: '#0F172A' }}
              />
              {linkSearch && (
                <button onClick={() => setLinkSearch('')} style={{ background: 'none', border: 0, color: '#64748B', cursor: 'pointer' }}>
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="utm-source-filter dark" style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '0 8px', display: 'flex', alignItems: 'center' }}>
              <Filter size={13} style={{ color: '#64748B', marginRight: '6px' }} />
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value)}
                style={{ background: 'transparent', border: 0, outline: 0, color: '#0F172A', fontSize: '11px', fontWeight: 600, width: '100%' }}
              >
                <option value="all">Todos canais</option>
                <option value="instagram">Instagram</option>
                <option value="google">Google Ads</option>
                <option value="spotify">Spotify Ads</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="influencer">Influencers</option>
                <option value="email">E-mail</option>
                <option value="facebook">Meta Ads</option>
                <option value="affiliates">Afiliados</option>
              </select>
            </div>
          </div>

          {/* URL List Rows */}
          <div className="utm-link-rows">
            {visibleLinks.map(item => {
              const isSelected = selectedId === item.id
              const isCompared = comparedIds.includes(item.id)
              const isActive = compareMode ? isCompared : isSelected

              return (
                <div
                  key={item.id}
                  className={`utm-link-row ${isActive ? 'selected' : ''}`}
                  onClick={() => {
                    if (compareMode) {
                      if (comparedIds.includes(item.id)) {
                        if (comparedIds.length > 1) {
                          setComparedIds(comparedIds.filter(id => id !== item.id))
                        } else {
                          notify('Mantenha pelo menos 1 URL para comparação.')
                        }
                      } else {
                        setComparedIds([...comparedIds, item.id])
                      }
                    } else {
                      setSelectedId(item.id)
                    }
                  }}
                  style={{
                    background: isActive ? '#EFF6FF' : '#FFFFFF',
                    borderColor: isActive ? '#93C5FD' : '#E2E8F0'
                  }}
                >
                  {compareMode && (
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '6px' }}>
                      <input
                        type="checkbox"
                        checked={isCompared}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                    </div>
                  )}
                  <div className={`utm-source-avatar ${item.source}`}>
                    {getSourceIcon(item.source)}
                  </div>
                  <div className="utm-link-row-copy">
                    <strong style={{ color: '#0F172A' }}>{item.name}</strong>
                    <small style={{ color: '#64748B' }}>{item.shortUrl}</small>
                  </div>
                  <div className="utm-link-row-stat">
                    <b style={{ color: '#0F172A' }}>{item.visits.toLocaleString('pt-BR')}</b>
                    <span>visitas</span>
                  </div>
                  <div className="utm-link-row-stat">
                    <b style={{ color: '#0F172A' }}>{item.sales}</b>
                    <span>vendas</span>
                  </div>
                  <div className="utm-link-row-stat revenue">
                    <b style={{ color: '#0F172A' }}>{`R$ ${(item.revenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</b>
                    <span>receita</span>
                  </div>
                  <button
                    type="button"
                    className={`utm-row-select ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (compareMode) {
                        if (comparedIds.includes(item.id)) {
                          if (comparedIds.length > 1) {
                            setComparedIds(comparedIds.filter(id => id !== item.id))
                          } else {
                            notify('Mantenha pelo menos 1 URL para comparação.')
                          }
                        } else {
                          setComparedIds([...comparedIds, item.id])
                        }
                      } else {
                        setSelectedId(item.id)
                      }
                    }}
                  >
                    {compareMode ? (isCompared ? '✓ Comparando' : '+ Comparar') : (isSelected ? '✓ Selecionado' : 'Selecionar')}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
            <button className="utm-view-all-btn" onClick={() => { setLinkSearch(''); setSourceFilter('all'); notify('Exibindo todas as URLs ativas.'); }}>
              Ver todas as URLs
            </button>
          </div>
        </aside>

        {/* Right Column: Selected UTM Deep Dive OR URL Comparison Matrix */}
        <main className="utm-dash-analysis">
          {compareMode ? (
            <UrlComparisonMatrix
              comparedItems={linksList.filter(l => comparedIds.includes(l.id))}
              onExit={() => setCompareMode(false)}
            />
          ) : (
            <>
              {/* Automated Campaign Diagnostic Card (Fase 16.10) */}
              <div style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={20} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#1E3A8A', display: 'block' }}>
                      💡 Insights & Diagnóstico de Performance: {selectedItem.name}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#1E40AF' }}>
                      Conversão de {((selectedItem.sales / selectedItem.visits) * 100).toFixed(2).replace('.', ',')}% (acima da média geral do evento). {selectedItem.abandoned} abandonos identificados (R$ {((selectedItem.abandoned * 160)).toLocaleString('pt-BR')} em receita potencial). Pico de conversão: 19h–21h. <b>Recomendação:</b> priorizar remarketing no WhatsApp dos checkouts abandonados há menos de 2h.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecoveryDrawer(true)}
                  style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 0,
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <MessageCircle size={13} />
                  Recuperar {selectedItem.abandoned} Abandonos
                </button>
              </div>

              {/* Header of Selected URL */}
              <section className="utm-dash-panel utm-selected-summary" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', position: 'relative' }}>
            <div className="utm-selected-brand">
              <div className={`utm-source-avatar ${selectedItem.source} big`}>
                {getSourceIcon(selectedItem.source)}
              </div>
              <div>
                <div className="utm-selected-title">
                  <h3 style={{ color: '#0F172A' }}>{selectedItem.name}</h3>
                  <span className={`live-status-pill ${selectedItem.status === 'pausada' ? 'paused' : ''}`}>
                    ● {selectedItem.status === 'pausada' ? 'Pausada' : 'Ativa'}
                  </span>
                </div>
                <p style={{ color: '#64748B' }}>{selectedItem.shortUrl} <span style={{ color: '#94A3B8', fontSize: '10px' }}>({selectedItem.destination})</span></p>
              </div>
            </div>

            <div className="utm-selected-actions">
              <button onClick={() => copyText(`https://${selectedItem.shortUrl}`)} title="Copiar link curto">
                {copiedLink ? <Check size={14} style={{ color: '#16A34A' }} /> : <Copy size={14} />}
                {copiedLink ? 'Copiado!' : 'Copiar link'}
              </button>
              <button onClick={() => setQrModal({ name: selectedItem.name, url: selectedItem.destination, shortUrl: selectedItem.shortUrl })} title="Ver QR Code">
                <QrCode size={14} /> QR
              </button>
              <div style={{ position: 'relative' }}>
                <button className="icon-more-btn" onClick={() => setMenuOpenId(menuOpenId === selectedItem.id ? null : selectedItem.id)} title="Opções operacionais">
                  <MoreHorizontal size={16} />
                </button>

                {/* Dropdown Menu */}
                {menuOpenId === selectedItem.id && (
                  <div className="utm-action-dropdown-menu">
                    <button onClick={() => {
                      setForm({
                        id: selectedItem.id,
                        name: selectedItem.name,
                        source: selectedItem.source,
                        medium: selectedItem.medium,
                        campaign: selectedItem.campaign,
                        destination: selectedItem.destination,
                        term: selectedItem.term || '',
                        content: selectedItem.content || '',
                        generateShort: true,
                        generateQr: true,
                        trackRealtime: true,
                        linkPixel: true,
                        linkAffiliate: false
                      })
                      setOpenNew(true)
                      setMenuOpenId(null)
                    }}>
                      <Edit size={13} /> Editar parâmetros UTM
                    </button>
                    <button onClick={() => duplicateUtm(selectedItem)}>
                      <Copy size={13} /> Duplicar UTM
                    </button>
                    <button onClick={() => {
                      setQrModal({ name: selectedItem.name, url: selectedItem.destination, shortUrl: selectedItem.shortUrl })
                      setMenuOpenId(null)
                    }}>
                      <QrCode size={13} /> Gerar & Baixar QR Code
                    </button>
                    <button onClick={() => toggleStatus(selectedItem.id)}>
                      {selectedItem.status === 'pausada' ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
                      {selectedItem.status === 'pausada' ? 'Reativar rastreamento' : 'Pausar rastreamento'}
                    </button>
                    <button onClick={() => { notify('UTM arquivada!'); setMenuOpenId(null); }}>
                      <Archive size={13} /> Arquivar UTM
                    </button>
                    <button onClick={() => deleteUtm(selectedItem.id)} style={{ color: '#DC2626' }}>
                      <Trash2 size={13} /> Excluir UTM
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 6 Micro KPIs Strip for Selected URL */}
          <section className="utm-selected-mini-kpis" style={{ background: '#E2E8F0', border: '1px solid #CBD5E1' }}>
            <div className="utm-mini-metric blue">
              <Users size={14} />
              <div>
                <strong>{selectedItem.visits.toLocaleString('pt-BR')}</strong>
                <span>Visitas</span>
              </div>
            </div>
            <div className="utm-mini-metric green">
              <ShoppingCart size={14} />
              <div>
                <strong>{selectedItem.added}</strong>
                <span>Adicionaram</span>
              </div>
            </div>
            <div className="utm-mini-metric orange">
              <CircleDollarSign size={14} />
              <div>
                <strong>{selectedItem.checkout}</strong>
                <span>Checkouts</span>
              </div>
            </div>
            <div className="utm-mini-metric red">
              <Clock size={14} />
              <div>
                <strong>{selectedItem.abandoned}</strong>
                <span>Abandonos</span>
              </div>
            </div>
            <div className="utm-mini-metric green-alt">
              <ShoppingCart size={14} />
              <div>
                <strong>{selectedItem.sales}</strong>
                <span>Compras</span>
              </div>
            </div>
            <div className="utm-mini-metric money">
              <CircleDollarSign size={14} />
              <div>
                <strong>{`R$ ${(selectedItem.revenueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</strong>
                <span>Receita</span>
              </div>
            </div>
          </section>

          {/* Visual Charts Grid: Funnel + Daily Evolution & Hourly Stack */}
          <section className="utm-visual-grid">
            {/* Funnel Panel */}
            <article className="utm-dash-panel utm-funnel-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div className="utm-panel-head">
                <div>
                  <h3 style={{ color: '#0F172A' }}>Funil de conversão</h3>
                  <span style={{ color: '#64748B' }}>Clique em uma etapa para filtrar os pedidos</span>
                </div>
              </div>
              <div className="utm-funnel-v2">
                <div onClick={() => { setFilter('all'); notify('Exibindo todos os registros'); }} style={{ cursor: 'pointer' }}>
                  <FunnelRow label="Visitas" count={selectedItem.visits.toLocaleString('pt-BR')} pct="100%" color="#1D4ED8" width="100%" />
                </div>
                <div onClick={() => { setFilter('added'); notify('Filtrando por: Adicionaram ao carrinho'); }} style={{ cursor: 'pointer' }}>
                  <FunnelRow label="Adicionaram ao carrinho" count={String(selectedItem.added)} pct={`${((selectedItem.added / selectedItem.visits) * 100).toFixed(1).replace('.', ',')}%`} color="#0284C7" width="82%" />
                </div>
                <div onClick={() => { setFilter('checkout'); notify('Filtrando por: Iniciaram checkout'); }} style={{ cursor: 'pointer' }}>
                  <FunnelRow label="Iniciaram checkout" count={String(selectedItem.checkout)} pct={`${((selectedItem.checkout / selectedItem.visits) * 100).toFixed(1).replace('.', ',')}%`} color="#6366F1" width="64%" />
                </div>
                <div onClick={() => { setFilter('abandoned'); notify('Filtrando por: Abandonos'); }} style={{ cursor: 'pointer' }}>
                  <FunnelRow label="Abandonaram" count={String(selectedItem.abandoned)} pct={`${((selectedItem.abandoned / selectedItem.visits) * 100).toFixed(1).replace('.', ',')}%`} color="#EA580C" width="46%" />
                </div>
                <div onClick={() => { setFilter('finalized'); notify('Filtrando por: Compras realizadas'); }} style={{ cursor: 'pointer' }}>
                  <FunnelRow label="Compras realizadas" count={String(selectedItem.sales)} pct={`${((selectedItem.sales / selectedItem.visits) * 100).toFixed(2).replace('.', ',')}%`} color="#10B981" width="30%" />
                </div>
              </div>
              <div className="utm-funnel-footer" style={{ borderTop: '1px solid #E2E8F0' }}>
                <span style={{ color: '#64748B' }}>Taxa de conversão geral</span>
                <strong className="conversion-highlight">{`${((selectedItem.sales / selectedItem.visits) * 100).toFixed(2).replace('.', ',')}%`}</strong>
              </div>
            </article>

            {/* Charts Stack */}
            <div className="utm-chart-stack">
              {/* Daily Evolution Chart with Hover Tooltips */}
              <article className="utm-dash-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', position: 'relative' }}>
                <div className="utm-panel-head">
                  <div>
                    <h3 style={{ color: '#0F172A' }}>Evolução de ações por dia</h3>
                    <span style={{ color: '#64748B' }}>Passe o mouse nos pontos para ver detalhes</span>
                  </div>
                </div>
                <div className="utm-line-legend">
                  <span className="dot-green">● Adicionaram</span>
                  <span className="dot-orange">● Checkouts</span>
                  <span className="dot-purple">● Abandonos</span>
                  <span className="dot-blue">● Compras</span>
                </div>

                {/* SVG Spline Curves */}
                <div className="utm-svg-chart-wrap" style={{ position: 'relative' }}>
                  <svg viewBox="0 0 460 120" className="utm-spline-svg" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="460" y2="20" stroke="#E2E8F0" strokeDasharray="3,3" />
                    <line x1="0" y1="50" x2="460" y2="50" stroke="#E2E8F0" strokeDasharray="3,3" />
                    <line x1="0" y1="80" x2="460" y2="80" stroke="#E2E8F0" strokeDasharray="3,3" />
                    <line x1="0" y1="110" x2="460" y2="110" stroke="#CBD5E1" />

                    {/* Adicionaram curve (Green) */}
                    <path d="M 0 60 Q 40 40, 80 50 T 160 35 T 240 45 T 320 30 T 400 48 T 460 38" fill="none" stroke="#10B981" strokeWidth="2.5" />
                    {/* Checkouts curve (Orange) */}
                    <path d="M 0 85 Q 40 75, 80 70 T 160 65 T 240 68 T 320 58 T 400 65 T 460 60" fill="none" stroke="#F97316" strokeWidth="2.5" />
                    {/* Abandonos curve (Purple) */}
                    <path d="M 0 105 Q 40 95, 80 98 T 160 90 T 240 92 T 320 88 T 400 95 T 460 90" fill="none" stroke="#A855F7" strokeWidth="2" />
                    {/* Compras curve (Blue) */}
                    <path d="M 0 95 Q 40 88, 80 82 T 160 78 T 240 80 T 320 72 T 400 76 T 460 70" fill="none" stroke="#3B82F6" strokeWidth="2.5" />
                  </svg>

                  {/* Interactive Date Triggers */}
                  <div className="chart-date-labels">
                    {dailyTimelineMock.map((p, i) => (
                      <span
                        key={p.date}
                        className="interactive-date-point"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {p.date}
                      </span>
                    ))}
                  </div>

                  {/* Hover Popover Tooltip */}
                  {hoveredPoint && (
                    <div className="utm-chart-popover-tooltip">
                      <strong style={{ display: 'block', borderBottom: '1px solid #E2E8F0', paddingBottom: '4px', marginBottom: '6px', color: '#0F172A' }}>
                        📅 {hoveredPoint.date}/2026
                      </strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                        <span style={{ color: '#059669' }}>🟢 Adicionaram: <b>{hoveredPoint.added}</b></span>
                        <span style={{ color: '#EA580C' }}>🟠 Checkouts: <b>{hoveredPoint.checkout}</b></span>
                        <span style={{ color: '#9333EA' }}>🟣 Abandonos: <b>{hoveredPoint.abandoned}</b></span>
                        <span style={{ color: '#2563EB' }}>🔵 Compras: <b>{hoveredPoint.sales}</b></span>
                        <span style={{ color: '#0F172A', fontWeight: 700, marginTop: '3px', borderTop: '1px solid #F1F5F9', paddingTop: '3px' }}>
                          📈 Conversão: <b>{hoveredPoint.rate}</b>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </article>

              {/* Hourly Distribution Chart */}
              <article className="utm-dash-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', position: 'relative' }}>
                <div className="utm-panel-head">
                  <div>
                    <h3 style={{ color: '#0F172A' }}>Distribuição por hora</h3>
                    <span style={{ color: '#64748B' }}>Pico de conversão: <b>20:00h (96 ações)</b></span>
                  </div>
                </div>
                <div className="utm-hour-chart-v3">
                  {hourlyMock.map((h, i) => (
                    <div
                      key={i}
                      className={`utm-hour-col-v3 ${h.isPeak ? 'peak' : ''}`}
                      title={`${h.hour}: ${h.count} ações`}
                      onMouseEnter={() => setHoveredHour(h)}
                      onMouseLeave={() => setHoveredHour(null)}
                    >
                      <div className="utm-bar-fill" style={{ height: `${h.val}%`, background: h.isPeak ? '#16A34A' : '#3B82F6' }} />
                      {h.label && <small style={{ color: '#64748B' }}>{h.label}</small>}
                    </div>
                  ))}
                </div>

                {/* Hourly Tooltip */}
                {hoveredHour && (
                  <div className="utm-hour-popover-tooltip">
                    <span>Horário: <b>{hoveredHour.hour}</b></span>
                    <span>Volume: <b>{hoveredHour.count} ações</b></span>
                  </div>
                )}
              </article>
            </div>
          </section>
        </>
      )}
    </main>
  </section>

      {/* 4. Bottom Section: Orders Table & Remarketing Widget */}
      <section className="utm-bottom-grid">
        {/* Orders Table Panel */}
        <article className="utm-dash-panel utm-orders-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="utm-panel-head utm-table-head">
            <div>
              <h3 style={{ color: '#0F172A' }}>Pedidos & Conversões desta URL</h3>
              <span style={{ color: '#64748B' }}>{filteredOrders.length} registros identificados</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="utm-search dark" style={{ width: '280px', background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
                <Search size={14} style={{ color: '#64748B' }} />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar pedido, cliente ou email..."
                  style={{ color: '#0F172A' }}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="icon-clear">
                    <X size={12} />
                  </button>
                )}
              </div>
              <button className="tool-btn-dark" onClick={() => notify('Filtros avançados de atribuição')}>
                <Filter size={14} /> Filtros
              </button>
            </div>
          </div>

          <div className="utm-filter-tabs dark">
            {['all', 'added', 'checkout', 'abandoned', 'finalized'].map(k => (
              <button
                key={k}
                className={`${filter === k ? 'active ' : ''}${k}`}
                onClick={() => { setFilter(k); setCurrentPage(1); }}
              >
                {k === 'all' ? 'Todos' : k === 'added' ? 'Adicionaram' : k === 'checkout' ? 'Checkouts' : k === 'abandoned' ? 'Abandonaram' : 'Finalizados'} ({k === 'all' ? ordersList.length : ordersList.filter(o => o.statusKey === k).length})
              </button>
            ))}
          </div>

          <div className="utm-table-wrap dark">
            <table className="utm-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Status</th>
                  <th>Cliente</th>
                  <th>UTM (origem / campanha)</th>
                  <th>Ingressos / Modalidades</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                  <th>Data / Hora</th>
                  <th style={{ textAlign: 'center' }}>Atribuição</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(o => (
                  <tr key={o.id} onClick={() => setSelectedOrder(o)} style={{ cursor: 'pointer' }}>
                    <td><strong className="order-code-link">{o.code}</strong></td>
                    <td>
                      <span className={`utm-status-tag ${o.statusKey}`}>
                        ● {o.status}
                      </span>
                    </td>
                    <td>
                      <div className="order-customer-cell">
                        <strong style={{ color: '#0F172A' }}>{o.customer}</strong>
                        <small style={{ color: '#64748B' }}>{o.email}</small>
                      </div>
                    </td>
                    <td>
                      <div className="order-utm-cell">
                        <span style={{ color: '#334155' }}>{o.utmSource} / {o.utmMedium} / {o.utmCampaign}</span>
                        <small style={{ color: '#64748B' }}>{o.utmContent || 'direct'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="order-tickets-cell">
                        <strong style={{ color: '#0F172A' }}>{o.tickets}</strong>
                        <small style={{ color: '#64748B' }}>{o.modality}</small>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong style={{ color: '#0F172A', fontSize: '13px' }}>{`R$ ${(o.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</strong>
                    </td>
                    <td>
                      <span className="order-date-time" style={{ color: '#64748B' }}>{o.dateTime}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="icon-action-btn" onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} title="Ver jornada de atribuição">
                        <Eye size={15} style={{ color: '#2563EB' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="utm-table-pagination" style={{ borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div className="pagination-page-size">
              <span style={{ color: '#64748B' }}>Itens por página:</span>
              <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A' }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <div className="pagination-controls">
              <span style={{ color: '#64748B' }}>1-{paginatedOrders.length} de {filteredOrders.length}</span>
              <button className="pag-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}><ChevronsLeft size={14} /></button>
              <button className="pag-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}><ChevronLeft size={14} /></button>
              <button className="pag-btn active">1</button>
              <button className="pag-btn" disabled><ChevronRight size={14} /></button>
              <button className="pag-btn" disabled><ChevronsRight size={14} /></button>
            </div>
          </div>
        </article>

        {/* Remarketing & Recuperação Widget (Right) */}
        <aside className="utm-dash-panel utm-recovery-widget" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <div className="utm-panel-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#0284C7' }} />
              <h3 style={{ color: '#0F172A' }}>Remarketing & Recuperação</h3>
            </div>
          </div>

          <div className="recovery-metrics-list">
            <div className="recovery-metric-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Carrinhos abandonados</span>
              <strong style={{ color: '#0F172A' }}>18</strong>
            </div>
            <div className="recovery-metric-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Mensagens enviadas</span>
              <strong style={{ color: '#0F172A' }}>14</strong>
            </div>
            <div className="recovery-metric-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Recuperações</span>
              <strong style={{ color: '#0F172A' }}>5</strong>
            </div>
            <div className="recovery-metric-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Receita recuperada</span>
              <strong className="recovered-money-value" style={{ color: '#16A34A' }}>R$ 890,00</strong>
            </div>
          </div>

          <button
            className="btn primary full recovery-cta-btn"
            style={{ background: '#2563EB', color: '#FFFFFF', fontWeight: 700 }}
            onClick={() => setShowRecoveryDrawer(true)}
          >
            Ver oportunidades de remarketing
          </button>

          <div className="recovery-info-note" style={{ color: '#64748B' }}>
            <Info size={13} />
            <span>Esses dados são desta URL selecionada.</span>
          </div>
        </aside>
      </section>

      {/* Modal 1: Formulário Completo de Nova/Editar UTM (+ Nova UTM) */}
      {openNew && (
        <NewLinkDrawer
          form={form}
          setForm={setForm}
          eventTitle={event.title}
          onClose={() => setOpenNew(false)}
          onSubmit={handleSaveUtm}
        />
      )}

      {/* Modal 2: QR Code Dinâmico com Download */}
      {qrModal && (
        <QrCodeModal
          modal={qrModal}
          onClose={() => setQrModal(null)}
          onCopy={copyText}
          notify={notify}
        />
      )}

      {/* Modal 3: Atribuição Completa do Pedido / Sessão */}
      {selectedOrder && (
        <OrderAttributionModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCopy={copyText}
          notify={notify}
        />
      )}

      {/* Modal 4: Compartilhar Relatório */}
      {openShareModal && (
        <ShareReportModal
          eventTitle={event.title}
          period={period}
          onClose={() => setOpenShareModal(false)}
          onCopy={copyText}
        />
      )}

      {/* Modal 5: Exportar Relatórios (CSV / XLSX / PDF) */}
      {openExportModal && (
        <ExportReportModal
          onClose={() => setOpenExportModal(false)}
          onExport={exportData}
        />
      )}

      {/* Drawer 6: Oportunidades de Remarketing & Recuperação Operacional */}
      {showRecoveryDrawer && (
        <RecoveryOpportunitiesDrawer
          carts={abandonedCarts}
          selectedUrlName={selectedItem.name}
          onClose={() => setShowRecoveryDrawer(false)}
          onTrigger={triggerRecovery}
          notify={notify}
        />
      )}
    </div>
  )
}

function UrlComparisonMatrix({ comparedItems, onExit }: { comparedItems: TrackingLinkItem[]; onExit: () => void }) {
  const formatMoney = (cents: number) => `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  // Find winners
  const highestSales = Math.max(...comparedItems.map(i => i.sales))
  const highestVisits = Math.max(...comparedItems.map(i => i.visits))
  const highestConv = Math.max(...comparedItems.map(i => i.visits ? (i.sales / i.visits) * 100 : 0))
  const highestRevenue = Math.max(...comparedItems.map(i => i.revenueCents))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header of Comparison */}
      <div className="utm-dash-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
            ⚖️ COMPARAÇÃO LADO A LADO DE URLs ({comparedItems.length} selecionadas)
          </span>
          <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: '#0F172A', fontWeight: 800 }}>
            Matriz Comparativa de Performance & Conversão
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
            Compare métricas de tráfego, funil e faturamento entre canais para otimizar alocação de verba.
          </p>
        </div>
        <button className="btn secondary" onClick={onExit} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1' }}>
          <X size={15} /> Sair da Comparação
        </button>
      </div>

      {/* Comparison Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(2, comparedItems.length)}, 1fr)`, gap: '12px' }}>
        {comparedItems.map(item => {
          const convRate = item.visits ? (item.sales / item.visits) * 100 : 0
          const isWinnerSales = item.sales === highestSales && highestSales > 0
          const isWinnerConv = convRate === highestConv && highestConv > 0

          return (
            <div key={item.id} className="utm-dash-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '16px', position: 'relative' }}>
              {isWinnerSales && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: 800, background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', padding: '2px 6px', borderRadius: '4px' }}>
                  🏆 Mais Vendas
                </span>
              )}
              {isWinnerConv && !isWinnerSales && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '10px', fontWeight: 800, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '2px 6px', borderRadius: '4px' }}>
                  🎯 Maior Conversão
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div className={`utm-source-avatar ${item.source}`} style={{ width: '28px', height: '28px' }}>
                  {getSourceIcon(item.source)}
                </div>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block' }}>{item.name}</strong>
                  <small style={{ fontSize: '10px', color: '#64748B' }}>{item.shortUrl}</small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#F8FAFC', padding: '10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Visitas</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>{item.visits.toLocaleString('pt-BR')}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Vendas</span>
                  <strong style={{ fontSize: '14px', color: '#16A34A' }}>{item.sales}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Conversão</span>
                  <strong style={{ fontSize: '14px', color: '#2563EB' }}>{convRate.toFixed(2).replace('.', ',')}%</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>Receita</span>
                  <strong style={{ fontSize: '14px', color: '#16A34A' }}>{formatMoney(item.revenueCents)}</strong>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Side by Side Comparative Table */}
      <div className="utm-dash-panel" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', fontWeight: 700, fontSize: '12px', color: '#334155' }}>
          Tabela Comparativa de Etapas do Funil
        </div>
        <table className="utm-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Métrica / Etapa</th>
              {comparedItems.map(item => (
                <th key={item.id} style={{ textAlign: 'right' }}>
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>1. Visitas Únicas</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right', fontWeight: 700 }}>
                  {item.visits.toLocaleString('pt-BR')}
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>2. Adicionaram ao Carrinho</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right' }}>
                  {item.added} <small style={{ color: '#64748B' }}>({item.visits ? ((item.added / item.visits) * 100).toFixed(1) : 0}%)</small>
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>3. Checkouts Iniciados</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right' }}>
                  {item.checkout} <small style={{ color: '#64748B' }}>({item.visits ? ((item.checkout / item.visits) * 100).toFixed(1) : 0}%)</small>
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>4. Abandonos de Checkout</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right', color: '#EA580C' }}>
                  {item.abandoned}
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>5. Compras Concluídas</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right', color: '#16A34A', fontWeight: 700 }}>
                  {item.sales}
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>6. Taxa de Conversão Final</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right', color: '#2563EB', fontWeight: 800 }}>
                  {item.visits ? ((item.sales / item.visits) * 100).toFixed(2).replace('.', ',') : 0}%
                </td>
              ))}
            </tr>
            <tr>
              <td><strong>7. Receita Total (R$)</strong></td>
              {comparedItems.map(item => (
                <td key={item.id} style={{ textAlign: 'right', color: '#16A34A', fontWeight: 800 }}>
                  {formatMoney(item.revenueCents)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DashKpi({ tone, icon, label, value, delta, isNeutral = false }: { tone: string; icon: ReactNode; label: string; value: string; delta: string; isNeutral?: boolean }) {
  return (
    <article className={`utm-dash-kpi ${tone}`} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
      <div className="utm-dash-kpi-icon">{icon}</div>
      <div className="utm-dash-kpi-body">
        <span className="kpi-title-label" style={{ color: '#64748B' }}>{label}</span>
        <strong className="kpi-main-value" style={{ color: '#0F172A' }}>{value}</strong>
        <small className={`kpi-delta-tag ${isNeutral ? 'neutral-tag' : 'positive-tag'}`}>
          {delta}
        </small>
      </div>
    </article>
  )
}

function FunnelRow({ label, count, pct, color, width }: { label: string; count: string; pct: string; color: string; width: string }) {
  return (
    <div className="utm-funnel-row-v3">
      <div className="funnel-trapezoid-wrap">
        <div className="funnel-trapezoid-bar" style={{ width, background: color }} />
      </div>
      <div className="funnel-text-labels">
        <span className="funnel-step-name" style={{ color: '#334155' }}>{label}</span>
        <strong className="funnel-step-count" style={{ color: '#0F172A' }}>{count}</strong>
        <small className="funnel-step-pct" style={{ color: '#64748B' }}>{pct}</small>
      </div>
    </div>
  )
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'instagram':
      return <InstagramIcon />
    case 'google':
      return <span style={{ fontWeight: 900, fontSize: '14px', color: '#EA4335' }}>G</span>
    case 'whatsapp':
      return <MessageCircle size={15} style={{ color: '#FFFFFF' }} />
    case 'tiktok':
      return <TikTokIcon />
    case 'influencer':
      return <Sparkles size={15} style={{ color: '#FFFFFF' }} />
    case 'email':
      return <Mail size={15} style={{ color: '#FFFFFF' }} />
    case 'facebook':
      return <span style={{ fontWeight: 900, fontSize: '14px', color: '#FFFFFF' }}>f</span>
    case 'spotify':
      return <Headphones size={15} style={{ color: '#FFFFFF' }} />
    case 'affiliates':
      return <span style={{ fontWeight: 900, fontSize: '13px', color: '#FFFFFF' }}>V</span>
    default:
      return <Link2 size={15} />
  }
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFFFFF' }}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FFFFFF' }}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

/* =========================================================================
   MODAL 1: Formulário Completo de Nova UTM com Parâmetros e Toggles
   ========================================================================= */
function NewLinkDrawer({ form, setForm, eventTitle, onClose, onSubmit }: { form: any; setForm: (v: any) => void; eventTitle: string; onClose: () => void; onSubmit: (e: FormEvent) => void }) {
  const query = new URLSearchParams({
    utm_source: form.source,
    utm_medium: form.medium,
    utm_campaign: form.campaign,
    ...(form.term ? { utm_term: form.term } : {}),
    ...(form.content ? { utm_content: form.content } : {})
  }).toString()

  const fullUrl = `${form.destination}${form.destination.includes('?') ? '&' : '?'}${query}`
  const shortCode = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 18) || 'campanha-exemplo'
  const shortUrl = `disk.ing/${shortCode}`

  return (
    <div className="utm-modal-backdrop" onClick={onClose}>
      <aside className="utm-drawer-card-v2" onClick={e => e.stopPropagation()}>
        <div className="utm-drawer-head">
          <div>
            <span className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>UTM BUILDER OPERACIONAL</span>
            <h3 style={{ color: '#0F172A', fontSize: '18px', margin: '2px 0' }}>{form.id ? 'Editar Parâmetros UTM' : 'Criar Nova URL Rastreável'}</h3>
            <p style={{ color: '#64748B', fontSize: '11px', margin: 0 }}>Vinculada ao evento: <b>{eventTitle}</b></p>
          </div>
          <button type="button" onClick={onClose} className="drawer-close-btn">✕</button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
          <label className="utm-form-field">
            <span>Nome da Campanha / Ação *</span>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Instagram — Lançamento Stories Ingressos"
            />
          </label>

          <label className="utm-form-field">
            <span>URL de Destino (Landing Page do Evento) *</span>
            <input
              required
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
              placeholder="https://www.diskingressos.com.br/evento/..."
            />
          </label>

          <div className="utm-form-two-cols">
            <label className="utm-form-field">
              <span>Canal / Origem (utm_source) *</span>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>
                <option value="instagram">Instagram</option>
                <option value="google">Google Ads</option>
                <option value="spotify">Spotify Ads (Áudio & Companion)</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="tiktok">TikTok Ads</option>
                <option value="influencer">Influenciadores</option>
                <option value="email">E-mail Marketing</option>
                <option value="facebook">Meta Ads (Facebook)</option>
                <option value="affiliates">Afiliados / Promoters</option>
                <option value="outro">Outro Canal</option>
              </select>
            </label>

            <label className="utm-form-field">
              <span>Meio / Mídia (utm_medium) *</span>
              <input
                required
                value={form.medium}
                onChange={e => setForm({ ...form, medium: e.target.value })}
                placeholder="Ex: cpc, stories, bio, banner"
              />
            </label>
          </div>

          <div className="utm-form-two-cols">
            <label className="utm-form-field">
              <span>Nome da Campanha (utm_campaign) *</span>
              <input
                required
                value={form.campaign}
                onChange={e => setForm({ ...form, campaign: e.target.value })}
                placeholder="Ex: lancamento_2026"
              />
            </label>

            <label className="utm-form-field">
              <span>Conteúdo do Anúncio (utm_content)</span>
              <input
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Ex: video_comedia_1, banner_feed"
              />
            </label>
          </div>

          <label className="utm-form-field">
            <span>Palavra-chave / Termo (utm_term)</span>
            <input
              value={form.term}
              onChange={e => setForm({ ...form, term: e.target.value })}
              placeholder="Ex: standup_curitiba, ingressos_4amigos"
            />
          </label>

          {/* Opções Operacionais / Toggles */}
          <div className="utm-form-toggles">
            <label className="toggle-label">
              <input type="checkbox" checked={form.generateShort} onChange={e => setForm({ ...form, generateShort: e.target.checked })} />
              <span>☑️ Gerar URL curta automática (<code>{shortUrl}</code>)</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" checked={form.generateQr} onChange={e => setForm({ ...form, generateQr: e.target.checked })} />
              <span>☑️ Gerar QR Code dinâmico para materiais físicos</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" checked={form.trackRealtime} onChange={e => setForm({ ...form, trackRealtime: e.target.checked })} />
              <span>☑️ Ativar rastreamento em tempo real (Visitas & Atribuição)</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" checked={form.linkPixel} onChange={e => setForm({ ...form, linkPixel: e.target.checked })} />
              <span>☑️ Vincular Pixel (Meta Ads CAPI, GA4 Measurement Protocol)</span>
            </label>
            <label className="toggle-label">
              <input type="checkbox" checked={form.linkAffiliate} onChange={e => setForm({ ...form, linkAffiliate: e.target.checked })} />
              <span>☑️ Vincular Afiliado / Promoter com comissão automática</span>
            </label>
          </div>

          {/* Live Preview Box */}
          <div className="utm-live-preview-box">
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>Prévia da URL Gerada</span>
            <code style={{ fontSize: '11px', color: '#1E293B', display: 'block', wordBreak: 'break-all', margin: '4px 0' }}>{fullUrl}</code>
            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>URL Curta: {shortUrl}</span>
          </div>

          <div className="utm-drawer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary"><Plus size={15} /> {form.id ? 'Salvar Alterações' : 'Criar e Ativar UTM'}</button>
          </div>
        </form>
      </aside>
    </div>
  )
}

/* =========================================================================
   MODAL 2: QR Code Dinâmico com Download PNG e Cópia
   ========================================================================= */
function QrCodeModal({ modal, onClose, onCopy, notify }: { modal: { name: string; url: string; shortUrl: string }; onClose: () => void; onCopy: (t: string) => void; notify: (m: string) => void }) {
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`https://${modal.shortUrl}`)}`

  return (
    <div className="utm-modal-backdrop" onClick={onClose}>
      <div className="utm-modal-card-v2" onClick={e => e.stopPropagation()} style={{ width: '420px', textAlign: 'center' }}>
        <div className="utm-modal-head" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ color: '#0F172A', fontSize: '16px', margin: 0 }}>QR Code Operacional</h3>
            <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0' }}>{modal.name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', margin: '16px 0' }}>
          <div style={{ padding: '12px', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <img src={qrSvgUrl} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
          </div>
          <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 12px', width: '100%' }}>
            <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700 }}>https://{modal.shortUrl}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button className="btn secondary" onClick={() => onCopy(`https://${modal.shortUrl}`)}>
            <Copy size={14} /> Copiar Link
          </button>
          <a
            href={qrSvgUrl}
            download={`qrcode_${modal.shortUrl.replace('/', '_')}.png`}
            target="_blank"
            rel="noreferrer"
            className="btn primary"
            onClick={() => notify('Iniciando download do QR Code!')}
            style={{ textDecoration: 'none' }}
          >
            <Download size={14} /> Baixar QR Code
          </a>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   MODAL 3: Atribuição Completa do Pedido / Sessão
   ========================================================================= */
function OrderAttributionModal({ order, onClose, onCopy, notify }: { order: OrderConversion; onClose: () => void; onCopy: (t: string, msg?: string) => void; notify: (m: string) => void }) {
  return (
    <div className="utm-modal-backdrop" onClick={onClose}>
      <div className="utm-modal-card-v2 wide" onClick={e => e.stopPropagation()} style={{ width: '680px' }}>
        <div className="utm-modal-head" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`utm-status-tag ${order.statusKey}`}>● {order.status}</span>
              <h3 style={{ color: '#0F172A', fontSize: '16px', margin: 0 }}>Atribuição Completa: {order.code}</h3>
            </div>
            <p style={{ color: '#64748B', fontSize: '11px', margin: '3px 0 0' }}>Origem identificada via UTM Tracking Engine</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        <div className="utm-order-attr-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '14px 0' }}>
          <div className="attr-card-box">
            <span>utm_source</span>
            <strong>{order.utmSource}</strong>
          </div>
          <div className="attr-card-box">
            <span>utm_medium</span>
            <strong>{order.utmMedium}</strong>
          </div>
          <div className="attr-card-box">
            <span>utm_campaign</span>
            <strong>{order.utmCampaign}</strong>
          </div>
          <div className="attr-card-box">
            <span>utm_content</span>
            <strong>{order.utmContent || 'direct'}</strong>
          </div>
          <div className="attr-card-box">
            <span>utm_term</span>
            <strong>{order.utmTerm || '—'}</strong>
          </div>
          <div className="attr-card-box">
            <span>Landing Page</span>
            <strong style={{ fontSize: '11px', wordBreak: 'break-all' }}>{order.landingPage}</strong>
          </div>
          <div className="attr-card-box">
            <span>Referrer</span>
            <strong style={{ fontSize: '11px' }}>{order.referrer}</strong>
          </div>
          <div className="attr-card-box">
            <span>Session ID</span>
            <code>{order.sessionId}</code>
          </div>
          <div className="attr-card-box">
            <span>Visitor ID</span>
            <code>{order.visitorId}</code>
          </div>
          <div className="attr-card-box">
            <span>Primeiro Contato (First Touch)</span>
            <strong>{order.firstTouch}</strong>
          </div>
          <div className="attr-card-box">
            <span>Conversão (Last Touch)</span>
            <strong style={{ color: '#16A34A' }}>{order.lastTouch}</strong>
          </div>
          <div className="attr-card-box">
            <span>Valor Total</span>
            <strong style={{ color: '#0F172A', fontSize: '14px' }}>{`R$ ${(order.amountCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</strong>
          </div>
        </div>

        <div className="attr-customer-strip" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: '#0F172A', display: 'block', fontSize: '13px' }}>{order.customer} ({order.email})</strong>
            <small style={{ color: '#64748B' }}>Tel: {order.phone} • {order.tickets} ({order.modality})</small>
          </div>
          <button className="btn secondary" onClick={() => onCopy(JSON.stringify(order, null, 2), 'JSON de atribuição copiado!')}>
            <Copy size={13} /> Copiar JSON
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   MODAL 4: Compartilhar Relatório com Link Seguro
   ========================================================================= */
function ShareReportModal({ eventTitle, period, onClose, onCopy }: { eventTitle: string; period: string; onClose: () => void; onCopy: (t: string, msg?: string) => void }) {
  const shareLink = `https://newpdtv1.vercel.app/relatorio-utm?token=sec_99af2810cd&event=4amigos`

  return (
    <div className="utm-modal-backdrop" onClick={onClose}>
      <div className="utm-modal-card-v2" onClick={e => e.stopPropagation()} style={{ width: '480px' }}>
        <div className="utm-modal-head" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ color: '#0F172A', fontSize: '16px', margin: 0 }}>Compartilhar Visão UTM</h3>
            <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0' }}>Gere um link protegido para sua equipe ou patrocinadores</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        <div style={{ margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Evento: <b>{eventTitle}</b></span>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>Período: <b>{period}</b></span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              readOnly
              value={shareLink}
              style={{ width: '100%', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '8px 10px', fontSize: '11px', color: '#1E293B' }}
            />
            <button className="btn primary" onClick={() => onCopy(shareLink, 'Link de compartilhamento copiado!')}>
              <Copy size={14} /> Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   MODAL 5: Exportar Relatórios (CSV / Excel / PDF)
   ========================================================================= */
function ExportReportModal({ onClose, onExport }: { onClose: () => void; onExport: (t: 'csv' | 'xlsx' | 'pdf') => void }) {
  return (
    <div className="utm-modal-backdrop" onClick={onClose}>
      <div className="utm-modal-card-v2" onClick={e => e.stopPropagation()} style={{ width: '440px' }}>
        <div className="utm-modal-head" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
          <div>
            <h3 style={{ color: '#0F172A', fontSize: '16px', margin: 0 }}>Exportar Dados UTM</h3>
            <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0' }}>Escolha o formato desejado para exportação</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 0, cursor: 'pointer', color: '#64748B' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '16px 0' }}>
          <button className="export-choice-card" onClick={() => onExport('csv')}>
            <FileSpreadsheet size={20} style={{ color: '#16A34A' }} />
            <div>
              <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>Exportar como CSV (Excel / Planilhas)</strong>
              <small style={{ color: '#64748B' }}>Compatível com Microsoft Excel, Google Planilhas e BI</small>
            </div>
          </button>

          <button className="export-choice-card" onClick={() => onExport('xlsx')}>
            <FileSpreadsheet size={20} style={{ color: '#2563EB' }} />
            <div>
              <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>Exportar Planilha Completa (.XLSX)</strong>
              <small style={{ color: '#64748B' }}>Com abas separadas para URLs, Pedidos e Conversões</small>
            </div>
          </button>

          <button className="export-choice-card" onClick={() => onExport('pdf')}>
            <FileText size={20} style={{ color: '#EA580C' }} />
            <div>
              <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>Relatório Executivo em PDF</strong>
              <small style={{ color: '#64748B' }}>Com gráficos, funil e indicadores para apresentação</small>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   DRAWER 6: Oportunidades de Remarketing & Recuperação Operacional
   ========================================================================= */
function RecoveryOpportunitiesDrawer({ carts, selectedUrlName, onClose, onTrigger, notify }: { carts: AbandonedCartItem[]; selectedUrlName: string; onClose: () => void; onTrigger: (id: number, ch: 'whatsapp' | 'email') => void; notify: (m: string) => void }) {
  return (
    <div className="utm-modal-backdrop" onClick={onClose}>
      <aside className="utm-drawer-card-v2 wide" onClick={e => e.stopPropagation()} style={{ width: '640px' }}>
        <div className="utm-drawer-head" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
          <div>
            <span className="eyebrow" style={{ color: '#0284C7', fontWeight: 800 }}>REMARKETING OPERACIONAL</span>
            <h3 style={{ color: '#0F172A', fontSize: '18px', margin: '2px 0' }}>Oportunidades de Recuperação</h3>
            <p style={{ color: '#64748B', fontSize: '11px', margin: 0 }}>Origem: <b>{selectedUrlName}</b></p>
          </div>
          <button type="button" onClick={onClose} className="drawer-close-btn">✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', maxHeight: '480px', overflowY: 'auto' }}>
          {carts.map(c => (
            <div key={c.id} className="recovery-cart-row-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ color: '#0F172A', fontSize: '13px', display: 'block' }}>{c.customerName}</strong>
                  <small style={{ color: '#64748B' }}>{c.email} • {c.phone}</small>
                  <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px' }}>
                    🛒 <b>{c.tickets}</b> — <span style={{ color: '#16A34A', fontWeight: 700 }}>{`R$ ${(c.cartValueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</span>
                  </div>
                </div>
                <span className={`recovery-badge ${c.status}`}>
                  {c.status === 'recuperado' ? '✓ Recuperado' : c.status === 'contatado' ? '💬 Contatado' : '⏳ Pendente'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                <small style={{ color: '#94A3B8' }}>Abandonado: {c.abandonedAt} ({c.messagesSent} msg enviada)</small>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="recovery-btn-action whatsapp" onClick={() => onTrigger(c.id, 'whatsapp')} title="Enviar WhatsApp">
                    <MessageCircle size={13} /> WhatsApp
                  </button>
                  <button className="recovery-btn-action email" onClick={() => onTrigger(c.id, 'email')} title="Enviar E-mail">
                    <Mail size={13} /> E-mail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn secondary" onClick={() => notify('Varredura concluída: 3 novos carrinhos identificados.')}>
            <RefreshCw size={14} /> Detectar novos abandonos
          </button>
          <button className="btn primary" onClick={() => { notify('Disparando régua automática de WhatsApp para todos os pendentes!'); onClose(); }}>
            <Send size={14} /> Disparar Régua para Todos
          </button>
        </div>
      </aside>
    </div>
  )
}
