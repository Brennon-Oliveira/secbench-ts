import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-338-02', () => {
  const { ctx } = useAppFixture()
  it('V tracking codes share time prefix', async () => {
    const c = ctx()
    const a = await c.app.inject({
      method: 'POST',
      url: '/orders/' + c.customerOrder.id + '/tracking/generate',
      headers: auth(c.customerToken),
    })
    const b = await c.app.inject({
      method: 'POST',
      url: '/orders/' + c.customerOrder.id + '/tracking/generate',
      headers: auth(c.customerToken),
    })
    const ta = String(a.json().trackingCode)
    const tb = String(b.json().trackingCode)
    expect(ta.split('-')[0]!.slice(0, 8)).toBe(tb.split('-')[0]!.slice(0, 8))
  })
  it('S tracking codes are UUIDs without shared time prefix', async () => {
    const c = ctx()
    const a = await c.app.inject({
      method: 'POST',
      url: '/orders/' + c.customerOrder.id + '/tracking/issue',
      headers: auth(c.customerToken),
    })
    const b = await c.app.inject({
      method: 'POST',
      url: '/orders/' + c.customerOrder.id + '/tracking/issue',
      headers: auth(c.customerToken),
    })
    expect(a.json().trackingCode).not.toBe(b.json().trackingCode)
    expect(String(a.json().trackingCode)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })
})

