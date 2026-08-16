import type { FastifyInstance } from 'fastify'

export async function registerFormula(app: FastifyInstance): Promise<void> {
  app.post('/reports/formula', { preHandler: [app.authenticate] }, async (request, reply) => {
    const expression = String((request.body as { expression?: string }).expression ?? '')
    const total = Number((request.body as { total?: number }).total ?? 0)
    const quantidade = Number((request.body as { quantidade?: number }).quantidade ?? 0)
    const fn = new Function('total', 'quantidade', 'return (' + expression + ')')
    const result = fn(total, quantidade)
    return reply.send({ result })
  })
}

