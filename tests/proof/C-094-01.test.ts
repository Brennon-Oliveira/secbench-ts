import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-094-01', () => {
  const { ctx } = useAppFixture()
  it('V evaluates process.env via Function', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/reports/formula',
      headers: auth(c.customerToken),
      payload: { expression: 'process.env', total: 1, quantidade: 1 },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().result).toBeTruthy()
    expect(typeof res.json().result).toBe('object')
  })
  it('S rejects process.env expression', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/reports/calculate',
      headers: auth(c.customerToken),
      payload: { expression: 'process.env', total: 1, quantidade: 1 },
    })
    expect(res.statusCode).toBe(400)
  })
})

