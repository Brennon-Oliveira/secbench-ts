import type { FastifyInstance } from 'fastify'
import { getSequelize } from '../../../db/sequelize.js'

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

export async function registerSearchOrders(app: FastifyInstance): Promise<void> {
  app.get('/orders/search', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user!.id
    const status = String((request.query as { status?: string }).status ?? '')
    const statusLiteral = "'" + status + "'"
    const sql =
      "SELECT id, status, total, trackingCode FROM Orders WHERE userId = " +
      userId +
      " AND status = " +
      statusLiteral
    const [rows] = await getSequelize().query(sql)
    return reply.send(withEntityMeta({ orders: rows }))
  })
}

