import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-078-01', () => {
  const { ctx } = useAppFixture()
  it('V executes trailing shell fragment', async () => {
    const c = ctx()
    const marker = path.join(process.cwd(), 'storage/reports/INJETADO-MARKER')
    try { fs.unlinkSync(marker) } catch { /* */ }
    const res = await c.app.inject({
      method: 'POST',
      url: '/reports/convert',
      headers: auth(c.customerToken),
      payload: { fileName: 'sales-q1.txt; touch storage/reports/INJETADO-MARKER' },
    })
    expect(res.statusCode).toBe(200)
    expect(fs.existsSync(marker)).toBe(true)
    try { fs.unlinkSync(marker) } catch { /* */ }
  })
  it('S rejects crafted file name', async () => {
    const c = ctx()
    const res = await c.app.inject({
      method: 'POST',
      url: '/reports/transform',
      headers: auth(c.customerToken),
      payload: { fileName: 'sales-q1.txt; touch storage/reports/INJETADO-MARKER' },
    })
    expect(res.statusCode).toBe(400)
  })
})

