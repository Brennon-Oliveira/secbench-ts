import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'
import { resolveSigningSecret, signToken } from '../../../plugins/auth.js'

export async function registerLogin(app: FastifyInstance): Promise<void> {
  app.post('/auth/login', async (request, reply) => {
    const body = request.body as { email?: string; password?: string }
    // @case-begin C-532-01-V
    // @sink
    request.log.info({ body }, 'login attempt')
    // @case-end C-532-01-V
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    if (!user) return reply.code(401).send({ error: 'invalid credentials' })
    const secret = resolveSigningSecret(false)
    const token = signToken({ id: user.id, email: user.email, role: user.role }, secret)
    return reply.send({ token })
  })
}
