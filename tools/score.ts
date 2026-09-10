/**
 * Pontuação (protocolo §4, §6.7, §6.8, §7.3 e §8).
 *
 * Entrada: `results/normalized/all.json` (quatro ferramentas determinísticas e
 * três assistentes) e `results/normalized/assistant-sessions.json`.
 * Saída: `results/reports/summary.json`, `results/reports/summary.md` e
 * `results/reports/classifications.json` (base da conferência manual §10).
 *
 * Nenhum parâmetro da regra de correspondência é ajustável aqui: a janela de
 * linhas é ±5 e os conjuntos de equivalência vêm de `tools/cwe-aliases.json`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NormalizedFinding } from './normalize.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Janela de tolerância de linha fixada no protocolo §4.1. */
const LINE_WINDOW = 5

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

type Aliases = { cweEquivalence: Record<string, string[]> }

type SessionRecord = {
  session: string
  slug: string
  product: string
  run: number
  outcome: string
  inPrincipal: boolean
  filesExamined: number | null
  corpusFileCount: number
  declaredCoverage: number | null
  malformed: boolean
  findingsCount: number
  recoveredFindingsCount: number
  version: string | null
  model: string | null
  branch: string | null
}

type Category =
  | 'verdadeiro-positivo'
  | 'falso-positivo-par'
  | 'fora-de-escopo'
  | 'redundante'
  | 'sem-localizacao'
  | 'nao-mapeado'
  | 'falso-negativo'

type Classification = {
  instrument: string
  variant: string
  category: Category
  file: string
  line: number
  cwe: string | null
  ruleId: string
  runId: string
  caseId: string | null
  caseCwe: string | null
  caseSinkLine: number | null
  caseRange: [number, number] | null
  message: string
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T
}

function corpusRel(file: string): string {
  return file.replace(/\\/g, '/').replace(/^corpus\//, '')
}

function equivalenceSet(caseCwe: string, equiv: Record<string, string[]>): Set<string> {
  return new Set((equiv[caseCwe] ?? [caseCwe]).map((c) => c.toUpperCase()))
}

function cweMatch(findingCwe: string | null, caseCwe: string, equiv: Record<string, string[]>): boolean {
  if (!findingCwe) return false
  return equivalenceSet(caseCwe, equiv).has(findingCwe.toUpperCase())
}

/** Identidade de achado usada na união, na maioria e na estabilidade (§6.7/§6.8). */
export function findingKey(f: NormalizedFinding): string {
  return `${corpusRel(f.file)}|${f.line}|${(f.cwe ?? 'sem-cwe').toUpperCase()}`
}

export type InstrumentScore = {
  instrument: string
  variant: 'principal' | 'execucao' | 'maioria'
  kind: 'ferramenta' | 'assistente'
  findings: number
  truePositives: number
  falsePositivesPair: number
  falseNegatives: number
  outOfScope: number
  redundant: number
  withoutLocation: number
  unmapped: number
  precision: number
  recall: number
  f1: number
  tpRate: number
  fpRate: number
  tpMinusFpRate: number
  detectedCases: string[]
  byCwe: Record<string, { vulnerableCases: number; detected: number; coverage: number; falsePositives: number }>
  /** Contagem alternativa reportada, não aplicada: §4.2 lido como intervalo estrito. */
  falsePositivesStrictInterval: number
}

type ScoreInput = {
  instrument: string
  variant: InstrumentScore['variant']
  kind: InstrumentScore['kind']
  findings: NormalizedFinding[]
}

function scoreInstrument(
  input: ScoreInput,
  gt: GroundCase[],
  equiv: Record<string, string[]>,
  classifications: Classification[],
): InstrumentScore {
  const vulnerable = gt.filter((c) => c.condition === 'vulnerable')
  const safe = gt.filter((c) => c.condition === 'safe')

  let tp = 0
  let fp = 0
  let fpStrict = 0
  let outOfScope = 0
  let redundant = 0
  let withoutLocation = 0
  let unmapped = 0
  const hitVuln = new Set<string>()
  const byCwe: InstrumentScore['byCwe'] = {}
  for (const c of vulnerable) {
    byCwe[c.cwe] ??= { vulnerableCases: 0, detected: 0, coverage: 0, falsePositives: 0 }
    byCwe[c.cwe]!.vulnerableCases++
  }

  const push = (category: Category, f: NormalizedFinding, c: GroundCase | null) => {
    classifications.push({
      instrument: input.instrument,
      variant: input.variant,
      category,
      file: corpusRel(f.file),
      line: f.line,
      cwe: f.cwe,
      ruleId: f.ruleId,
      runId: f.runId,
      caseId: c?.id ?? null,
      caseCwe: c?.cwe ?? null,
      caseSinkLine: c?.sinkLine ?? null,
      caseRange: c ? [c.startLine, c.endLine] : null,
      message: f.message,
    })
  }

  for (const f of input.findings) {
    const file = corpusRel(f.file)

    // §4.5 — achado sem linha: categoria própria, não pode gerar verdadeiro positivo.
    if (!f.line || f.line <= 0) {
      withoutLocation++
      push('sem-localizacao', f, null)
      continue
    }
    // §4.6 — sem CWE após a ordem de resolução §7.1: não mapeado.
    if (!f.cwe) {
      unmapped++
      push('nao-mapeado', f, null)
      continue
    }

    const vulnHit = vulnerable.find(
      (c) =>
        corpusRel(c.file) === file &&
        Math.abs(f.line - c.sinkLine) <= LINE_WINDOW &&
        cweMatch(f.cwe, c.cwe, equiv),
    )
    if (vulnHit) {
      if (hitVuln.has(vulnHit.id)) {
        // §4.1 — um verdadeiro positivo por caso e por instrumento; excedente é redundante.
        redundant++
        push('redundante', f, vulnHit)
      } else {
        hitVuln.add(vulnHit.id)
        tp++
        byCwe[vulnHit.cwe]!.detected++
        push('verdadeiro-positivo', f, vulnHit)
      }
      continue
    }

    const safeHit = safe.find(
      (c) =>
        corpusRel(c.file) === file &&
        f.line >= c.startLine - LINE_WINDOW &&
        f.line <= c.endLine + LINE_WINDOW &&
        cweMatch(f.cwe, c.cwe, equiv),
    )
    if (safeHit) {
      fp++
      byCwe[safeHit.cwe] ??= { vulnerableCases: 0, detected: 0, coverage: 0, falsePositives: 0 }
      byCwe[safeHit.cwe]!.falsePositives++
      if (f.line >= safeHit.startLine && f.line <= safeHit.endLine) fpStrict++
      push('falso-positivo-par', f, safeHit)
      continue
    }

    // §4.3 — fora de escopo: não entra no cálculo da precisão principal.
    outOfScope++
    push('fora-de-escopo', f, null)
  }

  const fn = vulnerable.length - hitVuln.size
  // §4.4 — cada caso vulnerável sem verdadeiro positivo é registrado como falso
  // negativo, para que a conferência manual (§10) também possa amostrá-los.
  for (const c of vulnerable) {
    if (hitVuln.has(c.id)) continue
    classifications.push({
      instrument: input.instrument,
      variant: input.variant,
      category: 'falso-negativo',
      file: corpusRel(c.file),
      line: c.sinkLine,
      cwe: null,
      ruleId: '—',
      runId: '—',
      caseId: c.id,
      caseCwe: c.cwe,
      caseSinkLine: c.sinkLine,
      caseRange: [c.startLine, c.endLine],
      message: 'nenhum achado satisfez a condição de verdadeiro positivo para o caso',
    })
  }
  for (const [cwe, agg] of Object.entries(byCwe)) {
    agg.coverage = agg.vulnerableCases === 0 ? 0 : agg.detected / agg.vulnerableCases
  }

  const precision = tp + fp === 0 ? 0 : tp / (tp + fp)
  const recall = vulnerable.length === 0 ? 0 : tp / vulnerable.length
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)
  const tpRate = vulnerable.length ? tp / vulnerable.length : 0
  const fpRate = safe.length ? fp / safe.length : 0

  return {
    instrument: input.instrument,
    variant: input.variant,
    kind: input.kind,
    findings: input.findings.length,
    truePositives: tp,
    falsePositivesPair: fp,
    falseNegatives: fn,
    outOfScope,
    redundant,
    withoutLocation,
    unmapped,
    precision,
    recall,
    f1,
    tpRate,
    fpRate,
    tpMinusFpRate: tpRate - fpRate,
    detectedCases: [...hitVuln].sort(),
    byCwe,
    falsePositivesStrictInterval: fpStrict,
  }
}

function dedupeByKey(findings: NormalizedFinding[]): NormalizedFinding[] {
  const seen = new Map<string, NormalizedFinding>()
  for (const f of findings) if (!seen.has(findingKey(f))) seen.set(findingKey(f), f)
  return [...seen.values()]
}

function jaccard(a: Set<string>, b: Set<string>): number {
  const inter = [...a].filter((x) => b.has(x)).length
  const union = new Set([...a, ...b]).size
  return union === 0 ? 0 : inter / union
}

function pct(x: number): string {
  return (x * 100).toFixed(1) + '%'
}

function main(): void {
  const gtFile = loadJson<{ cases: GroundCase[]; totals: { vulnerable: number; safe: number } }>(
    path.join(ROOT, 'ground-truth.json'),
  )
  const gt = gtFile.cases
  const equiv = loadJson<Aliases>(path.join(ROOT, 'tools/cwe-aliases.json')).cweEquivalence
  const all = loadJson<NormalizedFinding[]>(path.join(ROOT, 'results/normalized/all.json'))
  const sessionsPath = path.join(ROOT, 'results/normalized/assistant-sessions.json')
  const sessionsFile = fs.existsSync(sessionsPath)
    ? loadJson<{ sessions: SessionRecord[]; corpusFileCount: number }>(sessionsPath)
    : { sessions: [], corpusFileCount: 0 }
  const sessions = sessionsFile.sessions

  const SAST = ['semgrep', 'eslint', 'njsscan', 'codeql']
  const assistantSlugs = [...new Set(sessions.map((s) => s.slug))].sort()

  const classifications: Classification[] = []
  const scores: InstrumentScore[] = []

  const byInstrument = new Map<string, NormalizedFinding[]>()
  for (const f of all) {
    if (f.ruleId === 'malformed-response') continue
    const list = byInstrument.get(f.tool) ?? []
    list.push(f)
    byInstrument.set(f.tool, list)
  }

  for (const tool of SAST) {
    scores.push(
      scoreInstrument(
        { instrument: tool, variant: 'principal', kind: 'ferramenta', findings: byInstrument.get(tool) ?? [] },
        gt,
        equiv,
        classifications,
      ),
    )
  }

  // Assistentes: principal sobre a união das execuções que entram no cálculo
  // (§6.7); adicionalmente por execução e sob maioria.
  const assistantStability: Record<
    string,
    {
      distinctFindings: number
      inAllRuns: number
      stability: number
      runsConsidered: number
      byCwe: Record<string, { distinct: number; inAllRuns: number; stability: number }>
    }
  > = {}

  for (const slug of assistantSlugs) {
    const slugSessions = sessions.filter((s) => s.slug === slug)
    const principalSessions = slugSessions.filter((s) => s.inPrincipal)
    const findingsOf = (session: string) => (byInstrument.get(slug) ?? []).filter((f) => f.session === session)

    const unionFindings = dedupeByKey(principalSessions.flatMap((s) => findingsOf(s.session)))
    scores.push(
      scoreInstrument(
        { instrument: slug, variant: 'principal', kind: 'assistente', findings: unionFindings },
        gt,
        equiv,
        classifications,
      ),
    )

    for (const s of slugSessions) {
      scores.push(
        scoreInstrument(
          { instrument: `${slug} run${s.run}`, variant: 'execucao', kind: 'assistente', findings: findingsOf(s.session) },
          gt,
          equiv,
          classifications,
        ),
      )
    }

    // Maioria: presente em ao menos duas das execuções consideradas.
    const counts = new Map<string, { n: number; f: NormalizedFinding }>()
    for (const s of principalSessions) {
      const keys = new Set(findingsOf(s.session).map(findingKey))
      for (const f of dedupeByKey(findingsOf(s.session))) {
        const k = findingKey(f)
        if (!keys.has(k)) continue
        const cur = counts.get(k)
        counts.set(k, { n: (cur?.n ?? 0) + 1, f: cur?.f ?? f })
      }
    }
    const majority = [...counts.values()].filter((v) => v.n >= 2).map((v) => v.f)
    scores.push(
      scoreInstrument(
        { instrument: slug, variant: 'maioria', kind: 'assistente', findings: majority },
        gt,
        equiv,
        classifications,
      ),
    )

    // §6.8 — estabilidade: achados presentes em todas as execuções sobre o total distinto.
    const runsConsidered = principalSessions.length
    const distinct = [...counts.values()]
    const inAll = distinct.filter((v) => v.n === runsConsidered)
    const byCweStab: Record<string, { distinct: number; inAllRuns: number; stability: number }> = {}
    for (const v of distinct) {
      const key = (v.f.cwe ?? 'sem-cwe').toUpperCase()
      byCweStab[key] ??= { distinct: 0, inAllRuns: 0, stability: 0 }
      byCweStab[key]!.distinct++
      if (v.n === runsConsidered) byCweStab[key]!.inAllRuns++
    }
    for (const agg of Object.values(byCweStab)) {
      agg.stability = agg.distinct === 0 ? 0 : agg.inAllRuns / agg.distinct
    }
    assistantStability[slug] = {
      distinctFindings: distinct.length,
      inAllRuns: inAll.length,
      stability: distinct.length === 0 ? 0 : inAll.length / distinct.length,
      runsConsidered,
      byCwe: byCweStab,
    }
  }

  // Sobreposição e contribuição exclusiva sobre os instrumentos principais.
  const principal = scores.filter((s) => s.variant === 'principal')
  const detected = new Map<string, Set<string>>()
  for (const s of principal) detected.set(s.instrument, new Set(s.detectedCases))

  const jaccardPairs: Record<string, number> = {}
  const names = [...detected.keys()]
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      jaccardPairs[`${names[i]}|${names[j]}`] = jaccard(detected.get(names[i]!)!, detected.get(names[j]!)!)
    }
  }

  const exclusive: Record<string, { count: number; cases: string[] }> = {}
  for (const name of names) {
    const mine = detected.get(name)!
    const others = new Set<string>()
    for (const other of names) if (other !== name) for (const c of detected.get(other)!) others.add(c)
    const only = [...mine].filter((c) => !others.has(c)).sort()
    exclusive[name] = { count: only.length, cases: only }
  }

  const vulnerableCount = gt.filter((c) => c.condition === 'vulnerable').length
  const unionOf = (keys: string[]): Set<string> => {
    const acc = new Set<string>()
    for (const k of keys) for (const c of detected.get(k) ?? []) acc.add(c)
    return acc
  }
  const sastUnion = unionOf(SAST)
  const assistantUnion = unionOf(assistantSlugs)
  const globalUnion = unionOf(names)

  const totalCorpusFiles = sessionsFile.corpusFileCount || 0
  const declaredCoverage = sessions.map((s) => ({
    session: s.session,
    product: s.product,
    run: s.run,
    outcome: s.outcome,
    filesExamined: s.filesExamined,
    corpusFileCount: s.corpusFileCount || totalCorpusFiles,
    ratio: s.declaredCoverage,
    inPrincipal: s.inPrincipal,
  }))

  const summary = {
    schemaVersion: '2.0',
    generatedAt: new Date().toISOString(),
    generatedFrom: ['results/normalized/all.json', 'results/normalized/assistant-sessions.json'],
    rule: {
      lineWindow: LINE_WINDOW,
      source: 'docs/PROTOCOLO-MEDICAO.md §4 e §7.3',
      findingIdentity: 'file|line|cwe',
      note:
        '§4.2 é aplicado com a mesma janela de ±5 linhas em torno do intervalo do caso protegido, ' +
        'como na implementação versionada antes da coleta; a contagem sob leitura estrita do ' +
        'intervalo é reportada em falsePositivesStrictInterval, sem ser aplicada.',
    },
    corpus: { vulnerableCases: vulnerableCount, safeCases: gt.length - vulnerableCount, files: totalCorpusFiles },
    instruments: scores,
    stability: assistantStability,
    jaccard: jaccardPairs,
    exclusiveContribution: exclusive,
    unions: {
      deterministicTools: {
        instruments: SAST,
        cases: [...sastUnion].sort(),
        coverage: sastUnion.size / vulnerableCount,
      },
      assistants: {
        instruments: assistantSlugs,
        cases: [...assistantUnion].sort(),
        coverage: assistantUnion.size / vulnerableCount,
      },
      overall: { instruments: names, cases: [...globalUnion].sort(), coverage: globalUnion.size / vulnerableCount },
    },
    sessions: sessions.map((s) => ({
      session: s.session,
      product: s.product,
      version: s.version,
      model: s.model,
      branch: s.branch,
      run: s.run,
      outcome: s.outcome,
      malformed: s.malformed,
      recoveredFindings: s.recoveredFindingsCount,
      inPrincipal: s.inPrincipal,
    })),
    declaredCoverage,
    counts: {
      refusals: sessions.filter((s) => s.outcome === 'recusa').length,
      interruptions: sessions.filter((s) => !s.inPrincipal).length,
      malformedResponses: sessions.filter((s) => s.malformed).length,
    },
  }

  const reportsDir = path.join(ROOT, 'results/reports')
  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(path.join(reportsDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')
  fs.writeFileSync(
    path.join(reportsDir, 'classifications.json'),
    JSON.stringify({ schemaVersion: '1.0', total: classifications.length, classifications }, null, 2) + '\n',
  )

  /* --------------------------- relatório legível --------------------------- */
  const md: string[] = []
  const row = (s: InstrumentScore) =>
    `| ${s.instrument} | ${s.variant} | ${s.findings} | ${s.truePositives} | ${s.falsePositivesPair} | ${s.falseNegatives} | ` +
    `${s.outOfScope} | ${s.redundant} | ${s.withoutLocation} | ${s.unmapped} | ${s.precision.toFixed(3)} | ` +
    `${s.recall.toFixed(3)} | ${s.f1.toFixed(3)} | ${s.tpMinusFpRate.toFixed(3)} |`

  md.push('# SecBench-TS — pontuação', '')
  md.push(`Gerado em ${summary.generatedAt} a partir de ${summary.generatedFrom.join(' e ')}.`, '')
  md.push(
    `Casos vulneráveis: ${vulnerableCount}. Casos protegidos: ${gt.length - vulnerableCount}. ` +
      `Janela de linhas: ±${LINE_WINDOW}. Identidade de achado: \`file|line|cwe\`.`,
    '',
  )
  md.push('## Resultado principal por instrumento', '')
  md.push(
    '| Instrumento | Variante | Achados | VP | FP par | FN | Fora de escopo | Redundantes | Sem localização | Não mapeados | Precisão | Revocação | F1 | VP−FP |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  )
  for (const s of principal) md.push(row(s))

  md.push('', '## Assistentes: por execução, união e maioria', '')
  md.push(
    '| Instrumento | Variante | Achados | VP | FP par | FN | Fora de escopo | Redundantes | Sem localização | Não mapeados | Precisão | Revocação | F1 | VP−FP |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  )
  for (const s of scores.filter((x) => x.kind === 'assistente')) md.push(row(s))

  md.push('', '## Estabilidade dos assistentes (§6.8)', '')
  md.push('| Assistente | Achados distintos | Presentes nas três execuções | Estabilidade |', '| --- | ---: | ---: | ---: |')
  for (const [slug, st] of Object.entries(assistantStability)) {
    md.push(`| ${slug} | ${st.distinctFindings} | ${st.inAllRuns} | ${pct(st.stability)} |`)
  }
  md.push('', '### Estabilidade por categoria CWE', '')
  md.push('| Assistente | CWE | Distintos | Nas três | Estabilidade |', '| --- | --- | ---: | ---: | ---: |')
  for (const [slug, st] of Object.entries(assistantStability)) {
    for (const [cwe, agg] of Object.entries(st.byCwe).sort()) {
      md.push(`| ${slug} | ${cwe} | ${agg.distinct} | ${agg.inAllRuns} | ${pct(agg.stability)} |`)
    }
  }

  md.push('', '## Cobertura declarada de arquivos (§5.5 da tarefa — reportada, não aplicada)', '')
  md.push('| Sessão | Produto | Desfecho | Arquivos examinados | Total do corpus | Proporção |', '| --- | --- | --- | ---: | ---: | ---: |')
  for (const c of declaredCoverage) {
    md.push(
      `| ${c.session} | ${c.product} | ${c.outcome} | ${c.filesExamined ?? 'n/d'} | ${c.corpusFileCount} | ${
        c.ratio == null ? 'n/d' : pct(c.ratio)
      } |`,
    )
  }

  md.push('', '## Cobertura por categoria CWE (casos vulneráveis detectados)', '')
  const cweList = [...new Set(gt.filter((c) => c.condition === 'vulnerable').map((c) => c.cwe))].sort(
    (a, b) => Number(a.replace('CWE-', '')) - Number(b.replace('CWE-', '')),
  )
  md.push(
    `| CWE | Casos | ${principal.map((s) => s.instrument).join(' | ')} |`,
    `| --- | ---: | ${principal.map(() => '---:').join(' | ')} |`,
  )
  for (const cwe of cweList) {
    const total = gt.filter((c) => c.condition === 'vulnerable' && c.cwe === cwe).length
    const cells = principal.map((s) => {
      const agg = s.byCwe[cwe]
      return `${agg?.detected ?? 0}/${total}`
    })
    md.push(`| ${cwe} | ${total} | ${cells.join(' | ')} |`)
  }

  md.push('', '## Sobreposição (índice de Jaccard sobre casos vulneráveis detectados)', '')
  md.push('| Par | Jaccard |', '| --- | ---: |')
  for (const [k, v] of Object.entries(jaccardPairs)) md.push(`| ${k.replace('|', ' × ')} | ${v.toFixed(3)} |`)

  md.push('', '## Contribuição exclusiva', '')
  md.push('| Instrumento | Casos exclusivos | Identificadores |', '| --- | ---: | --- |')
  for (const [name, ex] of Object.entries(exclusive)) {
    md.push(`| ${name} | ${ex.count} | ${ex.cases.join(', ') || '—'} |`)
  }

  md.push('', '## Cobertura das uniões', '')
  md.push('| União | Casos detectados | Cobertura |', '| --- | ---: | ---: |')
  md.push(`| Quatro ferramentas determinísticas | ${sastUnion.size}/${vulnerableCount} | ${pct(sastUnion.size / vulnerableCount)} |`)
  md.push(`| Três assistentes | ${assistantUnion.size}/${vulnerableCount} | ${pct(assistantUnion.size / vulnerableCount)} |`)
  md.push(`| União geral | ${globalUnion.size}/${vulnerableCount} | ${pct(globalUnion.size / vulnerableCount)} |`)

  md.push('', '## Contagens de sessão', '')
  md.push(
    `- Recusas: ${summary.counts.refusals}`,
    `- Interrupções (fora do cálculo principal): ${summary.counts.interruptions}`,
    `- Respostas malformadas: ${summary.counts.malformedResponses}`,
  )

  md.push('', '## Distribuição de achados por identificador de regra', '')
  md.push('| Instrumento | Identificador | Achados | CWE resolvido |', '| --- | --- | ---: | --- |')
  for (const s of principal) {
    const findings = s.kind === 'ferramenta' ? byInstrument.get(s.instrument) ?? [] : []
    const agg = new Map<string, { n: number; cwes: Set<string> }>()
    for (const f of findings) {
      const cur = agg.get(f.ruleId) ?? { n: 0, cwes: new Set<string>() }
      cur.n++
      cur.cwes.add(f.cwe ?? 'não mapeado')
      agg.set(f.ruleId, cur)
    }
    for (const [ruleId, v] of [...agg.entries()].sort((a, b) => b[1].n - a[1].n)) {
      md.push(`| ${s.instrument} | ${ruleId} | ${v.n} | ${[...v.cwes].join(', ')} |`)
    }
  }

  md.push('', '## Metadados de execução das ferramentas determinísticas', '')
  md.push('| Ferramenta | Versão | Imagem | Duração (s) | Código de saída | Data |', '| --- | --- | --- | ---: | ---: | --- |')
  const rawRoot = path.join(ROOT, 'results/raw')
  for (const tool of SAST) {
    const dir = path.join(rawRoot, tool)
    if (!fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.meta.json'))) {
      const m = loadJson<{ version?: string; image?: string; durationSec?: number; exitCode?: number; date?: string }>(
        path.join(dir, name),
      )
      md.push(`| ${tool} | ${m.version ?? '—'} | ${m.image ?? '—'} | ${m.durationSec ?? '—'} | ${m.exitCode ?? '—'} | ${m.date ?? '—'} |`)
    }
  }

  md.push('', '## Observação de implementação', '', summary.rule.note, '')
  md.push('| Instrumento | FP par (janela ±5) | FP par (intervalo estrito) |', '| --- | ---: | ---: |')
  for (const s of principal) md.push(`| ${s.instrument} | ${s.falsePositivesPair} | ${s.falsePositivesStrictInterval} |`)

  fs.writeFileSync(path.join(reportsDir, 'summary.md'), md.join('\n') + '\n')
  console.log(
    `score: ${classifications.length} classificações; ` +
      `${principal.length} instrumentos principais; relatórios em results/reports/`,
  )
}

main()
