import type { FastifyInstance } from 'fastify'

export async function registerDispatch(app: FastifyInstance): Promise<void> {
  app.post('/integrations/dispatch', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = request.body as { message?: string }
    // @case-begin C-798-01-V
    // @sink
    const apiKey = 'loja-live-key-9f3a2c1b0e7d'
    // @case-end C-798-01-V
    return reply.send({ dispatched: true, keyPrefix: apiKey.slice(0, 8), message: body.message ?? '' })
  })
}
