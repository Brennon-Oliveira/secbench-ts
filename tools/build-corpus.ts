import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const CORPUS = path.join(ROOT, 'corpus')

type CatalogEntry = {
  id: string
  pairId: string
  condition: 'vulnerable' | 'safe'
  cwe: string
  owasp2025: string
  title: string
  entryPoint: string
  source: string
  sinkApi: string
  module: string
  fileHint: string
}

type CaseMeta = {
  id: string
  startSrc: number
  endSrc: number
  sinkSrc: number
  file: string
}

const MARKER_BEGIN = /@case-begin\s+(C-\d{2,4}-\d{2}-[VS])/
const MARKER_END = /@case-end\s+(C-\d{2,4}-\d{2}-[VS])/
const MARKER_SINK = /@sink\b/
const ANY_MARKER = /@(?:case-begin|case-end|sink)\b/

function loadVocab(): string[] {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tools/forbidden-vocab.json'), 'utf8'),
  ) as string[]
}

function loadCatalog(): CatalogEntry[] {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tools/case-catalog.json'), 'utf8'),
  ) as CatalogEntry[]
}

function walkTs(dir: string): string[] {
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walkTs(p))
    else if (ent.isFile() && ent.name.endsWith('.ts') && !ent.name.endsWith('.d.ts')) {
      out.push(p)
    }
  }
  return out.sort()
}

function findForbidden(text: string, vocab: string[]): string[] {
  const hits: string[] = []
  for (const w of vocab) {
    if (w === 'safe') {
      const re = /\bsafe\b/gi
      let m: RegExpExecArray | null
      while ((m = re.exec(text))) {
        const ctx = text.slice(Math.max(0, m.index - 12), m.index + 24)
        if (/yaml\.safe(Load|Dump)/i.test(ctx)) continue
        hits.push(w)
        break
      }
      continue
    }
    if (w.includes(' ')) {
      if (text.toLowerCase().includes(w)) hits.push(w)
    } else {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i')
      if (re.test(text)) hits.push(w)
    }
  }
  return [...new Set(hits)]
}

function stripForbiddenComments(line: string, vocab: string[]): string | null {
  const trimmed = line.trim()
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    const hits = findForbidden(line, vocab)
    if (hits.length) return null
  }
  return line
}

function processFile(
  srcPath: string,
  vocab: string[],
): { outLines: string[]; cases: CaseMeta[]; relCorpus: string } {
  const rel = path.relative(SRC, srcPath).split(path.sep).join('/')
  const relCorpus = 'corpus/' + rel
  const raw = fs.readFileSync(srcPath, 'utf8')
  const lines = raw.split(/\r?\n/)

  const cases: CaseMeta[] = []
  const stack: { id: string; startSrc: number; sinkSrc?: number }[] = []
  const removeIdx = new Set<number>()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    const begin = line.match(MARKER_BEGIN)
    const end = line.match(MARKER_END)
    if (begin) {
      stack.push({ id: begin[1]!, startSrc: i + 1 })
      removeIdx.add(i)
      continue
    }
    if (MARKER_SINK.test(line) && ANY_MARKER.test(line) && line.trim().startsWith('//')) {
      const top = stack[stack.length - 1]
      if (top) top.sinkSrc = i + 2 // next code line (1-based src); adjusted later if next is blank
      removeIdx.add(i)
      continue
    }
    if (end) {
      const top = stack.pop()
      if (!top || top.id !== end[1]) {
        throw new Error(`Mismatched @case-end in ${rel}: ${end[1]}`)
      }
      if (top.sinkSrc === undefined) {
        throw new Error(`Case ${top.id} in ${rel} missing @sink`)
      }
      // sink points to next non-marker line after @sink
      let sinkSrc = top.sinkSrc
      while (sinkSrc <= lines.length && removeIdx.has(sinkSrc - 1)) sinkSrc++
      // find first non-empty code line at/after sink marker's next line
      let sinkLine = top.sinkSrc
      while (sinkLine <= lines.length) {
        const L = lines[sinkLine - 1]!
        if (!removeIdx.has(sinkLine - 1) && L.trim() !== '' && !L.trim().startsWith('// @')) break
        sinkLine++
      }
      cases.push({
        id: top.id,
        startSrc: top.startSrc,
        endSrc: i + 1,
        sinkSrc: sinkLine,
        file: relCorpus,
      })
      removeIdx.add(i)
    }
  }

  if (stack.length) {
    throw new Error(`Unclosed @case-begin in ${rel}: ${stack.map((s) => s.id).join(', ')}`)
  }

  // Map source line -> corpus line after removals
  const srcToCorpus = new Map<number, number>()
  const outLines: string[] = []
  for (let i = 0; i < lines.length; i++) {
    if (removeIdx.has(i)) continue
    const kept = stripForbiddenComments(lines[i]!, vocab)
    if (kept === null) continue
    outLines.push(kept)
    srcToCorpus.set(i + 1, outLines.length)
  }

  for (const c of cases) {
    const startLine = srcToCorpus.get(c.startSrc + 1) // first content after begin
    // Better: start = first kept line with src > startSrc and src < endSrc
    let start = 0
    let end = 0
    let sink = 0
    for (let src = c.startSrc; src <= c.endSrc; src++) {
      const mapped = srcToCorpus.get(src)
      if (mapped !== undefined) {
        if (start === 0) start = mapped
        end = mapped
      }
    }
    sink = srcToCorpus.get(c.sinkSrc) ?? 0
    if (!start || !end || !sink) {
      throw new Error(`Failed to map lines for ${c.id} in ${rel}`)
    }
    ;(c as CaseMeta & { startLine: number; endLine: number; sinkLine: number }).startLine = start
    ;(c as CaseMeta & { startLine: number; endLine: number; sinkLine: number }).endLine = end
    ;(c as CaseMeta & { startLine: number; endLine: number; sinkLine: number }).sinkLine = sink
  }

  return { outLines, cases, relCorpus }
}

function rmrf(dir: string) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true })
}

function main() {
  const vocab = loadVocab()
  const catalog = loadCatalog()
  const catalogById = new Map(catalog.map((c) => [c.id, c]))

  const srcFiles = walkTs(SRC)
  rmrf(CORPUS)
  fs.mkdirSync(CORPUS, { recursive: true })

  const allCases: Array<
    CaseMeta & { startLine: number; endLine: number; sinkLine: number }
  > = []
  const seenIds = new Set<string>()

  for (const file of srcFiles) {
    const { outLines, cases, relCorpus } = processFile(file, vocab)
    const outPath = path.join(ROOT, relCorpus)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    const content = outLines.join('\n') + (outLines.length ? '\n' : '')
    fs.writeFileSync(outPath, content)

    const hits = findForbidden(content, vocab)
    if (hits.length) {
      throw new Error(`Forbidden vocabulary in ${relCorpus}: ${hits.join(', ')}`)
    }
    if (/eslint-disable|nosemgrep|@ts-ignore|@ts-nocheck/i.test(content)) {
      throw new Error(`Suppression directive in ${relCorpus}`)
    }

    for (const c of cases) {
      if (seenIds.has(c.id)) throw new Error(`Duplicate case id ${c.id}`)
      seenIds.add(c.id)
      allCases.push(c as CaseMeta & { startLine: number; endLine: number; sinkLine: number })
    }
  }

  // Pairing validation
  for (const id of seenIds) {
    const pairId = id.replace(/-[VS]$/, '')
    const v = pairId + '-V'
    const s = pairId + '-S'
    if (!seenIds.has(v) || !seenIds.has(s)) {
      throw new Error(`Incomplete pair for ${pairId}`)
    }
  }

  // Catalog coverage
  for (const entry of catalog) {
    if (!seenIds.has(entry.id)) {
      throw new Error(`Catalog case missing in code: ${entry.id}`)
    }
  }
  for (const id of seenIds) {
    if (!catalogById.has(id)) {
      throw new Error(`Code case missing from catalog: ${id}`)
    }
  }

  const casesOut = allCases
    .map((c) => {
      const meta = catalogById.get(c.id)!
      return {
        id: c.id,
        pairId: meta.pairId,
        condition: meta.condition,
        cwe: meta.cwe,
        owasp2025: meta.owasp2025,
        title: meta.title,
        file: c.file,
        startLine: c.startLine,
        endLine: c.endLine,
        sinkLine: c.sinkLine,
        entryPoint: meta.entryPoint,
        source: meta.source,
        sinkApi: meta.sinkApi,
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

  const vulnerable = casesOut.filter((c) => c.condition === 'vulnerable').length
  const safe = casesOut.filter((c) => c.condition === 'safe').length
  if (vulnerable !== 30 || safe !== 30) {
    throw new Error(`Expected 30/30 cases, got V=${vulnerable} S=${safe}`)
  }

  const groundTruth = {
    schemaVersion: '1.0',
    corpusRoot: 'corpus',
    totals: { vulnerable, safe },
    cases: casesOut,
  }

  fs.writeFileSync(
    path.join(ROOT, 'ground-truth.json'),
    JSON.stringify(groundTruth, null, 2) + '\n',
  )

  console.log(`build-corpus: wrote ${casesOut.length} cases (V=${vulnerable} S=${safe})`)
}

main()
