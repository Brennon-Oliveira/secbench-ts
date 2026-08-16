import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { buildApp } from '../../src/app.js'
import { User } from '../../src/db/models/user.js'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

describe('C-798-02', () => {
  const prev = process.env.JWT_SECRET
  afterEach(() => {
    if (prev === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = prev
  })

  it('V issues token with default secret when env absent', async () => {
    delete process.env.JWT_SECRET
    const sqlitePath = path.join(os.tmpdir(), `secbench-798-${Date.now()}.sqlite`)
    const app = await buildApp({ sqlitePath, jwtSecret: undefined as unknown as string })
    // force undefined secret path: clear after buildApp may have set it
    delete process.env.JWT_SECRET
    const user = await User.findOne()
    const res = await app.inject({
      method: 'POST',
      url: '/auth/token',
      payload: { email: user!.email },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().token).toBeTruthy()
    await app.close()
    try { fs.unlinkSync(sqlitePath) } catch { /* */ }
  })

  it('S fails when secret absent', async () => {
    delete process.env.JWT_SECRET
    const sqlitePath = path.join(os.tmpdir(), `secbench-798s-${Date.now()}.sqlite`)
    const app = await buildApp({ sqlitePath })
    delete process.env.JWT_SECRET
    const user = await User.findOne()
    const res = await app.inject({
      method: 'POST',
      url: '/auth/session',
      payload: { email: user!.email },
    })
    expect(res.statusCode).toBe(500)
    await app.close()
    try { fs.unlinkSync(sqlitePath) } catch { /* */ }
  })
})

