import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'

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

export async function registerDiagnostics(app: FastifyInstance): Promise<void> {
  app.get('/system/diagnostics', { preHandler: [app.authenticate] }, async (request, reply) => {
    const host = String((request.query as { host?: string }).host ?? '')
    const prefix = 'echo reachability-check '
    const cmd = prefix + host
    const { stdout, stderr } = await execAsync(cmd)
    return reply.send(withEntityMeta({ output: stdout || stderr }))
  })
}

