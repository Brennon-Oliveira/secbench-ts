import type { FastifyInstance } from 'fastify'

export async function registerCallback(app: FastifyInstance): Promise<void> {
  app.get('/auth/callback', async (request, reply) => {
    const next = String((request.query as { next?: string }).next ?? '/')
    // @case-begin C-601-01-V
    // @sink
    return reply.redirect(next)
    // @case-end C-601-01-V
  })
}
