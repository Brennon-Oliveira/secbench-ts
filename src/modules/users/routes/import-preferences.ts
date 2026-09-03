import type { FastifyInstance } from 'fastify'
import serialize from 'node-serialize'

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

export async function registerImportPreferences(app: FastifyInstance): Promise<void> {
  app.post('/preferences/import', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = String((request.body as { data?: string }).data ?? '')
    const decoded = Buffer.from(data, 'base64').toString('utf8')
    // @case-begin C-502-01-V
    const serialized = decoded
    // @sink
    const prefs = serialize.unserialize(serialized)
    // @case-end C-502-01-V
    return reply.send(presentPreferences(prefs))
  })
}
