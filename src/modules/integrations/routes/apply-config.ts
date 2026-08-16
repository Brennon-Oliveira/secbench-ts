import type { FastifyInstance } from 'fastify'
import yaml from 'js-yaml'

export async function registerApplyConfig(app: FastifyInstance): Promise<void> {
  app.post('/integrations/config/apply', { preHandler: [app.authenticate] }, async (request, reply) => {
    const doc = String((request.body as { yaml?: string }).yaml ?? '')
    // @case-begin C-502-02-V
    // @sink
    const parsed = yaml.load(doc, { schema: yaml.DEFAULT_FULL_SCHEMA })
    // @case-end C-502-02-V
    return reply.send({ config: parsed, kind: typeof parsed })
  })
}
