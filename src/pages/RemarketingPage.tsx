import React, { useState, useMemo } from 'react'
import {
  ArrowUpRight, Clock3, Mail, MessageCircle, Repeat2, ShoppingCart,
  Target, TrendingUp, Users, Sparkles, Zap, BarChart3, UserCheck,
  CheckCircle2, AlertCircle, DollarSign, Filter, RefreshCw, Send,
  ChevronRight, ArrowRight, ShieldCheck, PieChart, WalletCards, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import RecoveryCenterPage from './RecoveryCenterPage'

type Mode =
  | 'hub'
  | 'dashboard'
  | 'carts'
  | 'audiences'
  | 'segments'
  | 'flows'
  | 'whatsapp'
  | 'email'
  | 'payments'
  | 'inactive'
  | 'postevent'
  | 'automation'
  | 'reports'

type Props = {
  events: EventItem[]
  producerName: string
  producerId: number | null
  mode: Mode
  notify: (m: string) => void
  onNavigate?: (page: any) => void
}

const remarketingModules = [
  { id: 'remarketing-dashboard', title: 'Dashboard', description: 'Recuperação, receita e conversão.', icon: BarChart3, badge: 'Visão Geral' },
  { id: 'remarketing-carts', title: 'Carrinhos Abandonados', description: 'Sessões interrompidas e resgate.', icon: ShoppingCart, badge: '🔥 Alta Prioridade' },
  { id: 'remarketing-payments', title: 'Recuperação de Pix & Pagamentos', description: 'Pix e cartões pendentes com timer.', icon: Clock3, badge: '⚡ Resgate Imediato' },
  { id: 'remarketing-flows', title: 'Régua de Fluxos de Resgate', description: 'Jornadas automatizadas de 3 etapas.', icon: Repeat2, badge: 'Automação' },
  { id: 'remarketing-whatsapp', title: 'WhatsApp Remarketing', description: 'Mensagens diretas de recuperação.', icon: MessageCircle, badge: 'Conversão 38%' },
  { id: 'remarketing-email', title: 'E-mail Remarketing', description: 'Jornadas e campanhas de retorno.', icon: Mail, badge: 'Base Própria' },
  { id: 'remarketing-inactive', title: 'Clientes Inativos', description: 'Reativação de edições anteriores.', icon: UserCheck, badge: 'Fidelização' },
  { id: 'remarketing-reports', title: 'Relatórios de Resgate', description: 'Performance e receita recuperada.', icon: TrendingUp, badge: 'Atribuição UTM' }
]

export default function RemarketingPage({ events, producerName, producerId, mode, notify, onNavigate }: Props) {
  const [selectedEventId, setSelectedEventId] = useState<number | 'all'>('all')
  const [period, setPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('30d')

  if (mode === 'hub') {
    return (
      <section className="growth-page">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => (onNavigate ? onNavigate('profile-dashboard') : window.history.back())}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
          >
            <ArrowLeft size={14} className="text-[#06B6D4]" />
            <span>Voltar ao Dashboard</span>
          </button>
        </div>
        <div className="growth-intro" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '16px' }}>
          <div>
            <p className="eyebrow remarketing" style={{ color: '#D97706', fontWeight: 800 }}>MOTOR DE RESGATE & CONVERSÃO</p>
            <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Hub de Remarketing & Recuperação</h2>
            <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Recupere carrinhos abandonados, Pix não pagos e reative clientes sem custo extra de tráfego.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('remarketing-carts')
                else notify('Abrindo Carrinhos Abandonados...')
              }}
              className="h-10 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 border border-amber-600 cursor-pointer"
            >
              <ShoppingCart size={15} /> Ver Carrinhos Abertos
            </button>
          </div>
        </div>

        <div className="module-card-grid" style={{ marginTop: '20px' }}>
          {remarketingModules.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className="finance-module-card remarketing-card interactive-hub-card"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item.id)
                  } else {
                    notify(`Abrindo ${item.title}...`)
                  }
                }}
              >
                <span className="module-card-icon" style={{ background: "var(--disk-color-warning-subtle)", color: '#D97706' }}>
                  <Icon size={24} />
                </span>
                <span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>{item.title}</strong>
                    {item.badge && (
                      <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: "var(--disk-bg-muted)", color: "var(--disk-text-secondary)" }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <small style={{ color: "var(--disk-text-muted)", fontSize: '12px' }}>{item.description}</small>
                </span>
                <ArrowUpRight size={18} className="card-arrow-icon" />
              </button>
            )
          })}
        </div>
      </section>
    )
  }

  if (['carts', 'flows', 'whatsapp', 'email', 'payments', 'inactive', 'postevent', 'automation', 'audiences', 'segments', 'reports'].includes(mode)) {
    const targetMode = mode === 'audiences' || mode === 'segments' ? 'flows' : mode === 'reports' ? 'carts' : mode
    return (
      <div className="remarketing-submodule-wrap">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => (onNavigate ? onNavigate('remarketing-dashboard') : window.history.back())}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
          >
            <ArrowLeft size={14} className="text-[#06B6D4]" />
            <span>Voltar ao Menu Remarketing</span>
          </button>
        </div>
        <RecoveryCenterPage producerId={producerId} events={events} mode={targetMode as any} notify={notify} />
      </div>
    )
  }

  // Dashboard Remarketing View
  return (
    <section className="growth-page">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => (onNavigate ? onNavigate('profile-dashboard') : window.history.back())}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard</span>
        </button>
      </div>

      {/* 1. Header & Context */}
      <div className="growth-intro" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="eyebrow remarketing" style={{ color: '#D97706', fontWeight: 800 }}>MOTOR DE RESGATE & CONVERSÃO</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '22px', margin: '2px 0 4px' }}>Dashboard de Remarketing</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px', margin: 0 }}>Visão consolidada de oportunidades abertas, taxa de recuperação e receita resgatada.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Event Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: "var(--disk-bg-muted)", padding: '6px 12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)", fontSize: '13px' }}>
            <Filter size={14} color="#64748B" />
            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              style={{ background: 'transparent', border: 0, fontWeight: 600, color: "var(--disk-text-primary)", cursor: 'pointer', outline: 'none' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: "var(--disk-bg-muted)", padding: '4px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
            {['7d', '14d', '30d', 'all'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p as any)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 0,
                  cursor: 'pointer',
                  background: period === p ? '#FFFFFF' : 'transparent',
                  color: period === p ? '#0F172A' : '#64748B',
                  fontWeight: period === p ? 800 : 600,
                  boxShadow: period === p ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {p === 'all' ? 'Tudo' : p}
              </button>
            ))}
          </div>

          {/* Quick Trigger */}
          <button
            onClick={() => notify('Processando fila de resgate multicanal (WhatsApp e E-mail)...')}
            className="h-10 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 border border-amber-600 cursor-pointer"
          >
            <Zap size={15} /> Processar Fila
          </button>
        </div>
      </div>

      {/* 2. Top 4 Recovery KPIs */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Receita Recuperada</span>
            <span style={{ padding: '6px', background: "var(--disk-color-success-subtle)", color: '#16A34A', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#16A34A', display: 'block', margin: '4px 0 2px' }}>
            R$ 38.450,00
          </strong>
          <small style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <ArrowUpRight size={13} /> +22.4% no período
          </small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Oportunidades em Aberto</span>
            <span style={{ padding: '6px', background: "var(--disk-color-warning-subtle)", color: '#D97706', borderRadius: '8px' }}>
              <ShoppingCart size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: "var(--disk-text-primary)", display: 'block', margin: '4px 0 2px' }}>
            1.280 checkouts
          </strong>
          <small style={{ color: "var(--disk-text-muted)" }}>R$ 96.200,00 em potencial recuperável</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Taxa de Conversão</span>
            <span style={{ padding: '6px', background: "var(--disk-color-info-subtle)", color: '#2563EB', borderRadius: '8px' }}>
              <Target size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#2563EB', display: 'block', margin: '4px 0 2px' }}>
            24,8%
          </strong>
          <small style={{ color: "var(--disk-text-muted)" }}>318 pedidos concluídos após lembrete</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '16px', borderRadius: '12px' }}>
          <div className="kpi-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-muted)" }}>Pix & Boletos Salvos</span>
            <span style={{ padding: '6px', background: "var(--disk-color-purple-subtle)", color: '#9333EA', borderRadius: '8px' }}>
              <Clock3 size={18} />
            </span>
          </div>
          <strong style={{ fontSize: '22px', fontWeight: 900, color: '#9333EA', display: 'block', margin: '4px 0 2px' }}>
            R$ 19.820,00
          </strong>
          <small style={{ color: "var(--disk-text-muted)" }}>142 reservas pagas via Copia e Cola</small>
        </article>
      </div>

      {/* 3. Recovery Financial Extra Profit Card */}
      <div style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: "1px solid var(--disk-color-warning-border)", padding: '18px 22px', borderRadius: '14px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#D97706', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: "var(--disk-color-warning-text)" }}>
              Faturamento Extra Gerado sem Custo Adicional de Mídia
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: "var(--disk-color-warning-text)" }}>
              O motor automático de recuperação adicionou <strong>R$ 38.450,00 líquidos</strong> ao caixa do produtor reimpactando quem já tinha interesse de compra.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onNavigate) onNavigate('remarketing-flows')
            else notify('Abrindo Régua de Fluxos...')
          }}
          style={{ padding: '8px 16px', background: '#D97706', color: '#FFFFFF', border: 0, borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          Otimizar Régua de Disparos <ChevronRight size={14} />
        </button>
      </div>

      {/* 4. Automated Recovery Journey (3 Stages Timeline) */}
      <div style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '20px', borderRadius: '14px', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: "var(--disk-text-primary)" }}>Régua de Recuperação Automatizada (Jornada em 3 Etapas)</h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>Tempo de disparo inteligente baseado no momento de abandono do checkout</p>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', background: "var(--disk-color-success-subtle)", color: '#16A34A' }}>
            ● 3 Gatilhos Ativos
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {/* Stage 1 */}
          <div style={{ padding: '16px', background: "var(--disk-bg-muted)", borderRadius: '10px', border: "1px solid var(--disk-border-default)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', background: "var(--disk-color-info-subtle)", padding: '2px 8px', borderRadius: '6px' }}>
                ETAPA 1 · 15 MINUTOS
              </span>
              <strong style={{ fontSize: '13px', color: '#16A34A' }}>34% Conv.</strong>
            </div>
            <h4 style={{ margin: '10px 0 4px', fontSize: '14px', fontWeight: 800, color: "var(--disk-text-primary)" }}>Lembrete Amigável de Reserva</h4>
            <p style={{ margin: 0, fontSize: '12px', color: "var(--disk-text-muted)" }}>
              Dispara WhatsApp & E-mail lembrando que os ingressos ainda estão guardados no carrinho.
            </p>
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: "1px solid var(--disk-border-default)", fontSize: '11px', color: "var(--disk-text-secondary)", display: 'flex', justifyContent: 'space-between' }}>
              <span>Canal: <strong>WhatsApp + E-mail</strong></span>
              <span>Resgatados: <strong>R$ 14.800</strong></span>
            </div>
          </div>

          {/* Stage 2 */}
          <div style={{ padding: '16px', background: "var(--disk-color-warning-subtle)", borderRadius: '10px', border: "1px solid var(--disk-color-warning-border)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', background: "var(--disk-color-warning-subtle)", padding: '2px 8px', borderRadius: '6px' }}>
                ETAPA 2 · 2 HORAS
              </span>
              <strong style={{ fontSize: '13px', color: '#16A34A' }}>46% Conv. 🔥</strong>
            </div>
            <h4 style={{ margin: '10px 0 4px', fontSize: '14px', fontWeight: 800, color: "var(--disk-text-primary)" }}>Incentivo com Cupom VIP 10% OFF</h4>
            <p style={{ margin: 0, fontSize: '12px', color: "var(--disk-text-muted)" }}>
              Oferece cupom dinâmico e link direto de pagamento com validade de 60 minutos.
            </p>
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: "1px solid var(--disk-color-warning-border)", fontSize: '11px', color: "var(--disk-text-secondary)", display: 'flex', justifyContent: 'space-between' }}>
              <span>Cupom: <strong>DISK10</strong></span>
              <span>Resgatados: <strong>R$ 18.250</strong></span>
            </div>
          </div>

          {/* Stage 3 */}
          <div style={{ padding: '16px', background: "var(--disk-bg-muted)", borderRadius: '10px', border: "1px solid var(--disk-border-default)" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9333EA', background: "var(--disk-color-purple-subtle)", padding: '2px 8px', borderRadius: '6px' }}>
                ETAPA 3 · 24 HORAS
              </span>
              <strong style={{ fontSize: '13px', color: '#16A34A' }}>20% Conv.</strong>
            </div>
            <h4 style={{ margin: '10px 0 4px', fontSize: '14px', fontWeight: 800, color: "var(--disk-text-primary)" }}>Último Aviso de Esgotamento</h4>
            <p style={{ margin: 0, fontSize: '12px', color: "var(--disk-text-muted)" }}>
              Alerta de liberação de vaga para o próximo cliente da fila caso o pedido não seja pago.
            </p>
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: "1px solid var(--disk-border-default)", fontSize: '11px', color: "var(--disk-text-secondary)", display: 'flex', justifyContent: 'space-between' }}>
              <span>Gatilho: <strong>Urgência Máxima</strong></span>
              <span>Resgatados: <strong>R$ 5.400</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
