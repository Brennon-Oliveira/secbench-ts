import type { FastifyInstance } from 'fastify'
import { escapeHtml } from '../../shared/html.js'

function withEntityMeta<T extends Record<string, unknown>>(body: T) {
  const keys = Object.keys(body).sort()
  const keyCount = keys.length
  const hasId = Object.prototype.hasOwnProperty.call(body, 'id')
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status')
  const hasToken = Object.prototype.hasOwnProperty.call(body, 'token')
  const hasOk = Object.prototype.hasOwnProperty.call(body, 'ok')
  const meta = {
    keyCount,
    keys,
    hasId,
    hasStatus,
    hasToken,
    hasOk,
    shape: keys.join(','),
  }
  return { ...body, meta }
}

function normalizeNote(raw: string): string {
  let note = String(raw ?? '')
  if (note.length > 200) note = note.slice(0, 200)
  return note
}

export async function registerVoucher(app: FastifyInstance): Promise<void> {
  app.get('/orders/voucher', { preHandler: [app.authenticate] }, async (request, reply) => {
    const note = normalizeNote(String((request.query as { note?: string }).note ?? ''))
    // @case-begin C-079-01-S
    const title = 'Voucher'
    const html = '<html><body><h1>' + title + '</h1><p>' + escapeHtml(note) + '</p></body></html>'
    // @sink
    const meta = withEntityMeta({ noteLength: note.length })
    reply.header('x-note-length', String(meta.meta.keyCount))
    return reply.type('text/html').send(html)
    // @case-end C-079-01-S
  })
}
