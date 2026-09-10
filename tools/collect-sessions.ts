/**
 * Recolhimento das sessões de assistente (tarefa 13, seções 3 e 4).
 *
 * Para cada branch de medição:
 *   - confere que a diferença entre o commit original (registrado na preparação)
 *     e o commit atual consiste exclusivamente em arquivos ACRESCENTADOS da lista
 *     permitida (protocolo de recolhimento, seção 3);
 *   - recalcula o resumo criptográfico agregado do código no commit original e
 *     compara com o atestado de preparação (`results/raw/attestation.json`);
 *   - extrai os arquivos de relatório, byte a byte, para `results/raw/assistants/`,
 *     nomeados por produto e execução;
 *   - grava um manifesto com commits de origem e de relatório e o sha256 de cada
 *     arquivo recolhido.
 *
 * Nenhum conteúdo recolhido é alterado. Ajuste de caminho e de formato pertence
 * à normalização.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'results/raw/assistants')
const ATTESTATION = path.join(ROOT, 'results/raw/attestation.json')

/** Mapeamento registrado em docs/metodologia.md (2026-09-03). */
export type SessionMap = {
  branch: string
  product: string
  slug: string
  run: 1 | 2 | 3
  originCommit: string
}

export const SESSIONS: SessionMap[] = [
  { branch: 'snapshot/01', product: 'Claude Code (Opus)', slug: 'claude-code', run: 1, originCommit: '166ddeac0ae8eb052689ce1b35bfe348c4b503ca' },
  { branch: 'snapshot/04', product: 'Claude Code (Opus)', slug: 'claude-code', run: 2, originCommit: '35268265a1d48c1d2ca1b536c55aab0bd2bc392c' },
  { branch: 'snapshot/07', product: 'Claude Code (Opus)', slug: 'claude-code', run: 3, originCommit: 'e973ec8571766f375524e4488ba8d4cfcc03d4d0' },
  { branch: 'snapshot/02', product: 'Cursor (Grok)', slug: 'cursor', run: 1, originCommit: '18c9167343b4e23800b34af3c16ee5b551fd557c' },
  { branch: 'snapshot/05', product: 'Cursor (Grok)', slug: 'cursor', run: 2, originCommit: 'a4d63c009c5a723360c3c9510ffd592b54909f53' },
  { branch: 'snapshot/08', product: 'Cursor (Grok)', slug: 'cursor', run: 3, originCommit: '3ceb0503103190ecb13e8496dd877f849c49579f' },
  { branch: 'snapshot/03', product: 'Google Antigravity', slug: 'antigravity', run: 1, originCommit: '01b39ea202986ea3fff3eccd803c00a37585d4c3' },
  { branch: 'snapshot/06', product: 'Google Antigravity', slug: 'antigravity', run: 2, originCommit: '035da70a79dd757da8289c845ddf9c4b4cecfad1' },
  { branch: 'snapshot/09', product: 'Google Antigravity', slug: 'antigravity', run: 3, originCommit: '58e2738d19c559539b2a178f6cfe49bdf4313c34' },
]

const ALLOWED_ADDITIONS = ['auditoria.json', 'execucao.json', 'resposta-bruta.txt', 'transcricao.txt']

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 })
}

function gitBuffer(args: string[]): Buffer {
  return execFileSync('git', args, { cwd: ROOT, maxBuffer: 1 << 28 })
}

function sha256(buf: Buffer | string): string {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

type Attestation = {
  corpus: { fileCount: number; aggregateSha256: string; files: Record<string, string> }
}

/**
 * Resumo agregado do código de uma branch de medição, calculado sobre os mesmos
 * arquivos do atestado (sem o prefixo `corpus/`, que não existe no ambiente
 * entregue ao assistente) e na mesma ordem determinística.
 */
export function codeDigestAtCommit(commit: string, fileList: string[]): { aggregate: string; perFileDiffs: string[]; perFile: Record<string, string> } {
  const files = [...fileList].sort()
  const perFile: Record<string, string> = {}
  for (const f of files) perFile[f] = sha256(gitBuffer(['show', `${commit}:${f}`]))
  return {
    aggregate: sha256(files.map((f) => `${f}:${perFile[f]}`).join('\n')),
    perFileDiffs: [],
    perFile,
  }
}

type IntegrityResult = {
  branch: string
  product: string
  run: number
  originCommit: string
  reportCommit: string
  commitsAhead: number
  addedFiles: string[]
  unexpectedChanges: Array<{ status: string; file: string }>
  codeAggregateSha256: string
  codeAggregateMatchesAttestation: boolean
  codeFilesDiverging: string[]
  valid: boolean
}

type CollectedFile = {
  session: string
  role: string
  sourcePath: string
  collectedAs: string
  sha256: string
  bytes: number
}

function main(): void {
  const attestation: Attestation = JSON.parse(fs.readFileSync(ATTESTATION, 'utf8'))
  const attFiles = Object.keys(attestation.corpus.files)

  fs.mkdirSync(OUT_DIR, { recursive: true })

  const integrity: IntegrityResult[] = []
  const collected: CollectedFile[] = []

  for (const s of SESSIONS) {
    const ref = `refs/remotes/origin/${s.branch}`
    const reportCommit = git(['rev-parse', ref]).trim()
    const commitsAhead = Number(git(['rev-list', '--count', `${s.originCommit}..${reportCommit}`]).trim())

    const diff = git(['diff', '--name-status', s.originCommit, reportCommit])
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [status, ...rest] = line.split('\t')
        return { status: status!, file: rest.join('\t') }
      })

    const addedFiles = diff.filter((d) => d.status === 'A' && ALLOWED_ADDITIONS.includes(d.file)).map((d) => d.file)
    const unexpectedChanges = diff.filter((d) => !(d.status === 'A' && ALLOWED_ADDITIONS.includes(d.file)))

    const digest = codeDigestAtCommit(s.originCommit, attFiles)
    const diverging = attFiles.filter((f) => digest.perFile[f] !== attestation.corpus.files[f])

    const result: IntegrityResult = {
      branch: s.branch,
      product: s.product,
      run: s.run,
      originCommit: s.originCommit,
      reportCommit,
      commitsAhead,
      addedFiles,
      unexpectedChanges,
      codeAggregateSha256: digest.aggregate,
      codeAggregateMatchesAttestation: digest.aggregate === attestation.corpus.aggregateSha256,
      codeFilesDiverging: diverging,
      valid: unexpectedChanges.length === 0 && diverging.length === 0 && digest.aggregate === attestation.corpus.aggregateSha256,
    }
    integrity.push(result)

    for (const file of addedFiles) {
      const buf = gitBuffer(['show', `${reportCommit}:${file}`])
      const role = file.replace(/\.(json|txt)$/, '')
      const ext = path.extname(file)
      const target = `${s.slug}-run${s.run}-${role}${ext}`
      fs.writeFileSync(path.join(OUT_DIR, target), buf)
      collected.push({
        session: `${s.slug}-run${s.run}`,
        role,
        sourcePath: file,
        collectedAs: `results/raw/assistants/${target}`,
        sha256: sha256(buf),
        bytes: buf.length,
      })
    }
  }

  const manifest = {
    schemaVersion: '1.0',
    generatedAt: new Date().toISOString(),
    attestation: {
      path: 'results/raw/attestation.json',
      originCommit: JSON.parse(fs.readFileSync(ATTESTATION, 'utf8')).origin.commit,
      corpusAggregateSha256: attestation.corpus.aggregateSha256,
      corpusFileCount: attestation.corpus.fileCount,
    },
    repoCorpusAggregateSha256: (() => {
      const dir = path.join(ROOT, 'corpus')
      const walk = (d: string, base = d, acc: string[] = []): string[] => {
        for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, ent.name)
          if (ent.isDirectory()) walk(p, base, acc)
          else if (ent.isFile()) acc.push(path.relative(base, p).split(path.sep).join('/'))
        }
        return acc.sort()
      }
      const files = walk(dir)
      const per: Record<string, string> = {}
      for (const f of files) per[f] = sha256(fs.readFileSync(path.join(dir, f)))
      return sha256(files.map((f) => `${f}:${per[f]}`).join('\n'))
    })(),
    sessions: integrity,
    files: collected,
  }

  fs.writeFileSync(path.join(OUT_DIR, 'collection-manifest.json'), JSON.stringify(manifest, null, 2) + '\n')

  for (const r of integrity) {
    const flag = r.valid ? 'OK  ' : 'FALHA'
    console.log(
      `${flag} ${r.branch} ${r.product} run${r.run} origem=${r.originCommit.slice(0, 7)} relatorio=${r.reportCommit.slice(0, 7)} ` +
        `acrescentados=[${r.addedFiles.join(', ')}] hash=${r.codeAggregateMatchesAttestation ? 'confere' : 'DIVERGE'}` +
        (r.unexpectedChanges.length ? ` alteracoes=${JSON.stringify(r.unexpectedChanges)}` : ''),
    )
  }
  console.log(`\ncollect: ${collected.length} arquivos recolhidos em results/raw/assistants/`)
  const invalid = integrity.filter((r) => !r.valid)
  if (invalid.length) {
    console.error(`\nATENCAO: ${invalid.length} sessao(oes) com verificacao de integridade reprovada. Reportar ao operador.`)
    process.exitCode = 2
  }
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirect) main()
