import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export type NormalizedFinding = {
  tool: string
  runId: string
  file: string
  line: number
  ruleId: string
  cwe: string | null
  severity: string
  message: string
  mappingSource: 'explicit' | 'ruleId' | 'label' | 'unmapped'
  /** Sessão de assistente de origem (`<slug>-run<N>`), quando aplicável. */
  session?: string
  /** Caminho exatamente como reportado no bruto, antes do prefixo do corpus. */
  rawFile?: string
  /** Prefixo acrescentado pela normalização (protocolo §9.1). */
  pathPrefixApplied?: string
  /** Achado obtido por leitura tolerante de resposta malformada (§5.4 da tarefa). */
  recovered?: boolean
}

export type AliasMap = Record<string, Record<string, string[]>>

/** Subdiretório de `results/raw/` com o recolhimento das sessões de assistente. */
export const ASSISTANTS_DIR = 'assistants'

export type UnmappedCounts = Record<string, number>

export function loadAliases(aliasesPath = path.join(ROOT, 'tools/cwe-aliases.json')): AliasMap {
  return JSON.parse(fs.readFileSync(aliasesPath, 'utf8'))
}

export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function firstCwe(value: unknown): string | null {
  if (value == null) return null
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = firstCwe(item)
      if (hit) return hit
    }
    return null
  }
  if (typeof value === 'number') return `CWE-${value}`
  if (typeof value !== 'string') return null
  const m = value.match(/CWE-?(\d+)/i)
  return m ? `CWE-${Number(m[1])}` : null
}

/**
 * Protocol §7.1 resolution order:
 * 1) CWE informed explicitly by the tool
 * 2) exact rule-id mapping
 * 3) normalized textual-label mapping
 * 4) unmapped
 */
export function resolveCwe(opts: {
  toolKey: string
  ruleId: string
  explicitCwe?: unknown
  label?: string | null
  aliases: AliasMap
}): { cwe: string | null; mappingSource: NormalizedFinding['mappingSource'] } {
  const explicit = firstCwe(opts.explicitCwe)
  if (explicit) return { cwe: explicit, mappingSource: 'explicit' }

  const table = opts.aliases[opts.toolKey] ?? {}
  const byRule = table[opts.ruleId]
  if (byRule && byRule.length) return { cwe: byRule[0]!, mappingSource: 'ruleId' }

  if (opts.label) {
    const key = normalizeLabel(opts.label)
    if (key) {
      const byLabel = table[key] ?? table[opts.label]
      if (byLabel && byLabel.length) return { cwe: byLabel[0]!, mappingSource: 'label' }
      for (const [aliasKey, cwes] of Object.entries(table)) {
        if (normalizeLabel(aliasKey) === key && cwes.length) {
          return { cwe: cwes[0]!, mappingSource: 'label' }
        }
      }
    }
  }

  return { cwe: null, mappingSource: 'unmapped' }
}

let corpusFileSetCache: Set<string> | null = null

/** Caminhos de arquivo do corpus, relativos à raiz do corpus. */
export function corpusFileSet(root = ROOT): Set<string> {
  if (corpusFileSetCache) return corpusFileSetCache
  const dir = path.join(root, 'corpus')
  const acc: string[] = []
  const walk = (d: string): void => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name)
      if (ent.isDirectory()) walk(p)
      else if (ent.isFile()) acc.push(path.relative(dir, p).split(path.sep).join('/'))
    }
  }
  if (fs.existsSync(dir)) walk(dir)
  corpusFileSetCache = new Set(acc)
  return corpusFileSetCache
}

/**
 * Normalização de separadores e de raiz relativa exigida pelo protocolo §4.1.
 *
 * As ferramentas em contêiner reportam o caminho a partir do ponto de montagem
 * do material analisado (`/work/...`, conforme `scanTarget` nos metadados de
 * execução), e o CodeQL reporta já relativo à raiz analisada. Aqui o caminho é
 * reduzido à forma relativa à raiz do corpus: retira-se um segmento `corpus/`
 * quando presente e, se o resultado não corresponder a arquivo do corpus,
 * descartam-se segmentos iniciais até que corresponda. Caminho que não
 * corresponda a arquivo algum do corpus é devolvido sem a barra inicial, e
 * seguirá sem casar com caso nenhum do gabarito.
 */
function relCorpus(file: string): string {
  const n = file.replace(/\\/g, '/').replace(/^\.\//, '')
  const idx = n.indexOf('corpus/')
  const base = idx >= 0 ? n.slice(idx + 'corpus/'.length) : n
  const known = corpusFileSet()
  if (known.has(base)) return base
  let rest = base
  while (rest.includes('/')) {
    rest = rest.slice(rest.indexOf('/') + 1)
    if (known.has(rest)) return rest
  }
  return base.replace(/^\/+/, '')
}

function pushFinding(
  findings: NormalizedFinding[],
  base: Omit<NormalizedFinding, 'cwe' | 'mappingSource'> & {
    explicitCwe?: unknown
    label?: string | null
    toolKey: string
  },
  aliases: AliasMap,
): void {
  const resolved = resolveCwe({
    toolKey: base.toolKey,
    ruleId: base.ruleId,
    explicitCwe: base.explicitCwe,
    label: base.label,
    aliases,
  })
  findings.push({
    tool: base.tool,
    runId: base.runId,
    file: base.file,
    line: base.line,
    ruleId: base.ruleId,
    cwe: resolved.cwe,
    severity: base.severity,
    message: base.message,
    mappingSource: resolved.mappingSource,
  })
}

export function normalizeSemgrep(raw: unknown, runId: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const results = (raw as { results?: unknown[] }).results ?? []
  for (const r of results) {
    const item = r as {
      path?: string
      start?: { line?: number }
      check_id?: string
      extra?: {
        severity?: string
        message?: string
        metadata?: { cwe?: unknown; category?: string }
      }
    }
    const ruleId = item.check_id ?? 'unknown'
    const meta = item.extra?.metadata
    pushFinding(
      findings,
      {
        tool: 'semgrep',
        toolKey: 'semgrep',
        runId,
        file: relCorpus(item.path ?? ''),
        line: item.start?.line ?? 0,
        ruleId,
        severity: item.extra?.severity ?? 'unknown',
        message: item.extra?.message ?? '',
        explicitCwe: meta?.cwe,
        label: meta?.category ?? item.extra?.message ?? null,
      },
      aliases,
    )
  }
  return findings
}

export function normalizeEslint(raw: unknown, runId: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const files = Array.isArray(raw) ? raw : []
  for (const f of files) {
    const file = f as { filePath?: string; messages?: unknown[] }
    for (const msg of file.messages ?? []) {
      const m = msg as { ruleId?: string | null; line?: number; severity?: number; message?: string }
      const ruleId = m.ruleId ?? 'unknown'
      pushFinding(
        findings,
        {
          tool: 'eslint',
          toolKey: 'eslint-plugin-security',
          runId,
          file: relCorpus(file.filePath ?? ''),
          line: m.line ?? 0,
          ruleId,
          severity: m.severity === 2 ? 'error' : 'warning',
          message: m.message ?? '',
          label: m.message ?? null,
        },
        aliases,
      )
    }
  }
  return findings
}

export function normalizeNjsscan(raw: unknown, runId: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const data = raw as {
    nodejs?: Record<
      string,
      {
        files?: Array<{ file_path?: string; match_lines?: number[] }>
        metadata?: { cwe?: string; description?: string }
      }
    >
  }
  for (const [ruleId, entry] of Object.entries(data.nodejs ?? {})) {
    for (const f of entry.files ?? []) {
      pushFinding(
        findings,
        {
          tool: 'njsscan',
          toolKey: 'njsscan',
          runId,
          file: relCorpus(f.file_path ?? ''),
          line: f.match_lines?.[0] ?? 0,
          ruleId,
          severity: 'warning',
          message: entry.metadata?.description ?? ruleId,
          explicitCwe: entry.metadata?.cwe,
          label: entry.metadata?.description ?? null,
        },
        aliases,
      )
    }
  }
  return findings
}

function collectSarifRuleCwes(run: unknown): Map<string, string[]> {
  const map = new Map<string, string[]>()
  const driver = (run as { tool?: { driver?: { rules?: unknown[] } } }).tool?.driver
  for (const rule of driver?.rules ?? []) {
    const r = rule as { id?: string; properties?: { tags?: string[]; cwe?: unknown } }
    if (!r.id) continue
    const fromTags = (r.properties?.tags ?? [])
      .map((t) => firstCwe(t))
      .filter((x): x is string => Boolean(x))
    const fromProp = firstCwe(r.properties?.cwe)
    const all = [...fromTags, ...(fromProp ? [fromProp] : [])]
    if (all.length) map.set(r.id, all)
  }
  return map
}

export function normalizeSarif(
  raw: unknown,
  runId: string,
  tool: string,
  aliases: AliasMap,
): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const runs = (raw as { runs?: unknown[] }).runs ?? []
  const toolKey = tool === 'codeql' ? 'codeql' : tool
  for (const run of runs) {
    const ruleCwes = collectSarifRuleCwes(run)
    const results = (run as { results?: unknown[] }).results ?? []
    for (const r of results) {
      const item = r as {
        ruleId?: string
        message?: { text?: string }
        locations?: Array<{
          physicalLocation?: {
            artifactLocation?: { uri?: string }
            region?: { startLine?: number }
          }
        }>
      }
      const loc = item.locations?.[0]?.physicalLocation
      const ruleId = item.ruleId ?? 'unknown'
      pushFinding(
        findings,
        {
          tool,
          toolKey,
          runId,
          file: relCorpus(loc?.artifactLocation?.uri ?? ''),
          line: loc?.region?.startLine ?? 0,
          ruleId,
          severity: 'warning',
          message: item.message?.text ?? '',
          explicitCwe: ruleCwes.get(ruleId) ?? null,
          label: item.message?.text ?? null,
        },
        aliases,
      )
    }
  }
  return findings
}

export function normalizeLlm(raw: unknown, runId: string): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const payload = raw as { findings?: unknown[]; malformed?: boolean }
  if (payload.malformed) {
    findings.push({
      tool: 'llm',
      runId,
      file: '',
      line: 0,
      ruleId: 'malformed-response',
      cwe: null,
      severity: 'info',
      message: 'malformed LLM response recorded',
      mappingSource: 'unmapped',
    })
    return findings
  }
  for (const f of payload.findings ?? []) {
    const item = f as {
      file?: string
      line?: number
      cwe?: string
      severity?: string
      message?: string
      ruleId?: string
    }
    const cwe = firstCwe(item.cwe)
    findings.push({
      tool: 'llm',
      runId,
      file: relCorpus(item.file ?? ''),
      line: item.line ?? 0,
      ruleId: item.ruleId ?? item.cwe ?? 'llm-finding',
      cwe,
      severity: item.severity ?? 'medium',
      message: item.message ?? '',
      mappingSource: cwe ? 'explicit' : 'unmapped',
    })
  }
  return findings
}

/* ------------------------------------------------------------------ *
 * Assistentes de codificação (protocolo §6 e §9.1)
 * ------------------------------------------------------------------ */

/** Prefixo do diretório do corpus no repositório (protocolo §9.1). */
export const CORPUS_PREFIX = 'corpus/'

export type SessionOutcome = 'concluido' | 'recusa' | 'interrompido' | string

export type AssistantSessionRecord = {
  session: string
  slug: string
  product: string
  run: number
  branch: string | null
  version: string | null
  model: string | null
  date: string | null
  durationDeclared: string | null
  outcome: SessionOutcome
  anomalies: string | null
  /** Falso apenas para desfecho de interrupção (§5.3 da tarefa). */
  inPrincipal: boolean
  filesExamined: number | null
  corpusFileCount: number
  declaredCoverage: number | null
  malformed: boolean
  parseError: string | null
  outputFilePresent: boolean
  findingsCount: number
  recoveredFindingsCount: number
  unmapped: number
  withoutLine: number
  pathPrefixApplied: string
  rawFiles: string[]
}

/** Contagem de arquivos do corpus, usada como denominador da cobertura declarada. */
export function corpusFileCount(root = ROOT): number {
  const dir = path.join(root, 'corpus')
  const walk = (d: string, acc: string[] = []): string[] => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name)
      if (ent.isDirectory()) walk(p, acc)
      else if (ent.isFile()) acc.push(p)
    }
    return acc
  }
  return fs.existsSync(dir) ? walk(dir).length : 0
}

/**
 * Leitura tolerante de resposta malformada (§5.4 da tarefa): remove marcação de
 * bloco, recorta do primeiro `{` ao último `}` e, em último recurso, extrai
 * objetos de achado por expressão regular. O registro de que a resposta veio
 * malformada nunca é apagado; o que esta função devolve vai para campo próprio.
 */
export function tolerantFindings(text: string): unknown[] {
  const stripped = text
    .replace(/^﻿/, '')
    .replace(/```(?:json)?/gi, '')
    .trim()
  const slice = stripped.slice(stripped.indexOf('{'), stripped.lastIndexOf('}') + 1)
  for (const candidate of [stripped, slice]) {
    if (!candidate) continue
    try {
      const parsed = JSON.parse(candidate) as { findings?: unknown[] }
      if (Array.isArray(parsed?.findings)) return parsed.findings
    } catch {
      /* segue para a próxima estratégia */
    }
  }
  const out: unknown[] = []
  const re = /\{[^{}]*"file"\s*:\s*"[^"]*"[^{}]*\}/g
  for (const m of stripped.match(re) ?? []) {
    try {
      out.push(JSON.parse(m))
    } catch {
      /* objeto irrecuperável: ignorado, mas a resposta segue registrada como malformada */
    }
  }
  return out
}

function assistantFinding(
  item: unknown,
  slug: string,
  runId: string,
  session: string,
  aliases: AliasMap,
  recovered: boolean,
): NormalizedFinding {
  const f = item as {
    file?: string
    line?: number | string
    cwe?: unknown
    severity?: string
    title?: string
    rationale?: string
  }
  const reported = String(f.file ?? '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
  // §9.1: o assistente recebeu o código na raiz do ambiente; o gabarito usa o
  // prefixo do diretório do corpus. O prefixo é acrescentado aqui, antes de
  // qualquer comparação, e registrado no achado.
  const prefixed = CORPUS_PREFIX + reported
  const resolved = resolveCwe({
    toolKey: slug,
    ruleId: 'assistant-finding',
    explicitCwe: f.cwe,
    label: f.title ?? null,
    aliases,
  })
  const lineNum = Number(f.line)
  return {
    tool: slug,
    runId,
    session,
    file: relCorpus(prefixed),
    rawFile: reported,
    pathPrefixApplied: CORPUS_PREFIX,
    line: Number.isFinite(lineNum) ? lineNum : 0,
    ruleId: 'assistant-finding',
    cwe: resolved.cwe,
    severity: f.severity ?? 'unknown',
    message: f.title ?? '',
    mappingSource: resolved.mappingSource,
    ...(recovered ? { recovered: true } : {}),
  }
}

export type AssistantNormalization = {
  sessions: AssistantSessionRecord[]
  findings: NormalizedFinding[]
  recoveredFindings: NormalizedFinding[]
}

/**
 * Normaliza o diretório de recolhimento das sessões (`results/raw/assistants/`).
 * Cada sessão é identificada por `<slug>-run<N>-execucao.json`; o relatório é
 * `<slug>-run<N>-auditoria.json` quando existe.
 */
export function normalizeAssistants(
  dir: string,
  aliases: AliasMap = loadAliases(),
  totalCorpusFiles = corpusFileCount(),
): AssistantNormalization {
  const sessions: AssistantSessionRecord[] = []
  const findings: NormalizedFinding[] = []
  const recoveredFindings: NormalizedFinding[] = []
  if (!fs.existsSync(dir)) return { sessions, findings, recoveredFindings }

  const names = fs.readdirSync(dir).sort()
  for (const name of names) {
    const m = name.match(/^(.+)-run(\d)-execucao\.json$/)
    if (!m) continue
    const slug = m[1]!
    const run = Number(m[2])
    const session = `${slug}-run${run}`
    const meta = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')) as {
      produto?: string
      versao?: string
      modelo?: string
      branch?: string
      rodada?: number
      data?: string
      duracaoAproximada?: string
      desfecho?: string
      saida?: string
      anormalidades?: string | null
    }
    const outcome = (meta.desfecho ?? 'desconhecido') as SessionOutcome
    const rawFiles = names.filter((n) => n.startsWith(`${session}-`))
    const auditPath = path.join(dir, `${session}-auditoria.json`)
    const hasAudit = fs.existsSync(auditPath)

    let filesExamined: number | null = null
    let malformed = false
    let parseError: string | null = null
    const sessionFindings: NormalizedFinding[] = []
    const sessionRecovered: NormalizedFinding[] = []

    if (outcome === 'recusa') {
      // §5.2 da tarefa: recusa entra na contagem com zero achados e zero
      // arquivos examinados. Não é descarte e não é ausência de dado.
      filesExamined = 0
    } else if (hasAudit) {
      const text = fs.readFileSync(auditPath, 'utf8')
      try {
        const parsed = JSON.parse(text) as { filesExamined?: number; findings?: unknown[] }
        filesExamined = typeof parsed.filesExamined === 'number' ? parsed.filesExamined : null
        for (const item of parsed.findings ?? []) {
          sessionFindings.push(assistantFinding(item, slug, `run${run}`, session, aliases, false))
        }
      } catch (err) {
        malformed = true
        parseError = err instanceof Error ? err.message : String(err)
        for (const item of tolerantFindings(text)) {
          sessionRecovered.push(assistantFinding(item, slug, `run${run}`, session, aliases, true))
        }
      }
    } else {
      malformed = true
      parseError = 'arquivo de saída ausente'
    }

    findings.push(...sessionFindings)
    recoveredFindings.push(...sessionRecovered)

    sessions.push({
      session,
      slug,
      product: meta.produto ?? slug,
      run,
      branch: meta.branch ?? null,
      version: meta.versao ?? null,
      model: meta.modelo ?? null,
      date: meta.data ?? null,
      durationDeclared: meta.duracaoAproximada ?? null,
      outcome,
      anomalies: meta.anormalidades ?? null,
      // §5.3 da tarefa: interrupção fica registrada, fora do cálculo principal.
      inPrincipal: outcome !== 'interrompido',
      filesExamined,
      corpusFileCount: totalCorpusFiles,
      declaredCoverage:
        filesExamined == null || totalCorpusFiles === 0 ? null : filesExamined / totalCorpusFiles,
      malformed,
      parseError,
      outputFilePresent: hasAudit,
      findingsCount: sessionFindings.length,
      recoveredFindingsCount: sessionRecovered.length,
      unmapped: sessionFindings.filter((f) => f.mappingSource === 'unmapped').length,
      withoutLine: sessionFindings.filter((f) => !f.line).length,
      pathPrefixApplied: CORPUS_PREFIX,
      rawFiles,
    })
  }

  sessions.sort((a, b) => (a.slug === b.slug ? a.run - b.run : a.slug.localeCompare(b.slug)))
  return { sessions, findings, recoveredFindings }
}

export function normalizeRawFile(
  tool: string,
  raw: unknown,
  runId: string,
  aliases: AliasMap,
): NormalizedFinding[] {
  if (tool === 'semgrep') return normalizeSemgrep(raw, runId, aliases)
  if (tool === 'eslint') return normalizeEslint(raw, runId, aliases)
  if (tool === 'njsscan') return normalizeNjsscan(raw, runId, aliases)
  if (tool === 'codeql') return normalizeSarif(raw, runId, 'codeql', aliases)
  if (tool === 'llm') return normalizeLlm(raw, runId)
  return normalizeSarif(raw, runId, tool, aliases)
}

export function countUnmappedByTool(findings: NormalizedFinding[]): UnmappedCounts {
  const counts: UnmappedCounts = {}
  for (const f of findings) {
    if (f.mappingSource !== 'unmapped') continue
    counts[f.tool] = (counts[f.tool] ?? 0) + 1
  }
  return counts
}

export function normalizeDirectory(
  rawRoot: string,
  aliases: AliasMap = loadAliases(),
): {
  findings: NormalizedFinding[]
  unmappedByTool: UnmappedCounts
  assistants: AssistantNormalization
} {
  const all: NormalizedFinding[] = []
  const empty: AssistantNormalization = { sessions: [], findings: [], recoveredFindings: [] }
  if (!fs.existsSync(rawRoot)) {
    return { findings: all, unmappedByTool: {}, assistants: empty }
  }
  const assistantsDir = path.join(rawRoot, ASSISTANTS_DIR)
  const assistants = fs.existsSync(assistantsDir)
    ? normalizeAssistants(assistantsDir, aliases)
    : empty
  for (const tool of fs.readdirSync(rawRoot)) {
    if (tool === ASSISTANTS_DIR) continue
    const toolDir = path.join(rawRoot, tool)
    if (!fs.statSync(toolDir).isDirectory()) continue
    for (const name of fs.readdirSync(toolDir)) {
      if (!name.endsWith('.json') && !name.endsWith('.sarif')) continue
      if (name.endsWith('.meta.json')) continue
      const full = path.join(toolDir, name)
      const raw = JSON.parse(fs.readFileSync(full, 'utf8'))
      const runId = name.replace(/\.(json|sarif)$/, '')
      all.push(...normalizeRawFile(tool, raw, runId, aliases))
    }
  }
  all.push(...assistants.findings)
  return { findings: all, unmappedByTool: countUnmappedByTool(all), assistants }
}

function main() {
  const aliases = loadAliases()
  const rawRoot = path.join(ROOT, 'results/raw')
  const outRoot = path.join(ROOT, 'results/normalized')
  fs.mkdirSync(outRoot, { recursive: true })

  if (!fs.existsSync(rawRoot)) {
    console.log('normalize: no raw results')
    return
  }

  const { findings: all, unmappedByTool, assistants } = normalizeDirectory(rawRoot, aliases)

  for (const tool of fs.readdirSync(rawRoot)) {
    if (tool === ASSISTANTS_DIR) continue
    const toolDir = path.join(rawRoot, tool)
    if (!fs.statSync(toolDir).isDirectory()) continue
    for (const name of fs.readdirSync(toolDir)) {
      if (!name.endsWith('.json') && !name.endsWith('.sarif')) continue
      if (name.endsWith('.meta.json')) continue
      const full = path.join(toolDir, name)
      const raw = JSON.parse(fs.readFileSync(full, 'utf8'))
      const runId = name.replace(/\.(json|sarif)$/, '')
      const findings = normalizeRawFile(tool, raw, runId, aliases)
      fs.writeFileSync(
        path.join(outRoot, `${tool}-${runId}.json`),
        JSON.stringify(findings, null, 2) + '\n',
      )
    }
  }

  for (const s of assistants.sessions) {
    fs.writeFileSync(
      path.join(outRoot, `assistant-${s.session}.json`),
      JSON.stringify(
        {
          session: s,
          findings: assistants.findings.filter((f) => f.session === s.session),
          recoveredFindings: assistants.recoveredFindings.filter((f) => f.session === s.session),
        },
        null,
        2,
      ) + '\n',
    )
  }
  if (assistants.sessions.length) {
    fs.writeFileSync(
      path.join(outRoot, 'assistant-sessions.json'),
      JSON.stringify(
        {
          schemaVersion: '1.0',
          pathPrefixApplied: CORPUS_PREFIX,
          corpusFileCount: corpusFileCount(),
          sessions: assistants.sessions,
          malformedResponses: assistants.sessions.filter((s) => s.malformed).length,
          refusals: assistants.sessions.filter((s) => s.outcome === 'recusa').length,
          interruptions: assistants.sessions.filter((s) => s.outcome === 'interrompido').length,
          recoveredFindings: assistants.recoveredFindings,
        },
        null,
        2,
      ) + '\n',
    )
  }

  fs.writeFileSync(path.join(outRoot, 'all.json'), JSON.stringify(all, null, 2) + '\n')
  fs.writeFileSync(
    path.join(outRoot, 'unmapped-by-tool.json'),
    JSON.stringify(unmappedByTool, null, 2) + '\n',
  )
  console.log(`normalize: ${all.length} findings`)
  console.log(`normalize: unmapped by tool: ${JSON.stringify(unmappedByTool)}`)
  for (const s of assistants.sessions) {
    console.log(
      `normalize: ${s.session} desfecho=${s.outcome} achados=${s.findingsCount} ` +
        `arquivosExaminados=${s.filesExamined ?? 'n/d'}/${s.corpusFileCount} ` +
        `malformado=${s.malformed ? 'sim' : 'nao'} principal=${s.inPrincipal ? 'sim' : 'nao'}`,
    )
  }
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirect) main()
