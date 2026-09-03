import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCKER_DIR = path.join(ROOT, 'docker')

export type ScanTool = 'semgrep' | 'codeql' | 'njsscan' | 'eslint'

export type VersionsEntry = {
  image: string
  digest: string
  toolVersion: string
  resolvedAt: string
  rulesCommit?: string
}

export type VersionsFile = {
  semgrep: VersionsEntry
  njsscan: VersionsEntry
  codeql: VersionsEntry
  eslint: VersionsEntry
  semgrepRulesCommit: string
}

export function stamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

export function resolveScanTarget(args: string[]): string {
  const env = process.env.SCAN_TARGET
  if (env) return path.resolve(env)
  const i = args.indexOf('--target')
  if (i >= 0 && args[i + 1]) return path.resolve(args[i + 1]!)
  return path.join(ROOT, 'corpus')
}

export function resolveOutputRoot(args: string[]): string {
  const env = process.env.SCAN_OUTPUT_ROOT
  if (env) return path.resolve(env)
  const i = args.indexOf('--output-root')
  if (i >= 0 && args[i + 1]) return path.resolve(args[i + 1]!)
  return path.join(ROOT, 'results/raw')
}

export function loadVersions(): VersionsFile {
  const p = path.join(DOCKER_DIR, 'versions.json')
  if (!fs.existsSync(p)) {
    throw new Error(
      `docker/versions.json ausente. Execute npm run docker:build && npm run docker:versions antes das varreduras.`,
    )
  }
  return JSON.parse(fs.readFileSync(p, 'utf8')) as VersionsFile
}

function hostIds(): { uid: string; gid: string } {
  if (process.platform === 'win32') return { uid: '1000', gid: '1000' }
  try {
    if (typeof process.getuid === 'function' && typeof process.getgid === 'function') {
      return { uid: String(process.getuid()), gid: String(process.getgid()) }
    }
  } catch {
    /* fall through */
  }
  return { uid: '1000', gid: '1000' }
}

function runCompose(
  service: string,
  env: Record<string, string>,
): { exitCode: number; command: string } {
  const { uid, gid } = hostIds()
  const baseEnv = {
    ...process.env,
    ...env,
    HOST_UID: uid,
    HOST_GID: gid,
  }
  // network_mode: none is set on scan services in compose.yml (not on eslint-deps).
  const args = ['compose', '-f', path.join(DOCKER_DIR, 'compose.yml'), 'run', '--rm', '--no-deps', service]

  const command = `docker ${args.join(' ')}`
  const res = spawnSync('docker', args, {
    cwd: DOCKER_DIR,
    env: baseEnv,
    encoding: 'utf8',
    stdio: 'inherit',
  })
  const exitCode = res.status ?? (res.error ? 127 : 0)
  return { exitCode, command }
}

function fixOwnership(dir: string): boolean {
  const { uid, gid } = hostIds()
  if (uid === '0' && gid === '0') return false
  try {
    execFileSync('docker', ['run', '--rm', '-v', `${dir}:/out`, 'alpine:3.20', 'chown', '-R', `${uid}:${gid}`, '/out'], {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

function copyContainerResult(stagingDir: string, outFile: string, resultName: string): boolean {
  const src = path.join(stagingDir, resultName)
  if (!fs.existsSync(src)) return false
  fs.copyFileSync(src, outFile)
  return true
}

function writeErrorStub(outFile: string, tool: string, reason: string, partial?: string): void {
  if (partial) {
    fs.writeFileSync(outFile, partial)
    return
  }
  const ext = path.extname(outFile)
  if (ext === '.sarif') {
    fs.writeFileSync(
      outFile,
      JSON.stringify({ version: '2.1.0', runs: [], _scan_err: { tool, error: reason } }, null, 2) + '\n',
    )
  } else {
    fs.writeFileSync(outFile, JSON.stringify({ error: reason, tool, results: [] }, null, 2) + '\n')
  }
}

export type ScanRunResult = {
  outFile: string
  metaFile: string
  exitCode: number
  durationSec: number
  command: string
  error?: string
}

export function runContainerScan(opts: {
  tool: ScanTool
  service: string
  resultFile: string
  rawSubdir: string
  args?: string[]
  preRun?: () => { exitCode: number; command: string } | void
  rulesCommit?: string
}): ScanRunResult {
  const target = resolveScanTarget(opts.args ?? [])
  if (!fs.existsSync(target)) {
    throw new Error(`diretorio de varredura inexistente: ${target}`)
  }

  const versions = loadVersions()
  const entry = versions[opts.tool]
  const outputRoot = resolveOutputRoot(opts.args ?? [])
  const outDir = path.join(outputRoot, opts.rawSubdir)
  fs.mkdirSync(outDir, { recursive: true })

  const id = stamp()
  const outFile = path.join(outDir, `${id}${path.extname(opts.resultFile)}`)
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), `scan-${opts.tool}-`))

  const projectRoot = process.env.SCAN_PROJECT_ROOT
    ? path.resolve(process.env.SCAN_PROJECT_ROOT)
    : ROOT

  const env = {
    SCAN_WORK: target,
    SCAN_OUT: stagingDir,
    PROJECT_ROOT: projectRoot,
  }

  const started = Date.now()
  let exitCode = 0
  let command = ''
  let error: string | undefined

  try {
    if (opts.preRun) {
      const pre = opts.preRun()
      if (pre && pre.exitCode !== 0) {
        exitCode = pre.exitCode
        command = pre.command
        error = `pre-run failed with exit ${pre.exitCode}`
      }
    }

    if (!error) {
      const run = runCompose(opts.service, env)
      exitCode = run.exitCode
      command = run.command
    }

    const copied = copyContainerResult(stagingDir, outFile, opts.resultFile)
    if (!copied) {
      error = error ?? `no result file produced by container (exit ${exitCode})`
      writeErrorStub(outFile, opts.tool, error)
    } else if (fs.statSync(outFile).size === 0) {
      error = error ?? `result file is empty (exit ${exitCode})`
    } else if (exitCode !== 0) {
      // Semgrep/ESLint/njsscan often return non-zero when findings exist; keep output.
      console.warn(`scan:${opts.tool}: tool exit ${exitCode} with non-empty output (recorded in meta)`)
    }
  } catch (err) {
    exitCode = exitCode || 1
    error = err instanceof Error ? err.message : String(err)
    if (!fs.existsSync(outFile)) writeErrorStub(outFile, opts.tool, error)
  } finally {
    fixOwnership(stagingDir)
    try {
      fs.rmSync(stagingDir, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }

  const durationSec = Math.round((Date.now() - started) / 1000)
  const metaFile = path.join(outDir, `${id}.meta.json`)

  const meta = {
    tool: opts.tool,
    version: entry.toolVersion,
    image: entry.image,
    digest: entry.digest,
    ...(opts.rulesCommit ?? entry.rulesCommit ? { rulesCommit: opts.rulesCommit ?? entry.rulesCommit } : {}),
    command,
    date: new Date().toISOString(),
    durationSec,
    exitCode,
    scanTarget: target,
    ...(error ? { error } : {}),
  }
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n')

  if (error) {
    console.error(`scan:${opts.tool} completed with error: ${error}`)
    process.exitCode = exitCode || 1
  }

  console.log(`scan:${opts.tool} -> ${outFile}`)
  return { outFile, metaFile, exitCode, durationSec, command, error }
}

export function runEslintDeps(projectRoot: string): { exitCode: number; command: string } {
  const { uid, gid } = hostIds()
  const args = ['compose', '-f', path.join(DOCKER_DIR, 'compose.yml'), 'run', '--rm', '--no-deps', 'eslint-deps']
  const command = `docker ${args.join(' ')}`
  const res = spawnSync('docker', args, {
    cwd: DOCKER_DIR,
    env: {
      ...process.env,
      PROJECT_ROOT: projectRoot,
      HOST_UID: uid,
      HOST_GID: gid,
    },
    encoding: 'utf8',
    stdio: 'inherit',
  })
  return { exitCode: res.status ?? 1, command }
}

export { ROOT, DOCKER_DIR }
