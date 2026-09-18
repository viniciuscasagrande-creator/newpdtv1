import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BarChart3, CalendarDays, CheckCircle2, CircleDollarSign, Clock3, Download, Eye, FileBarChart2,
  Link2, MapPin, Megaphone, MousePointerClick, Plus, ScanLine, Search, Settings2, ShieldCheck, Ticket,
  TrendingUp, UserCog, Users, Waves, Copy, ExternalLink, Tags, Activity, Globe2, ArrowLeft, Repeat2
} from 'lucide-react'
import type { EventItem } from '../data/events'
import type { Participant } from '../data/participants'
import TrackingIntegrationsManager from '../components/TrackingIntegrationsManager'
import UtmConversionsCenter from '../components/UtmConversionsCenter'
import RecoveryCenterPage from './RecoveryCenterPage'
import EventCommandCenterPage from './EventCommandCenterPage'
import EventInventoryPage from './EventInventoryPage'
import EventCustomer360Page from './EventCustomer360Page'
import EventGlobalSearchPage from './eventos/EventGlobalSearchPage'
import EventLiveOpsPage from './eventos/EventLiveOpsPage'
import EventIncidentsPage from './eventos/EventIncidentsPage'
import EventDayCommandPage from './eventos/EventDayCommandPage'
import EventRevenueIntelPage from './eventos/EventRevenueIntelPage'
import EventForecastCenterPage from './eventos/EventForecastCenterPage'
import EventDiskIntelligencePage from './eventos/EventDiskIntelligencePage'
import EventProducerExecutivePage from './eventos/EventProducerExecutivePage'
import EventActivityStreamPage from './eventos/EventActivityStreamPage'
import EventOSAdvancedPage from './EventOSAdvancedPage'
import EventCommercialDashboardPage from './eventos/EventCommercialDashboardPage'
import EventCommercialConditionsPage from './eventos/EventCommercialConditionsPage'
import { getAutomationSummary, getRecoveryDashboard, type AutomationSummary, type RecoveryDashboard } from '../services/api'
import type { PageKey } from '../components/ModuleSidebar'

type Props={event:EventItem;participants:Participant[];page:PageKey;onNavigate:(p:PageKey)=>void;notify:(message:string)=>void}

export default function EventContextPage({event,participants,page,onNavigate,notify}:Props){
 const people=participants.filter(p=>p.eventId===event.id)
 if(page==='event-command-center') return <EventCommandCenterPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-audit') return <EventActivityStreamPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-inventory') return <EventInventoryPage event={event} notify={notify}/>
 if(page==='event-customer-360') return <EventCustomer360Page event={event} notify={notify} onNavigate={onNavigate}/>
 if(page==='event-global-search') return <EventGlobalSearchPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-live-ops') return <EventLiveOpsPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-incidents') return <EventIncidentsPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-day-command') return <EventDayCommandPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-revenue-intel') return <EventRevenueIntelPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-forecast') return <EventForecastCenterPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-intelligence') return <EventDiskIntelligencePage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-producer-executive') return <EventProducerExecutivePage event={event} onNavigate={onNavigate} notify={notify}/>
 if(['event-permission-engine','event-compliance','event-readiness','event-platform-noc'].includes(page)) return <EventOSAdvancedPage event={event} page={page} notify={notify}/>
 if(page==='event-commercial-conditions') return <EventCommercialConditionsPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-dashboard') return <EventCommercialDashboardPage event={event} onNavigate={onNavigate} notify={notify}/>
 if(page==='event-tickets') return <Tickets event={event} people={people} notify={notify}/>
 if(page==='event-courtesy') return <Courtesy event={event} people={people} notify={notify}/>
 if(page==='event-reports') return <Reports event={event} people={people} notify={notify}/>
 if(page==='event-details') return <Details event={event} notify={notify}/>
 if(page==='event-pixel') return <Tracking event={event} notify={notify}/>
 if(page==='event-utm') return <UtmConversionsCenter event={event} notify={notify}/>
 if(page==='event-ga4') return <Ga4 event={event}/>
 if(page==='event-traffic') return <Traffic event={event}/>
 if(page==='event-meta-ads') return <MetaAds event={event} notify={notify}/>
 if(page==='event-remarketing') return <Remarketing event={event} notify={notify} onNavigate={onNavigate}/>
 return <Generic event={event} page={page} onNavigate={onNavigate} notify={notify}/>
}

function HeaderBlock({eyebrow,title,description,event,action,onBack}:{eyebrow:string;title:string;description:string;event:EventItem;action?:ReactNode;onBack?:()=>void}){
 return <>
  <div className="flex items-center gap-2 mb-3">
    <button
      onClick={()=>onBack ? onBack() : window.history.back()}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
    >
      <ArrowLeft size={14} className="text-[#06B6D4]"/>
      <span>Voltar aos Eventos</span>
    </button>
  </div>
  <section className="context-page-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{action||<div className="event-context-badge"><span>Evento ativo</span><strong>{event.code}</strong></div>}</section><EventStrip event={event}/>
 </>
}
function EventStrip({event}:{event:EventItem}){return <section className="context-event-strip"><div><MapPin size={16}/><span>{event.venue}</span></div><div><CalendarDays size={16}/><span>{event.date}</span></div><div><Ticket size={16}/><span>{event.sales} vendas</span></div><div><Eye size={16}/><span>{event.status}</span></div></section>}

function Tickets({event,people,notify}:{event:EventItem;people:Participant[];notify:(m:string)=>void}){
  const [q,setQ]=useState('')
  const [selectedPerson, setSelectedPerson] = useState<Participant | null>(null)
  const filtered=people.filter(p=>`${p.name} ${p.email} ${p.order} ${p.ticket}`.toLowerCase().includes(q.toLowerCase()))
  return <div className="event-context-page">
    <HeaderBlock eyebrow="INGRESSOS" title="Consultar Ingresso" description="Pesquise pedidos, compradores, ingressos e situação de acesso do evento selecionado." event={event}/>
    <section className="growth-kpis event-context-kpis"><Kpi icon={Ticket} label="Ingressos emitidos" value={String(event.sales)} note="Vendas confirmadas"/><Kpi icon={Users} label="Participantes" value={String(people.length)} note="Base localizada"/><Kpi icon={CheckCircle2} label="Check-ins" value={String(people.filter(p=>p.checkin==='presente').length)} note="Acessos realizados"/><Kpi icon={CircleDollarSign} label="Receita" value={`R$ ${event.total}`} note="Receita registrada"/></section>
    <section className="growth-panel"><div className="context-toolbar"><label className="context-search"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar nome, pedido, e-mail ou ingresso..."/></label><button className="btn secondary" onClick={()=>notify('Exportação de ingressos preparada.') }><Download size={16}/> Exportar</button></div>
      <div className="context-table-wrap"><table className="context-table"><thead><tr><th>Participante</th><th>Pedido</th><th>Ingresso</th><th>Compra</th><th>Valor</th><th>Acesso</th><th></th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><strong>{p.name}</strong><small>{p.email}</small></td><td>{p.order}</td><td>{p.ticket}</td><td>{p.purchaseDate}</td><td>R$ {p.value.toFixed(2).replace('.',',')}</td><td><span className={`mini-status ${p.checkin}`}>{p.checkin}</span></td><td><button className="table-action" onClick={()=>setSelectedPerson(p)}>Ver Ingresso</button></td></tr>)}</tbody></table></div>
    </section>

    {selectedPerson && (
      <div className="modal-backdrop" style={{ zIndex: 1200 }} onClick={() => setSelectedPerson(null)}>
        <div className="utm-modal-card-v2" style={{ width: 'min(480px, 94vw)', background: "var(--disk-bg-surface)", borderRadius: '12px', padding: '24px' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '14px', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>DETALHES DO INGRESSO</span>
              <h3 style={{ margin: '2px 0 0', fontSize: '18px', color: "var(--disk-text-primary)", fontWeight: 800 }}>Pedido #{selectedPerson.order}</h3>
            </div>
            <button type="button" className="drawer-close-btn" onClick={() => setSelectedPerson(null)}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ background: "var(--disk-bg-muted)", padding: '12px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
              <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>TITULAR</div>
              <strong style={{ fontSize: '15px', color: "var(--disk-text-primary)" }}>{selectedPerson.name}</strong>
              <div style={{ color: "var(--disk-text-muted)" }}>{selectedPerson.email} • {selectedPerson.document || 'CPF: ***.458.919-**'}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>TIPO DE INGRESSO</div>
                <strong style={{ color: "var(--disk-text-primary)" }}>{selectedPerson.ticket}</strong>
              </div>
              <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>VALOR PAGO</div>
                <strong style={{ color: '#16A34A' }}>R$ {selectedPerson.value.toFixed(2).replace('.', ',')}</strong>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>STATUS CHECK-IN</div>
                <span className={`mini-status ${selectedPerson.checkin}`} style={{ marginTop: '4px', display: 'inline-block' }}>{selectedPerson.checkin}</span>
              </div>
              <div style={{ background: "var(--disk-bg-muted)", padding: '10px', borderRadius: '8px', border: "1px solid var(--disk-border-default)" }}>
                <div style={{ color: "var(--disk-text-muted)", fontSize: '11px', fontWeight: 700 }}>RECONHECIMENTO FACIAL</div>
                <strong style={{ color: selectedPerson.facial === 'aprovado' ? '#16A34A' : '#D97706' }}>{selectedPerson.facial || 'Aprovado'}</strong>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: "1px solid var(--disk-border-default)", paddingTop: '12px' }}>
            <button type="button" className="btn secondary" onClick={() => setSelectedPerson(null)}>Fechar</button>
            <button type="button" className="btn primary" onClick={() => { notify(`Ingresso #${selectedPerson.order} reenviado para ${selectedPerson.email}!`); setSelectedPerson(null) }}>Reenviar por E-mail</button>
          </div>
        </div>
      </div>
    )}
  </div>
}

function Courtesy({event,people,notify}:{event:EventItem;people:Participant[];notify:(m:string)=>void}){
  const courtesyPeople=people.filter(p=>p.ticket.toLowerCase().includes('cortesia'))
  const [cName, setCName] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cQty, setCQty] = useState(1)
  const [cType, setCType] = useState('Cortesia')

  const handleEmitCourtesy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cName || !cEmail) return
    notify(`🎟️ ${cQty}x ${cType} emitida(s) com sucesso para ${cName} (${cEmail})!`)
    setCName('')
    setCEmail('')
    setCQty(1)
  }

  return <div className="event-context-page"><HeaderBlock eyebrow="CORTESIAS" title="Cortesias" description="Emita e acompanhe cortesias somente deste evento." event={event} action={<button className="btn primary" onClick={() => { const el = document.getElementById('cortesia-form'); el?.scrollIntoView({ behavior: 'smooth' }) }}><Plus size={16}/> Nova cortesia</button>}/>
  <section className="growth-kpis event-context-kpis"><Kpi icon={Tags} label="Cortesias disponíveis" value={event.courtesy.toLocaleString('pt-BR')} note="Saldo configurado"/><Kpi icon={Ticket} label="Emitidas" value={String(courtesyPeople.length)} note="Na base atual"/><Kpi icon={CheckCircle2} label="Utilizadas" value={String(courtesyPeople.filter(p=>p.checkin==='presente').length)} note="Check-in realizado"/><Kpi icon={Users} label="Não utilizadas" value={String(courtesyPeople.filter(p=>p.checkin!=='presente').length)} note="Aguardando acesso"/></section>
  <section className="event-context-two-col"><div className="growth-panel" id="cortesia-form"><div className="panel-head"><h3>Emissão rápida</h3><p>Destino já vinculado ao evento {event.code}.</p></div><form onSubmit={handleEmitCourtesy}><div className="context-form-grid"><label>Nome<input required placeholder="Nome do convidado" value={cName} onChange={e => setCName(e.target.value)} /></label><label>E-mail<input required type="email" placeholder="email@exemplo.com" value={cEmail} onChange={e => setCEmail(e.target.value)} /></label><label>Quantidade<input type="number" min="1" value={cQty} onChange={e => setCQty(Number(e.target.value))} /></label><label>Tipo<select value={cType} onChange={e => setCType(e.target.value)}><option value="Cortesia">Cortesia</option><option value="Imprensa">Imprensa</option><option value="Produção">Produção</option><option value="Patrocinador">Patrocinador</option></select></label></div><button className="btn primary" type="submit" style={{ marginTop: '12px' }}>Emitir cortesia</button></form></div>
  <div className="growth-panel"><div className="panel-head"><h3>Regras do evento</h3><p>Controle operacional da distribuição.</p></div><div className="context-operation-list"><Row label="Limite configurado" value={event.courtesy.toLocaleString('pt-BR')}/><Row label="Validação de e-mail" value="Ativa"/><Row label="QR Code individual" value="Ativo"/><Row label="Auditoria de emissão" value="Ativa"/></div></div></section></div>
}

function Reports({event,people,notify}:{event:EventItem;people:Participant[];notify:(m:string)=>void}){
 const reports=[['Vendas por lote','Comercial'],['Receita e ticket médio','Financeiro'],['Participantes e perfil','Público'],['Check-in e acessos','Operacional'],['Cortesias','Operacional'],['Origem das vendas','Marketing']]
 return <div className="event-context-page"><HeaderBlock eyebrow="RELATÓRIOS" title="Relatórios do Evento" description="Relatórios operacionais, comerciais e de público com o contexto fixado." event={event}/><section className="context-card-grid">{reports.map(([name,cat])=><button className="context-module-card" key={name} onClick={()=>notify(`${name}: relatório gerado para ${event.title}.`)}><span className="context-module-card-icon"><FileBarChart2 size={22}/></span><span><strong>{name}</strong><small>{cat} • Evento {event.code}</small></span><Download size={17}/></button>)}</section><section className="event-context-two-col"><div className="growth-panel"><div className="panel-head"><h3>Resumo comercial</h3></div><div className="context-operation-list"><Row label="Vendas" value={String(event.sales)}/><Row label="Receita" value={`R$ ${event.total}`}/><Row label="Ocupação" value={event.occupancy}/></div></div><div className="growth-panel"><div className="panel-head"><h3>Resumo de público</h3></div><div className="context-operation-list"><Row label="Participantes encontrados" value={String(people.length)}/><Row label="Check-ins" value={String(people.filter(p=>p.checkin==='presente').length)}/><Row label="Facial aprovado" value={String(people.filter(p=>p.facial==='aprovado').length)}/></div></div></section></div>
}

function Details({event,notify}:{event:EventItem;notify:(m:string)=>void}){
 return <div className="event-context-page"><HeaderBlock eyebrow="CONFIGURAÇÃO" title="Detalhes do Evento" description="Dados gerais e parâmetros operacionais do evento selecionado." event={event}/><section className="growth-panel"><div className="panel-head"><h3>Informações gerais</h3><p>Alterações ficam restritas à produtora proprietária do evento.</p></div><div className="context-form-grid context-form-grid-3"><label>Nome do evento<input defaultValue={event.title}/></label><label>Código<input defaultValue={event.code} disabled/></label><label>Status<select defaultValue={event.status}><option value="ativo">Ativo</option><option value="rascunho">Rascunho</option><option value="inativo">Inativo</option></select></label><label>Local<input defaultValue={event.venue}/></label><label>Cidade<input defaultValue={event.city}/></label><label>Data<input defaultValue={event.date}/></label><label>Categoria<input defaultValue={event.category||''}/></label><label>Visibilidade<select defaultValue={event.visibility}><option value="publico">Público</option><option value="privado">Privado</option></select></label><label>Produtora<input defaultValue={event.producer||''} disabled/></label></div><div className="context-form-actions"><button className="btn secondary">Cancelar</button><button className="btn primary" onClick={()=>notify('Detalhes salvos em modo demonstração.')}>Salvar alterações</button></div></section></div>
}

function Tracking({event,notify}:{event:EventItem;notify:(m:string)=>void}){
 return <div className="event-context-page"><HeaderBlock eyebrow="TRACKING" title="Pixels e Conversões" description="Múltiplos Pixels e Tokens API vinculados ao evento selecionado." event={event}/><TrackingIntegrationsManager producerId={event.producerId} events={[event]} fixedEventId={event.id} notify={notify}/></div>
}

function Ga4({event}:{event:EventItem}){
 const channels=[['Organic Search','38%'],['Social','27%'],['Direct','18%'],['Paid Search','11%'],['Referral','6%']]
 return <div className="event-context-page"><HeaderBlock eyebrow="ANALYTICS" title="Analytics GA4" description="Aquisição, comportamento e conversão exclusivamente deste evento." event={event}/><section className="growth-kpis event-context-kpis"><Kpi icon={Users} label="Usuários" value="8.420" note="Últimos 30 dias"/><Kpi icon={Eye} label="Visualizações" value="18.735" note="Páginas e telas"/><Kpi icon={Activity} label="Engajamento" value="62,8%" note="Sessões engajadas"/><Kpi icon={TrendingUp} label="Conversão" value="4,82%" note="Compra concluída"/></section><section className="event-context-two-col"><div className="growth-panel"><div className="panel-head"><h3>Eventos GA4 principais</h3></div><div className="metric-bars">{[['page_view',18735,100],['view_item',12420,66],['begin_checkout',3240,17],['purchase',event.sales||128,8]].map(([n,v,p]:any)=><div className="metric-bar" key={n}><div><span>{n}</span><strong>{Number(v).toLocaleString('pt-BR')}</strong></div><i><b style={{width:`${p}%`}}/></i></div>)}</div></div><div className="growth-panel"><div className="panel-head"><h3>Canais de aquisição</h3></div><div className="context-operation-list">{channels.map(([a,b])=><Row key={a} label={a} value={b}/>)}</div></div></section></div>
}

function Traffic({event}:{event:EventItem}){return <div className="event-context-page"><HeaderBlock eyebrow="AQUISIÇÃO" title="Tráfego do Site" description="Origem das visitas, sessões e desempenho dos canais do evento." event={event}/><section className="growth-kpis event-context-kpis"><Kpi icon={Globe2} label="Sessões" value="12.640" note="Tráfego total"/><Kpi icon={MousePointerClick} label="CTR médio" value="3,84%" note="Campanhas rastreadas"/><Kpi icon={Users} label="Novos usuários" value="7.315" note="57,9% das sessões"/><Kpi icon={Clock3} label="Tempo médio" value="02:48" note="Por sessão"/></section><section className="growth-panel"><div className="panel-head"><h3>Origem do tráfego</h3></div><div className="traffic-grid">{[['Instagram',3840,'30,4%'],['Google',3160,'25,0%'],['WhatsApp',2275,'18,0%'],['Direto',1895,'15,0%'],['E-mail',980,'7,8%'],['Outros',490,'3,8%']].map(x=><div className="traffic-item" key={x[0]}><span>{x[0]}</span><strong>{Number(x[1]).toLocaleString('pt-BR')}</strong><small>{x[2]}</small></div>)}</div></section></div>}

function MetaAds({event,notify}:{event:EventItem;notify:(m:string)=>void}){const campaigns=[['Lançamento','Ativa','R$ 2.400','R$ 10.080','4,20x'],['Último lote','Ativa','R$ 1.650','R$ 6.270','3,80x'],['Remarketing Checkout','Pausada','R$ 780','R$ 2.262','2,90x']];return <div className="event-context-page"><HeaderBlock eyebrow="MÍDIA" title="Campanhas Meta Ads" description="Campanhas e métricas Meta Ads filtradas exclusivamente para o evento." event={event} action={<button className="btn primary" onClick={()=>notify('Nova campanha Meta Ads iniciada.')}><Plus size={16}/> Nova campanha</button>}/><section className="growth-kpis event-context-kpis"><Kpi icon={CircleDollarSign} label="Investimento" value="R$ 4.830" note="Período selecionado"/><Kpi icon={MousePointerClick} label="Cliques" value="6.420" note="CTR 3,91%"/><Kpi icon={Ticket} label="Conversões" value="1.248" note="Compras atribuídas"/><Kpi icon={TrendingUp} label="ROAS" value="3,85x" note="Retorno sobre mídia"/></section><section className="growth-panel"><div className="context-table-wrap"><table className="context-table"><thead><tr><th>Campanha</th><th>Status</th><th>Investimento</th><th>Receita</th><th>ROAS</th><th></th></tr></thead><tbody>{campaigns.map(c=><tr key={c[0]}><td><strong>{c[0]}</strong><small>Evento {event.code}</small></td><td><span className={`mini-status ${c[1]==='Ativa'?'ativo':'pendente'}`}>{c[1]}</span></td><td>{c[2]}</td><td>{c[3]}</td><td><strong>{c[4]}</strong></td><td><button className="table-action" onClick={()=>notify(`Campanha ${c[0]} aberta.`)}>Gerenciar</button></td></tr>)}</tbody></table></div></section></div>}

function Remarketing({event,notify,onNavigate}:{event:EventItem;notify:(m:string)=>void;onNavigate:(p:PageKey)=>void}){
  type RemarketingTab='overview'|'carts'|'payments'|'flows'|'whatsapp'|'email'
  const [tab,setTab]=useState<RemarketingTab>('overview')
  const [summary,setSummary]=useState<AutomationSummary|null>(null)
  const [dashboard,setDashboard]=useState<RecoveryDashboard|null>(null)
  const [loading,setLoading]=useState(false)

  const refresh=async()=>{
    setLoading(true)
    try{
      const [s,d]=await Promise.all([
        getAutomationSummary(event.producerId,event.id),
        getRecoveryDashboard(event.producerId,event.id)
      ])
      setSummary(s);setDashboard(d)
    }catch{
      setSummary(null);setDashboard(null)
    }finally{setLoading(false)}
  }
  useEffect(()=>{refresh()},[event.id,event.producerId])

  const openCount=dashboard?.open ?? summary?.openRecoveries ?? 0
  const inRecovery=dashboard?.inRecovery ?? 0
  const recovered=dashboard?.recovered ?? summary?.recoveredCount ?? 0
  const potentialCents=dashboard?.potentialCents ?? summary?.potentialCents ?? 0
  const recoveredCents=dashboard?.recoveredCents ?? summary?.recoveredCents ?? 0
  const total=openCount+inRecovery+recovered
  const rate=total>0?((recovered/total)*100):0
  const money=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format((cents||0)/100)

  const tabs:[RemarketingTab,string][]=[['overview','Visão Geral'],['carts','Carrinhos Abandonados'],['payments','Pagamento Pendente'],['flows','Fluxos'],['whatsapp','WhatsApp'],['email','E-mail']]

  return <div className="event-context-page event-remarketing-functional">
    <HeaderBlock eyebrow="RECUPERAÇÃO" title="Remarketing do Evento" description="Carrinhos, pagamentos e automações filtrados exclusivamente pelo evento e pela produtora proprietária." event={event} action={<div style={{display:'flex',gap:'8px',alignItems:'center'}}><button className="btn secondary" onClick={refresh} disabled={loading}><Activity size={15}/>{loading?'Atualizando...':'Atualizar'}</button><div className="event-context-badge"><span>Evento ativo</span><strong>{event.code}</strong></div></div>}/>

    <section className="event-remarketing-security-strip">
      <ShieldCheck size={17}/>
      <div><strong>Escopo protegido</strong><span> producerId {event.producerId} • eventId {event.id}. Nenhum dado de outra produtora é carregado nesta tela.</span></div>
    </section>

    <section className="growth-kpis event-context-kpis">
      <Kpi icon={Ticket} label="Carrinhos em aberto" value={String(openCount)} note={`${inRecovery} em recuperação`}/>
      <Kpi icon={CircleDollarSign} label="Potencial" value={money(potentialCents)} note="Receita recuperável"/>
      <Kpi icon={CheckCircle2} label="Recuperados" value={String(recovered)} note={`${rate.toFixed(1).replace('.',',')}% das oportunidades`}/>
      <Kpi icon={TrendingUp} label="Receita recuperada" value={money(recoveredCents)} note="Atribuída aos fluxos"/>
    </section>

    <section className="event-remarketing-tabs" aria-label="Funções de remarketing do evento">
      {tabs.map(([key,label])=><button key={key} type="button" className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}
      <button type="button" onClick={()=>onNavigate('event-meta-ads')}>Campanhas Meta Ads</button>
    </section>

    {tab==='overview' ? <>
      <section className="context-card-grid event-remarketing-actions">
        <ContextAction icon={Waves} title="Carrinho abandonado" text="Consultar oportunidades e iniciar WhatsApp/E-mail para este evento." action={()=>setTab('carts')}/>
        <ContextAction icon={CircleDollarSign} title="Pagamento pendente" text="Recuperar PIX e pagamentos não concluídos exclusivamente deste evento." action={()=>setTab('payments')}/>
        <ContextAction icon={Repeat2} title="Fluxos automáticos" text="Gerenciar réguas, gatilhos e fila multicanal de recuperação." action={()=>setTab('flows')}/>
        <ContextAction icon={Megaphone} title="Campanhas" text="Abrir campanhas Meta Ads mantendo este evento como contexto ativo." action={()=>onNavigate('event-meta-ads')}/>
      </section>
      <section className="event-remarketing-overview-grid">
        <article className="growth-panel"><div className="panel-head"><h3>Saúde da recuperação</h3><p>Resumo operacional do evento selecionado.</p></div><div className="context-operation-list"><Row label="Oportunidades abertas" value={String(openCount)}/><Row label="Em recuperação" value={String(inRecovery)}/><Row label="Recuperadas" value={String(recovered)}/><Row label="Taxa de recuperação" value={`${rate.toFixed(1).replace('.',',')}%`}/></div></article>
        <article className="growth-panel"><div className="panel-head"><h3>Canais</h3><p>Entregas e receita por canal.</p></div><div className="context-operation-list"><Row label="WhatsApp — tentativas" value={String(dashboard?.byChannel?.whatsapp?.attempts||0)}/><Row label="WhatsApp — recuperadas" value={String(dashboard?.byChannel?.whatsapp?.recovered||0)}/><Row label="E-mail — tentativas" value={String(dashboard?.byChannel?.email?.attempts||0)}/><Row label="E-mail — recuperadas" value={String(dashboard?.byChannel?.email?.recovered||0)}/></div></article>
      </section>
    </> : <RecoveryCenterPage producerId={event.producerId} events={[event]} mode={tab} fixedEventId={event.id} embedded notify={notify}/>} 
  </div>
}
function Generic({event,page,onNavigate,notify}:{event:EventItem;page:PageKey;onNavigate:(p:PageKey)=>void;notify:(m:string)=>void}){const labels:Partial<Record<PageKey,{eyebrow:string;title:string;description:string}>>={'event-users':{eyebrow:'ADMINISTRAÇÃO',title:'Usuários do Evento',description:'Controle quais usuários podem visualizar ou operar este evento.'},'event-audit':{eyebrow:'AUDITORIA',title:'Logs do Evento',description:'Histórico de operações executadas dentro do contexto deste evento.'},'event-permissions':{eyebrow:'SEGURANÇA',title:'Permissões do Evento',description:'Permissões específicas e herança de acessos da produtora.'}};const meta=labels[page]||{eyebrow:'EVENTO',title:'Evento',description:'Módulo contextual do evento.'};const Icon=iconFor(page);return <div className="event-context-page"><HeaderBlock {...meta} event={event}/><section className="context-module-panel"><div className="context-module-icon"><Icon size={28}/></div><div className="context-module-copy"><h3>{meta.title}</h3><p>Todo dado utiliza automaticamente <strong>eventId {event.id}</strong> e <strong>producerId {event.producerId}</strong>.</p></div><button className="btn primary" onClick={()=>notify(`${meta.title}: ação executada.`)}>Executar ação</button></section><section className="growth-panel"><div className="panel-head"><h3>Navegação preservada</h3><p>Troque de função sem sair do evento.</p></div><div className="context-quick-actions"><button onClick={()=>onNavigate('event-dashboard')}>Dashboard</button><button onClick={()=>onNavigate('event-reports')}>Relatórios</button><button onClick={()=>onNavigate('event-ga4')}>Analytics</button><button onClick={()=>onNavigate('event-remarketing')}>Remarketing</button></div></section></div>}

function Dashboard({event,participants,onNavigate}:{event:EventItem;participants:Participant[];onNavigate:(p:PageKey)=>void}){const people=participants.filter(p=>p.eventId===event.id);const present=people.filter(p=>p.checkin==='presente').length;return <div className="event-context-page"><section className="context-page-heading"><div><p className="eyebrow">PAINEL DO EVENTO</p><h2>{event.title}</h2><p>{event.venue} • {event.city} • {event.date}</p></div><span className={`status-pill ${event.status}`}>{event.status}</span></section><section className="growth-kpis event-context-kpis"><Kpi icon={CircleDollarSign} label="Receita" value={`R$ ${event.total}`} note="Receita do evento"/><Kpi icon={Ticket} label="Vendas" value={String(event.sales)} note={`${event.available} disponíveis`}/><Kpi icon={Users} label="Participantes" value={String(people.length)} note={`${present} check-ins`}/><Kpi icon={TrendingUp} label="Ocupação" value={event.occupancy} note="Capacidade utilizada"/></section><section className="event-context-two-col"><div className="growth-panel"><div className="panel-head"><h3>Acesso rápido</h3><p>Todos os destinos mantêm este evento selecionado.</p></div><div className="context-launch-grid"><Launch icon={Ticket} label="Consultar Ingresso" onClick={()=>onNavigate('event-tickets')}/><Launch icon={FileBarChart2} label="Relatórios" onClick={()=>onNavigate('event-reports')}/><Launch icon={BarChart3} label="Analytics GA4" onClick={()=>onNavigate('event-ga4')}/><Launch icon={Megaphone} label="Meta Ads" onClick={()=>onNavigate('event-meta-ads')}/><Launch icon={Waves} label="Remarketing" onClick={()=>onNavigate('event-remarketing')}/><Launch icon={CircleDollarSign} label="Negociação Financeira" onClick={()=>onNavigate('finance-negotiations')}/><Launch icon={Settings2} label="Detalhes" onClick={()=>onNavigate('event-details')}/></div></div><div className="growth-panel"><div className="panel-head"><h3>Operação em tempo real</h3><p>Resumo operacional do evento selecionado.</p></div><div className="context-operation-list"><Row label="Check-ins realizados" value={`${present}/${people.length||event.sales}`}/><Row label="Ingressos disponíveis" value={event.available.toLocaleString('pt-BR')}/><Row label="Cortesias" value={event.courtesy.toLocaleString('pt-BR')}/><Row label="Status" value={event.status}/></div></div></section></div>}

function ContextAction({icon:Icon,title,text,action}:{icon:any;title:string;text:string;action:()=>void}){return <button className="context-module-card" onClick={action}><span className="context-module-card-icon"><Icon size={22}/></span><span><strong>{title}</strong><small>{text}</small></span><ExternalLink size={16}/></button>}
function Kpi({icon:Icon,label,value,note}:{icon:any;label:string;value:string;note:string}){return <div className="growth-kpi"><div className="kpi-top"><span>{label}</span><Icon size={18}/></div><strong>{value}</strong><small>{note}</small></div>}
function Launch({icon:Icon,label,onClick}:{icon:any;label:string;onClick:()=>void}){return <button className="context-launch" onClick={onClick}><Icon size={19}/><span>{label}</span></button>}
function Row({label,value}:{label:string;value:string}){return <div className="context-operation-row"><span>{label}</span><strong>{value}</strong></div>}
function iconFor(page:PageKey){const map:Partial<Record<PageKey,any>>={'event-tickets':Ticket,'event-courtesy':CheckCircle2,'event-reports':FileBarChart2,'event-details':Settings2,'event-pixel':ScanLine,'event-utm':Link2,'event-ga4':BarChart3,'event-traffic':MousePointerClick,'event-meta-ads':Megaphone,'event-remarketing':Waves,'event-users':UserCog,'event-audit':Clock3,'event-permissions':ShieldCheck};return map[page]||Ticket}
