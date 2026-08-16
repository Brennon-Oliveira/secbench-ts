import type { FastifyInstance } from 'fastify'
import serialize from 'node-serialize'

export async function registerImportPreferences(app: FastifyInstance): Promise<void> {
  app.post('/preferences/import', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = String((request.body as { data?: string }).data ?? '')
    const decoded = Buffer.from(data, 'base64').toString('utf8')
    const prefs = serialize.unserialize(decoded)
    return reply.send({ applied: true, preferences: prefs })
  })
}

