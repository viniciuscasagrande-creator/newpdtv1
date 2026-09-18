import React from 'react'
import { Check, X, Sliders, AlertCircle, Info } from 'lucide-react'
import type { TrackingIntegration, TrackingIntegrationEvent } from '../../services/api'
import { friendlyIntegrationTypeLabel } from '../../domain/marketing/integrations'

type AssignmentWithIntegration = TrackingIntegrationEvent & { integration: TrackingIntegration }

type Props = {
  assignments: AssignmentWithIntegration[]
  onOpenDrawer: (integration: TrackingIntegration, assignment: TrackingIntegrationEvent, initialTab?: string) => void
  onToggleRule?: (assignment: TrackingIntegrationEvent, eventName: string, field: 'enabled' | 'browserEnabled' | 'serverEnabled', val: boolean) => void
}

const CANONICAL_STAGES = [
  { key: 'PageView', label: 'Visualização de página', description: 'Navegação geral e carregamento do evento' },
  { key: 'ViewContent', label: 'Visualização do evento', description: 'Visita à página de detalhes e lotes' },
  { key: 'SelectTicket', label: 'Ingresso selecionado', description: 'Seleção de setor ou tipo de ingresso' },
  { key: 'AddToCart', label: 'Adicionar ao carrinho', description: 'Ingressos adicionados ao carrinho' },
  { key: 'InitiateCheckout', label: 'Iniciar checkout', description: 'Início da identificação ou pagamento' },
  { key: 'Purchase', label: 'Compra aprovada', description: 'Transação confirmada e ingressos emitidos' },
  { key: 'Refund', label: 'Estorno', description: 'Cancelamento ou devolução da transação' }
]

export default function TrackingConversionMatrix({ assignments, onOpenDrawer }: Props) {
  const activeAssignments = assignments.filter(a => a.enabled && a.integration.status === 'ativo')

  const countForStage = (stageKey: string) => {
    return activeAssignments.filter(a => {
      const rule = a.rules?.find(r => r.eventName.toLowerCase() === stageKey.toLowerCase())
      return rule ? rule.enabled : true
    }).length
  }

  const purchaseCount = countForStage('Purchase')
  const metaPurchaseCount = activeAssignments.filter(a => {
    if (a.integration.provider.toLowerCase() !== 'meta') return false
    const rule = a.rules?.find(r => r.eventName.toLowerCase() === 'purchase')
    return rule ? rule.enabled : true
  }).length

  return (
    <div className="tracking-matrix-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
            Matriz de Disparos por Conversão
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: "var(--disk-text-muted)" }}>
            Compare quais Pixels e APIs recebem cada etapa da jornada de compra neste evento.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {metaPurchaseCount > 1 && (
            <span className="matrix-badge-multi" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Info size={12} /> {metaPurchaseCount} destinos Meta recebem Compra
            </span>
          )}
          {purchaseCount === 0 && activeAssignments.length > 0 && (
            <span className="status-badge red" style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} /> Nenhuma integração configurada para Compra
            </span>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="tracking-matrix-table">
          <thead>
            <tr>
              <th>Evento da Jornada</th>
              {activeAssignments.length === 0 ? (
                <th style={{ minWidth: '220px', color: "var(--disk-text-muted)", fontWeight: 600, textAlign: 'center' }}>
                  Destinos de Mídia e Conversão
                </th>
              ) : (
                activeAssignments.map(a => (
                  <th key={a.id} style={{ minWidth: '160px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
                        {a.integration.name}
                      </span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {a.isPrimary && (
                          <span className="status-badge green" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            Principal
                          </span>
                        )}
                        <span className="status-badge blue" style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {a.trackingMode === 'HYBRID' ? 'Híbrido' : a.trackingMode === 'BROWSER' ? 'Navegador' : 'Servidor'}
                        </span>
                      </div>
                      <small style={{ color: "var(--disk-text-muted)", fontSize: '11px' }}>
                        {friendlyIntegrationTypeLabel(a.integration.integrationType)}
                      </small>
                    </div>
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {CANONICAL_STAGES.map(stage => {
              const totalForStage = countForStage(stage.key)
              return (
                <tr key={stage.key}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>
                        {stage.label}
                        <span className="matrix-badge-multi" style={{ fontWeight: 600 }}>
                          {totalForStage} destino{totalForStage === 1 ? '' : 's'}
                        </span>
                      </strong>
                      <small style={{ color: "var(--disk-text-muted)", fontSize: '11px', marginTop: '2px' }}>
                        {stage.description}
                      </small>
                    </div>
                  </td>

                  {activeAssignments.length === 0 ? (
                    <td style={{ textAlign: 'center', color: "var(--disk-text-muted)", fontSize: '12px', padding: '14px' }}>
                      Nenhuma integração ativa vinculada a este evento. Adicione uma integração para rotear este evento.
                    </td>
                  ) : (
                    activeAssignments.map(a => {
                      const rule = a.rules?.find(r => r.eventName.toLowerCase() === stage.key.toLowerCase())
                      const enabled = rule ? rule.enabled : true
                      const browserOn = rule ? rule.browserEnabled : true
                      const serverOn = rule ? rule.serverEnabled : true

                      return (
                        <td key={a.id}>
                          <button
                            type="button"
                            onClick={() => onOpenDrawer(a.integration, a, 'rules')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title={`Configurar regra para ${a.integration.name}`}
                          >
                            {enabled ? (
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {(a.trackingMode === 'HYBRID' || a.trackingMode === 'BROWSER') && (
                                  <span className={`matrix-check ${browserOn ? 'active' : 'inactive'}`}>
                                    Web {browserOn ? <Check size={11} /> : <X size={11} />}
                                  </span>
                                )}
                                {(a.trackingMode === 'HYBRID' || a.trackingMode === 'SERVER') && (
                                  <span className={`matrix-check ${serverOn ? 'active' : 'inactive'}`}>
                                    API {serverOn ? <Check size={11} /> : <X size={11} />}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="matrix-check inactive">
                                <X size={12} /> Inativo
                              </span>
                            )}
                          </button>
                        </td>
                      )
                    })
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: "1px solid var(--disk-border-default)", fontSize: '12px', color: "var(--disk-text-muted)" }}>
        <span>Legenda: <b>Web</b> = Disparo via Navegador · <b>API</b> = Disparo Seguro Server-Side (CAPI) com deduplicação de sinal.</span>
        <span>Clique em qualquer célula para gerenciar o roteamento individual.</span>
      </div>
    </div>
  )
}
