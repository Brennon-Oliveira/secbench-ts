import type { FastifyInstance } from 'fastify'

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

export async function registerDispatch(app: FastifyInstance): Promise<void> {
  app.post('/integrations/dispatch', { preHandler: [app.authenticate] }, async (request, reply) => {
    const body = request.body as { message?: string }
    // @case-begin C-798-01-V
    const embeddedKey = 'loja-live-key-9f3a2c1b0e7d'
    // @sink
    const apiKey = embeddedKey
    // @case-end C-798-01-V
    return reply.send(presentIntegrationResult('dispatched', apiKey, body.message ?? ''))
  })
}
