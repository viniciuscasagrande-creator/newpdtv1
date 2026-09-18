import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight, BarChart3, Download, Link2, Megaphone, MousePointerClick, Plus,
  Save, Settings2, TrendingUp, WalletCards, Zap, MessageSquare, Mail,
  TicketPercent, Users, Activity, QrCode, Coins, Gift, Trophy, UserPlus,
  Share2, Compass, Eye, CheckCircle2, Sliders, Filter, Sparkles, RefreshCw,
  Send, Trash2, Edit, Copy, Check, MessageCircle, ArrowRight, Layers,
  Target, ShieldCheck, Flame, Scale, FileSpreadsheet, FileText, ChevronDown,
  CheckCircle, Play, Pause, ExternalLink, Award, Search, X, UserCheck, ArrowLeft, Headphones
} from 'lucide-react'
import type { EventItem } from '../data/events'
import AutomationCenterPage from './AutomationCenterPage'
import UtmConversionsCenter from '../components/UtmConversionsCenter'
import TrackingIntegrationsManager from '../components/TrackingIntegrationsManager'
import { MarketingCampaignsPage } from './marketing/MarketingCampaignsPage'
import ReadyCampaignsPage from './marketing/ReadyCampaignsPage'
import { CouponsPromoPage } from './marketing/CouponsPromoPage'
import { CommunicationPage } from './marketing/CommunicationPage'
import MarketingHubOSPage from './marketing/MarketingHubOSPage'
import WhatsAppMarketingPage from './marketing/WhatsAppMarketingPage'
import EmailMarketingPage from './marketing/EmailMarketingPage'
import MarketingReportsPage from './marketing/MarketingReportsPage'
import MarketingAttributionPage from './marketing/MarketingAttributionPage'
import SpotifyAdsHubPage from './marketing/SpotifyAdsHubPage'
import { CampaignRealStatusPage } from './marketing/status-real/CampaignRealStatusPage'
import { LimitlessPage } from '../integrations/limitless/LimitlessPage'
import {
  createMarketingCampaign, getMarketingCampaigns, getResolvedTracking,
  getTrackingConfigs, saveTrackingConfig, updateMarketingCampaign,
  type MarketingCampaign, type ResolvedTracking, type TrackingConfig
} from '../services/api'

const defaultFallbackEvent: EventItem = {
  id: 0,
  code: 'GERAL',
  title: 'Todos os Eventos / Geral',
  venue: 'Geral',
  city: 'Brasil',
  date: '11/09/2026',
  total: 'R$ 0,00',
  sales: 0,
  available: 0,
  courtesy: 0,
  occupancy: '0%',
  cover: 'nature',
  status: 'ativo',
  producer: 'Produtora',
  visibility: 'publico',
  producerId: 1
}

export type Mode =
  | 'hub'
  | 'dashboard'
  | 'campaigns'
  | 'ready-campaigns'
  | 'create'
  | 'status-real'
  | 'meta-ads'
  | 'google-ads'
  | 'tiktok-ads'
  | 'spotify-ads'
  | 'spotify'
  | 'influencers'
  | 'automations'
  | 'whatsapp'
  | 'email'
  | 'crm'
  | 'audiences'
  | 'communications'
  | 'coupons'
  | 'cashback'
  | 'coins'
  | 'gamification'
  | 'referral'
  | 'affiliates'
  | 'utm-central'
  | 'links'
  | 'tracking'
  | 'attribution'
  | 'conversions'
  | 'remarketing'
  | 'recovery'
  | 'reports'
  | 'channel-performance'
  | 'campaign-ranking'
  | 'funnel-insights'

type Props = {
  events: EventItem[]
  producerName: string
  producerId: number | null
  mode: Mode
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

/* =========================================================================
   5 CATEGORIZED GROUPS OF MARKETING HUB (FASE 16.10.1)
   ========================================================================= */

interface HubModuleItem {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
  badge?: string
}

interface HubGroup {
  name: string
  description: string
  badgeColor: string
  modules: HubModuleItem[]
}

const hubGroups: HubGroup[] = [
  {
    name: '1. Aquisição & Campanhas',
    description: 'Crie, programe e gerencie campanhas pagas e orgânicas multicanal.',
    badgeColor: '#2563EB',
    modules: [
      { id: 'marketing-dashboard', title: 'Dashboard', description: 'KPIs, funil de vendas e desempenho geral.', icon: BarChart3 },
      { id: 'marketing-campaigns', title: 'Campanhas', description: 'Criação e gestão de campanhas multicanais.', icon: Megaphone },
      { id: 'marketing-ready-campaigns', title: 'Campanhas Prontas', description: '8 modelos prontos para ativar no evento.', icon: Sparkles, badge: '⚡ Pronto' },
      { id: 'marketing-meta-ads', title: 'Meta Ads', description: 'Campanhas Instagram / Facebook e CAPI.', icon: Target },
      { id: 'marketing-google-ads', title: 'Google Ads', description: 'Rede de Pesquisa, YouTube e palavras-chave.', icon: Search },
      { id: 'marketing-tiktok-ads', title: 'TikTok Ads', description: 'Spark Ads, vídeos e conversões virais.', icon: Play },
      { id: 'marketing-spotify-ads', title: 'Spotify Ads', description: 'Campanhas de áudio oficial, companion banners e CAPI.', icon: Headphones, badge: 'Áudio' },
      { id: 'marketing-influencers', title: 'Influenciadores', description: 'Criadores, comissões e links exclusivos.', icon: Users, badge: 'VIP' }
    ]
  },
  {
    name: '2. Comunicação & Relacionamento',
    description: 'Engaje compradores, envie notificações e automatize réguas de contato.',
    badgeColor: '#16A34A',
    modules: [
      { id: 'marketing-whatsapp', title: 'WhatsApp', description: 'Disparos transacionais e mensagens ativas.', icon: MessageSquare, badge: 'Oficial' },
      { id: 'marketing-email', title: 'E-mail Marketing', description: 'Disparos em massa e newsletters segmentadas.', icon: Mail },
      { id: 'marketing-automations', title: 'Automações', description: 'Jornadas automáticas e gatilhos por evento.', icon: Zap },
      { id: 'marketing-crm', title: 'CRM de Marketing', description: 'Gestão de leads, histórico e estágios.', icon: UserCheck },
      { id: 'marketing-audiences', title: 'Públicos & Segmentação', description: 'Listas inteligentes e sincronização CAPI.', icon: Layers },
      { id: 'marketing-communications', title: 'Integrações de Comunicação', description: 'WhatsApp API, SMTP, SMS e Webhooks.', icon: Settings2 }
    ]
  },
  {
    name: '3. Promoção & Fidelização',
    description: 'Acelere vendas com incentivos financeiros, cashback e gamificação.',
    badgeColor: '#D97706',
    modules: [
      { id: 'marketing-coupons', title: 'Cupons e Promoções', description: 'Ofertas, vouchers e descontos por lote.', icon: TicketPercent },
      { id: 'marketing-cashback', title: 'Cashback', description: 'Crédito promocional de volta para o cliente.', icon: WalletCards, badge: 'Fidelidade' },
      { id: 'marketing-coins', title: 'Coins / Pontos', description: 'DiskCoins por ingresso e catálogo de resgate.', icon: Coins },
      { id: 'marketing-gamification', title: 'Gamificação', description: 'Missões, desafios, medalhas e recompensas.', icon: Trophy },
      { id: 'marketing-referral', title: 'Indique e Ganhe', description: 'Programa de indicação entre compradores.', icon: UserPlus },
      { id: 'marketing-affiliates', title: 'Afiliados e Parceiros', description: 'Rede de promoters e comissionamento.', icon: Users }
    ]
  },
  {
    name: '4. Tracking & Conversão',
    description: 'Rastreie cada clique até a compra final com atribuição multi-touch.',
    badgeColor: '#7C3AED',
    modules: [
      { id: 'marketing-utm-central', title: 'Central UTM & Conversões', description: 'Dashboard executivo completo de UTMs.', icon: Link2, badge: 'Novo' },
      { id: 'marketing-links', title: 'Links, UTMs e QR Codes', description: 'URLs curtas e QR codes para totens/posts.', icon: QrCode },
      { id: 'marketing-tracking', title: 'Pixels e Conversões', description: 'Meta CAPI, GA4, TikTok Pixel, Spotify e GTM.', icon: Activity },
      { id: 'marketing-attribution', title: 'Atribuição Multicanal', description: 'UTM, click IDs, receita e ROAS por jornada.', icon: Scale, badge: '25.7.2' },
      { id: 'marketing-conversions', title: 'Central de Conversões', description: 'Jornada clique → sessão → carrinho → compra.', icon: MousePointerClick },
      { id: 'marketing-remarketing', title: 'Remarketing', description: 'Recuperação de checkouts e abandono.', icon: RefreshCw },
      { id: 'marketing-recovery', title: 'Recuperação de Vendas', description: 'Acompanhamento de receita resgatada.', icon: ShieldCheck }
    ]
  },
  {
    name: '5. Inteligência & Performance',
    description: 'Tome decisões com relatórios comparativos, ROAS e diagnósticos.',
    badgeColor: '#0EA5E9',
    modules: [
      { id: 'marketing-reports', title: 'Relatórios', description: 'ROI, ROAS, canais e exportação de dados.', icon: FileSpreadsheet },
      { id: 'marketing-channel-performance', title: 'Performance por Canal', description: 'Comparação Instagram vs Google vs WhatsApp.', icon: Scale },
      { id: 'marketing-campaign-ranking', title: 'Ranking de Campanhas', description: 'Leaderboard por faturamento e menor CPA.', icon: Award },
      { id: 'marketing-funnel-insights', title: 'Diagnóstico do Funil & Insights', description: 'Alertas de abandono e oportunidades.', icon: Flame }
    ]
  }
]

export default function MarketingPage({ events, producerName, producerId, mode, notify, onNavigate }: Props) {
  const contextKey = `diskingressos:marketing-context:${producerId ?? 'all'}`
  const readContext = () => {
    try { return JSON.parse(sessionStorage.getItem(contextKey) || '{}') as { eventId?: string; period?: string } } catch { return {} }
  }
  const initialContext = readContext()
  const [eventId, setEventId] = useState<string>(initialContext.eventId || 'all')
  const [period, setPeriod] = useState(initialContext.period || '30')
  const selectedEventId = eventId === 'all' ? undefined : Number(eventId)
  useEffect(() => {
    if (eventId !== 'all' && !events.some(e => String(e.id) === eventId)) setEventId('all')
  }, [events, eventId])
  useEffect(() => {
    sessionStorage.setItem(contextKey, JSON.stringify({ eventId, period }))
  }, [contextKey, eventId, period])
  const fallbackEvent: EventItem = useMemo(() => ({
    ...defaultFallbackEvent,
    producer: producerName || 'Produtora',
    producerId: producerId || 1
  }), [producerName, producerId])
  const selectedEvent: EventItem = events.find(e => String(e.id) === eventId) || events[0] || fallbackEvent
  const eventName = useMemo(() => eventId === 'all' ? 'Todos os eventos' : events.find(e => String(e.id) === eventId)?.title || 'Evento', [eventId, events])

  /* -------------------------------------------------------------------------
     HUB OVERVIEW (5 GROUPS)
     ------------------------------------------------------------------------- */
  if (mode === 'hub' || mode === 'dashboard') {
    return <MarketingHubOSPage events={events} producerName={producerName} producerId={producerId} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} notify={notify} onNavigate={onNavigate} />
  }

  const renderSubmodule = () => {
    /* 1. AQUISIÇÃO & CAMPANHAS */
    if (mode === 'status-real') {
      return (
        <CampaignRealStatusPage
          events={events}
          producerId={producerId}
          producerName={producerName}
          selectedEventId={selectedEventId}
          notify={notify}
          onNavigate={onNavigate}
        />
      )
    }

    if (mode === 'ready-campaigns') {
      return <ReadyCampaignsPage producerId={producerId} events={events} initialEventId={selectedEventId} notify={notify} />
    }

    if (mode === 'campaigns' || mode === 'create') {
      return <MarketingCampaignsPage events={events} initialEventId={selectedEventId} openWizardOnInit={mode === 'create'} notify={notify} />
    }

    if (mode === 'meta-ads') {
      return <MetaAdsManager events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'google-ads') {
      return <GoogleAdsManager events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'tiktok-ads') {
      return <TikTokAdsManager events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'spotify-ads' || mode === 'spotify') {
      return (
        <SpotifyAdsHubPage
          events={events}
          producerId={producerId}
          producerName={producerName}
          selectedEventId={selectedEventId}
          notify={notify}
          onNavigate={onNavigate}
        />
      )
    }

    if (mode === 'influencers') {
      return <InfluencerManager events={events} event={selectedEvent} notify={notify} />
    }

    /* 2. COMUNICAÇÃO & RELACIONAMENTO */
    if (mode === 'whatsapp') {
      return <WhatsAppMarketingPage producerId={producerId} producerName={producerName} events={events} selectedEventId={selectedEventId} notify={notify} />
    }

    if (mode === 'email') {
      return <EmailMarketingPage producerId={producerId} producerName={producerName} events={events} selectedEventId={selectedEventId} notify={notify} />
    }

    if (mode === 'automations') {
      return <AutomationCenterPage producerId={producerId} events={events} mode={mode} selectedEventId={selectedEventId} notify={notify} />
    }

    if (mode === 'crm') {
      return <MarketingCrmPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'audiences') {
      return <AudiencesPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'communications') {
      return <CommunicationPage producerId={producerId} producerName={producerName} notify={notify} />
    }

    /* 3. PROMOÇÃO & FIDELIZAÇÃO */
    if (mode === 'coupons') {
      return <CouponsPromoPage events={events as any} producerId={producerId || undefined} selectedEventId={selectedEventId} notify={notify} />
    }

    if (mode === 'cashback') {
      return <CashbackPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'coins') {
      return <DiskCoinsPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'gamification') {
      return <GamificationPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'referral') {
      return <ReferralProgramPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'affiliates') {
      return <AffiliatesManager events={events} event={selectedEvent} notify={notify} />
    }

    /* 4. TRACKING & CONVERSÃO */
    if (mode === 'utm-central' || mode === 'links') {
      return (
        <section className="growth-page utm-marketing-entry" style={{ padding: '0 4px', background: 'transparent' }}>
          <UtmConversionsCenter 
            event={selectedEvent}
            events={events}
            onSelectEvent={(ev) => setEventId(String(ev.id))}
            notify={notify}
          />
        </section>
      )
    }

    if (mode === 'attribution') {
      return <MarketingAttributionPage events={events} producerName={producerName} notify={notify} />
    }

    if (mode === 'tracking') {
      return <Tracking producerId={producerId} events={events} initialEventId={selectedEventId} notify={notify} />
    }

    if (mode === 'conversions') {
      return <ConversionJourneyPage events={events} event={selectedEvent} notify={notify} />
    }

    if (mode === 'remarketing' || mode === 'recovery') {
      return <RecoverySalesPage events={events} event={selectedEvent} notify={notify} />
    }

    /* 5. INTELIGÊNCIA & PERFORMANCE */
    if (mode === 'reports') {
      return <MarketingReportsPage events={events} event={selectedEvent} producerId={producerId} producerName={producerName} notify={notify} />
    }

    if (mode === 'channel-performance' || mode === 'campaign-ranking' || mode === 'funnel-insights') {
      return <ChannelPerformancePage events={events} event={selectedEvent} subMode={mode} notify={notify} />
    }

    return (
      <FeaturePage 
        title="Módulo de Marketing" 
        eventName={eventName} 
        producerName={producerName} 
        notify={notify} 
      />
    )
  }

  return (
    <LimitlessPage dataTestId="marketing-submodule-page">
      <div className="marketing-subpage-wrapper">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => (onNavigate ? onNavigate('marketing-dashboard') : window.history.back())}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
          >
            <ArrowLeft size={14} className="text-[#06B6D4]" />
            <span>Voltar ao Menu Marketing</span>
          </button>
        </div>
        {renderSubmodule()}
      </div>
    </LimitlessPage>
  )
}

/* =========================================================================
   SUB-PAGES & OPERATIONAL MODULES (FASE 16.10.1)
   ========================================================================= */

// 1. Dashboard Principal
function Dashboard({ producerName, events, eventId, setEventId, period, setPeriod, eventName, notify, onNavigate }: any) {
  const dashboardCards = [
    { title: 'Receita Atribuída', value: 'R$ 148.650,00', delta: '↑ 24,8%', icon: WalletCards },
    { title: 'Ingressos Vendidos', value: '3.412', delta: '↑ 18,2%', icon: MousePointerClick },
    { title: 'Taxa de Conversão Média', value: '4,65%', delta: '↑ 0,8 p.p.', icon: TrendingUp },
    { title: 'ROAS Consolidado', value: '5,2x', delta: '↑ 32%', icon: BarChart3 }
  ]

  return (
    <section className="growth-page">
      <Context producerName={producerName} events={events} eventId={eventId} setEventId={setEventId} period={period} setPeriod={setPeriod} />
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow">MARKETING & GROWTH</p>
          <h2>Dashboard Marketing & Atribuição</h2>
          <p>Acompanhe o desempenho consolidado das campanhas e canais de {eventName.toLowerCase()}.</p>
        </div>
        <div className="page-actions">
          <button className="btn secondary" onClick={() => notify('Relatório executivo exportado com sucesso!')}>
            <Download size={16} /> Exportar Relatório
          </button>
          <button className="btn primary" onClick={() => onNavigate ? onNavigate('marketing-create') : notify('Criar Campanha')}>
            <Plus size={16} /> Criar Campanha
          </button>
        </div>
      </div>

      <div className="growth-kpis">
        {dashboardCards.map(c => {
          const I = c.icon
          return (
            <article className="growth-kpi" key={c.title} style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
              <div className="kpi-top">
                <span>{c.title}</span>
                <I size={19} />
              </div>
              <strong style={{ color: "var(--disk-text-primary)" }}>{c.value}</strong>
              <small style={{ color: '#16A34A' }}>{c.delta} vs. período anterior</small>
            </article>
          )
        })}
      </div>

      <div className="growth-grid">
        <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
          <div className="panel-head">
            <div>
              <h3 style={{ color: "var(--disk-text-primary)" }}>Funil Geral de Conversão</h3>
              <p>Da visualização da campanha até o ingresso emitido</p>
            </div>
          </div>
          <div className="funnel">
            <Funnel n="142.800" label="1. Impressões / Cliques" w="100%" />
            <Funnel n="58.320" label="2. Visitas no Evento" w="80%" />
            <Funnel n="12.450" label="3. Adicionaram Carrinho" w="60%" />
            <Funnel n="5.890" label="4. Checkouts Iniciados" w="42%" />
            <Funnel n="3.412" label="5. Ingressos Comprados" w="28%" />
          </div>
        </article>

        <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
          <div className="panel-head">
            <div>
              <h3 style={{ color: "var(--disk-text-primary)" }}>Participação na Receita por Canal</h3>
              <p>Atribuição ponderada por canal ativo</p>
            </div>
          </div>
          <div className="channel-list">
            {[
              ['Instagram (Stories & Reels)', 44, 'R$ 65.406'],
              ['Google Ads (Search & YouTube)', 26, 'R$ 38.649'],
              ['WhatsApp (Base Ativa & VIP)', 16, 'R$ 23.784'],
              ['TikTok Ads (Spark Ads)', 8, 'R$ 11.892'],
              ['E-mail Marketing & CRM', 6, 'R$ 8.919']
            ].map(([n, v, r]) => (
              <div className="channel-row" key={String(n)}>
                <div>
                  <span style={{ fontWeight: 600 }}>{n}</span>
                  <b style={{ color: "var(--disk-text-primary)" }}>{r} ({v}%)</b>
                </div>
                <div className="channel-track">
                  <i style={{ width: `${v}%`, background: '#2563EB' }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

// 2. Meta Ads Manager
function MetaAdsManager({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [metaCampaigns, setMetaCampaigns] = useState([
    { id: 1, name: `${eventTitle} — Stories Lançamento 1º Lote`, format: 'Instagram Stories', budget: 1500, spent: 1240, ctr: '3,8%', cpa: 'R$ 16,40', sales: 75, roas: '4,8x', status: 'ativa' },
    { id: 2, name: `${eventTitle} — Reels Vídeo Teaser & Lineup`, format: 'Instagram Reels', budget: 2000, spent: 1850, ctr: '4,2%', cpa: 'R$ 18,20', sales: 101, roas: '5,1x', status: 'ativa' },
    { id: 3, name: `${eventTitle} — Remarketing Checkout Abandonado`, format: 'Facebook Feed', budget: 800, spent: 620, ctr: '5,6%', cpa: 'R$ 11,50', sales: 54, roas: '8,2x', status: 'ativa' }
  ])

  // Form states
  const [adName, setAdName] = useState('')
  const [adFormat, setAdFormat] = useState('Instagram Stories')
  const [adAudience, setAdAudience] = useState('Público Aberto (Curitiba + 50km)')
  const [adBudget, setAdBudget] = useState('1200')
  const [adObjective, setAdObjective] = useState('Vendas & Conversão (Purchase)')

  const totalSpent = metaCampaigns.reduce((acc, c) => acc + c.spent, 0)
  const totalSales = metaCampaigns.reduce((acc, c) => acc + c.sales, 0)

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault()
    const nameToUse = adName || `${eventTitle} — ${adFormat}`
    const newAd = {
      id: Date.now(),
      name: nameToUse,
      format: adFormat,
      budget: Number(adBudget) || 1200,
      spent: 0,
      ctr: '4,2%',
      cpa: 'R$ 15,20',
      sales: 0,
      roas: '0,0x',
      status: 'ativa'
    }
    setMetaCampaigns([newAd, ...metaCampaigns])
    setIsModalOpen(false)
    setAdName('')
    notify(`🚀 Anúncio Meta "${newAd.name}" criado e sincronizado com o Meta Conversions API (CAPI)!`)
  }

  const toggleAdStatus = (id: number) => {
    setMetaCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const next = c.status === 'ativa' ? 'pausada' : 'ativa'
        notify(`Anúncio "${c.name}" ${next === 'ativa' ? 'ativado' : 'pausado'}!`)
        return { ...c, status: next }
      }
      return c
    }))
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>META BUSINESS MANAGER & ADS CAPI</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Meta Ads — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Gerencie anúncios no Facebook e Instagram com sincronização em tempo real via Conversions API (CAPI).</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: "var(--disk-color-success-subtle)", border: '1px solid #86EFAC', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: "var(--disk-color-success-text)" }}>
            <CheckCircle size={14} /> Meta CAPI Token Ativo
          </div>
          <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#1877F2', borderColor: '#1877F2', fontSize: '12px' }}>
            <Plus size={15} /> Criar Anúncio Meta
          </button>
        </div>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Gasto Meta Ads</span><WalletCards size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          <small style={{ color: '#16A34A' }}>Orçado: R$ 4.300,00</small>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>ROAS Médio</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>5,4x</strong>
          <small style={{ color: '#16A34A' }}>↑ 18% vs média do mercado</small>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>CPA Médio</span><Target size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>R$ 16,13</strong>
          <small style={{ color: "var(--disk-text-muted)" }}>Custo por ingresso vendido</small>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Vendas Atribuídas</span><MousePointerClick size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>{totalSales}</strong>
          <small style={{ color: '#16A34A' }}>R$ {(totalSales * 180).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em receita</small>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Campanhas Meta Ads Ativas ({metaCampaigns.length})</h3>
            <p style={{ margin: '2px 0 0', color: "var(--disk-text-muted)", fontSize: '12px' }}>Sincronizadas com o Pixel CAPI do evento</p>
          </div>
          <button className="btn secondary" onClick={() => setIsModalOpen(true)} style={{ height: '32px', fontSize: '11px' }}>
            <Plus size={13} /> Novo Conjunto
          </button>
        </div>
        <div className="table-scroll">
          <table className="growth-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Campanha / Criativo</th>
                <th>Formato</th>
                <th>Status</th>
                <th>Investido</th>
                <th>CTR</th>
                <th>CPA</th>
                <th>Vendas</th>
                <th>ROAS</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {metaCampaigns.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <small style={{ display: 'block', color: '#2563EB', fontSize: '10px' }}>Pixel ID: 94827104928 • CAPI v19.0</small>
                  </td>
                  <td><span className="badge-method" style={{ fontSize: '10px', padding: '2px 6px' }}>{c.format}</span></td>
                  <td>
                    <span className={`status-badge ${c.status === 'ativa' ? 'green' : 'orange'}`}>
                      ● {c.status === 'ativa' ? 'Ativa' : 'Pausada'}
                    </span>
                  </td>
                  <td>R$ {c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>{c.ctr}</td>
                  <td>{c.cpa}</td>
                  <td><strong>{c.sales}</strong></td>
                  <td style={{ color: '#16A34A', fontWeight: 800 }}>{c.roas}</td>
                  <td>
                    <button className="btn secondary" style={{ height: '28px', fontSize: '10px', padding: '0 8px' }} onClick={() => toggleAdStatus(c.id)}>
                      {c.status === 'ativa' ? 'Pausar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      {/* MODAL: CRIAR ANÚNCIO META */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div 
            className="utm-modal-card-v2" 
            style={{ width: 'min(580px, 94vw)', maxHeight: '90vh', overflowY: 'auto', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1877F2', textTransform: 'uppercase' }}>
                  META BUSINESS SUITE & CAPI
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>
                  Criar Anúncio Meta Ads
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>
                  O anúncio será configurado para o evento <strong>{eventTitle}</strong> com UTM automática.
                </p>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>
                  Nome da Campanha / Criativo *
                </label>
                <input
                  type="text"
                  required
                  placeholder={`Ex: ${eventTitle} — Stories Lançamento`}
                  value={adName}
                  onChange={e => setAdName(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>
                    Formato / Posicionamento
                  </label>
                  <select 
                    value={adFormat} 
                    onChange={e => setAdFormat(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px', color: "var(--disk-text-primary)", fontWeight: 600 }}
                  >
                    <option value="Instagram Stories">Instagram Stories (9:16)</option>
                    <option value="Instagram Reels">Instagram Reels (9:16)</option>
                    <option value="Instagram Feed">Instagram Feed (1:1 / 4:5)</option>
                    <option value="Facebook Feed">Facebook Feed (1:1)</option>
                    <option value="Meta Carrossel">Meta Carrossel (1:1)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>
                    Orçamento Total (R$)
                  </label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={adBudget}
                    onChange={e => setAdBudget(e.target.value)}
                    style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>
                  Público & Segmentação
                </label>
                <select 
                  value={adAudience} 
                  onChange={e => setAdAudience(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px', color: "var(--disk-text-primary)" }}
                >
                  <option value="Público Aberto (Curitiba + 50km)">Público Aberto (Curitiba + 50km, 18-55 anos)</option>
                  <option value="Compradores Anteriores (Lookalike 1%)">Lookalike 1% de Compradores DiskIngressos</option>
                  <option value="Remarketing de Visitantes (Últimos 14 dias)">Remarketing de Visitantes da Página (14 dias)</option>
                  <option value="Abandonos de Checkout">Abandonos de Checkout (Últimos 7 dias)</option>
                </select>
              </div>

              <div style={{ background: "var(--disk-bg-muted)", padding: '12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: "var(--disk-color-info-text)", display: 'block', marginBottom: '4px' }}>
                  PARÂMETROS UTM & CONVERSION API
                </span>
                <code style={{ fontSize: '10px', color: '#2563EB', wordBreak: 'break-all', display: 'block' }}>
                  https://www.diskingressos.com.br/evento/{safeEvent.id}?utm_source=instagram&utm_medium=stories_ads&utm_campaign=meta_{(safeEvent.code || 'gbl').toLowerCase()}
                </code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px', paddingTop: '12px', borderTop: "1px solid var(--disk-border-default)" }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)} style={{ fontSize: '12px' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary" style={{ background: '#1877F2', borderColor: '#1877F2', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Publicar Anúncio no Meta Ads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 3. Google Ads Manager
function GoogleAdsManager({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const eventKeyword = eventTitle.toLowerCase()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [keywords, setKeywords] = useState([
    { kw: `ingressos ${eventKeyword}`, cpc: 'R$ 0,65', clicks: 4210, conv: 142, roas: '6,2x' },
    { kw: `show ${eventKeyword} curitiba`, cpc: 'R$ 0,82', clicks: 2890, conv: 98, roas: '5,8x' },
    { kw: `comprar ingresso ${eventKeyword}`, cpc: 'R$ 0,95', clicks: 1750, conv: 84, roas: '7,4x' }
  ])

  const [newKw, setNewKw] = useState('')
  const [newCpc, setNewCpc] = useState('0,85')

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newKw) return
    const row = {
      kw: newKw.toLowerCase(),
      cpc: `R$ ${Number(newCpc.replace(',', '.')).toFixed(2)}`,
      clicks: 0,
      conv: 0,
      roas: '0,0x'
    }
    setKeywords([row, ...keywords])
    setIsModalOpen(false)
    setNewKw('')
    notify(`🚀 Palavra-chave "${row.kw}" adicionada à campanha Google Ads!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>GOOGLE ADS & SEARCH ENGINE</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Google Ads — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Campanhas de intenção direta de compra na Rede de Pesquisa e YouTube Ads.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#2563EB', borderColor: '#2563EB', fontSize: '12px' }}>
          <Plus size={15} /> Nova Palavra-Chave Google
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Gasto Google</span><WalletCards size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ 6.840,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Cliques Totais</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>8.850</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>CPC Médio</span><Target size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ 0,77</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>ROAS Google</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>6,4x</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Palavras-Chave de Alta Conversão ({keywords.length})</h3></div>
          <button className="btn secondary" onClick={() => setIsModalOpen(true)} style={{ height: '32px', fontSize: '11px' }}>
            <Plus size={13} /> Adicionar Termo
          </button>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Palavra-Chave</th><th>CPC Máx</th><th>Cliques</th><th>Conversões</th><th>ROAS</th><th>Ação</th></tr></thead>
          <tbody>
            {keywords.map(k => (
              <tr key={k.kw}>
                <td><strong>{k.kw}</strong></td>
                <td>{k.cpc}</td>
                <td>{k.clicks}</td>
                <td><strong style={{ color: '#2563EB' }}>{k.conv}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 800 }}>{k.roas}</td>
                <td><button className="btn secondary" style={{ height: '28px', fontSize: '11px' }} onClick={() => notify(`Lance de "${k.kw}" otimizado com sucesso!`)}>Ajustar Lance</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {/* MODAL GOOGLE ADS KEYWORD */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>GOOGLE ADS SEARCH</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Adicionar Palavra-Chave</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleAddKeyword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Termo / Palavra-Chave *</label>
                <input type="text" required placeholder="Ex: ingressos show marcos e belutti curitiba" value={newKw} onChange={e => setNewKw(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Lance Máximo de CPC (R$)</label>
                <input type="text" value={newCpc} onChange={e => setNewCpc(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#2563EB', borderColor: '#2563EB' }}>Salvar Palavra-Chave</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 4. TikTok Ads Manager
function TikTokAdsManager({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sparkAds, setSparkAds] = useState([
    { id: 1, name: `${eventTitle} — Viral TikTok Teaser`, videoId: '@diskingressos/video/739182', spent: 1450, views: '112.400', cpm: 'R$ 12,90', sales: 58, status: 'ativa' },
    { id: 2, name: `${eventTitle} — Bastidores & Lineup`, videoId: '@diskingressos/video/739194', spent: 1000, views: '71.800', cpm: 'R$ 13,92', sales: 36, status: 'ativa' }
  ])

  const [adName, setAdName] = useState('')
  const [videoCode, setVideoCode] = useState('')
  const [adBudget, setAdBudget] = useState('800')

  const handleCreateSparkAd = (e: React.FormEvent) => {
    e.preventDefault()
    const row = {
      id: Date.now(),
      name: adName || `${eventTitle} — TikTok Spark Ad`,
      videoId: videoCode || '@diskingressos/spark/new',
      spent: 0,
      views: '0',
      cpm: 'R$ 13,50',
      sales: 0,
      status: 'ativa'
    }
    setSparkAds([row, ...sparkAds])
    setIsModalOpen(false)
    setAdName('')
    setVideoCode('')
    notify(`🚀 Campanha TikTok Spark Ad "${row.name}" criada com sucesso!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>TIKTOK ADS & SPARK ADS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>TikTok Ads — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Campanhas virais em vídeo com rastreamento via TikTok Pixel & Event API.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: "var(--disk-legacy-dark-surface, #0F172A)", borderColor: "var(--disk-border-default)", fontSize: '12px' }}>
          <Plus size={15} /> Criar Spark Ad
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Gasto TikTok</span><WalletCards size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ 2.450,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Visualizações de Vídeo</span><Play size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>184.200</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>CPM</span><Target size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ 13,30</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Ingressos Vendidos</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>94</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Spark Ads em Veiculação ({sparkAds.length})</h3></div>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Vídeo Spark</th><th>Gasto</th><th>Views</th><th>CPM</th><th>Vendas</th><th>Status</th></tr></thead>
          <tbody>
            {sparkAds.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong><small style={{ display: 'block', color: "var(--disk-text-muted)" }}>{s.videoId}</small></td>
                <td>R$ {s.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>{s.views}</td>
                <td>{s.cpm}</td>
                <td><strong style={{ color: '#16A34A' }}>{s.sales}</strong></td>
                <td><span className="status-badge green">● Ativa</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {/* MODAL TIKTOK SPARK AD */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: "var(--disk-text-primary)", textTransform: 'uppercase' }}>TIKTOK FOR BUSINESS</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Criar Campanha Spark Ad</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateSparkAd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Nome da Campanha *</label>
                <input type="text" required placeholder={`Ex: ${eventTitle} — Viral Teaser`} value={adName} onChange={e => setAdName(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Código de Autorização Spark Ad / URL do Vídeo</label>
                <input type="text" placeholder="Ex: https://tiktok.com/@criador/video/7391823901" value={videoCode} onChange={e => setVideoCode(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Orçamento Previsto (R$)</label>
                <input type="number" value={adBudget} onChange={e => setAdBudget(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: "var(--disk-legacy-dark-surface, #0F172A)", borderColor: "var(--disk-border-default)" }}>Publicar no TikTok</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 5. Influenciadores & Promoters
function InfluencerManager({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventIdToUse = safeEvent.id || 0
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [influencers, setInfluencers] = useState([
    { id: 1, name: 'Curitiba Cult', handle: '@curitibacult', link: `https://diskingressos.com.br/evento/${eventIdToUse}?utm_source=influencer&utm_medium=curitibacult`, commission: '10%', sales: 142, revenue: 24140, status: 'ativo' },
    { id: 2, name: 'Lucas Baladas PR', handle: '@lucasbaladas', link: `https://diskingressos.com.br/evento/${eventIdToUse}?utm_source=influencer&utm_medium=lucasbaladas`, commission: 'R$ 15/ing', sales: 98, revenue: 16660, status: 'ativo' },
    { id: 3, name: 'Gabi Entretenimento', handle: '@gabishows', link: `https://diskingressos.com.br/evento/${eventIdToUse}?utm_source=influencer&utm_medium=gabishows`, commission: '10%', sales: 64, revenue: 10880, status: 'ativo' }
  ])

  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [commission, setCommission] = useState('10%')

  const handleCreateInfluencer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    const cleanHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${name.toLowerCase().replace(/\s+/g, '')}`
    const slug = cleanHandle.replace('@', '').toLowerCase()
    const row = {
      id: Date.now(),
      name,
      handle: cleanHandle,
      link: `https://diskingressos.com.br/evento/${eventIdToUse}?utm_source=influencer&utm_medium=${slug}`,
      commission,
      sales: 0,
      revenue: 0,
      status: 'ativo'
    }
    setInfluencers([row, ...influencers])
    setIsModalOpen(false)
    setName('')
    setHandle('')
    notify(`🚀 Influenciador "${row.name}" cadastrado com link rastreável exclusivo!`)
  }

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    notify('Link do influenciador copiado para a área de transferência!')
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>REDE DE INFLUENCIADORES & PARCERIAS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Influenciadores & Promoters — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Acompanhe as vendas individuais de criadores de conteúdo com links UTM exclusivos.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#7C3AED', borderColor: '#7C3AED', fontSize: '12px' }}>
          <Plus size={15} /> Cadastrar Influenciador
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Criadores Ativos</span><Users size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>{influencers.length}</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Vendas por Criadores</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>{influencers.reduce((s, i) => s + i.sales, 0)}</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Receita Gerada</span><WalletCards size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ {influencers.reduce((s, i) => s + i.revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Comissão Estimada</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>R$ {(influencers.reduce((s, i) => s + i.revenue, 0) * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Criadores Cadastrados ({influencers.length})</h3></div>
          <button className="btn secondary" onClick={() => setIsModalOpen(true)} style={{ height: '32px', fontSize: '11px' }}>
            <Plus size={13} /> Novo Criador
          </button>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Influenciador</th><th>Link Rastreável (UTM)</th><th>Comissão</th><th>Vendas</th><th>Receita</th><th>Ações</th></tr></thead>
          <tbody>
            {influencers.map(i => (
              <tr key={i.id}>
                <td><strong>{i.name}</strong> <small style={{ color: "var(--disk-text-muted)" }}>({i.handle})</small></td>
                <td><code style={{ background: "var(--disk-bg-muted)", padding: '2px 6px', borderRadius: '4px', color: '#2563EB', fontSize: '11px' }}>{i.link}</code></td>
                <td><span className="badge-method" style={{ fontSize: '10px' }}>{i.commission}</span></td>
                <td><strong style={{ color: "var(--disk-text-primary)" }}>{i.sales}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {i.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <button className="btn secondary" style={{ height: '28px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => copyLink(i.link)}>
                    <Copy size={12} /> Copiar Link
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {/* MODAL INFLUENCIADOR */}
      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>CREATOR NETWORK</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Cadastrar Novo Influenciador</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateInfluencer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Nome do Criador / Perfil *</label>
                <input type="text" required placeholder="Ex: Curitiba Comedy Show" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Handle / @Instagram ou TikTok</label>
                <input type="text" placeholder="Ex: @curitibacomedy" value={handle} onChange={e => setHandle(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Regra de Comissão</label>
                <select value={commission} onChange={e => setCommission(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                  <option value="10%">10% sobre o valor do ingresso</option>
                  <option value="15%">15% sobre o valor do ingresso</option>
                  <option value="R$ 15/ing">R$ 15,00 fixo por ingresso vendido</option>
                  <option value="R$ 20/ing">R$ 20,00 fixo por ingresso vendido</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#7C3AED', borderColor: '#7C3AED' }}>Cadastrar e Gerar UTM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 6. CRM de Marketing
function MarketingCrmPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const leads = [
    { id: 1, name: 'Rodrigo Medeiros', email: 'rodrigo@email.com', phone: '(41) 99881-2233', stage: 'VIP (Comprador > R$ 500)', utm: 'instagram / stories', orders: 3, totalSpent: 780 },
    { id: 2, name: 'Juliana Castro', email: 'juliana@email.com', phone: '(41) 98712-4411', stage: 'Checkout Iniciado (2h atrás)', utm: 'whatsapp / base_vip', orders: 0, totalSpent: 0 },
    { id: 3, name: 'Felipe Santos', email: 'felipe@email.com', phone: '(41) 99122-8899', stage: 'Comprador 1º Lote', utm: 'google / search', orders: 1, totalSpent: 260 }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>CRM DE MARKETING & LEADS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px' }}>CRM de Relacionamento — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)" }}>Histórico completo, tags e ações 1-a-1 por WhatsApp e E-mail.</p>
        </div>
        <button className="btn primary" onClick={() => notify('Exportando base de leads para CSV...')}>
          <Download size={15} /> Exportar Contatos
        </button>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
        <table className="growth-table">
          <thead><tr><th>Cliente</th><th>Estágio no Funil</th><th>Origem UTM</th><th>Compras</th><th>Valor Total</th><th>Ação Rápida</th></tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id}>
                <td><strong>{l.name}</strong><br /><small style={{ color: "var(--disk-text-muted)" }}>{l.email} • {l.phone}</small></td>
                <td><span className="badge-method">{l.stage}</span></td>
                <td><small>{l.utm}</small></td>
                <td>{l.orders} pedido(s)</td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {l.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <button className="btn secondary" style={{ height: '28px', fontSize: '11px' }} onClick={() => notify(`Iniciando WhatsApp para ${l.name}...`)}>
                    <MessageSquare size={13} /> WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 7. Públicos & Segmentação
function AudiencesPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [audiences, setAudiences] = useState([
    { name: 'Compradores VIP (Ticket Médio > R$ 300)', size: '1.240 contatos', capi: 'Sincronizado', color: '#16A34A' },
    { name: 'Abandonos de Checkout (Últimos 14 dias)', size: '380 contatos', capi: 'Sincronizado', color: '#2563EB' },
    { name: 'Compradores de Edições Anteriores 2025', size: '4.520 contatos', capi: 'Pendente', color: '#D97706' },
    { name: 'Visitantes Recorrentes sem Compra', size: '2.180 contatos', capi: 'Sincronizado', color: '#7C3AED' }
  ])
  const [newName, setNewName] = useState('')
  const [newRule, setNewRule] = useState('Compradores nos últimos 90 dias')

  const handleCreateAudience = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName) return
    const row = {
      name: newName,
      size: '520 contatos calculados',
      capi: 'Sincronizado',
      color: '#16A34A'
    }
    setAudiences([row, ...audiences])
    setIsModalOpen(false)
    setNewName('')
    notify(`🚀 Público "${row.name}" criado e sincronizado com o Meta CAPI & Google!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>AUDIÊNCIAS & SEGMENTAÇÃO</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Públicos Personalizados — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Crie listas para remarketing e sincronize com Meta Custom Audiences e Google Ads.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#2563EB', borderColor: '#2563EB', fontSize: '12px' }}>
          <Plus size={15} /> Criar Público
        </button>
      </div>

      <div className="module-card-grid">
        {audiences.map((a, i) => (
          <div key={i} className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, background: "var(--disk-color-info-subtle)", color: a.color, padding: '2px 6px', borderRadius: '4px' }}>
                ● {a.capi}
              </span>
              <Users size={16} style={{ color: "var(--disk-text-muted)" }} />
            </div>
            <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)", display: 'block' }}>{a.name}</strong>
            <span style={{ fontSize: '12px', color: "var(--disk-text-muted)", marginTop: '4px', display: 'block' }}>{a.size}</span>
            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: "1px solid var(--disk-border-default)", display: 'flex', gap: '6px' }}>
              <button className="btn secondary" style={{ height: '28px', fontSize: '11px', flex: 1 }} onClick={() => notify(`Público "${a.name}" sincronizado com Meta CAPI!`)}>
                Sincronizar Meta
              </button>
              <button className="btn secondary" style={{ height: '28px', fontSize: '11px', flex: 1 }} onClick={() => notify(`Exportando CSV de "${a.name}"...`)}>
                <Download size={12} /> CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>AUDIÊNCIA & CAPI</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Criar Público Personalizado</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateAudience} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Nome do Público *</label>
                <input type="text" required placeholder="Ex: Compradores VIP Setor Premium" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Regra de Segmentação</label>
                <select value={newRule} onChange={e => setNewRule(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                  <option value="Compradores nos últimos 90 dias">Compradores nos últimos 90 dias</option>
                  <option value="Abandonos de checkout últimos 14 dias">Abandonos de checkout últimos 14 dias</option>
                  <option value="Visitantes da página que não compraram">Visitantes da página que não compraram</option>
                  <option value="Clientes VIP (Gasto acima de R$ 500)">Clientes VIP (Gasto acima de R$ 500)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#2563EB', borderColor: '#2563EB' }}>Salvar e Sincronizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 8. Cashback Promocional
function CashbackPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rules, setRules] = useState([
    { id: 1, name: 'Cashback 5% no Pix', paymentMethod: 'PIX', percentage: '5%', validity: '45 dias', status: 'ativo' },
    { id: 2, name: 'Cashback 3% no Cartão', paymentMethod: 'Cartão de Crédito', percentage: '3%', validity: '30 dias', status: 'ativo' }
  ])

  const [ruleName, setRuleName] = useState('')
  const [method, setMethod] = useState('PIX')
  const [pct, setPct] = useState('5')

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName) return
    const row = {
      id: Date.now(),
      name: ruleName,
      paymentMethod: method,
      percentage: `${pct}%`,
      validity: '30 dias',
      status: 'ativo'
    }
    setRules([...rules, row])
    setIsModalOpen(false)
    setRuleName('')
    notify(`🚀 Regra de Cashback "${row.name}" ativada para o evento!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MOTOR DE CASHBACK & RECOMPENSAS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Cashback Promocional — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Conceda saldo promocional de volta na carteira do cliente para compras futuras.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#D97706', borderColor: '#D97706', fontSize: '12px' }}>
          <Plus size={15} /> Nova Regra de Cashback
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Saldo Emitido</span><WalletCards size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ 14.280,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Saldo Resgatado</span><Coins size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>R$ 9.450,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Taxa de Recompra</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>66,1%</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Regras Ativas</span><TicketPercent size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>{rules.length} vigentes</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Regras de Cashback Configuradas ({rules.length})</h3></div>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Regra</th><th>Método de Pagamento</th><th>% Cashback</th><th>Validade</th><th>Status</th></tr></thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td><span className="badge-method">{r.paymentMethod}</span></td>
                <td><strong style={{ color: '#16A34A' }}>{r.percentage}</strong></td>
                <td>{r.validity}</td>
                <td><span className="status-badge green">● Ativo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>CASHBACK FIDELIDADE</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Nova Regra de Cashback</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Nome da Regra *</label>
                <input type="text" required placeholder="Ex: Cashback 5% Lote Especial" value={ruleName} onChange={e => setRuleName(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Forma de Pagamento</label>
                  <select value={method} onChange={e => setMethod(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                    <option value="PIX">PIX Instantâneo</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Todos os Métodos">Todos os Métodos</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Percentual (%)</label>
                  <input type="number" min="1" max="50" value={pct} onChange={e => setPct(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#D97706', borderColor: '#D97706' }}>Ativar Cashback</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 9. Coins / Pontos de Fidelidade
function DiskCoinsPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rewards, setRewards] = useState([
    { id: 1, name: 'Copo Oficial do Evento', cost: '300 coins', category: 'Brinde Oficial', stock: 150 },
    { id: 2, name: 'Upgrade para Área VIP', cost: '1.200 coins', category: 'Experiência VIP', stock: 20 },
    { id: 3, name: 'Vale Bebida R$ 25 no Bar', cost: '450 coins', category: 'Consumação', stock: 300 }
  ])

  const [rewardName, setRewardName] = useState('')
  const [rewardCost, setRewardCost] = useState('500')
  const [rewardCategory, setRewardCategory] = useState('Brinde Oficial')

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rewardName) return
    const row = {
      id: Date.now(),
      name: rewardName,
      cost: `${rewardCost} coins`,
      category: rewardCategory,
      stock: 100
    }
    setRewards([...rewards, row])
    setIsModalOpen(false)
    setRewardName('')
    notify(`🚀 Recompensa "${row.name}" adicionada ao catálogo de resgate!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>PROGRAMA DE PONTOS DISKCOINS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>DiskCoins Fidelidade — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Acúmulo automático de pontos por real gasto em ingressos.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#0D9488', borderColor: '#0D9488', fontSize: '12px' }}>
          <Plus size={15} /> Nova Recompensa
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Coins Emitidos</span><Coins size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>345.000</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Coins Resgatados</span><Gift size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>210.000</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Clientes Ativos</span><Users size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>2.840</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Regra Padrão</span><Sparkles size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>10 coins / R$ 100</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Catálogo de Resgate ({rewards.length})</h3></div>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Item / Recompensa</th><th>Categoria</th><th>Custo em Coins</th><th>Estoque</th><th>Ações</th></tr></thead>
          <tbody>
            {rewards.map(r => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong></td>
                <td><span className="badge-method">{r.category}</span></td>
                <td><strong style={{ color: '#0D9488' }}>{r.cost}</strong></td>
                <td>{r.stock} un.</td>
                <td><button className="btn secondary" style={{ height: '28px', fontSize: '10px' }} onClick={() => notify(`Estoque de "${r.name}" atualizado!`)}>Editar Estoque</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0D9488', textTransform: 'uppercase' }}>CATÁLOGO DE RESGATE</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Cadastrar Nova Recompensa</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateReward} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Nome da Recompensa *</label>
                <input type="text" required placeholder="Ex: Camiseta Exclusiva do Show" value={rewardName} onChange={e => setRewardName(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Categoria</label>
                  <select value={rewardCategory} onChange={e => setRewardCategory(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                    <option value="Brinde Oficial">Brinde Oficial</option>
                    <option value="Experiência VIP">Experiência VIP</option>
                    <option value="Consumação">Consumação</option>
                    <option value="Desconto Ingresso">Desconto em Ingressos</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Custo em Coins</label>
                  <input type="number" min="50" value={rewardCost} onChange={e => setRewardCost(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#0D9488', borderColor: '#0D9488' }}>Salvar Recompensa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 10. Gamificação de Eventos
function GamificationPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [missions, setMissions] = useState([
    { title: 'Compre no 1º Lote', desc: 'Garanta seu ingresso nas primeiras 48h', reward: '500 Coins + Badge Fã VIP', progress: '1.240 completaram' },
    { title: 'Indique 3 Amigos', desc: 'Compartilhe seu link e traga amigos para o evento', reward: 'Copo Oficial no Evento', progress: '418 completaram' },
    { title: 'Compartilhe o Lineup', desc: 'Poste o flyer nos Stories com a tag oficial', reward: 'Cupom 10% OFF no Bar', progress: '890 completaram' }
  ])

  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [reward, setReward] = useState('')

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    const row = {
      title,
      desc: desc || 'Complete o desafio e ganhe benefícios no evento',
      reward: reward || '250 Coins DiskIngressos',
      progress: '0 completaram'
    }
    setMissions([...missions, row])
    setIsModalOpen(false)
    setTitle('')
    setDesc('')
    setReward('')
    notify(`🚀 Missão de gamificação "${row.title}" lançada para os fãs!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MISSÕES & GAMIFICAÇÃO</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Gamificação do Evento — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Engaje o público com desafios e libere benefícios exclusivos.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#D97706', borderColor: '#D97706', fontSize: '12px' }}>
          <Plus size={15} /> Criar Missão
        </button>
      </div>

      <div className="module-card-grid">
        {missions.map((m, idx) => (
          <div key={idx} className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Trophy size={18} style={{ color: '#D97706' }} />
              <strong style={{ color: "var(--disk-text-primary)", fontSize: '14px' }}>{m.title}</strong>
            </div>
            <p style={{ fontSize: '11px', color: "var(--disk-text-muted)", margin: '4px 0' }}>{m.desc}</p>
            <div style={{ background: "var(--disk-color-warning-subtle)", border: "1px solid var(--disk-color-warning-border)", padding: '6px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: "var(--disk-color-warning-text)", marginTop: '8px' }}>
              🎁 Recompensa: {m.reward}
            </div>
            <small style={{ color: '#16A34A', fontWeight: 600, display: 'block', marginTop: '8px' }}>
              ✓ {m.progress}
            </small>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>ENGAGEMENT & MISSÕES</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Nova Missão de Gamificação</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateMission} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Título da Missão *</label>
                <input type="text" required placeholder="Ex: Marque 3 amigos no Instagram Oficial" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Descrição do Desafio</label>
                <textarea rows={3} placeholder="Descreva o que o fã precisa fazer..." value={desc} onChange={e => setDesc(e.target.value)} style={{ width: '100%', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '8px 10px', fontSize: '12px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Recompensa / Benefício</label>
                <input type="text" placeholder="Ex: 500 Coins + 10% de Desconto no Bar" value={reward} onChange={e => setReward(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#D97706', borderColor: '#D97706' }}>Lançar Missão</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 11. Indique e Ganhe
function ReferralProgramPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bonusPercent, setBonusPercent] = useState('10')
  const [friendDiscount, setFriendDiscount] = useState('5')

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(false)
    notify(`🚀 Programa Indique e Ganhe atualizado: ${bonusPercent}% de bônus para quem indica e ${friendDiscount}% de desconto para o amigo!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>PROGRAMA DE INDICAÇÃO</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Indique e Ganhe — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Transforme seus clientes em promotores ativos do evento.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#2563EB', borderColor: '#2563EB', fontSize: '12px' }}>
          <Settings2 size={15} /> Configurar Programa
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Indicações Totais</span><Share2 size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>1.420</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Vendas Geradas</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>486</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Receita de Indicação</span><WalletCards size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>R$ 78.400,00</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Bônus Concedidos</span><Gift size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ 7.840,00</strong>
        </article>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>REGRAS DE INDICAÇÃO</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Configurar Indique e Ganhe</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveProgram} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Bônus para o Padrinho (%)</label>
                <input type="number" min="1" max="30" value={bonusPercent} onChange={e => setBonusPercent(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Desconto para o Amigo Convidado (%)</label>
                <input type="number" min="1" max="20" value={friendDiscount} onChange={e => setFriendDiscount(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#2563EB', borderColor: '#2563EB' }}>Salvar Configurações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 12. Afiliados & Parceiros
function AffiliatesManager({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [affiliates, setAffiliates] = useState([
    { id: 1, name: 'Curitiba Shows PR', code: 'PROMOTER_CURITIBA', commission: '8%', sales: 342, revenue: 54720, status: 'ativo' },
    { id: 2, name: 'Universitários PR Eventos', code: 'UNIVERSITARIOS_PR', commission: '10%', sales: 270, revenue: 43730, status: 'ativo' }
  ])

  const [affiliateName, setAffiliateName] = useState('')
  const [affiliateCode, setAffiliateCode] = useState('')
  const [affiliateComm, setAffiliateComm] = useState('8%')

  const handleCreateAffiliate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!affiliateName) return
    const row = {
      id: Date.now(),
      name: affiliateName,
      code: (affiliateCode || affiliateName.toUpperCase().replace(/\s+/g, '_')),
      commission: affiliateComm,
      sales: 0,
      revenue: 0,
      status: 'ativo'
    }
    setAffiliates([...affiliates, row])
    setIsModalOpen(false)
    setAffiliateName('')
    setAffiliateCode('')
    notify(`🚀 Afiliado/Promoter "${row.name}" cadastrado com sucesso!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>REDE DE AFILIADOS OFICIAIS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Afiliados e Promoters — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Gestão de comissionamento automático para promotores parceiros.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#2563EB', borderColor: '#2563EB', fontSize: '12px' }}>
          <Plus size={15} /> Novo Afiliado
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Afiliados Ativos</span><Users size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>{affiliates.length}</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Vendas dos Parceiros</span><MousePointerClick size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>{affiliates.reduce((s, a) => s + a.sales, 0)}</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Receita Gerada</span><WalletCards size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>R$ {affiliates.reduce((s, a) => s + a.revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Comissão Paga</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>R$ {(affiliates.reduce((s, a) => s + a.revenue, 0) * 0.08).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Promoters & Afiliados Cadastrados ({affiliates.length})</h3></div>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Afiliado</th><th>Código UTM / Cupom</th><th>Comissão</th><th>Vendas</th><th>Receita</th><th>Status</th></tr></thead>
          <tbody>
            {affiliates.map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td><code style={{ background: "var(--disk-bg-muted)", padding: '2px 6px', borderRadius: '4px', color: '#2563EB', fontSize: '11px' }}>{a.code}</code></td>
                <td><span className="badge-method">{a.commission}</span></td>
                <td><strong style={{ color: "var(--disk-text-primary)" }}>{a.sales}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {a.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><span className="status-badge green">● Ativo</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>AFILIADOS & PROMOTERS</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Novo Afiliado Parceiro</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateAffiliate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Nome do Afiliado / Empresa *</label>
                <input type="text" required placeholder="Ex: Promoter Curitiba VIP" value={affiliateName} onChange={e => setAffiliateName(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Código do Cupom / Slug UTM</label>
                <input type="text" placeholder="Ex: PROMOTER_VIP" value={affiliateCode} onChange={e => setAffiliateCode(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Comissão</label>
                <select value={affiliateComm} onChange={e => setAffiliateComm(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                  <option value="8%">8% sobre as vendas</option>
                  <option value="10%">10% sobre as vendas</option>
                  <option value="12%">12% sobre as vendas</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#2563EB', borderColor: '#2563EB' }}>Cadastrar Afiliado</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 13. Central de Conversões (Jornada Multi-Touch)
function ConversionJourneyPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const touchpoints = [
    { step: '1. Clique no Anúncio', channel: 'Instagram Stories (UTM: lancamento_2026)', count: '14.850 cliques', rate: '100%' },
    { step: '2. Sessão no Site', channel: 'Landing Page Oficial DiskIngressos', count: '11.880 sessões', rate: '80,0%' },
    { step: '3. Adicionou ao Carrinho', channel: 'Seleção de Setor & Quantidade', count: '2.376 adições', rate: '16,0%' },
    { step: '4. Início de Checkout', channel: 'Identificação CPF / Pagamento', count: '1.188 checkouts', rate: '8,0%' },
    { step: '5. Compra Concluída', channel: 'Pagamento Aprovado (Pix / Cartão)', count: '712 compras', rate: '4,8%' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>JORNADA DE ATRIBUIÇÃO MULTI-TOUCH</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px' }}>Central de Conversões — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)" }}>Mapeamento ponta a ponta desde o primeiro ponto de contato até a emissão do ingresso.</p>
        </div>
        <button className="btn secondary" onClick={() => notify('Exportando fluxo de conversão...')}>
          <Download size={15} /> Exportar Fluxo
        </button>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
        <table className="growth-table">
          <thead><tr><th>Etapa da Jornada</th><th>Canal / Ponto de Contato</th><th>Volume</th><th>Taxa de Retenção</th></tr></thead>
          <tbody>
            {touchpoints.map((t, idx) => (
              <tr key={idx}>
                <td><strong>{t.step}</strong></td>
                <td><span className="badge-method">{t.channel}</span></td>
                <td><strong>{t.count}</strong></td>
                <td style={{ color: '#2563EB', fontWeight: 700 }}>{t.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}

// 14. Recuperação de Vendas & Remarketing
function RecoverySalesPage({ events, event = defaultFallbackEvent, notify }: { events: EventItem[]; event?: EventItem; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [abandonedList, setAbandonedList] = useState([
    { id: 1, name: 'Marcos Vinicius', email: 'marcos.v@email.com', phone: '(41) 99771-4433', items: '2x Pista Premium', value: 360, time: '35 min atrás', channel: 'WhatsApp', status: 'pendente' },
    { id: 2, name: 'Carla Silveira', email: 'carla.s@email.com', phone: '(41) 98822-1100', items: '1x Camarote VIP', value: 280, time: '1h atrás', channel: 'E-mail', status: 'pendente' },
    { id: 3, name: 'Lucas Brandão', email: 'lucas.b@email.com', phone: '(41) 99199-8822', items: '4x Pista Promocional', value: 480, time: '3h atrás', channel: 'WhatsApp', status: 'recuperado' }
  ])

  const [channel, setChannel] = useState('WhatsApp')
  const [couponCode, setCouponCode] = useState('VOLTA5')

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(false)
    notify(`🚀 Régua de recuperação disparada via ${channel} com cupom ${couponCode} para os carrinhos pendentes!`)
  }

  const recoverSingle = (id: number, name: string) => {
    setAbandonedList(abandonedList.map(a => a.id === id ? { ...a, status: 'recuperado' } : a))
    notify(`Mensagem de recuperação enviada para ${name}!`)
  }

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>RECUPERAÇÃO OPERACIONAL DE VENDAS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Recuperação de Vendas — {eventTitle}</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Resgate carrinhos e checkouts abandonados com disparos automáticos de WhatsApp e e-mail.</p>
        </div>
        <button className="btn primary" onClick={() => setIsModalOpen(true)} style={{ background: '#2563EB', borderColor: '#2563EB', fontSize: '12px' }}>
          <Send size={15} /> Disparar Régua de Recuperação
        </button>
      </div>

      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Carrinhos Abandonados</span><ShieldCheck size={18} /></div>
          <strong style={{ color: '#EA580C', fontSize: '20px' }}>48</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Recuperados</span><CheckCircle size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>19</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Taxa de Recuperação</span><TrendingUp size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>39,5%</strong>
        </article>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Receita Salva</span><WalletCards size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>R$ 5.890,00</strong>
        </article>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: 0 }}>
        <div className="panel-head" style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><h3 style={{ margin: 0, color: "var(--disk-text-primary)", fontSize: '16px', fontWeight: 800 }}>Abandonos Recentes ({abandonedList.length})</h3></div>
        </div>
        <table className="growth-table" style={{ margin: 0 }}>
          <thead><tr><th>Cliente</th><th>Ingressos no Carrinho</th><th>Valor Total</th><th>Tempo</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            {abandonedList.map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong><br /><small style={{ color: "var(--disk-text-muted)" }}>{a.phone}</small></td>
                <td>{a.items}</td>
                <td><strong style={{ color: "var(--disk-text-primary)" }}>R$ {a.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                <td><small style={{ color: "var(--disk-text-muted)" }}>{a.time}</small></td>
                <td>
                  <span className={`status-badge ${a.status === 'recuperado' ? 'green' : 'orange'}`}>
                    {a.status === 'recuperado' ? '✓ Recuperado' : '⏳ Pendente'}
                  </span>
                </td>
                <td>
                  {a.status !== 'recuperado' ? (
                    <button className="btn primary" style={{ height: '28px', fontSize: '11px', padding: '0 10px' }} onClick={() => recoverSingle(a.id, a.name)}>
                      <Send size={12} /> Resgatar
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>Concluído</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      {isModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setIsModalOpen(false)}>
          <div className="utm-modal-card-v2" style={{ width: 'min(500px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>RÉGUA AUTOMÁTICA</span>
                <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Disparar Régua de Recuperação</h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsModalOpen(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSendRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Canal de Envio</label>
                <select value={channel} onChange={e => setChannel(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                  <option value="WhatsApp">WhatsApp Oficial (API Meta)</option>
                  <option value="E-mail">E-mail Marketing Transacional</option>
                  <option value="WhatsApp + E-mail">Multicanal (WhatsApp + E-mail)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '4px' }}>Cupom de Incentivo (Opcional)</label>
                <input type="text" placeholder="Ex: VOLTA5 (5% OFF)" value={couponCode} onChange={e => setCouponCode(e.target.value)} style={{ width: '100%', height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '13px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary" style={{ background: '#2563EB', borderColor: '#2563EB' }}>Enviar Agora</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

// 15. Performance por Canal, Ranking & Insights
function ChannelPerformancePage({ events, event = defaultFallbackEvent, subMode, notify }: { events: EventItem[]; event?: EventItem; subMode: Mode; notify: (m: string) => void }) {
  const safeEvent = event || defaultFallbackEvent
  const eventTitle = safeEvent.title || 'Todos os Eventos'
  const channelData = [
    { channel: 'Instagram Ads', spent: 4500, sales: 245, revenue: 39200, roi: '771%', cpa: 'R$ 18,36', rank: '🥇 1º' },
    { channel: 'Google Search Ads', spent: 3200, sales: 154, revenue: 26180, roi: '718%', cpa: 'R$ 20,77', rank: '🥈 2º' },
    { channel: 'WhatsApp Disparo VIP', spent: 850, sales: 88, revenue: 14960, roi: '1660%', cpa: 'R$ 9,65', rank: '🥉 3º' },
    { channel: 'TikTok Ads', spent: 1800, sales: 72, revenue: 11520, roi: '540%', cpa: 'R$ 25,00', rank: '4º' },
    { channel: 'E-mail Marketing', spent: 400, sales: 41, revenue: 6560, roi: '1540%', cpa: 'R$ 9,75', rank: '5º' }
  ]

  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>INTELIGÊNCIA DE PERFORMANCE & CANAIS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px' }}>
            {subMode === 'campaign-ranking' ? 'Ranking de Campanhas' : subMode === 'funnel-insights' ? 'Diagnóstico do Funil & Insights' : 'Performance por Canal'} — {eventTitle}
          </h2>
          <p style={{ color: "var(--disk-text-muted)" }}>Comparação de ROI, ROAS, CPA e eficiência econômica de cada canal.</p>
        </div>
        <button className="btn secondary" onClick={() => notify('Exportando matriz de performance...')}>
          <Download size={15} /> Exportar Matriz
        </button>
      </div>

      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
        <table className="growth-table">
          <thead><tr><th>Posição</th><th>Canal de Marketing</th><th>Investimento</th><th>Vendas</th><th>Receita</th><th>CPA</th><th>ROI</th></tr></thead>
          <tbody>
            {channelData.map(c => (
              <tr key={c.channel}>
                <td><strong>{c.rank}</strong></td>
                <td><strong>{c.channel}</strong></td>
                <td>R$ {c.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td><strong>{c.sales}</strong></td>
                <td style={{ color: '#16A34A', fontWeight: 700 }}>R$ {c.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>{c.cpa}</td>
                <td style={{ color: '#2563EB', fontWeight: 800 }}>{c.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  )
}


/* =========================================================================
   HELPER UTILITIES
   ========================================================================= */

function Links({ events, initialEventId, notify }: { producerId: number | null; events: EventItem[]; initialEventId?: number; notify: (m: string) => void }) {
  const [eventId, setEventId] = useState<number | undefined>(initialEventId || events[0]?.id)
  const selectedEvent = events.find(e => e.id === eventId) || events[0]
  return (
    <section className="growth-page utm-marketing-entry" style={{ padding: '0 4px', background: 'transparent' }}>
      {!selectedEvent ? (
        <article className="growth-panel feature-empty utm-event-empty">
          <Link2 size={36} />
          <h3>A Central UTM começa pelo evento</h3>
          <p>Nenhum evento encontrado para carregar métricas de UTM.</p>
        </article>
      ) : (
        <UtmConversionsCenter
          event={selectedEvent}
          events={events}
          onSelectEvent={(ev) => setEventId(ev.id)}
          notify={notify}
        />
      )}
    </section>
  )
}

function Tracking({ producerId, events, initialEventId, notify }: { producerId: number | null; events: EventItem[]; initialEventId?: number; notify: (m: string) => void }) {
  return <section className="growth-page"><TrackingIntegrationsManager producerId={producerId} events={events} fixedEventId={initialEventId} notify={notify} /></section>
}

function Context({ producerName, events, eventId, setEventId, period, setPeriod }: { producerName: string; events: EventItem[]; eventId: string; setEventId: (v: string) => void; period: string; setPeriod: (v: string) => void }) {
  return (
    <div className="growth-context" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
      <div>
        <span style={{ color: "var(--disk-text-muted)" }}>Produtora</span>
        <strong style={{ color: "var(--disk-text-primary)" }}>{producerName}</strong>
      </div>
      <label>
        <span style={{ color: "var(--disk-text-muted)" }}>Evento Selecionado</span>
        <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ color: "var(--disk-text-primary)", fontWeight: 600 }}>
          <option value="all">Todos os eventos ({events.length})</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </select>
      </label>
      <label>
        <span style={{ color: "var(--disk-text-muted)" }}>Período de Análise</span>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ color: "var(--disk-text-primary)", fontWeight: 600 }}>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="year">Ano 2026 (Consolidado)</option>
        </select>
      </label>
    </div>
  )
}

function Funnel({ n, label, w }: { n: string; label: string; w: string }) {
  return (
    <div className="funnel-step" style={{ width: w, background: "var(--disk-color-info-subtle)", borderColor: "var(--disk-color-info-border)" }}>
      <span style={{ color: "var(--disk-text-secondary)" }}>{label}</span>
      <b style={{ color: "var(--disk-color-info-text)" }}>{n}</b>
    </div>
  )
}

function FeaturePage({ title, eventName, producerName, notify }: { title: string; eventName: string; producerName: string; notify: (m: string) => void }) {
  return (
    <section className="growth-page">
      <div className="growth-intro growth-actions">
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MARKETING & GROWTH</p>
          <h2>{title}</h2>
          <p>{producerName} · {eventName}</p>
        </div>
        <button className="btn primary" onClick={() => notify(`${title}: ação registrada com sucesso.`)}>
          <Plus size={17} /> Nova ação
        </button>
      </div>
      <article className="growth-panel feature-empty" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)" }}>
        <Megaphone size={34} style={{ color: '#2563EB' }} />
        <h3>{title}</h3>
        <p>Módulo operacional integrado ao contexto de eventos, produtores e atribuição de receitas.</p>
        <div className="feature-badges">
          <span>Multi-produtor</span>
          <span>Contexto por evento</span>
          <span>Atribuição UTM</span>
          <span>Auditoria</span>
        </div>
      </article>
    </section>
  )
}
