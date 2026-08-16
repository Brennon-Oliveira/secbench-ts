import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

export async function registerPayment(app: FastifyInstance): Promise<void> {
  app.post('/orders/:id/payment', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.params as { id: string }).id)
    const body = request.body as { cardNumber?: string; holder?: string }
    const order = await Order.findByPk(id)
    if (!order) return reply.code(404).send({ error: 'not found' })
    request.log.info({ payment: body, orderId: id }, 'payment received')
    order.status = 'paid'
    await order.save()
    return reply.send({ id: order.id, status: order.status })
  })
}

