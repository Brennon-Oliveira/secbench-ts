import type { FastifyInstance } from 'fastify'
import { DEFAULT_REDIRECT } from '../../../config/constants.js'

function isRelativePath(next: string): boolean {
  if (!next.startsWith('/')) return false
  if (next.startsWith('//')) return false
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(next)) return false
  if (/[\x00-\x1f]/.test(next)) return false
  return true
}

export async function registerReturnPath(app: FastifyInstance): Promise<void> {
  app.get('/auth/return', async (request, reply) => {
    const next = String((request.query as { next?: string }).next ?? DEFAULT_REDIRECT)
    const target = isRelativePath(next) ? next : DEFAULT_REDIRECT
    return reply.redirect(target)
  })
}

