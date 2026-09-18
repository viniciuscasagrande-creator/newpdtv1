import React, { useState } from 'react'
import {
  Megaphone,
  TrendingUp,
  Target,
  DollarSign,
  Link as LinkIcon,
  Eye,
  MousePointerClick,
  Sparkles,
  Layers,
  Copy,
  Check,
  Zap,
} from 'lucide-react'
import { StatCard } from '../../components/common/StatCard'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DataTable, type Column } from '../../components/common/DataTable'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface CampaignItem {
  id: string
  name: string
  channel: 'meta' | 'google' | 'tiktok' | 'influenciador'
  utmSource: string
  utmCampaign: string
  spend: number
  revenue: number
  roas: number
  cpa: number
  conversions: number
  status: 'ativo' | 'pausado'
}

const mockCampaigns: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Festival Rock 2026 • Lançamento 2º Lote',
    channel: 'meta',
    utmSource: 'facebook_instagram',
    utmCampaign: 'rock26_lote2_feed_reels',
    spend: 24500.0,
    revenue: 198400.0,
    roas: 8.1,
    cpa: 22.1,
    conversions: 1108,
    status: 'ativo',
  },
  {
    id: 'camp-2',
    name: 'Google Search • Fundo de Funil "Comprar Ingresso"',
    channel: 'google',
    utmSource: 'google_ads',
    utmCampaign: 'search_marca_evento_cwb',
    spend: 15200.0,
    revenue: 144000.0,
    roas: 9.47,
    cpa: 16.5,
    conversions: 920,
    status: 'ativo',
  },
  {
    id: 'camp-3',
    name: 'TikTok TopView • Vídeo Artistas Headliners',
    channel: 'tiktok',
    utmSource: 'tiktok_ads',
    utmCampaign: 'tt_lineup_hype',
    spend: 18000.0,
    revenue: 72000.0,
    roas: 4.0,
    cpa: 39.1,
    conversions: 460,
    status: 'ativo',
  },
  {
    id: 'camp-4',
    name: 'Parceria Influenciadores Paraná',
    channel: 'influenciador',
    utmSource: 'instagram_stories',
    utmCampaign: 'influs_cupom_vip',
    spend: 8000.0,
    revenue: 48000.0,
    roas: 6.0,
    cpa: 30.7,
    conversions: 260,
    status: 'pausado',
  },
]

const channelRoasData = [
  { canal: 'Google Ads', roas: 9.5, receita: 144000 },
  { canal: 'Meta Ads', roas: 8.1, receita: 198400 },
  { canal: 'Influenciadores', roas: 6.0, receita: 48000 },
  { canal: 'TikTok Ads', roas: 4.0, receita: 72000 },
]

export function MarketingDashboard() {
  const { selectedEvent, events } = useGlobalContext()
  const activeEvent = selectedEvent || events[0]
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyUtmLink = (campaign: CampaignItem) => {
    const link = `https://diskingressos.com.br/evento/${activeEvent.code}?utm_source=${campaign.utmSource}&utm_medium=cpc&utm_campaign=${campaign.utmCampaign}`
    navigator.clipboard?.writeText(link)
    setCopiedId(campaign.id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const columns: Column<CampaignItem>[] = [
    {
      key: 'name',
      header: 'Campanha & Canal',
      render: (item) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{item.name}</div>
          <div className="font-mono text-[10px] text-slate-400 mt-0.5">
            utm_source={item.utmSource} | utm_campaign={item.utmCampaign}
          </div>
        </div>
      ),
    },
    {
      key: 'spend',
      header: 'Investimento',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-xs font-medium text-slate-700">
          {formatCurrency(item.spend)}
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Receita Atribuída',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-emerald-700">
          {formatCurrency(item.revenue)}
        </span>
      ),
    },
    {
      key: 'roas',
      header: 'ROAS',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
          {item.roas.toFixed(1)}x
        </span>
      ),
    },
    {
      key: 'cpa',
      header: 'CPA Médio',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {formatCurrency(item.cpa)}
        </span>
      ),
    },
    {
      key: 'conversions',
      header: 'Vendas',
      align: 'right',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {formatNumber(item.conversions)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Rastreamento',
      align: 'center',
      render: (item) => (
        <button
          onClick={() => copyUtmLink(item)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
          title="Copiar URL com UTMs"
        >
          {copiedId === item.id ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copiar UTM
            </>
          )}
        </button>
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
              <Megaphone className="h-3 w-3" /> Central de Anúncios & UTMs
            </span>
            <span className="text-xs text-slate-400 font-mono">Meta CAPI • Google Ads • Pixels</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Marketing & Atribuição de Conversão
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Rastreamento de ponta a ponta com múltiplos Meta Pixels, Conversion API (CAPI) por produtora e cálculo de ROAS em tempo real sobre a venda de ingressos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-mono text-emerald-400 border border-slate-700 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> CAPI Ativo (Event Match Quality: 9.2/10)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Receita Atribuída ao Tráfego"
          value={formatCurrency(462400)}
          trend={{ value: '62.5% das vendas totais', isPositive: true }}
          icon={DollarSign}
          iconColor="emerald"
        />
        <StatCard
          title="ROAS Consolidado"
          value="7.04x"
          trend={{ value: '+0.8x vs semana passada', isPositive: true }}
          icon={TrendingUp}
          iconColor="blue"
        />
        <StatCard
          title="Investimento em Mídia"
          value={formatCurrency(65700)}
          subtext="Meta Ads, Google e TikTok Ads"
          icon={Target}
          iconColor="indigo"
        />
        <StatCard
          title="CPA Médio Plataforma"
          value={formatCurrency(23.9)}
          trend={{ value: '-12% custo de aquisição', isPositive: true }}
          icon={MousePointerClick}
          iconColor="amber"
        />
      </div>

      {/* Charts & Pixel Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Eficiência por Canal de Tráfego (ROAS)
              </h3>
              <p className="text-xs text-slate-400">Multiplicador de receita por real investido</p>
            </div>
            <StatusBadge variant="emerald" dot>Ao Vivo</StatusBadge>
          </div>

          <div className="h-60 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelRoasData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="canal" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}x`} />
                <Tooltip
                  formatter={(value: any) => [`${value}x`, 'ROAS']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="roas" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pixel & Conversion API Integrations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Pixels & Rastreamento Server-Side</h3>
            <p className="text-xs text-slate-400">Status dos gateways de atribuição do evento</p>
          </div>

          <div className="space-y-3 py-3">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                <span>Meta Pixel + CAPI Token</span>
                <StatusBadge variant="emerald" size="sm">Conectado</StatusBadge>
              </div>
              <div className="mt-1 text-[11px] font-mono text-slate-500">
                ID: 884719203912882 • Deduplicação 100%
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                <span>Google Ads Conversion (AW-)</span>
                <StatusBadge variant="emerald" size="sm">Conectado</StatusBadge>
              </div>
              <div className="mt-1 text-[11px] font-mono text-slate-500">
                Tag: AW-982739102/purch_rock26
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-900">
                <span>TikTok Events API</span>
                <StatusBadge variant="emerald" size="sm">Conectado</StatusBadge>
              </div>
              <div className="mt-1 text-[11px] font-mono text-slate-500">
                Pixel: C982KJN2781K901
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            Disparos automáticos dos eventos Purchase, InitiateCheckout e AddToCart.
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Central de Campanhas & Links UTM Rastreáveis
            </h3>
            <p className="text-xs text-slate-400">
              Rendimento direto de cada campanha vinculada ao evento {activeEvent.name}
            </p>
          </div>
          <StatusBadge variant="slate">{mockCampaigns.length} Campanhas</StatusBadge>
        </div>

        <div className="mt-4">
          <DataTable
            columns={columns}
            data={mockCampaigns}
            keyExtractor={(item) => item.id}
          />
        </div>
      </div>
    </div>
  )
}
