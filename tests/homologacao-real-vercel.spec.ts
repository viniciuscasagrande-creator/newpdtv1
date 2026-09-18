import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const REPORT_DIR = path.resolve('test-results/homologacao-vercel')
const email = process.env.E2E_PRODUCER_A_EMAIL
const password = process.env.E2E_PRODUCER_A_PASSWORD

type Status = 'PASS' | 'FAIL' | 'WARNING' | 'BLOCKED' | 'NOT_DEPLOYED'
type Row = { step: string; status: Status; details: string; screenshot?: string }

function save(rows: Row[]) {
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(path.join(REPORT_DIR, 'homologacao-report.json'), JSON.stringify({
    release: '26.x.1-deploy-homologation-2026-09-03',
    target: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
    generatedAt: new Date().toISOString(), rows,
  }, null, 2))
}

async function shot(page: Page, name: string) {
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  const file = path.join(REPORT_DIR, name)
  await page.screenshot({ path: file, fullPage: true })
  return file
}

test.describe('Fase 26.x.1 — Homologação real do deploy', () => {
  test('audita o deploy publicado sem presumir eventId nem expor credenciais', async ({ page, request, baseURL }) => {
    const rows: Row[] = []
    const target = baseURL || 'https://newpdtv1.vercel.app'

    const home = await request.get(target).catch(() => null)
    rows.push({ step: 'Disponibilidade HTTP', status: home?.ok() ? 'PASS' : 'FAIL', details: `HTTP ${home?.status() ?? 'sem resposta'}` })

    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    const loginShot = await shot(page, '01-login.png')
    const hasLogin = await page.locator('input[type="email"]').isVisible().catch(() => false)
    rows.push({ step: 'Tela de login', status: hasLogin ? 'PASS' : 'FAIL', details: hasLogin ? 'Formulário renderizado' : 'Formulário não localizado', screenshot: loginShot })

    if (!email || !password) {
      rows.push({ step: 'Fluxo autenticado', status: 'BLOCKED', details: 'Defina E2E_PRODUCER_A_EMAIL e E2E_PRODUCER_A_PASSWORD no ambiente de QA. Nenhuma credencial é embutida no teste.' })
      save(rows)
      test.skip(true, 'Credenciais de QA não fornecidas')
      return
    }

    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.locator('.login-page')).toHaveCount(0, { timeout: 15_000 })
    rows.push({ step: 'Autenticação produtor', status: 'PASS', details: `Login concluído; URL ${page.url()}` })

    await page.goto('/eventos', { waitUntil: 'domcontentloaded' })
    await expect(page.getByTestId('events-page')).toBeVisible({ timeout: 15_000 })
    const centralShot = await shot(page, '02-central-eventos.png')
    const cards = page.getByTestId('event-card')
    const count = await cards.count()
    rows.push({ step: 'Central de Eventos', status: count > 0 ? 'PASS' : 'WARNING', details: `${count} card(s) encontrados`, screenshot: centralShot })

    if (!count) {
      rows.push({ step: 'Event OS 26.x', status: 'BLOCKED', details: 'Não há evento visível para este produtor; não é seguro presumir /eventos/1.' })
      save(rows)
      return
    }

    const code = await cards.first().getAttribute('data-event-code')
    await cards.first().click()
    await expect(page).toHaveURL(new RegExp(`/eventos/${code}/command-center`))
    const cockpit = await page.getByText(/Event Cockpit 360|Cockpit 360|Centro de Comando/i).first().isVisible().catch(() => false)
    rows.push({ step: 'Cockpit 360', status: cockpit ? 'PASS' : 'NOT_DEPLOYED', details: `Evento real selecionado: ${code}` , screenshot: await shot(page, '03-cockpit.png') })

    const inventoryNav = page.getByText('Inventário', { exact: true }).first()
    if (await inventoryNav.isVisible().catch(() => false)) {
      await inventoryNav.click()
      rows.push({ step: 'Inventory Engine', status: /inventory|invent/i.test(await page.locator('body').innerText()) ? 'PASS' : 'FAIL', details: `Navegação contextual; URL ${page.url()}`, screenshot: await shot(page, '04-inventory.png') })
    } else rows.push({ step: 'Inventory Engine', status: 'NOT_DEPLOYED', details: 'Entrada Inventário não localizada no contexto do evento.' })

    const customerNav = page.getByText('Customer 360', { exact: true }).first()
    if (await customerNav.isVisible().catch(() => false)) {
      await customerNav.click()
      rows.push({ step: 'Customer 360', status: /customer 360|crm/i.test(await page.locator('body').innerText()) ? 'PASS' : 'FAIL', details: `Navegação contextual; URL ${page.url()}`, screenshot: await shot(page, '05-customer360.png') })
    } else rows.push({ step: 'Customer 360', status: 'NOT_DEPLOYED', details: 'Entrada Customer 360 não localizada no contexto do evento.' })

    const api = await request.get(`${target}/api/events/${encodeURIComponent(code || '')}/command-center`).catch(() => null)
    const apiStatus = api?.status()
    rows.push({ step: 'Proteção API sem token', status: apiStatus === 401 || apiStatus === 403 ? 'PASS' : 'WARNING', details: `GET sem credencial retornou HTTP ${apiStatus ?? 'sem resposta'}; esperado 401/403.` })

    save(rows)
  })
})
