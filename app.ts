import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import authPlugin from './plugins/auth.js'
import loggerPlugin, { createTestLoggerDestination } from './plugins/logger.js'
import errorHandlerPlugin from './plugins/error-handler.js'
import { registerRoutes } from './routes.js'
import { resetSequelize } from './db/sequelize.js'
import { initDb } from './db/seed.js'
import { loadEnv } from './config/env.js'

export type BuildAppOptions = {
  sqlitePath?: string
  captureLogs?: boolean
  jwtSecret?: string
  documentKey?: string
  integrationApiKey?: string
}

export async function buildApp(options: BuildAppOptions = {}) {
  if (options.jwtSecret !== undefined) process.env.JWT_SECRET = options.jwtSecret
  if (options.documentKey !== undefined) process.env.DOCUMENT_KEY = options.documentKey
  if (options.integrationApiKey !== undefined) {
    process.env.INTEGRATION_API_KEY = options.integrationApiKey
  }

  resetSequelize()
  await initDb(options.sqlitePath)

  const loggerConfig = options.captureLogs
    ? {
        level: loadEnv().logLevel,
        stream: createTestLoggerDestination(),
      }
    : {
        level: loadEnv().logLevel,
      }

  const app = Fastify({ logger: loggerConfig })

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })
  await app.register(loggerPlugin)
  await app.register(errorHandlerPlugin)
  await app.register(authPlugin)
  await registerRoutes(app)

  return app
}

