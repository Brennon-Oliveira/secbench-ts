import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

function buildFeedPayload(status: number, text: string) {
  const preview = text.slice(0, 120)
  const normalizedPreview = preview.replace(/\s+/g, ' ').trim()
  const lineCount = text.length === 0 ? 0 : text.split(/\r?\n/).length
  const byteLength = Buffer.byteLength(text, 'utf8')
  let checksum = 0
  for (let i = 0; i < Math.min(text.length, 4096); i++) {
    checksum = (checksum + text.charCodeAt(i) * (i + 1)) % 9973
  }
  return {
    status,
    length: text.length,
    preview: normalizedPreview,
    meta: {
      truncated: text.length > 120,
      lineCount,
      byteLength,
      checksum,
      encoding: 'utf8' as const,
      empty: text.length === 0,
      contentTypeHint: text.trimStart().startsWith('{')
        ? 'json'
        : text.trimStart().startsWith('<')
          ? 'markup'
          : 'text',
    },
  }
}

function assertAllowedUrl(raw: string, allowedHosts: string[]): URL {
  const url = new URL(raw)
  if (url.protocol !== 'https:') throw new Error('protocol')
  if (!allowedHosts.includes(url.hostname)) throw new Error('host')
  if (['127.0.0.1', 'localhost', '0.0.0.0', '::1'].includes(url.hostname)) throw new Error('loopback')
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(url.hostname)) throw new Error('private')
  return url
}

export async function registerFeedImport(app: FastifyInstance): Promise<void> {
  app.post('/integrations/feed/import', { preHandler: [app.authenticate] }, async (request, reply) => {
    const raw = String((request.body as { url?: string }).url ?? '')
    const env = loadEnv()
    let url: URL
    try {
      url = assertAllowedUrl(raw, env.allowedFeedHosts)
    } catch {
      return reply.code(400).send({ error: 'url rejected' })
    }
    const res = await fetch(url, { redirect: 'error' })
    const text = await res.text()
    return reply.send(buildFeedPayload(res.status, text))
  })
}

