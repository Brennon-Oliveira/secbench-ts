import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  countUnmappedByTool,
  loadAliases,
  normalizeDirectory,
  normalizeRawFile,
  resolveCwe,
  type AliasMap,
} from '../tools/normalize.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ARCHIVE = path.join(ROOT, 'results/dry-run/archive-20260822')
const LIVE = path.join(ROOT, 'results/dry-run')

function pickDryRunRoot(): string {
  for (const root of [LIVE, ARCHIVE]) {
    if (fs.existsSync(path.join(root, 'semgrep'))) return root
  }
  throw new Error('no dry-run outputs found under results/dry-run/')
}

function readToolRaw(root: string, tool: string): { raw: unknown; runId: string } {
  const dir = path.join(root, tool)
  const name = fs
    .readdirSync(dir)
    .find((n) => (n.endsWith('.json') || n.endsWith('.sarif')) && !n.endsWith('.meta.json'))
  if (!name) throw new Error(`no raw file for ${tool} in ${dir}`)
  return {
    raw: JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')),
    runId: name.replace(/\.(json|sarif)$/, ''),
  }
}

describe('normalize CWE resolution order (protocol §7.1) on dry-run outputs', () => {
  const dryRoot = pickDryRunRoot()
  const aliases = loadAliases()

  it('prefers explicit tool CWE over rule-id aliases (semgrep)', () => {
    const { raw, runId } = readToolRaw(dryRoot, 'semgrep')
    // Force a wrong alias for a rule that carries metadata CWE, then assert explicit wins.
    const poisoned: AliasMap = {
      ...aliases,
      semgrep: {
        ...(aliases.semgrep ?? {}),
        'rules.javascript.browser.security.eval-detected': ['CWE-999'],
      },
    }
    const findings = normalizeRawFile('semgrep', raw, runId, poisoned)
    const evalHit = findings.find((f) => f.ruleId.includes('eval-detected'))
    expect(evalHit).toBeTruthy()
    expect(evalHit!.mappingSource).toBe('explicit')
    expect(evalHit!.cwe).toBe('CWE-95')
  })

  it('falls back to exact rule-id mapping when no explicit CWE (eslint)', () => {
    const { raw, runId } = readToolRaw(dryRoot, 'eslint')
    const findings = normalizeRawFile('eslint', raw, runId, aliases)
    const child = findings.find((f) => f.ruleId === 'security/detect-child-process')
    expect(child).toBeTruthy()
    expect(child!.mappingSource).toBe('ruleId')
    expect(child!.cwe).toBe('CWE-78')
  })

  it('falls back to normalized textual label after rule-id miss', () => {
    const table: AliasMap = {
      'eslint-plugin-security': {
        'sql injection via query concat': ['CWE-89'],
      },
    }
    const resolved = resolveCwe({
      toolKey: 'eslint-plugin-security',
      ruleId: 'not-a-real-rule',
      label: 'SQL Injection via Query Concat!!!',
      aliases: table,
    })
    expect(resolved.mappingSource).toBe('label')
    expect(resolved.cwe).toBe('CWE-89')
  })

  it('marks as unmapped when explicit, rule-id and label all miss', () => {
    const resolved = resolveCwe({
      toolKey: 'semgrep',
      ruleId: 'totally.unknown.rule',
      label: 'no such label anywhere',
      aliases,
    })
    expect(resolved.mappingSource).toBe('unmapped')
    expect(resolved.cwe).toBeNull()
  })

  it('counts unmapped findings per tool on dry-run outputs', () => {
    const root = pickDryRunRoot()
    // Empty alias tables force rule-id/label miss; tools that emit explicit CWE stay mapped.
    const emptyAliases: AliasMap = {
      semgrep: {},
      'eslint-plugin-security': {},
      njsscan: {},
      codeql: {},
    }
    const { findings, unmappedByTool } = normalizeDirectory(root, emptyAliases)
    expect(findings.length).toBeGreaterThan(0)
    // ESLint has no explicit CWE in raw output → all security findings become unmapped.
    expect(unmappedByTool.eslint ?? 0).toBeGreaterThan(0)
    // Recount independently and match the reported map.
    expect(countUnmappedByTool(findings)).toEqual(unmappedByTool)
    for (const [tool, n] of Object.entries(unmappedByTool)) {
      const expected = findings.filter((f) => f.tool === tool && f.mappingSource === 'unmapped').length
      expect(n).toBe(expected)
    }
  })

  it('njsscan uses explicit metadata CWE before aliases', () => {
    const { raw, runId } = readToolRaw(dryRoot, 'njsscan')
    const poisoned: AliasMap = {
      ...aliases,
      njsscan: {
        node_password: ['CWE-999'],
      },
    }
    const findings = normalizeRawFile('njsscan', raw, runId, poisoned)
    const pwd = findings.find((f) => f.ruleId === 'node_password')
    expect(pwd).toBeTruthy()
    expect(pwd!.mappingSource).toBe('explicit')
    expect(pwd!.cwe).toBe('CWE-798')
  })
})
