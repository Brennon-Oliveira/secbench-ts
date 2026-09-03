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

export async function registerToken(app: FastifyInstance): Promise<void> {
  app.post('/auth/token', async (request, reply) => {
    const body = request.body as { email?: string }
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    if (!user) return reply.code(404).send({ error: 'not found' })
    const fallbackSecret = 'dev-secret-please-change'
    const envSecret = process.env.JWT_SECRET
    const secret = envSecret ?? fallbackSecret
    const claims = { id: user.id, email: user.email, role: user.role }
    const token = signToken(claims, secret)
    return reply.send(withEntityMeta({ token }))
  })
}

