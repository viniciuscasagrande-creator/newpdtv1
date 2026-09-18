import React from 'react'
import { ShieldCheck, RefreshCw } from 'lucide-react'

type Props = {
  healthScore: number
  healthStatusText: string
  breakdown: {
    configurationPct: number
    connectivityPct: number
    recentEventsPct: number
    failurePct: number
  }
  onRefresh?: () => void
  busy?: boolean
}

export default function TrackingHealthSummary({ healthScore, healthStatusText, breakdown, onRefresh, busy }: Props) {
  const getBadgeClass = (score: number) => {
    if (score >= 90) return 'green'
    if (score >= 60) return 'amber'
    return 'red'
  }

  return (
    <div className="tracking-health-summary-card">
      <div className="health-summary-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} style={{ color: '#2563eb' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
              Saúde do Rastreamento
            </h4>
            <small style={{ color: "var(--disk-text-muted)" }}>Diagnóstico e estabilidade de mensuração em tempo real</small>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="health-score-pill">
            <strong>{healthScore} <span style={{ fontSize: '14px', color: "var(--disk-text-muted)", fontWeight: 500 }}>/ 100</span></strong>
            <span className={getBadgeClass(healthScore)}>
              ● {healthStatusText}
            </span>
          </div>

          {onRefresh && (
            <button
              className="btn secondary"
              onClick={onRefresh}
              disabled={busy}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Atualizar diagnóstico"
            >
              <RefreshCw size={13} className={busy ? 'spin' : ''} />
              Verificar
            </button>
          )}
        </div>
      </div>

      <div className="health-breakdown-grid">
        <div className="health-breakdown-item">
          <div className="label-row">
            <span>Configuração</span>
            <strong>{breakdown.configurationPct}%</strong>
          </div>
          <div className="health-progress-track">
            <div className="health-progress-bar green" style={{ width: `${breakdown.configurationPct}%` }} />
          </div>
        </div>

        <div className="health-breakdown-item">
          <div className="label-row">
            <span>Conectividade</span>
            <strong>{breakdown.connectivityPct}%</strong>
          </div>
          <div className="health-progress-track">
            <div className="health-progress-bar blue" style={{ width: `${breakdown.connectivityPct}%` }} />
          </div>
        </div>

        <div className="health-breakdown-item">
          <div className="label-row">
            <span>Eventos Recentes</span>
            <strong>{breakdown.recentEventsPct}%</strong>
          </div>
          <div className="health-progress-track">
            <div className="health-progress-bar purple" style={{ width: `${breakdown.recentEventsPct}%` }} />
          </div>
        </div>

        <div className="health-breakdown-item">
          <div className="label-row">
            <span>Taxa de Falhas</span>
            <strong style={{ color: breakdown.failurePct > 5 ? '#dc2626' : '#64748b' }}>
              {breakdown.failurePct}%
            </strong>
          </div>
          <div className="health-progress-track">
            <div
              className={`health-progress-bar ${breakdown.failurePct > 5 ? 'amber' : 'green'}`}
              style={{ width: `${Math.min(100, breakdown.failurePct * 5)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
