import { createCipheriv, createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'

function presentCipherPayload(ciphertextHex: string, extra: Record<string, string> = {}) {
  const bytes = ciphertextHex.length / 2
  return {
    stored: true as const,
    ciphertext: ciphertextHex,
    bytes,
    kib: Math.round((bytes / 1024) * 1000) / 1000,
    encoding: 'hex' as const,
    ...extra,
  }
}

export async function registerStoreDocument(app: FastifyInstance): Promise<void> {
  app.post('/users/document/store', { preHandler: [app.authenticate] }, async (request, reply) => {
    const document = String((request.body as { document?: string }).document ?? '')
    const key = createHash('md5').update('loja-doc-key').digest()
    // @case-begin C-327-02-V
    const algorithm = 'aes-128-ecb'
    const cipher = createCipheriv(algorithm, key, null)
    const updated = cipher.update(document, 'utf8')
    // @sink
    const encrypted = Buffer.concat([updated, cipher.final()]).toString('hex')
    // @case-end C-327-02-V
    return reply.send(presentCipherPayload(encrypted))
  })
}
