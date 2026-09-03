/**
 * Structural asymmetry report for V/S pairs (useful lines per case file).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

type CaseRow = {
  id: string
  pairId: string
  condition: 'vulnerable' | 'safe'
  file: string
}

type Gt = { cases: CaseRow[] }

function usefulLines(filePath: string): number {
  const text = fs.readFileSync(filePath, 'utf8')
  let n = 0
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim()
    if (!t) continue
    if (t.startsWith('//')) continue
    if (t.startsWith('/*') || t.startsWith('*') || t.startsWith('*/')) continue
    n++
  }
  return n
}

function median(nums: number[]): number {
  if (!nums.length) return 0
  const s = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!
}

function main() {
  const gt = JSON.parse(fs.readFileSync(path.join(ROOT, 'ground-truth.json'), 'utf8')) as Gt
  const byPair = new Map<string, { v?: CaseRow; s?: CaseRow }>()
  for (const c of gt.cases) {
    const slot = byPair.get(c.pairId) ?? {}
    if (c.condition === 'vulnerable') slot.v = c
    else slot.s = c
    byPair.set(c.pairId, slot)
  }

  type Row = {
    pairId: string
    vFile: string
    sFile: string
    vLines: number
    sLines: number
    ratio: number
    vSmaller: boolean
  }

  const rows: Row[] = []
  for (const [pairId, { v, s }] of [...byPair.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (!v || !s) {
      console.error(`Incomplete pair ${pairId}`)
      process.exitCode = 1
      continue
    }
    const vLines = usefulLines(path.join(ROOT, v.file))
    const sLines = usefulLines(path.join(ROOT, s.file))
    const ratio = Math.max(vLines, sLines) / Math.max(1, Math.min(vLines, sLines))
    rows.push({
      pairId,
      vFile: v.file,
      sFile: s.file,
      vLines,
      sLines,
      ratio,
      vSmaller: vLines < sLines,
    })
  }

  const vSmallerCount = rows.filter((r) => r.vSmaller).length
  const pct = rows.length ? (100 * vSmallerCount) / rows.length : 0
  const vMed = median(rows.map((r) => r.vLines))
  const sMed = median(rows.map((r) => r.sLines))
  const worst = [...rows].sort((a, b) => b.ratio - a.ratio)
  const over = rows.filter((r) => r.ratio > 1.5)

  console.log(`pairs: ${rows.length}`)
  console.log(`vulnerable smaller: ${vSmallerCount}/${rows.length} (${pct.toFixed(1)}%)`)
  console.log(`median useful lines V=${vMed} S=${sMed}`)
  console.log(`pairs with ratio > 1.5: ${over.length}`)
  console.log('most disproportionate:')
  for (const r of worst.slice(0, 12)) {
    console.log(
      `  ${r.pairId}  V=${r.vLines} S=${r.sLines}  ratio=${r.ratio.toFixed(2)}  ${path.basename(r.vFile)} vs ${path.basename(r.sFile)}`,
    )
  }

  const pctOk = pct >= 40 && pct <= 60
  const ratioOk = over.length === 0
  if (!pctOk || !ratioOk) {
    console.error(
      `\nFAIL: goal is V-smaller in 40–60% (now ${pct.toFixed(1)}%) and no ratio > 1.5 (now ${over.length} over)`,
    )
    process.exitCode = 1
  } else {
    console.log('\nPASS: asymmetry goal met')
  }
}

main()
