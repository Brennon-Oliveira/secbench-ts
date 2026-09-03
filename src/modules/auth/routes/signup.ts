import { randomBytes, scrypt as scryptCb } from 'node:crypto'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

const scrypt = promisify(scryptCb)

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

export async function registerSignup(app: FastifyInstance): Promise<void> {
  app.post('/auth/signup', async (request, reply) => {
    const body = request.body as { email?: string; password?: string }
    const email = String(body.email ?? '')
    const password = String(body.password ?? '')
    const salt = randomBytes(16)
    // @case-begin C-327-01-S
    // @sink
    const derived = (await scrypt(password, salt, 64)) as Buffer
    // @case-end C-327-01-S
    const passwordHash = salt.toString('hex') + ':' + derived.toString('hex')
    const user = await User.create({ email, passwordHash, role: 'customer' })
    return reply.code(201).send(withEntityMeta({ id: user.id, email: user.email }))
  })
}
