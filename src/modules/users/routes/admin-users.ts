import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerAdminUsers(app: FastifyInstance): Promise<void> {
  app.get('/admin/users', { preHandler: [app.authenticate] }, async (_request, reply) => {
    // @case-begin C-284-01-V
    // @sink
    const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
    // @case-end C-284-01-V
    return reply.send({
      users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    })
  })
}
