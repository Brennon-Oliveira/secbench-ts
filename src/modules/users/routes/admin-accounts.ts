import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerAdminAccounts(app: FastifyInstance): Promise<void> {
  app.get('/admin/accounts', { preHandler: [app.requireAdmin] }, async (_request, reply) => {
    // @case-begin C-284-01-S
    // @sink
    const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
    // @case-end C-284-01-S
    return reply.send({
      users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    })
  })
}
