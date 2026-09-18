import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { useGlobalContext } from '../../contexts/GlobalContext'
import { useCoreEventBus } from '../../contexts/CoreEventBusContext'
import { formatCurrency } from '../../utils/formatters'
import { ShoppingCart, CheckCircle, Sparkles, Send } from 'lucide-react'

interface SimulateSaleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SimulateSaleModal({ isOpen, onClose }: SimulateSaleModalProps) {
  const { events, selectedEvent } = useGlobalContext()
  const { dispatchSale } = useCoreEventBus()

  const defaultEvent = selectedEvent || events[0]
  const [selectedEvtId, setSelectedEvtId] = useState<string>(defaultEvent.id)
  const [customerName, setCustomerName] = useState('Mariana S. Ribeiro')
  const [ticketType, setTicketType] = useState('Pista Premium (2º Lote)')
  const [ticketsCount, setTicketsCount] = useState(2)
  const [pricePerTicket, setPricePerTicket] = useState(175)
  const [gateway, setGateway] = useState('Pagar.me V5')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao_credito' | 'boleto'>('pix')
  const [simulatedSuccess, setSimulatedSuccess] = useState(false)

  const currentEvent = events.find((e) => e.id === selectedEvtId) || defaultEvent
  const grossAmount = ticketsCount * pricePerTicket
  const fee = grossAmount * 0.1 // 10%
  const netAmount = grossAmount - fee

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatchSale({
      eventId: currentEvent.id,
      eventName: currentEvent.name,
      customerName,
      ticketType,
      ticketsCount,
      grossAmount,
      netAmount,
      feeAmount: fee,
      gateway,
      paymentMethod,
    })
    setSimulatedSuccess(true)
    setTimeout(() => {
      setSimulatedSuccess(false)
      onClose()
    }, 1400)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulador de Venda Compartilhada (Core Dispatcher)"
      subtitle="Demonstração prática da comunicação entre Comercial, Eventos, Financeiro, Contabilidade e Marketing"
      maxWidth="xl"
    >
      {simulatedSuccess ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Venda Processada e Propagada com Sucesso!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Os dados foram emitidos pelo Core e sincronizados instantaneamente nos 9 módulos, na central de notificações e na auditoria.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>O que acontece ao confirmar a venda:</span>
            </div>
            <ul className="list-disc list-inside text-slate-600 space-y-1 pl-1">
              <li><strong className="text-slate-800">Eventos:</strong> Adiciona {ticketsCount} ao total de ingressos vendidos e reduz vagas.</li>
              <li><strong className="text-slate-800">Comercial:</strong> Incrementa receita em {formatCurrency(grossAmount)} e gera pedido no feed.</li>
              <li><strong className="text-slate-800">Financeiro:</strong> Credita {formatCurrency(netAmount)} no saldo do produtor.</li>
              <li><strong className="text-slate-800">Contabilidade:</strong> Registra receita DiskIngressos ({formatCurrency(fee)}) e valor de terceiro.</li>
              <li><strong className="text-slate-800">Marketing & Remarketing:</strong> Computa conversão no canal de origem e remove cliente do abandono.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evento de Destino
              </label>
              <select
                value={selectedEvtId}
                onChange={(e) => setSelectedEvtId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} (#{evt.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Comprador
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Ingresso / Lote
              </label>
              <input
                type="text"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade de Ingressos
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={ticketsCount}
                onChange={(e) => setTicketsCount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço Unitário (R$)
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={pricePerTicket}
                onChange={(e) => setPricePerTicket(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Método de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="pix">PIX Instantâneo</option>
                <option value="cartao_credito">Cartão de Crédito (1x a 12x)</option>
                <option value="boleto">Boleto Bancário Registrado</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 border border-emerald-200/80 p-3 text-xs">
            <div>
              <span className="font-semibold text-emerald-900">Total a Distribuir:</span>
              <div className="text-base font-bold text-emerald-700">{formatCurrency(grossAmount)}</div>
            </div>
            <div className="text-right text-[11px] text-emerald-800 space-y-0.5">
              <div>Líquido Produtor: <strong>{formatCurrency(netAmount)}</strong></div>
              <div>Taxa DiskIngressos: <strong>{formatCurrency(fee)}</strong></div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Send className="h-3.5 w-3.5" /> Disparar Venda no Core
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
