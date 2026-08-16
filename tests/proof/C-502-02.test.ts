import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-502-02', () => {
  const { ctx } = useAppFixture()
  it('V accepts custom YAML type tag', async () => {
    const c = ctx()
    const yamlDoc = '!!js/function "function (){return 1}"'
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/config/apply',
      headers: auth(c.customerToken),
      payload: { yaml: yamlDoc },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().kind).toBe('function')
  })
  it('S rejects custom YAML type tag', async () => {
    const c = ctx()
    const yamlDoc = '!!js/function "function (){return 1}"'
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/config/update',
      headers: auth(c.customerToken),
      payload: { yaml: yamlDoc },
    })
    expect(res.statusCode).toBeGreaterThanOrEqual(400)
  })
})
