import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { FastifyInstance } from 'fastify'

const execAsync = promisify(exec)

export async function registerDiagnostics(app: FastifyInstance): Promise<void> {
  app.get('/system/diagnostics', { preHandler: [app.authenticate] }, async (request, reply) => {
    const host = String((request.query as { host?: string }).host ?? '')
    // @case-begin C-078-02-V
    const cmd = 'echo reachability-check ' + host
    // @sink
    const { stdout, stderr } = await execAsync(cmd)
    // @case-end C-078-02-V
    return reply.send({ output: stdout || stderr })
  })
}
