import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-918-01', () => {
  const { ctx } = useAppFixture()
  it('V fetches loopback health URL', async () => {
    const c = ctx()
    await c.app.listen({ port: 0, host: '127.0.0.1' })
    const addr = c.app.server.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/feed/fetch',
      headers: auth(c.customerToken),
      payload: { url: 'http://127.0.0.1:' + port + '/system/health' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().preview).toContain('ok')
  })
  it('S rejects loopback URL', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/feed/import',
      headers: auth(c.customerToken),
      payload: { url: 'http://127.0.0.1:9/system/health' },
    })
    expect(res.statusCode).toBe(400)
  })
})

