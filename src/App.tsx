import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { GlobalProvider } from './contexts/GlobalContext'
import { CoreEventBusProvider } from './contexts/CoreEventBusContext'
import { AppLayout } from './components/layout/AppLayout'

// Dashboards and Pages
import { OverviewDashboard } from './modules/overview/OverviewDashboard'
import { EventosDashboard } from './modules/eventos/EventosDashboard'
import { ComercialDashboard } from './modules/comercial/ComercialDashboard'
import { SuporteEventosDashboard } from './modules/suporte-eventos/SuporteEventosDashboard'
import { SacDashboard } from './modules/sac/SacDashboard'
import { EstornoDashboard } from './modules/estorno/EstornoDashboard'
import { FinanceiroDashboard } from './modules/financeiro/FinanceiroDashboard'
import { ContabilidadeDashboard } from './modules/contabilidade/ContabilidadeDashboard'
import { MarketingDashboard } from './modules/marketing/MarketingDashboard'
import { RemarketingDashboard } from './modules/remarketing/RemarketingDashboard'
import { AuditoriaPage } from './modules/auditoria/AuditoriaPage'
import { ConfiguracoesPage } from './modules/configuracoes/ConfiguracoesPage'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <GlobalProvider>
          <CoreEventBusProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<OverviewDashboard />} />
                  <Route path="/overview" element={<OverviewDashboard />} />
                  <Route path="/eventos/*" element={<EventosDashboard />} />
                  <Route path="/comercial/*" element={<ComercialDashboard />} />
                  <Route path="/suporte-eventos/*" element={<SuporteEventosDashboard />} />
                  <Route path="/sac/*" element={<SacDashboard />} />
                  <Route path="/estorno/*" element={<EstornoDashboard />} />
                  <Route path="/financeiro/*" element={<FinanceiroDashboard />} />
                  <Route path="/contabilidade/*" element={<ContabilidadeDashboard />} />
                  <Route path="/marketing/*" element={<MarketingDashboard />} />
                  <Route path="/remarketing/*" element={<RemarketingDashboard />} />
                  <Route path="/auditoria" element={<AuditoriaPage />} />
                  <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CoreEventBusProvider>
        </GlobalProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
