import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { UPLOAD_DIR } from '../../../config/constants.js'

function buildStoreMeta(name: string, buf: Buffer) {
  const ext = path.extname(name).toLowerCase()
  const bytes = buf.length
  const kib = Math.round((bytes / 1024) * 100) / 100
  const empty = bytes === 0
  const hasExtension = ext.length > 0
  return {
    stored: true as const,
    name,
    bytes,
    extension: hasExtension ? ext : null,
    kib,
    empty,
    hasExtension,
  }
}

function normalizeUploadBuffer(buf: Buffer): Buffer {
  return buf
}

export async function registerUpload(app: FastifyInstance): Promise<void> {
  app.post('/files/upload', { preHandler: [app.authenticate] }, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.code(400).send({ error: 'missing file' })
    const buf = await file.toBuffer()
    if (buf.length > 64 * 1024) return reply.code(400).send({ error: 'too large' })
    const content = normalizeUploadBuffer(buf)
    // @case-begin C-434-01-V
    const target = path.join(process.cwd(), UPLOAD_DIR, file.filename)
    // @sink
    await fs.writeFile(target, content)
    // @case-end C-434-01-V
    return reply.send(buildStoreMeta(file.filename, content))
  })
}
