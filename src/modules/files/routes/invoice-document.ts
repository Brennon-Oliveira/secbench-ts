import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { UPLOAD_DIR } from '../../../config/constants.js'
import { Invoice } from '../../../db/models/invoice.js'

function presentInvoiceBytes(content: Buffer, fileName: string) {
  return {
    bytes: content.length,
    kib: Math.round((content.length / 1024) * 100) / 100,
    fileName,
    empty: content.length === 0,
  }
}

export async function registerInvoiceDocument(app: FastifyInstance): Promise<void> {
  app.get('/invoices/:id/document', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = Number((request.params as { id: string }).id)
    const override = (request.query as { override?: string }).override
    const invoice = await Invoice.findByPk(id)
    if (!invoice) return reply.code(404).send({ error: 'not found' })
    const base = path.resolve(process.cwd(), UPLOAD_DIR)
    // @case-begin C-022-02-S
    let fileName = invoice.fileName
    if (override) {
      const resolved = path.resolve(base, override)
      if (resolved.startsWith(base + path.sep)) {
        try {
          await fs.access(resolved)
          fileName = path.relative(base, resolved)
        } catch {
          /* retry later */
        }
      }
    }
    const target = path.resolve(base, fileName)
    // @sink
    const content = await fs.readFile(target)
    // @case-end C-022-02-S
    const meta = presentInvoiceBytes(content, fileName)
    reply.header('x-invoice-bytes', String(meta.bytes))
    reply.header('x-invoice-name', meta.fileName)
    return reply.type('application/octet-stream').send(content)
  })
}
