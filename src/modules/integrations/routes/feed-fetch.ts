import type { FastifyInstance } from 'fastify'

export async function registerFeedFetch(app: FastifyInstance): Promise<void> {
  app.post('/integrations/feed/fetch', { preHandler: [app.authenticate] }, async (request, reply) => {
    const url = String((request.body as { url?: string }).url ?? '')
    // @case-begin C-918-01-V
    // @sink
    const res = await fetch(url)
    // @case-end C-918-01-V
    const text = await res.text()
    return reply.send({ status: res.status, length: text.length, preview: text.slice(0, 120) })
  })
}
