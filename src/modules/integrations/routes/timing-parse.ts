import type { FastifyInstance } from 'fastify'
import moment from 'moment'

export async function registerTimingParse(app: FastifyInstance): Promise<void> {
  app.post('/integrations/timing/parse', { preHandler: [app.authenticate] }, async (request, reply) => {
    const value = String((request.body as { value?: string }).value ?? '')
    // @case-begin C-1104-01-V
    // @sink
    const millis = moment(value).valueOf()
    // @case-end C-1104-01-V
    if (!Number.isFinite(millis)) {
      return reply.code(400).send({ error: 'invalid schedule' })
    }
    return reply.send({ millis })
  })
}
