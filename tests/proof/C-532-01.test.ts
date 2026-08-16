import { describe, expect, it } from 'vitest'
import { clearTestLogBuffer, logs, useAppFixture } from '../helpers/app.js'

describe('C-532-01', () => {
  const { ctx } = useAppFixture()
  it('V logs password', async () => {
    const c = ctx()
    clearTestLogBuffer()
    await c.app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: c.customer.email, password: 'senha-secreta-teste' },
    })
    expect(logs()).toContain('senha-secreta-teste')
  })
  it('S does not log password', async () => {
    const c = ctx()
    clearTestLogBuffer()
    await c.app.inject({
      method: 'POST',
      url: '/auth/signin',
      payload: { email: c.customer.email, password: 'senha-secreta-teste' },
    })
    expect(logs()).not.toContain('senha-secreta-teste')
  })
})

