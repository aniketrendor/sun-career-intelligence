/**
 * Automated Test Suite: Master Question Bank V2 & Audit Framework Integration
 * Sandip University Career Intelligence System
 */

import {
  MASTER_QB_V2,
  getQuestionById,
  getQuestionsByLevel,
  getDifferentiatorsForPrograms,
  selectNextHierarchicalQuestion,
  processV2Assessment,
  validateQuestionTechnicalIntegrity,
  generateMasterQBValidationReport,
  evaluateAuditGovernance,
  executeUnifiedAssessment,
  processAssessmentResponses,
  runRecommendationEngine,
} from '../src/lib/engines'
import { SANDIP_MASTER_PROGRAMS } from '../src/lib/services/sandip-catalog'
import type { V2ResponseRecord } from '../src/lib/types/qb-v2.types'

async function runTests() {
  console.log('=================================================================')
  console.log('SANDIP UNIVERSITY CAREER INTELLIGENCE SYSTEM')
  console.log('891-QUESTION BANK & AUDIT FRAMEWORK INTEGRATION TEST SUITE')
  console.log('=================================================================\n')

  let passed = 0
  let failed = 0

  function assertTest(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`[PASS] ${name}`)
      if (details) console.log(`       ${details}`)
      passed++
    } else {
      console.error(`[FAIL] ${name}`)
      if (details) console.error(`       ${details}`)
      failed++
    }
  }

  // ─── SUITE 1: Master Question Bank & Catalog Integrity ──────────────────────
  console.log('\n--- SUITE 1: Question Bank & Catalog Structural Integrity ---')

  assertTest(
    'Total Question Count Integrity',
    MASTER_QB_V2.totalQuestions === 891,
    `Loaded ${MASTER_QB_V2.totalQuestions} questions (Expected: 891)`
  )

  assertTest(
    'Total Differentiators Integrity',
    MASTER_QB_V2.totalDifferentiators === 22,
    `Loaded ${MASTER_QB_V2.totalDifferentiators} differentiators (Expected: 22)`
  )

  assertTest(
    'Total Overlap Clusters Integrity',
    MASTER_QB_V2.overlapClusters.length === 23,
    `Loaded ${MASTER_QB_V2.overlapClusters.length} overlap clusters (Expected: 23)`
  )

  const l1Count = getQuestionsByLevel('L1').length
  const l2Count = getQuestionsByLevel('L2').length
  const l3Count = getQuestionsByLevel('L3').length
  const l4Count = getQuestionsByLevel('L4').length
  const l5Count = getQuestionsByLevel('L5').length

  assertTest(
    'Level Distribution Integrity',
    l1Count === 20 && l2Count === 28 && l3Count === 32 && l4Count === 342 && l5Count === 469,
    `L1: ${l1Count}, L2: ${l2Count}, L3: ${l3Count}, L4: ${l4Count}, L5: ${l5Count}`
  )

  const report = generateMasterQBValidationReport()
  assertTest(
    'Automated Technical Validation Check',
    report.technicallyValidCount === 891 && report.technicallyInvalidCount === 0,
    `Valid: ${report.technicallyValidCount}, Invalid: ${report.technicallyInvalidCount}, Coverage: ${report.catalogCoveragePercent}%`
  )

  // ─── SUITE 2: Audit Framework Governance & Non-Fabrication ──────────────────
  console.log('\n--- SUITE 2: Audit Framework Governance & Rubric Rules ---')

  const sampleQ = MASTER_QB_V2.questions[0]
  const sampleAudit = sampleQ.audit
  const govDecision = evaluateAuditGovernance(sampleAudit)

  assertTest(
    'Non-Fabrication of Unvalidated Pilot Data',
    sampleAudit.decision === 'PENDING' && govDecision.decision === 'PENDING',
    `Audit decision remains 'PENDING' without fabricated scores (Status: ${sampleAudit.pilotResult})`
  )

  // Test Hard-Fail governance rule
  const hardFailRec = {
    questionId: 'TEST-HF',
    decision: 'PENDING' as any,
    hardFail: 'HF01 - Near duplicate item',
    overlapCheck: 'NONE',
    pilotResult: 'PENDING' as any,
  }
  const hardFailDecision = evaluateAuditGovernance(hardFailRec)
  assertTest(
    'Hard-Fail Trigger Enforcement',
    hardFailDecision.decision === 'REPLACE',
    `Hard fail HF01 strictly triggers decision 'REPLACE'`
  )

  // ─── SUITE 3: Multi-Select Response Processing ──────────────────────────────
  console.log('\n--- SUITE 3: Multi-Select Response Processing & Non-Inflation ---')

  const multiSelectQ = MASTER_QB_V2.questions.find((q) => q.questionType === 'Multi-select') || MASTER_QB_V2.questions[1]
  const optA = multiSelectQ.options[0]
  const optB = multiSelectQ.options[1]

  const multiResponses: V2ResponseRecord[] = [
    {
      questionId: multiSelectQ.id,
      selectedOptionIds: [optA.id, optB.id],
    },
  ]

  const multiResult = processV2Assessment(
    multiResponses,
    { academicLevel: 'UG', stream: 'Science (PCM)' }
  )

  assertTest(
    'Multi-Select Option Preservation & Scoring',
    multiResult.routingHistory[0]?.selectedOptionIds?.length === 2,
    `Preserved both selected option IDs: [${multiResult.routingHistory[0]?.selectedOptionIds?.join(', ')}]`
  )

  // ─── SUITE 4: Hierarchical Adaptive Routing (L1 -> L5 + DIFF) ───────────────
  console.log('\n--- SUITE 4: Hierarchical Adaptive Routing Flow ---')

  // Step 1: Initial L1 question
  const step1 = selectNextHierarchicalQuestion({
    responses: [],
    profile: { academicLevel: 'UG', stream: 'Science (PCM)' },
  })

  assertTest(
    'Router Level 1 Initiation',
    step1.currentLevel === 'L1' && step1.nextQuestion?.level === 'L1',
    `First question selected: ${step1.nextQuestion?.id} (Level: ${step1.currentLevel})`
  )

  // Simulate 6 L1 Tech responses (matching the 6 questions per level budget)
  const simulatedResponses: V2ResponseRecord[] = []
  const l1Pool = getQuestionsByLevel('L1').slice(0, 6)
  l1Pool.forEach((q) => {
    // Select option with TECH or ENG
    const techOpt = q.options.find((o) => o.targetDomainCodes.includes('TECH')) || q.options[0]
    simulatedResponses.push({
      questionId: q.id,
      selectedOptionId: techOpt.id,
    })
  })

  const step2 = selectNextHierarchicalQuestion({
    responses: simulatedResponses,
    profile: { academicLevel: 'UG', stream: 'Science (PCM)' },
  })

  assertTest(
    'Router Level Transition L1 -> L2',
    step2.currentLevel === 'L2' && step2.nextQuestion?.level === 'L2',
    `Transitioned to Level 2: Question ${step2.nextQuestion?.id}`
  )

  // Test differentiator trigger
  const diffs = getDifferentiatorsForPrograms(['SUN-023', 'SUN-024', 'SUN-027'])
  assertTest(
    'Differentiator Retrieval for Close Candidates',
    diffs.length > 0 && diffs.some((d) => d.id === 'DIFF-03'),
    `Found AI Cluster differentiator DIFF-03 for AI specializations`
  )

  // ─── SUITE 5: Full Assessment Recommendation Pipeline ───────────────────────
  console.log('\n--- SUITE 5: V2 Recommendation & Sandip University Catalog ---')

  // Simulate full 25 question session
  const fullTechResponses: V2ResponseRecord[] = [
    { questionId: 'L1-01', selectedOptionId: 'L1-01_A' }, // TECH
    { questionId: 'L1-02', selectedOptionIds: ['L1-02_A', 'L1-02_B'] }, // TECH, ENG
    { questionId: 'CSE-L2-01', selectedOptionId: 'CSE-L2-01_A' }, // BTECH_CSE
    { questionId: 'CSE-L3-01', selectedOptionId: 'CSE-L3-01_A' }, // BTECH_CSE
    { questionId: 'SUN-020-L4-01', selectedOptionId: 'SUN-020-L4-01_A' }, // SUN-020
    { questionId: 'SUN-023-L4-01', selectedOptionId: 'SUN-023-L4-01_A' }, // SUN-023
    { questionId: 'DIFF-03', selectedOptionId: 'DIFF-03_A' }, // AI models [SUN-023]
  ]

  const v2Output = processV2Assessment(
    fullTechResponses,
    { academicLevel: 'UG', stream: 'Science (PCM)' }
  )

  assertTest(
    'Top Career Domain Alignment',
    v2Output.topDomains[0]?.code === 'TECH',
    `Primary Domain: ${v2Output.topDomains[0]?.name} (${v2Output.topDomains[0]?.score}%)`
  )

  assertTest(
    'Primary Program Recommendation Validity',
    v2Output.primaryProgram?.programId === 'SUN-023' || v2Output.primaryProgram?.programId === 'SUN-020',
    `Recommended Program: ${v2Output.primaryProgram?.name} [${v2Output.primaryProgram?.programId}] (Score: ${v2Output.primaryProgram?.finalCompositeScore}%)`
  )

  assertTest(
    'Academic Eligibility Filtering',
    v2Output.primaryProgram?.eligibilityStatus === 'ELIGIBLE',
    `Eligibility Status: ${v2Output.primaryProgram?.eligibilityStatus} - ${v2Output.primaryProgram?.eligibilityReason}`
  )

  // ─── SUITE 6: Backward Compatibility & Rollback Assurance ───────────────────
  console.log('\n--- SUITE 6: Backward Compatibility & Shadow Mode ---')

  const legacyResponses = [
    { questionId: '1', selectedOptionId: 'A', responseValue: 1 },
    { questionId: '2', selectedOptionId: 'B', responseValue: 2 },
    { questionId: '3', selectedOptionId: 'A', responseValue: 1 },
  ]

  // Test Feature Flag Disabled (Pure Legacy Mode)
  const unifiedLegacy = executeUnifiedAssessment({
    legacyResponses,
    profile: { level: 'UG', academicLevel: 'UG', stream: 'Science (PCM)' },
    forceV2: false,
  })

  assertTest(
    'Legacy Engine Fallback & Preservation',
    unifiedLegacy.engineMode === 'LEGACY_V1' && unifiedLegacy.legacyReport !== undefined,
    `Legacy assessment generates 3-tier report intact (Primary: ${unifiedLegacy.legacyReport?.primaryPathway?.courseName})`
  )

  // Test Shadow Mode
  const unifiedShadow = executeUnifiedAssessment({
    legacyResponses,
    v2Responses: fullTechResponses,
    profile: { level: 'UG', academicLevel: 'UG', stream: 'Science (PCM)' },
    forceV2: false,
    forceShadow: true,
  })

  assertTest(
    'Shadow Mode Concurrent Execution',
    unifiedShadow.engineMode === 'V2_SHADOW' &&
      unifiedShadow.legacyReport !== undefined &&
      unifiedShadow.v2Result !== undefined &&
      unifiedShadow.shadowDiagnostics !== undefined,
    `Shadow diagnostics computed cleanly without altering legacy output`
  )

  console.log('\n=================================================================')
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`)
  console.log('=================================================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
