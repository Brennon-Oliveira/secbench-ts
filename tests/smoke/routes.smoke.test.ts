import { describe, expect, it } from 'vitest'
import { auth, useAppFixture } from '../helpers/app.js'

const routes: Array<{ method: 'GET' | 'POST'; url: string; auth?: boolean; payload?: unknown }> = [
  { method: 'GET', url: '/system/health' },
  { method: 'GET', url: '/auth/callback?next=/orders' },
  { method: 'GET', url: '/auth/return?next=/orders' },
  { method: 'POST', url: '/auth/login', payload: { email: 'x', password: 'y' } },
  { method: 'POST', url: '/auth/signin', payload: { email: 'x', password: 'y' } },
  { method: 'POST', url: '/auth/register', payload: { email: 'smoke1@loja.exemplo.invalido', password: 'p' } },
  { method: 'POST', url: '/auth/signup', payload: { email: 'smoke2@loja.exemplo.invalido', password: 'p' } },
  { method: 'POST', url: '/auth/token', payload: { email: 'user1@loja.exemplo.invalido' } },
  { method: 'POST', url: '/auth/session', payload: { email: 'user1@loja.exemplo.invalido' } },
  { method: 'POST', url: '/auth/recovery/request', payload: { email: 'user1@loja.exemplo.invalido' } },
  { method: 'POST', url: '/auth/reset/request', payload: { email: 'user1@loja.exemplo.invalido' } },
  { method: 'GET', url: '/orders/search?status=pending', auth: true },
  { method: 'GET', url: '/orders/filter?status=pending', auth: true },
  { method: 'GET', url: '/orders/1', auth: true },
  { method: 'GET', url: '/orders/1/details', auth: true },
  { method: 'GET', url: '/orders/receipt?note=a', auth: true },
  { method: 'GET', url: '/orders/voucher?note=a', auth: true },
  { method: 'GET', url: '/orders/preview?q=a', auth: true },
  { method: 'GET', url: '/orders/summary?q=a', auth: true },
  { method: 'POST', url: '/orders/1/tracking/generate', auth: true },
  { method: 'POST', url: '/orders/1/tracking/issue', auth: true },
  { method: 'POST', url: '/orders/1/payment', auth: true, payload: { cardNumber: '4111', holder: 'A' } },
  { method: 'POST', url: '/orders/1/settle', auth: true, payload: { cardNumber: '4111', holder: 'A' } },
  { method: 'GET', url: '/users/lookup?email=user1@loja.exemplo.invalido', auth: true },
  { method: 'GET', url: '/users/find?email=user1@loja.exemplo.invalido', auth: true },
  { method: 'GET', url: '/admin/users', auth: true },
  { method: 'GET', url: '/admin/accounts', auth: true },
  { method: 'POST', url: '/preferences/import', auth: true, payload: { data: Buffer.from('{}').toString('base64') } },
  { method: 'POST', url: '/preferences/load', auth: true, payload: { data: Buffer.from('{"theme":"dark"}').toString('base64') } },
  { method: 'POST', url: '/users/document/store', auth: true, payload: { document: '1' } },
  { method: 'POST', url: '/users/document/save', auth: true, payload: { document: '1' } },
  { method: 'POST', url: '/users/profile/validate', auth: true, payload: { tradeName: 'Loja' } },
  { method: 'POST', url: '/users/profile/check', auth: true, payload: { tradeName: 'Loja' } },
  { method: 'GET', url: '/files/download?name=catalog-a.txt', auth: true },
  { method: 'GET', url: '/files/fetch?name=catalog-a.txt', auth: true },
  { method: 'GET', url: '/invoices/1/attachment', auth: true },
  { method: 'GET', url: '/invoices/1/document', auth: true },
  { method: 'POST', url: '/reports/convert', auth: true, payload: { fileName: 'sales-q1.txt' } },
  { method: 'POST', url: '/reports/transform', auth: true, payload: { fileName: 'sales-q1.txt' } },
  { method: 'POST', url: '/reports/formula', auth: true, payload: { expression: 'total+quantidade', total: 1, quantidade: 2 } },
  { method: 'POST', url: '/reports/calculate', auth: true, payload: { expression: 'total+quantidade', total: 1, quantidade: 2 } },
  { method: 'POST', url: '/integrations/dispatch', auth: true, payload: { message: 'x' } },
  { method: 'POST', url: '/integrations/publish', auth: true, payload: { message: 'x' } },
  { method: 'POST', url: '/integrations/config/apply', auth: true, payload: { yaml: 'name: a' } },
  { method: 'POST', url: '/integrations/config/update', auth: true, payload: { yaml: 'name: a' } },
  { method: 'POST', url: '/integrations/timing/parse', auth: true, payload: { value: '1s' } },
  { method: 'POST', url: '/integrations/timing/format', auth: true, payload: { value: '1s' } },
  { method: 'GET', url: '/system/diagnostics?host=127.0.0.1', auth: true },
  { method: 'GET', url: '/system/connectivity?host=127.0.0.1', auth: true },
  { method: 'GET', url: '/system/report?id=1', auth: true },
  { method: 'GET', url: '/system/status?id=1', auth: true },
  { method: 'POST', url: '/system/maintenance/purge' },
  { method: 'POST', url: '/system/maintenance/cleanup', auth: true },
  { method: 'POST', url: '/auth/password/rotate', auth: true, payload: { password: 'x' } },
  { method: 'POST', url: '/auth/password/change', auth: true, payload: { password: 'x' } },
]

describe('smoke routes', () => {
  const { ctx } = useAppFixture()
  for (const route of routes) {
    it(`${route.method} ${route.url} is reachable`, async () => {
      const c = ctx()
      const res = await c.app.inject({
        method: route.method,
        url: route.url,
        headers: route.auth ? auth(c.adminToken) : undefined,
        payload: route.payload,
      })
      // Ownership-filtered routes may 404 for a given seed id; that is expected.
      expect([200, 201, 302, 301, 400, 401, 403, 404]).toContain(res.statusCode)
    })
  }
})

