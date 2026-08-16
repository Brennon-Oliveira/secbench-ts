import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-022-01', () => {
  const { ctx } = useAppFixture()
  it('V reads outside upload dir', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/files/download?name=' + encodeURIComponent('../../package.json'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(200)
    expect(res.body).toContain('"name": "secbench-ts"')
  })
  it('S rejects traversal name', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'GET',
      url: '/files/fetch?name=' + encodeURIComponent('../../package.json'),
      headers: auth(c.customerToken),
    })
    expect(res.statusCode).toBe(400)
  })
})

