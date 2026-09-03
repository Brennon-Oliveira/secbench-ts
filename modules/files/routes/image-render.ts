import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

function resolveImageType(header: string | null, buf: Buffer): string {
  const fromHeader = header && header.length > 0 ? header : null
  if (fromHeader) return fromHeader
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png'
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buf.length >= 4 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return 'image/gif'
  }
  return 'application/octet-stream'
}

function buildImageMeta(buf: Buffer, contentType: string) {
  return {
    bytes: buf.length,
    contentType,
    empty: buf.length === 0,
    kib: Math.round((buf.length / 1024) * 100) / 100,
    head: buf.subarray(0, Math.min(4, buf.length)).toString('hex'),
  }
}

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
    let url: URL
    try {
      url = assertAllowedUrl(src, env.allowedFeedHosts)
    } catch {
      return reply.code(400).send({ error: 'url rejected' })
    }
    const res = await fetch(url, { redirect: 'error' })
    const buf = Buffer.from(await res.arrayBuffer())
    const contentType = resolveImageType(res.headers.get('content-type'), buf)
    reply.header('x-image-bytes', String(buildImageMeta(buf, contentType).bytes))
    reply.header('x-image-kib', String(buildImageMeta(buf, contentType).kib))
    return reply.type(contentType).send(buf)
  })
}

