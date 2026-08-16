import type { FastifyInstance } from 'fastify'
import { getSequelize } from '../../../db/sequelize.js'

export async function registerSearchOrders(app: FastifyInstance): Promise<void> {
  app.get('/orders/search', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user!.id
    const status = String((request.query as { status?: string }).status ?? '')
    const sql =
      "SELECT id, status, total, trackingCode FROM Orders WHERE userId = " +
      userId +
      " AND status = '" +
      status +
      "'"
    const [rows] = await getSequelize().query(sql)
    return reply.send({ orders: rows })
  })
}

