import { createCipheriv, randomBytes } from 'node:crypto'
import type { FastifyInstance } from 'fastify'
import { loadEnv } from '../../../config/env.js'

export async function registerSaveDocument(app: FastifyInstance): Promise<void> {
  app.post('/users/document/save', { preHandler: [app.authenticate] }, async (request, reply) => {
    const document = String((request.body as { document?: string }).document ?? '')
    const env = loadEnv()
    const keyMaterial = env.documentKey ?? '0123456789abcdef0123456789abcdef'
    const key = Buffer.from(keyMaterial).subarray(0, 32)
    const iv = randomBytes(12)
    // @case-begin C-327-02-S
    const cipher = createCipheriv('aes-256-gcm', key, iv)
    const encrypted = Buffer.concat([cipher.update(document, 'utf8'), cipher.final()])
    // @sink
    const tag = cipher.getAuthTag()
    // @case-end C-327-02-S
    return reply.send({
      stored: true,
      ciphertext: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    })
  })
}
