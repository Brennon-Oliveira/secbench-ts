import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

const execFileAsync = promisify(execFile)

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
const HOST_RE = /^[a-zA-Z0-9.-]+$/

export async function registerConnectivity(app: FastifyInstance): Promise<void> {
  app.get('/system/connectivity', { preHandler: [app.authenticate] }, async (request, reply) => {
    const host = String((request.query as { host?: string }).host ?? '')
    const env = loadEnv()
    if (!HOST_RE.test(host) || !env.allowedDiagnosticHosts.includes(host)) {
      return reply.code(400).send({ error: 'host rejected' })
    }
    // @case-begin C-078-02-S
    // @sink
    const { stdout, stderr } = await execFileAsync('echo', ['reachability-check', host])
    // @case-end C-078-02-S
    return reply.send(withEntityMeta({ output: stdout || stderr }))
  })
}
