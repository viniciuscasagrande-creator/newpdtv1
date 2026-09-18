import React from 'react'
import { ShieldCheck, UserCheck, Clock, Terminal } from 'lucide-react'
import { QuickDrawer } from '../common/QuickDrawer'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatDateTime } from '../../utils/formatters'
import { StatusBadge } from '../common/StatusBadge'

interface AuditDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AuditDrawer({ isOpen, onClose }: AuditDrawerProps) {
  const { auditLogs } = useCoreEventBus()

  return (
    <QuickDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Trilha de Auditoria & Segurança"
      subtitle={`Registro unificado de ações do operador e integridade operacional (${auditLogs.length} eventos)`}
      width="lg"
      footer={
        <div className="flex items-center justify-between text-[11px] text-slate-500 w-full font-mono">
          <span>LGPD & Compliance DiskIngressos</span>
          <span>SHA-256 Verificado</span>
        </div>
      }
    >
      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors text-xs"
          >
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <StatusBadge variant="slate" size="sm">
                  {log.action}
                </StatusBadge>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {log.module}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(log.timestamp)}
              </span>
            </div>

            <p className="mt-2 text-slate-700 leading-relaxed font-sans">
              {log.details}
            </p>

            <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[10.5px] text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <UserCheck className="h-3 w-3 text-slate-400" />
                {log.operatorName} ({log.role})
              </span>
              <span className="font-mono flex items-center gap-1">
                <Terminal className="h-3 w-3" /> IP: {log.ip}
              </span>
            </div>
          </div>
        ))}
      </div>
    </QuickDrawer>
  )
}
