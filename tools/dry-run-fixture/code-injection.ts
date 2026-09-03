import http from 'node:http'

http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const code = url.searchParams.get('code') || '1+1'
  const value = eval(code)
  res.end(String(value))
}).listen(0)
