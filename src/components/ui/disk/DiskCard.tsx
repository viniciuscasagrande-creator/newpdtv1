import React, { type HTMLAttributes, type ReactNode } from 'react'

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface DiskCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  className?: string
  noPadding?: boolean
  interactive?: boolean
  variant?: CardVariant
  padding?: CardPadding
  hover?: boolean
  selected?: boolean
  loading?: boolean
  disabled?: boolean
}

export const DiskCard: React.FC<DiskCardProps> = ({
  children,
  className = '',
  noPadding = false,
  interactive = false,
  variant = 'default',
  padding,
  hover = false,
  selected = false,
  loading = false,
  disabled = false,
  ...props
}) => {
  const isInteractive = interactive || hover || variant === 'interactive'
  const effectivePadding = noPadding ? 'p-0' : (padding ? {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  }[padding] : 'p-4 sm:p-5')

  const variantClass = variant === 'elevated' 
    ? 'shadow-md border-[var(--disk-border-default,#e2e8f0)]'
    : variant === 'outlined'
    ? 'border-2 border-[var(--disk-border-default,#e2e8f0)] shadow-none'
    : 'border border-[var(--disk-border-default,#e2e8f0)] shadow-xs'

  const interactiveClass = isInteractive 
    ? 'hover:shadow-md hover:border-[var(--disk-border-strong,#cbd5e1)] hover:-translate-y-[1px] cursor-pointer transition-all duration-200' 
    : ''

  const selectedClass = selected 
    ? 'ring-2 ring-[var(--disk-color-primary,#f97316)] border-[var(--disk-color-primary,#f97316)] bg-[var(--disk-color-primary,#f97316)]/5' 
    : ''

  const disabledClass = disabled 
    ? 'opacity-50 pointer-events-none select-none cursor-not-allowed' 
    : ''

  return (
    <div
      data-testid="disk-card"
      className={`disk-card relative overflow-hidden rounded-lg bg-[var(--disk-bg-surface,#ffffff)] text-[var(--disk-text-primary,#0f172a)] transition-all ${variantClass} ${interactiveClass} ${selectedClass} ${disabledClass} ${effectivePadding} ${className}`}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-[var(--disk-bg-surface,#ffffff)]/70 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="w-5 h-5 border-2 border-[var(--disk-color-primary,#f97316)] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  )
}

export interface DiskCardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  badge?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  action?: ReactNode
  className?: string
  children?: ReactNode
}

export const DiskCardHeader: React.FC<DiskCardHeaderProps> = ({
  title,
  subtitle,
  description,
  badge,
  icon,
  actions,
  action,
  children,
  className = '',
  ...props
}) => {
  const headerActions = actions || action
  const displaySubtitle = description || subtitle

  return (
    <div
      className={`disk-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[var(--disk-border-subtle,#f1f5f9)] ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {icon && (
          <div className="p-2 rounded-lg bg-[var(--disk-color-primary,#f97316)]/10 text-[var(--disk-color-primary,#f97316)] shrink-0 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <div className="flex items-center gap-2">
              {typeof title === 'string' ? (
                <h3 className="text-sm sm:text-base font-bold text-[var(--disk-text-primary,#0f172a)] tracking-tight truncate">
                  {title}
                </h3>
              ) : (
                title
              )}
              {badge}
            </div>
          )}
          {displaySubtitle && (
            <p className="text-xs text-[var(--disk-text-muted,#64748b)] mt-0.5 leading-normal">
              {displaySubtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {headerActions && (
        <div className="flex items-center gap-2 shrink-0">
          {headerActions}
        </div>
      )}
    </div>
  )
}

export interface DiskCardBodyProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: ReactNode
}

export const DiskCardBody: React.FC<DiskCardBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`disk-card-body text-sm text-[var(--disk-text-primary,#0f172a)] ${className}`} {...props}>
      {children}
    </div>
  )
}

export type DiskCardContentProps = DiskCardBodyProps
export const DiskCardContent = DiskCardBody

export interface DiskCardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
  children?: ReactNode
}

export const DiskCardFooter: React.FC<DiskCardFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`disk-card-footer pt-3 mt-4 border-t border-[var(--disk-border-subtle,#f1f5f9)] flex items-center justify-between gap-3 text-xs text-[var(--disk-text-muted,#64748b)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const DiskCardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <h3 className={`text-sm sm:text-base font-bold text-[var(--disk-text-primary,#0f172a)] tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  )
}

export const DiskCardDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <p className={`text-xs text-[var(--disk-text-muted,#64748b)] mt-0.5 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  )
}

export default DiskCard
