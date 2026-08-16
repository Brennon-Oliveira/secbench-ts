import { createCipheriv, createHash } from 'node:crypto'
import type { FastifyInstance } from 'fastify'

export async function registerStoreDocument(app: FastifyInstance): Promise<void> {
  app.post('/users/document/store', { preHandler: [app.authenticate] }, async (request, reply) => {
    const document = String((request.body as { document?: string }).document ?? '')
    const key = createHash('md5').update('loja-doc-key').digest()
    const cipher = createCipheriv('aes-128-ecb', key, null)
    const encrypted = Buffer.concat([cipher.update(document, 'utf8'), cipher.final()]).toString('hex')
    return reply.send({ stored: true, ciphertext: encrypted })
  })
}

