import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

export async function registerPublish(app: FastifyInstance): Promise<void> {
  app.post('/integrations/publish', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = request.body as { message?: string }
    const env = loadEnv()
    const apiKey = env.integrationApiKey
    if (!apiKey) {
      return reply.code(500).send({ error: 'configuration incomplete' })
    }
    return reply.send({ published: true, keyPrefix: apiKey.slice(0, 8), message: body.message ?? '' })
  })
}

