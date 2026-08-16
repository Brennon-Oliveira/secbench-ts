import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-327-02', () => {
  const { ctx } = useAppFixture()
  it('V produces identical ciphertext for identical documents', async () => {
    const c = ctx()
    const doc = '12345678900'
    const a = await c.app.inject({
      method: 'POST',
      url: '/users/document/store',
      headers: auth(c.customerToken),
      payload: { document: doc },
    })
    const b = await c.app.inject({
      method: 'POST',
      url: '/users/document/store',
      headers: auth(c.customerToken),
      payload: { document: doc },
    })
    expect(a.json().ciphertext).toBe(b.json().ciphertext)
  })
  it('S produces distinct ciphertext for identical documents', async () => {
    const c = ctx()
    const doc = '12345678900'
    const a = await c.app.inject({
      method: 'POST',
      url: '/users/document/save',
      headers: auth(c.customerToken),
      payload: { document: doc },
    })
    const b = await c.app.inject({
      method: 'POST',
      url: '/users/document/save',
      headers: auth(c.customerToken),
      payload: { document: doc },
    })
    expect(a.json().ciphertext).not.toBe(b.json().ciphertext)
  })
})

