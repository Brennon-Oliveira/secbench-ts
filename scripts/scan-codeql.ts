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

const outDir = path.join(ROOT, 'results/raw/codeql')
fs.mkdirSync(outDir, { recursive: true })
const id = stamp()
const outFile = path.join(outDir, `${id}.sarif`)
const db = path.join(ROOT, 'results/raw/codeql/db')
const cmdNote = 'codeql database create + codeql database analyze'

try {
  execFileSync(
    'codeql',
    ['database', 'create', db, '--language=javascript', '--source-root=corpus', '--overwrite'],
    { cwd: ROOT, stdio: 'inherit' },
  )
  execFileSync(
    'codeql',
    ['database', 'analyze', db, '--format=sarif-latest', `--output=${outFile}`, 'codeql/javascript-queries:codeql-suites/javascript-security-extended.qls'],
    { cwd: ROOT, stdio: 'inherit' },
  )
} catch (err) {
  const e = err as { message?: string }
  fs.writeFileSync(outFile.replace(/\.sarif$/, '.json'), JSON.stringify({ skipped: true, reason: e.message, runs: [] }, null, 2))
}

let version = 'unknown'
try {
  version = execFileSync('codeql', ['version', '--format=text'], { encoding: 'utf8' }).trim()
} catch {
  /* absent */
}

fs.writeFileSync(
  path.join(outDir, `${id}.meta.json`),
  JSON.stringify({ tool: 'codeql', version, date: new Date().toISOString(), command: cmdNote }, null, 2) + '\n',
)
console.log(`scan:codeql -> ${outDir}`)
