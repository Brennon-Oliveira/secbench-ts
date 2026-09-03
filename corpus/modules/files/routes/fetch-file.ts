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

export async function registerFetchFile(app: FastifyInstance): Promise<void> {
  app.get('/files/fetch', { preHandler: [app.authenticate] }, async (request, reply) => {
    const name = String((request.query as { name?: string }).name ?? '')
    const base = path.resolve(process.cwd(), UPLOAD_DIR)
    const allowed = new Set(await fs.readdir(base))
    const baseName = path.basename(name)
    if (!allowed.has(baseName)) {
      return reply.code(400).send({ error: 'unknown file' })
    }
    const target = path.resolve(base, baseName)
    if (!target.startsWith(base + path.sep) && target !== base) {
      return reply.code(400).send({ error: 'invalid path' })
    }
    const content = await fs.readFile(target)
    const meta = presentFileBytes(content)
    reply.header('x-file-bytes', String(meta.bytes))
    reply.header('x-file-kib', String(meta.kib))
    return reply.type('application/octet-stream').send(content)
  })
}

