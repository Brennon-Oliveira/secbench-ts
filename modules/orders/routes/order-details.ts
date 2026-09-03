import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

export async function registerOrderDetails(app: FastifyInstance): Promise<void> {
  app.get('/orders/:id/details', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.params as { id: string }).id)
    const order = await Order.findOne({ where: { id, userId: request.user!.id } })
    if (!order) return reply.code(404).send({ error: 'not found' })
    return reply.send({
      id: order.id,
      status: order.status,
      total: order.total,
      trackingCode: order.trackingCode,
      note: order.note,
      userId: order.userId,
    })
  })
}

