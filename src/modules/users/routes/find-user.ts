import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getSequelize } from '../../../db/sequelize.js'

const emailSchema = z.string().email()

export async function registerFindUser(app: FastifyInstance): Promise<void> {
  app.get('/users/find', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = emailSchema.safeParse((request.query as { email?: string }).email)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid email' })
    // @case-begin C-089-02-S
    const sql = 'SELECT id, email, role FROM Users WHERE email = :email'
    // @sink
    const [rows] = await getSequelize().query(sql, { replacements: { email: parsed.data } })
    // @case-end C-089-02-S
    return reply.send({ users: rows })
  })
}
