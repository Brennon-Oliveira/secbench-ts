import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'

const execAsync = promisify(exec)

export async function registerDiagnostics(app: FastifyInstance): Promise<void> {
  app.get('/system/diagnostics', { preHandler: [app.authenticate] }, async (request, reply) => {
    const host = String((request.query as { host?: string }).host ?? '')
    const cmd = 'echo reachability-check ' + host
    const { stdout, stderr } = await execAsync(cmd)
    return reply.send({ output: stdout || stderr })
  })
}

