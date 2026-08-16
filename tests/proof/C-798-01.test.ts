import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-798-01', () => {
  const { ctx } = useAppFixture()
  it('V embeds literal key in corpus source', async () => {
    const src = fs.readFileSync('corpus/modules/integrations/routes/dispatch.ts', 'utf8')
    expect(src).toContain('loja-live-key-9f3a2c1b0e7d')
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/dispatch',
      headers: auth(c.customerToken),
      payload: { message: 'hi' },
    })
    expect(res.statusCode).toBe(200)
  })
  it('S has no literal secret in corpus source', async () => {
    const src = fs.readFileSync('corpus/modules/integrations/routes/publish.ts', 'utf8')
    expect(src).not.toContain('loja-live-key-9f3a2c1b0e7d')
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/publish',
      headers: auth(c.customerToken),
      payload: { message: 'hi' },
    })
    expect(res.statusCode).toBe(200)
  })
})

