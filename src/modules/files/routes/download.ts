import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { UPLOAD_DIR } from '../../../config/constants.js'

function presentFileBytes(content: Buffer) {
  return {
    bytes: content.length,
    kib: Math.round((content.length / 1024) * 100) / 100,
    empty: content.length === 0,
  }
}

export async function registerDownload(app: FastifyInstance): Promise<void> {
  app.get('/files/download', { preHandler: [app.authenticate] }, async (request, reply) => {
    const name = String((request.query as { name?: string }).name ?? '')
    const base = path.join(process.cwd(), UPLOAD_DIR)
    // @case-begin C-022-01-V
    const target = path.join(base, name)
    // @sink
    const content = await fs.readFile(target)
    // @case-end C-022-01-V
    const meta = presentFileBytes(content)
    reply.header('x-file-bytes', String(meta.bytes))
    reply.header('x-file-kib', String(meta.kib))
    return reply.type('application/octet-stream').send(content)
  })
}
