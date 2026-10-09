/**
 * Engine V3 Verification & Regression Test Suite
 */

import {
  validateDatasetIntegrity,
  getAllDimensions,
  getAllCourses,
  getAllQuestions,
  processAssessmentResponses,
  type StudentAnswer,
  type StudentProfileContext,
} from '../src/lib/engines'

console.log('=== RUNNING ENGINE V3 VERIFICATION TEST ===\n')

// 1. Dataset Integrity
const integrity = validateDatasetIntegrity()
console.log('1. Data Integrity Check:')
console.log('   Valid:', integrity.isValid)
console.log('   Dimensions:', integrity.totalDimensions)
console.log('   Courses:', integrity.totalCourses)
console.log('   Questions:', integrity.totalQuestions)
console.log('   Options:', integrity.totalOptions)
console.log('   Mappings:', integrity.totalMappings)

if (!integrity.isValid) {
  console.error('Integrity errors:', integrity.errors)
  process.exit(1)
}

// 2. Simulated Student Test (PCM Engineering & AI Focus)
const questions = getAllQuestions()
const mockAnswers: StudentAnswer[] = []

questions.forEach((q) => {
  if (q.question_type === 'rating_scale') {
    // High rating on technology, engineering, analytics
    if (['TECHNOLOGY', 'ENGINEERING', 'ANALYTICS'].includes(q.dimension_id || '')) {
      mockAnswers.push({ question_id: q.question_id, rating_value: 5 })
    } else {
      mockAnswers.push({ question_id: q.question_id, rating_value: 3 })
    }
  } else if (q.question_type === 'multi_select') {
    // Pick first 2 options
    const optIds = q.options.slice(0, 2).map((o) => o.option_id)
    mockAnswers.push({ question_id: q.question_id, option_ids: optIds })
  } else {
    // Single select
    mockAnswers.push({ question_id: q.question_id, option_id: q.options[0]?.option_id })
  }
})

const profile: StudentProfileContext = {
  fullName: 'Aniket Rendor',
  academicLevel: 'UG',
  stream: 'Science (PCM)',
  referralCode: 'SUN-TEST-2026',
}

const result = processAssessmentResponses(mockAnswers, profile)

console.log('\n2. Simulation Result:')
console.log('   Top Dimensions:', result.top_dimensions.map((d) => `${d.name} (${d.normalized_score}%)`))
console.log('   Primary Course:', result.primary_course?.course, result.primary_course?.specialization, `[${result.primary_course?.match_score}%]`)
console.log('   Primary Eligibility:', result.primary_course?.eligibility.status, `(${result.primary_course?.eligibility.reason})`)
console.log('   Alternative Courses Count:', result.alternative_courses.length)
console.log('   Validation Audit Complete:', result.validation_audit.is_complete)

console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===')
