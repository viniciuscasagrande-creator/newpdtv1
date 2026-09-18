const baseURL = (process.env.PLAYWRIGHT_BASE_URL || process.env.DEPLOY_GUARD_BASE_URL || 'https://newpdtv1.vercel.app').replace(/\/$/, '')
const expectedTitle = /DiskIngressos|SafeSaff|Gestão de Eventos/i

async function check(path) {
  const url = `${baseURL}${path}`
  const started = Date.now()
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'SafeSaff-Deploy-Guard/26.x.3' } })
  const text = await response.text()
  return { url, status: response.status, ok: response.ok, ms: Date.now() - started, text }
}

const checks = []
for (const path of ['/', '/app', '/app/events', '/app/finance-dashboard', '/app/finance-refunds', '/app/marketing-dashboard', '/app/sac-hub']) {
  try {
    const result = await check(path)
    checks.push({ path, status: result.status, ok: result.ok, ms: result.ms })
    if (!result.ok) throw new Error(`${path} retornou HTTP ${result.status}`)
    if (path === '/' && !expectedTitle.test(result.text)) {
      throw new Error('HTML principal não contém identidade esperada do SafeSaff/DiskIngressos')
    }
  } catch (error) {
    console.error(`[FAIL] ${path}: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}

console.log(JSON.stringify({ release: '26.x.3-deploy-guard-2026-09-03', baseURL, checkedAt: new Date().toISOString(), checks }, null, 2))
if (process.exitCode) process.exit(process.exitCode)
