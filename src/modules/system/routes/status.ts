import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

export async function registerSystemStatus(app: FastifyInstance): Promise<void> {
  app.get('/system/status', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.query as { id?: string }).id)
    // @case-begin C-209-01-S
    try {
      const order = await Order.findByPk(id)
      if (!order) {
        throw new Error('Order missing at ' + new URL(import.meta.url).pathname + ' id=' + id)
      }
      return reply.send({ id: order.id, status: order.status })
    } catch (err) {
      const correlationId = randomUUID()
      request.log.error({ err, correlationId }, 'status lookup failed')
      // @sink
      return reply.code(500).send({ error: 'internal error', correlationId })
    }
    // @case-end C-209-01-S
  })
}
