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

export async function registerProfileValidate(app: FastifyInstance): Promise<void> {
  app.post('/users/profile/validate', { preHandler: [app.authenticate] }, async (request, reply) => {
    const tradeName = String((request.body as { tradeName?: string }).tradeName ?? '')
    // @case-begin C-1333-01-V
    const pattern = /^([a-zA-Z0-9]+)+$/
    const input = String(tradeName)
    const trimmedInput = input
    // @sink
    const ok = pattern.test(trimmedInput)
    // @case-end C-1333-01-V
    return reply.send(withEntityMeta({ ok, patternSource: pattern.source }))
  })
}
