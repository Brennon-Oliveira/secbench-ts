import type { FastifyInstance } from 'fastify'

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
    const expression = String((request.body as { expression?: string }).expression ?? '')
    const total = Number((request.body as { total?: number }).total ?? 0)
    const quantidade = Number((request.body as { quantidade?: number }).quantidade ?? 0)
    try {
      const result = evaluateExpression(expression, total, quantidade)
      return reply.send({ result })
    } catch {
      return reply.code(400).send({ error: 'expression rejected' })
    }
  })
}

