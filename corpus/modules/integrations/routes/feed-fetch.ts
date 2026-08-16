import type { FastifyInstance } from 'fastify'

export async function registerFeedFetch(app: FastifyInstance): Promise<void> {
  app.post('/integrations/feed/fetch', { preHandler: [app.authenticate] }, async (request, reply) => {
    const url = String((request.body as { url?: string }).url ?? '')
    const res = await fetch(url)
    const text = await res.text()
    return reply.send({ status: res.status, length: text.length, preview: text.slice(0, 120) })
  })
}

