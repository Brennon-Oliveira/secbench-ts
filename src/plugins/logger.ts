import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

export type LogBuffer = { lines: string[] }

export const testLogBuffer: LogBuffer = { lines: [] }

export function clearTestLogBuffer(): void {
  testLogBuffer.lines = []
}

const loggerPlugin: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', async () => {})
}

export function createTestLoggerDestination() {
  return {
    write(msg: string) {
      testLogBuffer.lines.push(msg)
      process.stdout.write(msg)
    },
  }
}

export default fp(loggerPlugin)
