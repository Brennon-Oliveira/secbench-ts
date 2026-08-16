import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-918-02', () => {
  const { ctx } = useAppFixture()
  it('V proxies loopback URL', async () => {
    const c = ctx()
    await c.app.listen({ port: 0, host: '127.0.0.1' })
    const addr = c.app.server.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    const res = await c.app.inject({
      method: 'GET',
      url: '/images/proxy?src=' + encodeURIComponent('http://127.0.0.1:' + port + '/system/health'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('ok')
  })
  it('S rejects loopback image URL', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/images/render?src=' + encodeURIComponent('http://127.0.0.1:9/system/health'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(400)
  })
})

