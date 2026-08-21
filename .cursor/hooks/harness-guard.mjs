#!/usr/bin/env node
/**
 * Shared harness checks. Used by Cursor hooks and optionally by CI.
 * Reads JSON from stdin when used as a hook; supports CLI modes via argv.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const AUDIT_LOG = path.join(ROOT, '.cursor/logs/harness-audit.jsonl')

const DERIVED_PREFIXES = ['corpus/', 'ground-truth.json']
const SUPPRESSION_RE =
  /eslint-disable|nosemgrep|@ts-ignore|@ts-nocheck|semgrep-ignore|nolint|pragma:\s*no cover/i

function loadVocab() {
  const raw = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'tools/forbidden-vocab.json'), 'utf8'),
  )
  return raw.map((w) => String(w).toLowerCase())
}

function audit(event, detail) {
  fs.mkdirSync(path.dirname(AUDIT_LOG), { recursive: true })
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...detail })
  fs.appendFileSync(AUDIT_LOG, line + '\n')
}

function rel(p) {
  const abs = path.isAbsolute(p) ? p : path.resolve(ROOT, p)
  return path.relative(ROOT, abs).split(path.sep).join('/')
}

function isDerived(filePath) {
  const r = rel(filePath)
  return (
    r === 'ground-truth.json' ||
    r.startsWith('corpus/') ||
    r === 'corpus'
  )
}

function findForbidden(text, vocab) {
  const lower = text.toLowerCase()
  const hits = []
  for (const w of vocab) {
    if (w === 'safe') {
      // allow yaml.safeLoad / yaml.safeDump API names only
      const re = /\bsafe\b/gi
      let m
      while ((m = re.exec(text))) {
        const ctx = text.slice(Math.max(0, m.index - 12), m.index + 20)
        if (/yaml\.safe(Load|Dump)/i.test(ctx)) continue
        hits.push(w)
        break
      }
      continue
    }
    if (w.includes(' ')) {
      if (lower.includes(w)) hits.push(w)
    } else {
      const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (re.test(text)) hits.push(w)
    }
  }
  return [...new Set(hits)]
}

function readStdin() {
  return new Promise((resolve) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (c) => (data += c))
    process.stdin.on('end', () => {
      try {
        resolve(data.trim() ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })
  })
}

function deny(message, extra = {}) {
  return {
    permission: 'deny',
    user_message: message,
    agent_message: message,
    ...extra,
  }
}

function allow(extra = {}) {
  return { permission: 'allow', ...extra }
}

function isSandboxOkMarker(filePath) {
  const r = rel(filePath)
  return r === '.sandbox-ok' || r.endsWith('/.sandbox-ok')
}

async function handlePreToolUse(input) {
  const toolName = input.tool_name || input.toolName || ''
  const toolInput = input.tool_input || input.arguments || input || {}
  const filePath =
    toolInput.path || toolInput.filePath || toolInput.target_notebook || ''

  if (!filePath) return allow()

  if (isSandboxOkMarker(filePath)) {
    const msg =
      'Criação de .sandbox-ok bloqueada no checkout de trabalho. Esse marcador só pode existir em clone descartável para o modo destrutivo de measurement:prepare.'
    audit('block-sandbox-ok', { file: rel(filePath), toolName })
    return deny(msg)
  }

  if (isDerived(filePath)) {
    const msg =
      'Edição direta de artefato derivado bloqueada (corpus/ ou ground-truth.json). Altere src/ e rode npm run build:corpus.'
    audit('block-derived-edit', { file: rel(filePath), toolName })
    return deny(msg)
  }
  return allow()
}

async function handleAfterFileEdit(input) {
  const toolInput = input.tool_input || input.arguments || input || {}
  const filePath = toolInput.path || input.path || ''
  if (!filePath) return {}

  const r = rel(filePath)

  if (r === '.sandbox-ok' || r.endsWith('/.sandbox-ok')) {
    const msg =
      'Arquivo .sandbox-ok detectado no checkout de trabalho. Remova-o; use apenas em clone descartável para o modo destrutivo.'
    audit('block-sandbox-ok-edit', { file: r })
    return { additional_context: msg }
  }

  // Only check artifact source and corpus
  if (
    !(
      r.startsWith('src/') ||
      r.startsWith('corpus/') ||
      r === 'ground-truth.json'
    )
  ) {
    return {}
  }

  let content = ''
  try {
    content = fs.readFileSync(path.resolve(ROOT, r), 'utf8')
  } catch {
    return {}
  }

  if (SUPPRESSION_RE.test(content)) {
    const msg = `Diretiva de supressão de análise detectada em ${r}. Remova-a.`
    audit('block-suppression', { file: r })
    return {
      additional_context: msg,
    }
  }

  // Vocab check only on corpus output and src (markers ok; build strips). Soft warn on src.
  if (r.startsWith('corpus/')) {
    const vocab = loadVocab()
    const hits = findForbidden(content, vocab)
    if (hits.length) {
      const msg = `Vocabulário proibido em ${r}: ${hits.join(', ')}`
      audit('block-vocab', { file: r, hits })
      return { additional_context: msg }
    }
  }

  if (r.startsWith('src/') && !r.includes('case-catalog')) {
    // After src edit, remind to regenerate
    return {
      additional_context:
        'Alteração em src/: rode `npm run build:corpus` antes de concluir o ciclo para regenerar corpus e gabarito.',
    }
  }

  return {}
}

async function handleBeforeReadFile(input) {
  const toolInput = input.tool_input || input.arguments || input || {}
  const filePath = toolInput.path || input.path || ''
  const subagent = input.subagent_type || input.subagentType || input.agent || ''

  if (
    String(subagent).includes('blind') &&
    filePath &&
    (isDerived(filePath) ||
      rel(filePath) === 'docs/specs/PROJETO.md' ||
      rel(filePath).startsWith('tests/proof/'))
  ) {
    const msg =
      'Auditor cego não pode ler gabarito, especificação de casos ou testes de proof.'
    audit('block-blind-read', { file: rel(filePath) })
    return deny(msg)
  }
  return allow()
}

async function main() {
  const mode = process.argv[2] || 'preToolUse'
  const input = await readStdin()
  let out = {}
  if (mode === 'preToolUse') out = await handlePreToolUse(input)
  else if (mode === 'afterFileEdit') out = await handleAfterFileEdit(input)
  else if (mode === 'beforeReadFile') out = await handleBeforeReadFile(input)
  else out = allow()

  process.stdout.write(JSON.stringify(out))
}

main().catch((err) => {
  audit('hook-error', { error: String(err) })
  process.stdout.write(JSON.stringify({ permission: 'allow' }))
})
