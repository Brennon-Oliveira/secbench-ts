/**
 * Amostra de conferência manual (protocolo §10) e cálculo da taxa de divergência.
 *
 * Seleção reproduzível: as classificações do resultado principal são estratificadas
 * por instrumento × categoria e, dentro de cada estrato, ordenadas pelo sha256 de
 * uma semente fixa concatenada ao identificador do item. Toma-se o teto de 20% de
 * cada estrato, com pelo menos um item por estrato, de modo que a amostra cobre
 * todos os instrumentos e todas as categorias de classificação.
 *
 * Saídas:
 *   results/reports/manual-sample.json  — amostra com a evidência de cada item
 *   results/reports/manual-sample.md    — folha de conferência legível
 *   results/reports/manual-check.json   — taxa de divergência (quando há veredictos)
 *
 * Os veredictos da conferência ficam em results/reports/manual-check-verdicts.json
 * e são a única entrada humana; a taxa é calculada aqui, não digitada.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SEED = 'secbench-ts/conferencia-manual/2026-09-10'
const SAMPLE_RATE = 0.2
const LINE_WINDOW = 5

type Classification = {
  instrument: string
  variant: string
  category: string
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

type GroundCase = {
  id: string
  condition: 'vulnerable' | 'safe'
  cwe: string
  file: string
  startLine: number
  endLine: number
  sinkLine: number
}

type NormalizedFinding = { tool: string; file: string; line: number; cwe: string | null; runId: string; message: string }

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, 'utf8')) as T
}

function corpusRel(f: string): string {
  return f.replace(/\\/g, '/').replace(/^corpus\//, '')
}

function sourceLines(file: string, from: number, to: number): string[] {
  const full = path.join(ROOT, 'corpus', corpusRel(file))
  if (!fs.existsSync(full)) return ['<arquivo inexistente no corpus>']
  const lines = fs.readFileSync(full, 'utf8').split('\n')
  const out: string[] = []
  for (let i = Math.max(1, from); i <= Math.min(lines.length, to); i++) {
    out.push(`${String(i).padStart(4)}| ${lines[i - 1]}`)
  }
  return out
}

function main(): void {
  const classifications = loadJson<{ classifications: Classification[] }>(
    path.join(ROOT, 'results/reports/classifications.json'),
  ).classifications.filter((c) => c.variant === 'principal')
  const gt = loadJson<{ cases: GroundCase[] }>(path.join(ROOT, 'ground-truth.json')).cases
  const equiv = loadJson<{ cweEquivalence: Record<string, string[]> }>(
    path.join(ROOT, 'tools/cwe-aliases.json'),
  ).cweEquivalence
  const all = loadJson<NormalizedFinding[]>(path.join(ROOT, 'results/normalized/all.json'))

  const withIds = classifications.map((c, i) => ({
    ...c,
    itemId: `${c.instrument}#${c.category}#${i}#${corpusRel(c.file)}:${c.line}:${c.cwe ?? 'sem-cwe'}`,
  }))

  const strata = new Map<string, typeof withIds>()
  for (const c of withIds) {
    const key = `${c.instrument} / ${c.category}`
    strata.set(key, [...(strata.get(key) ?? []), c])
  }

  const selected: Array<(typeof withIds)[number] & { stratum: string }> = []
  const strataReport: Array<{ stratum: string; population: number; sampled: number }> = []
  for (const [key, items] of [...strata.entries()].sort()) {
    const ordered = [...items].sort((a, b) => {
      const ha = crypto.createHash('sha256').update(SEED + a.itemId).digest('hex')
      const hb = crypto.createHash('sha256').update(SEED + b.itemId).digest('hex')
      return ha < hb ? -1 : ha > hb ? 1 : 0
    })
    const n = Math.max(1, Math.ceil(items.length * SAMPLE_RATE))
    for (const it of ordered.slice(0, n)) selected.push({ ...it, stratum: key })
    strataReport.push({ stratum: key, population: items.length, sampled: n })
  }

  const items = selected.map((c) => {
    const casesInFile = gt
      .filter((g) => corpusRel(g.file) === corpusRel(c.file))
      .map((g) => ({
        id: g.id,
        condition: g.condition,
        cwe: g.cwe,
        range: [g.startLine, g.endLine] as [number, number],
        sinkLine: g.sinkLine,
        equivalence: equiv[g.cwe] ?? [g.cwe],
        lineInTpWindow: Math.abs(c.line - g.sinkLine) <= LINE_WINDOW,
        lineInSafeWindow: c.line >= g.startLine - LINE_WINDOW && c.line <= g.endLine + LINE_WINDOW,
        cweInEquivalence: c.cwe ? (equiv[g.cwe] ?? [g.cwe]).map((x) => x.toUpperCase()).includes(c.cwe.toUpperCase()) : false,
      }))
    const instrumentFindingsInFile =
      c.category === 'falso-negativo'
        ? all
            .filter((f) => f.tool === c.instrument && corpusRel(f.file) === corpusRel(c.file))
            .map((f) => ({ line: f.line, cwe: f.cwe, runId: f.runId, message: f.message.slice(0, 90) }))
        : undefined
    return {
      itemId: c.itemId,
      stratum: c.stratum,
      instrument: c.instrument,
      assignedCategory: c.category,
      finding: { file: corpusRel(c.file), line: c.line, cwe: c.cwe, ruleId: c.ruleId, runId: c.runId, message: c.message.slice(0, 160) },
      assignedCase: c.caseId
        ? { id: c.caseId, cwe: c.caseCwe, sinkLine: c.caseSinkLine, range: c.caseRange, equivalence: c.caseCwe ? equiv[c.caseCwe] ?? [c.caseCwe] : [] }
        : null,
      casesInFile,
      instrumentFindingsInFile,
      source: c.line > 0 ? sourceLines(c.file, c.line - 2, c.line + 2) : [],
    }
  })

  const reportsDir = path.join(ROOT, 'results/reports')
  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(
    path.join(reportsDir, 'manual-sample.json'),
    JSON.stringify(
      {
        schemaVersion: '1.0',
        seed: SEED,
        sampleRate: SAMPLE_RATE,
        population: classifications.length,
        sampled: items.length,
        fraction: items.length / classifications.length,
        strata: strataReport,
        items,
      },
      null,
      2,
    ) + '\n',
  )

  const md: string[] = [
    '# Conferência manual — amostra',
    '',
    `Semente: \`${SEED}\`. População (classificações do resultado principal): ${classifications.length}. ` +
      `Amostrados: ${items.length} (${((items.length / classifications.length) * 100).toFixed(1)}%).`,
    '',
    '| Estrato | População | Amostra |',
    '| --- | ---: | ---: |',
    ...strataReport.map((s) => `| ${s.stratum} | ${s.population} | ${s.sampled} |`),
    '',
    '## Itens',
    '',
  ]
  for (const it of items) {
    md.push(`### ${it.itemId}`, '')
    md.push(
      `- Instrumento: ${it.instrument}; categoria atribuída: **${it.assignedCategory}**`,
      `- Achado: \`${it.finding.file}:${it.finding.line}\` cwe=${it.finding.cwe ?? '—'} regra=${it.finding.ruleId}`,
      `- Mensagem: ${it.finding.message.replace(/\n/g, ' ')}`,
    )
    if (it.assignedCase) {
      md.push(
        `- Caso atribuído: ${it.assignedCase.id} (${it.assignedCase.cwe}), sink=${it.assignedCase.sinkLine}, ` +
          `intervalo=${JSON.stringify(it.assignedCase.range)}, equivalência=${it.assignedCase.equivalence.join('/')}`,
      )
    }
    md.push('- Casos no arquivo:')
    for (const c of it.casesInFile) {
      md.push(
        `  - ${c.id} ${c.condition} ${c.cwe} sink=${c.sinkLine} intervalo=${JSON.stringify(c.range)} ` +
          `janelaVP=${c.lineInTpWindow} janelaProtegido=${c.lineInSafeWindow} cweEquivalente=${c.cweInEquivalence}`,
      )
    }
    if (it.instrumentFindingsInFile) {
      md.push('- Achados do instrumento neste arquivo:')
      if (!it.instrumentFindingsInFile.length) md.push('  - nenhum')
      for (const f of it.instrumentFindingsInFile) md.push(`  - linha ${f.line} cwe=${f.cwe ?? '—'} (${f.runId}) ${f.message}`)
    }
    if (it.source.length) {
      md.push('- Trecho:', '```', ...it.source, '```')
    }
    md.push('')
  }
  fs.writeFileSync(path.join(reportsDir, 'manual-sample.md'), md.join('\n') + '\n')

  /* ----------------------- taxa de divergência ----------------------- */
  const verdictsPath = path.join(reportsDir, 'manual-check-verdicts.json')
  if (fs.existsSync(verdictsPath)) {
    const verdicts = loadJson<{ verdicts: Array<{ itemId: string; verdict: 'confere' | 'divergente'; note?: string }> }>(
      verdictsPath,
    ).verdicts
    const byId = new Map(verdicts.map((v) => [v.itemId, v]))
    const missing = items.filter((i) => !byId.has(i.itemId)).map((i) => i.itemId)
    const extra = verdicts.filter((v) => !items.some((i) => i.itemId === v.itemId)).map((v) => v.itemId)
    const divergent = verdicts.filter((v) => v.verdict === 'divergente')
    const rate = verdicts.length === 0 ? 0 : divergent.length / verdicts.length
    const out = {
      schemaVersion: '1.0',
      generatedAt: new Date().toISOString(),
      population: classifications.length,
      sampled: items.length,
      fraction: items.length / classifications.length,
      reviewed: verdicts.length,
      divergent: divergent.length,
      divergenceRate: rate,
      threshold: 0.05,
      withinThreshold: rate <= 0.05,
      missingVerdicts: missing,
      unknownVerdicts: extra,
      divergences: divergent,
    }
    fs.writeFileSync(path.join(reportsDir, 'manual-check.json'), JSON.stringify(out, null, 2) + '\n')
    fs.writeFileSync(
      path.join(reportsDir, 'manual-check.md'),
      [
        '# Conferência manual — resultado',
        '',
        `- População de classificações do resultado principal: ${out.population}`,
        `- Itens amostrados: ${out.sampled} (${(out.fraction * 100).toFixed(1)}%)`,
        `- Itens conferidos: ${out.reviewed}`,
        `- Divergências: ${out.divergent}`,
        `- Taxa de divergência: ${(rate * 100).toFixed(2)}% (limite do protocolo: 5%)`,
        `- Dentro do limite: ${out.withinThreshold ? 'sim' : 'NÃO'}`,
        ...(missing.length ? ['', `Itens sem veredicto: ${missing.length}`] : []),
        ...(divergent.length
          ? ['', '## Divergências', '', ...divergent.map((d) => `- ${d.itemId}: ${d.note ?? 'sem nota'}`)]
          : []),
        '',
      ].join('\n'),
    )
    console.log(
      `manual-sample: ${items.length}/${classifications.length} itens; conferidos ${verdicts.length}; ` +
        `divergências ${divergent.length}; taxa ${(rate * 100).toFixed(2)}%`,
    )
    if (missing.length) console.error(`ATENCAO: ${missing.length} item(ns) da amostra sem veredicto`)
  } else {
    console.log(
      `manual-sample: ${items.length}/${classifications.length} itens (${((items.length / classifications.length) * 100).toFixed(1)}%) ` +
        `gravados em results/reports/manual-sample.{json,md}; veredictos ausentes`,
    )
  }
}

main()
