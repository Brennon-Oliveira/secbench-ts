import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-209-01', () => {
  const { ctx } = useAppFixture()
  it('V returns stack with file paths', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/system/report?id=999999',
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(500)
    expect(res.json().stack || res.json().message).toMatch(/\//)
  })
  it('S returns generic error', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/system/status?id=999999',
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(500)
    expect(res.json().stack).toBeUndefined()
    expect(res.json().correlationId).toBeTruthy()
  })
})

