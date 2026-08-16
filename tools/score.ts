import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NormalizedFinding } from './normalize.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

type GroundCase = {
  id: string
  pairId: string
  condition: 'vulnerable' | 'safe'
  cwe: string
  file: string
  startLine: number
  endLine: number
  sinkLine: number
}

type Aliases = {
  cweEquivalence: Record<string, string[]>
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T
}

function corpusRel(file: string): string {
  return file.replace(/^corpus\//, '').replace(/\\/g, '/')
}

function cweMatch(findingCwe: string | null, caseCwe: string, equiv: Record<string, string[]>): boolean {
  if (!findingCwe) return false
  const set = new Set((equiv[caseCwe] ?? [caseCwe]).map((c) => c.toUpperCase()))
  return set.has(findingCwe.toUpperCase())
}

function main() {
  const gt = loadJson<{ cases: GroundCase[] }>(path.join(ROOT, 'ground-truth.json'))
  const aliases = loadJson<Aliases>(path.join(ROOT, 'tools/cwe-aliases.json'))
  const normalizedPath = path.join(ROOT, 'results/normalized/all.json')
  const findings: NormalizedFinding[] = fs.existsSync(normalizedPath)
    ? loadJson(normalizedPath)
    : []

  const byTool = new Map<string, NormalizedFinding[]>()
  for (const f of findings) {
    if (f.ruleId === 'malformed-response') continue
    const list = byTool.get(f.tool) ?? []
    list.push(f)
    byTool.set(f.tool, list)
  }

  const vulnerable = gt.cases.filter((c) => c.condition === 'vulnerable')
  const safe = gt.cases.filter((c) => c.condition === 'safe')

  type ToolScore = {
    tool: string
    truePositives: number
    falsePositives: number
    falseNegatives: number
    precision: number
    recall: number
    f1: number
    tpMinusFpRate: number
    outOfScope: number
    malformed: number
    byCwe: Record<string, { tp: number; fp: number; fn: number }>
  }

  const toolScores: ToolScore[] = []
  const detectedPairs = new Map<string, Set<string>>()

  for (const [tool, toolFindings] of byTool) {
    let tp = 0
    let fp = 0
    let fn = 0
    let outOfScope = 0
    const byCwe: ToolScore['byCwe'] = {}
    const hitVuln = new Set<string>()

    for (const f of toolFindings) {
      const file = corpusRel(f.file)
      let matched = false
      for (const c of vulnerable) {
        if (corpusRel(c.file) !== file) continue
        if (Math.abs(f.line - c.sinkLine) > 5) continue
        if (!cweMatch(f.cwe, c.cwe, aliases.cweEquivalence)) continue
        tp++
        hitVuln.add(c.id)
        matched = true
        byCwe[c.cwe] ??= { tp: 0, fp: 0, fn: 0 }
        byCwe[c.cwe]!.tp++
        const set = detectedPairs.get(tool) ?? new Set()
        set.add(c.id)
        detectedPairs.set(tool, set)
        break
      }
      if (matched) continue

      for (const c of safe) {
        if (corpusRel(c.file) !== file) continue
        if (f.line < c.startLine - 5 || f.line > c.endLine + 5) continue
        if (!cweMatch(f.cwe, c.cwe, aliases.cweEquivalence)) continue
        fp++
        matched = true
        byCwe[c.cwe] ??= { tp: 0, fp: 0, fn: 0 }
        byCwe[c.cwe]!.fp++
        break
      }
      if (!matched) outOfScope++
    }

    for (const c of vulnerable) {
      if (!hitVuln.has(c.id)) {
        fn++
        byCwe[c.cwe] ??= { tp: 0, fp: 0, fn: 0 }
        byCwe[c.cwe]!.fn++
      }
    }

    const precision = tp + fp === 0 ? 0 : tp / (tp + fp)
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn)
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
    const tpRate = vulnerable.length ? tp / vulnerable.length : 0
    const fpRate = safe.length ? fp / safe.length : 0

    const malformed = findings.filter((f) => f.tool === tool && f.ruleId === 'malformed-response').length

    toolScores.push({
      tool,
      truePositives: tp,
      falsePositives: fp,
      falseNegatives: fn,
      precision,
      recall,
      f1,
      tpMinusFpRate: tpRate - fpRate,
      outOfScope,
      malformed,
      byCwe,
    })
  }

  // Jaccard overlap between tools
  const tools = [...detectedPairs.keys()]
  const jaccard: Record<string, number> = {}
  for (let i = 0; i < tools.length; i++) {
    for (let j = i + 1; j < tools.length; j++) {
      const a = detectedPairs.get(tools[i]!)!
      const b = detectedPairs.get(tools[j]!)!
      const inter = [...a].filter((x) => b.has(x)).length
      const union = new Set([...a, ...b]).size
      jaccard[`${tools[i]}|${tools[j]}`] = union === 0 ? 0 : inter / union
    }
  }

  const llmRuns = findings.filter((f) => f.tool === 'llm')
  const llmAgreement =
    llmRuns.length === 0
      ? null
      : {
          note: 'Agreement across runId 1/2/3 is computed when three LLM runs exist per file',
          runs: [...new Set(llmRuns.map((f) => f.runId))].length,
        }

  const summary = {
    schemaVersion: '1.0',
    generatedFrom: 'results/normalized/all.json',
    tools: toolScores,
    jaccard,
    llmAgreement,
  }

  const reportsDir = path.join(ROOT, 'results/reports')
  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(path.join(reportsDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')

  const md: string[] = [
    '# SecBench-TS — summary',
    '',
    '| Tool | TP | FP | FN | Precision | Recall | F1 | TP-FP rate | Out of scope |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ]
  for (const t of toolScores) {
    md.push(
      `| ${t.tool} | ${t.truePositives} | ${t.falsePositives} | ${t.falseNegatives} | ${t.precision.toFixed(3)} | ${t.recall.toFixed(3)} | ${t.f1.toFixed(3)} | ${t.tpMinusFpRate.toFixed(3)} | ${t.outOfScope} |`,
    )
  }
  md.push('', '## Jaccard overlap', '')
  for (const [k, v] of Object.entries(jaccard)) {
    md.push(`- ${k}: ${v.toFixed(3)}`)
  }
  fs.writeFileSync(path.join(reportsDir, 'summary.md'), md.join('\n') + '\n')
  console.log('score: wrote results/reports/summary.json and summary.md')
}

main()
