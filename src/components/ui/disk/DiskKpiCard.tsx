import React, { type ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

export type DiskKpiTrendDirection = 'up' | 'down' | 'neutral' | 'positive' | 'negative'
export type DiskKpiTrendStatus = 'success' | 'warning' | 'danger' | 'neutral' | 'info'
export type DiskKpiAccent = 
  | 'primary' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  | 'orange' | 'emerald' | 'sky' | 'indigo'

// Aliases para compatibilidade total com o Design System corporativo
export type KpiTrendDirection = DiskKpiTrendDirection
export type KpiTrendStatus = DiskKpiTrendStatus
export type KpiAccent = DiskKpiAccent

export interface DiskKpiCardProps {
  label?: string
  title?: string
  value: ReactNode
  formattedValue?: string
  icon?: ReactNode
  trend?: string
  trendLabel?: string
  trendDirection?: DiskKpiTrendDirection
  trendStatus?: DiskKpiTrendStatus
  note?: string
  subtitle?: string
  helperText?: string
  comparison?: string
  tooltip?: string
  progressPercent?: number
  accent?: DiskKpiAccent
  loading?: boolean
  className?: string
  onClick?: () => void
}

export const DiskKpiCard: React.FC<DiskKpiCardProps> = ({
  label,
  title,
  value,
  formattedValue,
  icon,
  trend,
  trendLabel,
  trendDirection = 'up',
  trendStatus,
  note,
  subtitle,
  helperText,
  comparison,
  tooltip,
  progressPercent,
  accent = 'neutral',
  loading = false,
  className = '',
  onClick
}) => {
  const displayLabel = label || title || ''
  const displayNote = helperText || note || subtitle
  const displayValue = formattedValue !== undefined ? formattedValue : value

  const normalizedAccent: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral' = 
    (accent === 'orange' || accent === 'brand') ? 'primary' :
    accent === 'emerald' ? 'success' :
    accent === 'sky' ? 'info' :
    accent === 'indigo' ? 'purple' :
    accent

  const accentConfigs = {
    primary: {
      bg: 'bg-orange-500/10 text-[var(--disk-color-primary,#f97316)]',
      border: 'border-l-4 border-l-[var(--disk-color-primary,#f97316)]',
      bar: 'bg-[var(--disk-color-primary,#f97316)]'
    },
    success: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      border: 'border-l-4 border-l-emerald-500',
      bar: 'bg-emerald-500'
    },
    warning: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      border: 'border-l-4 border-l-amber-500',
      bar: 'bg-amber-500'
    },
    danger: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      border: 'border-l-4 border-l-rose-500',
      bar: 'bg-rose-500'
    },
    info: {
      bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      border: 'border-l-4 border-l-sky-500',
      bar: 'bg-sky-500'
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      border: 'border-l-4 border-l-purple-500',
      bar: 'bg-purple-500'
    },
    neutral: {
      bg: 'bg-[var(--disk-bg-muted,#f1f5f9)] text-[var(--disk-text-secondary,#475569)]',
      border: 'border-l-4 border-l-[var(--disk-border-strong,#cbd5e1)]',
      bar: 'bg-slate-400'
    }
  }[normalizedAccent]

  const normalizedDirection: 'up' | 'down' | 'neutral' = 
    trendDirection === 'up' || trendDirection === 'positive' ? 'up' :
    trendDirection === 'down' || trendDirection === 'negative' ? 'down' :
    'neutral'

  const trendClasses = trendStatus ? {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-rose-600 dark:text-rose-400',
    info: 'text-sky-600 dark:text-sky-400',
    neutral: 'text-[var(--disk-text-muted,#64748b)]',
  }[trendStatus] : (
    normalizedDirection === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : normalizedDirection === 'down'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-[var(--disk-text-muted,#64748b)]'
  )

  return (
    <div
      className={`disk-kpi-card relative overflow-hidden rounded-lg border border-[var(--disk-border-default,#e2e8f0)] bg-[var(--disk-bg-surface,#ffffff)] p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${accentConfigs.border} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      data-testid="disk-kpi-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-[var(--disk-text-muted,#64748b)] block whitespace-normal leading-5">
            {displayLabel}
          </span>
          {tooltip && (
            <span
              title={tooltip}
              className="cursor-help text-[var(--disk-text-muted,#64748b)]/70 hover:text-[var(--disk-text-muted,#64748b)] shrink-0 inline-flex items-center"
              aria-label={tooltip}
            >
              <Info className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          )}
        </div>

        {icon && (
          <div
            className={`col-start-2 row-start-1 w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${accentConfigs.bg}`}
          >
            {icon}
          </div>
        )}

        <div className="col-span-2 row-start-2 text-xl sm:text-2xl font-semibold text-[var(--disk-text-primary,#0f172a)] tracking-tight break-words">
          {loading ? (
            <span className="inline-block w-20 h-6 bg-[var(--disk-bg-muted,#f1f5f9)] animate-pulse rounded" />
          ) : (
            displayValue
          )}
        </div>
      </div>

      {(trend || displayNote || comparison) && (
        <div className="mt-2.5 pt-2 border-t border-[var(--disk-border-subtle,#f1f5f9)] flex flex-wrap items-center gap-1.5 text-xs">
          {trend && (
            <span className={`inline-flex items-center gap-1 font-semibold ${trendClasses}`}>
              {normalizedDirection === 'up' && <TrendingUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              {normalizedDirection === 'down' && <TrendingDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              {normalizedDirection === 'neutral' && <Minus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              <span>{trend}</span>
              {trendLabel && <span className="font-normal opacity-80">{trendLabel}</span>}
            </span>
          )}
          {comparison && (
            <span className="text-[11px] text-[var(--disk-text-muted,#64748b)] opacity-80 whitespace-normal leading-4">
              {comparison}
            </span>
          )}
          {displayNote && (
            <span className="text-xs text-[var(--disk-text-muted,#64748b)] whitespace-normal leading-5">
              {displayNote}
            </span>
          )}
        </div>
      )}

      {typeof progressPercent === 'number' && (
        <div className="mt-2.5 w-full bg-[var(--disk-bg-muted,#f1f5f9)] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${accentConfigs.bar}`}
            style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default DiskKpiCard
