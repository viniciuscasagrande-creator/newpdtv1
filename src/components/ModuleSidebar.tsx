import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
// FASE 25.3.2.1 RELEASE: 25.3.2.1-premium-sidebar-auto-collapse-2026-09-02
import { canAccess, type AppUser } from '../auth/model'
import {
  ArrowLeft, WalletCards, HandCoins, TrendingUp, ReceiptText, TrendingDown, Landmark, Scale,
  ChartNoAxesCombined, Split, Brain, CreditCard, ShieldCheck, Ticket,
  PlusSquare, SlidersHorizontal, Users, ScanFace, BarChart3, MonitorSmartphone, ShoppingCart,
  LockKeyhole, MessageCircle, Megaphone, Repeat2, Building2, ChevronRight, UserCog, ScrollText,
  Mail, Tags, Target, UsersRound, ShoppingBag, Clock3,
  FileSpreadsheet, Sparkles, ChevronDown, ListTree, BookOpenText, BookMarked,
  FileSignature, Boxes, BookOpenCheck, FileText, Zap, Link2, Headphones, NotebookTabs, Percent, Store, Undo2,
  PanelLeftClose, PanelLeftOpen, Activity, Play, ArrowLeftRight, ArrowDownLeft, ArrowUpRight, CircleDollarSign, Calendar, CheckCircle2, X, Download, Layers, Terminal
} from 'lucide-react'
import { MobileNavigationController } from '../navigation/mobile-controller'

export type ModuleKey = 'events' | 'finance' | 'accounting' | 'pos' | 'facial' | 'admin' | 'marketing' | 'remarketing' | 'sac'

export type PageKey =
  | 'profile-dashboard' | 'global-dashboard' | 'events' | 'operations' | 'new-event' | 'lots' | 'participants' | 'edit-event' | 'event-command-center' | 'event-inventory' | 'event-customer-360' | 'event-dashboard'
  | 'event-support'
  | 'commerce-orders'
  | 'commercial-hub'
  | 'developer-center'
  | 'payments-hub'
  | 'tickets-hub'
  | 'access-control-hub'
  | 'customer-search-hub'
  | 'financial-core'
  | 'event-live-ops' | 'event-incidents' | 'event-revenue-intel' | 'event-global-search' | 'event-permission-engine' | 'event-compliance' | 'event-intelligence' | 'event-readiness' | 'event-forecast' | 'event-day-command' | 'event-producer-executive' | 'event-platform-noc'
  | 'event-tickets' | 'event-courtesy' | 'event-reports' | 'event-details' | 'event-pixel' | 'event-utm' | 'event-ga4' | 'event-traffic' | 'event-meta-ads' | 'event-remarketing' | 'event-users' | 'event-audit' | 'event-permissions' | 'event-commercial-conditions'
  | 'facial'
  // HUBS ENTERPRISE (FASE 28.15.8.1)
  | 'finance-hub-account' | 'finance-hub-bills' | 'finance-hub-treasury' | 'finance-hub-procurement' | 'finance-hub-controlling' | 'finance-hub-reconciliation' | 'finance-hub-reports'
  | 'accounting-hub-operations' | 'accounting-hub-statements' | 'accounting-hub-compliance'
  | 'marketing-hub-campaigns' | 'marketing-hub-communication' | 'marketing-hub-pixels' | 'marketing-hub-analytics'
  // FINANCEIRO
  | 'finance-dashboard' | 'finance-hub' | 'finance' | 'finance-producer-account' | 'finance-statement' | 'finance-cashflow' | 'finance-receivables' | 'finance-payables' | 'finance-spread-simulator'
  | 'finance-payouts' | 'finance-advance' | 'finance-reconciliation' | 'finance-bank-accounts' | 'finance-expenses' | 'finance-bordero' | 'finance-consolidated'
  | 'finance-spread' | 'finance-split' | 'finance-methods' | 'finance-reports' | 'finance-sales' | 'finance-bank' | 'finance-intelligence' | 'finance-custom' | 'finance-operators' | 'finance-negotiations' | 'finance-refunds' | 'finance-disputes' | 'finance-chargebacks' | 'finance-gateways' | 'finance-advanced' | 'finance-rates' | 'finance-pdv'
  | 'finance-accounting' | 'finance-cost-centers' | 'finance-chart-accounts' | 'finance-accounting-entries' | 'finance-obligations' | 'finance-dre' | 'finance-borderos' | 'finance-signatures' | 'finance-closing'
  // CONTABILIDADE
  | 'accounting-dashboard' | 'accounting-chart' | 'accounting-journal' | 'accounting-ledger' | 'accounting-entries' | 'accounting-cost-centers'
  | 'accounting-reconciliation' | 'accounting-audit' | 'accounting-closing'
  | 'accounting-taxes' | 'accounting-nfse' | 'accounting-nfe' | 'accounting-sped' | 'accounting-obligations'
  | 'accounting-dre' | 'accounting-balance-sheet' | 'accounting-trial-balance' | 'accounting-cashflow' | 'accounting-journal-rep' | 'accounting-ledger-rep' | 'accounting-exports'
  | 'accounting-settings' | 'accounting-companies' | 'accounting-integrations'
  | 'accounting-inteligencia' | 'accounting-conciliacao' | 'accounting-rastreabilidade' | 'accounting-balanco' | 'accounting-fechamento' | 'accounting-plano-de-contas' | 'accounting-lancamentos' | 'accounting-documentos' | 'accounting-fiscal' | 'accounting-relatorios'
  // POS & ADMIN & OUTROS
  | 'pos' | 'pos-terminals' | 'pos-sales' | 'pos-closing'
  | 'admin-hub' | 'admin-users' | 'admin-producers' | 'admin-permissions' | 'admin-audit' | 'admin-security'
  | 'marketing-hub' | 'marketing-dashboard' | 'marketing-status-real' | 'marketing-real-status' | 'marketing-campaigns' | 'marketing-ready-campaigns' | 'marketing-create' | 'marketing-meta-ads' | 'marketing-google-ads' | 'marketing-tiktok-ads' | 'marketing-spotify-ads' | 'marketing-spotify' | 'marketing-influencers' | 'marketing-automations' | 'marketing-whatsapp' | 'marketing-email' | 'marketing-crm' | 'marketing-audiences' | 'marketing-coupons' | 'marketing-cashback' | 'marketing-coins' | 'marketing-gamification' | 'marketing-referral' | 'marketing-affiliates' | 'marketing-utm-central' | 'marketing-links' | 'marketing-tracking' | 'marketing-attribution' | 'marketing-conversions' | 'marketing-remarketing' | 'marketing-recovery' | 'marketing-reports' | 'marketing-channel-performance' | 'marketing-campaign-ranking' | 'marketing-funnel-insights' | 'marketing-communications'
  | 'remarketing-hub' | 'remarketing-dashboard' | 'remarketing-carts' | 'remarketing-audiences' | 'remarketing-segments' | 'remarketing-flows' | 'remarketing-whatsapp' | 'remarketing-email' | 'remarketing-payments' | 'remarketing-inactive' | 'remarketing-postevent' | 'remarketing-automation' | 'remarketing-reports'
  | 'sac-hub' | 'sac-dashboard' | 'sac-tickets' | 'sac-new' | 'sac-sla' | 'sac-integrations' | 'sac-knowledge' | 'sac-reports'

type Props = {
  module: ModuleKey
  page: PageKey
  onNavigate: (p: PageKey) => void
  onHome: () => void
  canAdmin?: boolean
  user?: AppUser
  onCollapsedChange?: (collapsed: boolean) => void
  mobileNavOpen?: boolean
}

type Item = {
  key: PageKey
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  badge?: string
  tier?: 'standard' | 'advanced' | 'expert'
  route?: string
  menuKey?: string
}

// 1. MENU PRINCIPAL
const mainItems: Item[] = [
  { key: 'profile-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'events', label: 'Todos os Eventos', icon: Ticket },
  { key: 'commercial-hub', label: 'Comercial', icon: Scale },
  { key: 'commerce-orders', label: 'Pedidos & Vendas', icon: ShoppingBag },
  { key: 'event-support', label: 'Suporte a Eventos', icon: Layers },
  { key: 'developer-center', label: 'Desenvolvedor', icon: Terminal },
  { key: 'operations', label: 'Núcleo Operacional', icon: ChartNoAxesCombined },
  { key: 'new-event', label: 'Novo Evento', icon: PlusSquare },
  { key: 'lots', label: 'Configurar Lotes', icon: SlidersHorizontal },
  { key: 'participants', label: 'Participantes', icon: Users },
  { key: 'facial', label: 'Status Faciais', icon: ScanFace },
  { key: 'pos', label: 'Terminais POS', icon: MonitorSmartphone },
  { key: 'sac-hub', label: 'Atendimento / SAC', icon: Headphones },
  { key: 'admin-hub', label: 'Administração', icon: Building2 },
]

// 2. FINANCEIRO: 8 HUBS ESTRATÉGICOS (FASE 28.15.8.1)
const independentRefundItem: Item = { key: 'finance-refunds', label: 'Estornos', icon: Undo2, badge: 'ERP' }
const mainFinanceDashboardItem: Item = { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: WalletCards }

const financeHubItems: Item[] = [
  { key: 'finance-dashboard', label: 'Dashboard Financeiro', icon: WalletCards },
  { key: 'finance-hub-account', label: 'Conta Financeira', icon: Landmark, route: '/financeiro/conta-financeira' },
  { key: 'finance-hub-bills', label: 'Contas', icon: ArrowDownLeft, route: '/financeiro/contas' },
  { key: 'finance-hub-treasury', label: 'Tesouraria', icon: Landmark, route: '/financeiro/tesouraria' },
  { key: 'finance-hub-procurement', label: 'Compras & Fornecedores', icon: Users, route: '/financeiro/compras-fornecedores' },
  { key: 'finance-hub-controlling', label: 'Controladoria', icon: Boxes, route: '/financeiro/controladoria' },
  { key: 'finance-chart-accounts', label: 'Plano de Contas', icon: BookOpenCheck, route: '/app/finance-chart-accounts', menuKey: 'finance-chart-accounts' },
  { key: 'finance-hub-reconciliation', label: 'Conciliação', icon: CheckCircle2, route: '/financeiro/conciliacao' },
  { key: 'finance-hub-reports', label: 'Relatórios', icon: FileSpreadsheet, route: '/financeiro/relatorios' },
]

// 3. CONTABILIDADE: HUBS ESTRATÉGICOS (FASE 28.15.8.1)
const accountingHubItems: Item[] = [
  { key: 'accounting-dashboard', label: 'Visão Geral', icon: BarChart3, badge: 'Contábil', route: '/contabilidade/dashboard', menuKey: 'accounting-dashboard' },
  { key: 'accounting-hub-operations', label: 'Operação Contábil', icon: BookOpenCheck, route: '/contabilidade/operacao', menuKey: 'accounting-hub-operations' },
  { key: 'accounting-dre', label: 'DRE Gerencial', icon: BarChart3, route: '/contabilidade/dre', menuKey: 'accounting-dre' },
  { key: 'accounting-hub-statements', label: 'Demonstrações', icon: Scale, route: '/contabilidade/demonstracoes', menuKey: 'accounting-hub-statements' },
  { key: 'accounting-hub-compliance', label: 'Fiscal & Compliance', icon: FileSpreadsheet, route: '/contabilidade/fiscal-compliance', menuKey: 'accounting-hub-compliance' },
  { key: 'accounting-relatorios', label: 'Relatórios', icon: Download, route: '/contabilidade/relatorios', menuKey: 'accounting-relatorios' },
]

// 4. MARKETING OPERACIONAL DIRETO (RESTAURAÇÃO CONTROLADA)
const marketingItems: Item[] = [
  { key: 'marketing-dashboard', label: 'Dashboard Marketing', icon: BarChart3 },
  { key: 'marketing-campaigns', label: 'Campanhas Multicanais', icon: Megaphone },
  { key: 'marketing-ready-campaigns', label: 'Campanhas Prontas', icon: Sparkles, badge: '⚡ Pronto' },
  { key: 'marketing-status-real', label: 'Status Real', icon: Activity, badge: 'Ao Vivo' },
  { key: 'marketing-whatsapp', label: 'WhatsApp Marketing', icon: MessageCircle, badge: 'Oficial' },
  { key: 'marketing-email', label: 'E-mail Marketing', icon: Mail },
  { key: 'marketing-automations', label: 'Automações & Jornadas', icon: Zap },
  { key: 'marketing-coupons', label: 'Cupons & Descontos', icon: Tags },
  { key: 'marketing-utm-central', label: 'Central UTM & Links', icon: Link2, badge: 'UTM / QR' },
  { key: 'marketing-affiliates', label: 'Afiliados & Promoters', icon: UsersRound },
  { key: 'marketing-tracking', label: 'Pixels & Conversões', icon: Activity, badge: 'Multi-pixel' },
  { key: 'marketing-spotify-ads', label: 'Spotify Ads', icon: Headphones, badge: 'Áudio' },
  { key: 'marketing-attribution', label: 'Atribuição Multicanal', icon: Scale },
  { key: 'marketing-reports', label: 'Relatórios de Marketing', icon: FileSpreadsheet }
]

function isFinanceHubItemActive(itemKey: PageKey, currentPage: PageKey): boolean {
  if (itemKey === 'finance-dashboard') return currentPage === 'finance-dashboard'
  if (itemKey === 'finance-chart-accounts') return currentPage === 'finance-chart-accounts'
  if (itemKey === 'finance-hub-account' || itemKey === 'finance-hub') {
    return ['finance-hub-account', 'finance-hub', 'finance-producer-account', 'finance-statement', 'finance-split', 'finance-methods'].includes(currentPage)
  }
  if (itemKey === 'finance-hub-bills' || itemKey === 'finance-receivables') {
    return ['finance-hub-bills', 'finance-receivables', 'finance-payables', 'finance-advance', 'finance-payouts', 'finance-cashflow', 'finance-rates'].includes(currentPage)
  }
  if (itemKey === 'finance-hub-treasury' || itemKey === 'finance-bank-accounts') {
    return ['finance-hub-treasury', 'finance-bank-accounts'].includes(currentPage)
  }
  if (itemKey === 'finance-hub-procurement' || itemKey === 'finance-expenses') {
    return ['finance-hub-procurement', 'finance-expenses'].includes(currentPage)
  }
  if (itemKey === 'finance-hub-controlling' || itemKey === 'finance-cost-centers') {
    return ['finance-hub-controlling', 'finance-cost-centers'].includes(currentPage)
  }
  if (itemKey === 'finance-hub-reconciliation' || itemKey === 'finance-reconciliation') {
    return ['finance-hub-reconciliation', 'finance-reconciliation', 'finance-bank'].includes(currentPage)
  }
  if (itemKey === 'finance-hub-reports' || itemKey === 'finance-reports') {
    return ['finance-hub-reports', 'finance-reports', 'finance-bordero', 'finance-consolidated', 'finance-sales'].includes(currentPage)
  }
  return itemKey === currentPage
}

function isAccountingHubItemActive(itemKey: PageKey, currentPage: PageKey): boolean {
  if (itemKey === 'accounting-dashboard') return currentPage === 'accounting-dashboard' || currentPage === 'finance-accounting'
  if (itemKey === 'accounting-dre') return currentPage === 'accounting-dre' || currentPage === 'finance-dre'
  if (itemKey === 'accounting-hub-operations' || itemKey === 'accounting-plano-de-contas') {
    return ['accounting-hub-operations', 'accounting-plano-de-contas', 'accounting-lancamentos', 'accounting-conciliacao', 'accounting-rastreabilidade', 'accounting-fechamento', 'accounting-chart', 'accounting-journal', 'accounting-ledger', 'accounting-entries'].includes(currentPage)
  }
  if (itemKey === 'accounting-hub-statements') {
    return ['accounting-hub-statements', 'accounting-balanco', 'accounting-inteligencia', 'accounting-balance-sheet', 'accounting-trial-balance'].includes(currentPage)
  }
  if (itemKey === 'accounting-hub-compliance' || itemKey === 'accounting-fiscal') {
    return ['accounting-hub-compliance', 'accounting-fiscal', 'accounting-documentos', 'accounting-taxes', 'accounting-nfse', 'accounting-nfe', 'accounting-sped', 'accounting-obligations'].includes(currentPage)
  }
  if (itemKey === 'accounting-relatorios') {
    return ['accounting-relatorios', 'accounting-exports'].includes(currentPage)
  }
  return itemKey === currentPage
}

function isMarketingItemActive(itemKey: PageKey, currentPage: PageKey): boolean {
  if (itemKey === 'marketing-dashboard') return currentPage === 'marketing-dashboard' || currentPage === 'marketing-hub'
  if (itemKey === 'marketing-campaigns') return currentPage === 'marketing-campaigns' || currentPage === 'marketing-create'
  if (itemKey === 'marketing-status-real') return currentPage === 'marketing-status-real' || currentPage === 'marketing-real-status'
  if (itemKey === 'marketing-spotify-ads') return currentPage === 'marketing-spotify-ads' || currentPage === 'marketing-spotify'
  if (itemKey === 'marketing-utm-central') return currentPage === 'marketing-utm-central' || currentPage === 'marketing-links'
  return itemKey === currentPage
}

// 5. REMARKETING & RESGATE
const remarketingItems: Item[] = [
  { key: 'remarketing-hub', label: 'Hub Remarketing', icon: Repeat2 },
  { key: 'remarketing-dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'remarketing-carts', label: 'Carrinhos Abandonados', icon: ShoppingCart },
  { key: 'remarketing-flows', label: 'Fluxos de Recuperação', icon: Repeat2 },
  { key: 'remarketing-whatsapp', label: 'WhatsApp Remarketing', icon: MessageCircle },
  { key: 'remarketing-email', label: 'E-mail Remarketing', icon: Mail },
  { key: 'remarketing-payments', label: 'Recuperação de Pagamento', icon: Clock3 }
]

// 6. ADMINISTRAÇÃO & GOVERNANÇA
const adminItems: Item[] = [
  { key: 'admin-hub', label: 'Central Administrativa', icon: Building2 },
  { key: 'admin-users', label: 'Usuários e Acessos', icon: UserCog },
  { key: 'admin-producers', label: 'Produtoras', icon: Building2 },
  { key: 'admin-permissions', label: 'Perfis e Permissões', icon: ShieldCheck },
  { key: 'admin-audit', label: 'Logs de Auditoria', icon: ScrollText },
  { key: 'admin-security', label: 'Segurança & LGPD', icon: LockKeyhole }
]

function canonicalAccountingKey(p: PageKey): PageKey {
  if (p === 'accounting-chart' || p === 'accounting-cost-centers') return 'accounting-plano-de-contas'
  if (p === 'accounting-entries' || p === 'accounting-journal' || p === 'accounting-ledger' || p === 'finance-accounting-entries') return 'accounting-lancamentos'
  if (p === 'accounting-reconciliation') return 'accounting-conciliacao'
  if (p === 'accounting-closing' || p === 'finance-closing') return 'accounting-fechamento'
  if (p === 'accounting-dre' || p === 'finance-dre') return 'accounting-dre'
  if (p === 'accounting-balance-sheet' || p === 'accounting-trial-balance') return 'accounting-balanco'
  if (p === 'accounting-taxes' || p === 'accounting-sped' || p === 'accounting-obligations' || p === 'finance-obligations') return 'accounting-fiscal'
  if (p === 'finance-borderos' || p === 'finance-signatures') return 'accounting-documentos'
  if (p === 'finance-accounting') return 'accounting-dashboard'
  return p
}

export default function ModuleSidebar({ module, page, onNavigate, onHome, canAdmin = true, user, onCollapsedChange, mobileNavOpen = false }: Props) {
  const refundIndependentPages: PageKey[] = ['finance-refunds', 'finance-disputes', 'finance-chargebacks']
  const isFinanceActive = (page.startsWith('finance-') || page === 'finance') && !refundIndependentPages.includes(page) && page !== 'finance-accounting'
  const isAccountingActive =
    page.startsWith('accounting-') ||
    page === 'finance-accounting' ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/contabilidade') ||
      window.location.hash.startsWith('#/contabilidade')
    ))
  const isMarketingActive =
    page.startsWith('marketing-') ||
    page === 'marketing-spotify' ||
    page === 'marketing-spotify-ads' ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/app/marketing') ||
      window.location.pathname.startsWith('/app/marketing-')
    ))
  const isRemarketingActive = page.startsWith('remarketing-')
  const isAdminActive = page.startsWith('admin-')

  const [openFinance, setOpenFinance] = useState(isFinanceActive)
  const [openAccounting, setOpenAccounting] = useState(isAccountingActive)
  const [openMarketing, setOpenMarketing] = useState(isMarketingActive)
  const [openRemarketing, setOpenRemarketing] = useState(isRemarketingActive)
  const [openAdmin, setOpenAdmin] = useState(isAdminActive)

  useEffect(() => {
    if (isMarketingActive) setOpenMarketing(true)
  }, [page, isMarketingActive])

  useEffect(() => {
    if (isFinanceActive) setOpenFinance(true)
  }, [page, isFinanceActive])

  useEffect(() => {
    if (isAccountingActive) setOpenAccounting(true)
  }, [page, isAccountingActive])

  useEffect(() => {
    if (isRemarketingActive) setOpenRemarketing(true)
  }, [page, isRemarketingActive])

  useEffect(() => {
    if (isAdminActive) setOpenAdmin(true)
  }, [page, isAdminActive])
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      window.localStorage.getItem('disk-sidebar-collapsed') === 'true' ||
      window.localStorage.getItem('safesaff.sidebar.collapsed') === 'true'
    )
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('disk-sidebar-collapsed', String(collapsed))
      window.localStorage.setItem('safesaff.sidebar.collapsed', String(collapsed))
    }
    onCollapsedChange?.(collapsed)
  }, [collapsed, onCollapsedChange])

  const toggleCollapsed = () => setCollapsed(value => !value)

  return (
    <aside
      className={`module-sidebar safesaff-sidebar ${collapsed ? 'safesaff-sidebar--collapsed' : ''} ${mobileNavOpen ? 'sidebar-mobile-expanded' : ''}`}
      id="main-module-sidebar"
      data-testid="main-module-sidebar"
      aria-label="Navegação principal"
      data-core-protection-release="26.x.3.10-runtime-functional-stability-2026-09-03"
      data-finance-release="25.8.2-event-remarketing-functional-2026-09-02 25.8.1-abandoned-cart-tenant-event-scope-2026-09-02 25.8-enterprise-refund-engine-2026-09-02 25.7.1.1-sidebar-typography-hotfix-2026-09-02 25.7.1-universal-conversion-engine-2026-09-02 25.7-marketing-integrations-360-2026-09-02 25.6.1-sidebar-reference-navigation-2026-09-02 25.3.2.1-premium-sidebar-auto-collapse-2026-09-02"
    >
      <div className="sidebar-top-bar safesaff-sidebar-header">
        <button className="back-module safesaff-sidebar-home" onClick={onHome} title="Ir para o início" aria-label="Ir para o início">
          <ArrowLeft size={18} />
          <span>Navegação</span>
        </button>
        <button
          type="button"
          className="safesaff-sidebar-toggle"
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
        >
          {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.8} /> : <PanelLeftClose size={18} strokeWidth={1.8} />}
        </button>
        <button
          type="button"
          className="safesaff-sidebar-mobile-close"
          onClick={() => MobileNavigationController.close()}
          aria-label="Fechar navegação"
          title="Fechar menu"
          data-testid="sidebar-mobile-close"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
      </div>

      <nav className="module-nav">
        <div className="module-caption">MENU PRINCIPAL</div>
        {mainItems.map((it, index) => {
          if (it.key === 'new-event' && user && user.role !== 'producer-admin' && user.role !== 'admin-master' && user.role !== 'admin') return null
          if (it.key === 'admin-hub' && !canAdmin) return null
          return (
            <NavItem
              key={`${it.key}-${index}`}
              item={it}
              active={page === it.key || (it.key === 'events' && ['edit-event', 'event-dashboard'].includes(page))}
              onNavigate={onNavigate}
            />
          )
        })}

        {/* Section: Financeiro (8 Hubs Enterprise — Fase 28.15.8.1) */}
        <CollapsibleSection
          label="Financeiro"
          icon={WalletCards}
          open={openFinance}
          keepOpen={isFinanceActive}
          onToggle={() => { if (collapsed) setCollapsed(false); setOpenFinance(collapsed || !openFinance) }}
          onClose={() => {
            if (!isFinanceActive) setOpenFinance(false)
          }}
        >
          {financeHubItems.map((it, idx) => (
            <NavItem
              key={`fin-hub-${it.key}-${idx}`}
              item={it}
              active={isFinanceHubItemActive(it.key, page)}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Fase 24.9 — Estornos é módulo independente */}
        <span className="sr-only">24.9-independent-refunds-2026-09-02</span>
        <NavItem
          item={independentRefundItem}
          active={refundIndependentPages.includes(page)}
          onNavigate={onNavigate}
        />

        {/* Section: Contabilidade (5 Hubs Enterprise — Fase 28.15.8.1) */}
        <CollapsibleSection
          label="Contabilidade"
          icon={BookOpenCheck}
          open={openAccounting}
          keepOpen={isAccountingActive}
          onToggle={() => { if (collapsed) setCollapsed(false); setOpenAccounting(collapsed || !openAccounting) }}
          onClose={() => {
            if (!isAccountingActive) setOpenAccounting(false)
          }}
        >
          {accountingHubItems.map((it, index) => (
            <NavItem
              key={`acc-hub-${it.key}-${index}`}
              item={it}
              active={isAccountingHubItemActive(it.key, page)}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Section: Marketing (5 Hubs Enterprise — Fase 28.15.8.1) */}
        <CollapsibleSection
          label="Marketing"
          icon={Megaphone}
          open={openMarketing}
          keepOpen={isMarketingActive}
          onToggle={() => { if (collapsed) setCollapsed(false); setOpenMarketing(collapsed || !openMarketing) }}
          onClose={() => {
            if (!isMarketingActive) setOpenMarketing(false)
          }}
        >
          {marketingItems.map((it, index) => (
            <NavItem
              key={`mkt-${it.key}-${index}`}
              item={it}
              active={isMarketingItemActive(it.key, page)}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>


        {/* Section: Remarketing */}
        <CollapsibleSection
          label="Remarketing"
          icon={Repeat2}
          open={openRemarketing}
          keepOpen={isRemarketingActive}
          onToggle={() => { if (collapsed) setCollapsed(false); setOpenRemarketing(collapsed || !openRemarketing) }}
          onClose={() => {
            if (!isRemarketingActive) setOpenRemarketing(false)
          }}
        >
          {remarketingItems.map((it, index) => (
            <NavItem
              key={`rmk-${it.key}-${index}`}
              item={it}
              active={page === it.key}
              onNavigate={onNavigate}
              indent
            />
          ))}
        </CollapsibleSection>

        {/* Section: Administração */}
        {canAdmin && (
          <CollapsibleSection
            label="Administração"
            icon={Building2}
            open={openAdmin}
            keepOpen={isAdminActive}
            onToggle={() => { if (collapsed) setCollapsed(false); setOpenAdmin(collapsed || !openAdmin) }}
            onClose={() => {
              if (!isAdminActive) setOpenAdmin(false)
            }}
          >
            {adminItems.map((it, index) => (
              <NavItem
                key={`adm-${it.key}-${index}`}
                item={it}
                active={page === it.key}
                onNavigate={onNavigate}
                indent
              />
            ))}
          </CollapsibleSection>
        )}
      </nav>
    </aside>
  )
}

function CollapsibleSection({
  label,
  icon: SectionIcon,
  open,
  onToggle,
  onClose,
  keepOpen = false,
  children
}: {
  label: string
  icon?: ComponentType<{ size?: number; strokeWidth?: number }>
  open: boolean
  onToggle: () => void
  onClose: () => void
  keepOpen?: boolean
  children: ReactNode
}) {
  return (
    <div className="collapsible-nav-section">
      <button
        type="button"
        className={`collapsible-section-head ${open ? 'open' : ''}`}
        onClick={onToggle}
        aria-expanded={open}
        title={label}
        data-testid={`collapsible-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {SectionIcon && <span className="module-nav-icon collapsible-section-icon" aria-hidden="true"><SectionIcon size={18} strokeWidth={1.8} /></span>}
        <span className="collapsible-section-label">{label}</span>
        <span className="collapsible-section-chevron" aria-hidden="true">
          <ChevronRight size={14} />
        </span>
      </button>
      <div className={`collapsible-section-body ${open ? 'open' : ''}`} aria-hidden={!open} inert={!open}>
        <div className="collapsible-section-inner">{children}</div>
      </div>
    </div>
  )
}

function NavItem({
  item,
  active,
  onNavigate,
  indent = false
}: {
  item: Item
  active: boolean
  onNavigate: (p: PageKey) => void
  indent?: boolean
}) {
  const Icon = item.icon
  return (
    <button
      className={`module-nav-item ${active ? 'active' : ''} ${indent ? 'indent' : ''}`}
      onClick={() => onNavigate(item.key)}
      title={item.label}
      aria-current={active ? 'page' : undefined}
      data-testid={`nav-${item.key}`}
      data-nav-key={item.key}
      data-route={item.route}
      data-menu-key={item.menuKey || item.key}
      data-protected-module={({
        'events': 'eventos',
        'finance-dashboard': 'financeiro',
        'finance-refunds': 'estornos',
        'marketing-dashboard': 'marketing',
        'sac-hub': 'sac'
      } as Partial<Record<PageKey, string>>)[item.key]}
    >
      <span className="module-nav-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.8} /></span>
      <span className="module-nav-label">{item.label}</span>
      {item.badge && <span className="nav-item-badge">{item.badge}</span>}
      {item.tier === 'expert' && <span className="expert-dot" title="Recurso Expert" />}
    </button>
  )
}
