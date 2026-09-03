import type { FastifyInstance } from 'fastify'
import yaml from 'js-yaml'

function presentConfig(parsed: unknown) {
  const kind = typeof parsed
  const keys =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? Object.keys(parsed as Record<string, unknown>).sort()
      : []
  return {
    config: parsed,
    kind,
    meta: {
      keyCount: keys.length,
      keys: keys.slice(0, 20),
      isArray: Array.isArray(parsed),
      isNull: parsed === null,
    },
  }
}

export async function registerApplyConfig(app: FastifyInstance): Promise<void> {
  app.post('/integrations/config/apply', { preHandler: [app.authenticate] }, async (request, reply) => {
    const doc = String((request.body as { yaml?: string }).yaml ?? '')
    // @case-begin C-502-02-V
    const schema = yaml.DEFAULT_FULL_SCHEMA
    // @sink
    const parsed = yaml.load(doc, { schema })
    // @case-end C-502-02-V
    return reply.send(presentConfig(parsed))
  })
}
