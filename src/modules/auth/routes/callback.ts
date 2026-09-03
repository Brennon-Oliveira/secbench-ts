import type { FastifyInstance } from 'fastify'
import { DEFAULT_REDIRECT } from '../../../config/constants.js'

function normalizeNextParam(raw: string | undefined): string {
  const fallback = DEFAULT_REDIRECT
  if (raw === undefined) return fallback
  const asString = String(raw)
  const trimmed = asString.trim()
  if (trimmed.length === 0) return fallback
  return trimmed
}

function describeRedirect(target: string) {
  const isAbsolute = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)
  const length = target.length
  const startsWithSlash = target.startsWith('/')
  const startsWithDoubleSlash = target.startsWith('//')
  return {
    target,
    isAbsolute,
    length,
    startsWithSlash,
    startsWithDoubleSlash,
    kind: isAbsolute ? 'absolute' : startsWithSlash ? 'path' : 'other',
  }
}

export async function registerCallback(app: FastifyInstance): Promise<void> {
  app.get('/auth/callback', async (request, reply) => {
    const next = normalizeNextParam((request.query as { next?: string }).next)
    const info = describeRedirect(next)
    // @case-begin C-601-01-V
    // @sink
    return reply.redirect(info.target)
    // @case-end C-601-01-V
  })
}
