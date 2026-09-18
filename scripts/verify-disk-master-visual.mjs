import fs from 'node:fs'
const main = fs.readFileSync('src/main.tsx','utf8')
const css = fs.readFileSync('src/styles/disk-master-visual.css','utf8')
const checks = [
  [main.includes("disk-master-visual.css"), 'CSS master importado por último'],
  [main.includes('2026-09-17-komposo-global-v2') || main.includes('2026-09-17-limitless-v7-pedidos'), 'marcador de release presente'],
  [css.includes('html.dark'), 'ponte de tema escuro presente'],
  [css.includes('--disk-bg-surface'), 'tokens semânticos usados'],
  [css.includes('.global-topbar'), 'header conectado ao master'],
  [css.includes('#main-module-sidebar'), 'sidebar conectada ao master'],
]
let fail=0
for (const [ok,label] of checks) { console.log(`${ok?'✓':'✗'} ${label}`); if(!ok) fail++ }
if (fail) process.exit(1)
console.log('MASTER VISUAL DISK: estrutura global validada.')
