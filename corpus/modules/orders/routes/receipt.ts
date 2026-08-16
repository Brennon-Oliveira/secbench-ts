import type { FastifyInstance } from 'fastify'

export async function registerReceipt(app: FastifyInstance): Promise<void> {
  app.get('/orders/receipt', { preHandler: [app.authenticate] }, async (request, reply) => {
    const note = String((request.query as { note?: string }).note ?? '')
    const html = '<html><body><h1>Recibo</h1><p>' + note + '</p></body></html>'
    return reply.type('text/html').send(html)
  })
}

