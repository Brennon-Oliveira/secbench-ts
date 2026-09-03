import http from 'node:http'
import { exec, execSync } from 'node:child_process'

http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  const host = url.searchParams.get('host') || '127.0.0.1'
  const mode = url.searchParams.get('mode') || 'exec'

  // Form A: exec with a built command string
  if (mode === 'exec') {
    const cmd = 'ping -c 1 ' + host
    exec(cmd, (err, stdout) => {
      res.end(err ? String(err) : stdout)
    })
    return
  }

  // Form B: execSync with interpolated command
  try {
    const out = execSync(`ping -c 1 ${host}`, { encoding: 'utf8' })
    res.end(out)
  } catch (err) {
    res.end(String(err))
  }
}).listen(0)
