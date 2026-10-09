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

// 2. Simulated UG Student Test (PCM Engineering & AI Focus)
const questions = getAllQuestions()
const mockAnswers: StudentAnswer[] = []

questions.forEach((q) => {
  if (q.question_type === 'rating_scale') {
    if (['TECHNOLOGY', 'ENGINEERING', 'ANALYTICS'].includes(q.dimension_id || '')) {
      mockAnswers.push({ question_id: q.question_id, rating_value: 5 })
    } else {
      mockAnswers.push({ question_id: q.question_id, rating_value: 3 })
    }
  } else if (q.question_type === 'multi_select') {
    const optIds = q.options.slice(0, 2).map((o) => o.option_id)
    mockAnswers.push({ question_id: q.question_id, option_ids: optIds })
  } else {
    mockAnswers.push({ question_id: q.question_id, option_id: q.options[0]?.option_id })
  }
})

const ugProfile: StudentProfileContext = {
  fullName: 'Aniket Rendor (UG)',
  academicLevel: 'UG',
  stream: 'Science (PCM)',
  referralCode: 'SUN-TEST-UG',
}

const ugResult = processAssessmentResponses(mockAnswers, ugProfile)

console.log('\n2. UG Simulation Result:')
console.log('   Top Dimensions:', ugResult.top_dimensions.map((d) => `${d.name} (${d.normalized_score}%)`))
console.log('   Primary Course:', ugResult.primary_course?.course, ugResult.primary_course?.specialization, `[${ugResult.primary_course?.match_score}%]`)
console.log('   Primary Eligibility:', ugResult.primary_course?.eligibility.status, `(${ugResult.primary_course?.eligibility.reason})`)
console.log('   Alternative Courses Count:', ugResult.alternative_courses.length)

// 3. Simulated PG Student Test (Business & Management Focus)
const pgAnswers: StudentAnswer[] = []

questions.forEach((q) => {
  if (q.question_type === 'rating_scale') {
    if (['BUSINESS', 'ANALYTICS', 'COMMUNICATION'].includes(q.dimension_id || '')) {
      pgAnswers.push({ question_id: q.question_id, rating_value: 5 })
    } else {
      pgAnswers.push({ question_id: q.question_id, rating_value: 3 })
    }
  } else if (q.question_type === 'multi_select') {
    const optIds = q.options.slice(0, 2).map((o) => o.option_id)
    pgAnswers.push({ question_id: q.question_id, option_ids: optIds })
  } else {
    pgAnswers.push({ question_id: q.question_id, option_id: q.options[0]?.option_id })
  }
})

const pgProfile: StudentProfileContext = {
  fullName: 'Harish Chavan (PG)',
  academicLevel: 'PG',
  stream: 'BBA / Commerce Graduate',
  previousDegree: 'Bachelor of Business Administration',
  referralCode: 'SUN-TEST-PG',
}

const pgResult = processAssessmentResponses(pgAnswers, pgProfile)

console.log('\n3. PG Simulation Result:')
console.log('   Top Dimensions:', pgResult.top_dimensions.map((d) => `${d.name} (${d.normalized_score}%)`))
console.log('   Primary Course:', pgResult.primary_course?.course, pgResult.primary_course?.specialization, `[${pgResult.primary_course?.match_score}%]`)
console.log('   Primary Eligibility:', pgResult.primary_course?.eligibility.status, `(${pgResult.primary_course?.eligibility.reason})`)
console.log('   Alternative Courses Count:', pgResult.alternative_courses.length)
console.log('   Validation Audit Complete:', pgResult.validation_audit.is_complete)

console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===')
