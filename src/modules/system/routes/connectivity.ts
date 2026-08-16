import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

const execFileAsync = promisify(execFile)
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
    return reply.send({ output: stdout || stderr })
  })
}
