import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

describe('C-434-01', () => {
  const { ctx } = useAppFixture()
  it('V accepts executable extension', async () => {
    const c = ctx()
    const boundary = '----secbench'
    const body =
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="file"; filename="run.sh"\r\n' +
      'Content-Type: application/x-sh\r\n\r\n' +
      '#!/bin/sh\necho hi\r\n' +
      '--' + boundary + '--\r\n'
    const res = await c.app.inject({
      method: 'POST',
      url: '/files/upload',
      headers: {
        ...auth(c.customerToken),
        'content-type': 'multipart/form-data; boundary=' + boundary,
      },
      payload: body,
    })
    expect(res.statusCode).toBe(200)
    expect(res.json().name).toBe('run.sh')
  })
  it('S rejects executable extension', async () => {
    const c = ctx()
    const boundary = '----secbench'
    const body =
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="file"; filename="run.sh"\r\n' +
      'Content-Type: application/x-sh\r\n\r\n' +
      '#!/bin/sh\necho hi\r\n' +
      '--' + boundary + '--\r\n'
    const res = await c.app.inject({
      method: 'POST',
      url: '/files/attach',
      headers: {
        ...auth(c.customerToken),
        'content-type': 'multipart/form-data; boundary=' + boundary,
      },
      payload: body,
    })
    expect(res.statusCode).toBe(400)
  })
})

