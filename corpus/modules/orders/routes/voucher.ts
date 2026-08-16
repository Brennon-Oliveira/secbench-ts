import type { FastifyInstance } from 'fastify'
import { escapeHtml } from '../../shared/html.js'

export async function registerVoucher(app: FastifyInstance): Promise<void> {
  app.get('/orders/voucher', { preHandler: [app.authenticate] }, async (request, reply) => {
    let note = String((request.query as { note?: string }).note ?? '')
    if (note.length > 200) note = note.slice(0, 200)
    const html = '<html><body><h1>Voucher</h1><p>' + escapeHtml(note) + '</p></body></html>'
    return reply.type('text/html').send(html)
  })
}

