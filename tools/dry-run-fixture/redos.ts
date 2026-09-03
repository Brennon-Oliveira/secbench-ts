import http from 'node:http'

http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const input = url.searchParams.get('q') || 'a'
  const re = new RegExp(`^(${input})+$`)
  res.end(String(re.test('aaaaaaaaaaaaaaaaaaaa!')))
}).listen(0)
