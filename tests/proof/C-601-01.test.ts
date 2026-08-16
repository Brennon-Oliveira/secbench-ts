import { describe, expect, it } from 'vitest'
import { useAppFixture } from '../helpers/app.js'

describe('C-601-01', () => {
  const { ctx } = useAppFixture()
  it('V redirects to external URL', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/auth/callback?next=' + encodeURIComponent('https://exemplo.invalido/'),
    })
    expect(res.statusCode).toBeGreaterThanOrEqual(300)
    expect(res.statusCode).toBeLessThan(400)
    expect(res.headers.location).toBe('https://exemplo.invalido/')
  })
  it('S falls back for external URL', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/auth/return?next=' + encodeURIComponent('https://exemplo.invalido/'),
    })
    expect(res.headers.location).toBe('/orders')
  })
})

