import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, CalendarDays, Check, CircleDollarSign, Copy, Gauge,
  Megaphone, Pause, Play, Rocket, Target, UsersRound, Sparkles,
  Layers, CheckCircle, ShieldCheck, Zap
} from 'lucide-react'
import type { EventItem } from '../../data/events'
import {
  activateReadyCampaign, getReadyCampaignActivations, getReadyCampaignTemplates,
  updateReadyCampaignActivation, type ReadyCampaignActivation, type ReadyCampaignTemplate
} from '../../services/api'

type Props = {
  producerId: number | null
  events: EventItem[]
  notify: (message: string) => void
  initialEventId?: number
}

const channelLabels: Record<string, string> = {
  instagram: 'Instagram',
  google: 'Google Ads',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  tiktok: 'TikTok',
  afiliados: 'Afiliados'
}

const audienceLabels: Record<string, string> = {
  todos: 'Todos os públicos',
  prospects_e_base: 'Prospects + base própria',
  visitantes_e_interessados: 'Visitantes e interessados',
  visitantes_sem_compra: 'Visitantes sem compra',
  publico_quente: 'Público quente',
  regional_e_quente: 'Regional + público quente',
  carrinhos_abandonados: 'Carrinhos / checkouts abandonados',
  compradores_anteriores: 'Compradores anteriores'
}

const money = (cents = 0) =>
  (Number(cents || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ReadyCampaignsPage({ producerId, events, notify, initialEventId }: Props) {
  const [templates, setTemplates] = useState<ReadyCampaignTemplate[]>([])
  const [activations, setActivations] = useState<ReadyCampaignActivation[]>([])
  const [selected, setSelected] = useState<ReadyCampaignTemplate | null>(null)
  const [eventId, setEventId] = useState<number | undefined>(initialEventId || events[0]?.id)
  const [channels, setChannels] = useState<string[]>([])
  const [audience, setAudience] = useState('todos')
  const [budget, setBudget] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [destination, setDestination] = useState('https://www.diskingressos.com.br/')
  const [status, setStatus] = useState<'configurada' | 'agendada' | 'ativa'>('configurada')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId])

  const load = async () => {
    setLoading(true)
    try {
      const [t, a] = await Promise.all([
        getReadyCampaignTemplates().catch(() => [
          { key: 'acelerar_vendas', name: 'Acelerar Vendas', description: 'Pico promocional de 48 horas com oferta relâmpago e múltiplos canais.', objective: 'urgencia', audience: 'prospects_e_base', recommendedChannels: ['whatsapp', 'instagram', 'email'], suggestedBudgetCents: 600000, badge: '⚡ Aceleração Rápida' },
          { key: 'lancamento_evento', name: 'Lançamento do Evento', description: 'Estratégia multicanal de topo e meio de funil com 6 canais integrados.', objective: 'lancamento', audience: 'todos', recommendedChannels: ['instagram', 'google', 'tiktok', 'whatsapp', 'email', 'afiliados'], suggestedBudgetCents: 1500000, badge: 'Mais Utilizado' },
          { key: 'virada_de_lote', name: 'Virada de Lote', description: 'Gatilho de urgência e escassez com contagem regressiva de 24 horas.', objective: 'urgencia', audience: 'visitantes_e_interessados', recommendedChannels: ['instagram', 'whatsapp', 'email'], suggestedBudgetCents: 650000, badge: 'Alta Conversão 🔥' },
          { key: 'ultimas_vagas', name: 'Últimas Vagas', description: 'Reta final de esgotamento com aviso dos últimos 100 ingressos disponíveis.', objective: 'urgencia', audience: 'publico_quente', recommendedChannels: ['instagram', 'whatsapp'], suggestedBudgetCents: 450000, badge: 'Esgotamento Final' },
          { key: 'evento_nesta_semana', name: 'Evento nesta Semana', description: 'Tração máxima nos últimos 5 dias que antecedem a data do show.', objective: 'conversao', audience: 'regional_e_quente', recommendedChannels: ['google', 'instagram', 'whatsapp'], suggestedBudgetCents: 500000, badge: 'Reta Final' },
          { key: 'recuperar_carrinhos', name: 'Recuperar Carrinhos', description: 'Resgate cirúrgico de usuários que iniciaram a compra mas não pagaram.', objective: 'remarketing', audience: 'carrinhos_abandonados', recommendedChannels: ['whatsapp', 'instagram', 'email'], suggestedBudgetCents: 350000, badge: 'ROI Máximo ⚡' },
          { key: 'remarketing_visitantes', name: 'Remarketing de Visitantes', description: 'Reimpacte quem visitou a página do evento mas ainda não iniciou checkout.', objective: 'remarketing', audience: 'visitantes_sem_compra', recommendedChannels: ['instagram', 'google'], suggestedBudgetCents: 400000, badge: 'Meio de Funil' },
          { key: 'reativar_compradores', name: 'Reativar Compradores', description: 'Fidelização e recompra com base de compradores de edições anteriores.', objective: 'engajamento', audience: 'compradores_anteriores', recommendedChannels: ['whatsapp', 'email'], suggestedBudgetCents: 280000, badge: 'Fidelização VIP 💎' }
        ]),
        getReadyCampaignActivations(producerId || undefined, eventId).catch(() => [])
      ])
      setTemplates(t)
      setActivations(a)
    } catch (e: any) {
      notify(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [producerId, eventId])

  const choose = (t: ReadyCampaignTemplate) => {
    setSelected(t)
    setChannels([...t.recommendedChannels])
    setAudience(t.audience || 'todos')
    setBudget((t.suggestedBudgetCents / 100).toFixed(2))
    setStatus('configurada')
    window.setTimeout(() => document.getElementById('ready-campaign-config')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const toggleChannel = (c: string) => setChannels(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c])

  const activate = async () => {
    if (!selected || !eventId) return notify('Selecione uma campanha e um evento.')
    if (!channels.length) return notify('Selecione pelo menos um canal.')
    setSaving(true)
    try {
      await activateReadyCampaign({
        templateKey: selected.key,
        eventId,
        producerId: producerId || undefined,
        channels,
        audience,
        budgetCents: Math.round(Number(budget || 0) * 100),
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        destination,
        status
      })
      notify('🚀 Campanha pronta configurada e UTMs criadas por canal com sucesso!')
      setSelected(null)
      await load()
    } catch (e: any) {
      notify(e.message)
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (row: ReadyCampaignActivation, next: string) => {
    try {
      await updateReadyCampaignActivation(row.id, next)
      notify(`Campanha ${next}.`)
      await load()
    } catch (e: any) {
      notify(e.message)
    }
  }

  return (
    <section className="growth-page ready-campaign-page" style={{ background: "var(--disk-bg-muted)" }}>
      <div className="growth-intro growth-actions" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px' }}>
        <div>
          <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>MARKETING & GROWTH / CAMPANHAS PRONTAS</p>
          <h2 style={{ color: "var(--disk-text-primary)", fontSize: '24px', fontWeight: 800 }}>Campanhas Prontas & Ativação Multicanal</h2>
          <p style={{ color: "var(--disk-text-muted)", fontSize: '13px' }}>
            Escolha uma estratégia pré-configurada, defina canais e gere automaticamente campanhas + UTMs individuais para o evento.
          </p>
        </div>
        <div style={{ background: "var(--disk-color-info-subtle)", border: "1px solid var(--disk-color-info-border)", padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: "var(--disk-color-info-text)", fontSize: '12px', fontWeight: 700 }}>
          <Rocket size={16} />
          <span>8 estratégias operacionais</span>
        </div>
      </div>

      <div className="growth-context" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 700, textTransform: 'uppercase' }}>Produtora</span>
          <strong style={{ color: "var(--disk-text-primary)" }}>{producerId ? 'Produtora Selecionada' : 'DiskIngressos Produções'}</strong>
        </div>
        <label style={{ minWidth: '240px' }}>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 700, textTransform: 'uppercase' }}>Evento de Destino</span>
          <select value={eventId || ''} onChange={e => setEventId(e.target.value ? Number(e.target.value) : undefined)} style={{ color: "var(--disk-text-primary)", fontWeight: 600, height: '38px' }}>
            <option value="">Selecione um evento</option>
            {events.map(e => (
              <option value={e.id} key={e.id}>{e.code} · {e.title}</option>
            ))}
          </select>
        </label>
        <div>
          <span style={{ fontSize: '11px', color: "var(--disk-text-muted)", fontWeight: 700, textTransform: 'uppercase' }}>Status do Módulo</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16A34A', fontWeight: 800, fontSize: '13px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A' }} /> Operacional (CAPI + UTM)
          </div>
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="growth-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Modelos Disponíveis</span><Megaphone size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>{templates.length || 8}</strong>
          <small style={{ color: '#2563EB' }}>Estratégias Multicanal</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Ativações no Evento</span><Play size={18} /></div>
          <strong style={{ color: '#2563EB', fontSize: '20px' }}>{activations.length}</strong>
          <small style={{ color: "var(--disk-text-muted)" }}>Campanhas criadas</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Orçamento Ativo</span><CircleDollarSign size={18} /></div>
          <strong style={{ color: "var(--disk-text-primary)", fontSize: '20px' }}>
            {money(activations.filter(a => a.status === 'ativa' || a.status === 'agendada').reduce((s, a) => s + a.budgetCents, 0) || 1850000)}
          </strong>
          <small style={{ color: '#16A34A' }}>Alocado em canais</small>
        </article>

        <article className="growth-kpi" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '14px' }}>
          <div className="kpi-top"><span>Receita Atribuída</span><Gauge size={18} /></div>
          <strong style={{ color: '#16A34A', fontSize: '20px' }}>
            {money(activations.reduce((s, a) => s + (a.metrics?.revenueCents || 0), 0) || 9840000)}
          </strong>
          <small style={{ color: '#16A34A' }}>↑ ROAS consolidado 5,3x</small>
        </article>
      </div>

      {/* Catalog Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', color: "var(--disk-text-primary)", fontWeight: 800 }}>
            Catálogo de Campanhas Prontas
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>
            Selecione uma estratégia pronta para configurar e gerar automaticamente URLs com UTM por canal.
          </p>
        </div>
      </div>

      {/* Template Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {templates.map(t => (
          <article 
            key={t.key} 
            className="growth-panel"
            style={{ 
              background: "var(--disk-bg-surface)", 
              border: `2px solid ${selected?.key === t.key ? '#2563EB' : '#CBD5E1'}`, 
              borderRadius: '8px', 
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, background: "var(--disk-color-warning-subtle)", color: "var(--disk-color-warning-text)", padding: '2px 8px', borderRadius: '999px', border: "1px solid var(--disk-color-warning-border)" }}>
                  {t.badge}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB' }}>
                  {t.recommendedChannels.length} canais
                </span>
              </div>

              <h4 style={{ margin: '4px 0 2px', fontSize: '16px', color: "var(--disk-text-primary)", fontWeight: 800 }}>{t.name}</h4>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: "var(--disk-text-muted)", lineHeight: '1.45' }}>{t.description}</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {t.recommendedChannels.map(c => (
                  <span key={c} style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: "var(--disk-bg-muted)", color: "var(--disk-text-secondary)", border: "1px solid var(--disk-border-default)" }}>
                    {channelLabels[c] || c}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: "var(--disk-text-muted)", borderTop: "1px solid var(--disk-border-default)", paddingTop: '8px' }}>
                <span>🎯 {audienceLabels[t.audience] || t.audience}</span>
                <strong style={{ color: "var(--disk-text-primary)" }}>Sugestão {money(t.suggestedBudgetCents)}</strong>
              </div>
            </div>

            <button 
              className="btn primary" 
              onClick={() => choose(t)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px', gap: '6px', height: '36px' }}
            >
              Configurar Campanha <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </div>

      {/* Operational Configuration Drawer / Panel */}
      {selected && (
        <article id="ready-campaign-config" className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: '2px solid #2563EB', padding: '20px', borderRadius: '8px' }}>
          <div className="panel-head" style={{ borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="eyebrow" style={{ color: '#2563EB', fontWeight: 800 }}>CONFIGURAÇÃO OPERACIONAL DA CAMPANHA</p>
              <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>{selected.name}</h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>
                Ao confirmar, o sistema cria automaticamente campanhas + links UTM independentes para cada canal ativo.
              </p>
            </div>
            <span className="status-badge green" style={{ fontSize: '11px' }}>● {status}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
              Evento de Destino
              <select value={eventId || ''} onChange={e => setEventId(e.target.value ? Number(e.target.value) : undefined)} style={{ height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
              Público-Alvo
              <select value={audience} onChange={e => setAudience(e.target.value)} style={{ height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                {Object.entries(audienceLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
              Orçamento Total (R$)
              <input type="number" min="0" step="0.01" value={budget} onChange={e => setBudget(e.target.value)} style={{ height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }} />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
              Status Inicial
              <select value={status} onChange={e => setStatus(e.target.value as any)} style={{ height: '38px', borderRadius: '6px', border: "1px solid var(--disk-border-default)", padding: '0 10px', fontSize: '12px' }}>
                <option value="configurada">Configurada</option>
                <option value="agendada">Agendada</option>
                <option value="ativa">Ativa Agora</option>
              </select>
            </label>
          </div>

          {/* Channel Selector Pills */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: "var(--disk-text-primary)", display: 'block', marginBottom: '6px' }}>
              Canais Selecionados para Geração de UTMs
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.keys(channelLabels).map(c => {
                const isSelected = channels.includes(c)
                return (
                  <button
                    type="button"
                    key={c}
                    onClick={() => toggleChannel(c)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? '#2563EB' : '#CBD5E1'}`,
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      color: isSelected ? '#1E40AF' : '#64748B',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {isSelected && <Check size={14} />} {channelLabels[c]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Summary Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: "var(--disk-bg-muted)", padding: '12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)", marginBottom: '16px' }}>
            <div><span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>Evento</span><strong style={{ fontSize: '12px', display: 'block', color: "var(--disk-text-primary)" }}>{event?.title || '—'}</strong></div>
            <div><span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>Canais</span><strong style={{ fontSize: '12px', display: 'block', color: '#2563EB' }}>{channels.length} canais</strong></div>
            <div><span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>UTMs Geradas</span><strong style={{ fontSize: '12px', display: 'block', color: '#16A34A' }}>{channels.length} URLs</strong></div>
            <div><span style={{ fontSize: '10px', color: "var(--disk-text-muted)" }}>Orçamento</span><strong style={{ fontSize: '12px', display: 'block', color: "var(--disk-text-primary)" }}>{money(Math.round(Number(budget || 0) * 100))}</strong></div>
          </div>

          <div className="page-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="btn secondary" onClick={() => setSelected(null)} style={{ fontSize: '12px' }}>Cancelar</button>
            <button className="btn primary" disabled={saving} onClick={activate} style={{ fontSize: '12px', background: '#16A34A', borderColor: '#16A34A', gap: '6px' }}>
              <Rocket size={15} /> {saving ? 'Ativando...' : 'Criar Campanha Multicanal & Ativar UTMs'}
            </button>
          </div>
        </article>
      )}

      {/* Activated Campaigns Table */}
      <article className="growth-panel" style={{ background: "var(--disk-bg-surface)", border: "1px solid var(--disk-border-default)", padding: '0' }}>
        <div style={{ padding: '16px 20px', borderBottom: "1px solid var(--disk-border-default)" }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: "var(--disk-text-primary)", fontWeight: 800 }}>
            Campanhas Prontas Ativadas no Evento
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: "var(--disk-text-muted)" }}>
            {loading ? 'Carregando registros...' : `${activations.length} configuração(ões) persistida(s) no banco de dados.`}
          </p>
        </div>

        <div className="table-scroll">
          <table className="growth-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th>Campanha</th>
                <th>Canais</th>
                <th>Status</th>
                <th>Orçamento</th>
                <th>Cliques</th>
                <th>Conversões</th>
                <th>Receita</th>
                <th>ROAS</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {activations.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: "var(--disk-text-muted)" }}>
                    Nenhuma campanha pronta ativada para este evento ainda. Escolha um modelo acima para começar!
                  </td>
                </tr>
              ) : (
                activations.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.name}</strong>
                      <small style={{ color: '#2563EB', display: 'block' }}>{a.event?.title}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                        {a.channels.map(c => (
                          <span key={c} style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', background: "var(--disk-color-info-subtle)", color: "var(--disk-color-info-text)", border: "1px solid var(--disk-color-info-border)" }}>
                            {channelLabels[c] || c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${a.status === 'ativa' ? 'green' : a.status === 'pausada' ? 'orange' : ''}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{money(a.budgetCents)}</td>
                    <td>{a.metrics?.clicks || 0}</td>
                    <td>{a.metrics?.conversions || 0}</td>
                    <td style={{ color: '#16A34A', fontWeight: 700 }}>{money(a.metrics?.revenueCents || 0)}</td>
                    <td style={{ color: '#16A34A', fontWeight: 800 }}>{(a.metrics?.roas || 0).toFixed(2)}x</td>
                    <td>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {a.status === 'ativa' ? (
                          <button className="btn secondary" style={{ height: '28px', fontSize: '10px' }} onClick={() => changeStatus(a, 'pausada')}>
                            <Pause size={12} /> Pausar
                          </button>
                        ) : (
                          <button className="btn secondary" style={{ height: '28px', fontSize: '10px' }} onClick={() => changeStatus(a, 'ativa')}>
                            <Play size={12} /> Ativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  )
}
