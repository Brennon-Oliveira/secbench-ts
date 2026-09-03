import { runContainerScan } from './scan-docker-common.ts'

runContainerScan({
  tool: 'codeql',
  service: 'codeql',
  resultFile: 'result.sarif',
  rawSubdir: 'codeql',
  args: process.argv.slice(2),
})
