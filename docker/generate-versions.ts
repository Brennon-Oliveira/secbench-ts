/**
 * Builds scan images and writes docker/versions.json with pinned digests.
 * Run: npm run docker:versions
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCKER_DIR = path.join(ROOT, 'docker')
const COMPOSE = path.join(DOCKER_DIR, 'compose.yml')

const SEMGREP_RULES_COMMIT = '40b8c63f75dc7c22c8a77482d73bfb864b146f7e'
const RESOLVED_AT = new Date().toISOString()

function run(cmd: string, args: string[], cwd = DOCKER_DIR): string {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8' }).trim()
}

function imageDigest(ref: string): string {
  const out = run('docker', ['inspect', '--format', '{{index .RepoDigests 0}}', ref])
  if (!out || out === '<no value>') {
    return run('docker', ['inspect', '--format', '{{.Id}}', ref])
  }
  return out
}

function parseDigest(digestLine: string): { image: string; digest: string } {
  if (digestLine.includes('@sha256:')) {
    const at = digestLine.lastIndexOf('@')
    return { image: digestLine.slice(0, at), digest: digestLine.slice(at + 1) }
  }
  return { image: digestLine, digest: digestLine }
}

function semgrepVersion(): string {
  return run('docker', ['run', '--rm', '--entrypoint', 'semgrep', 'sast-semgrep:1.174.0', '--version'])
}

function njsscanVersion(): string {
  // Avoid `pip show` in this image: bundled pip breaks under some host Python envs.
  const out = run('docker', [
    'run',
    '--rm',
    '--entrypoint',
    'python',
    'opensecurity/njsscan:0.3.2',
    '-c',
    "from importlib.metadata import version; print(version('njsscan'))",
  ])
  return out.trim() || 'unknown'
}

function codeqlVersion(): string {
  const out = run('docker', ['run', '--rm', '--entrypoint', 'codeql', 'sast-codeql:2.26.3', 'version', '--format=text'])
  const m = out.match(/release\s+([0-9.]+)/i)
  return m ? m[1]!.replace(/\.$/, '') : out.split('\n')[0]!.trim()
}

function eslintVersion(): string {
  return run('docker', [
    'run',
    '--rm',
    'node:22-bookworm',
    'node',
    '-e',
    "console.log(process.version.replace('v',''))",
  ])
}

console.log('Building custom images…')
// BuildKit cannot tag builds with digests — reset local image names to tags first.
{
  let compose = fs.readFileSync(COMPOSE, 'utf8')
  compose = compose.replace(/^    image: sast-semgrep(@sha256:[0-9a-f]+|:.*)$/m, '    image: sast-semgrep:1.174.0')
  compose = compose.replace(/^    image: sast-codeql(@sha256:[0-9a-f]+|:.*)$/m, '    image: sast-codeql:2.26.3')
  fs.writeFileSync(COMPOSE, compose)
}
run('docker', ['compose', '-f', COMPOSE, 'build', 'semgrep', 'codeql'])

const semgrepDigestLine = imageDigest('sast-semgrep:1.174.0')
const codeqlDigestLine = imageDigest('sast-codeql:2.26.3')
const njsscanDigestLine = imageDigest('opensecurity/njsscan:0.3.2')
const nodeDigestLine = imageDigest('node:22-bookworm')

const semgrepParsed = parseDigest(semgrepDigestLine)
const codeqlParsed = parseDigest(codeqlDigestLine)
const njsscanParsed = parseDigest(njsscanDigestLine)
const nodeParsed = parseDigest(nodeDigestLine)

const versions = {
  semgrepRulesCommit: SEMGREP_RULES_COMMIT,
  semgrep: {
    image: 'sast-semgrep:1.174.0',
    digest: semgrepParsed.digest,
    toolVersion: semgrepVersion(),
    resolvedAt: RESOLVED_AT,
    rulesCommit: SEMGREP_RULES_COMMIT,
  },
  njsscan: {
    image: 'opensecurity/njsscan:0.3.2',
    digest: njsscanParsed.digest,
    toolVersion: njsscanVersion(),
    resolvedAt: RESOLVED_AT,
  },
  codeql: {
    image: 'sast-codeql:2.26.3',
    digest: codeqlParsed.digest,
    toolVersion: codeqlVersion(),
    resolvedAt: RESOLVED_AT,
  },
  eslint: {
    image: 'node:22-bookworm',
    digest: nodeParsed.digest,
    toolVersion: eslintVersion(),
    resolvedAt: RESOLVED_AT,
  },
}

const outPath = path.join(DOCKER_DIR, 'versions.json')
fs.writeFileSync(outPath, JSON.stringify(versions, null, 2) + '\n')
console.log(`Wrote ${outPath}`)

// Official Hub images stay digest-pinned in compose. Local builds keep tags (required
// for `docker compose build`) and record digests in versions.json for reproducibility.
let compose = fs.readFileSync(COMPOSE, 'utf8')
compose = compose.replace(
  /^    image: opensecurity\/njsscan@.*$/m,
  `    image: opensecurity/njsscan@${njsscanParsed.digest}`,
)
compose = compose.replace(
  /^    image: node@.*$/gm,
  `    image: node@${nodeParsed.digest}`,
)
compose = compose.replace(/^    image: sast-semgrep:.*$/m, '    image: sast-semgrep:1.174.0')
compose = compose.replace(/^    image: sast-codeql:.*$/m, '    image: sast-codeql:2.26.3')
fs.writeFileSync(COMPOSE, compose)
console.log('Pinned Hub image digests in compose.yml; local image digests in versions.json')
