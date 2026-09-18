import React, { useState, useMemo } from 'react'
import { X, Search, Plus, Check, Sliders, ShieldCheck, KeyRound, Eye, EyeOff, PlugZap } from 'lucide-react'
import type { TrackingIntegration } from '../../services/api'
import {
  marketingIntegrationCatalog,
  integrationByKey,
  friendlyIntegrationTypeLabel,
  TRACKING_MODE_LABELS,
  type TrackingMode
} from '../../domain/marketing/integrations'

type Props = {
  eventId: number
  producerId: number
  availableIntegrations: TrackingIntegration[]
  alreadyAssignedIds: number[]
  initialProvider?: string
  onClose: () => void
  onAssignExisting: (integrationId: number, options: { trackingMode: TrackingMode; isPrimary: boolean }) => Promise<void>
  onCreateNew: (data: any) => Promise<void>
  notify: (msg: string) => void
}

export default function TrackingAssignmentModal({
  eventId,
  producerId,
  availableIntegrations,
  alreadyAssignedIds,
  initialProvider,
  onClose,
  onAssignExisting,
  onCreateNew,
  notify
}: Props) {
  const [mode, setMode] = useState<'existing' | 'new'>('new')

  // Existing flow state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExistingId, setSelectedExistingId] = useState<number | null>(null)
  const [existingMode, setExistingMode] = useState<TrackingMode>('HYBRID')
  const [existingIsPrimary, setExistingIsPrimary] = useState(false)

  // New integration wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(2)
  const [selectedProviderKey, setSelectedProviderKey] = useState<string>(initialProvider || 'meta')
  const [name, setName] = useState('')
  const [pixelId, setPixelId] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [newTrackingMode, setNewTrackingMode] = useState<TrackingMode>('HYBRID')
  const [newIsPrimary, setNewIsPrimary] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([
    'PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'
  ])

  const [busy, setBusy] = useState(false)

  const providerMeta = integrationByKey(selectedProviderKey)

  // Filter existing integrations
  const unassignedIntegrations = useMemo(() => {
    return availableIntegrations
      .filter(i => !alreadyAssignedIds.includes(i.id))
      .filter(i => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return i.name.toLowerCase().includes(q) || i.provider.toLowerCase().includes(q) || i.pixelId.includes(q)
      })
  }, [availableIntegrations, alreadyAssignedIds, searchQuery])

  const handleAssignExistingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExistingId) {
      notify('Selecione uma integração para vincular.')
      return
    }
    setBusy(true)
    try {
      await onAssignExisting(selectedExistingId, {
        trackingMode: existingMode,
        isPrimary: existingIsPrimary
      })
      notify('Integração vinculada com sucesso ao evento.')
      onClose()
    } catch (err: any) {
      notify(err.message || 'Erro ao vincular integração.')
    } finally {
      setBusy(false)
    }
  }

  const handleCreateNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !pixelId.trim()) {
      notify('Preencha o nome e o identificador do Pixel.')
      return
    }
    setBusy(true)
    try {
      await onCreateNew({
        name: name.trim(),
        provider: providerMeta.key,
        integrationType: providerMeta.integrationType,
        pixelId: pixelId.trim(),
        apiToken: apiToken.trim() || undefined,
        trackingMode: newTrackingMode,
        isPrimary: newIsPrimary,
        applyToAllEvents: false,
        eventIds: [eventId],
        enabledEvents: selectedEvents,
        producerId
      })
      notify(`${providerMeta.name} configurado e vinculado ao evento com sucesso.`)
      onClose()
    } catch (err: any) {
      notify(err.message || 'Erro ao criar integração.')
    } finally {
      setBusy(false)
    }
  }

  const toggleEvent = (evt: string) => {
    setSelectedEvents(prev =>
      prev.includes(evt) ? prev.filter(x => x !== evt) : [...prev, evt]
    )
  }

  return (
    <div className="integration-editor" onClick={onClose}>
      <div className="integration-editor-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="integration-editor-head">
          <div>
            <span className="eyebrow" style={{ color: '#2563eb', fontWeight: 700, fontSize: '11px' }}>
              PIXELS E CONVERSÕES · ASSOCIAÇÃO POR EVENTO
            </span>
            <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 700, color: "var(--disk-text-primary)" }}>
              Adicionar Integração ao Evento
            </h3>
          </div>
          <button
            type="button"
            className="icon-action"
            onClick={onClose}
            aria-label="Fechar modal"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '10px' }}>
          <button
            type="button"
            className={`btn ${mode === 'new' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '13px', padding: '6px 14px' }}
            onClick={() => { setMode('new'); setStep(2) }}
          >
            + Nova Integração
          </button>
          <button
            type="button"
            className={`btn ${mode === 'existing' ? 'primary' : 'secondary'}`}
            style={{ fontSize: '13px', padding: '6px 14px' }}
            onClick={() => setMode('existing')}
          >
            Usar Integração Existente ({unassignedIntegrations.length})
          </button>
        </div>

        {mode === 'existing' && (
          <form onSubmit={handleAssignExistingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: "var(--disk-text-secondary)" }}>
                Selecione a integração existente:
              </span>
              <button
                type="button"
                className="btn link"
                style={{ fontSize: '12px', padding: 0 }}
                onClick={() => setMode('new')}
              >
                + Criar nova ao invés disso
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: "var(--disk-text-muted)" }} />
              <input
                type="text"
                placeholder="Buscar por nome, plataforma ou Pixel ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', border: "1px solid var(--disk-border-default)", borderRadius: '8px', padding: '8px' }}>
              {unassignedIntegrations.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: "var(--disk-text-muted)", fontSize: '13px' }}>
                  Nenhuma integração disponível para vincular.
                </div>
              ) : (
                unassignedIntegrations.map(item => {
                  const selected = selectedExistingId === item.id
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedExistingId(item.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: `1px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                        background: selected ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px', color: "var(--disk-text-primary)" }}>{item.name}</strong>
                        <div style={{ fontSize: '11px', color: "var(--disk-text-muted)" }}>
                          {item.provider.toUpperCase()} · {friendlyIntegrationTypeLabel(item.integrationType)} · ID: ••••••{item.pixelId.slice(-4)}
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={selected}
                        onChange={() => setSelectedExistingId(item.id)}
                      />
                    </div>
                  )
                })
              )}
            </div>

            {selectedExistingId && (
              <div style={{ padding: '14px', background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: "var(--disk-text-primary)" }}>
                  Configuração para este evento:
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {(['HYBRID', 'BROWSER', 'SERVER'] as TrackingMode[]).map(m => (
                    <button
                      type="button"
                      key={m}
                      className={`btn ${existingMode === m ? 'primary' : 'secondary'}`}
                      style={{ fontSize: '11px', padding: '6px 8px' }}
                      onClick={() => setExistingMode(m)}
                    >
                      {TRACKING_MODE_LABELS[m]?.badge}
                    </button>
                  ))}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={existingIsPrimary}
                    onChange={e => setExistingIsPrimary(e.target.checked)}
                  />
                  Definir como Pixel Principal desta plataforma neste evento
                </label>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" className="btn secondary" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn primary"
                disabled={!selectedExistingId || busy}
              >
                Associar ao Evento
              </button>
            </div>
          </form>
        )}

        {mode === 'new' && (
          <form onSubmit={handleCreateNewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: "1px solid var(--disk-border-default)", paddingBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: step === 1 ? 700 : 500, color: step === 1 ? '#2563eb' : '#64748b' }}>
                1. Plataforma
              </span>
              <span style={{ fontSize: '12px', fontWeight: step === 2 ? 700 : 500, color: step === 2 ? '#2563eb' : '#64748b' }}>
                2. Configuração
              </span>
              <span style={{ fontSize: '12px', fontWeight: step === 3 ? 700 : 500, color: step === 3 ? '#2563eb' : '#64748b' }}>
                3. Eventos
              </span>
              <span style={{ fontSize: '12px', fontWeight: step === 4 ? 700 : 500, color: step === 4 ? '#2563eb' : '#64748b' }}>
                4. Revisão
              </span>
            </div>

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: "var(--disk-text-secondary)" }}>
                  Escolha a plataforma de mídia e conversão:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {marketingIntegrationCatalog.map(p => (
                    <button
                      type="button"
                      key={p.key}
                      className={`marketing-provider-card ${selectedProviderKey === p.key ? 'connected' : ''}`}
                      style={{ textAlign: 'left', cursor: 'pointer', padding: '14px' }}
                      onClick={() => {
                        setSelectedProviderKey(p.key)
                        setStep(2)
                      }}
                    >
                      <strong style={{ fontSize: '14px', color: "var(--disk-text-primary)" }}>{p.name}</strong>
                      <small style={{ display: 'block', color: "var(--disk-text-muted)", fontSize: '11px', marginTop: '2px' }}>
                        {p.description}
                      </small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label>
                  Plataforma de Mídia:
                  <select
                    value={selectedProviderKey}
                    onChange={e => setSelectedProviderKey(e.target.value)}
                  >
                    {marketingIntegrationCatalog.map(p => (
                      <option key={p.key} value={p.key}>
                        {p.name} ({p.description})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Nome identificador no DiskIngressos:
                  <input
                    required
                    placeholder={`Ex.: ${providerMeta.name} — Campanha Principal`}
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </label>

                <label>
                  {providerMeta.key === 'spotify' ? 'Dataset ID ou Connection ID:' : 'Pixel ID ou Código do Provedor:'}
                  <input
                    required
                    placeholder="Ex.: 182938475619283"
                    value={pixelId}
                    onChange={e => setPixelId(e.target.value)}
                  />
                </label>

                <div className="token-field">
                  <span>API Token / Secret Server-Side (Criptografia AES-256 no banco):</span>
                  <div>
                    <input
                      type={showToken ? 'text' : 'password'}
                      placeholder="Cole o token de Conversions API (CAPI)"
                      value={apiToken}
                      onChange={e => setApiToken(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowToken(!showToken)}>
                      {showToken ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <small>
                    <KeyRound size={12} /> Criptografado com chave AES-256. Nunca exposto no front-end.
                  </small>
                </div>

                <label>
                  Modo de Disparo:
                  <select
                    value={newTrackingMode}
                    onChange={e => setNewTrackingMode(e.target.value as TrackingMode)}
                  >
                    <option value="HYBRID">Híbrido (Navegador + CAPI)</option>
                    <option value="BROWSER">Apenas Navegador (Front-end)</option>
                    <option value="SERVER">Apenas Servidor (Conversions API)</option>
                  </select>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newIsPrimary}
                    onChange={e => setNewIsPrimary(e.target.checked)}
                  />
                  Definir como Pixel Principal deste provedor no evento
                </label>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn secondary" onClick={() => setStep(1)}>
                      Voltar
                    </button>
                    <button type="button" className="btn secondary" onClick={onClose}>
                      Cancelar
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn primary"
                    disabled={!name.trim() || !pixelId.trim()}
                    onClick={() => setStep(3)}
                  >
                    Avançar para Eventos
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: "var(--disk-text-secondary)" }}>
                  Selecione os eventos de jornada enviados:
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => setSelectedEvents(['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'])}
                  >
                    Rastreamento Completo
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => setSelectedEvents(['Purchase'])}
                  >
                    Somente Compra
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {['PageView', 'ViewContent', 'SelectTicket', 'AddToCart', 'InitiateCheckout', 'Purchase', 'Refund'].map(evt => (
                    <label
                      key={evt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        border: "1px solid var(--disk-border-default)",
                        borderRadius: '6px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt)}
                        onChange={() => toggleEvent(evt)}
                      />
                      {evt}
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button type="button" className="btn secondary" onClick={() => setStep(2)}>
                    Voltar
                  </button>
                  <button type="button" className="btn primary" onClick={() => setStep(4)}>
                    Revisar e Concluir
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '16px', background: "var(--disk-bg-muted)", border: "1px solid var(--disk-border-default)", borderRadius: '8px', display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px' }}>
                  <span style={{ color: "var(--disk-text-muted)" }}>Plataforma:</span>
                  <strong>{providerMeta.name}</strong>

                  <span style={{ color: "var(--disk-text-muted)" }}>Nome:</span>
                  <span>{name}</span>

                  <span style={{ color: "var(--disk-text-muted)" }}>ID do Pixel:</span>
                  <code>{pixelId}</code>

                  <span style={{ color: "var(--disk-text-muted)" }}>Modo:</span>
                  <span>{TRACKING_MODE_LABELS[newTrackingMode]?.label}</span>

                  <span style={{ color: "var(--disk-text-muted)" }}>Principal:</span>
                  <span>{newIsPrimary ? 'Sim (★ Principal)' : 'Não'}</span>

                  <span style={{ color: "var(--disk-text-muted)" }}>Eventos ({selectedEvents.length}):</span>
                  <span>{selectedEvents.join(', ')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <button type="button" className="btn secondary" onClick={() => setStep(3)}>
                    Voltar
                  </button>
                  <button type="submit" className="btn primary" disabled={busy}>
                    Criar e Vincular ao Evento
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
