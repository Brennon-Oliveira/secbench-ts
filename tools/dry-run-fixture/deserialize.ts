import http from 'node:http'
import serialize from 'node-serialize'

http.createServer((req, res) => {
  const chunks: Buffer[] = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => {
    const blob = Buffer.concat(chunks).toString('utf8')
    const session = serialize.unserialize(blob)
    res.end(JSON.stringify(session))
  })
}).listen(0)
