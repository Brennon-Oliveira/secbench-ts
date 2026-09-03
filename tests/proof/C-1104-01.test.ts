import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-1104-01', () => {
  const { ctx } = useAppFixture()
  const sample = '2024-06-15T12:00:00.000Z'

  it('V parses schedule via moment dependency', async () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(pkg.dependencies.moment).toBeTruthy()
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/timing/parse',
      headers: auth(c.customerToken),
      payload: { value: sample },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().millis).toBe(Date.parse(sample))
    expect(res.json().dependency).toBeUndefined()
  })

  it('S parses schedule via dayjs dependency', async () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    expect(pkg.dependencies.dayjs).toBeTruthy()
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/integrations/timing/format',
      headers: auth(c.customerToken),
      payload: { value: sample },
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().millis).toBe(Date.parse(sample))
    expect(res.json().dependency).toBeUndefined()
  })
})
