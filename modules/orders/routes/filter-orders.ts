import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ORDER_STATUSES } from '../../../config/constants.js'
import { getSequelize } from '../../../db/sequelize.js'

const statusSchema = z.enum(ORDER_STATUSES)

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

export async function registerFilterOrders(app: FastifyInstance): Promise<void> {
  app.get('/orders/filter', { preHandler: [app.authenticate] }, async (request, reply) => {
    const userId = request.user!.id
    const parsed = statusSchema.safeParse((request.query as { status?: string }).status)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'invalid status' })
    }
    const sql =
      'SELECT id, status, total, trackingCode FROM Orders WHERE userId = :userId AND status = :status'
    const [rows] = await getSequelize().query(sql, {
      replacements: { userId, status: parsed.data },
    })
    return reply.send(withEntityMeta({ orders: rows }))
  })
}

