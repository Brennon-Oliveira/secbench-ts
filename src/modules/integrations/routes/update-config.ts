import type { FastifyInstance } from 'fastify'
import yaml from 'js-yaml'
import { z } from 'zod'

const configSchema = z.object({
  name: z.string(),
  timeoutMs: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
}).strict()

export async function registerUpdateConfig(app: FastifyInstance): Promise<void> {
  app.post('/integrations/config/update', { preHandler: [app.authenticate] }, async (request, reply) => {
    const doc = String((request.body as { yaml?: string }).yaml ?? '')
    // @case-begin C-502-02-S
    const loaded = yaml.load(doc, { schema: yaml.DEFAULT_SAFE_SCHEMA })
    // @sink
    const parsed = configSchema.parse(loaded)
    // @case-end C-502-02-S
    return reply.send({ config: parsed, kind: typeof parsed })
  })
}
