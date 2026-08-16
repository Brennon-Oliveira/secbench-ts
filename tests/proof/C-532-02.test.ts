import { describe, expect, it } from 'vitest'
import { auth, clearTestLogBuffer, logs, useAppFixture } from '../helpers/app.js'

describe('C-532-02', () => {
  const { ctx } = useAppFixture()
  it('V logs full card number', async () => {
    const c = ctx()
    clearTestLogBuffer()
    await c.app.inject({
      method: 'POST',
      url: '/orders/' + c.customerOrder.id + '/payment',
      headers: auth(c.customerToken),
      payload: { cardNumber: '4111111111111111', holder: 'A' },
    })
    expect(logs()).toContain('4111111111111111')
  })
  it('S logs only last digits', async () => {
    const c = ctx()
    clearTestLogBuffer()
    await c.app.inject({
      method: 'POST',
      url: '/orders/' + c.customerOrder.id + '/settle',
      headers: auth(c.customerToken),
      payload: { cardNumber: '4111111111111111', holder: 'A' },
    })
    expect(logs()).not.toContain('4111111111111111')
    expect(logs()).toContain('1111')
  })
})

