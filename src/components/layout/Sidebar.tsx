import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  Headphones,
  MessageSquareText,
  RotateCcw,
  DollarSign,
  FileSpreadsheet,
  Megaphone,
  Repeat,
  ShieldCheck,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react'
import { NAVIGATION_MODULES, SYSTEM_UTILITY_LINKS } from '../../app/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../utils/cn'

interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CalendarDays,
  TrendingUp,
  Headphones,
  MessageSquareText,
  RotateCcw,
  DollarSign,
  FileSpreadsheet,
  Megaphone,
  Repeat,
  ShieldCheck,
  Settings,
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation()
  const { hasPermission, currentUser } = useAuth()

  // Track expanded accordion modules
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    eventos: true,
    financeiro: false,
    comercial: false,
  })

  const toggleModuleAccordion = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }))
  }

  const isModuleActive = (basePath: string) => {
    return location.pathname === basePath || location.pathname.startsWith(`${basePath}/`)
  }

  const isSubItemActive = (path: string) => {
    return location.pathname === path
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0b0f17] text-slate-300 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-3 overflow-hidden group"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black tracking-tighter text-sm shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
            DK
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                DISK
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded">
                  ENTERPRISE
                </span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-tight font-medium">
                Plataforma Operacional
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1 dark-sidebar-scroll">
        {/* Overview link */}
        <Link
          to="/"
          onClick={onCloseMobile}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all group',
            location.pathname === '/' || location.pathname === '/overview'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'
          )}
          title={isCollapsed ? 'Visão Geral' : undefined}
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
          {(!isCollapsed || isMobileOpen) && (
            <span className="tracking-wide">Visão Geral</span>
          )}
        </Link>

        {/* Modules Section Divider */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Módulos Operacionais
            </span>
          </div>
        )}

        {/* 9 Modules with Submenus */}
        {NAVIGATION_MODULES.map((mod) => {
          const Icon = iconMap[mod.iconName] || LayoutDashboard
          const active = isModuleActive(mod.path)
          const expanded = expandedModules[mod.id] || active
          const permitted = hasPermission(mod.id)

          if (!permitted) return null

          return (
            <div key={mod.id} className="space-y-0.5">
              {/* Module Header / Trigger */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-xl transition-all cursor-pointer group',
                  active
                    ? 'bg-slate-800/80 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                )}
              >
                <Link
                  to={mod.path}
                  onClick={() => {
                    if (!expandedModules[mod.id]) {
                      toggleModuleAccordion(mod.id)
                    }
                    if (isMobileOpen) onCloseMobile()
                  }}
                  className="flex flex-1 items-center gap-3 px-3 py-2 text-xs"
                  title={isCollapsed ? mod.title : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="tracking-wide uppercase text-[11px] font-bold truncate">
                      {mod.title}
                    </span>
                  )}
                </Link>

                {(!isCollapsed || isMobileOpen) && (
                  <div className="flex items-center pr-2 gap-1.5">
                    {mod.badge && (
                      <span className="text-[9.5px] font-medium bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700/60">
                        {mod.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleModuleAccordion(mod.id)
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      {expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Submenu Accordion (Desktop expanded or mobile) */}
              {(!isCollapsed || isMobileOpen) && expanded && (
                <div className="ml-4 pl-3.5 border-l border-slate-800/80 space-y-0.5 py-1">
                  {mod.subItems.map((sub, sIdx) => {
                    const subActive = isSubItemActive(sub.path)

                    return (
                      <Link
                        key={sIdx}
                        to={sub.path}
                        onClick={onCloseMobile}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[11.5px] transition-colors',
                          subActive
                            ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                            : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                        )}
                      >
                        <span className="truncate">{sub.title}</span>
                        {sub.badge && (
                          <span
                            className={cn(
                              'ml-1 text-[9px] font-medium px-1 rounded',
                              sub.badgeColor === 'emerald' && 'bg-emerald-500/20 text-emerald-300',
                              sub.badgeColor === 'amber' && 'bg-amber-500/20 text-amber-300',
                              sub.badgeColor === 'rose' && 'bg-rose-500/20 text-rose-300',
                              sub.badgeColor === 'blue' && 'bg-blue-500/20 text-blue-300'
                            )}
                          >
                            {sub.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Utilities Section */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sistema & Governança
            </span>
          </div>
        )}

        {SYSTEM_UTILITY_LINKS.map((link) => {
          const Icon = iconMap[link.iconName] || Settings
          const active = location.pathname === link.path

          return (
            <Link
              key={link.id}
              to={link.path}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                active
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              )}
              title={isCollapsed ? link.title : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-400" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="tracking-wide text-[11px]">{link.title}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Info & Collapse Toggle Footer */}
      <div className="border-t border-slate-800/80 p-3 bg-[#080c13]">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-200 truncate">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.roleLabel}
                </div>
              </div>
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
            className="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-slate-800 transition-all duration-200 shrink-0 sticky top-0 h-screen z-40',
          isCollapsed ? 'w-[72px]' : 'w-[275px]'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 w-[285px] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
