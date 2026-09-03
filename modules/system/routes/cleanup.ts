import type { FastifyInstance } from 'fastify'
import { Op } from 'sequelize'
import { Order } from '../../../db/models/order.js'

export async function registerCleanup(app: FastifyInstance): Promise<void> {
  app.post('/system/maintenance/cleanup', { preHandler: [app.requireAdmin] }, async (_request, reply) => {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const removed = await Order.destroy({
      where: { status: 'cancelled', createdAt: { [Op.lt]: cutoff } },
    })
    return reply.send({ removed })
  })
}

