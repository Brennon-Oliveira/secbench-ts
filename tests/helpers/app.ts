import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app.js'
import { clearTestLogBuffer, testLogBuffer } from '../../src/plugins/logger.js'
import { User } from '../../src/db/models/user.js'
import { Order } from '../../src/db/models/order.js'
import { signToken } from '../../src/plugins/auth.js'

export type TestCtx = {
  app: FastifyInstance
  customerToken: string
  adminToken: string
  customer: User
  admin: User
  customerOrder: Order
  otherOrder: Order
  sqlitePath: string
}

export async function createTestApp(): Promise<TestCtx> {
  clearTestLogBuffer()
  const sqlitePath = path.join(os.tmpdir(), `secbench-${process.pid}-${Date.now()}.sqlite`)
  const jwtSecret = 'test-jwt-secret-value'
  const app = await buildApp({
    sqlitePath,
    captureLogs: true,
    jwtSecret,
    documentKey: '0123456789abcdef0123456789abcdef',
    integrationApiKey: 'test-integration-key',
  })

  const admin = (await User.findOne({ where: { role: 'admin' } }))!
  const customer = (await User.findOne({ where: { role: 'customer' } }))!
  const customerOrder = (await Order.findOne({ where: { userId: customer.id } }))!
  const otherOrder = (await Order.findOne({
    where: { userId: admin.id },
  }))!

  return {
    app,
    sqlitePath,
    admin,
    customer,
    customerOrder,
    otherOrder,
    customerToken: signToken(
      { id: customer.id, email: customer.email, role: customer.role },
      jwtSecret,
    ),
    adminToken: signToken({ id: admin.id, email: admin.email, role: admin.role }, jwtSecret),
  }
}

export function auth(token: string) {
  return { authorization: `Bearer ${token}` }
}

export { clearTestLogBuffer }

export function logs(): string {
  return testLogBuffer.lines.join('\n')
}

export function useAppFixture(): { ctx: () => TestCtx } {
  let ctx: TestCtx | undefined
  beforeAll(async () => {
    ctx = await createTestApp()
  })
  afterAll(async () => {
    if (!ctx) return
    await ctx.app.close()
    try {
      fs.unlinkSync(ctx.sqlitePath)
    } catch {
      /* ignore */
    }
  })
  return {
    ctx: () => {
      if (!ctx) throw new Error('test app not ready')
      return ctx
    },
  }
}
