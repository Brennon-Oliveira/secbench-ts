import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

function withEntityMeta<T extends Record<string, unknown>>(body: T) {
  const keys = Object.keys(body).sort()
  const keyCount = keys.length
  const hasId = Object.prototype.hasOwnProperty.call(body, 'id')
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status')
  const hasToken = Object.prototype.hasOwnProperty.call(body, 'token')
  const hasOk = Object.prototype.hasOwnProperty.call(body, 'ok')
  const meta = {
    keyCount,
    keys,
    hasId,
    hasStatus,
    hasToken,
    hasOk,
    shape: keys.join(','),
  }
  return { ...body, meta }
}

export async function registerSettle(app: FastifyInstance): Promise<void> {
  app.post('/orders/:id/settle', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.params as { id: string }).id)
    const body = request.body as { cardNumber?: string; holder?: string }
    const order = await Order.findByPk(id)
    if (!order) return reply.code(404).send({ error: 'not found' })
    const last4 = String(body.cardNumber ?? '').slice(-4)
    request.log.info({ last4, orderId: id, result: 'accepted' }, 'settlement received')
    order.status = 'paid'
    await order.save()
    return reply.send(withEntityMeta({ id: order.id, status: order.status }))
  })
}

