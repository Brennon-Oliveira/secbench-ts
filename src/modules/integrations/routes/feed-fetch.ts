import type { FastifyInstance } from 'fastify'

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

export async function registerFeedFetch(app: FastifyInstance): Promise<void> {
  app.post('/integrations/feed/fetch', { preHandler: [app.authenticate] }, async (request, reply) => {
    const url = String((request.body as { url?: string }).url ?? '')
    // @case-begin C-918-01-V
    // @sink
    const res = await fetch(url)
    // @case-end C-918-01-V
    const text = await res.text()
    return reply.send(buildFeedPayload(res.status, text))
  })
}
