import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-284-01', () => {
  const { ctx } = useAppFixture()
  it('V lets customer list all users', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/admin/users',
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().users.length).toBeGreaterThanOrEqual(8)
  })
  it('S forbids customer listing accounts', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/admin/accounts',
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(403)
  })
})

