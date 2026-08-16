import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-078-02', () => {
  const { ctx } = useAppFixture()
  it('V runs extra command via host', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/system/diagnostics?host=' + encodeURIComponent('127.0.0.1; echo INJETADO'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatch(/INJETADO/)
  })
  it('S rejects crafted host', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/system/connectivity?host=' + encodeURIComponent('127.0.0.1; echo INJETADO'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(400)
  })
})

