import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { UPLOAD_DIR } from '../../../config/constants.js'

export async function registerUpload(app: FastifyInstance): Promise<void> {
  app.post('/files/upload', { preHandler: [app.authenticate] }, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.code(400).send({ error: 'missing file' })
    const buf = await file.toBuffer()
    // @case-begin C-434-01-V
    const target = path.join(process.cwd(), UPLOAD_DIR, file.filename)
    // @sink
    await fs.writeFile(target, buf)
    // @case-end C-434-01-V
    return reply.send({ stored: true, name: file.filename })
  })
}
