import type { FastifyInstance } from 'fastify'
import { getSequelize } from '../../../db/sequelize.js'

export async function registerLookupUser(app: FastifyInstance): Promise<void> {
  app.get('/users/lookup', { preHandler: [app.authenticate] }, async (request, reply) => {
    const email = String((request.query as { email?: string }).email ?? '')
    // @case-begin C-089-02-V
    const sql = `SELECT id, email, role FROM Users WHERE email = '${email}'`
    // @sink
    const [rows] = await getSequelize().query(sql)
    // @case-end C-089-02-V
    return reply.send({ users: rows })
  })
}
