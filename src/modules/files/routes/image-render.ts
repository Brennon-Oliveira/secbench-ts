import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

function assertAllowedUrl(raw: string, allowedHosts: string[]): URL {
  const url = new URL(raw)
  if (url.protocol !== 'https:') throw new Error('protocol')
  if (!allowedHosts.includes(url.hostname)) throw new Error('host')
  if (['127.0.0.1', 'localhost', '0.0.0.0', '::1'].includes(url.hostname)) throw new Error('loopback')
  return url
}

export async function registerImageRender(app: FastifyInstance): Promise<void> {
  app.get('/images/render', { preHandler: [app.authenticate] }, async (request, reply) => {
    const src = String((request.query as { src?: string }).src ?? '')
    const env = loadEnv()
    // @case-begin C-918-02-S
    let url: URL
    try {
      url = assertAllowedUrl(src, env.allowedFeedHosts)
    } catch {
      return reply.code(400).send({ error: 'url rejected' })
    }
    // @sink
    const res = await fetch(url, { redirect: 'error' })
    // @case-end C-918-02-S
    const buf = Buffer.from(await res.arrayBuffer())
    return reply.type(res.headers.get('content-type') ?? 'application/octet-stream').send(buf)
  })
}
