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
}

export type AliasMap = Record<string, Record<string, string[]>>

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

function relCorpus(file: string): string {
  const n = file.replace(/\\/g, '/')
  const idx = n.indexOf('corpus/')
  if (idx >= 0) return n.slice(idx + 'corpus/'.length)
  if (n.startsWith('corpus/')) return n.slice('corpus/'.length)
  return n
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
): { findings: NormalizedFinding[]; unmappedByTool: UnmappedCounts } {
  const all: NormalizedFinding[] = []
  if (!fs.existsSync(rawRoot)) {
    return { findings: all, unmappedByTool: {} }
  }
  for (const tool of fs.readdirSync(rawRoot)) {
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
  return { findings: all, unmappedByTool: countUnmappedByTool(all) }
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

  const { findings: all, unmappedByTool } = normalizeDirectory(rawRoot, aliases)

  for (const tool of fs.readdirSync(rawRoot)) {
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

  fs.writeFileSync(path.join(outRoot, 'all.json'), JSON.stringify(all, null, 2) + '\n')
  fs.writeFileSync(
    path.join(outRoot, 'unmapped-by-tool.json'),
    JSON.stringify(unmappedByTool, null, 2) + '\n',
  )
  console.log(`normalize: ${all.length} findings`)
  console.log(`normalize: unmapped by tool: ${JSON.stringify(unmappedByTool)}`)
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirect) main()
