import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'
import { escapeHtml } from '../../shared/html.js'

export async function registerSummary(app: FastifyInstance): Promise<void> {
  app.get('/orders/summary', { preHandler: [app.authenticate] }, async (request, reply) => {
    const q = String((request.query as { q?: string }).q ?? '')
    const count = await Order.count({ where: { userId: request.user!.id } })
    const html =
      '<div class="summary">Termo: <em class="' +
      escapeHtml(q) +
      '">' +
      escapeHtml(q) +
      '</em> (' +
      count +
      ')</div>'
    return reply.type('text/html').send(html)
  })
}

