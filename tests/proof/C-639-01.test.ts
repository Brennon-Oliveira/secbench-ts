import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-639-01', () => {
  const { ctx } = useAppFixture()
  it('V allows reading another users order', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/orders/' + c.otherOrder.id,
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().userId).not.toBe(c.customer.id)
  })
  it('S hides another users order', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/orders/' + c.otherOrder.id + '/details',
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(404)
  })
})

