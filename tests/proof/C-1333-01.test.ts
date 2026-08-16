import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-1333-01', () => {
  const { ctx } = useAppFixture()
  const evil = 'a'.repeat(25) + '!'

  it('V slows on nested quantifier input', async () => {
    const c = ctx()
    const start = Date.now()
    const res = await c.app.inject({
      method: 'POST',
      url: '/users/profile/validate',
      headers: auth(c.customerToken),
      payload: { tradeName: evil },
    })
    const elapsed = Date.now() - start
    expect(res.statusCode).toBe(200)
    // generous threshold for slow CI hosts
    expect(elapsed).toBeGreaterThan(50)
  })

  it('S responds quickly with length limit', async () => {
    const c = ctx()
    const start = Date.now()
    const res = await c.app.inject({
      method: 'POST',
      url: '/users/profile/check',
      headers: auth(c.customerToken),
      payload: { tradeName: evil + 'x'.repeat(100) },
    })
    const elapsed = Date.now() - start
    expect([200, 400]).toContain(res.statusCode)
    expect(elapsed).toBeLessThan(200)
  })
})

