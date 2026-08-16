import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'
import { resolveSigningSecret, signToken } from '../../../plugins/auth.js'

export async function registerToken(app: FastifyInstance): Promise<void> {
  app.post('/auth/token', async (request, reply) => {
    const body = request.body as { email?: string }
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    if (!user) return reply.code(404).send({ error: 'not found' })
    // @case-begin C-798-02-V
    // @sink
    const secret = resolveSigningSecret(false)
    // @case-end C-798-02-V
    const token = signToken({ id: user.id, email: user.email, role: user.role }, secret)
    return reply.send({ token })
  })
}
