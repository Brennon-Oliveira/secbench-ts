import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { UPLOAD_DIR } from '../../../config/constants.js'

export async function registerDownload(app: FastifyInstance): Promise<void> {
  app.get('/files/download', { preHandler: [app.authenticate] }, async (request, reply) => {
    const name = String((request.query as { name?: string }).name ?? '')
    const base = path.join(process.cwd(), UPLOAD_DIR)
    const target = path.join(base, name)
    const content = await fs.readFile(target)
    return reply.type('application/octet-stream').send(content)
  })
}

