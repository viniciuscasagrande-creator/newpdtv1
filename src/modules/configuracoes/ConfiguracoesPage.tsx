import React, { useState } from 'react'
import {
  Settings,
  CreditCard,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ConfiguracoesPage() {
  const { currentUser } = useAuth()
  const [saved, setSaved] = useState(false)

  const [platformFee, setPlatformFee] = useState('10.0')
  const [chargebackThreshold, setChargebackThreshold] = useState('0.50')
  const [payoutHoldDays, setPayoutHoldDays] = useState('2')
  const [pixInstantEnabled, setPixInstantEnabled] = useState(true)
  const [twoFactorRequired, setTwoFactorRequired] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <Settings className="h-3 w-3" /> Configurações Gerais
            </span>
            <span className="text-xs text-slate-400 font-mono">Core Platform v2.0</span>
          </div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Parâmetros do Ecossistema
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed mt-1">
            Operador autenticado: <span className="text-white font-semibold">{currentUser.name}</span> ({currentUser.roleLabel}). Definição das taxas globais, limites de chargeback, réguas de custódia e políticas de segurança.
          </p>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Configurações salvas e propagadas nos 9 módulos com sucesso!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial & Fee Rules */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" /> Regras Financeiras & Taxas de Intermediação
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Taxa de Serviço Padrão (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 font-mono focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Comissão DiskIngressos retida no split da adquirente
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Risco Chargeback (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={chargebackThreshold}
                onChange={(e) => setChargebackThreshold(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 font-mono focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Alerta automático de compliance se ultrapassado
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Retenção Custódia D+ (Dias)
              </label>
              <input
                type="number"
                value={payoutHoldDays}
                onChange={(e) => setPayoutHoldDays(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 font-mono focus:border-emerald-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Prazo de reserva antes de liberar repasse
              </span>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" /> Segurança & Autenticação
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Exigir Autenticação em Duas Etapas (2FA)
                </span>
                <span className="text-[11px] text-slate-500">
                  Obrigatório para operadores de Financeiro, Contabilidade e Estorno
                </span>
              </div>
              <input
                type="checkbox"
                checked={twoFactorRequired}
                onChange={(e) => setTwoFactorRequired(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Liberação Imediata de Vendas PIX
                </span>
                <span className="text-[11px] text-slate-500">
                  QR Code dinâmico com confirmação via webhook instantâneo
                </span>
              </div>
              <input
                type="checkbox"
                checked={pixInstantEnabled}
                onChange={(e) => setPixInstantEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            <Save className="h-4 w-4" /> Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  )
}
