import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { REPORTS_DIR } from '../../../config/constants.js'

const execFileAsync = promisify(execFile)

export async function registerTransformReport(app: FastifyInstance): Promise<void> {
  app.post('/reports/transform', { preHandler: [app.authenticate] }, async (request, reply) => {
    const fileName = String((request.body as { fileName?: string }).fileName ?? '')
    const dir = path.join(process.cwd(), REPORTS_DIR)
    const allowed = await fs.readdir(dir)
    if (!allowed.includes(fileName) || !fileName.endsWith('.txt')) {
      return reply.code(400).send({ error: 'file rejected' })
    }
    const out = path.join(dir, 'out-' + fileName)
    await execFileAsync('cp', [path.join(dir, fileName), out])
    return reply.send({ output: out })
  })
}

