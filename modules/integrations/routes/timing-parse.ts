import type { FastifyInstance } from 'fastify'
import moment from 'moment'

export async function registerTimingParse(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    const millis = moment(value).valueOf()
    if (!Number.isFinite(millis)) {
      return reply.code(400).send({ error: 'invalid schedule' })
    }
    return reply.send({ millis })
  })
}

