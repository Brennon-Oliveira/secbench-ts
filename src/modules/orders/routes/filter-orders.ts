import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ORDER_STATUSES } from '../../../config/constants.js'
import { getSequelize } from '../../../db/sequelize.js'

const statusSchema = z.enum(ORDER_STATUSES)

export async function registerFilterOrders(app: FastifyInstance): Promise<void> {
  app.get('/orders/filter', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user!.id
    const parsed = statusSchema.safeParse((request.query as { status?: string }).status)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid status' })
    }
    // @case-begin C-089-01-S
    const sql =
      'SELECT id, status, total, trackingCode FROM Orders WHERE userId = :userId AND status = :status'
    // @sink
    const [rows] = await getSequelize().query(sql, {
      replacements: { userId, status: parsed.data },
    })
    // @case-end C-089-01-S
    return reply.send({ orders: rows })
  })
}
