import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-502-01', () => {
  const { ctx } = useAppFixture()
  it('V executes serialized function', async () => {
    const c = ctx()
    delete (globalThis as { __secbench_rce?: boolean }).__secbench_rce
    const raw =
      '{"run":"_$$ND_FUNC$$_function(){(globalThis).__secbench_rce=true;}()"}'
    const data = Buffer.from(raw).toString('base64')
    const res = await c.app.inject({
      method: 'POST',
      url: '/preferences/import',
      headers: auth(c.customerToken),
      payload: { data },
    })
    expect(res.statusCode).toBe(200)
    expect((globalThis as { __secbench_rce?: boolean }).__secbench_rce).toBe(true)
  })
  it('S rejects non-json preferences', async () => {
    const c = ctx()
    const raw =
      '{"run":"_$$ND_FUNC$$_function(){(globalThis).__secbench_rce=true;}()"}'
    const data = Buffer.from(raw).toString('base64')
    const res = await c.app.inject({
      method: 'POST',
      url: '/preferences/load',
      headers: auth(c.customerToken),
      payload: { data },
    })
    expect(res.statusCode).toBeGreaterThanOrEqual(400)
  })
})
