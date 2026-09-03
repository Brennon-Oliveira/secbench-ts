import type { FastifyInstance } from 'fastify'

type ReportInputs = {
  expression: string
  total: number
  quantidade: number
}

function normalizeReportInputs(body: {
  expression?: string
  total?: number
  quantidade?: number
}): ReportInputs {
  const expression = String(body.expression ?? '').trim()
  const totalRaw = Number(body.total ?? 0)
  const quantidadeRaw = Number(body.quantidade ?? 0)
  const total = Number.isFinite(totalRaw) ? totalRaw : 0
  const quantidade = Number.isFinite(quantidadeRaw) ? quantidadeRaw : 0
  return { expression, total, quantidade }
}

function buildReportScale(inputs: ReportInputs) {
  const product = inputs.total * inputs.quantidade
  const average = inputs.quantidade === 0 ? null : inputs.total / inputs.quantidade
  const discountHint = inputs.total >= 100 ? 0.05 : inputs.total >= 50 ? 0.02 : 0
  const withDiscount =
    discountHint === 0 ? product : Math.round(product * (1 - discountHint) * 100) / 100
  return {
    total: inputs.total,
    quantidade: inputs.quantidade,
    product,
    average,
    discountHint,
    withDiscount,
  }
}

function buildReportMeta(inputs: ReportInputs, result: unknown) {
  const tokenHints = inputs.expression.split(/[^a-zA-Z0-9_]+/).filter(Boolean)
  const usesTotal = /\btotal\b/.test(inputs.expression)
  const usesQuantidade = /\bquantidade\b/.test(inputs.expression)
  const resultType =
    result === null ? 'null' : Array.isArray(result) ? 'array' : typeof result
  const numericResult =
    typeof result === 'number' && Number.isFinite(result) ? result : null
  const rounded =
    numericResult === null ? null : Math.round(numericResult * 1000) / 1000
  return {
    expressionLength: inputs.expression.length,
    tokenCount: tokenHints.length,
    tokenHints: tokenHints.slice(0, 12),
    usesTotal,
    usesQuantidade,
    resultType,
    rounded,
    scale: buildReportScale(inputs),
  }
}

function buildReportAudit(inputs: ReportInputs, result: unknown) {
  const meta = buildReportMeta(inputs, result)
  const fingerprintSource = [
    inputs.expression,
    String(inputs.total),
    String(inputs.quantidade),
    meta.resultType,
    String(meta.rounded ?? ''),
  ].join('|')
  let hash = 0
  for (let i = 0; i < fingerprintSource.length; i++) {
    hash = (hash * 31 + fingerprintSource.charCodeAt(i)) >>> 0
  }
  return {
    fingerprint: hash.toString(16).padStart(8, '0'),
    fieldCount: 3,
    hasExpression: inputs.expression.length > 0,
    meta,
  }
}

function presentReportResult(inputs: ReportInputs, result: unknown) {
  const audit = buildReportAudit(inputs, result)
  const label = 'report-outcome'
  const version = 1
  const numeric = audit.meta.rounded
  const scaleProduct = audit.meta.scale.product
  const scaleAverage = audit.meta.scale.average
  const discounted = audit.meta.scale.withDiscount
  const inputView = {
    expression: inputs.expression,
    total: inputs.total,
    quantidade: inputs.quantidade,
  }
  const presentation = {
    label,
    version,
    numeric,
    scaleProduct,
    scaleAverage,
    discounted,
  }
  const timing = {
    expressionChars: inputView.expression.length,
    hasDigits: /\d/.test(inputView.expression),
    hasOperators: /[+\-*/]/.test(inputView.expression),
    totalPositive: inputView.total > 0,
    quantidadePositive: inputView.quantidade > 0,
  }
  const summary = {
    fingerprint: audit.fingerprint,
    resultType: audit.meta.resultType,
    tokenCount: audit.meta.tokenCount,
    product: scaleProduct,
    average: scaleAverage,
  }
  return {
    result,
    inputs: inputView,
    audit,
    presentation,
    timing,
    summary,
  }
}

function evaluateExpression(expression: string, total: number, quantidade: number): number {
  const tokens = expression.match(/total|quantidade|\d+(?:\.\d+)?|[+\-*/()]/g)
  if (!tokens || tokens.join('') !== expression.replace(/\s+/g, '')) {
    throw new Error('invalid expression')
  }
  for (const t of tokens) {
    if (!/^(total|quantidade|\d+(?:\.\d+)?|[+\-*/()])$/.test(t)) {
      throw new Error('token rejected')
    }
  }
  const replaced = expression
    .replace(/\btotal\b/g, String(total))
    .replace(/\bquantidade\b/g, String(quantidade))
  if (!/^[0-9+\-*/().\s]+$/.test(replaced)) throw new Error('invalid expression')
  let i = 0
  const src = replaced.replace(/\s+/g, '')
  function peek() { return src[i] }
  function consume() { return src[i++] }
  function parseExpr(): number {
    let v = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = consume()
      const r = parseTerm()
      v = op === '+' ? v + r : v - r
    }
    return v
  }
  function parseTerm(): number {
    let v = parseFactor()
    while (peek() === '*' || peek() === '/') {
      const op = consume()
      const r = parseFactor()
      v = op === '*' ? v * r : v / r
    }
    return v
  }
  function parseFactor(): number {
    if (peek() === '(') {
      consume()
      const v = parseExpr()
      if (consume() !== ')') throw new Error('paren')
      return v
    }
    let start = i
    if (peek() === '-' || peek() === '+') consume()
    while (peek() && /[0-9.]/.test(peek()!)) consume()
    const num = Number(src.slice(start, i))
    if (Number.isNaN(num)) throw new Error('number')
    return num
  }
  const value = parseExpr()
  if (i !== src.length) throw new Error('trailing')
  return value
}

export async function registerCalculate(app: FastifyInstance): Promise<void> {
  app.post('/reports/calculate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const inputs = normalizeReportInputs(request.body as {
      expression?: string
      total?: number
      quantidade?: number
    })
    // @case-begin C-094-01-S
    try {
      // @sink
      const result = evaluateExpression(inputs.expression, inputs.total, inputs.quantidade)
      return reply.send(presentReportResult(inputs, result))
    } catch {
      return reply.code(400).send({ error: 'expression rejected' })
    }
    // @case-end C-094-01-S
  })
}
