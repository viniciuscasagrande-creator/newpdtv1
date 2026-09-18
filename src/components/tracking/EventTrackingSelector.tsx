import React from 'react'
import { Calendar, MapPin, Tag, ChevronDown } from 'lucide-react'
import type { EventItem } from '../../data/events'

type Props = {
  events: EventItem[]
  selectedEventId: number | null
  onSelectEvent: (eventId: number) => void
  producerName?: string
}

export default function EventTrackingSelector({ events, selectedEventId, onSelectEvent, producerName }: Props) {
  const current = events.find(e => e.id === selectedEventId) || events[0]

  return (
    <div className="event-tracking-context-bar">
      <div className="event-context-info">
        <div className="event-context-icon">
          <Tag size={22} />
        </div>
        <div className="event-context-details">
          <h3>
            {current ? current.title : 'Todos os Eventos do Produtor'}
            {current && (
              <span className="status-badge green" style={{ fontSize: '11px', fontWeight: 600 }}>
                ● {current.status === 'ativo' ? 'Em vendas' : current.status || 'Ativo'}
              </span>
            )}
          </h3>
          <div className="event-context-meta">
            {current ? (
              <>
                <span><Calendar size={13} /> {current.date}</span>
                <span><MapPin size={13} /> {current.venue ? `${current.venue} · ` : ''}{current.city}</span>
                {producerName && <span><strong>Produtor:</strong> {producerName}</span>}
                <span><strong>Código:</strong> {current.code}</span>
              </>
            ) : (
              <span>Contexto global da produtora selecionada.</span>
            )}
          </div>
        </div>
      </div>

      {events.length > 1 && (
        <div className="event-picker-dropdown">
          <label htmlFor="event-selector-select" style={{ fontSize: '12px', fontWeight: 600, color: "var(--disk-text-secondary)" }}>
            Alterar Evento:
          </label>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              id="event-selector-select"
              value={selectedEventId || ''}
              onChange={e => onSelectEvent(Number(e.target.value))}
              aria-label="Selecionar Evento para Rastreamento"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.city})
                </option>
              ))}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: "var(--disk-text-muted)" }} />
          </div>
        </div>
      )}
    </div>
  )
}
