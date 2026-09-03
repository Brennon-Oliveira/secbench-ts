import http from 'node:http'
import { Sequelize } from 'sequelize'

const db = new Sequelize('sqlite::memory:')

http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const name = url.searchParams.get('name') || ''
  const mode = url.searchParams.get('mode') || 'plus'

  // Form A: string concatenation with + into Sequelize.query (corpus sink)
  if (mode === 'plus') {
    const sql =
      'SELECT * FROM users WHERE name = ' +
      "'" +
      name +
      "'"
    const rows = await db.query(sql)
    res.end(JSON.stringify(rows))
    return
  }

  // Form B: template literal interpolation into the same Sequelize.query sink
  const rows = await db.query(`SELECT * FROM users WHERE name = '${name}'`)
  res.end(JSON.stringify(rows))
}).listen(0)
