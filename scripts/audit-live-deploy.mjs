import https from 'node:https'

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).toString()
        return resolve(get(nextUrl))
      }
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }))
    }).on('error', reject)
  })
}

async function audit() {
  const liveBase = (process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'https://newpdtv1.vercel.app').replace(/\/$/, '')
  console.log(`--- AUDITORIA AO VIVO EM PRODUÇÃO (${liveBase}) ---`)
  const index = await get(`${liveBase}/index.html?_t=${Date.now()}`)
  console.log('Status /:', index.status)
  
  const jsMatch = index.body.match(/src="(\/assets\/index-[^"]+\.js)"/)
  const cssMatch = index.body.match(/href="(\/assets\/index-[^"]+\.css)"/)
  
  if (!jsMatch || !cssMatch) {
    console.error('Falha ao encontrar bundle JS/CSS no index.html')
    process.exit(1)
  }
  
  const jsUrl = liveBase + jsMatch[1]
  const cssUrl = liveBase + cssMatch[1]
  console.log('JS Bundle:', jsUrl)
  console.log('CSS Bundle:', cssUrl)
  
  const js = await get(jsUrl)
  const css = await get(cssUrl)
  
  const markers = [
    // Fase 24.9
    { name: 'Fase 24.9 - Central de Estornos', query: 'Central de Estornos, Reembolsos & Chargebacks' },
    { name: 'Fase 24.9 - Badge ESTORNO Independente', query: 'ESTORNO' },
    { name: 'Fase 24.9 - Fila de Aprovacoes', query: 'Fila de Aprovações' },
    
    // Fase 25.0 a 25.3
    { name: 'Fase 25.0 - Master ERP Architecture', query: '25.0-master-erp-crm-finance-producer-2026-09-02' },
    { name: 'Fase 25.1 - Ledger Contabil', query: '25.1-ledger-chart-of-accounts-2026-09-02' },
    { name: 'Fase 25.2 - Motor de Split', query: '25.2-split-financial-agreements-2026-09-02' },
    { name: 'Fase 25.3 - Conta Grafica do Produtor', query: '25.3-producer-ledger-account-2026-09-02' },
    { name: 'Fase 25.3 - Buckets Financeiros', query: 'BUCKETS FINANCEIROS' },
    
    // Fase 25.3.2.1
    { name: 'Fase 25.3.2.1 - Sidebar Auto-Collapse', query: '25.3.2.1-premium-sidebar-auto-collapse-2026-09-02' },
    
    // Fase 25.3.3
    { name: 'Fase 25.3.3 - Navigation Rail Financeiro', query: '25.3.3-navigation-rail-financial-typography-2026-09-02' },
    
    // Fase 25.3.4
    { name: 'Fase 25.3.4 - Limitless Enterprise UI', query: '25.3.4-limitless-enterprise-ui-2026-09-02' },
    
    // Fase 25.4
    { name: 'Fase 25.4 - Recebiveis & Liquidacao', query: '25.4-receivables-settlement-agenda-2026-09-02' },
    { name: 'Fase 25.4 - Curva de Liquidacao', query: 'Curva de liquidação' },
    { name: 'Fase 25.4 - Mix de Recebiveis', query: 'Mix de recebíveis' },
    
    // Fase 25.5
    { name: 'Fase 25.5 - Repasses & Disponibilidade', query: '25.5-payouts-reserves-availability-2026-09-02' },
    { name: 'Fase 25.5 - Waterfall do Repasse', query: 'WATERFALL DO REPASSE' },
    { name: 'Fase 25.5 - Politica de Reserva', query: 'POLÍTICA DE RESERVA' },
    
    // Fase 25.6
    { name: 'Fase 25.6 - Responsividade Enterprise 360', query: '25.6-responsive-enterprise-360-2026-09-02' },

    // Fase 25.6.1
    { name: 'Fase 25.6.1 - Sidebar Premium Referência Vídeo', query: '25.6.1-sidebar-reference-navigation-2026-09-02' },

    // Fase 25.7
    { name: 'Fase 25.7 - Integrações de Marketing 360', query: '25.7-marketing-integrations-360-2026-09-02' },
    { name: 'Fase 25.7 - Catálogo Marketing Integrations', query: 'marketingIntegrationCatalog' }
  ]
  
  console.log('\n--- VERIFICAÇÃO DE MARCADORES DE RELEASE NO BUNDLE VERCEL ---')
  let passed = 0
  for (const m of markers) {
    const presentInJs = js.body.includes(m.query)
    const presentInCss = css.body.includes(m.query)
    if (presentInJs || presentInCss) {
      console.log(` ✅ ${m.name}: PRESENTE NO BUNDLE`)
      passed++
    } else {
      console.log(` ❌ ${m.name}: AUSENTE`)
    }
  }
  
  console.log(`\nResultado da auditoria live: ${passed}/${markers.length} marcadores ativos em produção na Vercel!`)
}

audit().catch(console.error)
