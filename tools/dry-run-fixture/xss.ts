import http from 'node:http'

http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const name = url.searchParams.get('name') || 'guest'
  res.setHeader('content-type', 'text/html')
  res.end(`<div>Hello ${name}</div>`)
}).listen(0)
