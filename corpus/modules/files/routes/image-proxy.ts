import type { FastifyInstance } from 'fastify'

export async function registerImageProxy(app: FastifyInstance): Promise<void> {
  app.get('/images/proxy', { preHandler: [app.authenticate] }, async (request, reply) => {
    const src = String((request.query as { src?: string }).src ?? '')
    const res = await fetch(src)
    const buf = Buffer.from(await res.arrayBuffer())
    return reply.type(res.headers.get('content-type') ?? 'application/octet-stream').send(buf)
  })
}

