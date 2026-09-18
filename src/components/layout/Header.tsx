import React, { useState } from 'react'
import {
  Search,
  Calendar,
  Clock,
  Bell,
  ShieldCheck,
  Zap,
  Menu,
  ChevronDown,
  Building2,
  Check,
  User,
  LogOut,
  RefreshCw,
} from 'lucide-react'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { StatusBadge } from '../common/StatusBadge'
import type { PeriodPreset } from '../../types/core'

interface HeaderProps {
  onToggleMobileSidebar: () => void
  onOpenGlobalSearch: () => void
  onOpenNotifications: () => void
  onOpenAudit: () => void
  onOpenSimulateSale: () => void
}

export function Header({
  onToggleMobileSidebar,
  onOpenGlobalSearch,
  onOpenNotifications,
  onOpenAudit,
  onOpenSimulateSale,
}: HeaderProps) {
  const {
    producers,
    events,
    selectedProducerId,
    selectedEventId,
    selectedEvent,
    selectedProducer,
    filteredEvents,
    setSelectedProducerId,
    setSelectedEventId,
    selectedPeriod,
    setSelectedPeriod,
    periodLabel,
  } = useGlobalContext()

  const { currentUser, allUsers, switchUser } = useAuth()
  const { unreadCount } = useNotifications()

  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false)
  const [isProducerDropdownOpen, setIsProducerDropdownOpen] = useState(false)
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const periods: { id: PeriodPreset; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'ontem', label: 'Ontem' },
    { id: 'ultimos_7_dias', label: 'Últimos 7 dias' },
    { id: 'ultimos_30_dias', label: 'Últimos 30 dias' },
    { id: 'este_mes', label: 'Este mês' },
    { id: 'ano_atual', label: 'Ano atual (2026)' },
    { id: 'todo_periodo', label: 'Todo o período' },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      {/* Left side: Hamburger + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search button */}
        <button
          onClick={onOpenGlobalSearch}
          className="group flex h-9 items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-xs text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 transition-all shadow-2xs"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
          <span className="hidden md:inline font-normal">Buscar evento, CPF, pedido...</span>
          <span className="md:hidden">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Center: Global Context Filters (Produtor + Evento + Período) */}
      <div className="hidden xl:flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Producer selector */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProducerDropdownOpen(!isProducerDropdownOpen)
              setIsEventDropdownOpen(false)
              setIsPeriodDropdownOpen(false)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 border border-slate-200/80 transition-colors"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span className="max-w-[140px] truncate">
              {selectedProducer ? selectedProducer.name : 'Todos os Produtores'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isProducerDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 text-xs">
              <div className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Filtrar por Produtor
              </div>
              <button
                onClick={() => {
                  setSelectedProducerId('todos')
                  setIsProducerDropdownOpen(false)
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-left font-medium text-slate-700"
              >
                <span>Todos os Produtores</span>
                {selectedProducerId === 'todos' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
              <div className="my-1 border-t border-slate-100" />
              {producers.map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => {
                    setSelectedProducerId(prod.id)
                    setIsProducerDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-left text-slate-700 font-medium"
                >
                  <div className="truncate">
                    <div className="truncate">{prod.name}</div>
                    <div className="text-[10px] text-slate-400">{prod.cnpj}</div>
                  </div>
                  {selectedProducerId === prod.id && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Event selector */}
        <div className="relative">
          <button
            onClick={() => {
              setIsEventDropdownOpen(!isEventDropdownOpen)
              setIsProducerDropdownOpen(false)
              setIsPeriodDropdownOpen(false)
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-2xs hover:bg-emerald-100/70 border border-emerald-200/80 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            <div className="flex items-center gap-1.5">
              <span className="max-w-[210px] truncate">
                {selectedEvent ? selectedEvent.name : 'Todos os Eventos'}
              </span>
              {selectedEvent && (
                <span className="font-mono text-[10px] bg-emerald-200/60 text-emerald-800 px-1 rounded">
                  #{selectedEvent.code}
                </span>
              )}
            </div>
            <ChevronDown className="h-3 w-3 text-emerald-700" />
          </button>

          {isEventDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-80 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 text-xs">
              <div className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Contexto Global do Evento
              </div>
              <button
                onClick={() => {
                  setSelectedEventId('todos')
                  setIsEventDropdownOpen(false)
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-slate-50 text-left font-medium text-slate-700"
              >
                <div>
                  <div className="font-semibold text-slate-800">Visão Consolidada (Todos)</div>
                  <div className="text-[10px] text-slate-400">Totaliza dados de todos os eventos ativos</div>
                </div>
                {selectedEventId === 'todos' && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </button>
              <div className="my-1 border-t border-slate-100" />
              <div className="max-h-64 overflow-y-auto space-y-0.5">
                {filteredEvents.map((evt) => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventId(evt.id)
                      setIsEventDropdownOpen(false)
                    }}
                    className="w-full flex items-start justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-left text-slate-700 group"
                  >
                    <div className="pr-2">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="truncate">{evt.name}</span>
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded shrink-0">
                          #{evt.code}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{evt.venue}</div>
                    </div>
                    {selectedEventId === evt.id && (
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Period selector */}
        <div className="relative">
          <button
            onClick={() => {
              setIsPeriodDropdownOpen(!isPeriodDropdownOpen)
              setIsProducerDropdownOpen(false)
              setIsEventDropdownOpen(false)
            }}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 border border-slate-200/80 transition-colors"
          >
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{periodLabel}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isPeriodDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 text-xs">
              <div className="px-2 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Intervalo Temporal
              </div>
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPeriod(p.id)
                    setIsPeriodDropdownOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-left text-slate-700 font-medium"
                >
                  <span>{p.label}</span>
                  {selectedPeriod === p.id && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Actions, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick action: Simular Venda Compartilhada */}
        <button
          onClick={onOpenSimulateSale}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
          title="Dispara uma venda simulada no Core propagando dados para todos os 9 módulos"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Simular Venda Compartilhada</span>
          <span className="lg:hidden">Venda Core</span>
        </button>

        {/* Audit trigger */}
        <button
          onClick={onOpenAudit}
          aria-label="Abrir auditoria e logs"
          title="Auditoria & Logs de Segurança"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
        >
          <ShieldCheck className="h-4 w-4" />
        </button>

        {/* Notifications trigger */}
        <button
          onClick={onOpenNotifications}
          aria-label="Abrir notificações"
          title="Notificações em tempo real"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-100 transition-colors"
          >
            <div className="relative">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {currentUser.roleLabel}
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
          </button>

          {/* User profile popup */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="font-bold text-slate-900 truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  <StatusBadge variant="slate" size="sm" className="mt-1">
                    {currentUser.roleLabel}
                  </StatusBadge>
                </div>
              </div>

              {/* RBAC Role Switcher */}
              <div className="mt-2.5">
                <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 mb-1.5 flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Alternar Perfil (Simulação RBAC)
                </p>
                <div className="space-y-1">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id)
                        setIsUserDropdownOpen(false)
                      }}
                      className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors"
                    >
                      <div>
                        <div className="font-medium text-slate-800">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.roleLabel}</div>
                      </div>
                      {currentUser.id === u.id && (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">Disk Enterprise Core</span>
                <span className="text-emerald-600 font-medium">Sessão Segura</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
