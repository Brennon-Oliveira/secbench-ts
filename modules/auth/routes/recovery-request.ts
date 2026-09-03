import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerRecoveryRequest(app: FastifyInstance): Promise<void> {
  app.post('/auth/recovery/request', async (request, reply) => {
    const email = String((request.body as { email?: string }).email ?? '')
    const user = await User.findOne({ where: { email } })
    if (!user) return reply.code(404).send({ error: 'not found' })
    let token = ''
    while (token.length < 32) {
      token += Math.random().toString(36).slice(2)
    }
    token = token.slice(0, 32)
    user.resetToken = token
    await user.save()
    return reply.send({ requested: true, token })
  })
}

