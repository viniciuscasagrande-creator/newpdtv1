import { expect, test } from '@playwright/test'
import { login, producerA } from '../fixtures/auth'

const protectedModules = [
  { label: /Eventos/i, route: '/app/events' },
  { label: /Financeiro/i, route: '/app/finance-dashboard' },
  { label: /Estornos/i, route: '/app/finance-refunds' },
  { label: /Marketing/i, route: '/app/marketing-dashboard' },
  { label: /Atendimento|SAC/i, route: '/app/sac-hub' },
]

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || process.env.DEPLOY_GUARD_BASE_URL || 'https://newpdtv1.vercel.app'
})

test.describe('Fase 26.x.3 • Deploy Guard pós-Vercel', () => {
  test('deploy responde e carrega a aplicação', async ({ page }) => {
    const response = await page.goto('/app', { waitUntil: 'domcontentloaded' })
    expect(response?.ok()).toBeTruthy()
    await expect(page).toHaveTitle(/DiskIngressos|SafeSaff|Gestão de Eventos/i)
  })

  test('login de produtor continua operacional', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await login(page)
    await expect(page).toHaveURL(/\/(?:app|dashboard)/)
  })

  test('módulos core protegidos permanecem acessíveis', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await login(page)
    for (const module of protectedModules) {
      await page.goto(module.route)
      await expect(page).toHaveURL(new RegExp(module.route.replaceAll('/', '\\/')))
      await expect(page.locator('body')).not.toContainText(/404|not found|página não encontrada/i)
    }
  })

  test('Estornos continua independente e não desaparece', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await login(page)
    await page.goto('/app/finance-refunds')
    await expect(page).toHaveURL(/\/app\/finance-refunds/)
    await expect(page.locator('body')).toContainText(/Estornos|Reembolsos|Chargebacks/i)
  })

  test('Central de Eventos mantém os controles visuais aprovados', async ({ page }) => {
    test.skip(!producerA.email || !producerA.password, 'Credenciais E2E não configuradas')
    await login(page)
    await page.goto('/app/events')
    await expect(page.getByText('Comparar', { exact: true })).toBeVisible()
    await expect(page.getByText('Horizontal', { exact: true })).toBeVisible()
    for (const label of ['Ativos', 'Inativos', 'Todos']) await expect(page.getByText(label, { exact: true })).toBeVisible()
  })
})
