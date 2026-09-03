import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getSequelize } from '../../../db/sequelize.js'

const emailSchema = z.string().email()

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

export async function registerFindUser(app: FastifyInstance): Promise<void> {
  app.get('/users/find', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = emailSchema.safeParse((request.query as { email?: string }).email)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid email' })
    const sql = 'SELECT id, email, role FROM Users WHERE email = :email'
    const [rows] = await getSequelize().query(sql, { replacements: { email: parsed.data } })
    return reply.send(withEntityMeta({ users: rows }))
  })
}

