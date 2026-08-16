import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { useAppFixture } from '../helpers/app.js'

describe('C-327-01', () => {
  const { ctx } = useAppFixture()
  it('V stores MD5 of password', async () => {
    const c = ctx()
    const password = 'teste-senha-123'
    const res = await c.app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: { email: 'md5user@loja.exemplo.invalido', password },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().hash).toBe(createHash('md5').update(password).digest('hex'))
  })
  it('S does not return MD5 hash', async () => {
    const c = ctx()
    const password = 'teste-senha-123'
    const res = await c.app.inject({
      method: 'POST',
      url: '/auth/signup',
      payload: { email: 'scryptuser@loja.exemplo.invalido', password },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json().hash).toBeUndefined()
  })
})

