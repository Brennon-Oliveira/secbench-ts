import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-1104-01', () => {
  const { ctx } = useAppFixture()
  it('V dependency uses open range in package.json', async () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(pkg.dependencies.ms).toMatch(/^\^/)
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/timing/parse',
      headers: auth(c.customerToken),
      payload: { value: '1s' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().dependency).toBe('ms')
  })
  it('S dependency uses exact version in package.json', async () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(pkg.dependencies['escape-html']).toMatch(/^\d/)
    expect(pkg.dependencies['escape-html']).not.toMatch(/[\^~]/)
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/timing/format',
      headers: auth(c.customerToken),
      payload: { value: '<b>1s</b>' },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().dependency).toBe('escape-html')
  })
})

