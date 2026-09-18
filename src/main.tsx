import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './design-system'
import './styles.css'
import './design-system/tokens/tokens.css'
import './styles/limitless-enterprise.css'
import './styles/responsive-enterprise-360.css'
import './styles/sidebar-enterprise.css'
import './styles/disk-master-visual.css'
import './styles/limitless-disk-bridge.css'
import './styles/limitless-disk-global.css'
import './styles/disk-limitless-shell-v6.css'
import './styles/disk-limitless-v7.css'
import './styles/disk-reference-shell.css'

document.documentElement.dataset.uiFramework = 'limitless'
document.documentElement.dataset.marketingIntegrationsRelease = '25.7-marketing-integrations-360-2026-09-02'
document.documentElement.dataset.responsiveRelease = '25.6-responsive-enterprise-360-2026-09-02'
document.documentElement.dataset.diskMasterVisual = '2026-09-17-limitless-v7-pedidos'

document.documentElement.dataset.sidebarRelease = '25.7.1.1-sidebar-typography-hotfix-2026-09-02'
document.documentElement.dataset.cartScopeRelease = '25.8.1-abandoned-cart-tenant-event-scope-2026-09-02'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Elemento #root não encontrado no index.html')
}

document.documentElement.dataset.eventRemarketingRelease = '25.8.2-event-remarketing-functional-2026-09-02'

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (error) {
  if (import.meta.env.DEV) {
    console.error('Falha ao iniciar DiskIngressos:', error)
  }

  root.innerHTML = `
    <div style="
      min-height:100vh;
      background:#08111f;
      color:#fff;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:Arial,sans-serif;
      padding:24px;
    ">
      <div style="max-width:500px;text-align:center;background:#131d2e;padding:32px;border-radius:12px;border:1px solid #23344d">
        <h2 style="margin:0 0 10px 0;font-size:20px;color:#fff">Não foi possível iniciar o sistema.</h2>
        <p style="margin:0 0 20px 0;color:#94a3b8;font-size:14px">Verifique o console do navegador para identificar o erro.</p>
        <button onclick="window.location.reload()" style="padding:10px 18px;background:#2563EB;color:#fff;border:0;border-radius:6px;font-weight:bold;cursor:pointer">Recarregar página</button>
      </div>
    </div>
  `
}


document.documentElement.setAttribute('data-recovery-engine-release', '25.8.3-auto-recovery-engine-2026-09-03')

document.documentElement.dataset.eventOsRelease = '26.1-event-cockpit-activity-stream-2026-09-03'

document.documentElement.dataset.inventoryEngineRelease = '26.2-inventory-engine-2026-09-03'

document.documentElement.dataset.customerRelease = '26.3-customer-crm-2026-09-03'

document.documentElement.dataset.qaRelease = '26.x.3.10-runtime-functional-stability-2026-09-03'

document.documentElement.dataset.eventOsCompleteRelease = '26.x-complete-event-os-2026-09-03'
