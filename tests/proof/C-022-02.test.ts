import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-022-02', () => {
  const { ctx } = useAppFixture()
  it('V follows override traversal', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/invoices/1/attachment?override=' + encodeURIComponent('../../package.json'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('"name": "secbench-ts"')
  })
  it('S ignores invalid override', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/invoices/1/document?override=' + encodeURIComponent('../../package.json'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('invoice')
  })
})
