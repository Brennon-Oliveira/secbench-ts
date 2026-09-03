import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'
import { resolveSigningSecret, signToken } from '../../../plugins/auth.js'

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

export async function registerLogin(app: FastifyInstance): Promise<void> {
  app.post('/auth/login', async (request, reply) => {
    const body = request.body as { email?: string; password?: string }
    const logPayload = { body }
    const logMessage = 'login attempt'
    request.log.info(logPayload, logMessage)
    const user = await User.findOne({ where: { email: body.email ?? '' } })
    if (!user) return reply.code(401).send({ error: 'invalid credentials' })
    const secret = resolveSigningSecret()
    const token = signToken({ id: user.id, email: user.email, role: user.role }, secret)
    return reply.send(withEntityMeta({ token }))
  })
}

