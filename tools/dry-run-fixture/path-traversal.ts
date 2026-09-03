import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const file = url.searchParams.get('file') || 'readme.txt'
  const mode = url.searchParams.get('mode') || 'read'
  const target = path.join('/var/data', file)

  // Form A: filesystem read with attacker-controlled path segment
  if (mode === 'read') {
    const content = fs.readFileSync(target, 'utf8')
    res.end(content)
    return
  }

  // Form B: stream the same path back as a file download response
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', 'attachment; filename="' + file + '"')
  fs.createReadStream(target).pipe(res)
}).listen(0)
