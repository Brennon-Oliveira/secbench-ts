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

const outDir = path.join(ROOT, 'results/raw/njsscan')
fs.mkdirSync(outDir, { recursive: true })
const id = stamp()
const outFile = path.join(outDir, `${id}.json`)

try {
  const stdout = execFileSync('njsscan', ['--json', '-o', outFile, 'corpus'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  if (!fs.existsSync(outFile) && stdout) fs.writeFileSync(outFile, stdout)
} catch (err) {
  const e = err as { message?: string }
  if (!fs.existsSync(outFile)) {
    fs.writeFileSync(outFile, JSON.stringify({ skipped: true, reason: e.message, nodejs: {} }, null, 2))
  }
}

let version = 'unknown'
try {
  version = execFileSync('njsscan', ['--version'], { encoding: 'utf8' }).trim()
} catch {
  /* absent */
}

fs.writeFileSync(
  path.join(outDir, `${id}.meta.json`),
  JSON.stringify(
    { tool: 'njsscan', version, date: new Date().toISOString(), command: 'njsscan --json -o <out> corpus' },
    null,
    2,
  ) + '\n',
)
console.log(`scan:njsscan -> ${outFile}`)
