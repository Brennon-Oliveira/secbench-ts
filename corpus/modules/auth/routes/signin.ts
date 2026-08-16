import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'
import { resolveSigningSecret, signToken } from '../../../plugins/auth.js'

export async function registerSignin(app: FastifyInstance): Promise<void> {
  app.post('/auth/signin', async (request, reply) => {
    const body = request.body as { email?: string; password?: string }
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    const result = user ? 'accepted' : 'rejected'
    request.log.info({ email: body.email, result }, 'signin attempt')
    if (!user) return reply.code(401).send({ error: 'invalid credentials' })
    const secret = resolveSigningSecret(false)
    const token = signToken({ id: user.id, email: user.email, role: user.role }, secret)
    return reply.send({ token })
  })
}

