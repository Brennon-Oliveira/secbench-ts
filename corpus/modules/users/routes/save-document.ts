import { createCipheriv, randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

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

export async function registerSaveDocument(app: FastifyInstance): Promise<void> {
  app.post('/users/document/save', { preHandler: [app.authenticate] }, async (request, reply) => {
    const document = String((request.body as { document?: string }).document ?? '')
    const env = loadEnv()
    const keyMaterial = env.documentKey ?? '0123456789abcdef0123456789abcdef'
    const key = Buffer.from(keyMaterial).subarray(0, 32)
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(document, 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    return reply.send(
      presentCipherPayload(encrypted.toString('hex'), {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      }),
    )
  })
}

