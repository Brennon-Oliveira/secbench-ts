import type { FastifyInstance } from 'fastify'
import yaml from 'js-yaml'
import { z } from 'zod'

const configSchema = z.object({
  name: z.string(),
  timeoutMs: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
}).strict()

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

export async function registerUpdateConfig(app: FastifyInstance): Promise<void> {
  app.post('/integrations/config/update', { preHandler: [app.authenticate] }, async (request, reply) => {
    const doc = String((request.body as { yaml?: string }).yaml ?? '')
    // @case-begin C-502-02-S
    const loaded = yaml.load(doc, { schema: yaml.DEFAULT_SAFE_SCHEMA })
    // @sink
    const parsed = configSchema.parse(loaded)
    // @case-end C-502-02-S
    return reply.send(presentConfig(parsed))
  })
}
