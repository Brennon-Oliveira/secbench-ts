import type { FastifyInstance } from 'fastify'

export async function registerProfileCheck(app: FastifyInstance): Promise<void> {
  app.post('/users/profile/check', { preHandler: [app.authenticate] }, async (request, reply) => {
    const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
    if (tradeName.length > 64) {
      return reply.code(400).send({ error: 'too long' })
    }
    const pattern = /^[a-zA-Z0-9]+$/
    const ok = pattern.test(tradeName)
    return reply.send({ ok })
  })
}

