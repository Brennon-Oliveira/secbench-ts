export type AppEnv = {
  nodeEnv: string
  port: number
  jwtSecret: string | undefined
  documentKey: string | undefined
  allowedFeedHosts: string[]
  allowedDiagnosticHosts: string[]
  sqlitePath: string
  logLevel: string
  integrationApiKey: string | undefined
}

export function loadEnv(overrides: Partial<Record<string, string>> = {}): AppEnv {
  const get = (key: string) => overrides[key] ?? process.env[key]

  return {
    nodeEnv: get('NODE_ENV') ?? 'development',
    port: Number(get('PORT') ?? 3000),
    jwtSecret: get('JWT_SECRET') || undefined,
    documentKey: get('DOCUMENT_KEY') || undefined,
    allowedFeedHosts: (get('ALLOWED_FEED_HOSTS') ?? 'cdn.exemplo.invalido,files.exemplo.invalido')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    allowedDiagnosticHosts: (
      get('ALLOWED_DIAGNOSTIC_HOSTS') ?? 'localhost,127.0.0.1,exemplo.invalido'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    sqlitePath: get('SQLITE_PATH') ?? './data/loja.sqlite',
    logLevel: get('LOG_LEVEL') ?? 'info',
    integrationApiKey: get('INTEGRATION_API_KEY') || undefined,
  }
}

