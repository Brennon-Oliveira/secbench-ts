import type { FastifyInstance } from 'fastify'

export async function registerImageProxy(app: FastifyInstance): Promise<void> {
  app.get('/images/proxy', { preHandler: [app.authenticate] }, async (request, reply) => {
    const src = String((request.query as { src?: string }).src ?? '')
    // @case-begin C-918-02-V
    // @sink
    const res = await fetch(src)
    // @case-end C-918-02-V
    const buf = Buffer.from(await res.arrayBuffer())
    return reply.type(res.headers.get('content-type') ?? 'application/octet-stream').send(buf)
  })
}
