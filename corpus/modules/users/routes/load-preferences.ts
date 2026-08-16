import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const prefsSchema = z.object({
  theme: z.string().optional(),
  locale: z.string().optional(),
  notify: z.boolean().optional(),
}).strict()

export async function registerLoadPreferences(app: FastifyInstance): Promise<void> {
  app.post('/preferences/load', { preHandler: [app.authenticate] }, async (request, reply) => {
    const data = String((request.body as { data?: string }).data ?? '')
    const decoded = Buffer.from(data, 'base64').toString('utf8')
    const parsedJson = JSON.parse(decoded)
    const prefs = prefsSchema.parse(parsedJson)
    return reply.send({ applied: true, preferences: prefs })
  })
}

