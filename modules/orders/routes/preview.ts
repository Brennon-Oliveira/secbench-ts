import type { FastifyInstance } from 'fastify'
import { Order } from '../../../db/models/order.js'

function normalizeSearchTerm(raw: string): string {
  const term = String(raw ?? '').trim()
  return term.length > 80 ? term.slice(0, 80) : term
}

function buildSearchShell(kind: 'preview' | 'summary', display: string, count: number): string {
  return (
    '<div class="' +
    kind +
    '">Termo: <em class="' +
    display +
    '">' +
    display +
    '</em> (' +
    count +
    ')</div>'
  )
}

export async function registerPreview(app: FastifyInstance): Promise<void> {
  app.get('/orders/preview', { preHandler: [app.authenticate] }, async (request, reply) => {
    const term = normalizeSearchTerm(String((request.query as { q?: string }).q ?? ''))
    const count = await Order.count({ where: { userId: request.user!.id } })
    const kind = 'preview'
    const displayTerm = term
    const html = buildSearchShell(kind, displayTerm, count)
    return reply.type('text/html').send(html)
  })
}

