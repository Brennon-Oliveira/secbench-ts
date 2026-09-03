import { pbkdf2Sync, randomBytes } from 'node:crypto'
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

export async function registerPasswordRotate(app: FastifyInstance): Promise<void> {
  app.post('/auth/password/rotate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const password = String((request.body as { password?: string }).password ?? '')
    const salt = randomBytes(8)
    // @case-begin C-916-01-V
    const iterations = 1000
    const digest = 'sha1'
    // @sink
    const derived = pbkdf2Sync(password, salt, iterations, 32, digest)
    // @case-end C-916-01-V
    const passwordHash = 'pbkdf2:1000:sha1:' + salt.toString('hex') + ':' + derived.toString('hex')
    const user = await User.findByPk(request.user!.id)
    if (!user) return reply.code(404).send({ error: 'not found' })
    user.passwordHash = passwordHash
    await user.save()
    return reply.send(withEntityMeta({ updated: true, params: { iterations: 1000, digest: 'sha1' } }))
  })
}
