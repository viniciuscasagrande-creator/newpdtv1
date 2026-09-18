import React from 'react'
import { Share2, Search, Video, Music, Plus, Settings, CheckCircle2, AlertCircle } from 'lucide-react'

type ProviderData = {
  key: string
  name: string
  total: number
  active: number
  problems: number
  receivingEvents: boolean
  integrations: Array<{
    id: number
    name: string
    isPrimary: boolean
    trackingMode: string
    status: string
    lastTestStatus: string | null
  }>
}

type Props = {
  providers: ProviderData[]
  onManage: (providerKey: string) => void
  onAdd: (providerKey: string) => void
}

const getProviderIcon = (key: string) => {
  switch (key.toLowerCase()) {
    case 'meta':
      return <Share2 size={20} style={{ color: '#2563eb' }} />
    case 'google':
      return <Search size={20} style={{ color: '#ea4335' }} />
    case 'tiktok':
      return <Video size={20} style={{ color: "var(--disk-text-primary)" }} />
    case 'spotify':
      return <Music size={20} style={{ color: '#1db954' }} />
    default:
      return <Share2 size={20} style={{ color: "var(--disk-text-muted)" }} />
  }
}

export default function TrackingProviderCard({ providers, onManage, onAdd }: Props) {
  return (
    <div className="tracking-provider-cards-grid">
      {providers.map(p => {
        const hasIntegrations = p.total > 0
        const isHealthy = hasIntegrations && p.problems === 0
        const hasProblems = p.problems > 0

        return (
          <div className="tracking-provider-card" key={p.key}>
            <div className="provider-card-head">
              <div className="provider-card-title">
                {getProviderIcon(p.key)}
                <div>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>
                    {hasIntegrations
                      ? `${p.total} integração${p.total > 1 ? 'ões' : ''} · ${p.active} ativa${p.active > 1 ? 's' : ''}`
                      : 'Nenhuma integração neste evento'}
                  </div>
                </div>
              </div>

              <div>
                {hasProblems ? (
                  <span className="status-badge red" style={{ fontSize: '11px' }}>
                    <AlertCircle size={11} /> {p.problems} problema{p.problems > 1 ? 's' : ''}
                  </span>
                ) : isHealthy ? (
                  <span className="status-badge green" style={{ fontSize: '11px' }}>
                    <CheckCircle2 size={11} /> Funcionando
                  </span>
                ) : (
                  <span className="status-badge gray" style={{ fontSize: '11px' }}>
                    Não configurado
                  </span>
                )}
              </div>
            </div>

            <div className="provider-pills">
              {p.integrations.length > 0 ? (
                p.integrations.slice(0, 4).map(int => (
                  <span
                    key={int.id}
                    className={`provider-pill ${int.isPrimary ? 'primary' : ''}`}
                    title={`Modo: ${int.trackingMode}`}
                  >
                    {int.isPrimary && <span style={{ color: '#2563eb' }}>★</span>}
                    {int.name}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: "var(--disk-text-muted)", fontStyle: 'italic' }}>
                  Sem pixels configurados.
                </span>
              )}
            </div>

            <div className="provider-card-foot">
              <button
                className="btn secondary"
                onClick={() => onManage(p.key)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Settings size={13} /> Gerenciar
              </button>

              <button
                className="btn primary"
                onClick={() => onAdd(p.key)}
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Plus size={13} /> Adicionar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
