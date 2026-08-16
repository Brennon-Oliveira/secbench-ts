import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { REPORTS_DIR } from '../../../config/constants.js'

const execAsync = promisify(exec)

export async function registerConvertReport(app: FastifyInstance): Promise<void> {
  app.post('/reports/convert', { preHandler: [app.authenticate] }, async (request, reply) => {
    const fileName = String((request.body as { fileName?: string }).fileName ?? '')
    const dir = path.join(process.cwd(), REPORTS_DIR)
    const out = path.join(dir, 'out-' + fileName)
    // @case-begin C-078-01-V
    const cmd = 'cp ' + path.join(dir, fileName) + ' ' + out
    // @sink
    await execAsync(cmd)
    // @case-end C-078-01-V
    return reply.send({ output: out })
  })
}
