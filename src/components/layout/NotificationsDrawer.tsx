import React from 'react'
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import { QuickDrawer } from '../common/QuickDrawer'
import { useNotifications } from '../../contexts/NotificationContext'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const typeIcons = {
  info: { icon: Info, color: 'text-blue-500 bg-blue-50' },
  success: { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
  danger: { icon: AlertCircle, color: 'text-rose-500 bg-rose-50' },
}

export function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  return (
    <QuickDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Central de Alertas & Notificações"
      subtitle={`${unreadCount} ${unreadCount === 1 ? 'não lida' : 'não lidas'} de ${notifications.length} notificações`}
      width="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
          </button>
          <span className="text-[11px] text-slate-400 font-mono">Stream Realtime Ativo</span>
        </div>
      }
    >
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma notificação registrada no momento.
          </div>
        ) : (
          notifications.map((notif) => {
            const config = typeIcons[notif.type] || typeIcons.info
            const Icon = config.icon

            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={cn(
                  'group relative rounded-xl border p-3.5 transition-all text-xs cursor-pointer',
                  notif.read
                    ? 'border-slate-100 bg-white/70 hover:bg-slate-50'
                    : 'border-slate-200 bg-slate-50/90 shadow-2xs hover:border-slate-300'
                )}
              >
                {!notif.read && (
                  <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      config.color
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          'font-semibold text-slate-900',
                          !notif.read && 'text-slate-950 font-bold'
                        )}
                      >
                        {notif.title}
                      </h4>
                    </div>

                    <p className="mt-1 text-slate-600 leading-relaxed text-[11.5px]">
                      {notif.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10.5px] text-slate-400">
                      <span className="uppercase font-semibold tracking-wider text-slate-500">
                        {notif.module}
                      </span>
                      <span>{notif.timestamp}</span>
                    </div>

                    {notif.link && (
                      <div className="mt-2 pt-2 border-t border-slate-100">
                        <Link
                          to={notif.link}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 text-[11px]"
                        >
                          Ver detalhes no módulo <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </QuickDrawer>
  )
}
