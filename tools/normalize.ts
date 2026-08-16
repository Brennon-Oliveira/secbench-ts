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
}

type AliasMap = Record<string, Record<string, string[]>>

function loadAliases(): AliasMap {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/cwe-aliases.json'), 'utf8'))
}

function mapCwe(tool: string, ruleId: string, aliases: AliasMap): string | null {
  const table = aliases[tool] ?? {}
  const hits = table[ruleId]
  if (hits && hits.length) return hits[0]!
  const m = ruleId.match(/CWE-?(\d+)/i)
  if (m) return `CWE-${m[1]}`
  return null
}

function relCorpus(file: string): string {
  const n = file.replace(/\\/g, '/')
  const idx = n.indexOf('corpus/')
  if (idx >= 0) return n.slice(idx + 'corpus/'.length)
  if (n.startsWith('corpus/')) return n.slice('corpus/'.length)
  return n
}

function normalizeSemgrep(raw: unknown, runId: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const results = (raw as { results?: unknown[] }).results ?? []
  for (const r of results) {
    const item = r as {
      path?: string
      start?: { line?: number }
      check_id?: string
      extra?: { severity?: string; message?: string }
    }
    const ruleId = item.check_id ?? 'unknown'
    findings.push({
      tool: 'semgrep',
      runId,
      file: relCorpus(item.path ?? ''),
      line: item.start?.line ?? 0,
      ruleId,
      cwe: mapCwe('semgrep', ruleId, aliases),
      severity: item.extra?.severity ?? 'unknown',
      message: item.extra?.message ?? '',
    })
  }
  return findings
}

function normalizeEslint(raw: unknown, runId: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const files = Array.isArray(raw) ? raw : []
  for (const f of files) {
    const file = f as { filePath?: string; messages?: unknown[] }
    for (const msg of file.messages ?? []) {
      const m = msg as { ruleId?: string | null; line?: number; severity?: number; message?: string }
      const ruleId = m.ruleId ?? 'unknown'
      findings.push({
        tool: 'eslint',
        runId,
        file: relCorpus(file.filePath ?? ''),
        line: m.line ?? 0,
        ruleId,
        cwe: mapCwe('eslint-plugin-security', ruleId, aliases),
        severity: m.severity === 2 ? 'error' : 'warning',
        message: m.message ?? '',
      })
    }
  }
  return findings
}

function normalizeNjsscan(raw: unknown, runId: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const data = raw as { nodejs?: Record<string, { files?: Array<{ file_path?: string; match_lines?: number[] }>; metadata?: { cwe?: string; description?: string } }> }
  for (const [ruleId, entry] of Object.entries(data.nodejs ?? {})) {
    for (const f of entry.files ?? []) {
      findings.push({
        tool: 'njsscan',
        runId,
        file: relCorpus(f.file_path ?? ''),
        line: f.match_lines?.[0] ?? 0,
        ruleId,
        cwe: entry.metadata?.cwe?.match(/CWE-\d+/)?.[0] ?? mapCwe('njsscan', ruleId, aliases),
        severity: 'warning',
        message: entry.metadata?.description ?? ruleId,
      })
    }
  }
  return findings
}

function normalizeSarif(raw: unknown, runId: string, tool: string, aliases: AliasMap): NormalizedFinding[] {
  const findings: NormalizedFinding[] = []
  const runs = (raw as { runs?: unknown[] }).runs ?? []
  for (const run of runs) {
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
      findings.push({
        tool,
        runId,
        file: relCorpus(loc?.artifactLocation?.uri ?? ''),
        line: loc?.region?.startLine ?? 0,
        ruleId,
        cwe: mapCwe(tool === 'codeql' ? 'codeql' : tool, ruleId, aliases),
        severity: 'warning',
        message: item.message?.text ?? '',
      })
    }
  }
  return findings
}

function normalizeLlm(raw: unknown, runId: string): NormalizedFinding[] {
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
    })
    return findings
  }
  for (const f of payload.findings ?? []) {
    const item = f as { file?: string; line?: number; cwe?: string; severity?: string; message?: string; ruleId?: string }
    findings.push({
      tool: 'llm',
      runId,
      file: relCorpus(item.file ?? ''),
      line: item.line ?? 0,
      ruleId: item.ruleId ?? item.cwe ?? 'llm-finding',
      cwe: item.cwe ?? null,
      severity: item.severity ?? 'medium',
      message: item.message ?? '',
    })
  }
  return findings
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

  const all: NormalizedFinding[] = []
  for (const tool of fs.readdirSync(rawRoot)) {
    const toolDir = path.join(rawRoot, tool)
    if (!fs.statSync(toolDir).isDirectory()) continue
    for (const name of fs.readdirSync(toolDir)) {
      if (!name.endsWith('.json') && !name.endsWith('.sarif')) continue
      if (name.endsWith('.meta.json')) continue
      const full = path.join(toolDir, name)
      const raw = JSON.parse(fs.readFileSync(full, 'utf8'))
      const runId = name.replace(/\.(json|sarif)$/, '')
      let findings: NormalizedFinding[] = []
      if (tool === 'semgrep') findings = normalizeSemgrep(raw, runId, aliases)
      else if (tool === 'eslint') findings = normalizeEslint(raw, runId, aliases)
      else if (tool === 'njsscan') findings = normalizeNjsscan(raw, runId, aliases)
      else if (tool === 'codeql') findings = normalizeSarif(raw, runId, 'codeql', aliases)
      else if (tool === 'llm') findings = normalizeLlm(raw, runId)
      else findings = normalizeSarif(raw, runId, tool, aliases)
      all.push(...findings)
      fs.writeFileSync(
        path.join(outRoot, `${tool}-${runId}.json`),
        JSON.stringify(findings, null, 2) + '\n',
      )
    }
  }

  fs.writeFileSync(path.join(outRoot, 'all.json'), JSON.stringify(all, null, 2) + '\n')
  console.log(`normalize: ${all.length} findings`)
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirect) main()
