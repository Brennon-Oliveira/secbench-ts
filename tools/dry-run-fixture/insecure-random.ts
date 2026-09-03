import http from 'node:http'
import crypto from 'node:crypto'

http.createServer((_req, res) => {
  const token = crypto.pseudoRandomBytes(16).toString('hex')
  res.end(token)
}).listen(0)
