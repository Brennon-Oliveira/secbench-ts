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

const outDir = path.join(ROOT, 'results/raw/semgrep')
fs.mkdirSync(outDir, { recursive: true })
const id = stamp()
const outFile = path.join(outDir, `${id}.json`)
const cmd = ['semgrep', '--config', 'p/javascript', '--config', 'p/typescript', '--json', 'corpus']

try {
  const stdout = execFileSync(cmd[0]!, cmd.slice(1), { cwd: ROOT, encoding: 'utf8', maxBuffer: 50_000_000 })
  fs.writeFileSync(outFile, stdout)
} catch (err) {
  const e = err as { stdout?: string; message?: string }
  if (e.stdout) fs.writeFileSync(outFile, e.stdout)
  else {
    fs.writeFileSync(outFile, JSON.stringify({ skipped: true, reason: e.message, results: [] }, null, 2))
  }
}

let version = 'unknown'
try {
  version = execFileSync('semgrep', ['--version'], { encoding: 'utf8' }).trim()
} catch {
  /* tool absent */
}

fs.writeFileSync(
  path.join(outDir, `${id}.meta.json`),
  JSON.stringify(
    { tool: 'semgrep', version, date: new Date().toISOString(), command: cmd.join(' ') },
    null,
    2,
  ) + '\n',
)
console.log(`scan:semgrep -> ${outFile}`)
