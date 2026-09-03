import { randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerResetRequest(app: FastifyInstance): Promise<void> {
  app.post('/auth/reset/request', async (request, reply) => {
    const email = String((request.body as { email?: string }).email ?? '')
    const user = await User.findOne({ where: { email } })
    if (!user) return reply.code(404).send({ error: 'not found' })
    const token = randomBytes(32).toString('hex')
    user.resetToken = token
    await user.save()
    return reply.send({ requested: true, token })
  })
}

