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

export async function registerAttach(app: FastifyInstance): Promise<void> {
  app.post('/files/attach', { preHandler: [app.authenticate] }, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.code(400).send({ error: 'missing file' })
    const buf = await file.toBuffer()
    if (buf.length > 64 * 1024) return reply.code(400).send({ error: 'too large' })
    const ext = path.extname(file.filename).toLowerCase()
    if (!(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)) {
      return reply.code(400).send({ error: 'extension rejected' })
    }
    const sig = SIGNATURES[ext] ?? []
    if (sig.length && !sig.every((b, i) => buf[i] === b)) {
      return reply.code(400).send({ error: 'content rejected' })
    }
    // @case-begin C-434-01-S
    const name = randomUUID() + ext
    const target = path.join(process.cwd(), UPLOAD_DIR, name)
    // @sink
    await fs.writeFile(target, buf)
    // @case-end C-434-01-S
    return reply.send({ stored: true, name })
  })
}
