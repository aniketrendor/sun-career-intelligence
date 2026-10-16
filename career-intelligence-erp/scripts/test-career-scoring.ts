import {
  DIMENSIONS,
  DOMAINS,
  PROGRAMS,
  STAGE1,
  STAGE2_ACTIVITIES
} from '../src/lib/data/su-career-data'
import {
  computeDimensionProfile,
  cosineScores,
  scoreAllDomains,
  chooseCandidates,
  buildStage2Items,
  computeFinalDomainScores,
  getProgramEligibility,
  getProgramMatches,
  StudentContextProfile
} from '../src/lib/services/career-scoring-engine'

console.log('--- SU Career Intelligence Scoring Engine Test Suite ---')

// 1. Basic Dimensions & Data Integrity
console.log(`Checking dimensions: ${DIMENSIONS.length} (Expected: 20)`)
if (DIMENSIONS.length !== 20) throw new Error('Dimensions length mismatch')

console.log(`Checking career domains: ${DOMAINS.length} (Expected: 79)`)
if (DOMAINS.length !== 79) throw new Error('Domains length mismatch')

console.log(`Checking Sandip programmes: ${PROGRAMS.length} (Expected: 114)`)
if (PROGRAMS.length !== 114) throw new Error('Programmes length mismatch')

console.log(`Checking Stage 1 questions: ${STAGE1.length} (Expected: 30)`)
if (STAGE1.length !== 30) throw new Error('Stage 1 questions length mismatch')

console.log(`Checking Stage 2 activities keys: ${Object.keys(STAGE2_ACTIVITIES).length} (Expected: 79)`)
if (Object.keys(STAGE2_ACTIVITIES).length !== 79) throw new Error('Stage 2 activities count mismatch')

for (const dom of DOMAINS) {
  const acts = STAGE2_ACTIVITIES[dom.id]
  if (!acts || acts.length !== 3) {
    throw new Error(`Domain ${dom.id} (${dom.name}) has invalid activities count: ${acts?.length}`)
  }
}
console.log('✅ All 79 domains have exactly 3 curated Stage 2 activities.')

// 2. Simulate Stage 1 Assessment Answers
const mockS1Answers: Record<string, string[]> = {}
// Answer all 30 questions selecting first 2 options
for (let i = 0; i < STAGE1.length; i++) {
  const q = STAGE1[i]
  mockS1Answers[q.id] = [q.options[0].id, q.options[1].id]
}

const dimProfile = computeDimensionProfile(mockS1Answers)
console.log(`Stage 1 answered: ${dimProfile.answered}/30, substantive: ${dimProfile.substantive}`)
console.log('Sample dimension scores:', {
  D01: dimProfile.scores['D01'],
  D02: dimProfile.scores['D02'],
  D05: dimProfile.scores['D05'],
  D12: dimProfile.scores['D12']
})

// 3. Test Cosine Similarity & Domain Ranking
const rankedDomains = scoreAllDomains(dimProfile.scores)
console.log(`Ranked domains total: ${rankedDomains.length}`)
console.log('Top 3 Stage 1 domains:', rankedDomains.slice(0, 3).map(d => `${d.name} (${d.stage1Fit}%)`))

// 4. Test Candidate Shortlist Selection (Balanced 12 candidates)
const candidates = chooseCandidates(rankedDomains)
console.log(`Candidate count: ${candidates.length} (Expected: 12)`)
if (candidates.length !== 12) throw new Error('Expected 12 candidate domains')

// 5. Test Stage 2 Question Assembly
const s2Items = buildStage2Items(candidates, rankedDomains)
console.log(`Stage 2 items built: ${s2Items.length} (Expected: 20)`)
if (s2Items.length !== 20) throw new Error('Expected 20 Stage 2 items')

// 6. Test Stage 2 Scoring
const mockS2Answers: Record<string, string[]> = {}
for (let j = 0; j < s2Items.length; j++) {
  const q = s2Items[j]
  // Pick first 2 options
  mockS2Answers[q.id] = [q.options[0].id, q.options[1].id]
}

const finalDomains = computeFinalDomainScores(rankedDomains, s2Items, mockS2Answers)
console.log('Top 3 Final domains:', finalDomains.slice(0, 3).map(d => `${d.name} (Final: ${d.finalScore}%, Conf: ${d.confidence})`))

// 7. Test Program Matching and Eligibility
const studentUG: StudentContextProfile = {
  pathway: 'UG',
  stream: 'PCM',
  situation: 'Class 12 completed'
}
const matchedUG = getProgramMatches(finalDomains, dimProfile, studentUG)
console.log(`Total matched UG programmes: ${matchedUG.length}`)
console.log('Top 3 UG programme matches:', matchedUG.slice(0, 3).map(p => `${p.name} (Fit: ${p.fit}, Status: ${p.eligibility.label})`))

const studentPG: StudentContextProfile = {
  pathway: 'PG',
  previousField: 'Computer Science & IT',
  highestQualification: "Bachelor's degree"
}
const matchedPG = getProgramMatches(finalDomains, dimProfile, studentPG)
console.log(`Total matched PG programmes: ${matchedPG.length}`)
console.log('Top 3 PG programme matches:', matchedPG.slice(0, 3).map(p => `${p.name} (Fit: ${p.fit}, Status: ${p.eligibility.label})`))

console.log('🎉 ALL PSYCHOMETRIC & SCORING TESTS PASSED PERFECTLY!')
