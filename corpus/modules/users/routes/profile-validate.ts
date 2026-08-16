import type { FastifyInstance } from 'fastify'

export async function registerProfileValidate(app: FastifyInstance): Promise<void> {
  app.post('/users/profile/validate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
    const pattern = /^([a-zA-Z0-9]+)+$/
    const ok = pattern.test(tradeName)
    return reply.send({ ok })
  })
}

