import * as fs from 'fs'
import * as path from 'path'
import { runFullPipelineRegressionSuite } from '../src/lib/engines/stage1-result-pipeline-regression-tests'

const outputDir = path.resolve(__dirname, '..')

console.log('=== RUNNING STAGE 1 RESULT PIPELINE REGRESSION TESTS ===\n')

const suiteResult = runFullPipelineRegressionSuite()

console.log(`Total Tests Run : ${suiteResult.totalTests}`)
console.log(`Passed Tests    : ${suiteResult.passedTests}`)
console.log(`Failed Tests    : ${suiteResult.failedTests}`)
console.log(`Overall Status  : ${suiteResult.allPassed ? 'ALL TESTS PASSED (GREEN)' : 'FAILURES DETECTED (RED)'}\n`)

suiteResult.results.forEach((r, idx) => {
  console.log(`[${r.status}] ${r.id}: ${r.name}`)
  console.log(`       ${r.details}`)
})

// 1. Write stage1-domain-mapping-audit.json
const domainAuditPath = path.join(outputDir, 'stage1-domain-mapping-audit.json')
fs.writeFileSync(domainAuditPath, JSON.stringify(suiteResult.audits.domainMappingAudit, null, 2), 'utf-8')
console.log(`\nWritten: ${domainAuditPath}`)

// 2. Write stage1-course-mapping-audit.json
const courseAuditPath = path.join(outputDir, 'stage1-course-mapping-audit.json')
fs.writeFileSync(courseAuditPath, JSON.stringify(suiteResult.audits.courseMappingAudit, null, 2), 'utf-8')
console.log(`Written: ${courseAuditPath}`)

// 3. Write stage1-specialization-mapping-audit.json
const specAuditPath = path.join(outputDir, 'stage1-specialization-mapping-audit.json')
fs.writeFileSync(specAuditPath, JSON.stringify(suiteResult.audits.specializationMappingAudit, null, 2), 'utf-8')
console.log(`Written: ${specAuditPath}`)

// 4. Write stage1-profile-differentiation-test.json
const profileAuditPath = path.join(outputDir, 'stage1-profile-differentiation-test.json')
fs.writeFileSync(profileAuditPath, JSON.stringify(suiteResult.profileOutputs, null, 2), 'utf-8')
console.log(`Written: ${profileAuditPath}`)

// 5. Write stage1-result-trace-audit.json
const traceAuditPath = path.join(outputDir, 'stage1-result-trace-audit.json')
fs.writeFileSync(traceAuditPath, JSON.stringify(suiteResult.audits.traceAudit, null, 2), 'utf-8')
console.log(`Written: ${traceAuditPath}`)

console.log('\nAll 5 audit JSON deliverables generated successfully.')
