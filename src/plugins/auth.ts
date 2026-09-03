import { createHmac, timingSafeEqual } from 'node:crypto'
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { loadEnv } from '../config/env.js'

export type AuthUser = {
  id: number
  email: string
  role: 'customer' | 'admin'
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const s = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(s, 'base64')
}

export function signToken(
  claims: AuthUser,
  secret: string,
  expiresInSec = 3600,
): string {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(
    JSON.stringify({ ...claims, exp: Math.floor(Date.now() / 1000) + expiresInSec }),
  )
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest()
  return `${header}.${body}.${b64url(sig)}`
}

export function verifyToken(token: string, secret: string): AuthUser | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts as [string, string, string]
  const expected = createHmac('sha256', secret).update(`${header}.${body}`).digest()
  const actual = fromB64url(sig)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null
  try {
    const parsed = JSON.parse(fromB64url(body).toString('utf8')) as AuthUser & {
      exp?: number
    }
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) return null
    return { id: parsed.id, email: parsed.email, role: parsed.role }
  } catch {
    return null
  }
}

export function resolveSigningSecret(): string {
  const env = loadEnv()
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required')
  }
  return env.jwtSecret
}

const authPlugin: FastifyPluginAsync = async (app) => {
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'authentication required' })
    }
    const token = header.slice('Bearer '.length)
    const secret = resolveSigningSecret()
    const user = verifyToken(token, secret)
    if (!user) {
      return reply.code(401).send({ error: 'invalid token' })
    }
    request.user = user
  })

  app.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    await app.authenticate(request, reply)
    if (reply.sent) return
    if (request.user?.role !== 'admin') {
      return reply.code(403).send({ error: 'forbidden' })
    }
  })
}

export default fp(authPlugin)
