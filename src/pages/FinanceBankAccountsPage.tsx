import { useState, type FormEvent } from 'react'
import {
  Building, Landmark, Plus, Copy, CheckCircle2, ShieldCheck,
  Star, Download, X, ExternalLink, Banknote, AlertCircle, ArrowLeft
} from 'lucide-react'
import type { EventItem } from '../data/events'
import {
  bankAccountsSeed, type BankAccount
} from '../data/finance'

type Props = {
  events: EventItem[]
  notify: (message: string) => void
  onNavigate?: (page: any) => void
}

export default function FinanceBankAccountsPage({ events, notify, onNavigate }: Props) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(bankAccountsSeed)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    bankName: 'Banco Itaú S.A.',
    bankCode: '341',
    accountType: 'Corrente' as BankAccount['accountType'],
    agency: '',
    accountNumber: '',
    pixKey: '',
    pixType: 'CNPJ' as BankAccount['pixType'],
    holderName: '',
    holderDocument: '',
  })

  const setPrimary = (id: number) => {
    setBankAccounts(prev =>
      prev.map(b => ({
        ...b,
        isPrimary: b.id === id
      }))
    )
    notify('Conta bancária principal atualizada com sucesso!')
  }

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formData.agency || !formData.accountNumber || !formData.holderName) {
      notify('Preencha os campos obrigatórios.')
      return
    }

    const newAcc: BankAccount = {
      id: bankAccounts.length + 1,
      bankName: formData.bankName,
      bankCode: formData.bankCode,
      accountType: formData.accountType,
      agency: formData.agency,
      accountNumber: formData.accountNumber,
      pixKey: formData.pixKey || formData.holderDocument,
      pixType: formData.pixType,
      holderName: formData.holderName,
      holderDocument: formData.holderDocument,
      isPrimary: false,
      status: 'Verificada'
    }

    setBankAccounts([...bankAccounts, newAcc])
    setShowAddModal(false)
    notify(`Conta bancária ${formData.bankName} cadastrada e verificada!`)
  }

  return (
    <div className="finance-dashboard-wrapper">
      {/* Back to Dashboard bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => onNavigate ? onNavigate('finance-dashboard') : window.history.back()}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1e293b] hover:bg-[#334155] text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#06B6D4]" />
          <span>Voltar ao Dashboard Financeiro</span>
        </button>
      </div>

      {/* Header Section */}
      <section className="finance-header-section card-surface">
        <div className="finance-header-left">
          <span className="eyebrow">DOMICÍLIO BANCÁRIO & PIX</span>
          <div className="finance-title-row">
            <h1>Contas Bancárias Cadastradas</h1>
            <span className="pipeline-status-badge">
              <CheckCircle2 size={13} /> Validação Cadastral CNPJ Ativa
            </span>
          </div>
          <p className="page-subtitle">
            Gerenciamento de contas bancárias, chaves PIX e contas correntes para recebimento dos repasses de bilheteria.
          </p>
        </div>

        <div className="finance-header-controls">
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Cadastrar Nova Conta
          </button>
        </div>
      </section>

      {/* KPI Cards Strip */}
      <section className="finance-kpis-grid">
        <article className="finance-kpi-card card-surface kpi-blue">
          <div className="kpi-icon-wrap">
            <Building size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Contas Ativas</span>
            <strong className="kpi-value">{bankAccounts.length} contas</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">100% Verificadas</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-green">
          <div className="kpi-icon-wrap">
            <Star size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Conta Principal Padrão</span>
            <strong className="kpi-value" style={{ fontSize: '18px' }}>Itaú (341) Ag. 0432</strong>
            <div className="kpi-footer">
              <span className="kpi-tag active">Destino Padrão PIX</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-purple">
          <div className="kpi-icon-wrap">
            <ShieldCheck size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Auditoria de Titularidade</span>
            <strong className="kpi-value">Aprovada</strong>
            <div className="kpi-footer">
              <span className="kpi-tag positive">CNPJ Validado</span>
            </div>
          </div>
        </article>

        <article className="finance-kpi-card card-surface kpi-orange">
          <div className="kpi-icon-wrap">
            <Landmark size={24} />
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Formas Habilitadas</span>
            <strong className="kpi-value">PIX + TED</strong>
            <div className="kpi-footer">
              <span className="kpi-tag neutral">Sem tarifas</span>
            </div>
          </div>
        </article>
      </section>

      {/* Bank Accounts Grid */}
      <section className="bank-accounts-grid">
        {bankAccounts.map(b => (
          <div key={b.id} className="bank-card card-surface" style={{ borderTop: b.isPrimary ? '3px solid #1C79EF' : '1px solid #E2E8F0' }}>
            <div className="bank-card-head">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="bank-code-badge">{b.bankCode}</span>
                <div>
                  <strong style={{ fontSize: '15px' }}>{b.bankName}</strong>
                  <small style={{ display: 'block', color: "var(--disk-text-muted)" }}>Conta {b.accountType}</small>
                </div>
              </div>
              {b.isPrimary ? (
                <span className="primary-pill">Conta Principal</span>
              ) : (
                <button
                  className="text-action"
                  onClick={() => setPrimary(b.id)}
                  style={{ fontSize: '11px' }}
                >
                  Tornar Principal
                </button>
              )}
            </div>

            <div className="bank-details-rows" style={{ padding: '8px 0' }}>
              <div className="bank-detail">
                <span>Agência:</span> <b>{b.agency}</b>
              </div>
              <div className="bank-detail">
                <span>Conta Número:</span> <b>{b.accountNumber}</b>
              </div>
              <div className="bank-detail">
                <span>Chave PIX ({b.pixType}):</span> <code>{b.pixKey}</code>
              </div>
              <div className="bank-detail">
                <span>Titular:</span> <small style={{ fontWeight: 700, color: "var(--disk-text-primary)" }}>{b.holderName}</small>
              </div>
              <div className="bank-detail">
                <span>Documento (CNPJ/CPF):</span> <small>{b.holderDocument}</small>
              </div>
            </div>

            <div className="bank-card-footer">
              <span className="status-verified">
                <CheckCircle2 size={14} /> {b.status}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="icon-action"
                  onClick={() => {
                    navigator.clipboard.writeText(b.pixKey)
                    notify('Chave PIX copiada!')
                  }}
                  title="Copiar Chave PIX"
                >
                  <Copy size={14} /> Copiar PIX
                </button>

                <button
                  className="primary-btn compact-btn"
                  onClick={() => onNavigate?.('finance-payouts')}
                  title="Solicitar Repasse nesta Conta"
                >
                  <Banknote size={13} /> Repasse
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Modal: Cadastrar Conta Bancária */}
      {showAddModal && (
        <div className="utm-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="utm-modal-card wide" onClick={e => e.stopPropagation()}>
            <div className="utm-modal-head">
              <div>
                <span className="eyebrow">NOVA CONTA</span>
                <h3>Cadastrar Conta Bancária</h3>
                <p>Insira os dados bancários da produtora para liquidação de repasses.</p>
              </div>
              <button className="icon-action" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-form-grid">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <label>
                    Instituição Bancária *
                    <select
                      value={formData.bankName}
                      onChange={e => {
                        const val = e.target.value
                        let code = '341'
                        if (val.includes('Bradesco')) code = '237'
                        if (val.includes('Nubank')) code = '260'
                        if (val.includes('Brasil')) code = '001'
                        if (val.includes('Santander')) code = '033'
                        if (val.includes('Inter')) code = '077'
                        setFormData({ ...formData, bankName: val, bankCode: code })
                      }}
                    >
                      <option value="Banco Itaú S.A.">Banco Itaú S.A. (341)</option>
                      <option value="Banco Bradesco S.A.">Banco Bradesco S.A. (237)</option>
                      <option value="Nu Pagamentos (Nubank)">Nu Pagamentos (260)</option>
                      <option value="Banco do Brasil S.A.">Banco do Brasil S.A. (001)</option>
                      <option value="Banco Santander Brasil">Banco Santander Brasil (033)</option>
                      <option value="Banco Inter S.A.">Banco Inter S.A. (077)</option>
                    </select>
                  </label>

                  <label>
                    Tipo de Conta *
                    <select
                      value={formData.accountType}
                      onChange={e => setFormData({ ...formData, accountType: e.target.value as any })}
                    >
                      <option value="Corrente">Conta Corrente</option>
                      <option value="Pagamento">Conta Pagamento</option>
                      <option value="Poupança">Conta Poupança</option>
                    </select>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label>
                    Agência (sem dígito) *
                    <input
                      type="text"
                      value={formData.agency}
                      onChange={e => setFormData({ ...formData, agency: e.target.value })}
                      placeholder="Ex: 0432"
                      required
                    />
                  </label>

                  <label>
                    Número da Conta com Dígito *
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Ex: 29814-5"
                      required
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <label>
                    Tipo de Chave PIX *
                    <select
                      value={formData.pixType}
                      onChange={e => setFormData({ ...formData, pixType: e.target.value as any })}
                    >
                      <option value="CNPJ">CNPJ</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Telefone">Telefone</option>
                      <option value="Aleatória">Chave Aleatória (EVP)</option>
                    </select>
                  </label>

                  <label>
                    Chave PIX *
                    <input
                      type="text"
                      value={formData.pixKey}
                      onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
                      placeholder="Ex: 44.821.902/0001-38"
                      required
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <label>
                    Razão Social / Nome do Titular *
                    <input
                      type="text"
                      value={formData.holderName}
                      onChange={e => setFormData({ ...formData, holderName: e.target.value })}
                      placeholder="Ex: Disk Produções e Eventos Ltda"
                      required
                    />
                  </label>

                  <label>
                    CNPJ ou CPF do Titular *
                    <input
                      type="text"
                      value={formData.holderDocument}
                      onChange={e => setFormData({ ...formData, holderDocument: e.target.value })}
                      placeholder="Ex: 44.821.902/0001-38"
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="utm-modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn primary">
                  <Building size={15} /> Cadastrar Conta Bancária
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
