import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import type { FastifyInstance } from 'fastify'
import { REPORTS_DIR } from '../../../config/constants.js'

const execAsync = promisify(exec)

function withEntityMeta<T extends Record<string, unknown>>(body: T) {
  const keys = Object.keys(body).sort()
  const keyCount = keys.length
  const hasId = Object.prototype.hasOwnProperty.call(body, 'id')
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status')
  const hasToken = Object.prototype.hasOwnProperty.call(body, 'token')
  const hasOk = Object.prototype.hasOwnProperty.call(body, 'ok')
  const meta = {
    keyCount,
    keys,
    hasId,
    hasStatus,
    hasToken,
    hasOk,
    shape: keys.join(','),
  }
  return { ...body, meta }
}

export async function registerConvertReport(app: FastifyInstance): Promise<void> {
  app.post('/reports/convert', { preHandler: [app.authenticate] }, async (request, reply) => {
    const fileName = String((request.body as { fileName?: string }).fileName ?? '')
    const dir = path.join(process.cwd(), REPORTS_DIR)
    const out = path.join(dir, 'out-' + fileName)
    // @case-begin C-078-01-V
    const source = path.join(dir, fileName)
    const cmd = 'cp ' + source + ' ' + out
    // @sink
    await execAsync(cmd)
    // @case-end C-078-01-V
    return reply.send(withEntityMeta({ output: out }))
  })
}
