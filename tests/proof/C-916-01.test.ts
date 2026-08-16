import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-916-01', () => {
  const { ctx } = useAppFixture()
  it('V reports low iteration PBKDF2 params', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/auth/password/rotate',
      headers: auth(c.customerToken),
      payload: { password: 'nova-senha' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().params.iterations).toBe(1000)
    expect(res.json().params.digest).toBe('sha1')
  })
  it('S reports scrypt params', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/auth/password/change',
      headers: auth(c.customerToken),
      payload: { password: 'nova-senha' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().params.algorithm).toBe('scrypt')
  })
})

