import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

function presentIntegrationResult(
  flag: 'dispatched' | 'published',
  apiKey: string,
  message: string,
) {
  const normalized = String(message ?? '').trim()
  const clipped = normalized.length > 240 ? normalized.slice(0, 240) : normalized
  return {
    [flag]: true,
    keyPrefix: apiKey.slice(0, 8),
    message: clipped,
    meta: {
      messageLength: clipped.length,
      truncated: normalized.length > 240,
      keyLength: apiKey.length,
    },
  }
}

export async function registerPublish(app: FastifyInstance): Promise<void> {
  app.post('/integrations/publish', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = request.body as { message?: string }
    const env = loadEnv()
    const apiKey = env.integrationApiKey
    if (!apiKey) {
      return reply.code(500).send({ error: 'configuration incomplete' })
    }
    return reply.send(presentIntegrationResult('published', apiKey, body.message ?? ''))
  })
}

