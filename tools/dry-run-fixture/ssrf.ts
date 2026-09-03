import http from 'node:http'

http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const target = url.searchParams.get('url') || 'http://example.invalido/'
  const mode = url.searchParams.get('mode') || 'direct'

  // Form A: fetch directly on the attacker-controlled value
  if (mode === 'direct') {
    const upstream = await fetch(target)
    res.end(await upstream.text())
    return
  }

  // Form B: pass through an intermediate variable before fetch
  const endpoint = target
  const requestUrl = endpoint
  const upstream = await fetch(requestUrl)
  res.end(await upstream.text())
}).listen(0)
