import type { FastifyInstance } from 'fastify'
import escapeHtml from 'escape-html'

export async function registerTimingFormat(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/format', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    // @case-begin C-1104-01-S
    // @sink
    const formatted = escapeHtml(value)
    // @case-end C-1104-01-S
    return reply.send({ formatted, dependency: 'escape-html' })
  })
}
