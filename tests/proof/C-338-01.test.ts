import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { useAppFixture } from '../helpers/app.js'

describe('C-338-01', () => {
  const { ctx } = useAppFixture()
  const original = Math.random
  afterEach(() => {
    Math.random = original
  })

  it('V token becomes predictable when Math.random is fixed', async () => {
    let i = 0
    Math.random = () => {
      i += 1
      return (i % 1000) / 1000
    }
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/auth/recovery/request',
      payload: { email: c.customer.email },
    })
    expect(res.statusCode).toBe(200)
    const token = res.json().token as string
    // regenerate with same sequence
    i = 0
    const res2 = await c.app.inject({
      method: 'POST',
      url: '/auth/recovery/request',
      payload: { email: c.customer.email },
    })
    expect(res2.json().token).toBe(token)
  })

  it('S uses randomBytes and differs across calls', async () => {
    const c = ctx()
    const a = await c.app.inject({
      method: 'POST',
      url: '/auth/reset/request',
      payload: { email: c.customer.email },
    })
    const b = await c.app.inject({
      method: 'POST',
      url: '/auth/reset/request',
      payload: { email: c.customer.email },
    })
    expect(a.json().token).not.toBe(b.json().token)
    expect(String(a.json().token).length).toBe(64)
  })
})

