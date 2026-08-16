import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-089-02', () => {
  const { ctx } = useAppFixture()
  it('V exposes password hashes via union', async () => {
    const c = ctx()
    const payload = "x' UNION SELECT id, email, passwordHash FROM Users --"
    const res = await c.app.inject({
      method: 'GET',
      url: '/users/lookup?email=' + encodeURIComponent(payload),
      headers: auth(c.adminToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatch(/[a-f0-9]{32,}/i)
  })
  it('S rejects crafted email', async () => {
    const c = ctx()
    const payload = "x' UNION SELECT id, email, passwordHash FROM Users --"
    const res = await c.app.inject({
      method: 'GET',
      url: '/users/find?email=' + encodeURIComponent(payload),
      headers: auth(c.adminToken),
    })
    expect(res.statusCode).toBe(400)
  })
})

