import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-079-02', () => {
  const { ctx } = useAppFixture()
  const q = '"><img src=x onerror=1>'
  it('V breaks markup', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/orders/preview?q=' + encodeURIComponent(q),
      headers: auth(c.customerToken),
    })
    expect(res.body).toContain(q)
  })
  it('S escapes term', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/orders/summary?q=' + encodeURIComponent(q),
      headers: auth(c.customerToken),
    })
    expect(res.body).not.toContain(q)
    expect(res.body).toContain('&quot;')
  })
})

