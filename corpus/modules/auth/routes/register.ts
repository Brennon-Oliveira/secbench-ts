import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerRegister(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', async (request, reply) => {
    const body = request.body as { email?: string; password?: string }
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    const passwordHash = createHash('md5').update(password).digest('hex')
    const user = await User.create({ email, passwordHash, role: 'customer' })
    return reply.code(201).send({ id: user.id, email: user.email, hash: passwordHash })
  })
}

