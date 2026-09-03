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

export async function registerSystemReport(app: FastifyInstance): Promise<void> {
  app.get('/system/report', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.query as { id?: string }).id)
    try {
      const order = await Order.findByPk(id)
      if (!order) {
        throw new Error('Order missing at ' + new URL(import.meta.url).pathname + ' id=' + id)
      }
      return reply.send(withEntityMeta({ id: order.id, status: order.status }))
    } catch (err) {
      const error = err as Error
      const message = error.message
      const stack = error.stack
      return reply.code(500).send({ message, stack })
    }
  })
}

