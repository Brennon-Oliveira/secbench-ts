import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerAdminUsers(app: FastifyInstance): Promise<void> {
  app.get('/admin/users', { preHandler: [app.authenticate] }, async (_request, reply) => {
    const users = await User.findAll({ attributes: ['id', 'email', 'role'] })
    return reply.send({
      users: users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    })
  })
}

