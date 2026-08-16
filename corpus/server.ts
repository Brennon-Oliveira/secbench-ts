import { buildApp } from './app.js'
import { loadEnv } from './config/env.js'

async function main() {
  const env = loadEnv()
  const app = await buildApp({
    jwtSecret: env.jwtSecret ?? 'dev-secret-please-change',
    documentKey: env.documentKey ?? '0123456789abcdef0123456789abcdef',
    integrationApiKey: env.integrationApiKey ?? 'env-integration-key',
  })

  try {
    await app.listen({ port: env.port, host: '127.0.0.1' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()

