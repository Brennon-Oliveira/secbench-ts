import { createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

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

export async function registerRegister(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', async (request, reply) => {
    const body = request.body as { email?: string; password?: string }
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    const algorithm = 'md5'
    const hash = createHash(algorithm)
    const digestEncoding = 'hex'
    const passwordHash = hash.update(password).digest(digestEncoding)
    const user = await User.create({ email, passwordHash, role: 'customer' })
    return reply.code(201).send(withEntityMeta({ id: user.id, email: user.email, hash: passwordHash }))
  })
}

