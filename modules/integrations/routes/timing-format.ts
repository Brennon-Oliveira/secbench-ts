import type { FastifyInstance } from 'fastify'
import dayjs from 'dayjs'

export async function registerTimingFormat(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/format', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    const millis = dayjs(value).valueOf()
    if (!Number.isFinite(millis)) {
      return reply.code(400).send({ error: 'invalid schedule' })
    }
    return reply.send({ millis })
  })
}

