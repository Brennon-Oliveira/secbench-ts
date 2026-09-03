import type { FastifyInstance } from 'fastify'

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

export async function registerProfileCheck(app: FastifyInstance): Promise<void> {
  app.post('/users/profile/check', { preHandler: [app.authenticate] }, async (request, reply) => {
    const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
    if (tradeName.length > 64) {
      return reply.code(400).send({ error: 'too long' })
    }
    const pattern = /^[a-zA-Z0-9]+$/
    const ok = pattern.test(tradeName)
    return reply.send(withEntityMeta({ ok, patternSource: pattern.source }))
  })
}

