import { runContainerScan } from './scan-docker-common.ts'

runContainerScan({
  tool: 'njsscan',
  service: 'njsscan',
  resultFile: 'result.json',
  rawSubdir: 'njsscan',
  args: process.argv.slice(2),
})
