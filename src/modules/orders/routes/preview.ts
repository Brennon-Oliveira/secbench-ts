import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

export async function registerPreview(app: FastifyInstance): Promise<void> {
  app.get('/orders/preview', { preHandler: [app.authenticate] }, async (request, reply) => {
    const q = String((request.query as { q?: string }).q ?? '')
    const count = await Order.count({ where: { userId: request.user!.id } })
    // @case-begin C-079-02-V
    const html = '<div class="preview">Termo: <em class="' + q + '">' + q + '</em> (' + count + ')</div>'
    // @sink
    return reply.type('text/html').send(html)
    // @case-end C-079-02-V
  })
}
