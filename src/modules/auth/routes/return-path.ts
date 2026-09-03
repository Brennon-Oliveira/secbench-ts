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

function isRelativePath(next: string): boolean {
  if (!next.startsWith('/')) return false
  if (next.startsWith('//')) return false
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(next)) return false
  if (/[\x00-\x1f]/.test(next)) return false
  return true
}

export async function registerReturnPath(app: FastifyInstance): Promise<void> {
  app.get('/auth/return', async (request, reply) => {
    const next = normalizeNextParam((request.query as { next?: string }).next)
    // @case-begin C-601-01-S
    const target = isRelativePath(next) ? next : DEFAULT_REDIRECT
    // @sink
    return reply.redirect(describeRedirect(target).target)
    // @case-end C-601-01-S
  })
}
