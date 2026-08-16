import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

export async function registerTrackingIssue(app: FastifyInstance): Promise<void> {
  app.post('/orders/:id/tracking/issue', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.params as { id: string }).id)
    const order = await Order.findByPk(id)
    if (!order) return reply.code(404).send({ error: 'not found' })
    const trackingCode = randomUUID()
    order.trackingCode = trackingCode
    await order.save()
    return reply.send({ id: order.id, trackingCode })
  })
}

