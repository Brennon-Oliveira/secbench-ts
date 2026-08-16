import type { FastifyInstance } from 'fastify'
import ms from 'ms'

export async function registerTimingParse(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    const millis = ms(value)
    return reply.send({ millis: millis ?? null, dependency: 'ms' })
  })
}

