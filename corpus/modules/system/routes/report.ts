import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

export async function registerSystemReport(app: FastifyInstance): Promise<void> {
  app.get('/system/report', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.query as { id?: string }).id)
    try {
      const order = await Order.findByPk(id)
      if (!order) {
        throw new Error('Order missing at ' + new URL(import.meta.url).pathname + ' id=' + id)
      }
      return reply.send({ id: order.id, status: order.status })
    } catch (err) {
      const error = err as Error
      return reply.code(500).send({ message: error.message, stack: error.stack })
    }
  })
}

