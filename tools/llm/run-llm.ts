import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function walk(dir: string): string[] {
  const out: string[] = []
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...walk(p))
    else if (ent.name.endsWith('.ts')) out.push(p)
  }
  return out.sort()
}

function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

async function callModel(prompt: string): Promise<string> {
  const apiKey = process.env.LLM_API_KEY
  const endpoint = process.env.LLM_ENDPOINT
  const model = process.env.LLM_MODEL ?? 'unspecified'
  if (!apiKey || !endpoint) {
    return JSON.stringify({
      findings: [],
      skipped: true,
      reason: 'LLM_API_KEY or LLM_ENDPOINT not set',
      model,
    })
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: Number(process.env.LLM_TEMPERATURE ?? 0),
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const text = await res.text()
  return text
}

async function main() {
  const template = fs.readFileSync(path.join(ROOT, 'tools/llm/prompt.md'), 'utf8')
  const corpusFiles = walk(path.join(ROOT, 'corpus'))
  const outDir = path.join(ROOT, 'results/raw/llm')
  fs.mkdirSync(outDir, { recursive: true })
  const runStamp = stamp()
  const meta = {
    tool: 'llm',
    model: process.env.LLM_MODEL ?? 'unspecified',
    temperature: Number(process.env.LLM_TEMPERATURE ?? 0),
    date: new Date().toISOString(),
    command: 'npm run scan:llm',
    runsPerFile: 3,
  }
  fs.writeFileSync(path.join(outDir, `${runStamp}.meta.json`), JSON.stringify(meta, null, 2) + '\n')

  for (const file of corpusFiles) {
    const rel = path.relative(path.join(ROOT, 'corpus'), file).split(path.sep).join('/')
    const content = fs.readFileSync(file, 'utf8')
    const prompt = template.replace('{{CAMINHO}}', rel).replace('{{CONTEUDO}}', content)
    for (let runId = 1; runId <= 3; runId++) {
      const raw = await callModel(prompt)
      let parsed: unknown
      let malformed = false
      try {
        parsed = JSON.parse(raw)
      } catch {
        malformed = true
        parsed = { raw, malformed: true }
      }
      const outName = `${runStamp}-${rel.replace(/[\\/]/g, '__')}-run${runId}.json`
      fs.writeFileSync(
        path.join(outDir, outName),
        JSON.stringify({ runId, file: rel, malformed, response: parsed, raw }, null, 2) + '\n',
      )
    }
  }
  console.log(`scan:llm wrote results under results/raw/llm (${corpusFiles.length} files × 3)`)
}

main()
