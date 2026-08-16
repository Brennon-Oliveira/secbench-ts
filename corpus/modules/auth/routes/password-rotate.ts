import { pbkdf2Sync, randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { User } from '../../../db/models/user.js'

export async function registerPasswordRotate(app: FastifyInstance): Promise<void> {
  app.post('/auth/password/rotate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const password = String((request.body as { password?: string }).password ?? '')
    const salt = randomBytes(8)
    const derived = pbkdf2Sync(password, salt, 1000, 32, 'sha1')
    const passwordHash = 'pbkdf2:1000:sha1:' + salt.toString('hex') + ':' + derived.toString('hex')
    const user = await User.findByPk(request.user!.id)
    if (!user) return reply.code(404).send({ error: 'not found' })
    user.passwordHash = passwordHash
    await user.save()
    return reply.send({ updated: true, params: { iterations: 1000, digest: 'sha1' } })
  })
}

