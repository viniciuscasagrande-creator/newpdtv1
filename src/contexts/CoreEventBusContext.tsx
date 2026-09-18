import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuditLogItem, SaleTransactionEvent } from '../types/core'
import { initialAuditLogs } from '../data/mockAuditLogs'
import { useGlobalContext } from './GlobalContext'
import { useNotifications } from './NotificationContext'
import { useAuth } from './AuthContext'
import { formatCurrency } from '../utils/formatters'

interface ToastState {
  id: string
  title: string
  message: string
  module: string
  grossAmount: number
}

interface CoreEventBusContextType {
  transactions: SaleTransactionEvent[]
  auditLogs: AuditLogItem[]
  activeToast: ToastState | null
  dispatchSale: (custom?: Partial<SaleTransactionEvent>) => void
  addAuditLog: (log: Omit<AuditLogItem, 'id' | 'timestamp'>) => void
  dismissToast: () => void
}

const CoreEventBusContext = createContext<CoreEventBusContextType | undefined>(undefined)

export function CoreEventBusProvider({ children }: { children: ReactNode }) {
  const { events, selectedEvent, updateEventStats } = useGlobalContext()
  const { addNotification } = useNotifications()
  const { currentUser } = useAuth()

  const [transactions, setTransactions] = useState<SaleTransactionEvent[]>([
    {
      orderId: 'ord-983720',
      orderNumber: '#PED-983720',
      eventId: 'evt-5842',
      eventName: 'Festival Rock 2026',
      producerId: 'prod-01',
      customerName: 'Lucas Ferreira Lima',
      customerCpf: '109.843.221-50',
      ticketsCount: 2,
      ticketType: 'Pista Premium (2º Lote)',
      grossAmount: 480.0,
      netAmount: 432.0,
      feeAmount: 48.0,
      gateway: 'Pagar.me / Cielo',
      paymentMethod: 'pix',
      timestamp: '2026-09-18T13:40:12',
    },
    {
      orderId: 'ord-983721',
      orderNumber: '#PED-983721',
      eventId: 'evt-10592',
      eventName: 'Festival de Verão Curitiba',
      producerId: 'prod-01',
      customerName: 'Camila Mendonça Rosa',
      customerCpf: '088.761.439-01',
      ticketsCount: 1,
      ticketType: 'Camarote Open Bar',
      grossAmount: 350.0,
      netAmount: 315.0,
      feeAmount: 35.0,
      gateway: 'Rede / Inter',
      paymentMethod: 'cartao_credito',
      timestamp: '2026-09-18T13:42:55',
    },
  ])

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs)
  const [activeToast, setActiveToast] = useState<ToastState | null>(null)

  const addAuditLog = (log: Omit<AuditLogItem, 'id' | 'timestamp'>) => {
    const newLog: AuditLogItem = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    setAuditLogs((prev) => [newLog, ...prev])
  }

  const dismissToast = () => {
    setActiveToast(null)
  }

  const dispatchSale = (custom?: Partial<SaleTransactionEvent>) => {
    // Determine target event
    const targetEvent = selectedEvent || events[0]
    const orderNum = `#PED-${Math.floor(980000 + Math.random() * 19000)}`
    const tickets = custom?.ticketsCount || (Math.random() > 0.5 ? 2 : 1)
    const pricePerTicket = custom?.grossAmount ? custom.grossAmount / tickets : 180 + Math.floor(Math.random() * 120)
    const gross = custom?.grossAmount || tickets * pricePerTicket
    const fee = Math.round(gross * 0.1 * 100) / 100 // 10% DiskIngressos fee
    const net = gross - fee

    const newSale: SaleTransactionEvent = {
      orderId: `ord-${Date.now()}`,
      orderNumber: orderNum,
      eventId: targetEvent.id,
      eventName: targetEvent.name,
      producerId: targetEvent.producerId,
      customerName: custom?.customerName || 'Guilherme Rocha Santos',
      customerCpf: custom?.customerCpf || '342.109.876-44',
      ticketsCount: tickets,
      ticketType: custom?.ticketType || 'Pista VIP - Lote Oficial',
      grossAmount: gross,
      netAmount: net,
      feeAmount: fee,
      gateway: custom?.gateway || 'Pagar.me V5',
      paymentMethod: custom?.paymentMethod || 'pix',
      timestamp: new Date().toISOString(),
    }

    // 1. Update transactions
    setTransactions((prev) => [newSale, ...prev])

    // 2. Propagate to GlobalContext (Eventos & Financeiro)
    updateEventStats(targetEvent.id, tickets, gross)

    // 3. Propagate to Audit Logs
    addAuditLog({
      operatorName: currentUser.name,
      operatorEmail: currentUser.email,
      role: currentUser.roleLabel,
      action: 'VENDA_CONFIRMADA',
      module: 'comercial',
      targetId: orderNum,
      details: `Venda ${orderNum} de ${formatCurrency(gross)} (${tickets}x ${newSale.ticketType}) para ${targetEvent.name}. Taxa: ${formatCurrency(fee)} | Líquido produtor: ${formatCurrency(net)}.`,
      ip: '187.55.120.44',
    })

    // 4. Propagate to Notifications
    addNotification({
      title: `Venda Realizada: ${orderNum}`,
      message: `${formatCurrency(gross)} (${tickets} ingressos) em ${targetEvent.name}. Propagado para Financeiro, Contabilidade e Marketing.`,
      module: 'comercial',
      type: 'success',
      link: '/comercial/pedidos',
    })

    // 5. Trigger active toast
    setActiveToast({
      id: newSale.orderId,
      title: `Venda Registrada: ${orderNum}`,
      message: `${formatCurrency(gross)} • ${tickets} ing. • ${targetEvent.name}`,
      module: 'Core Multi-Módulo',
      grossAmount: gross,
    })

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setActiveToast((current) => (current?.id === newSale.orderId ? null : current))
    }, 6000)
  }

  return (
    <CoreEventBusContext.Provider
      value={{
        transactions,
        auditLogs,
        activeToast,
        dispatchSale,
        addAuditLog,
        dismissToast,
      }}
    >
      {children}
    </CoreEventBusContext.Provider>
  )
}

export function useCoreEventBus() {
  const context = useContext(CoreEventBusContext)
  if (!context) {
    throw new Error('useCoreEventBus deve ser usado dentro de um CoreEventBusProvider')
  }
  return context
}
