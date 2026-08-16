import type { FastifyInstance } from 'fastify'

export async function registerCallback(app: FastifyInstance): Promise<void> {
  app.get('/auth/callback', async (request, reply) => {
    const next = String((request.query as { next?: string }).next ?? '/')
    return reply.redirect(next)
  })
}

