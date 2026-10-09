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

// 1. Dataset & Mapping Integrity
const integrity = validateDatasetIntegrity()
console.log('1. Data & Section 14 Mapping Integrity Check:')
console.log('   Valid:', integrity.isValid)
console.log('   Dimensions:', integrity.totalDimensions)
console.log('   Courses:', integrity.totalCourses)
console.log('   Questions:', integrity.totalQuestions)
console.log('   Options:', integrity.totalOptions)
console.log('   Program-Domain Mappings:', integrity.mappingAudit.total_program_domain_mappings)
console.log('   Programs Mapped to Domains:', `${integrity.mappingAudit.programs_mapped_to_domains} / ${integrity.mappingAudit.total_distinct_programs}`)
console.log('   Distinct Specializations:', integrity.mappingAudit.total_distinct_specializations)
console.log('   Program-Specialization Relations:', integrity.mappingAudit.total_program_specialization_relationships)
console.log('   Duplicate or Invalid Mappings:', integrity.mappingAudit.duplicate_or_invalid_mappings)
console.log('   Programs with Core/General Curriculum:', integrity.mappingAudit.programs_with_no_specialization_listed)

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
  fullName: 'Harish Chavan (PG Business)',
  academicLevel: 'PG',
  stream: 'BBA / Commerce Graduate',
  previousDegree: 'Bachelor of Business Administration',
  referralCode: 'SUN-TEST-PG',
}

const pgResult = processAssessmentResponses(pgAnswers, pgProfile)

console.log('\n3. PG Business Simulation Result:')
console.log('   Top Dimensions:', pgResult.top_dimensions.map((d) => `${d.name} (${d.normalized_score}%)`))
console.log('   Primary Course:', pgResult.primary_course?.course, pgResult.primary_course?.specialization, `[${pgResult.primary_course?.match_score}%]`)
console.log('   Primary Eligibility:', pgResult.primary_course?.eligibility.status, `(${pgResult.primary_course?.eligibility.reason})`)
console.log('   Alternative Courses Count:', pgResult.alternative_courses.length)

// 4. Simulated PG Student Test (Technology & Engineering Focus)
const pgTechAnswers: StudentAnswer[] = []

questions.forEach((q) => {
  if (q.question_type === 'rating_scale') {
    if (['TECHNOLOGY', 'ENGINEERING'].includes(q.dimension_id || '')) {
      pgTechAnswers.push({ question_id: q.question_id, rating_value: 5 })
    } else {
      pgTechAnswers.push({ question_id: q.question_id, rating_value: 2 })
    }
  } else if (q.question_type === 'multi_select') {
    const optIds = q.options.slice(0, 2).map((o) => o.option_id)
    pgTechAnswers.push({ question_id: q.question_id, option_ids: optIds })
  } else {
    pgTechAnswers.push({ question_id: q.question_id, option_id: q.options[0]?.option_id })
  }
})

const pgTechProfile: StudentProfileContext = {
  fullName: 'Harish Chavan (PG Tech)',
  academicLevel: 'PG',
  stream: 'B.Tech CSE Graduate',
  referralCode: 'SUN-TEST-PG-TECH',
}

const pgTechResult = processAssessmentResponses(pgTechAnswers, pgTechProfile)

console.log('\n4. PG Tech Simulation Result:')
console.log('   Top Dimensions:', pgTechResult.top_dimensions.map((d) => `${d.name} (${d.normalized_score}%)`))
console.log('   Primary Course:', pgTechResult.primary_course?.course, pgTechResult.primary_course?.specialization, `[${pgTechResult.primary_course?.match_score}%]`)
console.log('   Primary Eligibility:', pgTechResult.primary_course?.eligibility.status, `(${pgTechResult.primary_course?.eligibility.reason})`)
console.log('   Alternative Courses:', pgTechResult.alternative_courses.map(c => `${c.course} ${c.specialization} [${c.match_score}%]`))

console.log('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===')
