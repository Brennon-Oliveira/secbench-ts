import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const prefsSchema = z.object({
  theme: z.string().optional(),
  locale: z.string().optional(),
  notify: z.boolean().optional(),
}).strict()

function presentPreferences(prefs: unknown) {
  const keys =
    prefs && typeof prefs === 'object' && !Array.isArray(prefs)
      ? Object.keys(prefs as Record<string, unknown>).sort()
      : []
  return {
    applied: true as const,
    preferences: prefs,
    meta: {
      keyCount: keys.length,
      keys: keys.slice(0, 20),
      kind: prefs === null ? 'null' : Array.isArray(prefs) ? 'array' : typeof prefs,
    },
  }
}

export async function registerLoadPreferences(app: FastifyInstance): Promise<void> {
  app.post('/preferences/load', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = String((request.body as { data?: string }).data ?? '')
    const decoded = Buffer.from(data, 'base64').toString('utf8')
    // @case-begin C-502-01-S
    const parsedJson = JSON.parse(decoded)
    // @sink
    const prefs = prefsSchema.parse(parsedJson)
    // @case-end C-502-01-S
    return reply.send(presentPreferences(prefs))
  })
}
