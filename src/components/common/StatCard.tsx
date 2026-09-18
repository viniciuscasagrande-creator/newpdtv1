import React from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  trend?: {
    value: string
    isPositive?: boolean
    isNeutral?: boolean
    label?: string
  }
  icon?: LucideIcon
  iconColor?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'slate'
  className?: string
  onClick?: () => void
}

const iconColorMap = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function StatCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  iconColor = 'blue',
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border',
              iconColorMap[iconColor]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold rounded-md px-1.5 py-0.5',
                trend.isNeutral
                  ? 'bg-slate-100 text-slate-600'
                  : trend.isPositive !== false
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              )}
            >
              {trend.isNeutral ? (
                <Minus className="h-3 w-3" />
              ) : trend.isPositive !== false ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.value}
            </span>
          )}

          {trend?.label && (
            <span className="text-slate-400 font-normal">{trend.label}</span>
          )}

          {subtext && !trend?.label && (
            <span className="text-slate-500 font-normal">{subtext}</span>
          )}
        </div>
      )}
    </div>
  )
}
