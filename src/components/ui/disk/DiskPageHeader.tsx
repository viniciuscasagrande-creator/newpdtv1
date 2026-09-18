import React, { type ReactNode } from 'react'

export interface DiskBreadcrumbItem {
  label: string
  href?: string
  active?: boolean
  onClick?: () => void
}

export interface DiskPageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  eyebrow?: string
  tag?: string
  badge?: ReactNode
  badgeTone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
  badges?: ReactNode[]
  primaryAction?: ReactNode
  secondaryActions?: ReactNode
  actions?: ReactNode
  tabs?: ReactNode
  metadata?: ReactNode
  breadcrumbs?: (string | DiskBreadcrumbItem)[]
  className?: string
}

export const DiskPageHeader: React.FC<DiskPageHeaderProps> = ({
  title,
  subtitle,
  description,
  eyebrow,
  tag,
  badge,
  badgeTone,
  badges = [],
  primaryAction,
  secondaryActions,
  actions,
  tabs,
  metadata,
  breadcrumbs,
  className = ''
}) => {
  const displaySubtitle = subtitle || description
  const displayEyebrow = tag || eyebrow

  return (
    <div
      className={`disk-page-header mb-6 pb-4 sm:pb-5 border-b border-[var(--disk-border-default,#e2e8f0)] transition-colors ${className}`}
      data-testid="disk-page-header"
    >
      {/* Breadcrumbs se houver */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-[var(--disk-text-muted,#64748b)] mb-2 overflow-x-auto py-0.5">
          {breadcrumbs.map((rawCrumb, idx) => {
            const crumb = typeof rawCrumb === 'string' ? { label: rawCrumb } : rawCrumb
            const isLast = idx === breadcrumbs.length - 1
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && <span className="opacity-40">/</span>}
                {crumb.onClick || crumb.href ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="hover:text-[var(--disk-color-primary,#f97316)] transition-colors font-medium whitespace-nowrap cursor-pointer bg-transparent border-0 p-0 text-inherit text-xs"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className={`${isLast ? 'font-semibold text-[var(--disk-text-primary,#0f172a)]' : ''} whitespace-nowrap`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 max-w-4xl">
          {/* Eyebrow & Badges */}
          {(displayEyebrow || badge || (badges && badges.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {displayEyebrow && (
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[var(--disk-color-primary,#f97316)]">
                  {displayEyebrow}
                </span>
              )}
              {badge}
              {badges.map((b, i) => (
                <React.Fragment key={i}>{b}</React.Fragment>
              ))}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--disk-text-primary,#0f172a)] tracking-tight leading-tight">
              {title}
            </h1>
          </div>

          {/* Subtitle */}
          {displaySubtitle && (
            <p className="text-xs sm:text-sm text-[var(--disk-text-secondary,#475569)] mt-1 max-w-3xl leading-relaxed">
              {displaySubtitle}
            </p>
          )}

          {/* Metadata */}
          {metadata && (
            <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-[var(--disk-text-muted,#64748b)]">
              {metadata}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(actions || primaryAction || secondaryActions) && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {actions}
            {secondaryActions}
            {primaryAction}
          </div>
        )}
      </div>

      {/* Abas Integradas Opcionais */}
      {tabs && <div className="mt-2 -mb-4 overflow-x-auto">{tabs}</div>}
    </div>
  )
}

// -----------------------------------------------------------------------------
// DiskSectionHeader: Cabeçalho para Seções Internas de Página
// -----------------------------------------------------------------------------

export interface DiskSectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

export const DiskSectionHeader: React.FC<DiskSectionHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  className = '',
}) => {
  return (
    <div
      data-testid="disk-section-header"
      className={`disk-section-header w-full flex items-center justify-between gap-3 pb-2.5 border-b border-[var(--disk-border-subtle,#f1f5f9)] mb-4 select-none ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[var(--disk-text-primary,#0f172a)] tracking-tight truncate">
            {title}
          </h3>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-xs text-[var(--disk-text-muted,#64748b)] mt-0.5 leading-relaxed truncate">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

export default DiskPageHeader
