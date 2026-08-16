import type { FastifyInstance } from 'fastify'

export async function registerProfileCheck(app: FastifyInstance): Promise<void> {
  app.post('/users/profile/check', { preHandler: [app.authenticate] }, async (request, reply) => {
    const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
    if (tradeName.length > 64) {
      return reply.code(400).send({ error: 'too long' })
    }
    // @case-begin C-1333-01-S
    const pattern = /^[a-zA-Z0-9]+$/
    // @sink
    const ok = pattern.test(tradeName)
    // @case-end C-1333-01-S
    return reply.send({ ok })
  })
}
