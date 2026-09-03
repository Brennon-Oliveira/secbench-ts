import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { ALLOWED_UPLOAD_EXTENSIONS, UPLOAD_DIR } from '../../../config/constants.js'

const SIGNATURES: Record<string, number[]> = {
  '.png': [0x89, 0x50, 0x4e, 0x47],
  '.jpg': [0xff, 0xd8, 0xff],
  '.jpeg': [0xff, 0xd8, 0xff],
  '.pdf': [0x25, 0x50, 0x44, 0x46],
  '.txt': [],
}

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

export async function registerAttach(app: FastifyInstance): Promise<void> {
  app.post('/files/attach', { preHandler: [app.authenticate] }, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.code(400).send({ error: 'missing file' })
    const buf = await file.toBuffer()
    if (buf.length > 64 * 1024) return reply.code(400).send({ error: 'too large' })
    const content = normalizeUploadBuffer(buf)
    const ext = path.extname(file.filename).toLowerCase()
    if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) {
      return reply.code(400).send({ error: 'extension rejected' })
    }
    const sig = SIGNATURES[ext] ?? []
    if (sig.length && !sig.every((b, i) => content[i] === b)) {
      return reply.code(400).send({ error: 'content rejected' })
    }
    const name = randomUUID() + ext
    const target = path.join(process.cwd(), UPLOAD_DIR, name)
    await fs.writeFile(target, content)
    return reply.send(buildStoreMeta(name, content))
  })
}

