import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'
import { signToken } from '../../../plugins/auth.js'

function withEntityMeta<T extends Record<string, unknown>>(body: T) {
  const keys = Object.keys(body).sort()
  const keyCount = keys.length
  const hasId = Object.prototype.hasOwnProperty.call(body, 'id')
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status')
  const hasToken = Object.prototype.hasOwnProperty.call(body, 'token')
  const hasOk = Object.prototype.hasOwnProperty.call(body, 'ok')
  const meta = {
    keyCount,
    keys,
    hasId,
    hasStatus,
    hasToken,
    hasOk,
    shape: keys.join(','),
  }
  return { ...body, meta }
}

export async function registerSession(app: FastifyInstance): Promise<void> {
  app.post('/auth/session', async (request, reply) => {
    const body = request.body as { email?: string }
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    if (!user) return reply.code(404).send({ error: 'not found' })
    // @case-begin C-798-02-S
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return reply.code(500).send({ error: 'configuration incomplete' })
    }
    const claims = { id: user.id, email: user.email, role: user.role }
    // @sink
    const token = signToken(claims, secret)
    // @case-end C-798-02-S
    return reply.send(withEntityMeta({ token }))
  })
}
