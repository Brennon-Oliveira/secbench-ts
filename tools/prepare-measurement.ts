/**
 * Monta o ambiente de medicao do SecBench-TS a partir de um clone recem-configurado.
 *
 * O ambiente de medicao contem exclusivamente o material que as ferramentas e o
 * modelo de linguagem precisam ler. Tudo o que descreve o experimento, classifica
 * os casos, documenta o metodo ou registra historico fica de fora, por construcao.
 *
 * Modo padrao (recomendado): copia por lista de inclusao para um diretorio novo.
 *   npm run measurement:prepare -- --out ../secbench-measurement
 *
 * Modo destrutivo: remove tudo o que nao esta na lista de inclusao, no proprio
 * diretorio corrente. Exige --confirm e a presenca de um arquivo .sandbox-ok
 * criado manualmente pelo operador naquele clone.
 *   npm run measurement:prepare -- --in-place --confirm
 *
 * Verificacao isolada, sem alterar nada:
 *   npm run measurement:verify
 */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ORIGIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SANDBOX_NAME = 'loja-api'

/* ------------------------------------------------------------------ *
 * Lista de inclusao
 *
 * Lista de inclusao, e nao de exclusao. A diferenca importa: qualquer
 * arquivo novo que venha a ser adicionado ao repositorio no futuro fica
 * de fora do ambiente de medicao por omissao, em vez de vazar por
 * esquecimento.
 * ------------------------------------------------------------------ */

const INCLUDE_TREES: string[] = ['corpus']

const INCLUDE_FILES: string[] = [
  'tools/llm/prompt.md',
  'tools/llm/run-llm.ts',
  'scripts/scan-semgrep.ts',
  'scripts/scan-codeql.ts',
  'scripts/scan-njsscan.ts',
  'scripts/scan-eslint.ts',
  'scripts/eslint.corpus.config.mjs',
  'package-lock.json',
]

const EMPTY_DIRS: string[] = ['results/raw']

const KEEP_SCRIPTS: string[] = [
  'scan:semgrep',
  'scan:codeql',
  'scan:njsscan',
  'scan:eslint',
  'scan:llm',
]

/* ------------------------------------------------------------------ *
 * Verificacao de vazamento
 * ------------------------------------------------------------------ */

const LEAK_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'marcador de caso', re: /@case-(begin|end)\b/ },
  { name: 'marcador de sink', re: /@sink\b/ },
  { name: 'identificador de caso', re: /\bC-\d{2,4}-\d{2}-[VS]\b/ },
  { name: 'referencia ao gabarito', re: /ground-?truth/i },
  { name: 'referencia ao catalogo', re: /case-catalog|gabarito|catalogo de casos/i },
  { name: 'nome do experimento', re: /secbench/i },
  { name: 'referencia ao harness', re: /harness/i },
  {
    name: 'referencia a especificacao',
    re: /PROJETO\.md|docs\/specs|metodologia\.md|reproducao\.md/i,
  },
  { name: 'referencia ao protocolo', re: /PROTOCOLO-MEDICAO|pre-registrad/i },
]

/* package-lock.json contem nomes de pacotes de terceiros que colidem com o
 * vocabulario proibido, como safe-buffer e safe-regex. Fica fora da varredura
 * de vocabulario, mas permanece sujeito aos padroes acima. */
const VOCAB_SCAN_ROOTS: string[] = ['corpus']
const PATTERN_SCAN_SKIP = new Set<string>(['package-lock.json'])

/* ------------------------------------------------------------------ *
 * Tipos
 * ------------------------------------------------------------------ */

type PackageJson = {
  version?: string
  type?: string
  engines?: Record<string, string>
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

type PackageLock = {
  name?: string
  packages?: Record<string, { name?: string; description?: string }>
}

type Violation = { file: string; kind: string; match: string }

type Digest = { fileCount: number; perFile: Record<string, string>; aggregate: string }

type GitInfo = {
  head: string | null
  branch: string | null
  remote: string | null
  dirty: boolean
}

/* ------------------------------------------------------------------ *
 * Utilitarios
 * ------------------------------------------------------------------ */

const args = process.argv.slice(2)
const flag = (name: string): boolean => args.includes(name)
const value = (name: string): string | undefined => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : undefined
}

function die(msg: string): never {
  console.error(`\nERRO: ${msg}\n`)
  process.exit(1)
}

function walk(dir: string, base: string = dir, acc: string[] = []): string[] {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, base, acc)
    else if (ent.isFile()) acc.push(path.relative(base, p).split(path.sep).join('/'))
  }
  return acc.sort()
}

function sha256(buf: Buffer | string): string {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

function corpusDigest(root: string): Digest {
  const dir = path.join(root, 'corpus')
  if (!fs.existsSync(dir)) die(`corpus/ nao encontrado em ${root}`)
  const files = walk(dir)
  const perFile: Record<string, string> = {}
  for (const f of files) perFile[f] = sha256(fs.readFileSync(path.join(dir, f)))
  const aggregate = sha256(files.map((f) => `${f}:${perFile[f]}`).join('\n'))
  return { fileCount: files.length, perFile, aggregate }
}

function gitInfo(root: string): GitInfo {
  const run = (a: string[]): string | null => {
    try {
      return execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim()
    } catch {
      return null
    }
  }
  return {
    head: run(['rev-parse', 'HEAD']),
    branch: run(['rev-parse', '--abbrev-ref', 'HEAD']),
    remote: run(['remote', 'get-url', 'origin']),
    dirty: run(['status', '--porcelain']) !== '',
  }
}

function loadVocab(root: string): string[] {
  const p = path.join(root, 'tools/forbidden-vocab.json')
  if (!fs.existsSync(p)) return []
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as string[]
  } catch {
    return []
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/* ------------------------------------------------------------------ *
 * Transformacoes aplicadas na copia
 * ------------------------------------------------------------------ */

function neutralizePackageJson(raw: string): string {
  const pkg = JSON.parse(raw) as PackageJson
  const scripts: Record<string, string> = {}
  for (const k of KEEP_SCRIPTS) {
    const v = pkg.scripts?.[k]
    if (v) scripts[k] = v
  }
  const out = {
    name: SANDBOX_NAME,
    version: pkg.version ?? '1.0.0',
    private: true,
    type: pkg.type ?? 'module',
    ...(pkg.engines ? { engines: pkg.engines } : {}),
    scripts,
    dependencies: pkg.dependencies ?? {},
    devDependencies: pkg.devDependencies ?? {},
  }
  return JSON.stringify(out, null, 2) + '\n'
}

function neutralizePackageLock(raw: string): string {
  const lock = JSON.parse(raw) as PackageLock
  lock.name = SANDBOX_NAME
  const root = lock.packages?.['']
  if (root) {
    root.name = SANDBOX_NAME
    delete root.description
  }
  return JSON.stringify(lock, null, 2) + '\n'
}

/* Remove o bloco de comentario de cabecalho, que referencia o harness e a
 * documentacao do experimento. O executor nao envia o proprio codigo ao
 * modelo, mas o ambiente de medicao inteiro precisa ser neutro para que a
 * verificacao de vazamento seja significativa. */
function stripLeadingBlockComment(raw: string): string {
  return raw.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*\n/, '')
}

function minimalTsconfig(): string {
  return (
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          skipLibCheck: true,
          types: ['node'],
        },
        include: ['corpus', 'scripts', 'tools'],
      },
      null,
      2,
    ) + '\n'
  )
}

/* ------------------------------------------------------------------ *
 * Verificacao
 * ------------------------------------------------------------------ */

function scanForLeaks(root: string, vocab: string[]): Violation[] {
  const violations: Violation[] = []
  for (const rel of walk(root)) {
    if (PATTERN_SCAN_SKIP.has(rel)) continue
    if (rel.startsWith('node_modules/')) continue
    const text = fs.readFileSync(path.join(root, rel), 'utf8')

    for (const { name, re } of LEAK_PATTERNS) {
      const m = text.match(re)
      if (m) violations.push({ file: rel, kind: name, match: m[0] })
    }

    const inVocabScope = VOCAB_SCAN_ROOTS.some((r) => rel === r || rel.startsWith(`${r}/`))
    if (!inVocabScope) continue

    for (const term of vocab) {
      if (term.toLowerCase() === 'safe') {
        const re = /\bsafe\b/gi
        let mm: RegExpExecArray | null
        while ((mm = re.exec(text))) {
          const ctx = text.slice(Math.max(0, mm.index - 16), mm.index + 28)
          if (/yaml\.(safe(Load|Dump)|DEFAULT_SAFE_SCHEMA)/i.test(ctx)) continue
          violations.push({ file: rel, kind: 'vocabulario proibido', match: term })
          break
        }
        continue
      }
      const re = term.includes(' ')
        ? new RegExp(escapeRe(term), 'i')
        : new RegExp(`\\b${escapeRe(term)}\\b`, 'i')
      if (re.test(text)) violations.push({ file: rel, kind: 'vocabulario proibido', match: term })
    }
  }
  return violations
}

function reportViolations(violations: Violation[], contexto: string): void {
  if (!violations.length) {
    console.log('\nVerificacao de vazamento: nenhuma ocorrencia.')
    return
  }
  console.error(`\nFALHA: ${violations.length} vazamento(s) ${contexto}:`)
  for (const v of violations.slice(0, 40)) {
    console.error(`  ${v.file}: ${v.kind} (${v.match})`)
  }
  process.exit(2)
}

/* ------------------------------------------------------------------ *
 * Modos
 * ------------------------------------------------------------------ */

function verifyOnly(): void {
  const d = corpusDigest(ORIGIN)
  const g = gitInfo(ORIGIN)
  console.log('Verificacao do corpus de origem')
  console.log(`  diretorio ......... ${ORIGIN}`)
  console.log(`  commit ............ ${g.head ?? 'sem versionamento'}`)
  console.log(`  arvore limpa ...... ${g.head ? (g.dirty ? 'NAO' : 'sim') : 'nao aplicavel'}`)
  console.log(`  arquivos .......... ${d.fileCount}`)
  console.log(`  hash agregado ..... ${d.aggregate}`)
}

function buildSandbox(outDir: string): void {
  const originDigest = corpusDigest(ORIGIN)
  const git = gitInfo(ORIGIN)
  const vocab = loadVocab(ORIGIN)

  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length > 0) {
    die(`${outDir} existe e nao esta vazio. Escolha outro caminho.`)
  }
  fs.mkdirSync(outDir, { recursive: true })

  const included: string[] = []

  for (const tree of INCLUDE_TREES) {
    const src = path.join(ORIGIN, tree)
    if (!fs.existsSync(src)) die(`arvore obrigatoria ausente: ${tree}`)
    for (const rel of walk(src)) {
      const to = path.join(outDir, tree, rel)
      fs.mkdirSync(path.dirname(to), { recursive: true })
      fs.copyFileSync(path.join(src, rel), to)
      included.push(`${tree}/${rel}`)
    }
  }

  for (const rel of INCLUDE_FILES) {
    const from = path.join(ORIGIN, rel)
    if (!fs.existsSync(from)) die(`arquivo obrigatorio ausente: ${rel}`)
    const to = path.join(outDir, rel)
    fs.mkdirSync(path.dirname(to), { recursive: true })
    if (rel === 'package-lock.json') {
      fs.writeFileSync(to, neutralizePackageLock(fs.readFileSync(from, 'utf8')))
    } else if (rel === 'tools/llm/run-llm.ts') {
      fs.writeFileSync(to, stripLeadingBlockComment(fs.readFileSync(from, 'utf8')))
    } else {
      fs.copyFileSync(from, to)
    }
    included.push(rel)
  }

  fs.writeFileSync(
    path.join(outDir, 'package.json'),
    neutralizePackageJson(fs.readFileSync(path.join(ORIGIN, 'package.json'), 'utf8')),
  )
  included.push('package.json')

  fs.writeFileSync(path.join(outDir, 'tsconfig.json'), minimalTsconfig())
  included.push('tsconfig.json')

  for (const d of EMPTY_DIRS) fs.mkdirSync(path.join(outDir, d), { recursive: true })

  const sandboxDigest = corpusDigest(outDir)
  if (sandboxDigest.aggregate !== originDigest.aggregate) {
    die('o corpus copiado difere do corpus de origem')
  }

  const violations = scanForLeaks(outDir, vocab)

  const excluded = fs
    .readdirSync(ORIGIN, { withFileTypes: true })
    .map((e) => e.name + (e.isDirectory() ? '/' : ''))
    .filter((n) => {
      const bare = n.replace(/\/$/, '')
      if (INCLUDE_TREES.includes(bare)) return false
      if (bare === 'package.json' || bare === 'package-lock.json') return false
      if (bare === 'tools' || bare === 'scripts') return false
      return true
    })
    .sort()

  const attestation = {
    schemaVersion: '1.0',
    mode: 'copy',
    generatedAt: new Date().toISOString(),
    origin: {
      path: ORIGIN,
      commit: git.head,
      branch: git.branch,
      remote: git.remote,
      workingTreeClean: git.head ? !git.dirty : null,
    },
    sandbox: {
      path: path.resolve(outDir),
      includedPaths: included.sort(),
      excludedTopLevel: excluded,
      emptyDirs: EMPTY_DIRS,
    },
    corpus: {
      fileCount: originDigest.fileCount,
      aggregateSha256: originDigest.aggregate,
      files: originDigest.perFile,
    },
    environment: { node: process.version, platform: process.platform },
    leakScan: {
      patterns: LEAK_PATTERNS.map((p) => p.name),
      vocabularyTermCount: vocab.length,
      vocabularyScanRoots: VOCAB_SCAN_ROOTS,
      violations,
    },
  }

  const attestPath =
    value('--attest') ??
    path.join(
      path.dirname(path.resolve(outDir)),
      `attestation-${path.basename(path.resolve(outDir))}.json`,
    )
  fs.writeFileSync(attestPath, JSON.stringify(attestation, null, 2) + '\n')

  console.log('\nAmbiente de medicao preparado')
  console.log(`  destino ........... ${path.resolve(outDir)}`)
  console.log(`  atestado .......... ${path.resolve(attestPath)}`)
  console.log(`  commit de origem .. ${git.head ?? 'SEM VERSIONAMENTO'}`)
  console.log(`  arvore limpa ...... ${git.head ? (git.dirty ? 'NAO' : 'sim') : 'nao aplicavel'}`)
  console.log(`  arquivos do corpus  ${originDigest.fileCount}`)
  console.log(`  hash agregado ..... ${originDigest.aggregate}`)
  console.log(`  arquivos incluidos  ${included.length}`)
  console.log(`  excluidos na raiz . ${excluded.join(' ') || 'nenhum'}`)

  if (!git.head) {
    console.log('\nAVISO: o clone de origem nao possui versionamento. O atestado')
    console.log('nao consegue amarrar esta medicao a um commit especifico.')
  }
  if (git.head && git.dirty) {
    console.log('\nAVISO: a arvore de origem tem alteracoes nao versionadas. O')
    console.log('corpus medido pode nao corresponder ao commit registrado.')
  }

  reportViolations(violations, 'detectado(s) no ambiente de medicao')

  console.log('\nProximos passos, dentro do diretorio de destino:')
  console.log('  npm ci')
  console.log('  npm run scan:semgrep && npm run scan:njsscan && npm run scan:eslint')
  console.log('  npm run scan:codeql')
  console.log('  npm run scan:llm')
  console.log('\nDepois, copie results/raw/ de volta para o repositorio e rode normalize e score.')
}

function pruneInPlace(): void {
  if (!flag('--confirm')) die('modo destrutivo exige --confirm')
  if (!fs.existsSync(path.join(ORIGIN, '.sandbox-ok'))) {
    die(
      'modo destrutivo exige o arquivo .sandbox-ok na raiz deste clone.\n' +
        'Crie-o manualmente apenas no clone descartavel, nunca no seu checkout de trabalho.',
    )
  }

  const git = gitInfo(ORIGIN)
  const digest = corpusDigest(ORIGIN)
  const vocab = loadVocab(ORIGIN)

  const keep = new Set<string>()
  for (const tree of INCLUDE_TREES) {
    for (const rel of walk(path.join(ORIGIN, tree))) keep.add(`${tree}/${rel}`)
  }
  for (const rel of INCLUDE_FILES) keep.add(rel)
  keep.add('package.json')

  const all = walk(ORIGIN).filter((r) => !r.startsWith('node_modules/') && !r.startsWith('.git/'))
  const removed: string[] = []
  for (const rel of all) {
    if (keep.has(rel)) continue
    fs.rmSync(path.join(ORIGIN, rel), { force: true })
    removed.push(rel)
  }

  fs.writeFileSync(
    path.join(ORIGIN, 'package.json'),
    neutralizePackageJson(fs.readFileSync(path.join(ORIGIN, 'package.json'), 'utf8')),
  )
  fs.writeFileSync(
    path.join(ORIGIN, 'package-lock.json'),
    neutralizePackageLock(fs.readFileSync(path.join(ORIGIN, 'package-lock.json'), 'utf8')),
  )
  fs.writeFileSync(
    path.join(ORIGIN, 'tools/llm/run-llm.ts'),
    stripLeadingBlockComment(fs.readFileSync(path.join(ORIGIN, 'tools/llm/run-llm.ts'), 'utf8')),
  )
  fs.writeFileSync(path.join(ORIGIN, 'tsconfig.json'), minimalTsconfig())

  fs.rmSync(path.join(ORIGIN, '.git'), { recursive: true, force: true })
  for (const d of EMPTY_DIRS) fs.mkdirSync(path.join(ORIGIN, d), { recursive: true })

  const prune = (dir: string): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name === 'node_modules') continue
      const p = path.join(dir, ent.name)
      prune(p)
      const isPreserved = EMPTY_DIRS.some((e) => p.endsWith(e.split('/').join(path.sep)))
      if (!isPreserved && fs.readdirSync(p).length === 0) fs.rmdirSync(p)
    }
  }
  prune(ORIGIN)

  const violations = scanForLeaks(ORIGIN, vocab)

  const attestation = {
    schemaVersion: '1.0',
    mode: 'in-place',
    generatedAt: new Date().toISOString(),
    origin: {
      commit: git.head,
      branch: git.branch,
      remote: git.remote,
      workingTreeClean: git.head ? !git.dirty : null,
    },
    corpus: {
      fileCount: digest.fileCount,
      aggregateSha256: digest.aggregate,
      files: digest.perFile,
    },
    removedCount: removed.length,
    environment: { node: process.version, platform: process.platform },
    leakScan: { violations },
  }

  const attestPath =
    value('--attest') ?? path.join(path.dirname(ORIGIN), `attestation-${path.basename(ORIGIN)}.json`)
  fs.writeFileSync(attestPath, JSON.stringify(attestation, null, 2) + '\n')

  console.log(`\nPoda concluida. ${removed.length} arquivo(s) removido(s). Versionamento removido.`)
  console.log(`  atestado .......... ${path.resolve(attestPath)}`)
  console.log(`  hash agregado ..... ${digest.aggregate}`)

  reportViolations(violations, 'remanescente(s)')
}

/* ------------------------------------------------------------------ */

if (flag('--verify-only')) {
  verifyOnly()
} else if (flag('--in-place')) {
  pruneInPlace()
} else {
  const out = value('--out')
  if (!out) {
    die(
      'informe --out <diretorio> para o modo padrao, ou --in-place --confirm para o modo destrutivo,\n' +
        'ou --verify-only para apenas conferir o hash do corpus.',
    )
  }
  buildSandbox(out)
}