import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function stamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

const configPath = path.join(ROOT, 'scripts/eslint.corpus.config.mjs')
const outDir = path.join(ROOT, 'results/raw/eslint')
fs.mkdirSync(outDir, { recursive: true })
const id = stamp()
const outFile = path.join(outDir, `${id}.json`)

try {
  const stdout = execFileSync(
    'npx',
    ['eslint', '-c', configPath, '-f', 'json', 'corpus'],
    { cwd: ROOT, encoding: 'utf8', maxBuffer: 50_000_000 },
  )
  fs.writeFileSync(outFile, stdout || '[]')
} catch (err) {
  const e = err as { stdout?: string; message?: string }
  if (e.stdout) fs.writeFileSync(outFile, e.stdout)
  else fs.writeFileSync(outFile, JSON.stringify([{ skipped: true, reason: e.message }], null, 2))
}

let version = 'unknown'
try {
  version = execFileSync('npx', ['eslint', '--version'], { cwd: ROOT, encoding: 'utf8' }).trim()
} catch {
  /* absent */
}

fs.writeFileSync(
  path.join(outDir, `${id}.meta.json`),
  JSON.stringify(
    {
      tool: 'eslint',
      version,
      date: new Date().toISOString(),
      command: `npx eslint -c scripts/eslint.corpus.config.mjs -f json corpus`,
    },
    null,
    2,
  ) + '\n',
)
console.log(`scan:eslint -> ${outFile}`)
