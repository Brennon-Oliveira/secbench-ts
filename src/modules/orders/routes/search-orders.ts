import type { FastifyInstance } from 'fastify'
import { getSequelize } from '../../../db/sequelize.js'

export async function registerSearchOrders(app: FastifyInstance): Promise<void> {
  app.get('/orders/search', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user!.id
    const status = String((request.query as { status?: string }).status ?? '')
    // @case-begin C-089-01-V
    const sql =
      "SELECT id, status, total, trackingCode FROM Orders WHERE userId = " +
      userId +
      " AND status = '" +
      status +
      "'"
    // @sink
    const [rows] = await getSequelize().query(sql)
    // @case-end C-089-01-V
    return reply.send({ orders: rows })
  })
}
