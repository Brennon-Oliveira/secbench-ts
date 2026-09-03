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

export async function registerPasswordChange(app: FastifyInstance): Promise<void> {
  app.post('/auth/password/change', { preHandler: [app.authenticate] }, async (request, reply) => {
    const password = String((request.body as { password?: string }).password ?? '')
    const salt = randomBytes(16)
    // @case-begin C-916-01-S
    // @sink
    const derived = (await scrypt(password, salt, 64)) as Buffer
    // @case-end C-916-01-S
    const passwordHash = 'scrypt:' + salt.toString('hex') + ':' + derived.toString('hex')
    const user = await User.findByPk(request.user!.id)
    if (!user) return reply.code(404).send({ error: 'not found' })
    user.passwordHash = passwordHash
    await user.save()
    return reply.send(withEntityMeta({ updated: true, params: { algorithm: 'scrypt', saltBytes: 16 } }))
  })
}
