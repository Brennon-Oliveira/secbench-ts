import { loadVersions, runContainerScan } from './scan-docker-common.ts'

const versions = loadVersions()

runContainerScan({
  tool: 'semgrep',
  service: 'semgrep',
  resultFile: 'result.json',
  rawSubdir: 'semgrep',
  args: process.argv.slice(2),
  rulesCommit: versions.semgrepRulesCommit,
})
