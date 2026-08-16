import type { FastifyInstance } from 'fastify'

export async function registerProfileValidate(app: FastifyInstance): Promise<void> {
  app.post('/users/profile/validate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
    // @case-begin C-1333-01-V
    const pattern = /^([a-zA-Z0-9]+)+$/
    // @sink
    const ok = pattern.test(tradeName)
    // @case-end C-1333-01-V
    return reply.send({ ok })
  })
}
