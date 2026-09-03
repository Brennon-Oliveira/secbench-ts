import type { FastifyInstance } from 'fastify'

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

export async function registerImageProxy(app: FastifyInstance): Promise<void> {
  app.get('/images/proxy', { preHandler: [app.authenticate] }, async (request, reply) => {
    const src = String((request.query as { src?: string }).src ?? '')
    const res = await fetch(src)
    const buf = Buffer.from(await res.arrayBuffer())
    const contentType = resolveImageType(res.headers.get('content-type'), buf)
    reply.header('x-image-bytes', String(buildImageMeta(buf, contentType).bytes))
    reply.header('x-image-kib', String(buildImageMeta(buf, contentType).kib))
    return reply.type(contentType).send(buf)
  })
}

