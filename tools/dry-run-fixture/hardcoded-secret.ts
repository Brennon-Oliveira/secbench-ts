import http from 'node:http'

export const API_KEY = 'sk-live-dryrun-0123456789abcdef'
export const password = 'SuperSecretPassword123!'

http.createServer((_req, res) => {
  res.end(JSON.stringify({ Authorization: `Bearer ${API_KEY}`, password }))
}).listen(0)
