import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Calendar, DollarSign, ShieldAlert, ArrowRight, X, Command } from 'lucide-react'
import { NAVIGATION_MODULES } from '../../app/navigation'
import { mockEvents } from '../../data/mockEvents'
import { useGlobalContext } from '../../contexts/GlobalContext'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { setSelectedEventId } = useGlobalContext()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const results = useMemo(() => {
    if (!query.trim()) {
      return {
        modules: NAVIGATION_MODULES.slice(0, 4),
        subItems: [],
        events: mockEvents.slice(0, 3),
      }
    }
    const q = query.toLowerCase()

    const matchedModules = NAVIGATION_MODULES.filter(
      (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
    )

    const allSubItems = NAVIGATION_MODULES.flatMap((m) =>
      m.subItems.map((sub) => ({ ...sub, parentModule: m.title }))
    )
    const matchedSub = allSubItems.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 6)

    const matchedEvents = mockEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.numericId.toString().includes(q) ||
        e.venue.toLowerCase().includes(q)
    )

    return {
      modules: matchedModules,
      subItems: matchedSub,
      events: matchedEvents,
    }
  }, [query])

  if (!isOpen) return null

  const handleSelectModule = (path: string) => {
    navigate(path)
    onClose()
  }

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    navigate('/eventos')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-4 py-3.5 bg-white">
          <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            placeholder="Buscar por evento, CPF, pedido, módulo ou submenu... (ex: 5842, rock, financeiro)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Events Section */}
          {results.events.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Eventos Disponíveis
              </p>
              <div className="space-y-1">
                {results.events.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          {evt.name}
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            #{evt.code}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">{evt.venue} • {evt.producerName}</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Selecionar evento <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subpages Section */}
          {results.subItems.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Páginas & Submenus
              </p>
              <div className="space-y-1">
                {results.subItems.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectModule(sub.path)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{sub.title}</span>
                      <span className="text-slate-400 text-[11px]">em {sub.parentModule}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[10px]">{sub.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modules Section */}
          {results.modules.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Módulos Operacionais
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {results.modules.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => handleSelectModule(mod.path)}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-all"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-900 text-white shrink-0 text-xs font-bold">
                      {mod.title.substring(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{mod.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{mod.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Disk Enterprise Global Search</span>
            <span className="text-slate-300">•</span>
            <span>Navegação instantânea</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <Command className="h-3 w-3" /> + K para abrir a qualquer momento
          </div>
        </div>
      </div>
    </div>
  )
}
