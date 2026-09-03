import { randomUUID } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const errorHandlerPlugin: FastifyPluginAsync = async (app) => {
  app.setErrorHandler((error, request, reply) => {
    const correlationId = randomUUID()
    request.log.error({ err: error, correlationId }, 'request failed')
    if (reply.sent) return
    reply.code(500).send({
      error: 'internal error',
      correlationId,
    })
  })
}

export default fp(errorHandlerPlugin)

