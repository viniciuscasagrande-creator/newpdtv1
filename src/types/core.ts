export type SystemModuleId =
  | 'overview'
  | 'eventos'
  | 'comercial'
  | 'suporte-eventos'
  | 'sac'
  | 'estorno'
  | 'financeiro'
  | 'contabilidade'
  | 'marketing'
  | 'remarketing'
  | 'configuracoes'
  | 'auditoria'

export type UserRole =
  | 'admin'
  | 'gestor_operacional'
  | 'financeiro'
  | 'comercial'
  | 'sac'
  | 'marketing'
  | 'produtor'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  roleLabel: string
  permissions: SystemModuleId[]
  activeProducerId?: string
}

export interface Producer {
  id: string
  name: string
  tradeName: string
  cnpj: string
  email: string
  phone: string
  city: string
  state: string
  activeEventsCount: number
}

export type EventStatus = 'em_venda' | 'em_operacao' | 'encerrado' | 'em_planejamento'

export interface EventItem {
  id: string
  code: string // e.g. "EVT-10592"
  numericId: number // e.g. 10592
  name: string
  producerId: string
  producerName: string
  venue: string
  city: string
  state: string
  startDate: string
  endDate: string
  status: EventStatus
  totalCapacity: number
  ticketsSold: number
  totalRevenue: number
  checkinsCount: number
}

export type PeriodPreset =
  | 'hoje'
  | 'ontem'
  | 'ultimos_7_dias'
  | 'ultimos_30_dias'
  | 'este_mes'
  | 'ano_atual'
  | 'todo_periodo'

export interface PeriodFilter {
  preset: PeriodPreset
  label: string
  startDate: string
  endDate: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  timestamp: string
  module: SystemModuleId
  type: 'info' | 'success' | 'warning' | 'danger'
  read: boolean
  link?: string
}

export interface AuditLogItem {
  id: string
  timestamp: string
  operatorName: string
  operatorEmail: string
  role: string
  action: string
  module: SystemModuleId
  targetId?: string
  details: string
  ip: string
}

export interface SaleTransactionEvent {
  orderId: string
  orderNumber: string
  eventId: string
  eventName: string
  producerId: string
  customerName: string
  customerCpf: string
  ticketsCount: number
  ticketType: string
  grossAmount: number
  netAmount: number
  feeAmount: number
  gateway: string
  paymentMethod: 'pix' | 'cartao_credito' | 'boleto'
  timestamp: string
}
