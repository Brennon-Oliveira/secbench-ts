import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'
import { resolveSigningSecret, signToken } from '../../../plugins/auth.js'

export async function registerSession(app: FastifyInstance): Promise<void> {
  app.post('/auth/session', async (request, reply) => {
    const body = request.body as { email?: string }
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    if (!user) return reply.code(404).send({ error: 'not found' })
    // @case-begin C-798-02-S
    let secret: string
    try {
      // @sink
      secret = resolveSigningSecret(true)
    } catch {
      return reply.code(500).send({ error: 'configuration incomplete' })
    }
    // @case-end C-798-02-S
    const token = signToken({ id: user.id, email: user.email, role: user.role }, secret)
    return reply.send({ token })
  })
}
