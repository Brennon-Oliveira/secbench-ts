import type { FastifyInstance } from 'fastify'
import escapeHtml from 'escape-html'

export async function registerTimingFormat(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/format', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    const formatted = escapeHtml(value)
    return reply.send({ formatted, dependency: 'escape-html' })
  })
}

