import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { SEED, ORDER_STATUSES, UPLOAD_DIR, REPORTS_DIR } from '../config/constants.js'
import { getSequelize } from './sequelize.js'
import { initUser, User } from './models/user.js'
import { initOrder, Order } from './models/order.js'
import { initInvoice, Invoice } from './models/invoice.js'
import { initIntegration, Integration } from './models/integration.js'

/** Deterministic PRNG (mulberry32) seeded with SEED */
function mulberry32(a: number) {
  return function next() {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export async function initDb(sqlitePath?: string): Promise<void> {
  const sequelize = getSequelize(sqlitePath)
  initUser(sequelize)
  initOrder(sequelize)
  initInvoice(sequelize)
  initIntegration(sequelize)
  await sequelize.sync({ force: true })
  await runSeed()
}

export async function runSeed(): Promise<void> {
  const rand = mulberry32(SEED)
  const root = process.cwd()
  const uploads = path.join(root, UPLOAD_DIR)
  const reports = path.join(root, REPORTS_DIR)
  fs.mkdirSync(uploads, { recursive: true })
  fs.mkdirSync(reports, { recursive: true })

  fs.writeFileSync(path.join(uploads, 'catalog-a.txt'), 'catalog item A\n')
  fs.writeFileSync(path.join(uploads, 'catalog-b.txt'), 'catalog item B\n')
  fs.writeFileSync(path.join(reports, 'sales-q1.txt'), 'sales q1\n')
  fs.writeFileSync(path.join(reports, 'sales-q2.txt'), 'sales q2\n')

  const users: Array<{ email: string; passwordHash: string; role: 'customer' | 'admin' }> = []
  for (let i = 0; i < 8; i++) {
    const role = i < 2 ? 'admin' : 'customer'
    const email = `user${i + 1}@loja.exemplo.invalido`
    const passwordHash = createHash('sha256').update(`senha-${SEED}-${i}`).digest('hex')
    users.push({ email, passwordHash, role })
  }
  const createdUsers = await User.bulkCreate(users)

  const orders = []
  for (let i = 0; i < 24; i++) {
    const user = createdUsers[Math.floor(rand() * createdUsers.length)]!
    const status = ORDER_STATUSES[Math.floor(rand() * ORDER_STATUSES.length)]!
    const total = Math.round((10 + rand() * 490) * 100) / 100
    orders.push({
      userId: user.id,
      status,
      total,
      trackingCode: null,
      note: `pedido-${i + 1}`,
      createdAt: new Date(Date.UTC(2026, 0, 1 + i)),
    })
  }
  const createdOrders = await Order.bulkCreate(orders)

  const invoices = []
  for (let i = 0; i < 12; i++) {
    const order = createdOrders[i]!
    invoices.push({
      orderId: order.id,
      fileName: `invoice-${i + 1}.txt`,
      issuedAt: new Date(Date.UTC(2026, 1, 1 + i)),
    })
    fs.writeFileSync(path.join(uploads, `invoice-${i + 1}.txt`), `invoice ${i + 1}\n`)
  }
  await Invoice.bulkCreate(invoices)

  await Integration.bulkCreate([
    {
      name: 'catalog-feed',
      endpointUrl: 'https://cdn.exemplo.invalido/feed.json',
      apiKeyRef: 'INTEGRATION_API_KEY',
    },
    {
      name: 'shipping-hook',
      endpointUrl: 'https://files.exemplo.invalido/ship',
      apiKeyRef: 'INTEGRATION_API_KEY',
    },
    {
      name: 'inventory-sync',
      endpointUrl: 'https://cdn.exemplo.invalido/inventory',
      apiKeyRef: 'INTEGRATION_API_KEY',
    },
  ])
}
