import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-306-01', () => {
  const { ctx } = useAppFixture()
  it('V accepts purge without token', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/system/maintenance/purge',
    })
    expect(res.statusCode).toBe(200)
    expect(typeof res.json().removed).toBe('number')
  })
  it('S rejects cleanup without token', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/system/maintenance/cleanup',
    })
    expect(res.statusCode).toBe(401)
  })
  it('S accepts cleanup for admin', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/system/maintenance/cleanup',
      headers: auth(c.adminToken),
    })
    expect(res.statusCode).toBe(200)
  })
})

