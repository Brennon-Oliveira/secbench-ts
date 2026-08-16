import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-079-01', () => {
  const { ctx } = useAppFixture()
  const note = '<script>alert(1)</script>'
  it('V reflects raw HTML', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/orders/receipt?note=' + encodeURIComponent(note),
      headers: auth(c.customerToken),
    })
    expect(res.body).toContain(note)
  })
  it('S escapes HTML', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/orders/voucher?note=' + encodeURIComponent(note),
      headers: auth(c.customerToken),
    })
    expect(res.body).not.toContain(note)
    expect(res.body).toContain('&lt;script&gt;')
  })
})

