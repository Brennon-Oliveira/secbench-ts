import path from 'node:path'
import { ROOT, runContainerScan, runEslintDeps } from './scan-docker-common.ts'

const projectRoot = process.env.SCAN_PROJECT_ROOT
  ? path.resolve(process.env.SCAN_PROJECT_ROOT)
  : ROOT

runContainerScan({
  tool: 'eslint',
  service: 'eslint-scan',
  resultFile: 'result.json',
  rawSubdir: 'eslint',
  args: process.argv.slice(2),
  preRun: () => runEslintDeps(projectRoot),
})
