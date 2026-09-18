import { test, expect, type Page } from '@playwright/test'

// Isola a apresentação: nenhum teste envia alterações ao backend.
const user = { id: 1, name: 'Produtor de teste', email: 'visual@example.test', role: 'producer-admin', producerId: 1, status: 'ativo' }
const events = [{ id: 1, code: '3654', title: 'Evento de referência visual', venue: 'Teatro', city: 'Curitiba', date: '18/09/2026 19:00', producerId: 1, status: 'ativo', cover: 'rock', sales: 0, available: 900, courtesy: 150, total: 0 }]
const modules = ['events', 'profile-dashboard', 'finance-dashboard', 'finance-refunds', 'accounting-dashboard', 'marketing-dashboard', 'sac-hub', 'pos', 'admin-hub', 'finance-bank-accounts', 'finance-reports', 'marketing-tracking', 'commerce-orders', 'new-event']

async function prepare(page: Page, theme: 'dark' | 'light') {
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    const data = path.endsWith('/auth/me') ? user
      : path === '/api/events' ? events
      : path === '/api/producers' ? [{ id: 1, name: 'Produtora de teste', status: 'ativo' }]
      : /producers\/1\/events/.test(path) ? { events }
      : undefined
    return data === undefined
      ? route.fulfill({ status: 503, json: { message: 'Dados indisponíveis no teste visual.' } })
      : route.fulfill({ json: data })
  })
  await page.addInitScript(({ theme }) => {
    localStorage.setItem('disk_token:' + location.origin + '/api', 'visual-test')
    localStorage.setItem('disk-theme', theme)
  }, { theme })
}

for (const theme of ['dark', 'light'] as const) {
  for (const module of modules) {
    test(`${theme}: ${module} mantém superfícies, navegação e conteúdo`, async ({ page }, testInfo) => {
      const errors: string[] = []
      page.on('pageerror', error => errors.push(error.message))
      await page.setViewportSize({ width: 1440, height: 960 })
      await page.route('**/api/**', route => {
        const path = new URL(route.request().url()).pathname
        const data = path.endsWith('/auth/me') ? user
          : path === '/api/events' ? events
          : path === '/api/producers' ? [{ id: 1, name: 'Produtora de teste', status: 'ativo' }]
          : /producers\/1\/events/.test(path) ? { events }
          : undefined
        return data === undefined
          ? route.fulfill({ status: 503, json: { message: 'Dados indisponíveis no teste visual.' } })
          : route.fulfill({ json: data })
      })
      await page.addInitScript(({ theme }) => {
        localStorage.setItem('disk_token:' + location.origin + '/api', 'visual-test')
        localStorage.setItem('disk-theme', theme)
      }, { theme })
      await page.goto(`/app/${module}`)
      const main = page.getByTestId('main-app-content')
      await expect(main).toBeVisible()
      await expect(main.locator('h1').first()).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      await expect(main).toHaveCSS('background-color', theme === 'dark' ? 'rgb(32, 33, 36)' : 'rgb(248, 250, 252)')
      await expect(main).not.toContainText('Ocorreu um erro inesperado')
      await page.screenshot({ path: testInfo.outputPath(`${module}-${theme}.png`) })
      const sidebarY = (await page.getByTestId('main-module-sidebar').boundingBox())!.y
      await main.evaluate(el => { el.scrollTop = 500 })
      expect((await page.getByTestId('main-module-sidebar').boundingBox())!.y).toBe(sidebarY)
      await page.setViewportSize({ width: 390, height: 844 })
      await page.getByTestId('mobile-menu-button').click()
      const drawer = page.getByRole('dialog', { name: 'Menu de Navegação Principal' })
      await expect(drawer).toBeVisible()
      await drawer.getByRole('button', { name: /Fechar/ }).click()
      await expect(drawer).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.screenshot({ path: testInfo.outputPath(`${module}-${theme}-mobile.png`) })
      expect(errors).toEqual([])
    })
  }
}

for (const theme of ['dark', 'light'] as const) {
  for (const tool of ['dashboard', 'inventory', 'customer-360', 'live-ops', 'incidents', 'revenue-intel', 'forecast', 'day-command', 'pixel', 'utm']) {
    test(`${theme}: evento ${tool} preserva contexto e tema`, async ({ page }, testInfo) => {
      await prepare(page, theme)
      await page.setViewportSize({ width: 1440, height: 960 })
      const errors: string[] = []
      page.on('pageerror', e => errors.push(e.message))
      await page.goto(`/eventos/3654/${tool}`)
      await expect(page.getByTestId('event-context-sidebar')).toBeVisible()
      await expect(page.getByTestId('main-app-content')).toBeVisible()
      await expect(page.getByTestId('main-app-content').locator('h1').first()).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath(`evento-${tool}-${theme}.png`) })
      await page.getByRole('button', { name: 'Recolher menu lateral', exact: true }).click()
      await expect.poll(async () => Math.round((await page.getByTestId('event-context-sidebar').boundingBox())!.width)).toBe(64)
      await page.getByRole('button', { name: 'Expandir menu lateral', exact: true }).click()
      await expect.poll(async () => Math.round((await page.getByTestId('event-context-sidebar').boundingBox())!.width)).toBe(284)
      expect(errors).toEqual([])
    })
  }
  test(`${theme}: formulário de estorno mantém contraste e pode ser cancelado`, async ({ page }, testInfo) => {
    await prepare(page, theme)
    await page.goto('/app/finance-refunds')
    await page.getByRole('button', { name: /Novo Estorno/ }).click()
    const modal = page.locator('.estcc-modal-box')
    await expect(modal).toBeVisible()
    await expect(modal.locator('input').first()).toHaveCSS('background-color', theme === 'dark' ? 'rgb(43, 44, 51)' : 'rgb(255, 255, 255)')
    await modal.locator('input').first().fill('12345')
    await page.screenshot({ path: testInfo.outputPath(`modal-estorno-${theme}.png`) })
    await modal.getByRole('button', { name: 'Cancelar', exact: true }).click()
    await expect(modal).toHaveCount(0)
  })
  test(`${theme}: acesso segue o padrão visual`, async ({ page }, testInfo) => {
    await prepare(page, theme)
    await page.goto('/login')
    await expect(page.locator('.login-page')).toBeVisible()
    await expect(page.locator('.login-card')).toHaveCSS('background-color', theme === 'dark' ? 'rgb(43, 44, 51)' : 'rgb(255, 255, 255)')
    await page.screenshot({ path: testInfo.outputPath(`login-${theme}.png`) })
  })
}
