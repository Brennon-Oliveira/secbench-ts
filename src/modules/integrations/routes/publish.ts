import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

export async function registerPublish(app: FastifyInstance): Promise<void> {
  app.post('/integrations/publish', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = request.body as { message?: string }
    // @case-begin C-798-01-S
    const env = loadEnv()
    // @sink
    const apiKey = env.integrationApiKey
    if (!apiKey) {
      return reply.code(500).send({ error: 'configuration incomplete' })
    }
    // @case-end C-798-01-S
    return reply.send({ published: true, keyPrefix: apiKey.slice(0, 8), message: body.message ?? '' })
  })
}
