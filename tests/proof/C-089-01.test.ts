import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-089-01', () => {
  const { ctx } = useAppFixture()
  it('V yields rows beyond the caller scope for crafted status', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: "/orders/search?status=' OR '1'='1",
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().orders.length).toBeGreaterThan(1)
  })
  it('S rejects crafted status', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: "/orders/filter?status=' OR '1'='1",
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(400)
  })
})

