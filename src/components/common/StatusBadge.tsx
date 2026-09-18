import React from 'react'
import { cn } from '../../utils/cn'

export type BadgeVariant =
  | 'success'
  | 'emerald'
  | 'blue'
  | 'amber'
  | 'warning'
  | 'rose'
  | 'danger'
  | 'slate'
  | 'purple'
  | 'indigo'

interface StatusBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
  size?: 'sm' | 'md'
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
  success: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dotColor: 'bg-emerald-500',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/20',
    dotColor: 'bg-emerald-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/20',
    dotColor: 'bg-blue-500',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-500/20',
    dotColor: 'bg-indigo-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-500/20',
    dotColor: 'bg-amber-500',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-800 dark:text-amber-400',
    border: 'border-amber-500/20',
    dotColor: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/20',
    dotColor: 'bg-rose-500',
  },
  danger: {
    bg: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/20',
    dotColor: 'bg-rose-500',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/20',
    dotColor: 'bg-purple-500',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
  },
}

export function StatusBadge({
  children,
  variant = 'slate',
  className,
  dot = false,
  size = 'sm',
}: StatusBadgeProps) {
  const styles = variantStyles[variant] || variantStyles.slate

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1',
        styles.bg,
        styles.text,
        styles.border,
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', styles.dotColor)} />}
      {children}
    </span>
  )
}
