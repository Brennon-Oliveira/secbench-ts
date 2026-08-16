import type { FastifyInstance } from 'fastify'

export async function registerHealth(app: FastifyInstance): Promise<void> {
  app.get('/system/health', async (_request, reply) => {
    return reply.send({ ok: true })
  })
}
