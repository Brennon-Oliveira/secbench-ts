import type { FastifyInstance } from 'fastify'
import ms from 'ms'

export async function registerTimingParse(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    // @case-begin C-1104-01-V
    // @sink
    const millis = ms(value)
    // @case-end C-1104-01-V
    return reply.send({ millis: millis ?? null, dependency: 'ms' })
  })
}
